/** 迷你柱状图 — 用于统计卡片内嵌展示 */
export default function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const maxValue = Math.max(...data);

  return (
    <div className="stat-card-chart">
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "60px" }}>
        {data.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${(v / maxValue) * 100}%`,
              background: `linear-gradient(to top, ${color}, ${color}88)`,
              borderRadius: "4px 4px 0 0",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              minWidth: "6px"
            }}
          />
        ))}
      </div>
    </div>
  );
}
