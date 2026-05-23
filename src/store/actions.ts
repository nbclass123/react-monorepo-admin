import Cookies from "js-cookie";

import { getSysUserById, logout as logoutApi } from "@/api/module/user";

import { type AuthAction, type UserInfo } from "./context";

/**
 * 根据用户 ID 获取用户信息
 * 通过 API 接口查询用户详情
 *
 * @param userId 用户 ID
 * @returns 用户信息对象，如果失败返回 null
 */
export async function fetchUserInfoById(
  userId: string,
  signal?: AbortSignal
): Promise<UserInfo | null> {
  try {
    const result = await getSysUserById(parseInt(userId, 10), signal);
    const data = result.data;
    return {
      id: data.id,
      username: data.username,
      nickname: data.nickname,
      email: data.email,
      avatarUrl: data.avatarUrl
    };
  } catch (error: any) {
    if (
      error?.name === "AbortError" ||
      error?.name === "CanceledError" ||
      error?.code === "ERR_CANCELED"
    ) {
      return null;
    }
    return null;
  }
}

/**
 * 登录 Action Creator
 * 保存 token 和 userId 到 Cookie，获取用户信息并更新状态
 *
 * @param dispatch React dispatch 函数
 * @param token 登录成功后返回的 token
 * @param userId 用户 ID
 */
export async function createLoginAction(
  dispatch: React.Dispatch<AuthAction>,
  token: string,
  userId: number
): Promise<void> {
  Cookies.set("token", token);
  Cookies.set("userId", String(userId));

  const userInfo = await fetchUserInfoById(String(userId));
  if (userInfo) {
    dispatch({
      type: "LOGIN",
      payload: { userInfo, token }
    });
  }
}

/**
 * 登出 Action Creator
 * 调用后端 logout 接口，清除 Cookie 中的凭证，重置认证状态
 * 使用 ref 防止重复调用
 *
 * @param dispatch React dispatch 函数
 * @param loggingOutRef 防止重复登出的标记引用
 */
export function createLogoutAction(
  dispatch: React.Dispatch<AuthAction>,
  loggingOutRef: React.MutableRefObject<boolean>
): () => Promise<void> {
  return async () => {
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
  };
}

/**
 * 恢复登录状态 Action Creator
 * 从 Cookie 中恢复 token 和 userId，查询用户信息
 *
 * @param dispatch React dispatch 函数
 * @param token 从 Cookie 中获取的 token
 * @param userId 从 Cookie 中获取的 userId
 * @param onComplete 完成后回调
 */
export async function createRestoreAction(
  dispatch: React.Dispatch<AuthAction>,
  token: string,
  userId: string,
  onComplete: () => void,
  signal?: AbortSignal
): Promise<void> {
  dispatch({ type: "RESTORE", payload: { token } });

  const userInfo = await fetchUserInfoById(userId, signal);
  if (userInfo) {
    dispatch({ type: "SET_USER_INFO", payload: userInfo });
  }
  onComplete();
}

/**
 * 从 Cookie 中获取认证信息
 * @returns 包含 token 和 userId 的对象
 */
export function getAuthFromCookies(): { token: string; userId: string } {
  return {
    token: Cookies.get("token") || "",
    userId: Cookies.get("userId") || ""
  };
}

/**
 * 清除认证 Cookie
 */
export function clearAuthCookies(): void {
  Cookies.remove("token");
  Cookies.remove("userId");
}
