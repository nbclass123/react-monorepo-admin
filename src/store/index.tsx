import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";
import { getSysUserById } from "@/api/module/user";

/** 用户信息接口 */
interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatarUrl: string;
}

/** 认证状态 */
interface AuthState {
  userInfo: UserInfo | null;
  token: string;
}

/** 认证操作类型 */
type AuthAction =
  | { type: "LOGIN"; payload: { userInfo: UserInfo; token: string } }
  | { type: "LOGOUT" }
  | { type: "RESTORE"; payload: { token: string } }
  | { type: "SET_USER_INFO"; payload: UserInfo };

const initialState: AuthState = {
  userInfo: null,
  token: "",
};

/** 认证状态 reducer */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        userInfo: action.payload.userInfo,
        token: action.payload.token,
      };
    case "LOGOUT":
      return {
        userInfo: null,
        token: "",
      };
    case "RESTORE":
      return {
        userInfo: null,
        token: action.payload.token,
      };
    case "SET_USER_INFO":
      return {
        ...state,
        userInfo: action.payload,
      };
    default:
      return state;
  }
}

/** 认证上下文类型 */
interface AuthContextType {
  userInfo: UserInfo | null;
  token: string;
  loginAction: (token: string, userId: number) => Promise<void>;
  logoutAction: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** 根据用户ID获取用户信息 */
const fetchUserInfoById = async (userId: string): Promise<UserInfo | null> => {
  try {
    const result = await getSysUserById(parseInt(userId, 10));
    const data = result.data;
    return {
      id: data.id,
      username: data.username,
      nickname: data.nickname,
      email: data.email,
      avatarUrl: data.avatarUrl,
    };
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [ready, setReady] = useState(false);
  const isInitRef = useRef(false);
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (isInitRef.current) return;
    isInitRef.current = true;

    const token = Cookies.get("token");
    const userId = Cookies.get("userId");

    if (token && userId) {
      dispatch({ type: "RESTORE", payload: { token } });
      fetchUserInfoById(userId).then((userInfo) => {
        if (userInfo) {
          dispatch({ type: "SET_USER_INFO", payload: userInfo });
        }
        setReady(true);
      });
    } else {
      setReady(true);
    }
  }, []);

  const loginAction = useCallback(async (token: string, userId: number) => {
    Cookies.set("token", token);
    Cookies.set("userId", String(userId));
    const userInfo = await fetchUserInfoById(String(userId));
    dispatch({
      type: "LOGIN",
      payload: { userInfo: userInfo!, token },
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
        logoutAction,
      }}>
      {ready ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
