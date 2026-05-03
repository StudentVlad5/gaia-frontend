import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getPackageProducts,
  createPackageProduct,
  updatePackageProduct,
  deletePackageProduct,
} from "../../api/packageProducts";
import { Type } from "lucide-react";
import { Button } from "../../components/UI/Button/Button";
import { BaseInput } from "../../components/UI/BaseInput/BaseInput";
import { SearchableSelect } from "../../components/UI/SearchableSelect/SearchableSelect";
import { SearchBar } from "../../components/Search/Search";
import { DataTable } from "../../components/DataTable/DataTable";
import styles from "./PackageProductsPage.module.css";

const CATEGORY_OPTIONS = [
  { id: "L", name: "L" },
  { id: "TRI", name: "TRI" },
  { id: "SHR", name: "SHR" },
  { id: "SPORT", name: "SPORT" },
  { id: "DR", name: "DR" },
  { id: "WOOL", name: "WOOL" },
  { id: "BELT", name: "BELT" },
  { id: "TROUS", name: "TROUS" },
  { id: "JACK", name: "JACK" },
  { id: "OTHER", name: "OTHER" },
];

const WEIGHT_OPTIONS = [
  { id: 20, name: "20 kg" },
  { id: 25, name: "25 kg" },
];

export default function PackageProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    standard_weight: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPackageProducts();
      setItems(res.data.data || res.data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [items, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.standard_weight) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editingId) {
        await updatePackageProduct(editingId, formData);
      } else {
        await createPackageProduct(formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      standard_weight: item.standard_weight,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", category: "", standard_weight: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await deletePackageProduct(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    { key: "name", label: "Product Name" },
    { key: "category", label: "Category" },
    { key: "standard_weight", label: "Weight (kg)" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Package Products</h2>
      </header>

      <form onSubmit={handleSubmit} className={styles.inlineForm}>
        <div className={styles.inputField}>
          <BaseInput
            label="Product Name"
            icon={Type}
            placeholder="Enter name..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className={styles.selectField}>
          <SearchableSelect
            label="Category"
            placeholder="Category"
            options={CATEGORY_OPTIONS}
            value={formData.category}
            onChange={(val) => setFormData({ ...formData, category: val })}
          />
        </div>

        <div className={styles.selectField}>
          <SearchableSelect
            label="Weight"
            placeholder="Weight"
            options={WEIGHT_OPTIONS}
            value={formData.standard_weight}
            onChange={(val) =>
              setFormData({ ...formData, standard_weight: val })
            }
          />
        </div>

        <div className={styles.buttonField}>
          <Button type="submit">{editingId ? "Update" : "Add Product"}</Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className={styles.listSection}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        <DataTable
          items={filteredItems}
          columns={columns}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}
