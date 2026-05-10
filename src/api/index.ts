import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { message } from "antd";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

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
  },
);

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
  },
);

export function get<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  return instance.get(url, { params, ...config });
}

export function post<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  return instance.post(url, data, config);
}

export function put<T>(
  url: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  return instance.put(url, data, config);
}

export function del<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  return instance.delete(url, { params, ...config });
}

export default instance;
