import { Input } from "../UI/Input/Input";

export const SearchBar = ({ value, onChange }) => (
  <div
    style={{ position: "relative", marginBottom: "20px", maxWidth: "400px" }}
  >
    <Input
      placeholder="Search ..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <span
      style={{ position: "absolute", right: "12px", top: "10px", opacity: 0.4 }}
    >
      🔍
    </span>
  </div>
);
