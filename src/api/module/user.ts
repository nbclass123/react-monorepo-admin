import { get, post, put, del } from "@/api/index";

// ==================== 请求参数类型 ====================

export interface LoginReq {
  username: string;
  password: string;
}

export interface RegisterReq {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
}

export interface UpdateUserReq {
  id: number;
  nickname?: string;
  email?: string;
  avatarUrl?: string;
}

export interface UpdatePasswordReq {
  id: number;
  oldPassword: string;
  newPassword: string;
}

export interface UserListReq {
  page: number;
  size: number;
  id?: number;
  username?: string;
  nickname?: string;
  email?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}

// ==================== 响应数据类型 ====================

export interface ResultVo<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageVo<T> {
  total: number;
  page: number;
  size: number;
  records: T[];
}

export interface LoginVo {
  token: string;
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatarUrl: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserVo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatarUrl: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== API 接口函数 ====================

export function login(data: LoginReq) {
  return post<ResultVo<LoginVo>>(
    "/sys/user/login",
    data as unknown as Record<string, unknown>,
  );
}

export function getSysUserById(id: number) {
  return get<ResultVo<UserVo>>("/sys/user/getSysUserById", { id } as Record<
    string,
    unknown
  >);
}

export function register(data: RegisterReq) {
  return post<ResultVo<null>>(
    "/sys/user/register",
    data as unknown as Record<string, unknown>,
  );
}

export function updateUser(data: UpdateUserReq) {
  return put<ResultVo<null>>(
    "/sys/user/update",
    data as unknown as Record<string, unknown>,
  );
}

export function deleteUser(id: number) {
  return del<ResultVo<null>>("/sys/user/delete", { id } as Record<
    string,
    unknown
  >);
}

export function updatePassword(data: UpdatePasswordReq) {
  return put<ResultVo<null>>(
    "/sys/user/updatePassword",
    data as unknown as Record<string, unknown>,
  );
}

export function getUserList(params: UserListReq) {
  return get<ResultVo<PageVo<UserVo>>>(
    "/sys/user/getList",
    params as unknown as Record<string, unknown>,
  );
}
