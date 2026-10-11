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
  const [error, setError] = useState<string | null>(null);
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
          setError(
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

  const handleDateChange = (newDate: string) => {
    setError(null);
    setSavedSuccess(false);

    if (newDate > today) {
      setError('Cannot log check-ins for future dates.');
      return;
    }

    setIsLoading(true);
    setSelectedDate(newDate);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    if (selectedDate > today) {
      setError('Future dates are not allowed.');
      return;
    }

    setIsSaving(true);
    const trimmedNote = note.trim() ? note.trim() : null;

    try {
      if (existingCheckIn) {
        // 1-per-day rule: Update existing record
        const updated = await updateCheckIn(goalId, existingCheckIn.id, {
          done,
          note: trimmedNote,
        });
        setExistingCheckIn(updated);
      } else {
        // Create new record
        const created = await createCheckIn(goalId, {
          checkDate: selectedDate,
          done,
          note: trimmedNote,
        });
        setExistingCheckIn(created);
      }
      setSavedSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to save check-in.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isEditMode = existingCheckIn !== null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 border-t border-slate-800 pt-3 text-xs"
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
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="py-2 text-slate-500">Checking log...</div>
      ) : (
        <div className="space-y-2.5">
          {/* Binary Yes / No Audit Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setDone(true);
                setSavedSuccess(false);
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
                setSavedSuccess(false);
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

          {/* Note Input (Max 500 chars per DTO) */}
          <input
            type="text"
            maxLength={500}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSavedSuccess(false);
            }}
            disabled={isSaving}
            placeholder="Execution note (optional, max 500 chars)..."
            className="w-full rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />

          {/* Error / Success Feedback */}
          {error && <p className="text-rose-400">{error}</p>}
          {savedSuccess && (
            <p className="text-emerald-400">
              {isEditMode ? 'Audit updated.' : 'Audit recorded.'}
            </p>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded bg-indigo-600 px-3 py-1.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {isSaving
              ? 'Saving...'
              : isEditMode
              ? 'Update Audit'
              : 'Log Audit'}
          </button>
        </div>
      )}
    </form>
  );
}