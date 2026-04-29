import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion"; // 'motion' is used below in motion.div
import { SearchableSelect } from "../../components/UI/SearchableSelect/SearchableSelect";
import * as api from "../../api/containers";
import styles from "./Warehouse.module.css";
import { Plus, Settings2, Trash2, Box } from "lucide-react";
import io from "socket.io-client";

const socket = io("https://gaia-server-gayu.onrender.com");

const CATEGORY_GROUPS = {
  blue: ["trausers", "jackets"],
  gray: ["leather", "wool", "shirts", "dresses", "trikotage", "sport"],
  small: ["belt", "bags", "hats", "scarf"],
};

export default function Warehouse() {
  const [state, setState] = useState({
    containers: [],
    settings: [],
    factories: [],
  });
  const [selectedFactoryId, setSelectedFactoryId] = useState("");
  const [activeId, setActiveId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const { data } = await api.getContainers();
      const factories = await api.getFactories();
      setState({
        containers: data.grouped || [],
        settings: data.settings || [],
        factories: factories.data || [],
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
    socket.on("containers:update", loadData);
    return () => socket.off("containers:update");
  }, [loadData]); // loadData is now stable due to useCallback

  const handleAddFactory = async () => {
    const name = prompt("Enter new factory name:");
    if (name?.trim()) {
      await api.addFactory(name.trim());
      loadData();
    }
  };

  const handleEditFactory = async () => {
    if (!selectedFactoryId) return alert("Select a factory first!");
    const currentFactory = state.factories.find(
      (f) => f.id === selectedFactoryId || f._id === selectedFactoryId,
    );

    const newName = prompt(
      "Enter new factory name:",
      currentFactory?.name || "",
    );
    if (newName?.trim()) {
      await api.updateFactory(selectedFactoryId, newName.trim());
      loadData();
    }
  };

  const handleUnload = async (product, factory, ids) => {
    if (!ids || ids.length === 0) return;
    const idToDelete = ids[0];
    try {
      await api.removeContainer(idToDelete);
      loadData();
    } catch (err) {
      console.error("Failed to delete container:", err);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    if (!selectedFactoryId) {
      alert("Please, choose the factory!");
      setActiveId(null);
      return;
    }

    const product = active.id;
    const zoneType = over.id;

    const currentSettings = state.settings.find((s) => s.type === zoneType);
    const total = currentSettings?.total || 0;
    const used = state.containers
      .filter((c) => c.type === zoneType)
      .reduce((acc, curr) => acc + parseInt(curr.count), 0);

    if (total - used <= 0) {
      alert("No free space in this zone!");
      setActiveId(null);
      return;
    }

    if (CATEGORY_GROUPS[zoneType].includes(product)) {
      socket.emit("container:add", {
        product,
        type: zoneType,
        factoryId: selectedFactoryId,
      });
    } else {
      alert("The wrong zone!");
    }

    setActiveId(null);
  };

  return (
    <DndContext
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.screenWrapper}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <h2>Gaia Warehouse</h2>
          </div>
          <div className={styles.controls}>
            <div className={styles.selectWrapper}>
              <SearchableSelect
                options={state.factories}
                value={selectedFactoryId}
                onChange={setSelectedFactoryId}
                placeholder="Select Factory..."
              />
              {selectedFactoryId && (
                <button onClick={handleEditFactory} className={styles.editBtn}>
                  <Settings2 size={16} />
                </button>
              )}
            </div>
            <button onClick={handleAddFactory} className={styles.actionBtn}>
              <Plus size={18} /> Factory
            </button>
          </div>
        </header>

        <div className={styles.mainGrid}>
          {Object.keys(CATEGORY_GROUPS).map((color) => {
            // Рахуємо вільне місце заздалегідь для кожної колонки
            const total =
              state.settings.find((s) => s.type === color)?.total || 0;
            const used = state.containers
              .filter((c) => c.type === color)
              .reduce((acc, curr) => acc + parseInt(curr.count), 0);
            const free = total - used;

            return (
              <div key={color} className={styles.zoneColumn}>
                <DroppableZone type={color} free={free} total={total} />

                {/* Гнучка секція з продуктами */}
                <div className={`${styles.productSource} ${styles[color]}`}>
                  {CATEGORY_GROUPS[color].map((id) => (
                    <DraggableProduct
                      key={id}
                      id={id}
                      disabled={free <= 0} // Блокуємо, якщо 0
                    />
                  ))}
                </div>

                {/* Секція аналітики */}
                <div className={styles.analyticsSection}>
                  <h4 className={styles.sectionLabel}>
                    <Box size={14} style={{ marginRight: "8px" }} />
                    Filled {color}
                  </h4>
                  <ZoneAnalytics
                    type={color}
                    groupedData={state.containers}
                    onUnload={handleUnload}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className={styles.draggingItem}>{activeId}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Destructure onUnload from props
function ZoneAnalytics({ type, groupedData, onUnload }) {
  const productsInZone = useMemo(() => {
    const zoneItems = groupedData.filter((item) => item.type === type);
    const productMap = {};

    zoneItems.forEach((item) => {
      if (!productMap[item.product]) {
        productMap[item.product] = { total: 0, factories: [] };
      }
      const count = parseInt(item.count);
      productMap[item.product].total += count;
      productMap[item.product].factories.push({
        name: item.factory || "Unknown",
        count: count,
        ids: item.ids,
      });
    });

    return Object.entries(productMap).sort((a, b) => b[1].total - a[1].total);
  }, [groupedData, type]);

  return (
    <AnimatePresence>
      {productsInZone.map(([productName, data]) => (
        <motion.div layout key={productName} className={styles.miniTableCard}>
          <div className={styles.miniTableHeader}>
            <span>{productName}</span>
            <span className={styles.totalBadge}>{data.total}</span>
          </div>
          {data.factories.map((f, idx) => (
            <div key={`${f.name}-${idx}`} className={styles.tableRow}>
              <span>{f.name}</span>
              <div className={styles.rowActions}>
                <span>{f.count} pcs</span>
                <button
                  onClick={() => onUnload(productName, f.name, f.ids)}
                  className={styles.unloadBtn}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

function DroppableZone({ type, free, total }) {
  const { setNodeRef, isOver } = useDroppable({ id: type });

  // ЛОГІКА КОЛЬОРІВ
  let statusColor = "inherit"; // дефолтний
  if (free === 2) statusColor = "#f97316"; // помаранчевий
  if (free <= 1) statusColor = "#ef4444"; // червоний (якщо 1 або 0)

  return (
    <div
      ref={setNodeRef}
      className={`${styles.zoneHeader} ${isOver ? styles.isOver : ""}`}
      style={{ borderColor: statusColor }}
    >
      <div className={styles.zoneMeta}>
        <span
          className={styles.zoneName}
          style={{ color: free <= 2 ? statusColor : "white" }}
        >
          {type} Zone
        </span>
        <button
          className={styles.settingsBtn}
          onClick={() => {
            const val = prompt(`New total capacity for ${type}:`);
            if (val) api.updateLimit(type, val);
          }}
        >
          <Settings2 size={14} />
        </button>
      </div>
      <div className={styles.zoneStats}>
        <span
          className={styles.freeCount}
          style={{ fontWeight: free <= 2 ? "bold" : "normal" }}
        >
          Free {free}
        </span>
        <span className={styles.totalCount}>from {total}</span>
      </div>
    </div>
  );
}

function DraggableProduct({ id, disabled }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    disabled: disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${styles.productItem} ${disabled ? styles.disabled : ""}`}
      style={{
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "grab",
        fontSize: "12px",
        padding: "8px",
      }}
    >
      {id}
    </div>
  );
}
