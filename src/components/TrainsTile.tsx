import { getTrains } from '@/lib/trains';

import { TrainsBoard } from './TrainsBoard';

/**
 * The train tile's server half: asks SBB, then hands the answer to the board.
 *
 * Always inside a `<Suspense>` with `TrainsPending` as the fallback — SBB is a
 * third party and the page does not wait for it. `lib/trains.ts` has the rest.
 */
export async function TrainsTile({ me, className = '' }: { me: string; className?: string }) {
  const rows = await getTrains();
  return <TrainsBoard rows={rows} me={me} serverNow={Date.now()} className={className} />;
}

/** The same frame while SBB is being asked, so nothing moves when it answers. */
export function TrainsPending({ label, className = '' }: { label: string; className?: string }) {
  return (
    <section
      className={`block-card animate-rise-in flex flex-col gap-4 p-6 [animation-delay:300ms] ${className}`}
    >
      <p className="ps-label normal-case">{label}</p>
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex items-center gap-3">
          <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-sunk" />
          <span className="h-4 flex-1 animate-pulse rounded-sm bg-sunk" />
        </span>
      ))}
    </section>
  );
}
