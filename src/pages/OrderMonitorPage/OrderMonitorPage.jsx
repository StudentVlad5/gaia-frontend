import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
} from "lucide-react";
import { io } from "socket.io-client";
import styles from "./OrderMonitorPage.module.css";

const socket = io("https://gaia-server-gayu.onrender.com");

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function OrderMonitorPage() {
  const [activeLists, setActiveLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLiveStatus = useCallback(async () => {
    try {
      const res = await fetch(
        "https://gaia-server-gayu.onrender.com/orders/shipping/live-status",
      );
      if (!res.ok) throw new Error("Failed to load data from server");

      const data = await res.json();
      setActiveLists(data);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveStatus();

    socket.on("shipping:live_update", () => {
      console.log("WebSocket Event: Database updated. Refreshing monitor...");
      fetchLiveStatus();
    });

    socket.on("order:update", () => {
      console.log(
        "WebSocket Event: Order plans changed. Refreshing monitor...",
      );
      fetchLiveStatus();
    });

    return () => {
      socket.off("shipping:live_update");
      socket.off("order:update");
    };
  }, [fetchLiveStatus]);

  const processItems = (items) => {
    if (!items) return [];
    return items
      .map((item) => {
        const plannedBoxes = Number(item.planned_boxes) || 0;
        const packedBoxes = Number(item.packed_boxes) || 0;
        const avgWeight = Number(item.avg_weight) || 0;
        const packedWeight = Number(item.packed_weight) || 0;

        const plannedWeight = plannedBoxes * avgWeight;
        const boxesDiff = plannedBoxes - packedBoxes;

        let statusColor = "black";
        let alertMessage = "";

        let boxesPercent =
          plannedBoxes > 0 ? Math.round((packedBoxes / plannedBoxes) * 100) : 0;
        let weightPercent =
          plannedWeight > 0
            ? Math.round((packedWeight / plannedWeight) * 100)
            : 0;

        if (item.is_unexpected || plannedBoxes === 0) {
          statusColor = "red";
          alertMessage = "⚠️ Not in active order plan!";
          boxesPercent = 0;
          weightPercent = 0;
        } else if (packedBoxes > plannedBoxes) {
          statusColor = "red";
          alertMessage = `Overlimit! +${packedBoxes - plannedBoxes} pcs`;
        } else if (packedBoxes === plannedBoxes) {
          statusColor = "green";
          boxesPercent = 100;
          weightPercent = 100;
        }

        return {
          ...item,
          plannedWeight,
          packedWeight,
          boxesDiff,
          boxesPercent,
          weightPercent,
          statusColor,
          alertMessage,
        };
      })
      .sort((a, b) => {
        if (a.statusColor === "green" && b.statusColor !== "green") return 1;
        if (a.statusColor !== "green" && b.statusColor === "green") return -1;
        return 0;
      });
  };

  if (loading) {
    return (
      <div className={styles.loader}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Loading Orders Monitor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loader} style={{ color: "#ef4444" }}>
        <AlertTriangle size={40} />
        <p>Connection Error: {error}</p>
        <button
          className={styles.retryBtn}
          onClick={() => {
            setLoading(true);
            fetchLiveStatus();
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (activeLists.length === 0) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h2> Orders Monitor (LIVE)</h2>
          <span className={styles.offlineBadge}>No Active Plans</span>
        </header>
        <div className={styles.emptyState}>
          <p>
            There are no active packing plans for any receiver for the current
            date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <h2>Orders Monitor</h2>
          <span className={styles.liveBadge}>● LIVE UPDATES</span>
        </div>
      </header>

      {activeLists.map((list) => {
        const processedItemsList = processItems(list.items);

        const totalPlanBoxes = processedItemsList.reduce(
          (acc, i) => acc + (Number(i.planned_boxes) || 0),
          0,
        );
        const totalFactBoxes = processedItemsList.reduce(
          (acc, i) => acc + (Number(i.packed_boxes) || 0),
          0,
        );
        const totalPlanWeight = processedItemsList.reduce(
          (acc, i) => acc + (i.plannedWeight || 0),
          0,
        );
        const totalFactWeight = processedItemsList.reduce(
          (acc, i) => acc + (i.packedWeight || 0),
          0,
        );
        const totalDiffBoxes = totalPlanBoxes - totalFactBoxes;

        return (
          <div key={list.id} className={styles.orderBlock}>
            <div className={styles.orderHeader}>
              <div className={styles.metaItem}>
                <User size={16} className={styles.metaIcon} />
                <span className={styles.metaLabel}>Receiver:</span>
                <span className={styles.receiverBadge}>
                  {list.receiver_name}
                </span>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={16} className={styles.metaIcon} />
                <span className={styles.metaLabel}>Period:</span>
                <span className={styles.dateRange}>
                  {formatDate(list.date_start)} - {formatDate(list.date_end)}
                </span>
              </div>
            </div>

            {/* ДЕСКТОПНА ТА ПЛАНШЕТНА ВЕРСІЯ: КОРЕКТНА ТАБЛИЦЯ */}
            <div className={styles.tableResponsive}>
              <table className={styles.monitorTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className={styles.num}>Boxes Plan</th>
                    <th className={styles.num}>Boxes Fact</th>
                    <th className={styles.num}>Weight Plan</th>
                    <th className={styles.num}>Weight Fact</th>
                    <th className={styles.num}>Diff (Boxes)</th>
                    <th style={{ textAlign: "center" }}>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processedItemsList.map((item) => (
                    <tr
                      key={item.product_id}
                      className={styles[item.statusColor]}
                    >
                      <td className={styles.fontBold}>{item.product_name}</td>
                      <td className={styles.num}>{item.planned_boxes}</td>
                      <td className={styles.num + " " + styles.factCell}>
                        {item.packed_boxes}
                      </td>
                      <td className={styles.num}>
                        {item.plannedWeight.toFixed(1)} kg
                      </td>
                      <td className={styles.num}>
                        {item.packedWeight.toFixed(1)} kg
                      </td>
                      <td className={styles.num} style={{ fontWeight: "700" }}>
                        {item.boxesDiff > 0
                          ? `${item.boxesDiff} left`
                          : item.boxesDiff < 0
                            ? `+${Math.abs(item.boxesDiff)}`
                            : "0"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className={styles.progressTextWrapper}>
                          <span>
                            B: <strong>{item.boxesPercent}%</strong>
                          </span>
                          <span className={styles.separator}>|</span>
                          <span>
                            W: <strong>{item.weightPercent}%</strong>
                          </span>
                        </div>
                      </td>
                      <td>
                        {item.statusColor === "green" && (
                          <span className={styles.greenText}>
                            <CheckCircle2 size={13} /> Ready
                          </span>
                        )}
                        {item.statusColor === "black" && (
                          <span className={styles.blackText}>📦 Packing</span>
                        )}
                        {item.statusColor === "red" && (
                          <span className={styles.redText}>
                            <AlertTriangle size={13} /> {item.alertMessage}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={styles.totalRow}>
                    <td>TOTAL:</td>
                    <td className={styles.num}>{totalPlanBoxes}</td>
                    <td className={styles.num}>{totalFactBoxes}</td>
                    <td className={styles.num}>
                      {totalPlanWeight.toFixed(1)} kg
                    </td>
                    <td className={styles.num}>
                      {totalFactWeight.toFixed(1)} kg
                    </td>
                    <td className={styles.num}>
                      {totalDiffBoxes > 0
                        ? `${totalDiffBoxes} left`
                        : totalDiffBoxes < 0
                          ? `+${Math.abs(totalDiffBoxes)}`
                          : "Done"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        className={styles.progressTextWrapper}
                        style={{ backgroundColor: "#0f172a", color: "#fff" }}
                      >
                        <span>
                          B:{" "}
                          {totalPlanBoxes > 0
                            ? Math.round(
                                (totalFactBoxes / totalPlanBoxes) * 100,
                              )
                            : 0}
                          %
                        </span>
                        <span className={styles.separator}>|</span>
                        <span>
                          W:{" "}
                          {totalPlanWeight > 0
                            ? Math.round(
                                (totalFactWeight / totalPlanWeight) * 100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </td>
                    <td>
                      {totalDiffBoxes <= 0 ? (
                        <span
                          className={styles.greenText}
                          style={{ fontWeight: "800" }}
                        >
                          ✓ READY
                        </span>
                      ) : (
                        <span
                          className={styles.blackText}
                          style={{ fontWeight: "800" }}
                        >
                          ⏳ PENDING
                        </span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* МОБІЛЬНА ВЕРСІЯ: АДАПТИВНІ КАРТКИ замість зламаної таблиці */}
            <div className={styles.mobileCardsGrid}>
              {processedItemsList.map((item) => (
                <div
                  key={item.product_id}
                  className={`${styles.mobileCard} ${styles[item.statusColor + "Card"]}`}
                >
                  <div className={styles.mobileCardHeader}>
                    <span className={styles.fontBold}>{item.product_name}</span>
                    <span
                      className={`${styles.statusDot} ${styles[item.statusColor + "Dot"]}`}
                    ></span>
                  </div>
                  <div className={styles.mobileCardBody}>
                    <div className={styles.mobileGridRow}>
                      <span>Boxes:</span>
                      <strong>
                        {item.packed_boxes} / {item.planned_boxes}
                      </strong>
                    </div>
                    <div className={styles.mobileGridRow}>
                      <span>Weight:</span>
                      <span>
                        {item.packedWeight.toFixed(1)} /{" "}
                        {item.plannedWeight.toFixed(1)} kg
                      </span>
                    </div>
                    <div className={styles.mobileGridRow}>
                      <span>Difference:</span>
                      <span style={{ fontWeight: "700" }}>
                        {item.boxesDiff > 0
                          ? `${item.boxesDiff} left`
                          : item.boxesDiff < 0
                            ? `+${Math.abs(item.boxesDiff)} over`
                            : "Complete"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.mobileCardFooter}>
                    <span>
                      Box: {item.boxesPercent}% | Wgt: {item.weightPercent}%
                    </span>
                    {item.alertMessage && (
                      <span className={styles.mobileAlert}>
                        {item.alertMessage}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Мобільний підсумок */}
              <div className={styles.mobileTotalCard}>
                <div className={styles.fontBold}>ORDER SUMMARY</div>
                <div
                  className={styles.mobileGridRow}
                  style={{ marginTop: "8px" }}
                >
                  <span>Total Boxes:</span>
                  <strong>
                    {totalFactBoxes} / {totalPlanBoxes}
                  </strong>
                </div>
                <div className={styles.mobileGridRow}>
                  <span>Total Weight:</span>
                  <strong>
                    {totalFactWeight.toFixed(1)} / {totalPlanWeight.toFixed(1)}{" "}
                    kg
                  </strong>
                </div>
                <div className={styles.mobileGridRow}>
                  <span>Status:</span>
                  <span
                    className={
                      totalDiffBoxes <= 0 ? styles.greenText : styles.blackText
                    }
                    style={{ fontWeight: "800" }}
                  >
                    {totalDiffBoxes <= 0 ? "✓ READY" : "⏳ INCOMPLETE"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
