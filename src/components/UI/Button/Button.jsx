import { useState, useEffect, useRef } from "react";
import styles from "./Button.module.css";

export const Button = ({
  children,
  variant = "primary",
  onClick,
  ...props
}) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = async (e) => {
    if (isBlocked) return;

    setIsBlocked(true);

    if (onClick) {
      await onClick(e);
    }

    timerRef.current = setTimeout(() => {
      setIsBlocked(false);
    }, 2000);
  };

  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${isBlocked ? styles.disabled : ""}`}
      onClick={handleClick}
      disabled={isBlocked || props.disabled}
      {...props}
    >
      {children}
    </button>
  );
};
