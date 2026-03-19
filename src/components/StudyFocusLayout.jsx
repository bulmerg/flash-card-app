import './StudyFocusLayout.scss'

export default function StudyFocusLayout({
  deckName,
  currentIndex,
  total,
  onAdjustPractice,
  onExitFocusMode,
  children,
}) {
  const progressLabel = total === 0 ? 'No cards' : `${currentIndex + 1} / ${total}`

  return (
    <div className="focus-layout">
      <header className="focus-topbar glass">
        <div className="focus-title">
          <div className="eyebrow">InterviewForge</div>
          <strong>{deckName}</strong>
        </div>

        <div className="focus-topbar-actions">
          <span className="focus-progress">{progressLabel}</span>
          <button type="button" className="btn smallish" onClick={onAdjustPractice}>
            Adjust Practice
          </button>
          <button type="button" className="btn smallish" onClick={onExitFocusMode}>
            Exit Focus Mode
          </button>
        </div>
      </header>

      <div className="focus-main">
        {children}
      </div>
    </div>
  )
}
