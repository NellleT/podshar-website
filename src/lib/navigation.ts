/**
 * Navigation.
 *
 * `PRIMARY_NAV_SLOTS` is what the drawer shows: five reserved rows, rendered as
 * "in progress" and deliberately inert. The destinations behind them are not
 * decided yet, and five buttons named after pages that do not exist is worse
 * than five that admit they are placeholders — it invites clicks that 404 and
 * it commits us to names we intend to change. Five is a ceiling, not a target:
 * a drawer that lists everything is an index, and there is no index page.
 *
 * When the names are settled, this becomes a `NavItem[]` again and LeftSidebar
 * goes back to rendering `<Link>`s.
 *
 * `NAV_GROUPS` is the full route table. With /hub deleted its only consumer is
 * the assistant endpoint, which uses it to decide where a request can send you;
 * a destination missing from here is a destination Podshar cannot route to.
 * `labelKey` is a key inside the `nav` namespace, so adding a route means
 * touching this file plus four JSON catalogues and nothing else.
 */
export type NavItem = { href: string; labelKey: string };
export type NavGroup = { titleKey: string; items: NavItem[] };

export const PRIMARY_NAV_SLOTS = 5;

export const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: 'daily',
    items: [
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
