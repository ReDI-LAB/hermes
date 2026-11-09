import { Box } from "@mui/material";
import { c, fonts } from "../types/theme";
import { money } from "../types/group";

interface Props {
  price: number | string;
  from?: boolean; // show the small "FROM" label
  variant?: "dark" | "gold"; // gold = best price
}

export default function PricePill({ price, from = true, variant = "dark" }: Props) {
  const gold = variant === "gold";
  return (
    <Box
      sx={{
        display: "inline-flex", alignItems: "baseline", gap: 0.75, bgcolor: gold ? c.gold : c.navy, color: gold ? c.navy : "#fff",
        borderRadius: 999, px: 1.5, py: 0.5, whiteSpace: "nowrap", fontFamily: fonts.display,
      }}
    >
      {from && <Box component="span" sx={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: gold ? c.navy : "#C9D3E3" }}>FROM</Box>}
      <Box component="span" sx={{ fontSize: 19, fontWeight: 700 }}>{money(price)}</Box>
    </Box>
  );
}
