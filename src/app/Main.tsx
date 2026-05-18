import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./app/App.tsx";
import theme from "./theme";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline enableColorScheme />
    <App />
  </ThemeProvider>
);
