import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { api } from "../../api/client";
import { Button } from "../../components/UI/Button/Button";
import { SearchableSelect } from "../../components/UI/SearchableSelect/SearchableSelect";
import { DateInput } from "../../components/UI/DateInput/DateInput";
import { BaseInput } from "../../components/UI/BaseInput/BaseInput";
import styles from "../../pages/OrderFormPage/OrderFormPage.module.css";

export default function OrderModal({
  isOpen,
  onClose,
  editingId,
  receivers,
  products,
  existingOrders,
  onSaveSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formMeta, setFormMeta] = useState({
    receiver_id: "",
    date_start: "",
    date_end: "",
    status: "active",
  });
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingId) {
      const loadOrderDetails = async () => {
        try {
          const res = await api.get(`/orders/${editingId}`);
          const fullOrder = res.data;
          setFormMeta({
            receiver_id: fullOrder.receiver_id,
            date_start: fullOrder.date_start.split("T")[0],
            date_end: fullOrder.date_end.split("T")[0],
            status: fullOrder.status,
          });
          setOrderItems(
            (fullOrder.items || []).map((item) => ({
              ...item,
              avg_weight: Number(item.avg_weight) || 0,
              planned_boxes: Number(item.planned_boxes) || 0,
            })),
          );
        } catch (err) {
          console.error("Failed to load spec", err);
        }
      };
      loadOrderDetails();
    } else {
      setFormMeta({
        receiver_id: "",
        date_start: "",
        date_end: "",
        status: "active",
      });
      setOrderItems([]);
    }
  }, [isOpen, editingId]);

  const handleAddProductToForm = async (productId) => {
    if (
      !productId ||
      orderItems.some((item) => item.product_id === Number(productId))
    )
      return;

    try {
      const res = await api.get(`/orders/products/${productId}/average-weight`);
      // Безпечний парсинг для уникнення NaN
      const avgWeight = Number(res.data.average_weight) || 0;
      const productObj = products.find((p) => p.id === Number(productId));

      setOrderItems([
        ...orderItems,
        {
          product_id: Number(productId),
          product_name: productObj?.name || "Unknown Product",
          planned_boxes: 1,
          avg_weight: avgWeight,
        },
      ]);
    } catch (err) {
      console.error("Error getting product average weight", err);
    }
  };

  const handleQtyChange = (index, value) => {
    const updated = [...orderItems];
    updated[index].planned_boxes = Number(value) || 0;
    setOrderItems(updated);
  };

  const handleRemoveProduct = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const totalBoxes = orderItems.reduce(
    (acc, item) => acc + item.planned_boxes,
    0,
  );
  const totalWeight = orderItems.reduce(
    (acc, item) => acc + item.planned_boxes * item.avg_weight,
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formMeta.receiver_id ||
      !formMeta.date_start ||
      !formMeta.date_end ||
      orderItems.length === 0
    ) {
      alert("Please fill in all fields and add products.");
      return;
    }

    // ВАЛІДАЦІЯ: Перевірка перетину дат для обраного отримувача
    const newStart = new Date(formMeta.date_start);
    const newEnd = new Date(formMeta.date_end);

    if (newEnd < newStart) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    const isOverlapping = existingOrders.some((order) => {
      // Пропускаємо поточне замовлення при редагуванні
      if (editingId && order.id === editingId) return false;

      // Перевіряємо лише активні плани того ж самого отримувача
      if (
        order.receiver_id === Number(formMeta.receiver_id) &&
        order.status === "active"
      ) {
        const existingStart = new Date(order.date_start);
        const existingEnd = new Date(order.date_end);

        // Умова перетину періодів
        return newStart <= existingEnd && newEnd >= existingStart;
      }
      return false;
    });

    if (isOverlapping) {
      alert(
        "This receiver already has an ACTIVE order plan within the selected period. " +
          "Please change the dates or cancel/complete the existing active order.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formMeta, items: orderItems };
      if (editingId) {
        await api.put(`/orders/${editingId}`, payload);
      } else {
        await api.post("/orders", payload);
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save order plan", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <header className={styles.modalHeader}>
          <h3>
            {editingId ? `Edit Plan #${editingId}` : "Create Packing Plan"}
          </h3>
          <button className={styles.closeModalBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.metaFormGrid}>
            <div className={styles.inputGroup}>
              <label>Receiver</label>
              <SearchableSelect
                options={receivers}
                value={formMeta.receiver_id}
                onChange={(val) =>
                  setFormMeta({ ...formMeta, receiver_id: val })
                }
                placeholder="Select Receiver"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Start Date</label>
              <DateInput
                value={formMeta.date_start}
                onChange={(val) =>
                  setFormMeta({ ...formMeta, date_start: val })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <label>End Date</label>
              <DateInput
                value={formMeta.date_end}
                onChange={(val) => setFormMeta({ ...formMeta, date_end: val })}
              />
            </div>
            {editingId && (
              <div className={styles.inputGroup}>
                <label>Status</label>
                <select
                  className={styles.selectInput}
                  value={formMeta.status}
                  onChange={(e) =>
                    setFormMeta({ ...formMeta, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          <div className={styles.innerProductSelector}>
            <label>Add products to specification:</label>
            <SearchableSelect
              options={products}
              value=""
              onChange={handleAddProductToForm}
              placeholder="➕ Choose product to insert"
            />
          </div>

          <div className={styles.modalTableWrapper}>
            <table className={styles.modalTable}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th style={{ width: "120px" }}>Plan (Boxes)</th>
                  <th>Avg Weight (kg)</th>
                  <th className={styles.num}>Expected Total</th>
                  <th style={{ width: "40px" }}></th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        padding: "16px",
                      }}
                    >
                      Specification is empty. Please add items.
                    </td>
                  </tr>
                ) : (
                  orderItems.map((item, index) => (
                    <tr key={item.product_id}>
                      <td className={styles.bold}>{item.product_name}</td>
                      <td>
                        <BaseInput
                          type="number"
                          min="1"
                          value={item.planned_boxes}
                          onChange={(e) =>
                            handleQtyChange(index, e.target.value)
                          }
                        />
                      </td>
                      <td>{(Number(item.avg_weight) || 0).toFixed(2)}</td>
                      <td className={styles.num}>
                        {(
                          (Number(item.planned_boxes) || 0) *
                          (Number(item.avg_weight) || 0)
                        ).toFixed(2)}{" "}
                        kg
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.removeProductBtn}
                          onClick={() => handleRemoveProduct(index)}
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {orderItems.length > 0 && (
                <tfoot>
                  <tr className={styles.modalTotalRow}>
                    <td>Total:</td>
                    <td>{totalBoxes} pcs</td>
                    <td>—</td>
                    <td className={styles.num}>{totalWeight.toFixed(2)} kg</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <footer className={styles.modalFooter}>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save size={14} /> {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
