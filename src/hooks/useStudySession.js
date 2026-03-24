import { useEffect, useMemo, useRef, useState } from 'react'
import {
  calculateSrs,
  cardMatches,
  getPerformanceBySubtopic,
  getPerformanceByTopic,
  groupSubtopicsByTopic,
  getWeakCards,
} from '../lib/deckEngine'
import { clampDifficulty, getIntrinsicDifficulty, getPersonalDifficulty, shuffle } from '../lib/shared'

export default function useStudySession({
  cards,
  setCards,
  simCount,
  viewMode,
  difficultyTargetMin,
  difficultyTargetMax,
  difficultySource,
  weakCardBoost,
}) {
  const [includedFocusTokens, setIncludedFocusTokens] = useState([])
  const [excludedFocusTokens, setExcludedFocusTokens] = useState([])
  const [search, setSearch] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [dueOnly, setDueOnly] = useState(true)
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const revealAtRef = useRef(null)

  useEffect(() => {
    revealAtRef.current = flipped ? Date.now() : null
  }, [flipped])

  const focusAreaGroups = useMemo(() => groupSubtopicsByTopic(cards), [cards])
  const topicPerformance = useMemo(() => getPerformanceByTopic(cards), [cards])
  const subtopicPerformance = useMemo(() => getPerformanceBySubtopic(cards), [cards])
  const weakCards = useMemo(() => getWeakCards(cards), [cards])

  const filteredCards = useMemo(() => {
    const selected = cards.filter(card => cardMatches(
      card,
      includedFocusTokens,
      excludedFocusTokens,
      search,
      dueOnly && ['study', 'quiz', 'interview'].includes(viewMode),
      difficultyFilter,
      { min: difficultyTargetMin, max: difficultyTargetMax },
      difficultySource,
      weakCardBoost,
    ))
    if (!shuffleSeed) return selected
    return shuffle([...selected], shuffleSeed)
  }, [
    cards,
    includedFocusTokens,
    excludedFocusTokens,
    search,
    dueOnly,
    viewMode,
    difficultyFilter,
    difficultyTargetMin,
    difficultyTargetMax,
    difficultySource,
    weakCardBoost,
    shuffleSeed,
  ])

  const simulationCards = useMemo(() => {
    const base = cards.filter(card => cardMatches(
      card,
      includedFocusTokens,
      excludedFocusTokens,
      search,
      dueOnly,
      difficultyFilter,
      { min: difficultyTargetMin, max: difficultyTargetMax },
      difficultySource,
      weakCardBoost,
    ))
    return shuffle([...base], simCount * 811 + 7).slice(0, simCount)
  }, [
    cards,
    includedFocusTokens,
    excludedFocusTokens,
    search,
    dueOnly,
    difficultyFilter,
    simCount,
    difficultyTargetMin,
    difficultyTargetMax,
    difficultySource,
    weakCardBoost,
  ])

  const quizCards = useMemo(() => {
    const selected = cards.filter(card => cardMatches(
      card,
      includedFocusTokens,
      excludedFocusTokens,
      search,
      dueOnly,
      difficultyFilter,
      { min: difficultyTargetMin, max: difficultyTargetMax },
      difficultySource,
      weakCardBoost,
    ))
    return shuffle([...selected], shuffleSeed + 99)
  }, [
    cards,
    includedFocusTokens,
    excludedFocusTokens,
    search,
    dueOnly,
    shuffleSeed,
    difficultyFilter,
    difficultyTargetMin,
    difficultyTargetMax,
    difficultySource,
    weakCardBoost,
  ])

  const activeCard = filteredCards[currentIndex] || null
  const previousActiveCardIdRef = useRef(null)

  useEffect(() => {
    const nextId = activeCard?.id ?? null
    if (previousActiveCardIdRef.current !== nextId) {
      setFlipped(false)
      previousActiveCardIdRef.current = nextId
    }
  }, [activeCard?.id])

  useEffect(() => {
    if (currentIndex >= filteredCards.length) setCurrentIndex(0)
  }, [filteredCards.length, currentIndex])

  function toggleFocusToken(token, mode = 'include') {
    if (mode === 'include') {
      setExcludedFocusTokens(prev => prev.filter(item => item !== token))
      setIncludedFocusTokens(prev => (prev.includes(token) ? prev.filter(item => item !== token) : [...prev, token]))
    } else {
      setIncludedFocusTokens(prev => prev.filter(item => item !== token))
      setExcludedFocusTokens(prev => (prev.includes(token) ? prev.filter(item => item !== token) : [...prev, token]))
    }
    setCurrentIndex(0)
  }

  function toggleFocusGroup(tokenList, mode = 'include') {
    const uniqueTokens = [...new Set((tokenList || []).filter(Boolean))]
    if (uniqueTokens.length === 0) return

    if (mode === 'include') {
      setExcludedFocusTokens(prev => prev.filter(token => !uniqueTokens.includes(token)))
      setIncludedFocusTokens(prev => {
        const allIncluded = uniqueTokens.every(token => prev.includes(token))
        if (allIncluded) return prev.filter(token => !uniqueTokens.includes(token))
        const next = [...prev]
        uniqueTokens.forEach(token => {
          if (!next.includes(token)) next.push(token)
        })
        return next
      })
    } else {
      setIncludedFocusTokens(prev => prev.filter(token => !uniqueTokens.includes(token)))
      setExcludedFocusTokens(prev => {
        const allExcluded = uniqueTokens.every(token => prev.includes(token))
        if (allExcluded) return prev.filter(token => !uniqueTokens.includes(token))
        const next = [...prev]
        uniqueTokens.forEach(token => {
          if (!next.includes(token)) next.push(token)
        })
        return next
      })
    }
    setCurrentIndex(0)
  }

  function reviewCard(grade) {
    if (!activeCard) return
    const nextSrs = calculateSrs(activeCard.srs, grade)

    let personalGrade = grade
    if (revealAtRef.current) {
      const elapsedMs = Date.now() - revealAtRef.current
      const hesitateThresholdMs = 8000
      if (elapsedMs > hesitateThresholdMs) {
        if (grade === 'good') personalGrade = 'hard'
        if (grade === 'easy') personalGrade = 'good'
      }
    }

    setCards(prev => prev.map(card => {
      if (card.id !== activeCard.id) return card
      const seen = (card.stats?.seen || 0) + 1
      const correct = (card.stats?.correct || 0) + (grade === 'good' || grade === 'easy' ? 1 : 0)
      const hard = (card.stats?.hard || 0) + (grade === 'hard' ? 1 : 0)
      const again = (card.stats?.again || 0) + (grade === 'again' ? 1 : 0)

      const intrinsicDifficulty = getIntrinsicDifficulty(card)
      let personalDifficulty = getPersonalDifficulty(card)
      if (personalGrade === 'again' || personalGrade === 'hard') {
        personalDifficulty = Math.min(5, personalDifficulty + 1)
      } else if (personalGrade === 'good' || personalGrade === 'easy') {
        personalDifficulty = Math.max(1, personalDifficulty - 1)
      }

      return {
        ...card,
        status: grade === 'again' || grade === 'hard' ? 'review' : 'know',
        personalDifficulty,
        difficulty: Math.max(intrinsicDifficulty, personalDifficulty),
        stats: { seen, correct, hard, again },
        srs: nextSrs,
        history: [...(card.history || []), { at: Date.now(), grade }].slice(-30),
      }
    }))
    setFlipped(false)
    setCurrentIndex(prev => (prev + 1) % Math.max(filteredCards.length, 1))
  }

  function setCardDifficulty(delta) {
    if (!activeCard) return
    setCards(prev => prev.map(card => {
      if (card.id !== activeCard.id) return card
      const intrinsicDifficulty = getIntrinsicDifficulty(card)
      const nextIntrinsic = clampDifficulty(intrinsicDifficulty + delta)
      const personalDifficulty = getPersonalDifficulty(card)
      return {
        ...card,
        intrinsicDifficulty: nextIntrinsic,
        difficulty: Math.max(nextIntrinsic, personalDifficulty),
      }
    }))
  }

  function toggleStar() {
    if (!activeCard) return
    setCards(prev => prev.map(card => (card.id === activeCard.id ? { ...card, starred: !card.starred } : card)))
  }

  function nextCard() {
    if (filteredCards.length === 0) return
    setFlipped(false)
    setCurrentIndex(prev => (prev + 1) % filteredCards.length)
  }

  function prevCard() {
    if (filteredCards.length === 0) return
    setFlipped(false)
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length)
  }

  function resetSessionState() {
    setIncludedFocusTokens([])
    setExcludedFocusTokens([])
    setSearch('')
    setCurrentIndex(0)
    setFlipped(false)
    setShuffleSeed(0)
    setDifficultyFilter('all')
  }

  return {
    includedFocusTokens,
    setIncludedFocusTokens,
    excludedFocusTokens,
    setExcludedFocusTokens,
    search,
    setSearch,
    currentIndex,
    setCurrentIndex,
    flipped,
    setFlipped,
    shuffleSeed,
    setShuffleSeed,
    dueOnly,
    setDueOnly,
    difficultyFilter,
    setDifficultyFilter,
    focusAreaGroups,
    topicPerformance,
    subtopicPerformance,
    weakCards,
    filteredCards,
    simulationCards,
    quizCards,
    activeCard,
    toggleFocusToken,
    toggleFocusGroup,
    reviewCard,
    setCardDifficulty,
    toggleStar,
    nextCard,
    prevCard,
    resetSessionState,
  }
}

