/** 月度增长趋势图 — 展示 12 个月的趋势柱状图及汇总统计 */
export default function MonthlyTrendChart({ data }: { data: number[] }) {
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const maxValue = Math.max(...data);

  return (
    <div className="monthly-trend-container">
      <div className="trend-summary">
        <div className="summary-item">
          <span className="summary-label">总增长</span>
          <span className="summary-value">{data.reduce((a, b) => a + b, 0)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">最高月</span>
          <span className="summary-value">{months[data.indexOf(maxValue)]}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">平均值</span>
          <span className="summary-value">{Math.round(data.reduce((a, b) => a + b, 0) / data.length)}</span>
        </div>
      </div>

      <div className="trend-chart-area">
        <div className="trend-y-axis">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>0</span>
        </div>

        <div className="trend-bars-container">
          {data.map((value, i) => {
            const height = (value / maxValue) * 100;
            const isMax = value === maxValue;
            return (
              <div key={i} className="trend-bar-wrapper">
                <div
                  className={`trend-bar ${isMax ? "max-bar" : ""}`}
                  style={{
                    height: `${height}%`,
                    background: isMax
                      ? "linear-gradient(180deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)"
                      : "linear-gradient(180deg, var(--md-primary-light) 0%, var(--md-primary) 100%)"
                  }}
                >
                  <span className="bar-value">{value}</span>
                </div>
                <span className="trend-label">{months[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
