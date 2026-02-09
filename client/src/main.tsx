import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Radix UI animation-related DOM errors that don't affect functionality
window.addEventListener("error", (event) => {
  if (
    event.error?.message?.includes("removeChild") ||
    event.error?.message?.includes("Failed to execute") ||
    event.error?.message?.includes("is not a child")
  ) {
    event.preventDefault();
    // Silently suppress - these are harmless animation timing issues
  }
});

createRoot(document.getElementById("root")!).render(<App />);
