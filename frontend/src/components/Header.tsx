import { Box, ButtonBase, IconButton, Typography } from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Logo from "./Logo";
import { c, fonts, triDown, triUp } from "../types/theme";

export default function Header({ onHome, onAbout }: { onHome: () => void; onAbout: () => void }) {
  return (
    <>
      <Box component="header" sx={{ bgcolor: c.navy, boxShadow: "0 8px 20px rgba(8,32,63,.25)", position: "relative", zIndex: 5 }}>
        <Box sx={{ height: 10, backgroundImage: triDown, backgroundRepeat: "repeat-x", backgroundSize: "16px 10px" }} />
        <Box sx={{ maxWidth: 560, mx: "auto", px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <ButtonBase onClick={onHome} aria-label="Hermes home" sx={{ gap: 1.5, textAlign: "left", borderRadius: 2 }}>
            <Logo />
            <Box>
              <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 30, lineHeight: 1, color: "#fff", letterSpacing: ".02em" }}>
                HERMES
              </Typography>
              <Typography sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 13, color: c.goldBright, letterSpacing: ".22em", mt: 0.5 }}>
                OKTOBERFEST PRICES
              </Typography>
            </Box>
          </ButtonBase>
          <IconButton
            onClick={onAbout}
            aria-label="About Hermes"
            sx={{ color: "#fff", border: "1.5px solid rgba(255,255,255,.35)", width: 44, height: 44, "&:hover": { borderColor: c.goldBright, bgcolor: "rgba(224,184,58,.12)" } }}
          >
            <InfoOutlined />
          </IconButton>
        </Box>
        <Box sx={{ height: 10, position: "absolute", left: 0, right: 0, bottom: -10, backgroundImage: triUp, backgroundRepeat: "repeat-x", backgroundSize: "16px 10px" }} />
      </Box>
    </>
  );
}
