import { Button } from "../../components/UI/Button/Button";
import { Input } from "../../components/UI/Input/Input";
import styles from "./EntityForm.module.css";

export const EntityForm = ({
  value,
  onChange,
  onSubmit,
  editingId,
  onCancel,
  label = "Name",
  placeholder = "Enter name...",
}) => {
  return (
    <div className={styles.card}>
      <form onSubmit={onSubmit} className={styles.form}>
        <Input
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div style={{ alignSelf: "flex-end", display: "flex", gap: "8px" }}>
          <Button type="submit">{editingId ? "Update" : "Add"}</Button>
          {editingId && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
