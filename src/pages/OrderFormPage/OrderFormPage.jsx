import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../../api/client";
import { Button } from "../../components/UI/Button/Button";
import { SearchableSelect } from "../../components/UI/SearchableSelect/SearchableSelect";
import OrderModal from "../../components/OrderModal/OrderModal";
import styles from "./OrderFormPage.module.css";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function OrderFormPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    receiver_id: "",
    status: "",
  });
  const [meta, setMeta] = useState({ total: 0, total_pages: 1 });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders", { params: filters });
      setOrders(res.data.data || res.data);
      console.log(res.data.data || res.data);
      setMeta(
        res.data.meta || {
          total: (res.data.data || res.data).length,
          total_pages: 1,
        },
      );
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const loadDicts = async () => {
      try {
        const [p, r] = await Promise.all([
          api.get("/products"),
          api.get("/receivers"),
        ]);
        setProducts(p.data.data || p.data);
        setReceivers(r.data.data || r.data);
      } catch (err) {
        console.error("Failed to load dictionaries", err);
      }
    };
    loadDicts();
  }, []);

  const handleOpenCreate = () => {
    setSelectedOrderId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id) => {
    setSelectedOrderId(id);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order plan?"))
      return;
    try {
      await api.delete(`/orders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error("Failed to delete order", err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <Package size={20} />
          <h2>Order Planning</h2>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={14} /> Create Plan
        </Button>
      </header>

      {/* Filters */}
      <div className={styles.filterSection}>
        <div className={styles.filterRow}>
          <SearchableSelect
            options={receivers}
            value={filters.receiver_id}
            onChange={(v) =>
              setFilters({ ...filters, receiver_id: v, page: 1 })
            }
            placeholder="All Receivers"
          />
          <select
            className={styles.selectInput}
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button
            variant="outline"
            size="small"
            onClick={() =>
              setFilters({ page: 1, limit: 10, receiver_id: "", status: "" })
            }
            title="Clear Filters"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Orders Journal Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>Date Range</th>
              <th>Receiver</th>
              <th className={styles.num}>Positions</th>
              <th className={styles.num}>Total Boxes</th>
              <th className={styles.num}>Expected Weight</th>
              <th>Status</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className={styles.dateCell}>
                    {formatDate(o.date_start)} : {formatDate(o.date_end)}
                  </td>
                  <td className={styles.bold}>{o.receiver_name}</td>
                  <td className={styles.num}>{o.total_products}</td>
                  <td className={styles.num}>{o.total_planned_boxes} pcs</td>
                  <td className={styles.num}>
                    {Number(o.total_expected_weight || 0).toFixed(2)} kg
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[o.status]}`}>
                      {o.status === "active"
                        ? "Active"
                        : o.status === "completed"
                          ? "Completed"
                          : "Cancelled"}
                    </span>
                  </td>
                  <td className={styles.actionsCol}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => handleOpenEdit(o.id)}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.danger}`}
                      onClick={() => handleDeleteOrder(o.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className={styles.paginationBar}>
          <div className={styles.pageStats}>
            Showing <strong>{orders.length}</strong> of{" "}
            <strong>{meta.total}</strong> orders
          </div>
          <div className={styles.pageControls}>
            <Button
              variant="outline"
              size="small"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className={styles.pageNumber}>
              Page <strong>{filters.page}</strong> of {meta.total_pages || 1}
            </span>
            <Button
              variant="outline"
              size="small"
              disabled={filters.page === meta.total_pages}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={selectedOrderId}
        receivers={receivers}
        products={products}
        existingOrders={orders}
        onSaveSuccess={fetchOrders}
      />
    </div>
  );
}
