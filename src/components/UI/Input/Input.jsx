import styles from "./Input.module.css";

export const Input = ({ label, ...props }) => (
  <div className={styles.inputWrapper}>
    {label && <label className={styles.label}>{label}</label>}
    <input className={styles.input} {...props} />
  </div>
);
