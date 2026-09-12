import { getTranslations } from 'next-intl/server';

import { getWeather, type Condition } from '@/lib/weather';

/**
 * The sky over Zurich, in the same shape as the date tile beside it: a big
 * number, a line of words under it, one quiet line of detail.
 *
 * A server component that waits for the provider, so it must always sit inside
 * a `<Suspense>` with `WeatherPending` as the fallback. The page then streams
 * without it and the tile arrives when the answer does. Why a third party is
 * allowed near a page render at all — and how it is fenced — is in
 * `lib/weather.ts`.
 */
export async function WeatherTile({ className = '' }: { className?: string }) {
  const [t, weather] = await Promise.all([getTranslations('weather'), getWeather()]);
  const label = `${t('label')} · ${t('place')}`;

  if (!weather) {
    return (
      <Frame label={label} className={className}>
        <p className="text-base font-medium text-ink-muted">{t('unavailable')}</p>
      </Frame>
    );
  }

  const deg = (n: number) => `${Math.round(n)}°`;
  const night = !weather.isDay;
  // Only a clear sky reads differently at night. A cloud is a cloud.
  const key = weather.condition === 'clear' && night ? 'clearNight' : weather.condition;

  return (
    <Frame label={label} className={className}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold leading-tight tabular-nums text-ink">
            {deg(weather.temp)}
          </p>
          <p className="mt-1 text-base font-medium text-ink-muted">{t(`conditions.${key}`)}</p>
        </div>
        <WeatherIcon condition={weather.condition} night={night} />
      </div>
      <p className="text-sm tabular-nums text-ink-muted">
        {t('feels', { temp: Math.round(weather.feels) })} &middot; {deg(weather.min)}&thinsp;…&thinsp;
        {deg(weather.max)} &middot; {t('rain', { chance: Math.round(weather.rain) })}
      </p>
    </Frame>
  );
}

/**
 * What holds the tile's place while the answer is on its way — the same frame
 * and roughly the same height, so nothing below it moves when the real one
 * lands.
 */
export function WeatherPending({ label, className = '' }: { label: string; className?: string }) {
  return (
    <Frame label={label} className={className}>
      <span className="inline-block h-9 w-20 animate-pulse rounded-sm bg-sunk" />
      <span className="inline-block h-4 w-44 animate-pulse rounded-sm bg-sunk" />
    </Frame>
  );
}

function Frame({
  label,
  className,
  children
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`block-card animate-rise-in flex flex-col gap-4 p-6 [animation-delay:150ms] ${className}`}
    >
      <p className="ps-label">{label}</p>
      {children}
    </section>
  );
}

/**
 * One stroke icon per condition, drawn like every other icon on the site.
 *
 * Paths from Feather (MIT), except fog, which Feather does not have. Fewer
 * pictures than conditions on purpose: "partly cloudy" and "overcast" are the
 * same cloud to anyone glancing at a phone, and the words under the number say
 * which it is.
 */
function WeatherIcon({ condition, night }: { condition: Condition; night: boolean }) {
  const rainCloud = 'M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25';

  const shape = (() => {
    switch (condition) {
      case 'clear':
        return night ? (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </>
        );
      case 'fog':
        return <path d="M3 9h18M5 13h14M7 17h10" />;
      case 'drizzle':
        return (
          <>
            <path d={rainCloud} />
            <path d="M8 13v2M8 19v2M12 15v2M12 21v2M16 13v2M16 19v2" />
          </>
        );
      case 'rain':
      case 'showers':
        return (
          <>
            <path d={rainCloud} />
            <path d="M8 13v8M12 15v8M16 13v8" />
          </>
        );
      case 'snow':
        return (
          <>
            <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
            <path d="M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01" />
          </>
        );
      case 'thunder':
        return (
          <>
            <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
            <path d="M13 11l-4 6h6l-4 6" />
          </>
        );
      default:
        return <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />;
    }
  })();

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-10 w-10 shrink-0 text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shape}
    </svg>
  );
}
