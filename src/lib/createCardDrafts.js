function splitTags(tagsText = '') {
  return String(tagsText)
    .split(/[\s,]+/)
    .map(tag => tag.trim().toLowerCase())
    .filter(Boolean)
}

function normalizeSentence(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function ensurePeriod(value = '') {
  const text = normalizeSentence(value)
  if (!text) return ''
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function deriveTopicTags(topic = '', tagsText = '') {
  const tags = splitTags(tagsText)
  const topicTag = String(topic || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (topicTag && !tags.includes(topicTag)) tags.unshift(topicTag)
  return tags.join(' ')
}

function createDraft(partial, index) {
  return {
    id: `draft-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    selected: true,
    front: partial.front || '',
    back: partial.back || '',
    why: partial.why || '',
    when: partial.when || '',
    tradeoffs: partial.tradeoffs || '',
    trap: partial.trap || '',
    scenario: partial.scenario || '',
    tags: partial.tags || '',
    intrinsicDifficulty: partial.intrinsicDifficulty || 2,
  }
}

export function buildGuidedTopicDrafts(form) {
  const topic = normalizeSentence(form.topic)
  if (!topic) return []

  const tags = deriveTopicTags(topic, form.tags)
  const definition = ensurePeriod(form.definition)
  const whyItMatters = ensurePeriod(form.whyItMatters)
  const whenToUse = ensurePeriod(form.whenToUse)
  const tradeoffs = ensurePeriod(form.tradeoffs)
  const trap = ensurePeriod(form.trap)
  const scenario = ensurePeriod(form.scenario)

  const drafts = []
  if (definition) {
    drafts.push(createDraft({
      front: `What is ${topic}?`,
      back: definition,
      why: whyItMatters,
      tags,
      intrinsicDifficulty: 2,
    }, drafts.length))
  }
  if (whyItMatters) {
    drafts.push(createDraft({
      front: `Why is ${topic} important?`,
      back: whyItMatters,
      why: whyItMatters,
      tags,
      intrinsicDifficulty: 3,
    }, drafts.length))
  }
  if (whenToUse) {
    drafts.push(createDraft({
      front: `When should you use ${topic}?`,
      back: whenToUse,
      why: whyItMatters,
      when: whenToUse,
      tags,
      intrinsicDifficulty: 4,
    }, drafts.length))
  }
  if (tradeoffs) {
    drafts.push(createDraft({
      front: `What tradeoffs come with ${topic}?`,
      back: tradeoffs,
      why: whyItMatters,
      tradeoffs,
      tags,
      intrinsicDifficulty: 4,
    }, drafts.length))
  }
  if (trap) {
    drafts.push(createDraft({
      front: `What is a common interview trap with ${topic}?`,
      back: trap,
      why: whyItMatters,
      trap,
      tags,
      intrinsicDifficulty: 4,
    }, drafts.length))
  }
  if (scenario) {
    drafts.push(createDraft({
      front: `Scenario: how would you apply ${topic}?`,
      back: scenario,
      why: whyItMatters,
      when: whenToUse,
      tradeoffs,
      trap,
      scenario,
      tags,
      intrinsicDifficulty: 5,
    }, drafts.length))
  }

  return drafts.slice(0, 6)
}

function extractTopic(chunk = '') {
  const clean = chunk.replace(/[.:].*$/, '').trim()
  if (!clean) return ''
  const short = clean.split(/\s+/).slice(0, 7).join(' ')
  return short.replace(/^(what|why|when|how)\s+/i, '')
}

function hasSignal(text = '', regex) {
  return regex.test(text.toLowerCase())
}

export function buildPasteNoteDrafts(rawText, tagsText = '') {
  const chunks = String(rawText || '')
    .split('\n')
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .filter(line => line.length >= 24)
    .slice(0, 12)

  const drafts = []
  chunks.forEach(chunk => {
    const topic = extractTopic(chunk)
    if (!topic) return
    const tags = deriveTopicTags(topic, tagsText)
    const normalized = ensurePeriod(chunk)
    drafts.push(createDraft({
      front: `What is ${topic}?`,
      back: normalized,
      tags,
      intrinsicDifficulty: 2,
    }, drafts.length))

    if (hasSignal(chunk, /\b(important|because|helps|so that|benefit|matters)\b/)) {
      drafts.push(createDraft({
        front: `Why does ${topic} matter?`,
        back: normalized,
        why: normalized,
        tags,
        intrinsicDifficulty: 3,
      }, drafts.length))
    }

    if (hasSignal(chunk, /\b(when|if|only when|use for|best for|good for)\b/)) {
      drafts.push(createDraft({
        front: `When should you use ${topic}?`,
        back: normalized,
        when: normalized,
        tags,
        intrinsicDifficulty: 4,
      }, drafts.length))
    }

    if (hasSignal(chunk, /\b(tradeoff|trade-off|pros|cons|but|however|cost)\b/)) {
      drafts.push(createDraft({
        front: `What tradeoffs come with ${topic}?`,
        back: normalized,
        tradeoffs: normalized,
        tags,
        intrinsicDifficulty: 4,
      }, drafts.length))
    }
  })

  return drafts.slice(0, 6)
}

export function buildQuickTopicDrafts(topic, context = '') {
  const t = normalizeSentence(topic)
  if (!t) return []
  const ctx = normalizeSentence(context)
  const tags = deriveTopicTags(t, '')
  const ctxSuffix = ctx ? ` ${ctx}` : ''

  const templates = [
    {
      front: `What is ${t}?`,
      back: `${t} is a concept used in software engineering.${ctxSuffix}`,
      why: `Understanding ${t} helps engineers make better design decisions.`,
      intrinsicDifficulty: 2,
    },
    {
      front: `Why is ${t} important?`,
      back: `${t} matters because it affects reliability, performance, or maintainability.${ctxSuffix}`,
      why: `Interviewers test whether you understand the reasoning behind ${t}, not just the definition.`,
      intrinsicDifficulty: 3,
    },
    {
      front: `When would you use ${t}?`,
      back: `Use ${t} when the problem requires its specific strengths.${ctxSuffix}`,
      when: `When the system needs the properties that ${t} provides.`,
      intrinsicDifficulty: 3,
    },
    {
      front: `What are the tradeoffs of ${t}?`,
      back: `${t} introduces tradeoffs between complexity, performance, and simplicity.${ctxSuffix}`,
      tradeoffs: `Weigh the cost of adopting ${t} against the problem it solves.`,
      intrinsicDifficulty: 4,
    },
    {
      front: `How would you explain ${t} to a non-technical stakeholder?`,
      back: `Simplify ${t} by focusing on the problem it solves and the benefit it provides.${ctxSuffix}`,
      why: `Senior engineers communicate across audiences, not just to other engineers.`,
      intrinsicDifficulty: 4,
    },
    {
      front: `What mistakes do engineers commonly make with ${t}?`,
      back: `Common mistakes include misapplying ${t} or using it without understanding the tradeoffs.${ctxSuffix}`,
      trap: `Interviewers look for awareness of pitfalls, not just textbook knowledge.`,
      intrinsicDifficulty: 5,
    },
  ]

  return templates.map((partial, i) => createDraft({ ...partial, tags }, i))
}

export function normalizeDraftForSave(draft) {
  return {
    front: normalizeSentence(draft.front),
    back: normalizeSentence(draft.back),
    why: normalizeSentence(draft.why),
    when: normalizeSentence(draft.when),
    tradeoffs: normalizeSentence(draft.tradeoffs),
    trap: normalizeSentence(draft.trap),
    scenario: normalizeSentence(draft.scenario),
    tags: splitTags(draft.tags),
    intrinsicDifficulty: Number(draft.intrinsicDifficulty || 2),
  }
}
