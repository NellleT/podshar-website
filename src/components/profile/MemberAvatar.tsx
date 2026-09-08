/**
 * A member's face, such as it is.
 *
 * Eight built-in marks rather than uploads. Uploading one photo drags in the
 * whole media pipeline — object storage, `MediaAsset`, an upload route, size
 * limits, a proxy — for a picture rendered at 44 pixels. The presets cost
 * nothing, work offline, and can be replaced by real uploads later without
 * touching any call site: the component keeps its shape, `avatarPreset` simply
 * loses to `avatarId` once that exists.
 *
 * Drawn from the same palette as everything else, so a chosen mark never looks
 * like it wandered in from another site. Each is a flat geometric figure — no
 * gradients, no shadows — and every one reads at 28px as well as at 96.
 */

export const AVATAR_PRESETS = [
  'dot',
  'ring',
  'half',
  'quarters',
  'bars',
  'cross',
  'wedge',
  'grid'
] as const;

export type AvatarPreset = (typeof AVATAR_PRESETS)[number];

export const isAvatarPreset = (v: unknown): v is AvatarPreset =>
  typeof v === 'string' && (AVATAR_PRESETS as readonly string[]).includes(v);

/**
 * The figure for one preset, in a 100x100 viewBox.
 *
 * `currentColor` throughout: the wrapper picks the ink, so a mark on the accent
 * background and the same mark on a sunk one both stay legible.
 */
function Mark({ preset }: { preset: AvatarPreset }) {
  switch (preset) {
    case 'dot':
      return <circle cx="50" cy="50" r="24" fill="currentColor" />;
    case 'ring':
      return <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="12" />;
    case 'half':
      return <path d="M50 22a28 28 0 0 1 0 56z" fill="currentColor" />;
    case 'quarters':
      return (
        <>
          <rect x="20" y="20" width="28" height="28" fill="currentColor" />
          <rect x="52" y="52" width="28" height="28" fill="currentColor" />
        </>
      );
    case 'bars':
      return (
        <>
          <rect x="22" y="30" width="56" height="10" rx="5" fill="currentColor" />
          <rect x="22" y="60" width="56" height="10" rx="5" fill="currentColor" />
        </>
      );
    case 'cross':
      return (
        <>
          <rect x="45" y="20" width="10" height="60" rx="5" fill="currentColor" />
          <rect x="20" y="45" width="60" height="10" rx="5" fill="currentColor" />
        </>
      );
    case 'wedge':
      return <path d="M50 22 78 74H22z" fill="currentColor" />;
    case 'grid':
      return (
        <>
          <rect x="24" y="24" width="22" height="22" fill="currentColor" />
          <rect x="54" y="24" width="22" height="22" fill="currentColor" />
          <rect x="24" y="54" width="22" height="22" fill="currentColor" />
          <rect x="54" y="54" width="22" height="22" fill="currentColor" />
        </>
      );
  }
}

/**
 * Every second preset is drawn on the accent colour, the rest on the recessed
 * one. Purely so that a row of eight does not read as one grey block — the
 * choice carries no meaning.
 */
const toneFor = (preset: AvatarPreset) =>
  AVATAR_PRESETS.indexOf(preset) % 2 === 0
    ? 'bg-sunk text-ink'
    : 'bg-accent text-accent-ink';

export function MemberAvatar({
  preset,
  displayName,
  className = 'h-11 w-11'
}: {
  preset?: string | null;
  displayName: string;
  className?: string;
}) {
  // No preset chosen: initials, which is what the site did before there were
  // any. Two letters at most — three is a monogram, and this is a 44px circle.
  if (!isAvatarPreset(preset)) {
    const initials = displayName
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-rule bg-sunk text-sm font-semibold text-ink ${className}`}
      >
        {initials || '?'}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-rule ${toneFor(preset)} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <Mark preset={preset} />
      </svg>
    </span>
  );
}
