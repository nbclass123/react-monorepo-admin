import { del, get, post, put } from "@/api/index";

/** 登录请求参数 */
export interface LoginReq {
  username: string;
  password: string;
}

/** 注册请求参数 */
export interface RegisterReq {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
}

/** 更新用户信息请求参数 */
export interface UpdateUserReq {
  id: number;
  nickname?: string;
  email?: string;
  avatarUrl?: string;
}

/** 更新密码请求参数 */
export interface UpdatePasswordReq {
  id: number;
  oldPassword: string;
  newPassword: string;
}

/** 用户列表请求参数 */
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

/** 通用响应包装 */
export interface ResultVo<T> {
  code: number;
  message: string;
  data: T;
}

/** 分页数据响应 */
export interface PageVo<T> {
  total: number;
  page: number;
  size: number;
  list: T[];
}

/** 登录响应数据 */
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

/** 用户信息数据 */
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

/** 登录接口 */
export function login(data: LoginReq) {
  return post<ResultVo<LoginVo>>("/auth/user/login", data as unknown as Record<string, unknown>);
}

/** 退出登录接口 */
export function logout() {
  return post<ResultVo<null>>("/auth/user/logout");
}

/** 根据ID获取用户信息 */
export function getSysUserById(id: number, signal?: AbortSignal) {
  return get<ResultVo<UserVo>>("/auth/user/getSysUserById", { id } as Record<string, unknown>, {
    signal
  });
}

/** 注册新用户 */
export function register(data: RegisterReq) {
  return post<ResultVo<null>>("/auth/user/register", data as unknown as Record<string, unknown>);
}

/** 更新用户信息 */
export function updateUser(data: UpdateUserReq) {
  return put<ResultVo<null>>("/auth/user/update", data as unknown as Record<string, unknown>);
}

/** 冻结用户 */
export function freezeUser(id: number) {
  return put<ResultVo<null>>("/auth/user/freeze", { id } as unknown as Record<string, unknown>);
}

/** 激活用户 */
export function activateUser(id: number) {
  return put<ResultVo<null>>("/auth/user/activate", { id } as unknown as Record<string, unknown>);
}

/** 删除用户 */
export function deleteUser(id: number) {
  return del<ResultVo<null>>("/auth/user/delete", { id } as Record<string, unknown>);
}

/** 更新密码 */
export function updatePassword(data: UpdatePasswordReq) {
  return put<ResultVo<null>>(
    "/auth/user/updatePassword",
    data as unknown as Record<string, unknown>
  );
}

/** 获取用户列表（分页） */
export function getUserList(params: UserListReq) {
  return get<ResultVo<PageVo<UserVo>>>(
    "/auth/user/getList",
    params as unknown as Record<string, unknown>
  );
}
