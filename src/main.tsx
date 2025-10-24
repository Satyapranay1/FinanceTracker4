import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider as ThemeContext } from "@/context/ThemeContext";

createRoot(document.getElementById("root")!).render(
    <ThemeContext>
        <App />
    </ThemeContext>
);
