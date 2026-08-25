import { useState, useRef } from 'react'

interface Circlee {
  initial: string
  name: string
  email: string
  userId: string
  km: number
  level: number
  circles: number
  color: string
  rank?: number
}

interface Circle {
  name: string
  accent: string
  cardBg: { light: string; dark: string }
  emoji: string
  circlees: Circlee[]
  feed: { actor: string; action: string; meToo?: boolean }[]
}

interface Props {
  circle: Circle
  darkMode: boolean
  onBack: () => void
  onViewProfile: (c: Circlee) => void
}

export default function CircleFeedView({ circle, darkMode, onBack, onViewProfile }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [meToos, setMeToos] = useState<Record<number, boolean>>({})

  // drag-to-open drawer
  const dragStartY = useRef<number | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const bg = darkMode ? '#1A1A1A' : '#F4F0DD'
  const surface = darkMode ? '#24221B' : '#FAF8F0'
  const text = darkMode ? '#FAF8F0' : '#24221B'
  const muted = darkMode ? '#B8B6AC' : '#605E55'
  const border = darkMode ? 'rgba(250,248,240,0.08)' : 'rgba(36,34,27,0.08)'
  const sheetBg = darkMode ? '#2C2A22' : '#FFFFFF'

  const ranked = [...circle.circlees].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
  const podium = [ranked[1], ranked[0], ranked[2]] // 2nd, 1st, 3rd

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
  }
  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return
    const dy = dragStartY.current - e.changedTouches[0].clientY
    if (dy > 30) setDrawerOpen(true)
    if (dy < -30) setDrawerOpen(false)
    dragStartY.current = null
  }

  return (
    <div style={{ flex: 1, backgroundColor: bg, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Scrollable feed */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>

        {/* Back + title */}
        <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              width: 44, height: 44,
              borderRadius: 14,
              border: `1px solid ${border}`,
              backgroundColor: surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, flexShrink: 0,
            }}
          >
            ‹
          </button>
          <div style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 28, fontWeight: 600, color: text, lineHeight: 1,
          }}>
            {circle.name}
          </div>
        </div>

        {/* ── Podium leaderboard ── */}
        <div style={{ padding: '24px 24px 8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
          {podium.map((member, podiumPos) => {
            if (!member) return <div key={podiumPos} style={{ flex: 1 }} />
            const isFirst = podiumPos === 1
            const rankLabel = podiumPos === 0 ? '2nd' : podiumPos === 1 ? '1st' : '3rd'
            const podiumH = isFirst ? 110 : 88

            return (
              <div
                key={member.name}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
              >
                {/* Avatar */}
                <div style={{
                  width: isFirst ? 64 : 52,
                  height: isFirst ? 64 : 52,
                  borderRadius: isFirst ? 20 : 16,
                  backgroundColor: member.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: isFirst ? 28 : 22,
                  fontWeight: 600,
                  color: '#FAF8F0',
                  border: isFirst ? `3px solid ${circle.accent}` : 'none',
                  boxShadow: isFirst ? `0 4px 20px ${circle.accent}50` : 'none',
                  transition: 'all 0.2s',
                }}>
                  {member.initial}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: text }}>{member.name}</span>

                {/* Podium block */}
                <div style={{
                  width: '100%',
                  height: podiumH,
                  borderRadius: '14px 14px 0 0',
                  backgroundColor: isFirst
                    ? (darkMode ? '#352C53' : '#A88AED')
                    : (darkMode ? '#2A2420' : '#EDE8FF'),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  border: isFirst ? 'none' : `1px solid ${border}`,
                }}>
                  <span style={{ fontSize: isFirst ? 22 : 18 }}>👑</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 2,
                    color: isFirst ? '#FAF8F0' : circle.accent,
                  }}>
                    <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: isFirst ? 32 : 24, fontWeight: 700, lineHeight: 1 }}>
                      {rankLabel.replace(/st|nd|rd/, '')}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {rankLabel.replace(/\d/, '')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Activity feed ── */}
        <div style={{ margin: '20px 18px 0' }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 600, color: text, marginBottom: 12 }}>
            Recent Activity
          </div>
          <div style={{
            backgroundColor: surface,
            borderRadius: 20,
            border: `1px solid ${border}`,
            overflow: 'hidden',
          }}>
            {circle.feed.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 18px',
                  minHeight: 72,
                  borderBottom: i < circle.feed.length - 1 ? `1px solid ${border}` : 'none',
                }}
              >
                {/* Avatar cluster */}
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  backgroundColor: circle.accent + '22',
                  border: `1.5px solid ${circle.accent}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {circle.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{item.actor}</div>
                  <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>{item.action}</div>
                </div>
                {item.meToo !== undefined && (
                  <button
                    onClick={() => setMeToos(p => ({ ...p, [i]: !p[i] }))}
                    style={{
                      padding: '8px 16px',
                      minHeight: 36,
                      borderRadius: 100,
                      border: meToos[i] ? 'none' : `1.5px solid ${border}`,
                      backgroundColor: meToos[i] ? circle.accent : 'transparent',
                      color: meToos[i] ? '#FAF8F0' : text,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                      fontFamily: "'Roboto', sans-serif",
                    }}
                  >
                    {meToos[i] ? '✓ Me Too' : 'Me Too'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Circlees bottom drawer ── */}
      <div
        ref={drawerRef}
        onTouchStart={handleDrawerTouchStart}
        onTouchEnd={handleDrawerTouchEnd}
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: drawerOpen ? '82%' : 62,
          backgroundColor: sheetBg,
          borderRadius: drawerOpen ? '24px 24px 0 0' : '20px 20px 0 0',
          boxShadow: '0 -6px 32px rgba(0,0,0,0.18)',
          transition: 'height 0.38s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.3s',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 10,
          border: `1px solid ${border}`,
          borderBottom: 'none',
        }}
      >
        {/* Drag handle + label */}
        <button
          onClick={() => setDrawerOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '10px 24px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            backgroundColor: darkMode ? 'rgba(250,248,240,0.2)' : 'rgba(36,34,27,0.18)',
          }} />
          <div style={{
            fontSize: 14, fontWeight: 700, color: text,
            fontFamily: "'Roboto', sans-serif",
            letterSpacing: '0.2px',
            opacity: drawerOpen ? 0 : 1,
            transition: 'opacity 0.2s',
          }}>
            Manage Circlees
          </div>
        </button>

        {/* Expanded content */}
        {drawerOpen && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px' }}>
            {/* Sheet title */}
            <div style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: 24, fontWeight: 600, color: text,
              textAlign: 'center', marginBottom: 20,
            }}>
              {circle.name}
            </div>

            {/* You (Admin) card */}
            <div style={{
              backgroundColor: circle.accent + '15',
              borderRadius: 18,
              border: `1.5px solid ${circle.accent}30`,
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: 20,
              minHeight: 64,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: circle.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: '#FAF8F0',
                fontFamily: "'Fredoka', sans-serif",
              }}>J</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: text }}>You (Admin)</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 1 }}>jane.cooper@example.com</div>
              </div>
              <button style={{
                padding: '8px 14px', minHeight: 36,
                borderRadius: 10,
                border: `1.5px solid ${circle.accent}50`,
                backgroundColor: 'transparent',
                color: circle.accent, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Roboto', sans-serif",
              }}>
                View Profile
              </button>
            </div>

            {/* Circlees list */}
            <div style={{ fontSize: 13, fontWeight: 700, color: muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Circlees
            </div>
            <div style={{
              backgroundColor: surface,
              borderRadius: 20,
              border: `1px solid ${border}`,
              overflow: 'hidden',
              marginBottom: 20,
            }}>
              {circle.circlees.map((c, i) => (
                <div
                  key={c.name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    minHeight: 68,
                    borderBottom: i < circle.circlees.length - 1 ? `1px solid ${border}` : 'none',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    backgroundColor: c.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: '#FAF8F0',
                    fontFamily: "'Fredoka', sans-serif",
                    flexShrink: 0,
                  }}>
                    {c.initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.email}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewProfile(c)}
                    style={{
                      padding: '8px 14px', minHeight: 36,
                      borderRadius: 10,
                      border: `1.5px solid ${border}`,
                      backgroundColor: 'transparent',
                      color: text, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', flexShrink: 0,
                      fontFamily: "'Roboto', sans-serif",
                    }}
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{
                flex: 1, minHeight: 52,
                backgroundColor: 'transparent',
                border: '1.5px solid rgba(232,120,108,0.4)',
                borderRadius: 16,
                color: '#E8786C', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Roboto', sans-serif",
              }}>
                Leave Circle
              </button>
              <button style={{
                flex: 1, minHeight: 52,
                backgroundColor: circle.accent,
                border: 'none',
                borderRadius: 16,
                color: '#FAF8F0', fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${circle.accent}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Roboto', sans-serif",
              }}>
                <span>👤</span> Invite User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
