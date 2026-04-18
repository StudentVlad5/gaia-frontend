import styles from "./Button.module.css";

export const Button = ({ children, variant = "primary", ...props }) => (
  <button className={`${styles.btn} ${styles[variant]}`} {...props}>
    {children}
  </button>
);
