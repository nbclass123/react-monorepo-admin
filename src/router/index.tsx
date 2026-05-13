import { Suspense } from "react";
import {
  createBrowserRouter,
  Outlet,
  type RouteObject,
} from "react-router-dom";
import { AuthProvider, PrivateRoute } from "@/store/index";
import MainLayout from "@/layouts/MainLayout/index";
import { appRoutes } from "./routeConfig";
import type { AppRouteConfig } from "./types";

function toRouteObjects(configs: AppRouteConfig[]): RouteObject[] {
  return configs.map((config) => ({
    path: config.path,
    element: <Suspense fallback={null}>{config.element}</Suspense>,
    children: config.children ? toRouteObjects(config.children) : undefined,
  }));
}

const authRoutes = appRoutes.filter((r) => r.hideInMenu);
const protectedRoutes = appRoutes.filter((r) => !r.hideInMenu);

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      ...toRouteObjects(authRoutes),
      {
        element: (
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        ),
        children: toRouteObjects(protectedRoutes),
      },
    ],
  },
]);

export default router;
