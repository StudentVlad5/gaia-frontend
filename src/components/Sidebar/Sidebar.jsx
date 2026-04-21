import { NavLink } from "react-router-dom";
import { Activity, Package, Tag, User, BarChart3, Users } from "lucide-react";
import LogoutButton from "../LogoutButton/LogoutButton";
import { useAuth } from "../../auth/AuthContext";
import styles from "./Sidebar.module.css";

const menuItems = [
  { path: "/", label: "Live", icon: Activity, roles: ["USER", "ADMIN"] },
  { path: "/boxes", label: "Boxes", icon: Package, roles: ["ADMIN"] },
  { path: "/products", label: "Products", icon: Tag, roles: ["ADMIN"] },
  { path: "/receivers", label: "Receivers", icon: User, roles: ["ADMIN"] },
  {
    path: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["USER", "ADMIN"],
  },
  { path: "/users", label: "Users", icon: Users, roles: ["ADMIN"] },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;

    return user && item.roles.includes(String(user.role).toUpperCase());
  });
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
        <div className={styles.menuList}>
          {filteredMenuItems.map((item) => {
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
                {!collapsed && (
                  <span className={styles.label}>{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>

        {user && (
          <div className={styles.footer}>
            <LogoutButton collapsed={collapsed} />
          </div>
        )}
      </nav>
    </aside>
  );
}
