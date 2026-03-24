import { describe, expect, it } from 'vitest'
import { calculateSrs, cardMatches, deckToCsv, dedupeCards, groupSubtopicsByTopic, parseDeckCsv } from './deckEngine'

describe('deckEngine', () => {
  it('parses Topic + Subtopics CSV and defaults optional interview fields', () => {
    const csv = [
      'Front,Back,Why,When,Tradeoffs,Trap,Scenario,Topic,Subtopics,IntrinsicDifficulty',
      '"What is idempotency?","Same result for retries","Safe retries","","","","","api","reliability,retries",3',
    ].join('\n')

    const cards = parseDeckCsv(csv, 'Legacy')
    expect(cards).toHaveLength(1)
    expect(cards[0].front).toBe('What is idempotency?')
    expect(cards[0].topic).toBe('api')
    expect(cards[0].subtopics).toEqual(['reliability', 'retries'])
    expect(cards[0].when).toBe('')
    expect(cards[0].tradeoffs).toBe('')
    expect(cards[0].trap).toBe('')
    expect(cards[0].scenario).toBe('')
    expect(cards[0].intrinsicDifficulty).toBe(3)
  })

  it('returns empty list for old tags-only CSV schema', () => {
    const csv = [
      'Front,Back,Why,Tags,IntrinsicDifficulty',
      '"What is CAP theorem?","Consistency vs availability under partition","Distributed tradeoff","distributed-systems architecture",4',
    ].join('\n')

    expect(parseDeckCsv(csv, 'OldFive')).toEqual([])
  })

  it('parses new Topic + Subtopics columns by header name', () => {
    const csv = [
      'Front,Back,Why,When,Tradeoffs,Trap,Scenario,Topic,Subtopics,IntrinsicDifficulty',
      '"What is CQRS?","Separate reads/writes","Independent scaling","Read-heavy systems","Added complexity","Mixing models","Design read/write stores","system-design","cqrs,architecture",4',
    ].join('\n')

    const cards = parseDeckCsv(csv, 'Extended')
    expect(cards).toHaveLength(1)
    expect(cards[0].intrinsicDifficulty).toBe(4)
    expect(cards[0].when).toContain('Read-heavy')
    expect(cards[0].tradeoffs).toContain('complexity')
    expect(cards[0].trap).toContain('Mixing')
    expect(cards[0].scenario).toContain('read/write')
    expect(cards[0].topic).toEqual('system-design')
    expect(cards[0].subtopics).toEqual(['cqrs', 'architecture'])
  })

  it('normalizes cards with missing optional fields during dedupe', () => {
    const deduped = dedupeCards([
      { front: 'Q1', back: 'A1', why: 'W1', topic: 'database', subtopics: ['indexing'] },
      { front: 'Q1', back: 'A1', why: 'W1', topic: 'database', subtopics: ['indexing'] },
    ])

    expect(deduped).toHaveLength(1)
    expect(deduped[0].when).toBe('')
    expect(deduped[0].tradeoffs).toBe('')
    expect(deduped[0].trap).toBe('')
    expect(deduped[0].scenario).toBe('')
  })

  it('includes new interview fields in search matching', () => {
    const card = {
      front: 'What is idempotency?',
      back: 'Same result on retries',
      why: 'Safe retries',
      when: 'Use for network retries',
      tradeoffs: 'Requires idempotency keys',
      trap: 'Confusing with dedup at transport only',
      scenario: 'Payment endpoint retries after timeout',
      topic: 'api',
      subtopics: ['retries'],
      srs: { dueAt: Date.now() - 1000 },
      intrinsicDifficulty: 3,
      personalDifficulty: 2,
      difficulty: 3,
    }
    const match = cardMatches(
      card,
      [],
      [],
      'payment endpoint retries',
      false,
      'all',
      { min: 1, max: 5 },
      'effective',
      false,
    )
    expect(match).toBe(true)
  })

  it('applies expected SRS behavior across grades', () => {
    const previous = {
      interval: 3,
      ease: 2.5,
      reps: 3,
      lapses: 0,
      dueAt: Date.now(),
      lastReviewedAt: Date.now() - 1000,
    }
    const again = calculateSrs(previous, 'again')
    const hard = calculateSrs(previous, 'hard')
    const good = calculateSrs(previous, 'good')
    const easy = calculateSrs(previous, 'easy')

    expect(again.interval).toBeCloseTo(0.15)
    expect(again.ease).toBeCloseTo(2.3)
    expect(hard.interval).toBeCloseTo(3.6)
    expect(good.interval).toBe(Math.round(3 * 2.5))
    expect(easy.interval).toBeGreaterThan(good.interval)
    expect(easy.ease).toBeGreaterThan(good.ease)
  })

  it('exports CSV with interview columns', () => {
    const csv = deckToCsv([
      {
        front: 'Q',
        back: 'A',
        why: 'W',
        when: 'When',
        tradeoffs: 'Trade',
        trap: 'Trap',
        scenario: 'Scenario',
        topic: 'database',
        subtopics: ['indexing', 'performance'],
        intrinsicDifficulty: 4,
      },
    ])
    expect(csv.split('\n')[0]).toBe('Front,Back,Why,When,Tradeoffs,Trap,Scenario,Topic,Subtopics,IntrinsicDifficulty')
    expect(csv).toContain('"database"')
    expect(csv).toContain('"indexing,performance"')
    expect(csv).toContain('"Scenario"')
  })

  it('groups subtopics under topic', () => {
    const grouped = groupSubtopicsByTopic([
      { topic: 'frontend', subtopics: ['react', 'performance'] },
      { topic: 'frontend', subtopics: ['react', 'css', 'frontend'] },
      { topic: 'backend', subtopics: ['api', 'database'] },
    ])

    expect(grouped).toEqual([
      ['backend', [
        { subtopic: 'api', count: 1 },
        { subtopic: 'database', count: 1 },
      ]],
      ['frontend', [
        { subtopic: 'react', count: 2 },
        { subtopic: 'css', count: 1 },
        { subtopic: 'performance', count: 1 },
      ]],
    ])
  })

  it('supports topic/subtopic filter tokens', () => {
    const card = {
      front: 'Q',
      back: 'A',
      why: 'W',
      when: '',
      tradeoffs: '',
      trap: '',
      scenario: '',
      topic: 'database',
      subtopics: ['indexing', 'performance'],
      srs: { dueAt: Date.now() - 1000 },
      intrinsicDifficulty: 3,
      personalDifficulty: 2,
      difficulty: 3,
    }

    const includeMatch = cardMatches(card, ['topic:database', 'sub:database:indexing'], [], '', false, 'all', { min: 1, max: 5 }, 'effective', false)
    const excludeMiss = cardMatches(card, [], ['sub:database:indexing'], '', false, 'all', { min: 1, max: 5 }, 'effective', false)

    expect(includeMatch).toBe(true)
    expect(excludeMiss).toBe(false)
  })
})
