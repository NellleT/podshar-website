import { getTranslations } from 'next-intl/server';

import { CURRENT_VERSION, PATCHES } from '@/lib/patches';
import type { Locale } from '@/i18n/routing';

/**
 * Что менялось на сайте — блок на главной.
 *
 * Серверный компонент: тут нечего нажимать, и список не меняется между
 * загрузками, так что отправлять его в браузер вместе с React нет смысла.
 *
 * Список прокручивается внутри блока, а не обрезается на пятой записи. Отдельной
 * страницы «все патчи» нет намеренно — согласованный план кончается на главной,
 * и заводить новый маршрут ради пятнадцати строк значило бы придумать за них
 * следующий шаг. Своя прокрутка решает ту же задачу и ничего не обещает.
 *
 * Дата разбирается в UTC. Строка вида `2026-09-08` и так означает полночь UTC,
 * и форматирование в чужой зоне сдвинуло бы половину записей на день назад.
 */
export async function Patches({ locale }: { locale: Locale }) {
  const t = await getTranslations('home');

  const day = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC'
  });

  return (
    <>
      <header className="flex items-baseline justify-between gap-4">
        <p className="ps-label">{t('patchesLabel')}</p>
        <span className="text-label font-semibold tabular-nums text-ink-faint">
          v{CURRENT_VERSION}
        </span>
      </header>

      {/* `overscroll-contain`, чтобы прокрутка списка не утаскивала за собой
          страницу, когда добралась до края. */}
      <ol className="max-h-80 overflow-y-auto overscroll-contain sm:max-h-64">
        {PATCHES.map((patch, index) => (
          // Две раскладки одной сеткой. На узком экране номер и подпись делят
          // верхнюю строку, а текст занимает всю ширину под ними — иначе номер
          // съедает целую строку и в блок помещается два патча. На широком всё
          // выстраивается в одну строку, и порядок меняет `order`, а не вторая
          // разметка: одна разметка не может разъехаться сама с собой.
          <li
            key={patch.version}
            className={`grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1 py-3 sm:grid-cols-[3rem_1fr_auto] ${
              index > 0 ? 'ps-rule' : ''
            }`}
          >
            <span className="text-base font-semibold tabular-nums text-ink sm:order-1">
              {patch.version}
            </span>
            <span className="ps-label justify-self-end tabular-nums sm:order-3">
              {day.format(new Date(patch.date))} &middot; @{patch.author}
            </span>
            <span className="col-span-2 text-base leading-snug text-ink sm:order-2 sm:col-span-1">
              {patch.note}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
