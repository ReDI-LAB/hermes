import { SvgIcon, type SvgIconProps } from "@mui/material";
import type { SortOrder } from "../types/group";

interface Props extends SvgIconProps {
  kind: "alpha" | "num"; // letters (A–Z) or numbers (prices)
  order: SortOrder;
}

/** Down arrow with two stacked characters, e.g. A over Z, or 1 over 9. */
export default function SortIcon({ kind, order, ...props }: Props) {
  const pair = kind === "alpha" ? ["A", "Z"] : ["1", "9"];
  const [top, bottom] = order === "asc" ? pair : [pair[1], pair[0]];
  const text = { fontSize: 9, fontWeight: 700, fontFamily: "Arial, sans-serif", fill: "currentColor" };
  return (
    <SvgIcon {...props}>
      <path d="M7 3.5v13.1L4.4 14 3 15.4l5 5.1 5-5.1-1.4-1.4L9 16.6V3.5H7z" />
      <text x="14.5" y="10" style={text}>{top}</text>
      <text x="14.5" y="20.5" style={text}>{bottom}</text>
    </SvgIcon>
  );
}
