import { Modal } from "antd";
import { useCallback, useMemo } from "react";

export interface DeleteConfirmOptions<T = unknown> {
  onBeforeConfirm?: (record: T) => void | Promise<void>;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  title?: string;
  content?: string | ((record: T) => string);
  okText?: string;
  cancelText?: string;
}

export interface UseDeleteConfirmReturn<T = unknown> {
  deleteWithConfirm: (record: T, deleteFn?: () => Promise<void>) => Promise<void>;
}

export function useDeleteConfirm<T = unknown>(
  options: DeleteConfirmOptions<T> = {}
): UseDeleteConfirmReturn<T> {
  const { onBeforeConfirm, onSuccess, onError, title, content, okText, cancelText } = options;

  const deleteWithConfirm = useCallback(
    async (record: T, deleteFn?: () => Promise<void>) => {
      try {
        await onBeforeConfirm?.(record);

        Modal.confirm({
          title: title ?? "确认删除",
          content: typeof content === "function" ? content(record) : (content ?? "确定要删除吗？"),
          okText: okText ?? "确认",
          cancelText: cancelText ?? "取消",
          okType: "danger",
          async onOk() {
            try {
              if (deleteFn) {
                await deleteFn();
              }
              await onSuccess?.();
            } catch (error) {
              await onError?.(error);
              throw error;
            }
          }
        });
      } catch (error) {
        await onError?.(error);
        throw error;
      }
    },
    [cancelText, content, onBeforeConfirm, onError, onSuccess, okText, title]
  );

  return useMemo(() => ({ deleteWithConfirm }), [deleteWithConfirm]);
}
