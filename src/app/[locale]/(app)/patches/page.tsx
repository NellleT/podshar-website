import { getTranslations } from 'next-intl/server';

import { PatchList } from '@/components/Patches';
import { CURRENT_VERSION } from '@/lib/patches';
import { resolveLocale } from '@/lib/locale';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'patches' });
  return { title: t('title') };
}

/**
 * Все патчи, целиком.
 *
 * Отдельная страница, а не список на главной: пятнадцать строк в прокручиваемом
 * окошке читаются плохо, а список будет только расти. Сюда же идут мелкие
 * правки, которые на главную не попадали — здесь для них есть место.
 *
 * Один блок на всю ширину, без бенто. Бенто — язык главной, где рядом лежат
 * разные по смыслу вещи; тут вещь одна, и делить её на карточки значило бы
 * изображать сложность, которой нет.
 */
export default async function PatchesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'patches' });

  return (
    <div className="grid grid-cols-1 content-start gap-3 p-3 sm:gap-4 sm:p-4">
      <section className="block-card animate-rise-in flex flex-col gap-6 px-6 py-8 sm:px-10">
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div>
            <h1 className="text-3xl font-semibold leading-tight text-ink">{t('title')}</h1>
            <p className="ps-label mt-1">{t('hint')}</p>
          </div>
          <span className="text-2xl font-semibold tabular-nums text-ink-faint">
            v{CURRENT_VERSION}
          </span>
        </header>

        <PatchList locale={locale} />
      </section>
    </div>
  );
}
