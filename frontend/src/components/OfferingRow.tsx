import type { ReactNode } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, Typography } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Storefront from "@mui/icons-material/Storefront";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import Bolt from "@mui/icons-material/Bolt";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import Height from "@mui/icons-material/Height";
import type { Offering } from "../types/types";
import { VENDOR_TYPE_LABEL } from "../types/group";
import PricePill from "./PricePill";
import { c, fonts } from "../types/theme";

function Line({ icon, strong, children }: { icon: ReactNode; strong?: boolean; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", color: c.muted, "& svg": { fontSize: 22 } }}>
      {icon}
      <Typography sx={{ fontSize: 17, color: strong ? c.ink : c.muted, fontWeight: strong ? 600 : 400 }}>{children}</Typography>
    </Stack>
  );
}

interface Props {
  offering: Offering;
  best?: boolean;
}

export default function OfferingRow({ offering, best }: Props) {
  const { vendor, activity_details: act } = offering;

  return (
    <Accordion
      disableGutters
      square
      elevation={0}
      sx={{
        bgcolor: best ? "#F6F0DC" : "transparent",
        borderLeft: best ? `4px solid ${c.gold}` : "none",
        borderTop: `1px solid ${c.line}`,
        "&:first-of-type": { borderTop: "none" },
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore sx={{ color: c.gold }} />}
        sx={{ px: 2.5, "& .MuiAccordionSummary-content": { alignItems: "center", justifyContent: "space-between", gap: 1, my: 1.5 } }}
      >
        <Typography sx={{ minWidth: 0, fontFamily: fonts.display, fontWeight: 600, fontSize: 22, color: c.ink, lineHeight: 1.15 }}>
          {vendor.vendor_name}
          {offering.is_new_this_year && (
            <Chip label="NEW" size="small" sx={{ ml: 1, height: 20, bgcolor: c.navy, color: c.goldBright, fontWeight: 700, fontSize: 11 }} />
          )}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
          {best && (
            <Box sx={{ bgcolor: c.gold, color: c.navy, borderRadius: 999, px: 1.25, py: 0.5, fontFamily: fonts.display, fontWeight: 700, fontSize: 12, letterSpacing: ".1em", whiteSpace: "nowrap" }}>
              BEST PRICE
            </Box>
          )}
          <PricePill price={offering.price_eur} from={false} variant={best ? "gold" : "dark"} />
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, py: 2, borderTop: `1px solid ${c.line}`, display: "grid", gap: 1.25 }}>
        <Line icon={<Storefront />}>{VENDOR_TYPE_LABEL[vendor.vendor_type] ?? vendor.vendor_type}</Line>
        <Line icon={<PlaceOutlined />} strong>{vendor.location}</Line>
        {act && <Line icon={<Bolt />}>{`${act.thrill_level} thrill${act.family_friendly ? " · family friendly" : ""}`}</Line>}
        {act?.min_age != null && <Line icon={<PersonOutlined />}>{`Minimum age ${act.min_age}`}</Line>}
        {act?.min_height_cm != null && <Line icon={<Height />}>{`Minimum height ${act.min_height_cm} cm`}</Line>}
      </AccordionDetails>
    </Accordion>
  );
}
