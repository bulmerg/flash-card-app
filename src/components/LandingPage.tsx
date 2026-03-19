import './LandingPage.scss'

const LANDING_ACTIONS = [
  {
    mode: 'study',
    label: 'Start Studying',
    helper: 'Jump into your starter deck',
    icon: '▶',
  },
  {
    mode: 'create',
    label: 'Generate Cards',
    helper: 'Create cards from a topic or notes',
    icon: '➕',
  },
  {
    mode: 'interview',
    label: 'Interview Mode',
    helper: 'Practice explaining answers out loud',
    icon: '🎯',
  },
]

export default function LandingPage({ hasCards, onSelectPrimaryAction, onSelectImport }) {
  return (
    <div className="onboarding-shell">
      <section className="landing-card glass">
        <header className="landing-header">
          <div className="eyebrow">InterviewForge</div>
          <h1>Stop memorizing. Start thinking like a senior engineer.</h1>
          <p className="muted">
            Practice what, why, when, and tradeoffs — so you can explain, not just recall.
          </p>
        </header>

        <div className="landing-example" aria-label="Example interview reasoning preview">
          <div className="landing-example-line">
            <span className="landing-example-label">Q</span>
            <span>What is React reconciliation?</span>
          </div>
          <div className="landing-example-line">
            <span className="landing-example-label">Why it matters</span>
            <span>Prevents unnecessary DOM updates</span>
          </div>
          <div className="landing-example-line">
            <span className="landing-example-label">Tradeoff</span>
            <span>Extra computation vs direct updates</span>
          </div>
        </div>

        <div className="landing-actions">
          {LANDING_ACTIONS.map(action => (
            <button
              key={action.mode}
              type="button"
              className="landing-action-btn"
              onClick={() => onSelectPrimaryAction(action.mode)}
            >
              <span className="landing-action-icon" aria-hidden="true">{action.icon}</span>
              <span className="landing-action-copy">
                <span className="landing-action-label">{action.label}</span>
                <span className="landing-action-helper muted">{action.helper}</span>
              </span>
            </button>
          ))}
        </div>

        <button type="button" className="btn smallish landing-import-btn" onClick={onSelectImport}>
          Import your own cards (CSV)
        </button>

        <p className="landing-status muted">
          {hasCards
            ? 'Start with a prebuilt senior-level deck — no setup required.'
            : 'Start by creating or importing your first deck.'}
        </p>
      </section>
    </div>
  )
}
