import { Alert, Box, ButtonBase, Skeleton, Typography } from "@mui/material";
import ChevronRight from "@mui/icons-material/ChevronRight";
import BakeryDining from "@mui/icons-material/BakeryDining";
import { fetchCategories } from "../services/api";
import { useAsync } from "../types/useAsync";
import { categoryIcon, categoryLabel } from "../categoryUi";
import SearchBox from "./SearchBox";
import type { ProductGroup } from "../types/types";
import { c, fonts } from "../types/theme";

interface Props {
  onCategory: (categoryId: string) => void;
  onSearch: (q: string) => void;
  onPick: (g: ProductGroup) => void;
}

export default function Home({ onCategory, onSearch, onPick }: Props) {
  const categories = useAsync((s) => fetchCategories(s), []);
  const list = categories.data ?? [];

  return (
    <Box sx={{ pt: 4, pb: 6 }}>
      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, letterSpacing: ".2em", color: c.gold }}>
        THERESIENWIESE · MÜNCHEN
      </Typography>
      <Typography component="h1" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: { xs: 33, sm: 54 }, lineHeight: 1.02, color: c.ink, mt: 1 }}>
        FIND THE BEST PRICES AT
        <Box component="span" sx={{ display: "block", fontFamily: fonts.fraktur, fontWeight: 700, fontSize: { xs: 40, sm: 60 }, lineHeight: 1.1 }}>
          Oktoberfest
        </Box>
      </Typography>
      <Typography sx={{ color: c.muted, fontSize: { xs: 18, sm: 20 }, lineHeight: 1.5, mt: 2.5, mb: 4, maxWidth: 380 }}>
        Search for a product, set your budget and compare vendors.
      </Typography>

      <SearchBox onSubmit={onSearch} onPick={onPick} />

      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, letterSpacing: ".2em", color: "#4C607A", mt: 5, mb: 1.5 }}>
        BROWSE THE WIESN
      </Typography>

      {categories.error && <Alert severity="error">Couldn’t load categories. {categories.error}</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.75 }}>
        {categories.loading && [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={64} sx={{ gridColumn: i === 4 ? "1 / -1" : undefined }} />)}
        {list.map((cat, i) => (
          <ButtonBase
            key={cat.category_id}
            onClick={() => onCategory(cat.category_id)}
            sx={{
              gridColumn: list.length % 2 === 1 && i === list.length - 1 ? "1 / -1" : undefined,
              display: "flex", alignItems: "center", gap: 2, px: 2.5, height: 64, borderRadius: 4,
              bgcolor: c.tile, color: "#fff", border: `1.5px solid ${c.gold}66`, justifyContent: "flex-start",
              boxShadow: "0 4px 10px rgba(8,32,63,.18)", transition: "transform .12s, border-color .12s",
              "&:hover": { borderColor: c.goldBright, transform: "translateY(-1px)" },
            }}
          >
            <Box sx={{ color: c.goldBright, display: "grid" }}>{categoryIcon(cat.category_id)}</Box>
            <Typography sx={{ flex: 1, textAlign: "left", fontFamily: fonts.display, fontWeight: 700, fontSize: 22, letterSpacing: ".04em" }}>
              {categoryLabel(cat).toUpperCase()}
            </Typography>
            <ChevronRight sx={{ color: c.goldBright }} />
          </ButtonBase>
        ))}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 5, color: c.muted }}>
        <BakeryDining sx={{ color: c.gold }} />
        <Typography>Sample prices in line with recent Wiesn ranges</Typography>
      </Box>
    </Box>
  );
}
