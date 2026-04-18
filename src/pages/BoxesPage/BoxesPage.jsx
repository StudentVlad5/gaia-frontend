import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Weight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";
import {
  getBoxes,
  deleteBox,
  createBox,
  updateBox,
  exportBoxes,
} from "../../api/boxes";
import { api } from "../../api/client";
import { Button } from "../../components/UI/Button/Button";
import { SearchableSelect } from "../../components/UI/SearchableSelect/SearchableSelect";
import { DateInput } from "../../components/UI/DateInput/DateInput";
import { BaseInput } from "../../components/UI/BaseInput/BaseInput";
import styles from "./BoxesPage.module.css";

export default function BoxesPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [receivers, setReceivers] = useState([]);

  const [form, setForm] = useState({
    weight: "",
    product_id: "",
    receiver_id: "",
    boxes_count: 1,
    comment: "",
  });
  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    product_id: "",
    receiver_id: "",
    date_from: "",
    date_to: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBoxes(filters);
      setItems(res.data.data);
      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadDicts = async () => {
      const [p, r] = await Promise.all([
        api.get("/products"),
        api.get("/receivers"),
      ]);
      setProducts(p.data.data);
      setReceivers(r.data.data);
    };
    loadDicts();
  }, []);

  const handleExport = async () => {
    try {
      const response = await exportBoxes(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `boxes_report_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <Package size={20} />
          <h2>Boxes Journal</h2>
        </div>
      </header>
      <div className={styles.card}>
        <form
          className={styles.inlineForm}
          onSubmit={(e) => e.preventDefault()}
        >
          <BaseInput
            type="number"
            placeholder="Weight"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />
          <SearchableSelect
            options={products}
            value={form.product_id}
            onChange={(val) => setForm({ ...form, product_id: val })}
            placeholder="Select Product"
          />
          <SearchableSelect
            options={receivers}
            value={form.receiver_id}
            onChange={(val) => setForm({ ...form, receiver_id: val })}
            placeholder="Select Receiver"
          />
          <BaseInput
            placeholder="Add comment..."
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          <div className={styles.formActions}>
            <Button
              onClick={async () => {
                editingId
                  ? await updateBox(editingId, form)
                  : await createBox(form);
                setForm({
                  weight: "",
                  product_id: "",
                  receiver_id: "",
                  boxes_count: 1,
                  comment: "",
                });
                setEditingId(null);
                fetchData();
              }}
            >
              {editingId ? <Pencil size={14} /> : <Plus size={14} />}
            </Button>
          </div>
        </form>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.filterRow}>
          <SearchableSelect
            options={products}
            value={filters.product_id}
            onChange={(v) => setFilters({ ...filters, product_id: v, page: 1 })}
            placeholder="All Products"
          />

          <SearchableSelect
            options={receivers}
            value={filters.receiver_id}
            onChange={(v) =>
              setFilters({ ...filters, receiver_id: v, page: 1 })
            }
            placeholder="All Receivers"
          />

          <DateInput
            value={filters.date_from}
            onChange={(v) => setFilters({ ...filters, date_from: v, page: 1 })}
          />

          <DateInput
            value={filters.date_to}
            onChange={(v) => setFilters({ ...filters, date_to: v, page: 1 })}
          />

          <Button
            variant="outline"
            size="small"
            onClick={() =>
              setFilters({
                page: 1,
                limit: 15,
                product_id: "",
                receiver_id: "",
                date_from: "",
                date_to: "",
              })
            }
            title="Clear all filters"
          >
            <X size={14} />
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            title="Export to Excel"
          >
            <Download size={14} /> Export Excel
          </Button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Receiver</th>
              <th className={styles.num}>Weight</th>
              <th>Comment</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td className={styles.dateCell}>
                  {new Date(b.date).toLocaleDateString()}
                </td>
                <td className={styles.bold}>{b.product_name}</td>
                <td>{b.receiver_name || "—"}</td>
                <td className={styles.num}>{Number(b.weight).toFixed(2)}</td>
                <td className={styles.commentCell}>{b.comment}</td>
                <td className={styles.actionsCol}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => {
                      setForm(b);
                      setEditingId(b.id);
                    }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.danger}`}
                    onClick={() => deleteBox(b.id).then(fetchData)}
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.totalRow}>
              <td colSpan="3">TOTAL ON PAGE</td>
              <td className={styles.num}>
                {items
                  .reduce((acc, curr) => acc + Number(curr.weight), 0)
                  .toFixed(2)}
              </td>
              <td colSpan="2" style={{ textAlign: "right", color: "#64748b" }}>
                Global Total: <strong>{meta.total_weight} kg</strong>
              </td>
            </tr>
          </tfoot>
        </table>
        <div className={styles.paginationBar}>
          <div className={styles.pageStats}>
            Showing <strong>{items.length}</strong> of{" "}
            <strong>{meta.total || items.length}</strong> entries
            <span className={styles.statsSeparator}>{" " + "|" + " "}</span>
            Total Weight:{" "}
            <strong>{Number(meta.total_weight || 0).toFixed(2)} kg</strong>
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
    </div>
  );
}
