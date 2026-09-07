/**
 * Which day it is, as one number, for all three of us.
 *
 * Everything on the site that changes "once a day" — the quote, the greeting —
 * has to change at the same moment for everyone, and it has to survive a
 * refresh. `Math.random()` fails both: it picks a different line on the server
 * than in the browser, which is a hydration mismatch on every load, and it
 * re-rolls on every F5, which turns "thought of the *day*" into a slot machine.
 *
 * So the day itself is the seed. Counted in Zurich, because that is the group's
 * home timezone: at 01:00 in Zurich all three see the same line, whichever
 * timezone the viewer's own clock is in.
 *
 * The value is only ever used as `index % length`, so its absolute size does not
 * matter — only that it increases by exactly one at Zurich midnight.
 */
export function sharedDayIndex(now: Date = new Date()): number {
  // `en-CA` formats as YYYY-MM-DD, which `Date.parse` reads back as UTC
  // midnight. Formatting in Zurich and parsing in UTC is what shifts the
  // rollover to Zurich midnight without any timezone arithmetic of our own.
  const zurichDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  return Math.floor(Date.parse(zurichDate) / 86_400_000);
}
