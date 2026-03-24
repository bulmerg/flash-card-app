import './TagPanel.scss'

function topicToken(topic) {
  return `topic:${topic}`
}

function subtopicToken(topic, subtopic) {
  return `sub:${topic}:${subtopic}`
}

function displayFilterToken(token) {
  const value = String(token || '')
  if (value.startsWith('topic:')) return value.slice(6)
  if (value.startsWith('sub:')) return value.slice(4).replace(':', ' / ')
  return value
}

export default function TagPanel({
  focusAreaGroups,
  includedFocusTokens,
  excludedFocusTokens,
  toggleFocusToken,
  toggleFocusGroup,
}) {
  const selectedCount = includedFocusTokens.length
  const excludedCount = excludedFocusTokens.length

  return (
    <div className="tag-panel glass">
      <div className="panel-header">
        <h3>Focus areas</h3>
        <span>Select topics and subtopics · minus to exclude</span>
      </div>
      <div className="tag-summary" role="status" aria-live="polite">
        <span className="tag-summary-pill include">Selected: {selectedCount}</span>
        <span className="tag-summary-pill exclude">Excluded: {excludedCount}</span>
      </div>
      <div className="active-filters">
        {selectedCount === 0 && excludedCount === 0 ? (
          <span className="active-filters-empty">No focus filters yet</span>
        ) : null}
        {includedFocusTokens.map(token => (
          <span key={`i-${token}`} className="filter-chip include">+ {displayFilterToken(token)}</span>
        ))}
        {excludedFocusTokens.map(token => (
          <span key={`e-${token}`} className="filter-chip exclude">− {displayFilterToken(token)}</span>
        ))}
      </div>
      <div className="tag-groups-scroll">
        {focusAreaGroups.map(([groupName, subtopics]) => {
          const topicIncludeToken = topicToken(groupName)
          const topicExcludeToken = topicIncludeToken
          const isTopicIncluded = includedFocusTokens.includes(topicIncludeToken)
          const isTopicExcluded = excludedFocusTokens.includes(topicExcludeToken)
          const includedSubtopics = subtopics.filter(item => includedFocusTokens.includes(subtopicToken(groupName, item.subtopic))).length
          const excludedSubtopics = subtopics.filter(item => excludedFocusTokens.includes(subtopicToken(groupName, item.subtopic))).length
          const allIncluded = isTopicIncluded && includedSubtopics === subtopics.length
          const mostlyIncluded = isTopicIncluded || includedSubtopics >= Math.ceil(Math.max(1, subtopics.length * 0.6))
          const partiallyIncluded = !isTopicIncluded && includedSubtopics > 0

          return (
            <section
              key={groupName}
              className={`tag-group-block ${allIncluded ? 'group-selected' : ''} ${mostlyIncluded ? 'group-mostly' : ''} ${partiallyIncluded ? 'group-partial' : ''} ${isTopicExcluded || excludedSubtopics > 0 ? 'group-has-excluded' : ''}`}
            >
              <div className="tag-group-head">
                <div className="tag-group-title-actions">
                  <button
                    type="button"
                    className="tag-group-title-btn"
                    onClick={() => toggleFocusGroup([topicIncludeToken], 'include')}
                    title={`Include topic ${groupName}`}
                  >
                    {groupName}
                  </button>
                  <button
                    type="button"
                    className="tag-group-exclude-btn"
                    onClick={() => toggleFocusToken(topicExcludeToken, 'exclude')}
                    title={`Exclude topic ${groupName}`}
                    aria-label={`Exclude topic ${groupName}`}
                  >
                    −
                  </button>
                </div>
                <span className="tag-group-count">
                  {isTopicIncluded ? 'topic selected' : `${subtopics.length} subtopics`}
                  {includedSubtopics > 0 ? ` · ${includedSubtopics} selected` : ''}
                  {excludedSubtopics > 0 ? ` · ${excludedSubtopics} excluded` : ''}
                </span>
              </div>
              <div className="tag-cloud">
                {subtopics.map(({ subtopic, count }) => {
                  const includeToken = subtopicToken(groupName, subtopic)
                  const excludeToken = includeToken
                  const include = includedFocusTokens.includes(includeToken)
                  const exclude = excludedFocusTokens.includes(excludeToken)
                  return (
                    <div key={subtopic} className={`tag-card ${include ? 'include' : ''} ${exclude ? 'exclude' : ''} ${!include && !exclude ? 'neutral' : ''}`}>
                      <button className="tag-main" onClick={() => toggleFocusToken(includeToken, 'include')} title={`Include ${groupName}/${subtopic}`}>
                        <span className="tag-label">{subtopic}</span>
                        <strong className="tag-count">{count}</strong>
                      </button>
                      <button className="tag-minus" onClick={() => toggleFocusToken(excludeToken, 'exclude')} title={`Exclude ${groupName}/${subtopic}`} aria-label={`Exclude ${groupName}/${subtopic}`}>−</button>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

