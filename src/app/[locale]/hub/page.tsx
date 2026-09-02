import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { NAV_GROUPS } from '@/lib/navigation';

/**
 * The search hub the "ПХ" seal opens onto. Placeholder index for now: it lists
 * every destination so the shell is navigable end to end while the feature
 * modules are still being built.
 */
export default async function HubPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tNav = await getTranslations('nav');

  return (
    <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
      <p className="ps-label">Podshar</p>
      <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
        {tNav('hub')}
      </h1>

      <div className="mt-14 space-y-12">
        {NAV_GROUPS.map((group) => (
          <section key={group.titleKey}>
            <p className="ps-label">{tNav(group.titleKey)}</p>
            <div className="ps-rule mt-3" />
            <ul>
              {group.items.map((item) => (
                <li key={item.href} className="ps-rule">
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between py-4 font-display text-2xl text-ink-muted transition-colors duration-300 hover:text-ink"
                  >
                    <span>{tNav(item.labelKey)}</span>
                    <span
                      aria-hidden="true"
                      className="h-px w-0 bg-clay transition-all duration-500 ease-drape group-hover:w-16"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
