import { useContext } from "react";

import { AuthContext, type AuthContextType } from "./context";

/**
 * 自定义 Hook：获取认证上下文
 * 用于在组件中访问全局认证状态和操作方法
 * 
 * @returns 认证上下文对象，包含 userInfo、token、isAuthenticated、loginAction、logoutAction
 * @throws Error 如果组件不在 AuthProvider 包裹范围内
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { userInfo, token, isAuthenticated, loginAction, logoutAction } = useAuth();
 *   
 *   if (isAuthenticated) {
 *     return <div>Welcome, {userInfo?.nickname}</div>;
 *   }
 *   
 *   return <button onClick={() => loginAction(token, userId)}>Login</button>;
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
