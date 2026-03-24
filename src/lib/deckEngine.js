import {
  clampDifficulty,
  getEffectiveDifficulty,
  getIntrinsicDifficulty,
  getPersonalDifficulty,
} from './shared'

function normalizeNewlines(text = '') {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}

function parseSubtopicsString(value = '') {
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function normalizeTopicValue(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeClassification({ topic, subtopics }) {
  const finalTopic = normalizeTopicValue(topic)
  const rawSubtopics = Array.isArray(subtopics) ? subtopics : parseSubtopicsString(subtopics)

  const seen = new Set()
  const finalSubtopics = []
  rawSubtopics.forEach(value => {
    const normalized = normalizeTopicValue(value)
    if (!normalized || normalized === finalTopic || seen.has(normalized)) return
    seen.add(normalized)
    if (finalSubtopics.length < 3) finalSubtopics.push(normalized)
  })

  return { topic: finalTopic, subtopics: finalSubtopics }
}

function slugify(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
}

function parseQuotedCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells
}

function normalizeHeaderCell(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function looksLikeDeckHeader(cells) {
  if (!Array.isArray(cells) || cells.length < 10) return false
  const normalized = new Set(cells.map(normalizeHeaderCell))
  return normalized.has('front')
    && normalized.has('back')
    && normalized.has('why')
    && normalized.has('topic')
    && normalized.has('subtopics')
    && normalized.has('intrinsicdifficulty')
}

function parseIntrinsicDifficulty(rawValue) {
  if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') return null
  const n = Number(rawValue)
  if (!Number.isFinite(n)) return null
  return clampDifficulty(Math.round(n))
}

function buildHeaderIndex(headerCells = []) {
  const index = {}
  headerCells.forEach((cell, idx) => {
    const normalized = normalizeHeaderCell(cell)
    if (normalized) index[normalized] = idx
  })
  return index
}

function parseDeckRow(line, headerIndex = null) {
  const cells = parseQuotedCsvLine(line).map(cell => String(cell ?? '').trim())
  if (!headerIndex) return null

  const readCell = name => {
    if (!Number.isInteger(headerIndex[name])) return ''
    return String(cells[headerIndex[name]] ?? '').trim()
  }

  return {
    front: readCell('front'),
    back: readCell('back'),
    why: readCell('why'),
    when: readCell('when'),
    tradeoffs: readCell('tradeoffs'),
    trap: readCell('trap'),
    scenario: readCell('scenario'),
    topicText: readCell('topic'),
    subtopicsText: readCell('subtopics'),
    intrinsicDifficulty: parseIntrinsicDifficulty(readCell('intrinsicdifficulty')),
  }
}

function defaultSrs() {
  return {
    interval: 0,
    ease: 2.5,
    reps: 0,
    lapses: 0,
    dueAt: Date.now(),
    lastReviewedAt: null,
  }
}

export function parseDeckCsv(rawText, sourceName = 'Imported CSV') {
  const text = normalizeNewlines(rawText)
  if (!text) return []
  const lines = text.split('\n').filter(Boolean)
  const headerCells = parseQuotedCsvLine(lines[0]).map(cell => String(cell ?? '').trim())
  const startIndex = looksLikeDeckHeader(headerCells) ? 1 : 0
  if (!startIndex) return []
  const headerIndex = startIndex ? buildHeaderIndex(headerCells) : null
  const cards = []
  for (let i = startIndex; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (!line) continue
    const parsed = parseDeckRow(line, headerIndex)
    if (!parsed) continue
    const {
      front,
      back,
      why,
      topicText,
      subtopicsText,
      intrinsicDifficulty: parsedIntrinsic,
      when,
      tradeoffs,
      trap,
      scenario,
    } = parsed
    const classification = normalizeClassification({
      topic: topicText,
      subtopics: subtopicsText,
    })
    const intrinsicDifficulty = parsedIntrinsic ?? 2
    cards.push({
      id: `${sourceName}-${i}-${slugify(front)}`,
      front: front.trim(),
      back: back.trim(),
      why: why.trim(),
      when: String(when ?? '').trim(),
      tradeoffs: String(tradeoffs ?? '').trim(),
      trap: String(trap ?? '').trim(),
      scenario: String(scenario ?? '').trim(),
      topic: classification.topic,
      subtopics: classification.subtopics,
      source: sourceName,
      status: 'new',
      intrinsicDifficulty,
      personalDifficulty: 2,
      difficulty: Math.max(intrinsicDifficulty, 2),
      stats: { seen: 0, correct: 0, hard: 0, again: 0 },
      srs: defaultSrs(),
      history: [],
      starred: false,
    })
  }
  return cards.filter(card => card.front && (card.back || card.why))
}

function ensureCardShape(card) {
  const classification = normalizeClassification({
    topic: card.topic,
    subtopics: card.subtopics,
  })
  const intrinsicDifficulty = clampDifficulty(Number(card.intrinsicDifficulty ?? card.difficulty ?? 2))
  const personalDifficulty = clampDifficulty(Number(card.personalDifficulty ?? card.difficulty ?? intrinsicDifficulty))
  const difficulty = Math.max(intrinsicDifficulty, personalDifficulty)
  return {
    ...card,
    topic: classification.topic,
    subtopics: classification.subtopics,
    when: String(card.when ?? '').trim(),
    tradeoffs: String(card.tradeoffs ?? '').trim(),
    trap: String(card.trap ?? '').trim(),
    scenario: String(card.scenario ?? '').trim(),
    status: card.status || 'new',
    intrinsicDifficulty,
    personalDifficulty,
    difficulty,
    stats: {
      seen: card.stats?.seen || 0,
      correct: card.stats?.correct || 0,
      hard: card.stats?.hard || 0,
      again: card.stats?.again || 0,
    },
    srs: {
      ...defaultSrs(),
      ...(card.srs || {}),
      dueAt: Number(card.srs?.dueAt || Date.now()),
    },
    history: Array.isArray(card.history) ? card.history : [],
    starred: Boolean(card.starred),
  }
}

export function dedupeCards(cards) {
  const seen = new Map()
  cards.forEach(raw => {
    const card = ensureCardShape(raw)
    if (
      normalizeHeaderCell(card.front) === 'front' &&
      normalizeHeaderCell(card.back) === 'back' &&
      normalizeHeaderCell(card.why) === 'why'
    ) {
      return
    }
    const key = `${card.front}||${card.back}`
    if (!seen.has(key)) seen.set(key, card)
  })
  return [...seen.values()]
}

function getCardKey(card) {
  return `${String(card.front ?? '').trim()}||${String(card.back ?? '').trim()}`
}

export function mergeImportedCards(existingCards, importedCards, { overwriteIntrinsicDifficulty }) {
  const existingByKey = new Map(existingCards.map(card => [getCardKey(card), card]))
  const updatedByKey = new Map()
  const addedCards = []
  const importedUnique = dedupeCards(importedCards)

  importedUnique.forEach(imp => {
    const key = getCardKey(imp)
    const existing = existingByKey.get(key)
    if (!existing) {
      addedCards.push(imp)
      return
    }
    const nextIntrinsicDifficulty = overwriteIntrinsicDifficulty ? imp.intrinsicDifficulty : existing.intrinsicDifficulty
    const nextPersonalDifficulty = existing.personalDifficulty
    const effectiveDifficulty = Math.max(nextIntrinsicDifficulty, nextPersonalDifficulty)
    updatedByKey.set(key, {
      ...existing,
      front: imp.front,
      back: imp.back,
      why: imp.why,
      when: String(imp.when ?? existing.when ?? '').trim(),
      tradeoffs: String(imp.tradeoffs ?? existing.tradeoffs ?? '').trim(),
      trap: String(imp.trap ?? existing.trap ?? '').trim(),
      scenario: String(imp.scenario ?? existing.scenario ?? '').trim(),
      topic: imp.topic || existing.topic || '',
      subtopics: Array.isArray(imp.subtopics) ? imp.subtopics : (existing.subtopics || []),
      intrinsicDifficulty: nextIntrinsicDifficulty,
      personalDifficulty: nextPersonalDifficulty,
      difficulty: effectiveDifficulty,
      source: imp.source || existing.source,
    })
  })

  return [
    ...existingCards.map(card => updatedByKey.get(getCardKey(card)) || card),
    ...addedCards,
  ]
}

export function groupSubtopicsByTopic(cards) {
  const topicGroups = new Map()

  cards.forEach(card => {
    const topic = normalizeTopicValue(card.topic)
    if (!topic) return

    if (!topicGroups.has(topic)) topicGroups.set(topic, new Map())
    const subtopicCounts = topicGroups.get(topic)
    const subtopics = Array.isArray(card.subtopics) ? card.subtopics : parseSubtopicsString(card.subtopics)
    subtopics.forEach(subtopic => {
      const normalizedSubtopic = normalizeTopicValue(subtopic)
      if (!normalizedSubtopic || normalizedSubtopic === topic) return
      subtopicCounts.set(normalizedSubtopic, (subtopicCounts.get(normalizedSubtopic) || 0) + 1)
    })
  })

  return [...topicGroups.entries()]
    .map(([topicName, subtopicCounts]) => {
      const subtopicItems = [...subtopicCounts.entries()]
        .map(([subtopic, count]) => ({ subtopic, count }))
        .sort((a, b) => b.count - a.count || a.subtopic.localeCompare(b.subtopic))
      return [topicName, subtopicItems]
    })
    .sort((a, b) => a[0].localeCompare(b[0]))
}

function splitFilterTokens(tokens = []) {
  const includeTopics = new Set()
  const includeSubtopics = []

  tokens.forEach(rawToken => {
    const token = String(rawToken || '').trim()
    if (!token) return

    if (token.startsWith('topic:')) {
      const topic = normalizeTopicValue(token.slice(6))
      if (topic) includeTopics.add(topic)
      return
    }

    if (token.startsWith('sub:')) {
      const payload = token.slice(4)
      const separatorIndex = payload.indexOf(':')
      if (separatorIndex === -1) {
        const subtopic = normalizeTopicValue(payload)
        if (subtopic) includeSubtopics.push({ topic: '', subtopic })
        return
      }
      const topic = normalizeTopicValue(payload.slice(0, separatorIndex))
      const subtopic = normalizeTopicValue(payload.slice(separatorIndex + 1))
      if (subtopic) includeSubtopics.push({ topic, subtopic })
      return
    }

    const fallbackTopic = normalizeTopicValue(token)
    if (fallbackTopic) includeTopics.add(fallbackTopic)
  })

  return { topics: includeTopics, subtopics: includeSubtopics }
}

export function cardMatches(
  card,
  includedFocusTokens,
  excludedFocusTokens,
  search,
  dueOnly,
  difficultyFilter,
  difficultyRange,
  difficultySource,
  weakCardBoost,
) {
  const topic = normalizeTopicValue(card.topic)
  const subtopics = (Array.isArray(card.subtopics) ? card.subtopics : parseSubtopicsString(card.subtopics))
    .map(normalizeTopicValue)
    .filter(Boolean)
  const haystack = `${card.front} ${card.back} ${card.why} ${card.when ?? ''} ${card.tradeoffs ?? ''} ${card.trap ?? ''} ${card.scenario ?? ''} ${topic} ${subtopics.join(' ')}`.toLowerCase()
  const searchOk = !search || haystack.includes(search.toLowerCase())

  const includeTokens = splitFilterTokens(includedFocusTokens)
  const excludeTokens = splitFilterTokens(excludedFocusTokens)

  const includeTopicOk = includeTokens.topics.size === 0 || includeTokens.topics.has(topic)
  const includeSubtopicOk = includeTokens.subtopics.length === 0
    || includeTokens.subtopics.some(item => (!item.topic || item.topic === topic) && subtopics.includes(item.subtopic))
  const includeOk = includeTopicOk && includeSubtopicOk

  const excludedByTopic = excludeTokens.topics.has(topic)
  const excludedBySubtopic = excludeTokens.subtopics.some(item => (!item.topic || item.topic === topic) && subtopics.includes(item.subtopic))
  const excludeOk = !(excludedByTopic || excludedBySubtopic)

  const dueOk = !dueOnly || (card.srs?.dueAt || 0) <= Date.now()
  const effectiveDifficulty = getEffectiveDifficulty(card)
  const exactDifficultyOk = difficultyFilter === 'all' || String(effectiveDifficulty) === difficultyFilter

  const intrinsicDifficulty = getIntrinsicDifficulty(card)
  const personalDifficulty = getPersonalDifficulty(card)

  const min = difficultyRange?.min
  const max = difficultyRange?.max
  const withinRange = typeof min === 'number' && typeof max === 'number'
  if (!withinRange) return searchOk && includeOk && excludeOk && dueOk && exactDifficultyOk

  const baseDifficulty =
    difficultySource === 'intrinsic' ? intrinsicDifficulty
      : difficultySource === 'personal' ? personalDifficulty
        : effectiveDifficulty

  const baseOk = baseDifficulty >= min && baseDifficulty <= max
  const boostOk = (difficultySource === 'personal' ? true : Boolean(weakCardBoost)) && personalDifficulty >= max

  return searchOk && includeOk && excludeOk && dueOk && exactDifficultyOk && (baseOk || boostOk)
}

function buildPerformanceEntries(map) {
  return [...map.values()]
    .map(item => ({
      ...item,
      accuracy: item.seen ? Math.round((item.correct / item.seen) * 100) : 0,
      pressure: item.seen ? Math.round(((item.hard + item.again) / item.seen) * 100) : 0,
    }))
    .sort((a, b) => (a.accuracy + a.pressure) - (b.accuracy + b.pressure))
}

export function getPerformanceByTopic(cards) {
  const map = new Map()
  cards.forEach(card => {
    const topic = normalizeTopicValue(card.topic)
    if (!topic) return
    const entry = map.get(topic) || { topic, seen: 0, correct: 0, hard: 0, again: 0, count: 0 }
    entry.count += 1
    entry.seen += card.stats?.seen || 0
    entry.correct += card.stats?.correct || 0
    entry.hard += card.stats?.hard || 0
    entry.again += card.stats?.again || 0
    map.set(topic, entry)
  })
  return buildPerformanceEntries(map)
}

export function getPerformanceBySubtopic(cards) {
  const map = new Map()
  cards.forEach(card => {
    const subtopics = Array.isArray(card.subtopics) ? card.subtopics : parseSubtopicsString(card.subtopics)
    subtopics.forEach(subtopic => {
      const key = normalizeTopicValue(subtopic)
      if (!key) return
      const entry = map.get(key) || { subtopic: key, seen: 0, correct: 0, hard: 0, again: 0, count: 0 }
      entry.count += 1
      entry.seen += card.stats?.seen || 0
      entry.correct += card.stats?.correct || 0
      entry.hard += card.stats?.hard || 0
      entry.again += card.stats?.again || 0
      map.set(key, entry)
    })
  })
  return buildPerformanceEntries(map)
}

export function getWeakCards(cards) {
  return [...cards]
    .map(card => {
      const seen = card.stats?.seen || 0
      const correct = card.stats?.correct || 0
      const accuracy = seen ? Math.round((correct / seen) * 100) : 0
      const strain = (card.stats?.hard || 0) + (card.stats?.again || 0)
      return { ...card, accuracy, strain }
    })
    .filter(card => card.stats.seen > 0)
    .sort((a, b) => (a.accuracy + a.strain * 8) - (b.accuracy + b.strain * 8))
    .slice(0, 12)
}

export function calculateSrs(previous = defaultSrs(), grade) {
  const now = Date.now()
  let ease = previous.ease || 2.5
  let interval = previous.interval || 0
  let reps = previous.reps || 0
  let lapses = previous.lapses || 0

  if (grade === 'again') {
    lapses += 1
    reps = 0
    interval = 0.15
    ease = Math.max(1.3, ease - 0.2)
  } else if (grade === 'hard') {
    reps += 1
    interval = Math.max(1, interval ? interval * 1.2 : 1)
    ease = Math.max(1.3, ease - 0.15)
  } else if (grade === 'good') {
    reps += 1
    interval = interval === 0 ? 1 : interval === 1 ? 3 : Math.round(interval * ease)
  } else if (grade === 'easy') {
    reps += 1
    ease += 0.15
    interval = interval === 0 ? 3 : Math.max(4, Math.round(interval * (ease + 0.3)))
  }

  return {
    interval,
    ease: Number(ease.toFixed(2)),
    reps,
    lapses,
    dueAt: now + interval * 24 * 60 * 60 * 1000,
    lastReviewedAt: now,
  }
}

function escapeCsv(value = '') {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function deckToCsv(cards, { includeIntrinsicDifficulty = true } = {}) {
  const header = includeIntrinsicDifficulty
    ? 'Front,Back,Why,When,Tradeoffs,Trap,Scenario,Topic,Subtopics,IntrinsicDifficulty'
    : 'Front,Back,Why,When,Tradeoffs,Trap,Scenario,Topic,Subtopics'
  const rows = cards.map(card => {
    const classification = normalizeClassification({
      topic: card.topic,
      subtopics: card.subtopics,
    })
    const base = [
      escapeCsv(card.front),
      escapeCsv(card.back),
      escapeCsv(card.why),
      escapeCsv(card.when ?? ''),
      escapeCsv(card.tradeoffs ?? ''),
      escapeCsv(card.trap ?? ''),
      escapeCsv(card.scenario ?? ''),
      escapeCsv(classification.topic),
      escapeCsv(classification.subtopics.join(',')),
    ]
    if (includeIntrinsicDifficulty) {
      base.push(escapeCsv(String(card.intrinsicDifficulty ?? 2)))
    }
    return base.join(',')
  })
  return [header, ...rows].join('\n')
}

export function exportDeck(cards, name = 'interviewforge-deck') {
  const blob = new Blob([deckToCsv(cards)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slugify(name) || 'interviewforge-deck'}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

