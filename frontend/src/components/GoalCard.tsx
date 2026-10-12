import type { GoalResponse, GoalStatus } from '../api/types';
import { CheckInForm } from './CheckInForm';

const STATUS_STYLES: Record<GoalStatus, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  ARCHIVED: 'bg-slate-800 text-slate-400 border-slate-700',
};

function formatArea(area: string): string {
  return area.replace(/_/g, ' ');
}

interface GoalCardProps {
  goal: GoalResponse;
  onEdit: (goal: GoalResponse) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm transition hover:border-slate-700">
      <div>
        {/* Top Meta Row: Area, Priority, Status, Edit */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {formatArea(goal.area)}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
              P{goal.priority}
            </span>
            <span
              className={`rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[goal.status]}`}
            >
              {goal.status}
            </span>
            <button
              type="button"
              onClick={() => onEdit(goal)}
              className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="mt-2.5 text-base font-semibold text-white">{goal.title}</h3>
        {goal.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-400">{goal.description}</p>
        )}

        {/* Next Executable Action */}
        {goal.nextAction && (
          <div className="mt-4 rounded border border-indigo-500/20 bg-indigo-500/10 p-2.5 text-xs text-indigo-300">
            <span className="font-semibold uppercase tracking-wider text-indigo-400">
              Next Action:{' '}
            </span>
            {goal.nextAction}
          </div>
        )}
      </div>

      {/* Daily Check-In Audit (Strictly for ACTIVE goals) */}
      {goal.status === 'ACTIVE' && <CheckInForm goalId={goal.id} />}
    </div>
  );
}