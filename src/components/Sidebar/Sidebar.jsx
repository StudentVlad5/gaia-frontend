import { NavLink } from "react-router-dom";
import { Activity, Package, Tag, User, BarChart3 } from "lucide-react";
import styles from "./Sidebar.module.css";

const menuItems = [
  { path: "/", label: "Live", icon: Activity },
  { path: "/boxes", label: "Boxes", icon: Package },
  { path: "/products", label: "Products", icon: Tag },
  { path: "/receivers", label: "Receivers", icon: User },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={styles.sidebar} style={{ width: collapsed ? 70 : 240 }}>
      <div className={styles.header}>
        {!collapsed && (
          <span style={{ fontWeight: "bold", letterSpacing: 1 }}>
            GAIA SYSTEM
          </span>
        )}
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➜" : "☰"}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.activeLink}` : styles.link
              }
            >
              <Icon size={20} strokeWidth={2} className={styles.icon} />
              {!collapsed && <span className={styles.label}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
