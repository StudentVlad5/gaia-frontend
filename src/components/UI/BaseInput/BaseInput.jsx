import styles from "./BaseInput.module.css";

export const BaseInput = ({ label, icon: Icon, ...props }) => (
  <div className={styles.wrapper}>
    {label && <label className={styles.label}>{label}</label>}
    <div className={styles.inputContainer}>
      {Icon && <Icon size={16} className={styles.icon} />}
      <input
        {...props}
        className={`${styles.input} ${Icon ? styles.withIcon : styles.noIcon}`}
      />
    </div>
  </div>
);
