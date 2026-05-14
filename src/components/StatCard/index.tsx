import type { ReactNode } from "react";

import "./index.css";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
}

const StatCard = ({ title, value, icon, trend }: StatCardProps): ReactNode => {
  return (
    <div className="stat-card">
      <div className="stat-card__body">
        {icon && <div className="stat-card__icon">{icon}</div>}
        <div className="stat-card__content">
          <div className="stat-card__title">{title}</div>
          <div className="stat-card__value">{value}</div>
        </div>
      </div>
      {trend !== undefined && (
        <div className="stat-card__trend">
          <span className={trend >= 0 ? "stat-card__trend--up" : "stat-card__trend--down"}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="stat-card__trend-label">较上期</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
