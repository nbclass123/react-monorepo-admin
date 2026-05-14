/// <reference types="vite/client" />

declare module 'virtual:svg-icons-register';
declare module 'virtual:svg-icons-names' {
  const icons: string[];
  export default icons;
}
declare module 'antd/es/app/useApp' {
  import type { MessageInstance } from 'antd/es/message/interface';
  import type { HookAPI as ModalHookAPI } from 'antd/es/modal/useModal';
  import type { NotificationInstance } from 'antd/es/notification/interface';
  interface AppContextType {
    message: MessageInstance;
    notification: NotificationInstance;
    modal: ModalHookAPI;
  }
  const useApp: () => AppContextType;
  export default useApp;
}
