interface Circlee {
  initial: string
  name: string
  email: string
  userId: string
  km: number
  level: number
  circles: number
  color: string
}

interface Props {
  circlee: Circlee
  darkMode: boolean
  onBack: () => void
}

export default function CircleeProfileView({ circlee, darkMode, onBack }: Props) {
  const bg = darkMode ? '#1A1A1A' : '#F4F0DD'
  const surface = darkMode ? '#24221B' : '#FAF8F0'
  const text = darkMode ? '#FAF8F0' : '#24221B'
  const muted = darkMode ? '#B8B6AC' : '#605E55'
  const border = darkMode ? 'rgba(250,248,240,0.08)' : 'rgba(36,34,27,0.08)'

  const stats = [
    { icon: '🏃', value: circlee.km, label: 'Kilometres' },
    { icon: '⭐', value: `${circlee.level}th`, label: 'Level' },
    { icon: '👥', value: circlee.circles, label: 'Circles' },
  ]

  return (
    <div style={{ flex: 1, backgroundColor: bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Hero photo area */}
      <div style={{
        height: 220,
        backgroundColor: circlee.color + '30',
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }} viewBox="0 0 390 220">
          <circle cx="80" cy="60" r="120" fill={circlee.color} />
          <circle cx="320" cy="180" r="100" fill={circlee.color} />
        </svg>

        {/* Large avatar */}
        <div style={{
          position: 'absolute',
          bottom: -36,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 88,
          height: 88,
          borderRadius: 28,
          backgroundColor: circlee.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 42,
          fontWeight: 600,
          color: '#FAF8F0',
          border: `4px solid ${darkMode ? '#1A1A1A' : '#F4F0DD'}`,
          boxShadow: `0 8px 32px ${circlee.color}60`,
          zIndex: 2,
        }}>
          {circlee.initial}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* Name + details */}
        <div style={{ textAlign: 'center', padding: '50px 24px 28px' }}>
          <div style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 30, fontWeight: 600, color: text, marginBottom: 6,
          }}>
            {circlee.name}
          </div>
          <div style={{ fontSize: 13, color: muted, marginBottom: 6 }}>{circlee.email}</div>
          <div style={{ fontSize: 12, color: muted }}>
            User ID:{' '}
            <span style={{
              color: '#A88AED',
              fontWeight: 700,
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
            }}>
              {circlee.userId}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          margin: '0 20px 24px',
          backgroundColor: surface,
          borderRadius: 22,
          border: `1px solid ${border}`,
          display: 'flex',
          overflow: 'hidden',
        }}>
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                padding: '20px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                borderRight: i < stats.length - 1 ? `1px solid ${border}` : 'none',
              }}
            >
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <div style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 26, fontWeight: 700, color: text, lineHeight: 1,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: muted, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent activities teaser */}
        <div style={{ margin: '0 20px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Recent
          </div>
          <div style={{
            backgroundColor: surface,
            borderRadius: 18,
            border: `1px solid ${border}`,
            overflow: 'hidden',
          }}>
            {[
              { emoji: '🌿', action: 'Completed Riverside Trail', when: 'Today' },
              { emoji: '🏋️', action: 'Morning workout session', when: '2d ago' },
              { emoji: '🎉', action: "Attended Saturday Market", when: '5d ago' },
            ].map((a, i, arr) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px',
                  minHeight: 58,
                  borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  backgroundColor: circlee.color + '20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  {a.emoji}
                </div>
                <div style={{ flex: 1, fontSize: 13, color: text, fontWeight: 500 }}>{a.action}</div>
                <div style={{ fontSize: 11, color: muted, flexShrink: 0 }}>{a.when}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ margin: '0 20px', display: 'flex', gap: 12 }}>
          <button style={{
            flex: 1, minHeight: 54,
            backgroundColor: surface,
            border: `1.5px solid ${border}`,
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', fontSize: 14, fontWeight: 700, color: text,
            fontFamily: "'Roboto', sans-serif",
          }}>
            <span>🔔</span> Ping Me
          </button>
          <button style={{
            flex: 1, minHeight: 54,
            backgroundColor: '#A88AED',
            border: 'none',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#FAF8F0',
            boxShadow: '0 6px 20px rgba(168,138,237,0.4)',
            fontFamily: "'Roboto', sans-serif",
          }}>
            <span>↗</span> Share
          </button>
        </div>

        {/* Back link */}
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: muted, fontSize: 14, fontWeight: 600,
            margin: '20px auto 0',
            minHeight: 44,
            padding: '0 24px',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          ‹ Back to Circlees
        </button>
      </div>
    </div>
  )
}
