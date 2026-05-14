import { message } from "antd";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import Cookies from "js-cookie";

/** axios 实例配置 */
const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
});

/** 请求拦截器：自动注入 token */
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token && config.headers) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/** 响应拦截器：统一处理响应和错误 */
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data.code === 200) {
      return response.data;
    } else {
      message.warning(response.data.msg || "请求失败");
      return Promise.reject(response.data);
    }
  },
  (error) => {
    console.error("Request failed:", error);
    return Promise.reject(error);
  }
);

/** GET 请求封装 */
export function get<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  return instance.get(url, { params, ...config });
}

/** POST 请求封装 */
export function post<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  return instance.post(url, data, config);
}

/** PUT 请求封装 */
export function put<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  return instance.put(url, data, config);
}

/** DELETE 请求封装 */
export function del<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  return instance.delete(url, { params, ...config });
}

export default instance;
