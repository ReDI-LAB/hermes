import { createTheme } from "@mui/material/styles";

export const c = {
  navy: "#08203F",
  tile: "#0A2038",
  gold: "#C9A227",
  goldBright: "#E0B83A",
  goldSoft: "#E8D9A0",
  cream: "#FAF8F3",
  card: "#FCFAF4",
  line: "#EFE6CC",
  ink: "#0B2342",
  muted: "#5E6B7D",
  blue: "#2F5FB3",
};

export const fonts = {
  display: '"Barlow Condensed", "Barlow", sans-serif',
  body: '"Barlow", system-ui, sans-serif',
  fraktur: '"UnifrakturCook", serif',
};

const svg = (path: string) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='10' viewBox='0 0 16 10'>${path}</svg>`)}")`;
export const triDown = svg(`<path d='M0 0H16L8 10Z' fill='#fff'/>`);
export const triUp = svg(`<path d='M0 10 8 0 16 10Z' fill='${c.blue}'/>`);

export const theme = createTheme({
  palette: {
    primary: { main: c.gold, contrastText: c.navy },
    background: { default: c.cream, paper: c.card },
    text: { primary: c.ink, secondary: c.muted },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: fonts.body,
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitTapHighlightColor: "transparent", WebkitTextSizeAdjust: "100%" },
        body: { backgroundColor: c.cream, minHeight: "100dvh" },
        ":focus-visible": { outline: `3px solid ${c.gold}`, outlineOffset: 2 },
      },
    },
  },
});
