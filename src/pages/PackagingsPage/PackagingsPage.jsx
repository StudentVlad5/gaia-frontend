import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  getPackagings,
  createPackaging,
  updatePackaging,
  deletePackaging,
} from "../../api/packagings";
import { api } from "../../api/client";
import { Button } from "../../components/UI/Button/Button";
import { SearchableSelect } from "../../components/UI/SearchableSelect/SearchableSelect";
import { DateInput } from "../../components/UI/DateInput/DateInput";
import { BaseInput } from "../../components/UI/BaseInput/BaseInput";
import styles from "./PackagingsPage.module.css";

export default function PackagingsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [factories, setFactories] = useState([]);

  const [form, setForm] = useState({
    product_id: "",
    factory_id: "",
    actual_weight: "",
  });
  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    product_id: "",
    factory_id: "",
    date_from: "",
    date_to: "",
  });

  // ================= FETCH DATA =================

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPackagings(filters);
      setItems(res.data.data);
      setMeta(res.data.meta || {});
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadDicts = async () => {
      const [p, f] = await Promise.all([
        api.get("/package-products"),
        api.get("/containers/factories"),
      ]);
      setProducts(p.data.data || p.data);
      setFactories(f.data.data || f.data);
    };
    loadDicts();
  }, []);

  // ================= ACTIONS =================

  const selectedProduct = products.find(
    (p) => Number(p.id) === Number(form.product_id),
  );
  const standardWeight = selectedProduct?.standard_weight || 0;
  const difference = form.actual_weight
    ? (Number(form.actual_weight) - Number(standardWeight)).toFixed(2)
    : "0.00";

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.actual_weight) return;

    const isWeightMatch = Number(form.actual_weight) === Number(standardWeight);
    const payload = {
      ...form,
      standard_weight: standardWeight,
      is_completed: isWeightMatch,
      packed_at: isWeightMatch ? new Date().toISOString() : null,
    };

    try {
      editingId
        ? await updatePackaging(editingId, payload)
        : await createPackaging(payload);
      setForm({ product_id: "", factory_id: "", actual_weight: "" });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const handleComplete = async (item) => {
    try {
      await updatePackaging(item.id, {
        ...item,
        is_completed: true,
        packed_at: new Date().toISOString(),
      });
      fetchData();
    } catch (err) {
      alert(
        `Error finishing package${err.response?.data?.message || err.message}`,
      );
    }
  };

  //   const handleExport = async () => {
  //     try {
  //       const res = await api.get("/packagings/export", {
  //         params: filters,
  //         responseType: "blob",
  //       });
  //       const url = window.URL.createObjectURL(new Blob([res.data]));
  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.setAttribute(
  //         "download",
  //         `packagings_${new Date().toISOString().split("T")[0]}.xlsx`,
  //       );
  //       document.body.appendChild(link);
  //       link.click();
  //       link.remove();
  //     } catch (e) {
  //       alert(`Export failed: ${e.response?.data?.message || e.message}`);
  //     }
  //   };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <Package size={20} />
          <h2>Packagings Journal</h2>
        </div>
      </header>

      {/* FORM SECTION */}
      <div className={styles.card}>
        <form className={styles.inlineForm} onSubmit={handleSave}>
          <SearchableSelect
            options={products.map((p) => ({
              id: p.id,
              name: `${p.name} (${p.category})`,
            }))}
            value={form.product_id}
            onChange={(val) => setForm({ ...form, product_id: val })}
            placeholder="Select Product"
          />
          <SearchableSelect
            options={factories}
            value={form.factory_id}
            onChange={(val) => setForm({ ...form, factory_id: val })}
            placeholder="Select Factory"
          />
          <BaseInput
            type="number"
            placeholder="Actual Weight"
            value={form.actual_weight}
            onChange={(e) =>
              setForm({ ...form, actual_weight: e.target.value })
            }
          />
          <div className={styles.liveInfo}>
            <span className={styles.bold}>Norm: {standardWeight}</span>
            <span
              className={
                Number(difference) !== 0
                  ? styles.dangerText
                  : styles.successText
              }
            >
              Diff: {difference}
            </span>
          </div>
          <Button type="submit">
            {editingId ? <Pencil size={14} /> : <Plus size={14} />}
          </Button>
          {editingId && (
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm({ product_id: "", factory_id: "", actual_weight: "" });
              }}
            >
              <X size={14} />
            </Button>
          )}
        </form>
      </div>

      {/* FILTERS SECTION */}
      <div className={styles.filterSection}>
        <div className={styles.filterRow}>
          <SearchableSelect
            options={products}
            value={filters.product_id}
            onChange={(v) => setFilters({ ...filters, product_id: v, page: 1 })}
            placeholder="All Products"
          />
          <SearchableSelect
            options={factories}
            value={filters.factory_id}
            onChange={(v) => setFilters({ ...filters, factory_id: v, page: 1 })}
            placeholder="All Factories"
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
                limit: 12,
                product_id: "",
                factory_id: "",
                date_from: "",
                date_to: "",
              })
            }
          >
            <X size={14} />
          </Button>
          {/* <Button variant="outline" onClick={handleExport}>
            <Download size={14} /> Excel
          </Button> */}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className={styles.tableWrapper}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>Created At</th>
              <th>Product</th>
              <th>Factory</th>
              <th className={styles.num}>Norm</th>
              <th className={styles.num}>Actual</th>
              <th className={styles.num}>Diff</th>
              <th>Status</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className={styles.dateCell}>
                  {new Date(item.created_at).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className={styles.bold}>{item.product_name}</td>
                <td>{item.factory_name || "—"}</td>
                <td className={styles.num}>{item.standard_weight}</td>
                <td className={styles.num}>
                  {Number(item.actual_weight).toFixed(2)}
                </td>
                <td
                  className={`${styles.num} ${Number(item.difference) !== 0 ? styles.dangerText : styles.successText}`}
                >
                  {item.difference}
                </td>
                <td>
                  {item.is_completed ? (
                    <span className={styles.successText}>
                      <CheckCircle size={14} /> Ready
                    </span>
                  ) : (
                    <Button
                      size="small"
                      variant="primary"
                      disabled={Number(item.difference) !== 0}
                      onClick={() => handleComplete(item)}
                    >
                      Finish
                    </Button>
                  )}
                </td>
                <td className={styles.actionsCol}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => {
                      setForm(item);
                      setEditingId(item.id);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.danger}`}
                    onClick={() => deletePackaging(item.id).then(fetchData)}
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className={styles.paginationBar}>
          <div className={styles.pageStats}>
            Showing <strong>{items.length}</strong> of{" "}
            <strong>{meta.total || items.length}</strong> entries
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
