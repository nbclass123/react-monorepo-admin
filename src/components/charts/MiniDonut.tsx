/** 迷你环形图 — 用于统计卡片内嵌展示百分比 */
export default function MiniDonut({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: `conic-gradient(${color} 0deg, ${color} ${pct * 3.6}deg, var(--md-border-subtle) ${pct * 3.6}deg, var(--md-border-subtle) 360deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "var(--md-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: "800", color }}>{pct}%</span>
      </div>
    </div>
  );
}
