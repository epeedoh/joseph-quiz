import fs from 'node:fs';
import path from 'node:path';

import { questionBank } from './question-bank.mjs';

const versesPath = path.resolve('tools/bible/genesis37-50.json');
const outputPath = path.resolve('src/JosephQuiz.Infrastructure/SeedData/joseph-questions.json');

const raw = fs.readFileSync(versesPath, 'utf8').replace(/^\uFEFF/, '');
const chapters = JSON.parse(raw);

const difficultyCount = new Map([
  ['Easy', 0],
  ['Medium', 0],
  ['Hard', 0]
]);

const zoneForChapter = (chapter) => {
  if (chapter <= 38) return 'Zone1';
  if (chapter <= 41) return 'Zone2';
  if (chapter <= 45) return 'Zone3';
  return 'Zone4';
};

const getVerseText = (reference) => {
  const [chapterPart, versePart] = reference.split(':');
  const chapter = Number(chapterPart);
  const chapterData = chapters.find((item) => item.chapter === chapter);

  if (!chapterData) {
    throw new Error(`Chapitre introuvable pour ${reference}`);
  }

  if (versePart.includes('-')) {
    const [start, end] = versePart.split('-').map(Number);
    const texts = chapterData.verses
      .filter((verse) => verse.verse >= start && verse.verse <= end)
      .map((verse) => verse.text);

    if (texts.length === 0) {
      throw new Error(`Plage de versets introuvable pour ${reference}`);
    }

    return texts.join(' ');
  }

  const verse = chapterData.verses.find((item) => item.verse === Number(versePart));
  if (!verse) {
    throw new Error(`Verset introuvable pour ${reference}`);
  }

  return verse.text;
};

const payload = questionBank.map((item) => {
  difficultyCount.set(item.difficulty, (difficultyCount.get(item.difficulty) ?? 0) + 1);

  const verseText = getVerseText(item.reference);
  const explanation =
    item.explanation ??
    `La bonne réponse vient directement de Genèse ${item.reference}, qui précise: ${verseText}`;

  return {
    text: item.question,
    optionA: item.options[0],
    optionB: item.options[1],
    optionC: item.options[2],
    optionD: item.options[3],
    correctOption: item.correctOption,
    verseReference: `Genèse ${item.reference}`,
    verseText,
    explanation,
    chapter: item.chapter,
    zone: zoneForChapter(item.chapter),
    difficulty: item.difficulty
  };
});

if (payload.length !== 100) {
  throw new Error(`Le seed doit contenir exactement 100 questions. Actuel: ${payload.length}`);
}

if (
  difficultyCount.get('Easy') !== 40 ||
  difficultyCount.get('Medium') !== 40 ||
  difficultyCount.get('Hard') !== 20
) {
  throw new Error(
    `Répartition invalide. Easy=${difficultyCount.get('Easy')} Medium=${difficultyCount.get('Medium')} Hard=${difficultyCount.get('Hard')}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');

console.log(`Seed généré: ${payload.length} questions`);
console.log(`Répartition:`, Object.fromEntries(difficultyCount));
