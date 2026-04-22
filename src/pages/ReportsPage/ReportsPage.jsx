import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import {
  LayoutDashboard,
  Box,
  Weight,
  Scale,
  CalendarDays,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";

import styles from "./ReportsPage.module.css";
import { Button } from "../../components/UI/Button/Button";
import { DateInput } from "../../components/UI/DateInput/DateInput";

const getDayInfo = (dateString) => {
  const date = new Date(dateString);
  return {
    formatted: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    }),
    weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
  };
};

export default function ReportsPage() {
  const [data, setData] = useState({
    days: [],
    products: [],
    receivers: [],
    summary: {},
  });
  const [isLoading, setIsLoading] = useState(false);

  // Default to current year
  const [range, setRange] = useState({
    from: `${new Date().getFullYear()}-01-01`,
    to: `${new Date().getFullYear()}-12-31`,
  });

  const setQuickRange = (type) => {
    const now = new Date();
    let from = new Date();

    if (type === "week") {
      const day = now.getDay() || 7;
      from.setDate(now.getDate() - day + 1);
    } else if (type === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (type === "year") {
      from = new Date(now.getFullYear(), 0, 1);
    }

    const formatDate = (date) => date.toISOString().split("T")[0];
    setRange({ from: formatDate(from), to: formatDate(now) });
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const params = { params: range };
      const [d, p, r, s] = await Promise.all([
        api.get(`/reports/by-days`, params),
        api.get(`/reports/by-products`, params),
        api.get(`/reports/by-receivers`, params),
        api.get(`/reports/summary`, params),
      ]);

      setData({
        days: d.data.data,
        products: p.data.data,
        receivers: r.data.data,
        summary: s.data.data,
      });
    } catch (err) {
      console.error("Report loading failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className={styles.container}>
      {/* HEADER & QUICK FILTERS */}
      <div className={styles.topBar}>
        <h1 className={styles.pageHeader}>
          <LayoutDashboard className={styles.headerIcon} size={24} />
          Analytics Dashboard
        </h1>

        <div className={styles.filterGroup}>
          <div className={styles.quickActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuickRange("week")}
            >
              This Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuickRange("month")}
            >
              This Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuickRange("year")}
            >
              This Year
            </Button>
          </div>

          <DateInput
            value={range.from}
            onChange={(v) => setRange({ ...range, from: v })}
          />
          <DateInput
            value={range.to}
            onChange={(v) => setRange({ ...range, to: v })}
          />
          <Button onClick={loadReports} disabled={isLoading}>
            Apply
          </Button>
        </div>
      </div>

      {/* SUMMARY SECTION */}
      <div className={styles.summaryGrid}>
        <StatCard
          icon={<Box className="text-blue-600" />}
          label="Total Boxes"
          value={data.summary.total_boxes}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Weight className="text-emerald-600" />}
          label="Total Weight"
          value={`${data.summary.total_weight} kg`}
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={<Scale className="text-amber-600" />}
          label="Average Weight"
          value={`${Number(data.summary.avg_weight || 0).toFixed(2)} kg`}
          bgColor="bg-amber-50"
        />
      </div>

      {/* RECEIVERS & PRODUCTS DETAILED TABLE */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderWrapper}>
          <div className={styles.headerTitle}>
            <Users size={20} className="text-blue-600" />
            Shipping Details by Receiver
          </div>
          <span className={styles.headerSubtitle}>Detailed Breakdown</span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Receiver / Product Name</th>
              <th>Quantity (Boxes)</th>
              <th>Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            {data.receivers.map((receiver, rIdx) => (
              <React.Fragment key={`rec-${rIdx}`}>
                {/* Group Header: Receiver Name */}
                <tr className={styles.receiverHeader}>
                  <td colSpan="3">
                    <div className={styles.flexAlignCenter}>
                      <div className={styles.receiverIndicator}></div>
                      {receiver.name}
                    </div>
                  </td>
                </tr>

                {/* Sub-rows: Products for this receiver */}
                {receiver.items &&
                  receiver.items.map((item, iIdx) => (
                    <tr key={`item-${iIdx}`} className={styles.productRow}>
                      <td>{item.product_name}</td>
                      <td>
                        {item.total_boxes}
                        <span className={styles.unitText}>pcs</span>
                      </td>
                      <td>
                        {item.total_weight}
                        <span className={styles.unitText}>kg</span>
                      </td>
                    </tr>
                  ))}

                {/* Fallback if no items array (flat structure) */}
                {!receiver.items && (
                  <tr className={styles.productRow}>
                    <td>{receiver.product_name || "General Cargo"}</td>
                    <td>
                      {receiver.total_boxes}
                      <span className={styles.unitText}>pcs</span>
                    </td>
                    <td>
                      {receiver.total_weight}
                      <span className={styles.unitText}>kg</span>
                    </td>
                  </tr>
                )}

                {/* Footer: Total for this receiver */}
                <tr className={styles.totalRow}>
                  <td className={styles.totalLabel}>
                    Total for {receiver.name}
                  </td>
                  <td className={styles.totalValue}>
                    <span className={styles.badge}>
                      {receiver.total_boxes} Boxes
                    </span>
                  </td>
                  <td className={styles.totalValue}>
                    <span className={styles.weightHighlight}>
                      {receiver.total_weight} kg
                    </span>
                  </td>
                </tr>

                {/* Spacer row */}
                <tr className={styles.spacerRow}>
                  <td colSpan="3"></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 1. DAILY SHIPMENT DYNAMICS */}
      <div className={styles.reportSection}>
        <div className={styles.sectionHeader}>
          <TrendingUp size={20} className="text-blue-600" />
          Daily Shipping Volume (Total Weight)
        </div>

        <div className={styles.chartWrapper}>
          {data.days.map((day, idx) => {
            const maxWeight = Math.max(
              ...data.days.map((d) => Number(d.total_weight)),
            );
            const heightPercent = (Number(day.total_weight) / maxWeight) * 100;
            const { formatted, weekday } = getDayInfo(day.day);

            return (
              <div key={idx} className={styles.chartColumn}>
                <div
                  className={styles.bar}
                  style={{ height: `${heightPercent}%` }}
                >
                  <span className={styles.barValue}>
                    {Math.round(day.total_weight)}
                  </span>
                </div>
                <div className={styles.dayLabel}>
                  <span className={styles.dayName}>{weekday}</span>
                  {formatted}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PRODUCT STRUCTURE (Sorted by Weight) */}
      <div className={styles.reportSection}>
        <div className={styles.sectionHeader}>
          <Package size={20} className="text-blue-600" />
          Product Weight Distribution
        </div>

        <div className={styles.productList}>
          {data.products
            .sort((a, b) => Number(b.total_weight) - Number(a.total_weight))
            .map((prod, i) => {
              // Виправлений розрахунок відсотка:
              // (вага товару / загальна вага всіх товарів у поточному звіті) * 100
              const totalWeightAllProducts = data.products.reduce(
                (acc, p) => acc + Number(p.total_weight),
                0,
              );
              const share =
                totalWeightAllProducts > 0
                  ? (
                      (Number(prod.total_weight) / totalWeightAllProducts) *
                      100
                    ).toFixed(1)
                  : 0;

              return (
                <div key={i} className={styles.productListItem}>
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{prod.name}</span>
                    <div className={styles.progressContainer}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${share}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className={styles.productStats}>
                    <div>
                      <span className={styles.statValue}>
                        {prod.total_boxes}
                      </span>
                      <span className={styles.statLabel}>Boxes</span>
                    </div>
                    <div>
                      <span className={styles.statValue}>
                        {Number(prod.total_weight).toFixed(1)} kg
                      </span>
                      <span className={styles.statLabel}>Total Weight</span>
                    </div>
                    <div style={{ minWidth: "65px" }}>
                      <span className={styles.statValue}>{share}%</span>
                      <span className={styles.statLabel}>of Total</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.iconWrapper} ${bgColor}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value || 0}</p>
      </div>
    </div>
  );
}
