import { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext';
import { fetchGoals } from '../api/goals';
import { ApiError } from '../api/client';
import type { GoalResponse } from '../api/types';
import { GoalCard } from './GoalCard';
import { GoalFormModal } from './GoalFormModal';

export function Dashboard() {
  const { logout } = useAuth();
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<GoalResponse | null>(null);

  useEffect(() => {
    let ignore = false;

    async function initGoals() {
      try {
        const data = await fetchGoals();
        if (!ignore) {
          const sorted = [...data].sort((a, b) => a.priority - b.priority);
          setGoals(sorted);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Failed to fetch goals. Check your backend connection.'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    initGoals();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGoals();
      const sorted = [...data].sort((a, b) => a.priority - b.priority);
      setGoals(sorted);
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to fetch goals. Check your backend connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: GoalResponse) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleGoalSaved = (savedGoal: GoalResponse) => {
    setGoals((prev) => {
      const exists = prev.some((g) => g.id === savedGoal.id);
      const next = exists
        ? prev.map((g) => (g.id === savedGoal.id ? savedGoal : g))
        : [...prev, savedGoal];
      return [...next].sort((a, b) => a.priority - b.priority);
    });
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const activeGoals = goals.filter((g) => g.status === 'ACTIVE');
  const otherGoals = goals.filter((g) => g.status !== 'ACTIVE');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-white">LifeOS</span>
            <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400">
              v0.2
            </span>
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 p-6">
        {isLoading && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center text-sm text-slate-400">
            Loading goals...
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
            <span>{error}</span>
            <button
              onClick={handleRetry}
              className="rounded bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Active Goals
                </h2>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                >
                  + New Goal
                </button>
              </div>

              {activeGoals.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
                  No active goals.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleOpenEdit}
                    />
                  ))}
                </div>
              )}
            </section>

            {otherGoals.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Inactive Goals ({otherGoals.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {otherGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleOpenEdit}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {isModalOpen && (
        <GoalFormModal
          initialGoal={editingGoal}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGoal(null);
          }}
          onSaved={handleGoalSaved}
        />
      )}
    </div>
  );
}