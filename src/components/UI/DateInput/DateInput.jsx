import { Calendar } from "lucide-react";
import styles from "./DateInput.module.css";

export const DateInput = ({ label, value, onChange }) => (
  <div className={styles.wrapper}>
    {label && <label className={styles.label}>{label}</label>}
    <div className={styles.inputContainer}>
      <Calendar size={16} />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);
