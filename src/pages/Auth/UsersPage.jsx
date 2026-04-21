import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Users, ShieldCheck, User } from "lucide-react";
import { Button } from "../../components/UI/Button/Button";
import styles from "./AuthPage.module.css";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const changeRole = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      alert(
        "Failed to change role" +
          (err.response?.data?.message ? `: ${err.response.data.message}` : ""),
      );
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500">Loading users...</div>
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Users className="text-blue-600" size={28} />
        <h1 className={styles.title}>User Management</h1>
      </header>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Current Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className={styles.userRow}>
              <td className={styles.td}>
                <span className={styles.username}>{u.username}</span>
              </td>
              <td className={styles.td}>
                <span
                  className={`${styles.badge} ${u.role === "ADMIN" ? styles.adminBadge : styles.userBadge}`}
                >
                  {u.role === "ADMIN" ? (
                    <ShieldCheck
                      size={12}
                      style={{ display: "inline", marginRight: 4 }}
                    />
                  ) : (
                    <User
                      size={12}
                      style={{ display: "inline", marginRight: 4 }}
                    />
                  )}
                  {u.role}
                </span>
              </td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <Button
                    variant={u.role === "ADMIN" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => changeRole(u.id, "ADMIN")}
                    disabled={u.role === "ADMIN"}
                  >
                    Promote to Admin
                  </Button>
                  <Button
                    variant={u.role === "USER" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => changeRole(u.id, "USER")}
                    disabled={u.role === "USER"}
                  >
                    Demote to User
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
