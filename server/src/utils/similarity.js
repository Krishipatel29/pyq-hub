// Finding "repeated" questions across years.
//
// Idea: two questions are the same if most of their important words match.
// 1. normalize(): lowercase, remove punctuation, remove common exam words
//    (explain, what, write, example...) so only the topic words remain.
// 2. similarity(): Jaccard index = common words / total unique words.
// 3. groupSimilar(): put each question into the first group that has
//    any question similar enough (>= threshold), else start a new group.

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "of", "in", "on", "at", "to",
  "for", "and", "or", "with", "by", "its", "it", "this", "that", "these", "those",
  "what", "which", "who", "how", "why", "when", "where", "do", "does", "you", "your",
  "explain", "describe", "discuss", "define", "write", "state", "give", "list",
  "short", "note", "notes", "brief", "briefly", "detail", "detailed", "example",
  "examples", "suitable", "proper", "neat", "diagram", "using", "use", "mean",
  "meant", "about", "various", "different", "any", "two", "three", "four", "five",
  "also", "can", "we", "us", "them", "they", "help", "concept", "following", "between",
  "structure", "class", "implement", "implemented", "implementation", "working",
]);

function stem(word) {
  // very small stemmer: patterns -> pattern, classes -> class
  if (word.length > 4 && word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.length > 4 && word.endsWith("es") && /(ss|sh|ch|x)es$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function normalize(text = "") {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w) && !/^\d+$/.test(w))
    .map(stem);

  return [...new Set(words)];
}

function similarity(a, b) {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  const common = a.filter((w) => setB.has(w)).length;
  const total = new Set([...a, ...b]).size;
  return common / total;
}

function groupSimilar(questions, threshold = 0.6) {
  const groups = [];

  for (const q of questions) {
    const words = q.keywords?.length ? q.keywords : normalize(q.text);
    const match = groups.find((g) => g.wordLists.some((w) => similarity(w, words) >= threshold));

    if (match) {
      match.items.push(q);
      match.wordLists.push(words);
    } else {
      groups.push({ wordLists: [words], items: [q] });
    }
  }

  return groups;
}

module.exports = { normalize, similarity, groupSimilar };
