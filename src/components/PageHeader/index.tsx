import type { ReactNode } from "react";

import "./index.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

const PageHeader = ({ title, subtitle, extra }: PageHeaderProps): ReactNode => {
  return (
    <div className="page-header">
      <div className="page-header__left">
        <h2 className="page-header__title">{title}</h2>
        {subtitle && <span className="page-header__subtitle">{subtitle}</span>}
      </div>
      {extra && <div className="page-header__extra">{extra}</div>}
    </div>
  );
};

export default PageHeader;
