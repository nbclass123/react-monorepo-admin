import Cookies from "js-cookie";
import { type ReactNode, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import { getSysUserById, logout as logoutApi } from "@/api/module/user";
import BootSplash from "@/components/BootSplash/index";

import { AuthContext, type UserInfo, authReducer, initialState } from "./context";
import { useAuth } from "./useAuth";

/**
 * 根据用户 ID 获取用户信息
 * 通过 API 接口查询用户详情
 *
 * @param userId 用户 ID
 * @returns 用户信息对象，如果失败返回 null
 */
const fetchUserInfoById = async (userId: string): Promise<UserInfo | null> => {
  try {
    const result = await getSysUserById(parseInt(userId, 10));
    const data = result.data;
    return {
      id: data.id,
      username: data.username,
      nickname: data.nickname,
      email: data.email,
      avatarUrl: data.avatarUrl
    };
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
};

/**
 * 认证状态提供者组件
 * 负责管理全局认证状态，提供登录/登出操作
 * 使用 React Context API 向子组件传递认证状态
 *
 * @param children 受保护的子组件
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  /** 使用 reducer 管理认证状态 */
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  /** 从 Cookie 中获取保存的 token 和 userId */
  const tokenFromCookie = Cookies.get("token");
  const userIdFromCookie = Cookies.get("userId");
  
  /** 标记应用是否已完成初始化（用于显示启动画面） */
  const [ready, setReady] = useState(!(tokenFromCookie && userIdFromCookie));
  
  /** 存储初始 token 和 userId，防止闭包问题 */
  const initRef = useRef({ token: tokenFromCookie, userId: userIdFromCookie });
  
  /** 防止重复登出的标记 */
  const loggingOutRef = useRef(false);

  /**
   * 初始化时恢复登录状态
   * 如果 Cookie 中存在 token 和 userId，自动恢复登录状态
   */
  useEffect(() => {
    const { token, userId } = initRef.current;
    if (!token || !userId) return;

    dispatch({ type: "RESTORE", payload: { token } });
    fetchUserInfoById(userId).then((userInfo) => {
      if (userInfo) {
        dispatch({ type: "SET_USER_INFO", payload: userInfo });
      }
      setReady(true);
    });
  }, []);

  /**
   * 登录操作
   * 保存 token 和 userId 到 Cookie，获取用户信息并更新状态
   *
   * @param token 登录成功后返回的 token
   * @param userId 用户 ID
   */
  const loginAction = useCallback(async (token: string, userId: number) => {
    Cookies.set("token", token);
    Cookies.set("userId", String(userId));
    const userInfo = await fetchUserInfoById(String(userId));
    dispatch({
      type: "LOGIN",
      payload: { userInfo: userInfo!, token }
    });
  }, []);

  /**
   * 登出操作
   * 调用后端 logout 接口，清除 Cookie 中的凭证，重置认证状态
   * 使用 loggingOutRef 防止重复调用
   */
  const logoutAction = useCallback(async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      Cookies.remove("token");
      Cookies.remove("userId");
      dispatch({ type: "LOGOUT" });
      loggingOutRef.current = false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userInfo: state.userInfo,
        token: state.token,
        loginAction,
        logoutAction
      }}
    >
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
