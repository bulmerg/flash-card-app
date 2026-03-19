import StudyViewComponent from './views/StudyView'
import StudyFocusLayout from './StudyFocusLayout'
import { useAppContext } from '../context/AppContext'

export default function StudyMode({ studyViewMode = 'setup', onEnterFocusMode, onExitFocusMode, onAdjustPractice }) {
  const {
    activeCard,
    currentIndex,
    filteredCount,
    flipped,
    onFlip,
    onPrev,
    onNext,
    onReview,
    onStar,
    onCardDifficulty,
    difficultyTargetMin,
    difficultyTargetMax,
    deckName,
  } = useAppContext()

  const studyView = (
    <StudyViewComponent
      activeCard={activeCard}
      currentIndex={currentIndex}
      total={filteredCount}
      flipped={flipped}
      onFlip={onFlip}
      onPrev={onPrev}
      onNext={onNext}
      onReview={onReview}
      onStar={onStar}
      onCardDifficulty={onCardDifficulty}
      difficultyTargetMin={difficultyTargetMin}
      difficultyTargetMax={difficultyTargetMax}
      studyViewMode={studyViewMode}
      onEnterFocusMode={onEnterFocusMode}
    />
  )

  if (studyViewMode === 'focus') {
    return (
      <StudyFocusLayout
        deckName={deckName}
        currentIndex={currentIndex}
        total={filteredCount}
        onAdjustPractice={onAdjustPractice}
        onExitFocusMode={onExitFocusMode}
      >
        {studyView}
      </StudyFocusLayout>
    )
  }

  return (
    studyView
  )
}

