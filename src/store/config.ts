/**
 * Store 配置常量
 */
export const STORE_CONFIG = {
  /** Store 名称 */
  name: "auth-store",
  
  /** 存储键名 */
  storage: {
    token: "token",
    userId: "userId"
  },
  
  /** Cookie 配置 */
  cookie: {
    expires: 7,
    path: "/"
  }
} as const;

/**
 * 认证相关的路由配置
 */
export const AUTH_ROUTES = {
  /** 登录页面路径 */
  login: "/login",
  
  /** 首页路径 */
  home: "/",
  
  /** 默认重定向路径 */
  defaultRedirect: "/login"
} as const;

/**
 * 认证超时配置（毫秒）
 */
export const AUTH_TIMEOUT = {
  /** Token 刷新间隔 */
  refreshInterval: 30 * 60 * 1000,
  
  /** 会话超时时间 */
  sessionTimeout: 24 * 60 * 60 * 1000
} as const;

/**
 * 认证状态持久化配置
 */
export const PERSIST_CONFIG = {
  /** 是否启用持久化 */
  enabled: true,
  
  /** 持久化存储键名 */
  key: "auth-state",
  
  /** 持久化存储方式 */
  storage: "localStorage",
  
  /** 白名单 - 需要持久化的状态字段 */
  whitelist: ["userInfo", "token"]
} as const;
