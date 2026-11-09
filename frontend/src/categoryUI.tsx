import type { ReactElement } from "react";
import SportsBar from "@mui/icons-material/SportsBar";
import Restaurant from "@mui/icons-material/Restaurant";
import Attractions from "@mui/icons-material/Attractions";
import TrackChanges from "@mui/icons-material/TrackChanges";
import CardGiftcard from "@mui/icons-material/CardGiftcard";
import type { Category } from "./types/types";

// Names as shown in the design (the API returns Food/Ride/Game/Merchandise)
const LABELS: Record<string, string> = { C001: "Drinks", C003: "Foods", C004: "Rides", C005: "Games", C006: "Souvenirs" };
const ICONS: Record<string, ReactElement> = {
  C001: <SportsBar />,
  C003: <Restaurant />,
  C004: <Attractions />,
  C005: <TrackChanges />,
  C006: <CardGiftcard />,
};

export const categoryLabel = (c: Pick<Category, "category_id" | "category_name">) => LABELS[c.category_id] ?? c.category_name;
export const categoryIcon = (id: string) => ICONS[id] ?? <CardGiftcard />;
// Rides/Games/Souvenirs expand their vendors inside the list; Drinks/Foods open a separate vendor page
export const INLINE_CATEGORIES = new Set(["C004", "C005", "C006"]);

// Filter chips per category. The ids "A001"... are attribute_id values sent to the backend.
// "_adult" / "_family" are not attributes: they are filtered in the browser using activity_details.family_friendly.
export const CATEGORY_CHIPS: Record<string, { id: string; name: string }[]> = {
  C001: [{ id: "A001", name: "Alcoholic" }, { id: "A002", name: "Non-Alcoholic" }],
  C003: [{ id: "A003", name: "Vegan" }, { id: "A004", name: "Non-Vegan" }],
  C004: [{ id: "_adult", name: "Adult-Friendly" }, { id: "_family", name: "Family-Friendly" }],
  C005: [{ id: "_adult", name: "Adult-Friendly" }, { id: "_family", name: "Family-Friendly" }],
  C006: [],
};
