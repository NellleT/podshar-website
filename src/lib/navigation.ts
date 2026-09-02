/**
 * Navigation.
 *
 * `PRIMARY_NAV` is what the drawer shows: five destinations, matching the
 * wireframe. Five is a deliberate ceiling — a drawer that lists everything is
 * an index, and we already have one of those behind the seal.
 *
 * `NAV_GROUPS` is the full index the hub page renders. `labelKey` in both is a
 * key inside the `nav` namespace, so adding a destination means touching this
 * file plus four JSON catalogues and nothing else.
 */
export type NavItem = { href: string; labelKey: string };
export type NavGroup = { titleKey: string; items: NavItem[] };

export const PRIMARY_NAV: NavItem[] = [
  { href: '/memes', labelKey: 'memes' },
  { href: '/gallery', labelKey: 'gallery' },
  { href: '/music', labelKey: 'music' },
  { href: '/games', labelKey: 'games' },
  { href: '/stats', labelKey: 'gameStats' }
];

export const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: 'daily',
    items: [
      { href: '/hub', labelKey: 'hub' },
      { href: '/calendar', labelKey: 'calendar' },
      { href: '/todos', labelKey: 'todos' },
      { href: '/gym', labelKey: 'gym' },
      { href: '/wall-of-shame', labelKey: 'wallOfShame' }
    ]
  },
  {
    titleKey: 'culture',
    items: [
      { href: '/memes', labelKey: 'memes' },
      { href: '/gallery', labelKey: 'gallery' },
      { href: '/radar', labelKey: 'radar' },
      { href: '/music', labelKey: 'music' }
    ]
  },
  {
    titleKey: 'world',
    items: [
      { href: '/ballick', labelKey: 'ballick' },
      { href: '/traphouse', labelKey: 'traphouse' },
      { href: '/map', labelKey: 'geopolitics' }
    ]
  },
  {
    titleKey: 'play',
    items: [
      { href: '/games', labelKey: 'games' },
      { href: '/stats', labelKey: 'gameStats' }
    ]
  }
];
