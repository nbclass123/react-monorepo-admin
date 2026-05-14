import { get, post, put, del } from "@/api/index";
import type { ResultVo, PageVo } from "@/api/module/user";

/* ==================== 通用 ==================== */

export interface BlogListReq {
  page: number;
  size: number;
  id?: number;
  status?: number;
}

export interface BlogCategoryVo {
  id: number;
  categoryName: string;
  categorySlug: string;
  sortOrder: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategoryReq {
  id?: number;
  categoryName: string;
  categorySlug: string;
  sortOrder?: number;
  status?: number;
}

export interface BlogTagVo {
  id: number;
  tagName: string;
  tagSlug: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTagReq {
  id?: number;
  tagName: string;
  tagSlug: string;
  status?: number;
}

export interface BlogPostVo {
  id: number;
  title: string;
  summary: string;
  content: string;
  coverUrl: string;
  authorId: number;
  categoryId: number;
  status: number;
  isTop: number;
  isCommentEnabled: number;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  tagIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostReq {
  id?: number;
  title: string;
  content: string;
  authorId?: number;
  summary?: string;
  coverUrl?: string;
  categoryId: number;
  tagIds?: number[];
  status?: number;
  isTop?: number;
  isCommentEnabled?: number;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
}

export interface BlogPostTagVo {
  id: number;
  postId: number;
  tagId: number;
  createdAt: string;
}

export interface BlogPostTagReq {
  id?: number;
  postId: number;
  tagId: number;
}

export interface BlogCommentVo {
  id: number;
  postId: number;
  parentId: number | null;
  userId: number;
  nickname: string;
  email: string;
  content: string;
  ipAddress: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCommentReq {
  id?: number;
  postId: number;
  nickname: string;
  content: string;
  parentId?: number;
  userId?: number;
  email?: string;
  ipAddress?: string;
  status?: number;
}

export interface BlogPostViewVo {
  id: number;
  postId: number;
  statDate: string;
  pvCount: number;
  uvCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostViewReq {
  id?: number;
  postId: number;
  statDate: string;
  pvCount?: number;
  uvCount?: number;
}

export interface BlogConfigVo {
  id: number;
  configKey: string;
  configValue: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogConfigReq {
  id?: number;
  configKey: string;
  configValue: string;
  remark?: string;
}

/* ==================== 分类 ==================== */

export function getCategoryList(params: BlogListReq) {
  return get<ResultVo<PageVo<BlogCategoryVo>>>("/blog/category/getList", params as unknown as Record<string, unknown>);
}

export function getCategoryById(id: number) {
  return get<ResultVo<BlogCategoryVo>>("/blog/category/getById", { id } as Record<string, unknown>);
}

export function createCategory(data: BlogCategoryReq) {
  return post<ResultVo<null>>("/blog/category/create", data as unknown as Record<string, unknown>);
}

export function updateCategory(data: BlogCategoryReq & { id: number }) {
  return put<ResultVo<null>>("/blog/category/update", data as unknown as Record<string, unknown>);
}

export function deleteCategory(id: number) {
  return del<ResultVo<null>>("/blog/category/delete", { id } as Record<string, unknown>);
}

/* ==================== 标签 ==================== */

export function getTagList(params: BlogListReq) {
  return get<ResultVo<PageVo<BlogTagVo>>>("/blog/tag/getList", params as unknown as Record<string, unknown>);
}

export function getTagById(id: number) {
  return get<ResultVo<BlogTagVo>>("/blog/tag/getById", { id } as Record<string, unknown>);
}

export function createTag(data: BlogTagReq) {
  return post<ResultVo<null>>("/blog/tag/create", data as unknown as Record<string, unknown>);
}

export function updateTag(data: BlogTagReq & { id: number }) {
  return put<ResultVo<null>>("/blog/tag/update", data as unknown as Record<string, unknown>);
}

export function deleteTag(id: number) {
  return del<ResultVo<null>>("/blog/tag/delete", { id } as Record<string, unknown>);
}

/* ==================== 文章 ==================== */

export function getPostList(params: BlogListReq) {
  return get<ResultVo<PageVo<BlogPostVo>>>("/blog/post/getList", params as unknown as Record<string, unknown>);
}

export function getPostById(id: number) {
  return get<ResultVo<BlogPostVo>>("/blog/post/getById", { id } as Record<string, unknown>);
}

export function createPost(data: BlogPostReq) {
  return post<ResultVo<null>>("/blog/post/create", data as unknown as Record<string, unknown>);
}

export function updatePost(data: BlogPostReq & { id: number }) {
  return put<ResultVo<null>>("/blog/post/update", data as unknown as Record<string, unknown>);
}

export function deletePost(id: number) {
  return del<ResultVo<null>>("/blog/post/delete", { id } as Record<string, unknown>);
}

export function publishPost(id: number) {
  return put<ResultVo<null>>("/blog/post/publish", { id } as Record<string, unknown>);
}

export function offlinePost(id: number) {
  return put<ResultVo<null>>("/blog/post/offline", { id } as Record<string, unknown>);
}

/* ==================== 标签关联 ==================== */

export function getPostTagList(params: BlogListReq) {
  return get<ResultVo<PageVo<BlogPostTagVo>>>("/blog/postTag/getList", params as unknown as Record<string, unknown>);
}

export function getPostTagById(id: number) {
  return get<ResultVo<BlogPostTagVo>>("/blog/postTag/getById", { id } as Record<string, unknown>);
}

export function createPostTag(data: BlogPostTagReq) {
  return post<ResultVo<null>>("/blog/postTag/create", data as unknown as Record<string, unknown>);
}

export function updatePostTag(data: BlogPostTagReq & { id: number }) {
  return put<ResultVo<null>>("/blog/postTag/update", data as unknown as Record<string, unknown>);
}

export function deletePostTag(id: number) {
  return del<ResultVo<null>>("/blog/postTag/delete", { id } as Record<string, unknown>);
}

/* ==================== 评论 ==================== */

export function getCommentList(params: BlogListReq) {
  return get<ResultVo<PageVo<BlogCommentVo>>>("/blog/comment/getList", params as unknown as Record<string, unknown>);
}

export function getCommentById(id: number) {
  return get<ResultVo<BlogCommentVo>>("/blog/comment/getById", { id } as Record<string, unknown>);
}

export function createComment(data: BlogCommentReq) {
  return post<ResultVo<null>>("/blog/comment/create", data as unknown as Record<string, unknown>);
}

export function updateComment(data: BlogCommentReq & { id: number }) {
  return put<ResultVo<null>>("/blog/comment/update", data as unknown as Record<string, unknown>);
}

export function deleteComment(id: number) {
  return del<ResultVo<null>>("/blog/comment/delete", { id } as Record<string, unknown>);
}

export function reviewComment(id: number, status: number) {
  return put<ResultVo<null>>("/blog/comment/review", { id, status } as unknown as Record<string, unknown>);
}

/* ==================== 访问统计 ==================== */

export function getPostViewList(params: BlogListReq) {
  return get<ResultVo<PageVo<BlogPostViewVo>>>("/blog/postView/getList", params as unknown as Record<string, unknown>);
}

export function getPostViewById(id: number) {
  return get<ResultVo<BlogPostViewVo>>("/blog/postView/getById", { id } as Record<string, unknown>);
}

export function createPostView(data: BlogPostViewReq) {
  return post<ResultVo<null>>("/blog/postView/create", data as unknown as Record<string, unknown>);
}

export function updatePostView(data: BlogPostViewReq & { id: number }) {
  return put<ResultVo<null>>("/blog/postView/update", data as unknown as Record<string, unknown>);
}

export function deletePostView(id: number) {
  return del<ResultVo<null>>("/blog/postView/delete", { id } as Record<string, unknown>);
}

/* ==================== 系统配置 ==================== */

export function getConfigList(params: BlogListReq) {
  return get<ResultVo<PageVo<BlogConfigVo>>>("/blog/config/getList", params as unknown as Record<string, unknown>);
}

export function getConfigById(id: number) {
  return get<ResultVo<BlogConfigVo>>("/blog/config/getById", { id } as Record<string, unknown>);
}

export function createConfig(data: BlogConfigReq) {
  return post<ResultVo<null>>("/blog/config/create", data as unknown as Record<string, unknown>);
}

export function updateConfig(data: BlogConfigReq & { id: number }) {
  return put<ResultVo<null>>("/blog/config/update", data as unknown as Record<string, unknown>);
}

export function deleteConfig(id: number) {
  return del<ResultVo<null>>("/blog/config/delete", { id } as Record<string, unknown>);
}
