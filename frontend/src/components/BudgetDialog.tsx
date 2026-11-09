import { useEffect, useState } from "react";
import { Box, Button, Dialog, IconButton, InputBase, Slider, Typography } from "@mui/material";
import Close from "@mui/icons-material/Close";
import { c, fonts } from "../types/theme";

/** Budget slider range in euro. */
export const BUDGET_MIN = 0;
export const BUDGET_MAX = 20;

// Small navy triangles along the top edge of the dialog
const triangles = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'><path d='M0 0H12L6 7Z' fill='${c.navy}'/></svg>`,
)}")`;

interface Props {
  open: boolean;
  value: number | null; // currently applied maximum price (null = no budget)
  onClose: () => void;
  onApply: (maxPrice: number) => void;
}

export default function BudgetDialog({ open, value, onClose, onApply }: Props) {
  const [amount, setAmount] = useState(BUDGET_MAX);
  const [text, setText] = useState(String(BUDGET_MAX));

  // Every time the dialog opens, start from the applied budget
  useEffect(() => {
    if (open) {
      const start = value ?? BUDGET_MAX;
      setAmount(start);
      setText(String(start));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onType = (raw: string) => {
    const t = raw.replace(",", ".");
    if (!/^\d{0,2}(\.\d{0,2})?$/.test(t)) return; // digits only, max 2 decimals
    setText(t);
    const n = parseFloat(t);
    if (!Number.isNaN(n)) setAmount(Math.min(Math.max(n, BUDGET_MIN), BUDGET_MAX));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="budget-title"
      slotProps={{
        backdrop: { sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(8,32,63,.45)" } },
        paper: { sx: { width: "100%", maxWidth: 400, m: 2, borderRadius: 5, bgcolor: c.cream, border: `2px solid ${c.goldBright}`, overflow: "hidden" } },
      }}
    >
      <Box sx={{ position: "relative", px: 3, pt: 4, pb: 3.5 }}>
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 7, backgroundImage: triangles, backgroundRepeat: "repeat-x", backgroundSize: "12px 7px" }} />

        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, color: c.ink, border: `2px solid ${c.goldBright}` }}
        >
          <Close />
        </IconButton>

        <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 13, letterSpacing: ".2em", color: c.gold }}>YOUR BUDGET</Typography>
        <Typography id="budget-title" component="h2" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 28, color: c.ink, lineHeight: 1.1 }}>
          MAXIMUM PRICE
        </Typography>
        <Typography sx={{ color: c.muted, fontSize: 17, lineHeight: 1.45, mt: 1, mb: 3, maxWidth: 270 }}>
          Set your maximum price to see available vendors.
        </Typography>

        <Slider
          value={amount}
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={0.5}
          onChange={(_, v) => {
            setAmount(v as number);
            setText(String(v));
          }}
          aria-label="Maximum price"
          sx={{
            color: c.navy, height: 5, mb: 2,
            "& .MuiSlider-rail": { opacity: 1, bgcolor: c.navy },
            "& .MuiSlider-thumb": { width: 26, height: 26, bgcolor: c.goldBright, boxShadow: `0 0 0 5px ${c.goldSoft}`, "&:hover, &.Mui-focusVisible": { boxShadow: `0 0 0 8px ${c.goldSoft}` } },
          }}
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", mb: 1.5 }}>
          <Typography sx={{ color: c.muted }}>€{BUDGET_MIN}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, height: 54, borderRadius: 999, bgcolor: "#fff", border: `2px solid ${c.goldSoft}` }}>
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 26, color: c.ink }}>€</Typography>
            <InputBase
              value={text}
              onChange={(e) => onType(e.target.value)}
              onBlur={() => setText(String(amount))}
              onKeyDown={(e) => e.key === "Enter" && onApply(amount)}
              inputProps={{ inputMode: "decimal", "aria-label": "Maximum price in euro", style: { width: 56, fontFamily: fonts.display, fontWeight: 700, fontSize: 26, color: c.ink } }}
            />
          </Box>
          <Typography sx={{ color: c.muted, textAlign: "right" }}>€{BUDGET_MAX}</Typography>
        </Box>

        <Typography sx={{ textAlign: "center", color: c.muted, fontSize: 15, mb: 3 }}>Drag the slider or type a price.</Typography>

        <Box sx={{ display: "grid", placeItems: "center" }}>
          <Button
            onClick={() => onApply(amount)}
            sx={{ bgcolor: c.navy, color: "#fff", borderRadius: 999, px: 5, py: 1.5, fontFamily: fonts.display, fontWeight: 700, fontSize: 19, letterSpacing: ".1em", "&:hover": { bgcolor: "#0d2c52" } }}
          >
            SHOW RESULTS
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
