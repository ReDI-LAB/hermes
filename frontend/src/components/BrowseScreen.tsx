import { useMemo, useState } from "react";
import {
  Alert, Box, Button, ButtonBase, Chip, CircularProgress, IconButton, Menu, MenuItem, Stack, Tooltip, Typography,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Tune from "@mui/icons-material/Tune";
import { fetchCategories, fetchSearch } from "../services/api";
import { useAsync } from "../types/useAsync";
import { groupByProduct, isBestPrice, matchesProductName, money, productTitle, sortGroups, sortOfferingsByPrice, type SortOrder } from "../types/group";
import { CATEGORY_CHIPS, categoryLabel, INLINE_CATEGORIES } from "../categoryUi";
import type { ProductGroup } from "../types/types";
import OfferingRow from "./OfferingRow";
import PricePill from "./PricePill";
import BudgetDialog from "./BudgetDialog";
import SortIcon from "./SortIcon";
import { c, fonts } from "../types/theme";

const PAGE_SIZE = 8;

interface Props {
  initialCategoryId: string; // "" = search results across all categories
  initialQuery: string;
  initialProductId?: string; // product picked from the search suggestions
  onBack: () => void;
}

const card = { border: `1.5px solid ${c.goldSoft}`, borderRadius: 4, bgcolor: c.card, overflow: "hidden" } as const;
const toggle = (order: SortOrder): SortOrder => (order === "asc" ? "desc" : "asc");

export default function BrowseScreen({ initialCategoryId, initialQuery, initialProductId, onBack }: Props) {
  const searchMode = !initialCategoryId && !!initialQuery;
  const query = searchMode ? initialQuery : "";

  // --- UI state -----------------------------------------------------------
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [attr, setAttr] = useState(""); // "" = All, otherwise an attribute_id or "_adult" / "_family"
  const [nameOrder, setNameOrder] = useState<SortOrder>("asc"); // product list: A–Z / Z–A
  const [priceOrder, setPriceOrder] = useState<SortOrder>("asc"); // vendor list: cheapest first / last
  const [maxPrice, setMaxPrice] = useState<number | null>(null); // budget
  const [visible, setVisible] = useState(PAGE_SIZE); // "Show more" for products
  const [vendorVisible, setVendorVisible] = useState(PAGE_SIZE); // "Show more" for vendors
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [catAnchor, setCatAnchor] = useState<HTMLElement | null>(null);

  const inlineStart = INLINE_CATEGORIES.has(initialCategoryId) && !initialQuery;
  const [selectedId, setSelectedId] = useState<string | null>(!inlineStart && initialProductId ? initialProductId : null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(inlineStart && initialProductId ? [initialProductId] : []));

  const inline = !searchMode && INLINE_CATEGORIES.has(categoryId); // vendors open inside the list
  const detail = selectedId !== null; // vendor page of one product

  // --- Data ---------------------------------------------------------------
  const categories = useAsync((s) => fetchCategories(s), []);
  const categoryName = (() => {
    const found = categories.data?.find((x) => x.category_id === categoryId);
    return found ? categoryLabel(found) : "";
  })();

  // Every filter that the backend understands goes into this one request.
  const serverAttr = attr && !attr.startsWith("_") ? attr : undefined;
  const list = useAsync(
    (s) => fetchSearch({ categoryId, query, attributeId: serverAttr, maxPrice: maxPrice ?? undefined }, s),
    [categoryId, serverAttr, maxPrice],
  );

  // Adult/Family chips are filtered here in the browser (they use activity_details).
  const family = attr === "_family" ? true : attr === "_adult" ? false : undefined;
  const groups = useMemo(() => {
    const offerings = (list.data?.offerings ?? []).filter(
      (o) => family === undefined || (o.activity_details ? o.activity_details.family_friendly === family : true),
    );
    const products = groupByProduct(offerings);
    // Search results: only products whose name contains the typed characters
    return sortGroups(searchMode ? products.filter((g) => matchesProductName(g.product, query)) : products, nameOrder);
  }, [list.data, family, nameOrder, searchMode, query]);

  const selected = groups.find((g) => g.product.product_id === selectedId) ?? null;
  const vendors = useMemo(() => (selected ? sortOfferingsByPrice(selected.offerings, priceOrder) : []), [selected, priceOrder]);

  // --- Handlers -----------------------------------------------------------
  const openProduct = (id: string) => { setSelectedId(id); setVendorVisible(PAGE_SIZE); };
  const resetView = () => { setSelectedId(null); setExpanded(new Set()); setVisible(PAGE_SIZE); };
  const toggleExpanded = (id: string) =>
    setExpanded((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const ascending = (detail ? priceOrder : nameOrder) === "asc";
  const sortLabel = detail
    ? (ascending ? "Sorted low to high" : "Sorted high to low")
    : (ascending ? "Sorted A to Z" : "Sorted Z to A");
  const toggleSort = () => {
    if (detail) setPriceOrder(toggle); else setNameOrder(toggle);
    setVisible(PAGE_SIZE);
    setVendorVisible(PAGE_SIZE);
  };

  // --- Small render helpers ----------------------------------------------
  const renderProductRow = (g: ProductGroup, first: boolean) => {
    const id = g.product.product_id;
    const open = expanded.has(id);
    return (
      <Box key={id} sx={{ borderTop: first ? "none" : `1px solid ${c.line}` }}>
        <ButtonBase
          onClick={() => (inline ? toggleExpanded(id) : openProduct(id))}
          aria-expanded={inline ? open : undefined}
          sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1.5, px: { xs: 2, sm: 2.5 }, py: 1.75, textAlign: "left", "&:hover": { bgcolor: "#FBF7EA" } }}
        >
          <Typography sx={{ flex: 1, fontFamily: fonts.display, fontWeight: 600, fontSize: { xs: 21, sm: 24 }, color: c.ink, lineHeight: 1.15 }}>
            {productTitle(g.product)}
          </Typography>
          <PricePill price={g.minPrice} />
          {inline ? (
            <ExpandMore sx={{ color: c.gold, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          ) : (
            <ChevronRight sx={{ color: c.muted }} />
          )}
        </ButtonBase>
        {inline && open && (
          <Box sx={{ bgcolor: "#F7F2E2", borderTop: `1px solid ${c.line}` }}>
            {sortOfferingsByPrice(g.offerings, "asc").map((o) => (
              <OfferingRow key={o.offering_id} offering={o} best={isBestPrice(o, g)} />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const renderFooter = (total: number, visibleCount: number, onMore: () => void) => (
    <Stack spacing={2} sx={{ alignItems: "center", mt: 3 }}>
      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, letterSpacing: ".2em", color: "#4C607A", fontSize: 15 }}>
        SHOWING {Math.min(visibleCount, total)} OF {total}
      </Typography>
      {visibleCount < total && (
        <Button
          onClick={onMore}
          sx={{ bgcolor: c.navy, color: "#fff", borderRadius: 999, px: 4, py: 1.25, fontFamily: fonts.display, fontWeight: 700, fontSize: 18, letterSpacing: ".14em", "&:hover": { bgcolor: "#0d2c52" } }}
        >
          SHOW MORE
        </Button>
      )}
    </Stack>
  );

  const emptyBox = (title: string, text: string) => (
    <Box sx={{ ...card, p: 3, textAlign: "center" }}>
      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 24, color: c.ink }}>{title}</Typography>
      <Typography sx={{ color: c.muted, mt: 0.5 }}>{text}</Typography>
      {maxPrice !== null && <Button onClick={() => setMaxPrice(null)} sx={{ mt: 1.5, color: c.ink }}>Clear budget</Button>}
    </Box>
  );

  const chips = [{ id: "", name: "All" }, ...(CATEGORY_CHIPS[categoryId] ?? [])];
  const ready = !list.loading && !list.error;

  return (
    <Box sx={{ pt: 2, pb: 8 }}>
      {/* Title: back arrow + category switcher (or search title) */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2.5 }}>
        <IconButton onClick={detail ? () => setSelectedId(null) : onBack} aria-label="Back" sx={{ color: c.ink }}>
          <ArrowBack />
        </IconButton>
        {searchMode ? (
          <Typography component="h1" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: { xs: 22, sm: 28 }, color: c.ink }}>
            RESULTS FOR “{initialQuery.toUpperCase()}”
          </Typography>
        ) : (
          <>
            <ButtonBase onClick={(e) => setCatAnchor(e.currentTarget)} aria-haspopup="menu" sx={{ gap: 1, borderRadius: 2, px: 0.5 }}>
              <Typography component="h1" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 30, color: c.ink }}>
                {categoryName.toUpperCase()}
              </Typography>
              <ExpandMore sx={{ color: c.ink }} />
            </ButtonBase>
            <Menu anchorEl={catAnchor} open={!!catAnchor} onClose={() => setCatAnchor(null)}>
              {categories.data?.map((cat) => (
                <MenuItem
                  key={cat.category_id}
                  selected={cat.category_id === categoryId}
                  onClick={() => {
                    setCatAnchor(null);
                    if (cat.category_id !== categoryId) { setCategoryId(cat.category_id); setAttr(""); resetView(); }
                  }}
                  sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 20, minWidth: 180 }}
                >
                  {categoryLabel(cat)}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Stack>

      {/* Filter chips + budget + sort */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ flex: 1, overflowX: "auto", py: 0.5, px: 0.25, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
          {!searchMode && chips.map((chip) => {
            const active = attr === chip.id;
            return (
              <Chip
                key={chip.id || "all"}
                label={chip.name}
                clickable
                onClick={() => { setAttr(chip.id); setSelectedId(null); setVisible(PAGE_SIZE); }}
                aria-pressed={active}
                sx={{
                  height: 42, px: 0.75, borderRadius: 999, fontSize: 17, fontWeight: 500, bgcolor: "#fff", flexShrink: 0,
                  color: active ? c.gold : c.ink, border: `${active ? 2 : 1}px solid ${active ? c.gold : "#E4DCC3"}`,
                }}
              />
            );
          })}
        </Stack>
        <Tooltip title="Set your budget">
          <IconButton
            onClick={(e) => {
              e.currentTarget.blur(); // release focus before the dialog hides the page (avoids the aria-hidden warning)
              setBudgetOpen(true);
            }}
            aria-label="Set your budget"
            sx={{ bgcolor: "#fff", color: c.gold, width: 46, height: 46, boxShadow: "0 2px 8px rgba(8,32,63,.1)", border: "2px solid transparent", "&:hover": { bgcolor: "#fff", borderColor: c.gold }, ...(maxPrice !== null && { borderColor: c.gold }) }}
          >
            <Tune />
          </IconButton>
        </Tooltip>
        <Tooltip title={sortLabel}>
          <IconButton
            onClick={toggleSort}
            aria-label={`${sortLabel}. Click to reverse the order.`}
            sx={{ color: c.gold, width: 46, height: 46, border: "2px solid transparent", "&:hover, &:focus": { bgcolor: "transparent", borderColor: c.gold } }}
          >
            <SortIcon kind={detail ? "num" : "alpha"} order={ascending ? "asc" : "desc"} />
          </IconButton>
        </Tooltip>
      </Stack>

      {maxPrice !== null && (
        <Chip
          label={`Up to ${money(maxPrice)}`}
          onDelete={() => { setMaxPrice(null); setVisible(PAGE_SIZE); }}
          sx={{ mb: 1.5, height: 34, bgcolor: c.goldSoft, color: c.ink, fontWeight: 700, fontFamily: fonts.display, fontSize: 18 }}
        />
      )}

      {/* Vendor page heading */}
      {detail && (
        <Box sx={{ mt: 3, mb: 1.5 }}>
          <Typography component="h2" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 24, color: c.ink, textTransform: "uppercase", lineHeight: 1.15 }}>
            {selected ? productTitle(selected.product) : "Product"}
          </Typography>
          <Typography sx={{ color: c.muted, fontSize: 15 }}>
            {selected ? `${selected.offerings.length} ${selected.offerings.length === 1 ? "vendor" : "vendors"} found` : "No vendors found"}
          </Typography>
        </Box>
      )}

      {/* Content */}
      {list.loading && <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress sx={{ color: c.gold }} /></Box>}
      {list.error && <Alert severity="error">Couldn’t load prices. {list.error}</Alert>}

      {ready && !detail && (
        groups.length === 0 ? emptyBox("Nothing found", "Try another filter or a higher budget.") : (
          <>
            <Box sx={card}>{groups.slice(0, visible).map((g, i) => renderProductRow(g, i === 0))}</Box>
            {renderFooter(groups.length, visible, () => setVisible((v) => v + PAGE_SIZE))}
          </>
        )
      )}

      {ready && detail && (
        selected ? (
          <>
            <Box sx={card}>
              {vendors.slice(0, vendorVisible).map((o) => (
                <OfferingRow key={o.offering_id} offering={o} best={isBestPrice(o, selected)} />
              ))}
            </Box>
            {renderFooter(vendors.length, vendorVisible, () => setVendorVisible((v) => v + PAGE_SIZE))}
          </>
        ) : emptyBox("No vendors in this budget", "Try a higher maximum price.")
      )}

      <BudgetDialog
        open={budgetOpen}
        value={maxPrice}
        onClose={() => setBudgetOpen(false)}
        onApply={(value) => { setMaxPrice(value); setBudgetOpen(false); setVisible(PAGE_SIZE); setVendorVisible(PAGE_SIZE); }}
      />
    </Box>
  );
}
