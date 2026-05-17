import type { FormInstance } from "antd";
import { useCallback, useState } from "react";

export type ModalMode = "create" | "edit" | "view";

export interface UseModalFormOptions {
  onClose?: () => void;
}

export interface UseModalFormReturn<T = unknown> {
  visible: boolean;
  mode: ModalMode;
  data: T | null;
  isView: boolean;
  isEdit: boolean;
  isCreate: boolean;
  open: (mode: ModalMode, data?: T | null) => void;
  close: () => void;
  setData: (data: T | null) => void;
  setMode: (mode: ModalMode) => void;
}

export function useModalForm<T = unknown>(
  options: UseModalFormOptions = {}
): UseModalFormReturn<T> {
  const { onClose } = options;

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<ModalMode>("create");
  const [data, setData] = useState<T | null>(null);

  const open = useCallback(
    (newMode: ModalMode, newData?: T | null) => {
      setMode(newMode);
      setData(newData ?? null);
      setVisible(true);
    },
    []
  );

  const close = useCallback(() => {
    setVisible(false);
    setMode("create");
    setData(null);
    onClose?.();
  }, [onClose]);

  const setDataValue = useCallback((newData: T | null) => {
    setData(newData);
  }, []);

  const setModeValue = useCallback((newMode: ModalMode) => {
    setMode(newMode);
  }, []);

  return {
    visible,
    mode,
    data,
    isView: mode === "view",
    isEdit: mode === "edit",
    isCreate: mode === "create",
    open,
    close,
    setData: setDataValue,
    setMode: setModeValue
  };
}

export function useModalFormWithForm<T = unknown>(
  form: FormInstance<T>
): UseModalFormReturn<T> {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<ModalMode>("create");
  const [data, setData] = useState<T | null>(null);

  const open = useCallback(
    (newMode: ModalMode, newData?: T | null) => {
      setMode(newMode);
      const record = newData ?? null;
      setData(record);

      if (record) {
        // @ts-expect-error - T is compatible with RecursivePartial<T> for form fields
        form.setFieldsValue(record);
      } else {
        form.resetFields();
      }

      setVisible(true);
    },
    [form]
  );

  const close = useCallback(() => {
    setVisible(false);
    setMode("create");
    setData(null);
    form.resetFields();
  }, [form]);

  const setDataValue = useCallback(
    (newData: T | null) => {
      setData(newData);
      if (newData) {
        // @ts-expect-error - T is compatible with RecursivePartial<T> for form fields
        form.setFieldsValue(newData);
      }
    },
    [form]
  );

  const setModeValue = useCallback((newMode: ModalMode) => {
    setMode(newMode);
  }, []);

  return {
    visible,
    mode,
    data,
    isView: mode === "view",
    isEdit: mode === "edit",
    isCreate: mode === "create",
    open,
    close,
    setData: setDataValue,
    setMode: setModeValue
  };
}
