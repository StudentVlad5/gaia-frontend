import { useAuth } from "../../auth/AuthContext";
import { LogOut } from "lucide-react";
import styles from "./LogoutButton.module.css";

export default function LogoutButton({ collapsed }) {
  const { logout } = useAuth();

  return (
    <button className={styles.logoutBtn} onClick={logout}>
      <div className={styles.iconWrapper}>
        <LogOut size={22} strokeWidth={2} />
      </div>
      {!collapsed && <span className={styles.label}>Logout</span>}
    </button>
  );
}
