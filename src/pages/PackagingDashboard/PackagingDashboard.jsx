import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Package,
  Scale,
  TrendingUp,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import { getDashboard } from "../../api/dashboard";
import styles from "./PackagingDashboard.module.css";

const socket = io("https://gaia-server-gayu.onrender.com");

export default function PackagingDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await getDashboard();
      setDashboardData(res.data.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    socket.on("packaging_created", loadData);
    socket.on("packaging_updated", loadData);
    socket.on("packaging_deleted", loadData);

    return () => {
      socket.off("packaging_created");
      socket.off("packaging_updated");
      socket.off("packaging_deleted");
    };
  }, [loadData]);

  if (loading && !dashboardData)
    return <div className={styles.loader}>Loading Analytics...</div>;

  const summary = dashboardData?.summary || {};
  const today = dashboardData?.today || [];
  const completed = dashboardData?.completed || [];
  const issuesList = dashboardData?.issues?.list || [];

  // Розрахунок середньої ваги пакета
  const avgWeight =
    today.length > 0
      ? (Number(summary.total_weight) / Number(summary.total_count)).toFixed(2)
      : 0;

  return (
    <div className={styles.screenWrapper}>
      <header className={styles.header}>
        <h2>Live Packaging Analytics</h2>
        <div className={styles.serverStatus}>● Real-time Sync Active</div>
      </header>

      {/* ================= KPI ROW ================= */}
      <section className={styles.kpiSection}>
        <KPICard
          title="Packages Count"
          value={summary.total_count}
          icon={<Package size={20} />}
          color="#6366f1"
        />
        <KPICard
          title="Total Weight"
          value={`${summary.total_weight || 0} kg`}
          icon={<Scale size={20} />}
          color="#10b981"
        />
        <KPICard
          title="Average Package Weight"
          value={`${avgWeight} kg`}
          icon={<TrendingUp size={20} />}
          color="#f59e0b"
        />
      </section>

      <main className={styles.dashboardGrid}>
        {/* ================= REPORT 1: PENDING BY CATEGORY (Sorted) ================= */}
        <section className={styles.panelFull}>
          <h3 className={styles.issuesTitle}>
            <AlertTriangle size={18} /> Pending by Category & Product
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.modernTable}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Product Name</th>
                  <th>Factory</th>
                  <th className={styles.num}>Current Weight</th>
                  <th className={styles.num}>Missing (kg)</th>
                </tr>
              </thead>
              <tbody>
                {issuesList
                  .sort((a, b) => a.category.localeCompare(b.category))
                  .map((item) => (
                    <tr key={item.id}>
                      <td className={styles.categoryBadge}>{item.category}</td>
                      <td className={styles.bold}>{item.product_name}</td>
                      <td>{item.factory_name || "—"}</td>
                      <td className={styles.num}>{item.actual_weight} kg</td>
                      <td className={`${styles.num} ${styles.dangerText}`}>
                        {Math.abs(Number(item.difference))} kg
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================= REPORT 2: TODAY PACKAGINGS (Detailed) ================= */}
        <section className={styles.panel}>
          <h3>
            <ClipboardList size={18} /> Today Operations Journal
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.modernTable}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Product</th>
                  <th>Cat</th>
                  <th className={styles.num}>Weight</th>
                  <th className={styles.num}>Diff</th>
                </tr>
              </thead>
              <tbody>
                {today.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.dateCell}>
                      {new Date(p.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>{p.product_name}</td>
                    <td>{p.category}</td>
                    <td className={styles.num}>{p.actual_weight}</td>
                    <td
                      className={`${styles.num} ${Number(p.difference) < 0 ? styles.dangerText : styles.successText}`}
                    >
                      {p.difference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================= REPORT 3: COMPLETED TODAY ================= */}
        <section className={styles.panel}>
          <h3>
            <CheckCircle size={18} /> Finalized Packages
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.modernTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Packed At</th>
                  <th className={styles.num}>Final Weight</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.bold}>{p.product_name}</td>
                    <td>{p.category}</td>
                    <td className={styles.dateCell}>
                      {p.packed_at
                        ? new Date(p.packed_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className={`${styles.num} ${styles.successText}`}>
                      {p.actual_weight} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function KPICard({ title, value, icon, color }) {
  return (
    <div className={styles.miniCard}>
      <div
        className={styles.iconBox}
        style={{ color, backgroundColor: `${color}15` }}
      >
        {icon}
      </div>
      <div>
        <p className={styles.kpiLabel}>{title}</p>
        <strong className={styles.kpiValue}>{value || 0}</strong>
      </div>
    </div>
  );
}
