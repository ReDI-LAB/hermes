import logoUrl from "../assets/logo.png";

export default function Logo() {
  return <img src={logoUrl} alt="" aria-hidden="true" style={{ height: 46, width: "auto", display: "block" }} />;
}
