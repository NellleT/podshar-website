import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    // Everything in Podshar is authored in the group's home timezone so that
    // the shared calendar and Doomsday countdown agree across all 3 users.
    timeZone: 'Europe/Zurich'
  };
});
