import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

(async () => {
  try {
    const el = document.getElementById("root") || document.getElementById("app");
    if (!el) {
      console.error("[DEBUG] mount element NOT found (looked for #root and #app).");
      return;
    }
    const Mod = await import("./App");
    console.log("[DEBUG] imported App module", Mod);
    const AppComp = Mod.default;
    createRoot(el).render(<AppComp />);
    console.log("[DEBUG] App.render called");
  } catch (err) {
    console.error("[DEBUG] error while loading or rendering App:", err);
  }
})();
