import useApp from "antd/es/app/useApp";
import { useCallback } from "react";

/**
 * useModal Hook - 封装 Antd Modal 操作
 * 提供类型化的确认框、警告框，信息框、成功/错误提示
 *
 * @example
 * ```tsx
 * const { modal } = useModal();
 *
 * // 确认框
 * modal.confirm({
 *   title: '确认删除?',
 *   content: '此操作不可逆',
 *   onOk: async () => { await deleteItem(); }
 * });
 *
 * // 成功提示
 * modal.success({ content: '操作成功' });
 *
 * // 错误提示
 * modal.error({ content: '操作失败' });
 * ```
 */
export function useModal() {
  const { modal } = useApp();

  const confirm = useCallback(
    (
      config: Omit<
        Parameters<typeof modal.confirm>[0],
        "onOk" | "onCancel"
      > & {
        onOk?: () => void | Promise<void>;
        onCancel?: () => void;
      }
    ) => {
      return modal.confirm({
        ...config,
        onOk: async () => {
          await config.onOk?.();
        },
        onCancel: () => {
          config.onCancel?.();
        }
      });
    },
    [modal]
  );

  const warning = useCallback(
    (
      config: Omit<Parameters<typeof modal.warning>[0], "onOk"> & {
        onOk?: () => void | Promise<void>;
      }
    ) => {
      return modal.warning({
        ...config,
        onOk: async () => {
          await config.onOk?.();
        }
      });
    },
    [modal]
  );

  const info = useCallback(
    (config: Omit<Parameters<typeof modal.info>[0], "onOk"> & { onOk?: () => void }) => {
      return modal.info({
        ...config,
        onOk: () => {
          config.onOk?.();
        }
      });
    },
    [modal]
  );

  const success = useCallback(
    (config: Omit<Parameters<typeof modal.success>[0], "onOk"> & { onOk?: () => void }) => {
      return modal.success({
        ...config,
        onOk: () => {
          config.onOk?.();
        }
      });
    },
    [modal]
  );

  const error = useCallback(
    (config: Omit<Parameters<typeof modal.error>[0], "onOk"> & { onOk?: () => void }) => {
      return modal.error({
        ...config,
        onOk: () => {
          config.onOk?.();
        }
      });
    },
    [modal]
  );

  return {
    modal,
    confirm,
    warning,
    info,
    success,
    error
  };
}
