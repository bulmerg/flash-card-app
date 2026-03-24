import { eng, removeStopwords } from 'stopword'
import * as stemmerModule from 'stemmer'
import { SYNONYM_GROUPS } from './synonyms.js'

const stemWord = stemmerModule.default || stemmerModule.stemmer || stemmerModule

export function clampDifficulty(value) {
  if (!Number.isFinite(value)) return 2
  return Math.max(1, Math.min(5, value))
}

export function getIntrinsicDifficulty(card) {
  return clampDifficulty(Number(card?.intrinsicDifficulty ?? card?.difficulty ?? 2))
}

export function getPersonalDifficulty(card) {
  const intrinsic = getIntrinsicDifficulty(card)
  return clampDifficulty(Number(card?.personalDifficulty ?? card?.difficulty ?? intrinsic))
}

export function getEffectiveDifficulty(card) {
  return Math.max(getIntrinsicDifficulty(card), getPersonalDifficulty(card))
}

export function normalizeAnswer(text = '') {
  return String(text).toLowerCase().trim().replace(/\s+/g, ' ')
}

function tokenizeForScoring(text = '') {
  return normalizeAnswer(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(' ')
    .map(token => token.trim())
    .filter(token => token.length > 1)
}

function stemTokens(tokens = []) {
  return tokens.map(token => stemWord(token)).filter(token => token.length > 1)
}

function stemmedTokenSetFromText(text = '', removeStopWords = true) {
  const tokens = tokenizeForScoring(text)
  if (!tokens.length) return new Set()
  const filtered = removeStopWords ? removeStopwords(tokens, eng) : tokens
  const normalized = filtered.length ? filtered : tokens
  return new Set(stemTokens(normalized))
}

function buildSynonymLookup() {
  const tokenToCanonicalStem = new Map()
  const phraseToCanonicalStem = []
  const canonicalStemToLabel = new Map()

  SYNONYM_GROUPS.forEach(group => {
    const canonicalStemSet = stemmedTokenSetFromText(group.canonical, true)
    const canonicalStem = [...canonicalStemSet][0]
    if (!canonicalStem) return
    canonicalStemToLabel.set(canonicalStem, group.canonical)
    tokenToCanonicalStem.set(canonicalStem, canonicalStem)

    ;[group.canonical, ...(group.aliases || [])].forEach(alias => {
      const aliasStemmedTokens = [...stemmedTokenSetFromText(alias, false)]
      if (!aliasStemmedTokens.length) return
      if (aliasStemmedTokens.length === 1) {
        tokenToCanonicalStem.set(aliasStemmedTokens[0], canonicalStem)
      } else {
        phraseToCanonicalStem.push({
          phrase: aliasStemmedTokens.join(' '),
          canonicalStem,
        })
      }
    })
  })

  return { tokenToCanonicalStem, phraseToCanonicalStem, canonicalStemToLabel }
}

const { tokenToCanonicalStem, phraseToCanonicalStem, canonicalStemToLabel } = buildSynonymLookup()

function expandKeywordsWithSynonyms(keywordSet, originalText = '') {
  const expanded = new Set(keywordSet)
  keywordSet.forEach(token => {
    const mapped = tokenToCanonicalStem.get(token)
    if (mapped) expanded.add(mapped)
  })

  const stemmedText = [...stemmedTokenSetFromText(originalText, false)].join(' ')
  const paddedText = ` ${stemmedText} `
  phraseToCanonicalStem.forEach(({ phrase, canonicalStem }) => {
    if (paddedText.includes(` ${phrase} `)) {
      expanded.add(canonicalStem)
    }
  })

  return expanded
}

function toKeywordSet(text = '') {
  const stemmedKeywords = stemmedTokenSetFromText(text, true)
  return expandKeywordsWithSynonyms(stemmedKeywords, text)
}

function toDisplayKeywords(tokens = []) {
  const seen = new Set()
  return tokens.reduce((acc, token) => {
    const label = canonicalStemToLabel.get(token) || token
    if (!seen.has(label)) {
      seen.add(label)
      acc.push(label)
    }
    return acc
  }, [])
}

function getWordBigrams(text = '') {
  const tokens = tokenizeForScoring(text)
  const bigrams = []
  for (let i = 0; i < tokens.length - 1; i += 1) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`)
  }
  return new Set(bigrams)
}

function setOverlapRatio(a, b) {
  if (!a.size || !b.size) return 0
  let overlap = 0
  a.forEach(value => {
    if (b.has(value)) overlap += 1
  })
  return overlap / Math.max(a.size, b.size)
}

export function scoreAnswer(userAnswer, correctAnswer) {
  if (!correctAnswer || !userAnswer) {
    return {
      score: 0,
      level: 'weak',
      isCorrect: false,
      matchedKeywords: [],
      missingKeywords: [],
      keywordCoverage: 0,
    }
  }

  const u = normalizeAnswer(userAnswer)
  const c = normalizeAnswer(correctAnswer)
  if (!u || !c) {
    return {
      score: 0,
      level: 'weak',
      isCorrect: false,
      matchedKeywords: [],
      missingKeywords: [],
      keywordCoverage: 0,
    }
  }

  if (u === c) {
    return {
      score: 1,
      level: 'strong',
      isCorrect: true,
      matchedKeywords: [],
      missingKeywords: [],
      keywordCoverage: 1,
    }
  }

  const userKeywords = toKeywordSet(u)
  const correctKeywords = toKeywordSet(c)
  const matchedKeywords = [...correctKeywords].filter(token => userKeywords.has(token))
  const missingKeywords = [...correctKeywords].filter(token => !userKeywords.has(token))
  const keywordCoverage = correctKeywords.size ? matchedKeywords.length / correctKeywords.size : 0
  const precision = userKeywords.size ? matchedKeywords.length / userKeywords.size : 0

  const userBigrams = getWordBigrams(u)
  const correctBigrams = getWordBigrams(c)
  const bigramSimilarity = setOverlapRatio(userBigrams, correctBigrams)

  const containmentBonus = (c.includes(u) && u.length >= 3) || (u.includes(c) && c.length >= 3) ? 0.08 : 0

  const score = Math.max(
    0,
    Math.min(
      1,
      keywordCoverage * 0.62 + precision * 0.2 + bigramSimilarity * 0.18 + containmentBonus,
    ),
  )

  let level = 'weak'
  if (score >= 0.74 || keywordCoverage >= 0.78) level = 'strong'
  else if (score >= 0.45 || keywordCoverage >= 0.4) level = 'partial'

  return {
    score,
    level,
    isCorrect: level === 'strong',
    matchedKeywords: toDisplayKeywords(matchedKeywords),
    missingKeywords: toDisplayKeywords(missingKeywords),
    keywordCoverage,
  }
}

export function answerMatches(userAnswer, correctAnswer) {
  return scoreAnswer(userAnswer, correctAnswer).isCorrect
}

export function shuffle(array, seed) {
  // Deterministic-ish shuffle from a numeric seed.
  let currentSeed = seed
  for (let i = array.length - 1; i > 0; i -= 1) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    const j = Math.floor((currentSeed / 233280) * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function formatDue(dueAt) {
  const diffMs = dueAt - Date.now()
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays <= 0) return 'Due now'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays} days`
}

export function getDeckStats(cards) {
  const now = Date.now()
  return cards.reduce(
    (acc, card) => {
      acc.total += 1
      if (card.status === 'know') acc.know += 1
      if (card.status === 'review') acc.review += 1
      if (card.starred) acc.starred += 1
      if ((card.srs?.dueAt || 0) <= now) acc.due += 1
      acc.reviews += card.stats?.seen || 0
      return acc
    },
    { total: 0, know: 0, review: 0, starred: 0, due: 0, reviews: 0 },
  )
}

