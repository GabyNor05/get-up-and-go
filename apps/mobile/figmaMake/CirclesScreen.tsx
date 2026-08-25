interface Props {
  darkMode: boolean
}

const avatarColors = [
  "#A88AED",
  "#A6C261",
  "#E8A84C",
  "#6CB8E8",
  "#E87D6C",
  "#B8A0E8",
  "#7DC98A",
]

const circles = [
  {
    name: "The Girlies",
    members: 4,
    avatars: ["D", "L", "S", "M"],
    goal: "10 km from Moonlith",
    goalPct: 68,
    tags: ["Hiking", "Outdoors"],
    lastActive: "Today",
    cardBg: { light: "#EDE8FF", dark: "#2A2340" },
    accent: "#A88AED",
    emoji: "🌸",
    size: "tall",
  },
  {
    name: "Brooklyn 99",
    members: 7,
    avatars: ["A", "B", "C", "D", "E", "F", "G"],
    goal: "10 km to FIRST PLACE",
    goalPct: 82,
    tags: ["Running", "Competitive"],
    lastActive: "2h ago",
    cardBg: { light: "#E8F5D8", dark: "#1E2A18" },
    accent: "#A6C261",
    emoji: "⚡",
    size: "normal",
  },
  {
    name: "Da Fam",
    members: 3,
    avatars: ["X", "Y", "Z"],
    goal: null,
    goalPct: 0,
    tags: ["Casual", "Family"],
    lastActive: "Yesterday",
    cardBg: { light: "#FFF3E0", dark: "#2A2018" },
    accent: "#E8A84C",
    emoji: "🏡",
    size: "normal",
  },
  {
    name: "Yoga Squad",
    members: 5,
    avatars: ["P", "Q", "R", "S", "T"],
    goal: "30 sessions this month",
    goalPct: 47,
    tags: ["Wellness", "Morning"],
    lastActive: "1d ago",
    cardBg: { light: "#E8F4FF", dark: "#182030" },
    accent: "#6CB8E8",
    emoji: "🧘",
    size: "wide",
  },
  {
    name: "Yoga Squad",
    members: 5,
    avatars: ["P", "Q", "R", "S", "T"],
    goal: "30 sessions this month",
    goalPct: 47,
    tags: ["Wellness", "Morning"],
    lastActive: "1d ago",
    cardBg: { light: "#E8F4FF", dark: "#182030" },
    accent: "#6CB8E8",
    emoji: "🧘",
    size: "normal",
  },
  {
    name: "Yoga Squad",
    members: 5,
    avatars: ["P", "Q", "R", "S", "T"],
    goal: "30 sessions this month",
    goalPct: 47,
    tags: ["Wellness", "Morning"],
    lastActive: "1d ago",
    cardBg: { light: "#E8F4FF", dark: "#182030" },
    accent: "#6CB8E8",
    emoji: "🧘",
    size: "wide",
  },
]

export default function CirclesScreen({ darkMode }: Props) {
  const bg = darkMode ? "#1A1A1A" : "#F4F0DD"
  const text = darkMode ? "#FAF8F0" : "#24221B"
  const muted = darkMode ? "#B8B6AC" : "#605E55"
  const surface = darkMode ? "#24221B" : "#FAF8F0"
  const border = darkMode ? "rgba(250,248,240,0.07)" : "rgba(36,34,27,0.07)"

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: bg,
        overflowY: "auto",
        padding: "20px 18px",
      }}
    >
      {/* Header — info only, no actions in stretch zone */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: text,
            lineHeight: 1,
          }}
        >
          My Circles
        </div>
        <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>
          {circles.length} active groups · tap a card to view
        </div>
      </div>

      {/* Bento grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "auto",
          gap: 12,
        }}
      >
        {/* Card 0 — tall, spans 2 rows */}
        <BentoCard
          circle={circles[0]}
          darkMode={darkMode}
          text={text}
          muted={muted}
          surface={surface}
          border={border}
          style={{ gridRow: "span 2" }}
          tall
        />

        {/* Card 1 — normal */}
        <BentoCard
          circle={circles[1]}
          darkMode={darkMode}
          text={text}
          muted={muted}
          surface={surface}
          border={border}
        />

        {/* Card 2 — normal */}
        <BentoCard
          circle={circles[2]}
          darkMode={darkMode}
          text={text}
          muted={muted}
          surface={surface}
          border={border}
        />

        {/* Card 3 — wide, spans 2 cols */}
        <BentoCard
          circle={circles[3]}
          darkMode={darkMode}
          text={text}
          muted={muted}
          surface={surface}
          border={border}
          style={{ gridColumn: "span 2" }}
          wide
        />

      </div>

      {/* Bottom actions — full-width, in thumb zone */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingBottom: 100 }}>
        <button
          style={{
            flex: 1,
            minHeight: 54,
            backgroundColor: 'transparent',
            border: `2px dashed ${darkMode ? 'rgba(250,248,240,0.18)' : 'rgba(36,34,27,0.18)'}`,
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 16 }}>🔍</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: muted, fontFamily: "'Roboto', sans-serif" }}>
            Find a Circle
          </span>
        </button>
        <button
          style={{
            flex: 1,
            minHeight: 54,
            backgroundColor: '#A88AED',
            border: 'none',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(168,138,237,0.45)',
          }}
        >
          <span style={{ fontSize: 16 }}>✦</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#FAF8F0', fontFamily: "'Roboto', sans-serif" }}>
            New Circle
          </span>
        </button>
      </div>
    </div>
  )
}

/* ─── Individual bento card ─────────────────────────────────────────────── */

interface CardProps {
  circle: typeof circles[0]
  darkMode: boolean
  text: string
  muted: string
  surface: string
  border: string
  style?: React.CSSProperties
  tall?: boolean
  wide?: boolean
}

function BentoCard({
  circle,
  darkMode,
  text,
  muted,
  surface,
  border,
  style,
  tall,
  wide,
}: CardProps) {
  const cardBg = darkMode ? circle.cardBg.dark : circle.cardBg.light

  return (
    <div
      style={{
        backgroundColor: cardBg,
        borderRadius: 22,
        padding: wide ? "18px 20px" : "18px 16px",
        display: "flex",
        flexDirection: wide ? "row" : "column",
        justifyContent: "space-between",
        gap: wide ? 16 : 0,
        border: `1px solid ${circle.accent}22`,
        position: "relative",
        overflow: "hidden",
        minHeight: tall ? 280 : wide ? "auto" : 140,
        ...style,
      }}
    >
      {/* Decorative bg circle */}
      <div
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: "50%",
          backgroundColor: circle.accent,
          opacity: 0.08,
          bottom: wide ? "50%" : -20,
          right: wide ? -20 : -20,
          transform: wide ? "translateY(50%)" : "none",
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: wide ? 0 : 10,
        }}
      >
        {/* Top row: emoji badge + last active */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: wide ? 8 : 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: `${circle.accent}25`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {circle.emoji}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: circle.accent,
              backgroundColor: `${circle.accent}18`,
              borderRadius: 20,
              padding: "3px 9px",
            }}
          >
            {circle.lastActive}
          </div>
        </div>

        {/* Name + member count */}
        <div style={{ marginTop: wide ? 0 : 4 }}>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: tall ? 20 : wide ? 18 : 16,
              fontWeight: 600,
              color: text,
              lineHeight: 1.2,
            }}
          >
            {circle.name}
          </div>
          <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
            {circle.members} members
          </div>
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginTop: tall ? 6 : 0,
          }}
        >
          {circle.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: circle.accent,
                backgroundColor: `${circle.accent}18`,
                borderRadius: 20,
                padding: "3px 10px",
                letterSpacing: "0.2px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Goal progress — shown on tall and wide cards */}
        {circle.goal && (tall || wide) && (
          <div style={{ marginTop: tall ? "auto" : 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 11, color: muted, lineHeight: 1.3 }}>
                🎯 {circle.goal}
              </span>
              <span
                style={{ fontSize: 11, fontWeight: 700, color: circle.accent }}
              >
                {circle.goalPct}%
              </span>
            </div>
            <div
              style={{
                height: 5,
                backgroundColor: `${circle.accent}22`,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${circle.goalPct}%`,
                  backgroundColor: circle.accent,
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right side for wide cards: avatars + button */}
      {wide ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <AvatarStack
            avatars={circle.avatars}
            accent={circle.accent}
            surface={cardBg}
            total={circle.members}
          />
          <button
            style={{
              backgroundColor: circle.accent,
              color: "#FAF8F0",
              border: "none",
              borderRadius: 12,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: `0 3px 12px ${circle.accent}50`,
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            View →
          </button>
        </div>
      ) : (
        /* Bottom row for normal/tall: avatars stack + view button */
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: tall ? 12 : "auto",
            paddingTop: tall ? 0 : 10,
          }}
        >
          <AvatarStack
            avatars={circle.avatars}
            accent={circle.accent}
            surface={cardBg}
            total={circle.members}
          />
          <button
            style={{
              backgroundColor: circle.accent,
              color: "#FAF8F0",
              border: "none",
              borderRadius: 10,
              padding: "6px 13px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 3px 10px ${circle.accent}45`,
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            View →
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Avatar stack ───────────────────────────────────────────────────────── */

function AvatarStack({
  avatars,
  accent,
  surface,
  total,
}: {
  avatars: string[]
  accent: string
  surface: string
  total: number
}) {
  const show = avatars.slice(0, 4)
  const extra = total - show.length
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {show.map((a, i) => (
        <div
          key={i}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            backgroundColor: avatarColors[i % avatarColors.length],
            border: `2px solid ${surface}`,
            marginLeft: i > 0 ? -8 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: "#FAF8F0",
            zIndex: show.length - i,
            position: "relative",
          }}
        >
          {a}
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            backgroundColor: `${accent}25`,
            border: `2px solid ${surface}`,
            marginLeft: -8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            color: accent,
            position: "relative",
            zIndex: 0,
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
