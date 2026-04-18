import { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        style={{
          flex: 1,
          padding: "30px",
          background: "#f8f9fc",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
