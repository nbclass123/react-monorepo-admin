import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatarUrl: string;
}

interface AuthState {
  userInfo: UserInfo | null;
  token: string;
}

type AuthAction =
  | { type: "LOGIN"; payload: { userInfo: UserInfo; token: string } }
  | { type: "LOGOUT" }
  | { type: "RESTORE"; payload: { token: string } };

const initialState: AuthState = {
  userInfo: null,
  token: "",
};

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
    default:
      return state;
  }
}

interface AuthContextType {
  userInfo: UserInfo | null;
  token: string;
  loginAction: (userInfo: UserInfo, token: string) => void;
  logoutAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      dispatch({ type: "RESTORE", payload: { token } });
    }
  }, []);

  const loginAction = (userInfo: UserInfo, token: string) => {
    Cookies.set("token", token);
    dispatch({ type: "LOGIN", payload: { userInfo, token } });
  };

  const logoutAction = () => {
    Cookies.remove("token");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo: state.userInfo,
        token: state.token,
        loginAction,
        logoutAction,
      }}>
      {children}
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
