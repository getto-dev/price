import { CATALOG, CATEGORIES } from './catalog';
import { getCategoryName } from './catalog-utils';

// ─── Типы ────────────────────────────────────────────────────────────
export interface ServiceWithScore {
  id: string;
  n: string;
  d: string;
  u: string;
  p: number;
  catName: string;
  score: number;
}

// ─── Стоп-слова (русские предлоги, союзы, местоимения, частицы) ─────
const STOP_WORDS = new Set([
  'с', 'в', 'на', 'по', 'и', 'к', 'за', 'из', 'от', 'до', 'для',
  'о', 'об', 'а', 'но', 'как', 'то', 'все', 'так', 'же', 'был',
  'его', 'ее', 'им', 'их', 'была', 'были', 'было', 'этот', 'эта',
  'это', 'эти', 'у', 'над', 'под', 'без', 'через', 'между', 'перед',
  'после', 'среди', 'вокруг', 'вдоль', 'возле', 'около', 'помимо',
  'кроме', 'вместо', 'относительно', 'благодаря', 'вследствие',
  'не', 'нет', 'да', 'или', 'либо', 'тоже', 'также', 'при', 'чем',
  'чему', 'чего', 'чей', 'чья', 'чье', 'кто', 'что', 'где', 'когда',
  'куда', 'откуда', 'зачем', 'почему', 'сколько', 'там', 'тут', 'здесь',
  'туда', 'сюда', 'оттуда', 'отсюда', 'ни', 'бы', 'ли', 'же', 'уж',
  'ведь', 'вот', 'это', 'всё', 'ещё', 'уже', 'еще',
]);

// ─── Синонимы и ассоциации для поиска ────────────────────────────────
const SYNONYM_GROUPS: string[][] = [
  // Отопление / радиаторы
  ['отопление', 'отопительный', 'радиатор', 'батарея', 'батареяка', 'конвектор'],
  ['тепло', 'теплый', 'теплого', 'теплому', 'теплым', 'нагрев', 'обогрев'],
  // Трубы
  ['труба', 'трубы', 'трубу', 'труб', 'трубопровод', 'трубный'],
  ['прокладка', 'прокладке', 'прокладку', 'укладка', 'укладке', 'укладку', 'монтаж', 'монтаже', 'монтажу'],
  // Водоснабжение
  ['вода', 'воды', 'воду', 'водоснабжение', 'водоснабжения', 'водоразбор', 'водоразбора'],
  ['водяной', 'водяного', 'водяному', 'водяным'],
  // Канализация
  ['канализация', 'канализации', 'канализацию', 'канализационный', 'фекальный'],
  ['слив', 'слива', 'сливу', 'сток', 'стока', 'стоку'],
  // Котлы / котельные
  ['котел', 'котла', 'котлу', 'котлом', 'котельная', 'котельной', 'котельню', 'котельные'],
  ['газовый', 'газового', 'газовому', 'газовым'],
  ['электрический', 'электрического', 'электрическому', 'электрическим'],
  ['настенный', 'настенного', 'настенному', 'настенным'],
  ['напольный', 'напольного', 'напольному', 'напольным'],
  // Бойлер
  ['бойлер', 'бойлера', 'бойлеру', 'бойлером', 'водонагреватель', 'водонагревателя'],
  // Коллектор
  ['коллектор', 'коллектора', 'коллектору', 'коллектором', 'гребенка', 'гребенки'],
  // Насос
  ['насос', 'насоса', 'насосу', 'насосом', 'помпа', 'помпы'],
  ['циркуляция', 'циркуляции', 'циркуляцию', 'циркуляционный', 'рециркуляция', 'рециркуляции'],
  // Дымоход
  ['дымоход', 'дымохода', 'дымоходу', 'дымоходом', 'дымовая', 'труба'],
  ['вентиляция', 'вентиляции', 'вентиляцию'],
  // Фильтр / водоочистка
  ['фильтр', 'фильтра', 'фильтру', 'фильтром', 'фильтрация', 'водоочистка', 'водоочистки'],
  ['очистка', 'очистки', 'очистку', 'обратный осмос', 'осмос'],
  // Автоматика
  ['автоматика', 'автоматики', 'автоматику', 'автоматический', 'автоматизация'],
  ['датчик', 'датчика', 'датчику', 'термостат', 'термостата', 'термоголовка', 'термоголовки'],
  ['контроллер', 'контроллера', 'управление', 'управления'],
  // Штробление
  ['штроба', 'штробы', 'штробу', 'штробление', 'штробления', 'штроблению'],
  ['бурение', 'бурения', 'сверление', 'сверления', 'отверстие', 'отверстия'],
  ['пеноблок', 'пеноблока', 'газоблок', 'газоблока', 'пенобетон'],
  ['кирпич', 'кирпича', 'кирпичный'],
  ['бетон', 'бетона', 'бетонный', 'железобетон'],
  // Сантехника
  ['сантехника', 'сантехники', 'сантехнику'],
  ['унитаз', 'унитаза', 'раковина', 'раковины', 'умывальник', 'умывальника'],
  ['смеситель', 'смесителя', 'кран', 'крана'],
  ['ванная', 'ванны', 'ванна', 'душ', 'душевая'],
  ['инсталляция', 'инсталляции', 'инсталляцию'],
  // Теплый пол
  ['пол', 'пола', 'полу', 'полы', 'полов'],
  ['контур', 'контура', 'контуры', 'контуров'],
  // Общие
  ['монтаж', 'установка', 'сборка', 'подключение', 'обвязка'],
  ['демонтаж', 'замена', 'снятие', 'разборка'],
  ['ремонт', 'сервис', 'обслуживание', 'то', 'диагностика'],
  // Краны / клапаны
  ['кран', 'крана', 'крану', 'вентиль', 'вентиля', 'клапан', 'клапана'],
  // Изоляция
  ['изоляция', 'изоляции', 'утепление', 'утеплитель', 'теплоизоляция', 'шумоизоляция'],
  // Емкости
  ['бак', 'бака', 'емкость', 'емкости', 'расширительный', 'расширительного'],
  // Гидрострелка
  ['гидрострелка', 'гидрострелки', 'стрелка', 'разделитель', 'коллектор-разделитель'],
  // Группа безопасности
  ['группа безопасности', 'воздухоудалитель', 'воздухоотводчик', 'клапан'],
  // Промывка
  ['промывка', 'промывки', 'очистка', 'чистка'],
  // Опрессовка
  ['опрессовка', 'опрессовки', 'опрессовку', 'испытание', 'давление'],
  // Трап
  ['трап', 'трапа', 'лоток', 'лотка', 'сливной'],
  // Редуктор
  ['редуктор', 'редуктора', 'редукционный'],
  // Счетчик
  ['счетчик', 'счетчика', 'водомер'],
  // Теплообменник
  ['теплообменник', 'теплообменника', 'обменник'],
  // Шкаф
  ['шкаф', 'шкафа', 'коллекторный шкаф', 'сантехшкаф'],
];

// Построить обратный индекс: слово → группа синонимов
const synonymMap = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
  for (const word of group) {
    const lower = word.toLowerCase();
    if (!synonymMap.has(lower)) {
      synonymMap.set(lower, group);
    }
  }
}

// ─── Триграммы ───────────────────────────────────────────────────────
function getTrigrams(word: string): Set<string> {
  const trigrams = new Set<string>();
  const padded = `  ${word} `;
  for (let i = 0; i <= padded.length - 3; i++) {
    trigrams.add(padded.slice(i, i + 3));
  }
  return trigrams;
}

function trigramSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;

  const tgA = getTrigrams(a);
  const tgB = getTrigrams(b);

  let intersection = 0;
  for (const tg of tgA) {
    if (tgB.has(tg)) intersection++;
  }

  const union = tgA.size + tgB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ─── Извлечение чисел из строки ──────────────────────────────────────
function extractNumbers(text: string): string[] {
  return text.match(/\d+/g) || [];
}

// ─── Простая стемматизация (обрезка окончания) ──────────────────────
function simpleStem(word: string): string {
  if (word.length <= 3) return word;
  // Убираем типичные русские окончания
  return word
    .replace(/(ами|ями|ого|ому|ыми|ими|ой|ый|ая|яя|ое|ее|ые|ие|ом|ем|ах|ях|ам|ям|ух|юх|ов|ев|ей|ий|ый|ой|ь|я|а|у|ю|е|о|ы|и)$/i, '')
    || word;
}

// ─── Разбить запрос на значимые слова ────────────────────────────────
function tokenizeQuery(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(/ø/g, '')  // убираем символ диаметра для поиска
    .split(/[\s,.\-;:!?()\/\\]+/)
    .filter(w => w.length >= 1 && !STOP_WORDS.has(w));
  return words;
}

// ─── Расширить слово синонимами ──────────────────────────────────────
function expandWithSynonyms(word: string): string[] {
  const result = new Set<string>([word]);
  const group = synonymMap.get(word);
  if (group) {
    for (const syn of group) {
      result.add(syn.toLowerCase());
    }
  }
  // Также проверяем стем
  const stem = simpleStem(word);
  for (const [key, group] of synonymMap.entries()) {
    if (simpleStem(key) === stem || key.startsWith(stem) || stem.startsWith(key)) {
      for (const syn of group) {
        result.add(syn.toLowerCase());
      }
    }
  }
  return [...result];
}

// ─── Проверка совпадения слова с текстом ─────────────────────────────
function wordMatchesText(
  word: string,
  textLower: string,
  textWords: string[],
  expandedWords: string[],
): boolean {
  // 1. Прямое включение подстроки
  if (textLower.includes(word)) return true;

  // 2. Совпадение через синонимы
  for (const syn of expandedWords) {
    if (textLower.includes(syn)) return true;
  }

  // 3. Совпадение по стему
  const stem = simpleStem(word);
  for (const tw of textWords) {
    const twStem = simpleStem(tw);
    if (stem === twStem || tw.startsWith(stem) || stem.startsWith(tw)) {
      return true;
    }
  }

  // 4. Нечёткое совпадение (триграммы) — порог 55%
  for (const tw of textWords) {
    if (tw.length >= 3 && word.length >= 3) {
      const sim = trigramSimilarity(word, tw);
      if (sim >= 0.55) return true;
    }
  }

  return false;
}

// ─── Совпадение по номеру ────────────────────────────────────────────
function numberMatches(queryNums: string[], textLower: string): boolean {
  if (queryNums.length === 0) return false;
  for (const qn of queryNums) {
    // Подстрока числа в тексте (например, "110" в "Ø110")
    if (textLower.includes(qn)) return true;
  }
  return false;
}

// ─── Совпадение по категории ─────────────────────────────────────────
function categoryMatches(queryWords: string[], categoryName: string): boolean {
  const catLower = categoryName.toLowerCase();
  const catWords = catLower.split(/[\s-]+/);

  for (const qWord of queryWords) {
    if (catLower.includes(qWord)) return true;

    const expanded = expandWithSynonyms(qWord);
    for (const syn of expanded) {
      if (catLower.includes(syn)) return true;
    }

    // По стему
    const stem = simpleStem(qWord);
    for (const cw of catWords) {
      if (simpleStem(cw) === stem) return true;
    }
  }

  return false;
}

// ─── Основная функция поиска ─────────────────────────────────────────
export function searchServices(query: string): ServiceWithScore[] {
  if (!query || query.trim().length < 2) return [];

  const queryWords = tokenizeQuery(query);
  if (queryWords.length === 0) return [];

  const queryNumbers = extractNumbers(query);

  const results: ServiceWithScore[] = [];

  for (const [catId, items] of Object.entries(CATALOG)) {
    const catName = getCategoryName(catId);
    const catLower = catName.toLowerCase();

    for (const item of items) {
      const nameLower = item.n.toLowerCase();
      const descLower = item.d.toLowerCase();
      const nameWords = nameLower.split(/[\s,.\-;:!?()\/\\Ø]+/).filter(Boolean);
      const descWords = descLower.split(/[\s,.\-;:!?()\/\\Ø]+/).filter(Boolean);

      let matchedWords = 0;
      let matchedNumbers = false;
      let categoryBonus = 0;

      for (const qWord of queryWords) {
        const expanded = expandWithSynonyms(qWord);

        // Проверка совпадения слова с названием
        const nameMatch = wordMatchesText(qWord, nameLower, nameWords, expanded);
        // Проверка совпадения слова с описанием
        const descMatch = wordMatchesText(qWord, descLower, descWords, expanded);

        if (nameMatch || descMatch) {
          matchedWords++;
        }

        // Проверка совпадения по категории
        if (categoryMatches([qWord], catName)) {
          categoryBonus += 0.5;
        }
      }

      // Проверка чисел
      const nameNumMatch = numberMatches(queryNumbers, nameLower);
      const descNumMatch = numberMatches(queryNumbers, descLower);
      if (nameNumMatch || descNumMatch) {
        matchedNumbers = true;
      }

      // Мягкая OR-логика: достаточно 30% совпадений слов
      const matchRatio = matchedWords / queryWords.length;
      const threshold = 0.3;

      if (matchRatio >= threshold || (matchedNumbers && matchedWords > 0)) {
        // Вычисляем релевантность
        let score = matchRatio;

        // Бонус за совпадение в названии (выше приоритет)
        for (const qWord of queryWords) {
          const expanded = expandWithSynonyms(qWord);
          if (wordMatchesText(qWord, nameLower, nameWords, expanded)) {
            score += 0.3;
          }
        }

        // Бонус за числа
        if (matchedNumbers) {
          score += 0.3;
        }

        // Бонус за категорию
        score += categoryBonus;

        // Бонус за точное совпадение
        if (nameLower.includes(query.toLowerCase().trim())) {
          score += 0.5;
        }

        results.push({
          ...item,
          catName,
          score,
        });
      }
    }
  }

  // Сортировка по релевантности
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 50);
}

// ─── Улучшенная подсветка совпадений ─────────────────────────────────
export function getHighlightParts(text: string, query: string): { text: string; highlight: boolean }[] {
  if (!query || query.trim().length < 2) {
    return [{ text, highlight: false }];
  }

  const queryWords = tokenizeQuery(query);
  const queryNumbers = extractNumbers(query);

  // Собираем все слова для подсветки: слова запроса + их синонимы + числа
  const highlightTerms = new Set<string>();

  for (const word of queryWords) {
    highlightTerms.add(word.toLowerCase());
    const expanded = expandWithSynonyms(word);
    for (const syn of expanded) {
      if (syn.length >= 2) highlightTerms.add(syn.toLowerCase());
    }
    // Также добавляем стем
    const stem = simpleStem(word);
    if (stem.length >= 2) highlightTerms.add(stem);
  }

  for (const num of queryNumbers) {
    highlightTerms.add(num);
  }

  if (highlightTerms.size === 0) {
    return [{ text, highlight: false }];
  }

  // Строим regex для подсветки
  const sortedTerms = [...highlightTerms].sort((a, b) => b.length - a.length);
  const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');

  const parts: { text: string; highlight: boolean }[] = [];
  let lastIndex = 0;

  const matches = [...text.matchAll(new RegExp(pattern.source, pattern.flags))];
  for (const match of matches) {
    if (match.index === undefined) continue;
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false });
    }
    parts.push({ text: match[0], highlight: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }

  return parts.length > 0 ? parts : [{ text, highlight: false }];
}
