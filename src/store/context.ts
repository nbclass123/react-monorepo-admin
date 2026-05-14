import { createContext } from "react";

/**
 * 用户信息接口定义
 * 包含用户的基本信息字段
 */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatarUrl: string;
}

/**
 * 认证状态接口定义
 * 管理用户的登录状态和凭证信息
 */
export interface AuthState {
  userInfo: UserInfo | null;
  token: string;
}

/**
 * 认证操作类型联合类型
 * 定义所有可能的状态变更操作
 */
export type AuthAction =
  | { type: "LOGIN"; payload: { userInfo: UserInfo; token: string } }
  | { type: "LOGOUT" }
  | { type: "RESTORE"; payload: { token: string } }
  | { type: "SET_USER_INFO"; payload: UserInfo };

/**
 * 初始认证状态
 * 用户未登录时的默认状态
 */
export const initialState: AuthState = {
  userInfo: null,
  token: ""
};

/**
 * 认证状态 reducer 函数
 * 根据不同的 action 类型更新认证状态
 *
 * @param state 当前认证状态
 * @param action 要执行的操作
 * @returns 更新后的认证状态
 */
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        userInfo: action.payload.userInfo,
        token: action.payload.token
      };
    case "LOGOUT":
      return {
        userInfo: null,
        token: ""
      };
    case "RESTORE":
      return {
        userInfo: null,
        token: action.payload.token
      };
    case "SET_USER_INFO":
      return {
        ...state,
        userInfo: action.payload
      };
    default:
      return state;
  }
}

/**
 * 认证上下文类型定义
 * 包含当前用户信息、token 以及登录/登出操作
 */
export interface AuthContextType {
  userInfo: UserInfo | null;
  token: string;
  loginAction: (token: string, userId: number) => Promise<void>;
  logoutAction: () => Promise<void>;
}

/**
 * 认证上下文对象
 * 用于在组件树中共享认证状态
 * 使用 React Context API 实现跨组件状态共享
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
