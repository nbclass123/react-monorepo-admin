import { createContext } from "react";

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatarUrl: string;
}

export interface AuthState {
  userInfo: UserInfo | null;
  token: string;
}

export type AuthAction =
  | { type: "LOGIN"; payload: { userInfo: UserInfo; token: string } }
  | { type: "LOGOUT" }
  | { type: "RESTORE"; payload: { token: string } }
  | { type: "SET_USER_INFO"; payload: UserInfo };

export const initialState: AuthState = {
  userInfo: null,
  token: ""
};

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

export interface AuthContextType {
  userInfo: UserInfo | null;
  token: string;
  loginAction: (token: string, userId: number) => Promise<void>;
  logoutAction: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
