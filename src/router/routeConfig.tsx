/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { Navigate } from "react-router-dom";

import type { AppRouteConfig } from "./types";

const LoginPage = lazy(() => import("@/pages/login/index"));
const DashboardPage = lazy(() => import("@/pages/dashboard/index"));
const UserListPage = lazy(() => import("@/pages/user/userList/index"));
const UserProfilePage = lazy(() => import("@/pages/user/userProfile/index"));
const BlogCategoryPage = lazy(() => import("@/pages/blog/blogCategory/index"));
const BlogTagPage = lazy(() => import("@/pages/blog/blogTag/index"));
const BlogPostPage = lazy(() => import("@/pages/blog/blogPost/index"));
const SysRolePage = lazy(() => import("@/pages/sys/sysRole/index"));
const SysPermissionPage = lazy(() => import("@/pages/sys/sysPermission/index"));
const SvgIconPage = lazy(() => import("@/pages/svgIcon/index"));

export const appRoutes: AppRouteConfig[] = [
  {
    path: "/",
    key: "redirect",
    title: "重定向",
    element: <Navigate to="/dashboard" replace />,
    hideInMenu: true
  },
  {
    path: "/login",
    key: "login",
    title: "登录",
    element: <LoginPage />,
    hideInMenu: true
  },
  {
    path: "/dashboard",
    key: "dashboard",
    title: "仪表盘",
    element: <DashboardPage />
  },
  {
    path: "/userList",
    key: "userList",
    title: "用户管理",
    element: <UserListPage />
  },
  {
    path: "/blog/category",
    key: "blogCategory",
    title: "文章分类",
    element: <BlogCategoryPage />
  },
  {
    path: "/blog/tag",
    key: "blogTag",
    title: "文章标签",
    element: <BlogTagPage />
  },
  {
    path: "/blog/post",
    key: "blogPost",
    title: "文章管理",
    element: <BlogPostPage />
  },
  {
    path: "/sys/role",
    key: "sysRole",
    title: "角色管理",
    element: <SysRolePage />
  },
  {
    path: "/sys/permission",
    key: "sysPermission",
    title: "权限管理",
    element: <SysPermissionPage />
  },
  {
    path: "/userProfile",
    key: "userProfile",
    title: "个人中心",
    element: <UserProfilePage />,
    hideInMenu: true
  },
  {
    path: "/svgIcon",
    key: "svgIcon",
    title: "图标图鉴",
    element: <SvgIconPage />
  }
];
