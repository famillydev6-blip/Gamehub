import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle uncaught DOM errors silently to prevent crashes
// These are typically harmless animation-related removeChild errors
window.addEventListener("error", (event) => {
  if (
    event.error?.message?.includes("removeChild") ||
    event.error?.message?.includes("Failed to execute")
  ) {
    event.preventDefault();
    console.warn("Non-critical DOM manipulation error suppressed:", event.error);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
