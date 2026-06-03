import { App as AntdApp } from "antd";
import { RouterProvider } from "react-router-dom";

import router from "@/router";
import { ThemeProvider } from "@/theme";

const App = () => {
  return (
    <ThemeProvider>
      <AntdApp>
        {" "}
        {/* 提供 antd 静态方法上下文 */}
        <RouterProvider router={router} />
      </AntdApp>
    </ThemeProvider>
  );
};

export default App;
