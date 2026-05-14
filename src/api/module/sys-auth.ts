import { del, get, post, put } from "@/api/index";
import type { PageVo, ResultVo } from "@/api/module/user";

/* ==================== 请求参数 ==================== */

export interface CommonListReq {
  page?: number;
  size?: number;
  id?: number;
  status?: number;
}

/* ==================== 角色 ==================== */

export interface SysRoleVo {
  id: number;
  roleCode: string;
  roleName: string;
  roleSort: number;
  isSystem: number;
  status: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface SysRoleReq {
  id?: number;
  roleCode: string;
  roleName: string;
  status: number;
  roleSort?: number;
  isSystem?: number;
  remark?: string;
}

export interface SysPermissionVo {
  id: number;
  permissionCode: string;
  permissionName: string;
  permissionGroup: string;
  permissionType: number;
  apiPath: string;
  httpMethod: string;
  status: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface SysPermissionReq {
  id?: number;
  permissionCode: string;
  permissionName: string;
  permissionType: number;
  status: number;
  permissionGroup?: string;
  apiPath?: string;
  httpMethod?: string;
  remark?: string;
}

export interface SysUserRoleVo {
  id: number;
  userId: number;
  roleId: number;
  createdAt: string;
}

export interface SysUserRoleReq {
  id?: number;
  userId: number;
  roleId: number;
}

export interface SysRolePermissionVo {
  id: number;
  roleId: number;
  permissionId: number;
  createdAt: string;
}

export interface SysRolePermissionReq {
  id?: number;
  roleId: number;
  permissionId: number;
}

/* ==================== 角色 API ==================== */

export function getRoleList(params: CommonListReq) {
  return get<ResultVo<PageVo<SysRoleVo>>>(
    "/sys/role/getList",
    params as unknown as Record<string, unknown>
  );
}

export function getRoleById(id: number) {
  return get<ResultVo<SysRoleVo>>("/sys/role/getById", { id } as Record<string, unknown>);
}

export function createRole(data: SysRoleReq) {
  return post<ResultVo<null>>("/sys/role/create", data as unknown as Record<string, unknown>);
}

export function updateRole(data: SysRoleReq & { id: number }) {
  return put<ResultVo<null>>("/sys/role/update", data as unknown as Record<string, unknown>);
}

export function deleteRole(id: number) {
  return del<ResultVo<null>>("/sys/role/delete", { id } as Record<string, unknown>);
}

/* ==================== 权限 API ==================== */

export function getPermissionList(params: CommonListReq) {
  return get<ResultVo<PageVo<SysPermissionVo>>>(
    "/sys/permission/getList",
    params as unknown as Record<string, unknown>
  );
}

export function getPermissionById(id: number) {
  return get<ResultVo<SysPermissionVo>>("/sys/permission/getById", { id } as Record<
    string,
    unknown
  >);
}

export function createPermission(data: SysPermissionReq) {
  return post<ResultVo<null>>("/sys/permission/create", data as unknown as Record<string, unknown>);
}

export function updatePermission(data: SysPermissionReq & { id: number }) {
  return put<ResultVo<null>>("/sys/permission/update", data as unknown as Record<string, unknown>);
}

export function deletePermission(id: number) {
  return del<ResultVo<null>>("/sys/permission/delete", { id } as Record<string, unknown>);
}

/* ==================== 用户角色关联 ==================== */

export function getUserRoleList(params: CommonListReq) {
  return get<ResultVo<PageVo<SysUserRoleVo>>>(
    "/sys/userRole/getList",
    params as unknown as Record<string, unknown>
  );
}

export function getUserRoleById(id: number) {
  return get<ResultVo<SysUserRoleVo>>("/sys/userRole/getById", { id } as Record<string, unknown>);
}

export function createUserRole(data: SysUserRoleReq) {
  return post<ResultVo<null>>("/sys/userRole/create", data as unknown as Record<string, unknown>);
}

export function updateUserRole(data: SysUserRoleReq & { id: number }) {
  return put<ResultVo<null>>("/sys/userRole/update", data as unknown as Record<string, unknown>);
}

export function deleteUserRole(id: number) {
  return del<ResultVo<null>>("/sys/userRole/delete", { id } as Record<string, unknown>);
}

/* ==================== 角色权限关联 ==================== */

export function getRolePermissionList(params: CommonListReq) {
  return get<ResultVo<PageVo<SysRolePermissionVo>>>(
    "/sys/rolePermission/getList",
    params as unknown as Record<string, unknown>
  );
}

export function getRolePermissionById(id: number) {
  return get<ResultVo<SysRolePermissionVo>>("/sys/rolePermission/getById", { id } as Record<
    string,
    unknown
  >);
}

export function createRolePermission(data: SysRolePermissionReq) {
  return post<ResultVo<null>>(
    "/sys/rolePermission/create",
    data as unknown as Record<string, unknown>
  );
}

export function updateRolePermission(data: SysRolePermissionReq & { id: number }) {
  return put<ResultVo<null>>(
    "/sys/rolePermission/update",
    data as unknown as Record<string, unknown>
  );
}

export function deleteRolePermission(id: number) {
  return del<ResultVo<null>>("/sys/rolePermission/delete", { id } as Record<string, unknown>);
}
