import { useEffect, useState, type FormEvent } from "react";
import { Box, ButtonBase, IconButton, InputBase, Typography } from "@mui/material";
import Search from "@mui/icons-material/Search";
import Close from "@mui/icons-material/Close";
import { fetchSearch } from "../services/api";
import { groupByProduct, matchesProductName, productTitle, rankByQuery } from "../types/group";
import { categoryIcon, categoryLabel } from "../categoryUI";
import PricePill from "./PricePill";
import type { ProductGroup } from "../types/types";
import { c, fonts } from "../types/theme";

interface Props {
  onSubmit: (q: string) => void;
  onPick: (g: ProductGroup) => void;
}

export default function SearchBox({ onSubmit, onPick }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [done, setDone] = useState(false);

  const q = value.trim();

  useEffect(() => {
    if (q.length < 2) {
      setGroups([]);
      setDone(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetchSearch({ query: q }, ctrl.signal)
        .then((r) => {
          // Keep only products whose NAME contains the typed characters, best matches first
          const matching = groupByProduct(r.offerings).filter((g) => matchesProductName(g.product, q));
          setGroups(rankByQuery(matching, q).slice(0, 5));
          setDone(true);
        })
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q) onSubmit(q);
  };

  const open = focused && q.length >= 2 && done;

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        component="form"
        onSubmit={submit}
        role="search"
        sx={{
          display: "flex", alignItems: "center", gap: 1.5, px: 2.5, height: 60, borderRadius: 999, bgcolor: "#fff",
          border: `1.5px solid ${focused ? c.gold : c.goldSoft}`,
          boxShadow: focused ? `0 0 0 3px ${c.goldSoft}` : "none", transition: "box-shadow .15s",
        }}
      >
        <Search sx={{ color: c.ink }} />
        <InputBase
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Escape" && (e.target as HTMLInputElement).blur()}
          placeholder="What are you looking for? (e.g. Helles, Brezn, souvenirs)"
          inputProps={{ "aria-label": "Search for a product", enterKeyHint: "search" }}
          sx={{ fontSize: 17, color: c.ink, "& input::placeholder": { color: c.muted, opacity: 0.9 } }}
        />
        {value && (
          <IconButton
            size="small"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setValue("")}
            sx={{ bgcolor: "#F3EFE3" }}
          >
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      {open && (
        <Box
          onMouseDown={(e) => e.preventDefault()}
          sx={{
            position: "absolute", left: 0, right: 0, top: "calc(100% + 6px)", zIndex: 20, bgcolor: "#fff",
            borderRadius: 4, border: `1px solid ${c.line}`, boxShadow: "0 16px 40px rgba(8,32,63,.18)", overflow: "hidden",
          }}
        >
          {groups.length === 0 && (
            <Typography sx={{ p: 2.5, color: c.muted }}>No products found 🤷‍♂️</Typography>
          )}
          {groups.map((g, i) => (
            <ButtonBase
              key={g.product.product_id}
              onClick={() => onPick(g)}
              sx={{
                width: "100%", display: "flex", alignItems: "center", gap: 1.5, px: 1.75, py: 1.25, textAlign: "left",
                borderTop: i ? `1px solid ${c.line}` : "none", "&:hover, &:focus-visible": { bgcolor: "#FBF7EA" },
              }}
            >
              <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: c.navy, color: c.goldBright, display: "grid", placeItems: "center", flexShrink: 0 }}>
                {categoryIcon(g.product.category_id)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 21, color: c.ink, lineHeight: 1.15 }} noWrap>
                  {productTitle(g.product)}
                </Typography>
                <Typography sx={{ color: c.muted, fontSize: 15 }}>{categoryLabel(g.product.category)}</Typography>
              </Box>
              <PricePill price={g.minPrice} />
            </ButtonBase>
          ))}
        </Box>
      )}
    </Box>
  );
}
