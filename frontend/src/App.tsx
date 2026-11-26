import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Header from "./components/Header";
import Home from "./components/Home";
import BrowseScreen from "./components/BrowseScreen";
import About from "./components/About";
import type { ProductGroup } from "./types/types";

type View =
  | { name: "home" }
  | { name: "about" }
  | { name: "browse"; categoryId: string; query: string; productId?: string };

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [prev, setPrev] = useState<View>({ name: "home" });

  const theme = useTheme();
  // Mobile-first responsive
  const isTabletOrUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const go = (v: View) => {
    window.scrollTo({ top: 0 });
    setView(v);
  };

  const openAbout = () => {
    if (view.name !== "about") setPrev(view);
    go({ name: "about" });
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "clip",
      }}
    >
      <Header
        onHome={() => go({ name: "home" })}
        onAbout={openAbout}
        isTabletOrUp={isTabletOrUp}
      />

      <Box
        component="main"
        sx={{
          width: "100%",
          maxWidth: isDesktop ? 820 : isTabletOrUp ? 640 : 560,
          minWidth: 0,
          mx: "auto",
          px: isTabletOrUp ? 3 : 1.75,
          pt: isTabletOrUp ? 2 : 1.25,
          pb: "calc(20px + env(safe-area-inset-bottom))",
        }}
      >
        {view.name === "home" && (
          <Home
            isTabletOrUp={isTabletOrUp}
            onCategory={(categoryId) => go({ name: "browse", categoryId, query: "" })}
            onSearch={(query) => go({ name: "browse", categoryId: "", query })}
            onPick={(g: ProductGroup) =>
              go({
                name: "browse",
                categoryId: g.product.category_id,
                query: "",
                productId: g.product.product_id,
              })
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