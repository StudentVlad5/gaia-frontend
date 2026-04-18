import { Button } from "../../components/UI/Button/Button";
import styles from "./DataTable.module.css";

export const DataTable = ({
  items,
  loading,
  onEdit,
  onDelete,
  currentPage,
  setCurrentPage,
  itemsPerPage = 5,
}) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  if (loading) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.empty}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: "80px" }}>ID</th>
            <th>Name</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.id}>
              <td>
                <span className={styles.idBadge}>#{item.id}</span>
              </td>
              <td className={styles.productName}>{item.name}</td>
              <td style={{ textAlign: "right" }}>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => onEdit(item)}
                  style={{
                    marginRight: 8,
                    padding: "4px 8px",
                    fontSize: "12px",
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (window.confirm("Delete?")) onDelete(item.id);
                  }}
                  style={{ padding: "4px 8px", fontSize: "12px" }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <div className={styles.empty}>No items found.</div>
      )}

      {/* Блок пагінації */}
      {items.length > itemsPerPage && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "5px",
            padding: "12px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "primary" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
              style={{ minWidth: "35px" }}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
