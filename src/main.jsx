import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { registerSW } from "virtual:pwa-register";
import { AppDialogProvider } from "./context/AppDialogProvider.jsx";
registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppDialogProvider>
      <App />
    </AppDialogProvider>
  </StrictMode>
);
