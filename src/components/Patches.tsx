import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/routing';
import { CURRENT_VERSION, PATCHES } from '@/lib/patches';
import { getMemberNames } from '@/lib/session';
import type { Locale } from '@/i18n/routing';

/**
 * Даты патчей разбираются в UTC. Строка вида `2026-09-08` и так означает
 * полночь UTC, и форматирование в чужой зоне сдвинуло бы половину записей на
 * день назад.
 */
function formatter(locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC'
  });
}

/**
 * Кнопка на главной: номер текущей версии, последняя строка и стрелка на
 * страницу со всем списком.
 *
 * Раньше список целиком лежал на главной. Пятнадцать строк в прокручиваемом
 * окошке — это уже не блок бенто, а страница, зажатая в блок: читать неудобно,
 * а места занимает как реактор. Кнопка говорит ровно то, ради чего на неё
 * смотрят с главной — «что-то поменялось, вот последнее» — и уводит туда, где
 * список можно нормально листать.
 */
export async function PatchesCard() {
  const t = await getTranslations('home');
  const latest = PATCHES[0];

  return (
    <Link
      href="/patches"
      className="block-card animate-rise-in group flex flex-col gap-3 p-6 transition-colors duration-drape ease-drape [animation-delay:300ms] hover:bg-sunk sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-10 md:col-span-6"
    >
      <div className="min-w-0">
        <p className="ps-label">{t('patchesLabel')}</p>
        <p className="mt-1 truncate text-base text-ink sm:text-lg">{latest.note}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-base font-semibold tabular-nums text-ink">
          v{CURRENT_VERSION}
        </span>
        <span className="ps-label">{t('patchesAll')}</span>
        {/* Стрелка декоративная: ссылку уже называет текст внутри неё. */}
        <span
          aria-hidden="true"
          className="text-base text-ink-faint transition-transform duration-drape ease-drape group-hover:translate-x-0.5"
        >
          &rarr;
        </span>
      </div>
    </Link>
  );
}

/**
 * Весь список, на своей странице. Прокрутки внутри нет — прокручивается
 * страница, а это и есть вся её работа.
 */
export async function PatchList({ locale }: { locale: Locale }) {
  const day = formatter(locale);
  // Одним запросом на весь список, а не по строке на патч.
  const names = await getMemberNames([...new Set(PATCHES.map((patch) => patch.author))]);

  return (
    <ol>
      {PATCHES.map((patch, index) => (
        // Две раскладки одной сеткой. На узком экране номер и подпись делят
        // верхнюю строку, а текст занимает всю ширину под ними — иначе номер
        // съедает целую строку. На широком всё выстраивается в одну строку, и
        // порядок меняет `order`, а не вторая разметка: одна разметка не может
        // разъехаться сама с собой.
        <li
          key={patch.version}
          className={`grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1 py-3 sm:grid-cols-[3.5rem_1fr_auto] ${
            index > 0 ? 'ps-rule' : ''
          }`}
        >
          <span className="text-base font-semibold tabular-nums text-ink sm:order-1">
            {patch.version}
          </span>
          <span className="ps-label justify-self-end tabular-nums sm:order-3">
            {day.format(new Date(patch.date))} &middot;{' '}
            {/* `ps-label` переводит всё в строчные — это верно для подписи и
                неверно для имени человека: «Trqwaa» превращался в «trqwaa».
                Дата остаётся лейблом, имя из регистра не выбивают. */}
            <span className="normal-case">{names[patch.author] ?? `@${patch.author}`}</span>
          </span>
          <span className="col-span-2 text-base leading-snug text-ink sm:order-2 sm:col-span-1">
            {patch.note}
          </span>
        </li>
      ))}
    </ol>
  );
}
