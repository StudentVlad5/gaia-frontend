import { useEffect, useState, useCallback, useMemo } from "react";
import { getSummary, getTodayReceivers, getBoxes } from "../../api/reports";
import { io } from "socket.io-client";
import {
  Volume2,
  VolumeX,
  Package,
  Scale,
  TrendingUp,
  ClipboardList,
  User,
} from "lucide-react";

import styles from "./Dashboard.module.css";

const socket = io("http://localhost:3000");
const notificationSound =
  typeof Audio !== "undefined" ? new Audio("/notification.mp3") : null;

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [, setLoading] = useState(true);
  const [receivers, setReceivers] = useState([]);
  const [lastBoxes, setLastBoxes] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, b] = await Promise.all([
        getSummary({ from: today, to: today }),
        getTodayReceivers({ date: today }),
        getBoxes({ from: today, to: today, limit: 15 }),
      ]);
      setSummary(s.data.data);
      setReceivers(r.data.data);
      setLastBoxes(b.data.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
    // socket.on("box_created", loadData);
    socket.on("box_created", (data) => {
      if (!isMuted && notificationSound) {
        notificationSound
          .play()
          .catch((err) => console.warn("Audio blocked:", err));
      }
      setLastBoxes((prev) => [data, ...prev]);
      loadData();
    });
    socket.on("box_deleted", loadData);
    socket.on("box_updated", loadData);
    return () => {
      socket.off("box_created");
      socket.off("box_deleted");
      socket.off("box_updated");
    };
  }, [isMuted, loadData]);

  return (
    <div className={styles.screenWrapper}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h2>Operational Analytics</h2>
        </div>

        <div className={styles.headerActions}>
          <button
            className={`${styles.soundButton} ${isMuted ? styles.muted : ""}`}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute" : "Mute notifications"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span>{isMuted ? "Muted" : "Sound On"}</span>
          </button>

          <div className={styles.dateBadge}>
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </header>

      <main className={styles.dashboardGrid}>
        {/* REPORT 1: KPI METRICS */}
        <section className={styles.kpiSection}>
          <KPICard
            title="Total Boxes"
            value={summary.total_boxes}
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
            title="Avg Weight"
            value={`${Number(summary.avg_weight || 0).toFixed(2)} kg`}
            icon={<TrendingUp size={20} />}
            color="#f59e0b"
          />
        </section>

        {/* REPORT 2: RECENT SHIPMENTS */}
        <section className={`${styles.panel} ${styles.recentOrders}`}>
          <h3 className={styles.panelTitle}>
            <ClipboardList size={18} /> Recent Shipments
          </h3>
          <ul className={styles.scrollList}>
            {lastBoxes.map((b) => (
              <li key={b.id} className={styles.miniRow}>
                <div className={styles.time}>
                  {new Date(b.date).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className={styles.info}>
                  <span className={styles.prodName}>{b.product_name}</span>
                  <span className={styles.recName}>{b.receiver_name}</span>
                </div>
                <div className={styles.weight}>{b.weight} kg</div>
              </li>
            ))}
          </ul>
        </section>

        {/* REPORT 3: RECEIVERS ANALYTICS GRID (2 per row) */}
        <div className={styles.receiversGrid}>
          {receivers.map((r) => (
            <section
              key={r.receiver_id}
              className={`${styles.panel} ${styles.receiverCard}`}
            >
              <h3 className={styles.receiverTitle}>
                <User size={18} /> {r.receiver_name}
              </h3>
              <div className={styles.tableContainer}>
                <table className={styles.modernTable}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Boxes</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.products?.map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.product_name}</td>
                        <td>{p.boxes} pcs</td>
                        <td>{p.total_weight} kg</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={styles.subTotalRow}>
                      <td>Total</td>
                      <td>{r.total_boxes} pcs</td>
                      <td>{r.total_weight} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function KPICard({ title, value, icon, color }) {
  return (
    <div className={styles.miniCard}>
      <div
        className={styles.iconBox}
        style={{ color: color, backgroundColor: `${color}15` }}
      >
        {icon}
      </div>
      <div className={styles.cardData}>
        <span className={styles.cardLabel}>{title}</span>
        <span className={styles.cardValue}>{value || 0}</span>
      </div>
    </div>
  );
}
