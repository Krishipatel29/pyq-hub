import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { fontFamily: "var(--font-sans)", borderRadius: "10px", color: "#1b2130" },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
