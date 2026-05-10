import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, PrivateRoute } from "@/store/index";
import MainLayout from "@/layouts/MainLayout/index";
import LoginPage from "@/pages/login/index";
import UserListPage from "@/pages/userList/index";

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/userList",
        element: (
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <UserListPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
