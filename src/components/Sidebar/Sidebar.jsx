import { NavLink } from "react-router-dom";
import {
  Activity,
  Package,
  Tag,
  User,
  BarChart3,
  Users,
  Warehouse,
  LayoutDashboard,
  ClipboardCheck,
  Boxes,
  Settings,
} from "lucide-react";
import LogoutButton from "../LogoutButton/LogoutButton";
import { useAuth } from "../../auth/AuthContext";
import styles from "./Sidebar.module.css";

const menuItems = [
  // ГРУПА: LOGISTICS (BOXES)
  {
    path: "/",
    label: "Live Monitor",
    icon: Activity,
    roles: ["USER", "ADMIN"],
    group: "Logistics",
  },
  {
    path: "/boxes",
    label: "Boxes Journal",
    icon: Boxes,
    roles: ["ADMIN"],
    group: "Logistics",
  },
  {
    path: "/products",
    label: "Products",
    icon: Tag,
    roles: ["ADMIN"],
    group: "Logistics",
  },
  {
    path: "/receivers",
    label: "Receivers",
    icon: User,
    roles: ["ADMIN"],
    group: "Logistics",
  },
  {
    path: "/reports",
    label: "Box Reports",
    icon: BarChart3,
    roles: ["USER", "ADMIN"],
    group: "Logistics",
  },

  // ГРУПА: PACKAGING
  {
    path: "/packaging-dashboard",
    label: "Pack Dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "ADMIN"],
    group: "Packaging",
  },
  {
    path: "/package-packing",
    label: "Packing Process",
    icon: ClipboardCheck,
    roles: ["ADMIN"],
    group: "Packaging",
  },
  {
    path: "/package-products",
    label: "Pack Products",
    icon: Package,
    roles: ["ADMIN"],
    group: "Packaging",
  },

  // ГРУПА: SYSTEM
  {
    path: "/warehouse",
    label: "Warehouse",
    icon: Warehouse,
    roles: ["USER", "ADMIN"],
    group: "System",
  },
  {
    path: "/users",
    label: "Users",
    icon: Users,
    roles: ["ADMIN"],
    group: "System",
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(String(user.role).toUpperCase());
  });

  // Групування елементів
  const groups = ["Logistics", "Packaging", "System"];

  return (
    <aside className={styles.sidebar} style={{ width: collapsed ? 70 : 240 }}>
      <div className={styles.header}>
        {!collapsed && <span className={styles.logoText}>GAIA SYSTEM</span>}
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➜" : "☰"}
        </button>
      </div>

      <nav className={styles.nav}>
        {groups.map((group) => {
          const groupItems = filteredMenuItems.filter((i) => i.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group} className={styles.menuGroup}>
              {!collapsed && <div className={styles.groupTitle}>{group}</div>}

              {groupItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.link} ${styles.activeLink}`
                        : styles.link
                    }
                  >
                    <Icon size={20} strokeWidth={2} className={styles.icon} />
                    {!collapsed && (
                      <span className={styles.label}>{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
              {!collapsed && <div className={styles.divider} />}
            </div>
          );
        })}

        {user && (
          <div className={styles.footer}>
            <LogoutButton collapsed={collapsed} />
          </div>
        )}
      </nav>
    </aside>
  );
}
