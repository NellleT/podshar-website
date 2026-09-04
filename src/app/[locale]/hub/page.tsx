import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { NAV_GROUPS } from '@/lib/navigation';
import { resolveLocale } from '@/lib/locale';

/**
 * The index the sun opens onto. Every destination as a bento tile, grouped by
 * the four areas of the app. Placeholder for now: it keeps the shell navigable
 * end to end while the feature modules are built.
 */
export default async function HubPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  resolveLocale((await params).locale);

  const tNav = await getTranslations('nav');

  return (
    <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4">
      <header className="block-card px-6 py-8 sm:px-10 sm:py-10">
        <p className="ps-label">Podshar</p>
        <h1 className="mt-3 text-greeting font-light text-ink">{tNav('hub')}</h1>
      </header>

      {NAV_GROUPS.map((group) => (
        <section key={group.titleKey} className="flex flex-col gap-3 sm:gap-4">
          <p className="ps-label px-1">{tNav(group.titleKey)}</p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block-card flex items-center justify-between gap-4 px-5 py-6 transition-colors duration-drape ease-drape hover:bg-sand"
                >
                  <span className="text-lg text-ink">{tNav(item.labelKey)}</span>
                  <span aria-hidden="true" className="text-sm text-ink-faint">
                    &#8594;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
