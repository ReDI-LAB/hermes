import type { ReactNode } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import { c, fonts } from "../types/theme";

// Content: change the texts here, not inside the JSX.
const STEPS = [
  { badge: "1", text: "Select a category" },
  { badge: "+", text: "Optional: select a sub-category" },
  { badge: "2", text: "Select a product" },
  { badge: "3", text: "Set your maximum price" },
  { badge: "4", text: "Compare available vendors" },
  { badge: "5", text: "Select a vendor to see more information" },
];

// Styles that never change are defined once, outside the component.
const bodyText = { color: c.muted, fontSize: 18, lineHeight: 1.65 } as const;

const badgeStyle = {
  width: 40, height: 40, borderRadius: "50%", bgcolor: c.navy, color: "#fff",
  display: "grid", placeItems: "center", fontFamily: fonts.display, fontWeight: 700, fontSize: 20,
} as const;

interface InfoCardProps {
  title: string;
  children: ReactNode;
}

/** A framed section with a small gold dash and a heading. */
function InfoCard({ title, children }: InfoCardProps) {
  return (
    <Box component="section" sx={{ border: `1.5px solid ${c.goldSoft}`, borderRadius: 4, bgcolor: c.card, p: 2.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
        <Box aria-hidden="true" sx={{ width: 12, height: 2, bgcolor: c.gold }} />
        <Typography component="h2" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 18, letterSpacing: ".08em", color: c.ink }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Box>
  );
}

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <Box sx={{ py: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
        <IconButton onClick={onBack} aria-label="Back">
          <ChevronLeft />
        </IconButton>
        <Typography component="h1" sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 34, color: c.ink }}>
          ABOUT <Box component="span" sx={{ fontFamily: fonts.fraktur }}>Hermes</Box>
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <InfoCard title="FIND PRICES">
          <Typography sx={bodyText}>
            Hermes helps you compare prices for drinks, food, rides, games and souvenirs at Oktoberfest.
          </Typography>
        </InfoCard>

        <InfoCard title="HOW IT WORKS">
          <Stack component="ol" role="list" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {STEPS.map(({ badge, text }) => (
              <Stack component="li" key={text} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box aria-hidden="true" sx={badgeStyle}>{badge}</Box>
                <Typography sx={{ fontSize: 19, color: c.ink }}>{text}</Typography>
              </Stack>
            ))}
          </Stack>
        </InfoCard>

        <InfoCard title="ABOUT PRICES">
          <Typography sx={bodyText}>
            Prices are based on the data provided for the Oktoberfest. Prices may change. In this prototype they are sample
            prices in line with recent Wiesn ranges.
          </Typography>
        </InfoCard>

        <InfoCard title="DATA">
          <Typography sx={bodyText}>Last updated: Aug 2026 (sample data for this prototype)</Typography>
        </InfoCard>
      </Stack>
    </Box>
  );
}
