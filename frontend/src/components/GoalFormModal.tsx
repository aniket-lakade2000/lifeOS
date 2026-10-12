import { useState, type FormEvent } from 'react';
import { createGoal, updateGoal } from '../api/goals';
import { ApiError } from '../api/client';
import type { Area, GoalResponse, GoalStatus } from '../api/types';

const AREAS: Area[] = [
  'CAREER',
  'HEALTH',
  'RELATIONSHIP',
  'FINANCE',
  'PERSONAL_DEVELOPMENT',
  'SPIRITUALITY',
  'FUN_RECREATION',
  'PHYSICAL_ENVIRONMENT',
  'COMMUNITY_INVOLVEMENT',
];

const STATUSES: GoalStatus[] = ['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];

interface GoalFormModalProps {
  initialGoal?: GoalResponse | null;
  onClose: () => void;
  onSaved: (savedGoal: GoalResponse) => void;
}

export function GoalFormModal({
  initialGoal,
  onClose,
  onSaved,
}: GoalFormModalProps) {
  const isEdit = Boolean(initialGoal);

  const [title, setTitle] = useState(initialGoal?.title ?? '');
  const [description, setDescription] = useState(initialGoal?.description ?? '');
  const [area, setArea] = useState<Area>(initialGoal?.area ?? 'CAREER');
  const [priority, setPriority] = useState<number>(initialGoal?.priority ?? 1);
  const [status, setStatus] = useState<GoalStatus>(
    initialGoal?.status ?? 'ACTIVE'
  );
  const [nextAction, setNextAction] = useState(initialGoal?.nextAction ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = () => {
    setErrorMessage(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsSubmitting(true);

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim() ? description.trim() : null;
    const trimmedNext = nextAction.trim() ? nextAction.trim() : null;

    try {
      let saved: GoalResponse;
      if (isEdit && initialGoal) {
        // Strictly sends UpdateGoalRequest fields accepted by current backend
        saved = await updateGoal(initialGoal.id, {
          title: trimmedTitle,
          description: trimmedDesc,
          priority,
          nextAction: trimmedNext,
        });
      } else {
        saved = await createGoal({
          title: trimmedTitle,
          description: trimmedDesc,
          area,
          priority,
          nextAction: trimmedNext,
        });
      }
      onSaved(saved);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        }
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Network error while saving goal.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? 'Edit Goal' : 'New Goal'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>

        {/* Surfaces 409 Max-Active Conflict or 400 general error */}
        {errorMessage && (
          <div className="mb-4 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          {/* Title */}
          <div>
            <label className="mb-1 block font-semibold uppercase tracking-wider text-slate-300">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearErrors();
              }}
              disabled={isSubmitting}
              placeholder="e.g. Solve 200 DSA problems"
              className={`w-full rounded border bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${
                fieldErrors.title
                  ? 'border-rose-500'
                  : 'border-slate-700 focus:border-indigo-500'
              }`}
            />
            {fieldErrors.title && (
              <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.title}</p>
            )}
          </div>

          {/* Area, Priority, Status */}
          <div className={`grid gap-3 ${isEdit ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div>
              <label className="mb-1 block font-semibold uppercase tracking-wider text-slate-300">
                Area
              </label>
              <select
                value={area}
                onChange={(e) => {
                  setArea(e.target.value as Area);
                  clearErrors();
                }}
                disabled={isSubmitting || isEdit}
                className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {fieldErrors.area && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.area}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-semibold uppercase tracking-wider text-slate-300">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(Number(e.target.value));
                  clearErrors();
                }}
                disabled={isSubmitting}
                className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={1}>P1 (Highest)</option>
                <option value={2}>P2 (Medium)</option>
                <option value={3}>P3 (Normal)</option>
              </select>
              {fieldErrors.priority && (
                <p className="mt-1 text-[11px] text-rose-400">
                  {fieldErrors.priority}
                </p>
              )}
            </div>

            {isEdit && (
              <div>
                <label className="mb-1 block font-semibold uppercase tracking-wider text-slate-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as GoalStatus)}
                  disabled={isSubmitting}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Next Executable Action */}
          <div>
            <label className="mb-1 block font-semibold uppercase tracking-wider text-slate-300">
              Next Action
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => {
                setNextAction(e.target.value);
                clearErrors();
              }}
              disabled={isSubmitting}
              placeholder="Smallest executable next step..."
              className={`w-full rounded border bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${
                fieldErrors.nextAction
                  ? 'border-rose-500'
                  : 'border-slate-700 focus:border-indigo-500'
              }`}
            />
            {fieldErrors.nextAction && (
              <p className="mt-1 text-[11px] text-rose-400">
                {fieldErrors.nextAction}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block font-semibold uppercase tracking-wider text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearErrors();
              }}
              disabled={isSubmitting}
              placeholder="Context and completion criteria..."
              className={`w-full rounded border bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${
                fieldErrors.description
                  ? 'border-rose-500'
                  : 'border-slate-700 focus:border-indigo-500'
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-[11px] text-rose-400">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded border border-slate-700 bg-slate-800 px-4 py-2 font-medium text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : isEdit
                ? 'Save Changes'
                : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}