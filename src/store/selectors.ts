import { type AuthState, type UserInfo } from "./context";

/**
 * 选择用户信息
 * @param state 认证状态
 * @returns 用户信息对象或 null
 */
export function selectUserInfo(state: AuthState): UserInfo | null {
  return state.userInfo;
}

/**
 * 选择认证 token
 * @param state 认证状态
 * @returns token 字符串
 */
export function selectToken(state: AuthState): string {
  return state.token;
}

/**
 * 选择是否已认证
 * @param state 认证状态
 * @returns 是否已认证的布尔值
 */
export function selectIsAuthenticated(state: AuthState): boolean {
  return !!state.token && !!state.userInfo;
}

/**
 * 选择用户 ID
 * @param state 认证状态
 * @returns 用户 ID 或 null
 */
export function selectUserId(state: AuthState): number | null {
  return state.userInfo?.id ?? null;
}

/**
 * 选择用户名
 * @param state 认证状态
 * @returns 用户名或 null
 */
export function selectUsername(state: AuthState): string | null {
  return state.userInfo?.username ?? null;
}

/**
 * 选择用户昵称
 * @param state 认证状态
 * @returns 用户昵称或 null
 */
export function selectUserNickname(state: AuthState): string | null {
  return state.userInfo?.nickname ?? null;
}

/**
 * 选择用户邮箱
 * @param state 认证状态
 * @returns 用户邮箱或 null
 */
export function selectUserEmail(state: AuthState): string | null {
  return state.userInfo?.email ?? null;
}

/**
 * 选择用户头像 URL
 * @param state 认证状态
 * @returns 用户头像 URL 或 null
 */
export function selectUserAvatarUrl(state: AuthState): string | null {
  return state.userInfo?.avatarUrl ?? null;
}

/**
 * 组合选择器 - 获取完整的认证信息
 * @param state 认证状态
 * @returns 包含所有认证信息的对象
 */
export function selectAuthInfo(state: AuthState) {
  return {
    userInfo: state.userInfo,
    token: state.token,
    isAuthenticated: selectIsAuthenticated(state),
    userId: selectUserId(state),
    username: selectUsername(state),
    nickname: selectUserNickname(state),
    email: selectUserEmail(state),
    avatarUrl: selectUserAvatarUrl(state)
  };
}
