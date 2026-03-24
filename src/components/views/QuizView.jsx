import { useEffect, useRef, useState } from 'react'
import CardGlows from '../CardGlows'
import ReasoningSections from '../ReasoningSections'
import { scoreAnswer, shuffle } from '../../lib/shared'
import './QuizView.scss'

export default function QuizView({ cards }) {
  const [quizDeck, setQuizDeck] = useState(() =>
    cards.length ? shuffle([...cards], Date.now() + Math.random() * 1e6) : [],
  )
  const [quizIndex, setQuizIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const totalRef = useRef(0)
  totalRef.current = quizDeck.length

  useEffect(() => {
    if (!cards.length) {
      setQuizDeck([])
      setQuizIndex(0)
      setUserAnswer('')
      setSubmitted(false)
      setEvaluation(null)
      return
    }
    setQuizDeck(shuffle([...cards], Date.now() + Math.random() * 1e6))
    setQuizIndex(0)
    setUserAnswer('')
    setSubmitted(false)
    setEvaluation(null)
  }, [cards])

  const card = quizDeck[quizIndex] || null
  const questionType = card?.why ? (quizIndex % 2 === 0 ? 'what' : 'why') : 'what'
  const total = quizDeck.length

  function handleSubmit(e) {
    e?.preventDefault()
    if (!card || !userAnswer.trim()) return
    const correct = questionType === 'what' ? card.back : card.why
    setEvaluation(scoreAnswer(userAnswer.trim(), correct))
    setSubmitted(true)
  }

  function handleNext() {
    const n = Math.max(totalRef.current, 1)
    setQuizIndex(prev => (prev + 1) % n)
    setUserAnswer('')
    setSubmitted(false)
    setEvaluation(null)
  }

  if (!total) {
    return (
      <div className="study-panel glass">
        <div className="panel-header">
          <h3>Interview practice</h3>
        </div>
        <div className="empty-state">No cards match this setup yet. Adjust focus areas or practice all cards.</div>
      </div>
    )
  }

  return (
    <div className="study-panel glass">
      <div className="panel-header">
        <h3>Interview practice</h3>
        <span>{total === 0 ? '' : `${quizIndex + 1} / ${total}`}</span>
      </div>
      <div className="quiz-card" key={quizIndex}>
        <CardGlows />
        <div className="flashcard-inner">
          <div className="card-meta">{questionType === 'what' ? 'What' : 'Why'}</div>
          <h4>{card.front}</h4>
          {questionType === 'why' && (
            <div className="quiz-context">
              <p className="quiz-prompt">Why does this matter in an interview answer?</p>
            </div>
          )}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="quiz-form">
              <input
                type="text"
                className="input quiz-input"
                placeholder={questionType === 'what' ? 'Type your best answer...' : 'Explain why it matters...'}
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn primary" disabled={!userAnswer.trim()}>Check response</button>
            </form>
          ) : (
            <div className="quiz-result">
              {evaluation?.level === 'strong' ? (
                <p className="quiz-feedback correct">Strong response.</p>
              ) : evaluation?.level === 'partial' ? (
                <div className="quiz-feedback partial">
                  <p><strong>Good start.</strong> You covered some core ideas.</p>
                  {evaluation.missingKeywords.length ? (
                    <p className="muted small">
                      Try including: {evaluation.missingKeywords.slice(0, 4).join(', ')}.
                    </p>
                  ) : null}
                  <div className="why-box top-gap">
                    <ReasoningSections card={card} includeAnswer={questionType === 'what'} />
                  </div>
                </div>
              ) : (
                <div className="quiz-feedback wrong">
                  <p><strong>Not quite yet.</strong></p>
                  {evaluation?.missingKeywords?.length ? (
                    <p className="muted small">
                      Missing key ideas: {evaluation.missingKeywords.slice(0, 5).join(', ')}.
                    </p>
                  ) : null}
                  <div className="why-box">
                    <ReasoningSections card={card} includeAnswer={questionType === 'what'} />
                  </div>
                </div>
              )}
              <button type="button" className="btn primary top-gap" onClick={handleNext}>Next card</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

