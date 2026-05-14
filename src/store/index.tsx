import Cookies from "js-cookie";
import { type ReactNode, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import { getSysUserById } from "@/api/module/user";
import BootSplash from "@/components/BootSplash/index";

import { AuthContext, type UserInfo, authReducer, initialState } from "./context";
import { useAuth } from "./useAuth";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const tokenFromCookie = Cookies.get("token");
  const userIdFromCookie = Cookies.get("userId");
  const [ready, setReady] = useState(!(tokenFromCookie && userIdFromCookie));
  const initRef = useRef({ token: tokenFromCookie, userId: userIdFromCookie });
  const loggingOutRef = useRef(false);

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

  const loginAction = useCallback(async (token: string, userId: number) => {
    Cookies.set("token", token);
    Cookies.set("userId", String(userId));
    const userInfo = await fetchUserInfoById(String(userId));
    dispatch({
      type: "LOGIN",
      payload: { userInfo: userInfo!, token }
    });
  }, []);

  const logoutAction = useCallback(async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    Cookies.remove("token");
    Cookies.remove("userId");
    dispatch({ type: "LOGOUT" });
    loggingOutRef.current = false;
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

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
