import { useState, useCallback, type ReactNode } from "react";
import "./index.css";

interface BootSplashProps {
  visible?: boolean;
}

const BootSplash = ({ visible = true }: BootSplashProps): ReactNode => {
  const [render, setRender] = useState(() => visible);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.target === e.currentTarget && e.propertyName === "opacity" && !visible) {
        setRender(false);
      }
    },
    [visible],
  );

  if (!render) return null;

  const className = `boot-splash${visible ? " boot-splash--visible" : " boot-splash--hidden"}`;

  return (
    <div className={className} onTransitionEnd={handleTransitionEnd}>
      <div className="boot-splash__logo">
        <svg
          className="boot-splash__icon"
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
        >
          <rect x="8" y="8" width="48" height="48" rx="12" stroke="currentColor" strokeWidth="3" />
          <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="3" />
          <circle cx="32" cy="32" r="5" fill="currentColor" />
        </svg>
        <span className="boot-splash__text">App</span>
      </div>
      <div className="boot-splash__spinner" />
    </div>
  );
};

export default BootSplash;
