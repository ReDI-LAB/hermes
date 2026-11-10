import { useState } from "react";
import { Box } from "@mui/material";
import Header from "./components/Header";
import Home from "./components/Home";
import BrowseScreen from "./components/BrowseScreen";
import About from "./components/About";
import type { ProductGroup } from "./types/types";

console.log("Variable:", import.meta.env.VITE_VERCEL_ENV);
console.log("Global in app:",  __APP_ENV__);

type View =
  | { name: "home" }
  | { name: "about" }
  | { name: "browse"; categoryId: string; query: string; productId?: string };

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [prev, setPrev] = useState<View>({ name: "home" });

  const go = (v: View) => {
    window.scrollTo({ top: 0 });
    setView(v);
  };
  const openAbout = () => {
    if (view.name !== "about") setPrev(view);
    go({ name: "about" });
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Header onHome={() => go({ name: "home" })} onAbout={openAbout} />
      <Box component="main" sx={{ maxWidth: 560, mx: "auto", px: 2, pt: 1.5, pb: "env(safe-area-inset-bottom)" }}>
        {view.name === "home" && (
          <Home
            onCategory={(categoryId) => go({ name: "browse", categoryId, query: "" })}
            onSearch={(query) => go({ name: "browse", categoryId: "", query })}
            onPick={(g: ProductGroup) =>
              go({ name: "browse", categoryId: g.product.category_id, query: "", productId: g.product.product_id })
            }
          />
        )}
        {view.name === "about" && <About onBack={() => go(prev)} />}
        {view.name === "browse" && (
          <BrowseScreen
            key={`${view.categoryId}|${view.query}|${view.productId ?? ""}`}
            initialCategoryId={view.categoryId}
            initialQuery={view.query}
            initialProductId={view.productId}
            onBack={() => go({ name: "home" })}
          />
        )}
      </Box>
    </Box>
  );
}

