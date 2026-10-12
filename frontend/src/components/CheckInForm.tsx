import { useEffect, useState, type FormEvent } from 'react';
import {
  fetchCheckIns,
  createCheckIn,
  updateCheckIn,
  getLocalToday,
} from '../api/checkIns';
import { ApiError } from '../api/client';
import type { CheckInResponse } from '../api/types';

export function CheckInForm({ goalId }: { goalId: number }) {
  const today = getLocalToday();

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [existingCheckIn, setExistingCheckIn] = useState<CheckInResponse | null>(null);
  const [done, setDone] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Fetch check-in for the selected date to enforce 1-per-day (Create vs. Edit)
  useEffect(() => {
    let ignore = false;

    async function loadForDate() {
      try {
        const list = await fetchCheckIns(goalId, selectedDate, selectedDate);
        if (ignore) return;

        const match = list.find((c) => c.checkDate === selectedDate) ?? null;
        setExistingCheckIn(match);

        if (match) {
          setDone(match.done);
          setNote(match.note ?? '');
        } else {
          setDone(true);
          setNote('');
        }
      } catch (err: unknown) {
        if (!ignore) {
          setErrorMessage(
            err instanceof ApiError ? err.message : 'Failed to load check-in status.'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadForDate();

    return () => {
      ignore = true;
    };
  }, [goalId, selectedDate]);

  const clearFeedback = () => {
    setErrorMessage(null);
    setFieldErrors({});
    setSavedSuccess(false);
  };

  const handleDateChange = (newDate: string) => {
    clearFeedback();
    setIsLoading(true);
    setSelectedDate(newDate);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setIsSaving(true);

    const trimmedNote = note.trim() ? note.trim() : null;

    try {
      if (existingCheckIn) {
        // Edit existing check-in (PUT)
        const updated = await updateCheckIn(goalId, existingCheckIn.id, {
          done,
          note: trimmedNote,
        });
        setExistingCheckIn(updated);
        setDone(updated.done);
        setNote(updated.note ?? '');
      } else {
        // Create new check-in (POST)
        const created = await createCheckIn(goalId, {
          checkDate: selectedDate,
          done,
          note: trimmedNote,
        });
        setExistingCheckIn(created);
        setDone(created.done);
        setNote(created.note ?? '');
      }
      setSavedSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        // Map 400 validation fieldErrors if present
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        }

        // Map 409 Conflict or general 400 message
        if (err.status === 409) {
          setErrorMessage(
            err.message || 'A check-in already exists for this date. Loaded existing record for editing.'
          );
          // Recover state: fetch the conflicting record so user can immediately edit it
          try {
            const list = await fetchCheckIns(goalId, selectedDate, selectedDate);
            const match = list.find((c) => c.checkDate === selectedDate) ?? null;
            if (match) {
              setExistingCheckIn(match);
              setDone(match.done);
              setNote(match.note ?? '');
            }
          } catch {
            // Keep original 409 message if recovery fetch fails
          }
        } else {
          setErrorMessage(err.message || 'Validation failed. Please check your input.');
        }
      } else {
        setErrorMessage('Network error while saving check-in.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isEditMode = existingCheckIn !== null;
  const isUnchanged =
    isEditMode &&
    existingCheckIn.done === done &&
    (existingCheckIn.note ?? '') === note.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 border-t border-slate-800 pt-3 text-xs"
      noValidate
    >
      {/* Header Row: Mode Badge & Date Picker */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider text-slate-400">
            Daily Audit
          </span>
          {!isLoading && (
            <span
              className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                isEditMode
                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              {isEditMode ? 'LOGGED • EDIT' : 'UNLOGGED'}
            </span>
          )}
        </div>

        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => handleDateChange(e.target.value)}
          disabled={isLoading || isSaving}
          className={`rounded border bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none ${
            fieldErrors.checkDate
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-slate-700 focus:border-indigo-500'
          }`}
        />
      </div>

      {/* Field Error: checkDate */}
      {fieldErrors.checkDate && (
        <p className="mb-2 text-[11px] text-rose-400">{fieldErrors.checkDate}</p>
      )}

      {isLoading ? (
        <div className="py-2 text-slate-500">Checking log...</div>
      ) : (
        <div className="space-y-2.5">
          {/* Binary Yes / No Audit Toggle */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDone(true);
                  clearFeedback();
                }}
                disabled={isSaving}
                className={`rounded border py-1.5 font-semibold transition ${
                  done
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                YES (Done)
              </button>

              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  clearFeedback();
                }}
                disabled={isSaving}
                className={`rounded border py-1.5 font-semibold transition ${
                  !done
                    ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                    : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                NO (Missed)
              </button>
            </div>
            {fieldErrors.done && (
              <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.done}</p>
            )}
          </div>

          {/* Note Input + Character Counter + Field Error */}
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                clearFeedback();
              }}
              disabled={isSaving}
              placeholder="Execution note (optional, max 500 chars)..."
              className={`w-full rounded border bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                fieldErrors.note
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            <div className="mt-1 flex items-center justify-between">
              {fieldErrors.note ? (
                <span className="text-[11px] text-rose-400">{fieldErrors.note}</span>
              ) : (
                <span />
              )}
              <span
                className={`text-[10px] ${
                  note.length > 500 ? 'font-semibold text-rose-400' : 'text-slate-500'
                }`}
              >
                {note.length}/500
              </span>
            </div>
          </div>

          {/* Top-level 400 / 409 Error Banner */}
          {errorMessage && (
            <div className="rounded border border-rose-500/20 bg-rose-500/10 p-2 text-[11px] text-rose-400">
              {errorMessage}
            </div>
          )}

          {/* Success Banner */}
          {savedSuccess && (
            <p className="text-[11px] text-emerald-400">
              {isEditMode ? 'Audit saved.' : 'Audit recorded.'}
            </p>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSaving || isUnchanged}
            className="w-full rounded bg-indigo-600 px-3 py-1.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving
              ? 'Saving...'
              : isEditMode
              ? isUnchanged
                ? 'Up to Date'
                : 'Save Changes'
              : 'Log Audit'}
          </button>
        </div>
      )}
    </form>
  );
}