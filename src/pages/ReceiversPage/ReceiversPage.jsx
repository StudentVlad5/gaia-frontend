import { useEffect, useState, useMemo } from "react";
import { api } from "../../api/client";
import { SearchBar } from "../../components/Search/Search";
import { EntityForm } from "../../components/EntityForm/EntityForm";
import { DataTable } from "../../components/DataTable/DataTable";
import styles from "../ProductsPage/ProductsPage.module.css";

export default function ReceiversPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/receivers");
      setItems(res.data.data);
    } catch (err) {
      console.error("Failed to fetch receivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [items, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await api.put(`/receivers/${editingId}`, { name });
      } else {
        await api.post("/receivers", { name });
      }
      setName("");
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(
        `Error saving receiver ${err.response?.data?.message || err.message}`,
      );
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setName(item.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/receivers/${id}`);
      fetchData();
    } catch (err) {
      alert(
        `Cannot delete receiver ${err.response?.data?.message || err.message}`,
      );
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2> Receivers Management</h2>
      </header>

      <EntityForm
        value={name}
        onChange={setName}
        onSubmit={handleSubmit}
        editingId={editingId}
        onCancel={() => {
          setName("");
          setEditingId(null);
        }}
        label="Receiver Name"
        placeholder="Enter full name..."
      />

      <div className={styles.listSection}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        <DataTable
          items={filteredItems}
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
