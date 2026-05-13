import type { ReactNode } from "react";

export interface AppRouteConfig {
  path: string;
  key: string;
  title: string;
  icon?: ReactNode;
  element: ReactNode;
  hideInMenu?: boolean;
  children?: AppRouteConfig[];
}
