import TagPanelView from './views/TagPanel'
import { useAppContext } from '../context/AppContext'

export default function TagGroups() {
  const { focusAreaGroups, includedFocusTokens, excludedFocusTokens, toggleFocusToken, toggleFocusGroup } = useAppContext()
  return (
    <TagPanelView
      focusAreaGroups={focusAreaGroups}
      includedFocusTokens={includedFocusTokens}
      excludedFocusTokens={excludedFocusTokens}
      toggleFocusToken={toggleFocusToken}
      toggleFocusGroup={toggleFocusGroup}
    />
  )
}

