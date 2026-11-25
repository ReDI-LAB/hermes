import { Box, ButtonBase, IconButton, Typography } from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Logo from "./Logo";
import { c, fonts, triDown, triUp } from "../types/theme";

interface HeaderProps {
  onHome: () => void;
  onAbout: () => void;
  isTabletOrUp?: boolean;
}

export default function Header({ onHome, onAbout, isTabletOrUp = false }: HeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        bgcolor: c.navy,
        boxShadow: "0 8px 20px rgba(8,32,63,.25)",
        position: "relative",
        zIndex: 5,
        width: "100%",
      }}
    >
      <Box
        sx={{
          height: 10,
          backgroundImage: triDown,
          backgroundRepeat: "repeat-x",
          backgroundSize: "16px 10px",
        }}
      />

      <Box
        sx={{
          maxWidth: isTabletOrUp ? 640 : 560,
          width: "100%",
          minWidth: 0,
          mx: "auto",
          px: isTabletOrUp ? 3 : 1.75,
          py: isTabletOrUp ? 1.5 : 1.1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <ButtonBase
          onClick={onHome}
          aria-label="Hermes home"
          sx={{
            gap: isTabletOrUp ? 1.5 : 1.1,
            textAlign: "left",
            borderRadius: 2,
            minWidth: 0,
            flex: 1,
            justifyContent: "flex-start",
            overflow: "hidden",
          }}
        >
          <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            <Logo />
          </Box>

          <Box sx={{ minWidth: 0, overflow: "hidden" }}>
            <Typography
              noWrap
              sx={{
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: isTabletOrUp ? 30 : 24,
                lineHeight: 1,
                color: "#fff",
                letterSpacing: ".02em",
              }}
            >
              HERMES
            </Typography>
            <Typography
              noWrap
              sx={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: isTabletOrUp ? 13 : 10.5,
                color: c.goldBright,
                letterSpacing: isTabletOrUp ? ".22em" : ".14em",
                mt: 0.5,
              }}
            >
              OKTOBERFEST PRICES
            </Typography>
          </Box>
        </ButtonBase>

        <IconButton
          onClick={onAbout}
          aria-label="About Hermes"
          sx={{
            flexShrink: 0,
            color: "#fff",
            border: "1.5px solid rgba(255,255,255,.35)",
            width: isTabletOrUp ? 44 : 40,
            height: isTabletOrUp ? 44 : 40,
            "&:hover": {
              borderColor: c.goldBright,
              bgcolor: "rgba(224,184,58,.12)",
            },
          }}
        >
          <InfoOutlined fontSize={isTabletOrUp ? "medium" : "small"} />
        </IconButton>
      </Box>

      <Box
        sx={{
          height: 10,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -10,
          backgroundImage: triUp,
          backgroundRepeat: "repeat-x",
          backgroundSize: "16px 10px",
        }}
      />
    </Box>
  );
}
