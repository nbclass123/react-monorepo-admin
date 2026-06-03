import { type ReactNode, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import BootSplash from "@/components/BootSplash/index";

import {
  createLoginAction,
  createLogoutAction,
  createRestoreAction,
  getAuthFromCookies
} from "./actions";
import { AuthContext, type AuthContextType, authReducer, initialState } from "./context";
import { selectIsAuthenticated } from "./selectors";
import { useAuth } from "./useAuth";

/**
 * 认证状态提供者组件
 * 负责管理全局认证状态，提供登录/登出操作
 * 使用 React Context API 向子组件传递认证状态
 *
 * @param children 受保护的子组件
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [ready, setReady] = useState(false);
  const loggingOutRef = useRef(false);

  const initRef = useRef({ ...getAuthFromCookies() });

  useEffect(() => {
    const { token, userId } = initRef.current;
    if (!token || !userId) {
      setReady(true);
      return;
    }

    const controller = new AbortController();
    createRestoreAction(
      dispatch,
      token,
      userId,
      () => {
        setReady(true);
      },
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, []);

  const loginAction = useCallback(async (token: string, userId: number) => {
    await createLoginAction(dispatch, token, userId);
  }, []);

  const logoutAction = useCallback(async () => {
    const logout = createLogoutAction(dispatch, loggingOutRef);
    await logout();
  }, []);

  const contextValue: AuthContextType = {
    userInfo: state.userInfo,
    token: state.token,
    isAuthenticated: selectIsAuthenticated(state),
    loginAction,
    logoutAction
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {ready ? children : null}
      <BootSplash visible={!ready} />
    </AuthContext.Provider>
  );
}

/**
 * 私有路由组件
 * 保护需要登录才能访问的页面
 * 如果用户未登录，自动重定向到登录页
 *
 * @param children 需要保护的页面组件
 */
export function PrivateRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
