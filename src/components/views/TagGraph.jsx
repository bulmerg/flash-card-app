import './TagGraph.scss'

export default function TagGraph({ focusAreaGroups, performance }) {
  const perfMap = new Map(performance.map(item => [item.topic, item.accuracy || 0]))
  const width = 760
  const height = 300
  const centerX = 380
  const centerY = 150
  const radius = 100
  const topics = focusAreaGroups
    .map(([group, items]) => ({ topic: group, subtopicCount: items.length }))
    .slice(0, 16)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="tag-graph">
      <defs>
        <linearGradient id="graphStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8ef0da" />
          <stop offset="100%" stopColor="#6ea8fe" />
        </linearGradient>
      </defs>
      <circle cx={centerX} cy={centerY} r="42" fill="rgba(110,168,254,0.18)" stroke="rgba(110,168,254,0.45)" />
      <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle" fill="#edf3ff" fontSize="14">Topics</text>
      {topics.map((topicItem, idx) => {
        const angle = (Math.PI * 2 * idx) / Math.max(topics.length, 1)
        const x = centerX + Math.cos(angle) * radius * 1.6
        const y = centerY + Math.sin(angle) * radius
        const accuracy = perfMap.get(topicItem.topic) || 0
        const size = 12 + Math.max(0, accuracy / 10)
        return (
          <g key={topicItem.topic}>
            <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="url(#graphStroke)" strokeOpacity="0.45" />
            <circle cx={x} cy={y} r={size} fill="rgba(142,240,218,0.15)" stroke="rgba(142,240,218,0.4)" />
            <text x={x} y={y - size - 6} textAnchor="middle" fill="#dfe8ff" fontSize="11">{topicItem.topic}</text>
            <text x={x} y={y + 1} textAnchor="middle" fill="#8ef0da" fontSize="10">{accuracy}%</text>
            <text x={x} y={y + 12} textAnchor="middle" fill="#a7b6d8" fontSize="9">{topicItem.subtopicCount} subs</text>
          </g>
        )
      })}
    </svg>
  )
}

