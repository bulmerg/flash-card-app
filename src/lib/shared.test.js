import { describe, expect, it } from 'vitest'
import { scoreAnswer } from './shared'

describe('scoreAnswer', () => {
  it('marks exact matches as strong', () => {
    const result = scoreAnswer(
      'Write-heavy systems need fewer indexes to reduce write latency.',
      'Write-heavy systems need fewer indexes to reduce write latency.',
    )
    expect(result.level).toBe('strong')
    expect(result.isCorrect).toBe(true)
  })

  it('accepts close paraphrases with key ideas as strong or partial', () => {
    const result = scoreAnswer(
      'Too many indexes slow writes because each update touches many indexes and increases contention.',
      'Write-heavy systems minimize indexes because each write updates indexes, adding latency and contention.',
    )
    expect(['strong', 'partial']).toContain(result.level)
    expect(result.keywordCoverage).toBeGreaterThan(0.35)
  })

  it('flags unrelated answers as weak', () => {
    const result = scoreAnswer(
      'Indexes are mostly for UI rendering speed.',
      'Write-heavy systems minimize indexes because each write updates indexes, adding latency and contention.',
    )
    expect(result.level).toBe('weak')
    expect(result.isCorrect).toBe(false)
  })

  it('applies configured synonym aliases during scoring', () => {
    const result = scoreAnswer(
      'Keep response time low and avoid lock contention by reducing unnecessary indexes.',
      'Write-heavy systems minimize indexes because each write updates indexes, adding latency and contention.',
    )
    expect(result.matchedKeywords).toContain('latency')
    expect(result.matchedKeywords).toContain('contention')
    expect(result.keywordCoverage).toBeGreaterThan(0.25)
  })
})
