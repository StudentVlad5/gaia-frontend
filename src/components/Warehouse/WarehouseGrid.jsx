import React, { useEffect, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";

import io from "socket.io-client";

const socket = io("http://localhost:5000");

// 🎯 mapping
const productTypeMap = {
  trausers: "blue",
  jackets: "blue",
  leather: "gray",
  wool: "gray",
  shirts: "gray",
  dresses: "gray",
  sport: "gray",
  belt: "small",
  bags: "small",
  hats: "small",
  "scarf/headscarf": "small",
};

const products = Object.keys(productTypeMap);

// 🎨 стилі
const typeColors = {
  blue: "#2563eb",
  gray: "#6b7280",
  small: "#92400e",
};

// 🧲 DRAG ITEM
const ProductItem = ({ id }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        padding: 10,
        marginBottom: 8,
        background: "#111827",
        color: "white",
        borderRadius: 6,
        cursor: "grab",
      }}
    >
      {id}
    </div>
  );
};

// 📦 КЛІТИНКА КОНТЕЙНЕРА
const Cell = ({ item, type, onRemove, isPreview }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      style={{
        height: 80,
        borderRadius: 10,
        background: item ? "#1f2937" : "#111827",
        border: `2px solid ${typeColors[type]}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 12,
        cursor: item ? "pointer" : "default",
        opacity: isPreview ? 0.6 : 1,
      }}
      onClick={() => item && onRemove(item.id)}
    >
      {item ? (
        <div>
          <div>{item.product}</div>
          <div style={{ fontSize: 10, opacity: 0.7 }}>{item.factory}</div>
        </div>
      ) : (
        "+"
      )}
    </motion.div>
  );
};

// 🧲 GRID
const GridZone = ({ type, containers, total, onRemove, preview }) => {
  const { setNodeRef, isOver } = useDroppable({ id: type });

  const free = total - containers.length;

  const getStatusColor = () => {
    if (free <= 1) return "red";
    if (free <= 3) return "orange";
    return typeColors[type];
  };

  const cells = [...containers];

  // додаємо пусті
  while (cells.length < total) {
    cells.push(null);
  }

  return (
    <div style={{ flex: 1 }}>
      <h3 style={{ color: getStatusColor() }}>
        {type.toUpperCase()} ({free})
      </h3>

      <div
        ref={setNodeRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px,1fr))",
          gap: 10,
          padding: 10,
          background: "#020617",
          borderRadius: 12,
        }}
      >
        {cells.map((item, i) => (
          <Cell
            key={item?.id || i}
            item={item}
            type={type}
            onRemove={onRemove}
            isPreview={isOver && !item && preview}
          />
        ))}
      </div>
    </div>
  );
};

export default function WarehouseGrid() {
  const [state, setState] = useState({
    containers: [],
    settings: [],
  });

  const [active, setActive] = useState(null);
  const [factory, setFactory] = useState("Togo");

  useEffect(() => {
    fetch("http://localhost:5000/containers/state")
      .then((r) => r.json())
      .then(setState);

    socket.on("containers:update", setState);

    return () => socket.off("containers:update");
  }, []);

  const getContainers = (type) =>
    state.containers.filter((c) => c.type === type);

  const getTotal = (type) =>
    state.settings.find((s) => s.type === type)?.total || 0;

  const handleDragStart = (event) => {
    setActive(event.active.id);
  };

  const handleDragEnd = ({ over }) => {
    if (!over || !active) return;

    const type = productTypeMap[active];

    if (type !== over.id) return;

    socket.emit("container:add", {
      product: active,
      type,
      factory,
    });

    setActive(null);
  };

  const remove = (id) => {
    socket.emit("container:remove", id);
  };

  // ⌨️ shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "1") setFactory("Togo");
      if (e.key === "2") setFactory("Viva");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* LEFT */}
        <div style={{ width: 250, padding: 10 }}>
          <h3>Products</h3>

          <div style={{ marginBottom: 10 }}>
            Factory:
            <select
              value={factory}
              onChange={(e) => setFactory(e.target.value)}
            >
              <option>Togo</option>
              <option>Viva</option>
            </select>
          </div>

          {products.map((p) => (
            <ProductItem key={p} id={p} />
          ))}
        </div>

        {/* RIGHT */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 10,
            padding: 10,
          }}
        >
          <GridZone
            type="blue"
            containers={getContainers("blue")}
            total={getTotal("blue")}
            onRemove={remove}
            preview={active}
          />

          <GridZone
            type="gray"
            containers={getContainers("gray")}
            total={getTotal("gray")}
            onRemove={remove}
            preview={active}
          />

          <GridZone
            type="small"
            containers={getContainers("small")}
            total={getTotal("small")}
            onRemove={remove}
            preview={active}
          />
        </div>
      </div>

      {/* 🧲 DRAG PREVIEW */}
      <DragOverlay>
        {active && (
          <div
            style={{
              padding: 10,
              background: "#111827",
              color: "white",
              borderRadius: 6,
            }}
          >
            {active}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
