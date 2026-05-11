import styles from "./Button.module.css";

export const Button = ({
  children,
  variant = "primary",
  onClick,
  ...props
}) => {
  const handleClick = async (e) => {
    if (onClick) {
      await onClick(e);
    }
  };

  return (
    <button
      className={`${styles.btn} ${styles[variant]}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
