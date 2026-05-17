import type { FormInstance } from "antd";
import { message, Modal } from "antd";
import { useCallback } from "react";

import { useModalForm, useModalFormWithForm } from "./useModalForm";

export interface UseCrudOptions<T = unknown, CreateDto = unknown, UpdateDto = unknown> {
  createApi?: (data: CreateDto) => Promise<unknown>;
  updateApi?: (data: UpdateDto & { id: number }) => Promise<unknown>;
  deleteApi?: (id: number) => Promise<unknown>;
  onRefresh?: () => void;
  successMessage?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  deleteConfirm?: {
    title?: string;
    content?: string | ((record: T) => string);
  };
}

export interface UseCrudReturn<T = unknown, CreateDto = unknown, UpdateDto = unknown>
  extends ReturnType<typeof useModalForm<T>> {
  deleteWithConfirm: (record: T, deleteFn?: () => Promise<void>) => Promise<void>;
  handleCreate: (data: CreateDto) => Promise<void>;
  handleUpdate: (data: UpdateDto & { id: number }) => Promise<void>;
}

export function useCrud<
  T = unknown,
  CreateDto = unknown,
  UpdateDto = unknown
>(
  options: UseCrudOptions<T, CreateDto, UpdateDto> = {}
): UseCrudReturn<T, CreateDto, UpdateDto> {
  const { createApi, updateApi, deleteApi, onRefresh, successMessage, deleteConfirm } = options;

  const modalForm = useModalForm<T>({
    onClose: () => {}
  });

  const handleCreate = useCallback(
    async (formData: CreateDto) => {
      if (createApi) {
        await createApi(formData);
        message.success(successMessage?.create ?? "创建成功");
      }
      modalForm.close();
      onRefresh?.();
    },
    [createApi, modalForm, onRefresh, successMessage]
  );

  const handleUpdate = useCallback(
    async (formData: UpdateDto & { id: number }) => {
      if (updateApi) {
        await updateApi(formData);
        message.success(successMessage?.update ?? "更新成功");
      }
      modalForm.close();
      onRefresh?.();
    },
    [modalForm, onRefresh, successMessage, updateApi]
  );

  const deleteWithConfirm = useCallback(
    async (record: T, deleteFn?: () => Promise<void>) => {
      const { title, content } = deleteConfirm ?? {};

      Modal.confirm({
        title: title ?? "确认删除",
        content:
          typeof content === "function" ? content(record) : content ?? "确定要删除吗？",
        okText: "确认",
        cancelText: "取消",
        okType: "danger",
        async onOk() {
          try {
            if (deleteApi && deleteFn) {
              await deleteFn();
            } else if (deleteApi) {
              await deleteApi((record as { id: number }).id);
            }
            message.success(successMessage?.delete ?? "删除成功");
            onRefresh?.();
          } catch (error) {
            console.error("Delete failed:", error);
          }
        }
      });
    },
    [deleteApi, deleteConfirm, onRefresh, successMessage]
  );

  return {
    ...modalForm,
    handleCreate,
    handleUpdate,
    deleteWithConfirm
  };
}

export function useCrudWithForm<
  T = unknown,
  CreateDto = unknown,
  UpdateDto = unknown
>(
  form: FormInstance<T>,
  options: UseCrudOptions<T, CreateDto, UpdateDto> = {}
): UseCrudReturn<T, CreateDto, UpdateDto> {
  const { createApi, updateApi, deleteApi, onRefresh, successMessage, deleteConfirm } = options;

  const modalForm = useModalFormWithForm<T>(form);

  const handleCreate = useCallback(
    async (formData: CreateDto) => {
      if (createApi) {
        await createApi(formData);
        message.success(successMessage?.create ?? "创建成功");
      }
      modalForm.close();
      onRefresh?.();
    },
    [createApi, modalForm, onRefresh, successMessage]
  );

  const handleUpdate = useCallback(
    async (formData: UpdateDto & { id: number }) => {
      if (updateApi) {
        await updateApi(formData);
        message.success(successMessage?.update ?? "更新成功");
      }
      modalForm.close();
      onRefresh?.();
    },
    [modalForm, onRefresh, successMessage, updateApi]
  );

  const deleteWithConfirm = useCallback(
    async (record: T, deleteFn?: () => Promise<void>) => {
      const { title, content } = deleteConfirm ?? {};

      Modal.confirm({
        title: title ?? "确认删除",
        content:
          typeof content === "function" ? content(record) : content ?? "确定要删除吗？",
        okText: "确认",
        cancelText: "取消",
        okType: "danger",
        async onOk() {
          try {
            if (deleteApi && deleteFn) {
              await deleteFn();
            } else if (deleteApi) {
              await deleteApi((record as { id: number }).id);
            }
            message.success(successMessage?.delete ?? "删除成功");
            onRefresh?.();
          } catch (error) {
            console.error("Delete failed:", error);
          }
        }
      });
    },
    [deleteApi, deleteConfirm, onRefresh, successMessage]
  );

  return {
    ...modalForm,
    handleCreate,
    handleUpdate,
    deleteWithConfirm
  };
}
