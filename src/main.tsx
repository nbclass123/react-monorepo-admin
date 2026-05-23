import { StrictMode } from "react";
import { App } from "antd";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import router from "@/router/index";
import { ThemeProvider } from "@/theme";

import "virtual:svg-icons-register";
import "./index.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App>
        <RouterProvider router={router} />
      </App>
    </ThemeProvider>
  </StrictMode>
);
