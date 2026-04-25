import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getPackageStatus,
  getOrders,
  getTables,
  getEmployees,
} from "../../services/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [o, t, p] = await Promise.allSettled([
      getOrders(),
      getTables(),
      getPackageStatus(),
    ]);
    if (o.status === "fulfilled") setOrders(o.value.data.data || []);
    if (t.status === "fulfilled") setTables(t.value.data.data || []);
    if (p.status === "fulfilled") setPkg(p.value.data.data);
    setLoading(false);
  };

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === new Date().toDateString(),
  );
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const revenue = orders
    .filter((o) => o.isPaid)
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const activeTables = tables.filter((t) => t.isActive).length;
  const totalOrders = orders.length || 1;

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const itemSales = {};
  orders.forEach((o) =>
    o.items?.forEach((i) => {
      if (!itemSales[i.name])
        itemSales[i.name] = { name: i.name, count: 0, revenue: 0 };
      itemSales[i.name].count += i.quantity;
      itemSales[i.name].revenue += i.price * i.quantity;
    }),
  );
  const topItems = Object.values(itemSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const SC = {
    pending: "#eab308",
    preparing: "#8b5cf6",
    ready: "#f97316",
    served: "#22c55e",
    cancelled: "#ef4444",
  };
  const SBG = {
    pending: "#fefce8",
    preparing: "#f5f3ff",
    ready: "#fff7ed",
    served: "#f0fdf4",
    cancelled: "#fef2f2",
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "⊞" },
    {
      id: "orders",
      label: "Orders",
      path: "/dashboard/orders",
      icon: "🛍",
      badge: pendingOrders.length,
    },
    {
      id: "menu",
      label: "Menu Management",
      path: "/dashboard/menu",
      icon: "⭐",
    },
    {
      id: "tables",
      label: "Tables & QR",
      path: "/dashboard/tables",
      icon: "⊟",
    },
    {
      id: "employees",
      label: "Staff Management",
      path: "/dashboard/employees",
      icon: "👥",
    },
    { id: "cashier", label: "Cashier", path: "/dashboard/cashier", icon: "🧾" },
    { id: "kyc", label: "KYC", path: "/dashboard/kyc", icon: "🛡" },
    { id: "package", label: "Package", path: "/dashboard/package", icon: "📦" },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
        background: "#f0f2f8",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .dash-content *{box-sizing:border-box}
        .stat-card:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(0,0,0,.1)!important}
        .order-row:hover{background:#f8faff!important}
        .view-btn:hover{border-color:#4361ee!important;color:#4361ee!important}
        .nav-link:hover{background:rgba(255,255,255,.07)!important;color:rgba(255,255,255,.9)!important}
        .qa-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.1)}
        .top-item:hover{background:#f8faff!important}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      `}</style>

      {/* MAIN */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Topbar */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 28px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "19px",
                fontWeight: 800,
                color: "#1a1f2e",
                letterSpacing: "-.4px",
              }}
            >
              Welcome back, {user?.name?.split(" ")[0] || "Admin"}! 👋
            </div>
            <div
              style={{ fontSize: "12.5px", color: "#64748b", marginTop: "1px" }}
            >
              Here's what's happening at your restaurant today.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "7px 13px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#64748b",
              }}
            >
              📅{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <Link to="/dashboard/menu" style={{ textDecoration: "none" }}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 16px",
                  background: "#4361ee",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + Add New Item
              </button>
            </Link>
            {!user?.isKYCVerified && (
              <Link to="/dashboard/kyc" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "7px 13px",
                    background: "#fefce8",
                    border: "1.5px solid rgba(234,179,8,.3)",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#a16207",
                    cursor: "pointer",
                  }}
                >
                  ⚠️ Verify KYC
                </div>
              </Link>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 12px 5px 5px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
                background: "#fff",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#4361ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {(user?.name || "A")[0].toUpperCase()}
              </div>
              <span
                style={{ fontSize: "13px", fontWeight: 500, color: "#1a1f2e" }}
              >
                Admin User
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="dash-content"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  border: "3px solid #e2e8f0",
                  borderTopColor: "#4361ee",
                  borderRadius: "50%",
                  animation: "spin .8s linear infinite",
                }}
              />
            </div>
          ) : (
            <>
              {/* STAT CARDS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: "16px",
                }}
              >
                {[
                  {
                    icon: "🛍",
                    bg: "#eff3ff",
                    c: "#4361ee",
                    label: "Total Orders",
                    val: orders.length,
                    sub: (
                      <span style={{ color: "#22c55e" }}>
                        ↑ Today: {todayOrders.length}
                      </span>
                    ),
                  },
                  {
                    icon: "💰",
                    bg: "#f0fdf4",
                    c: "#22c55e",
                    label: "Total Revenue",
                    val: `Rs. ${revenue.toLocaleString()}`,
                    sub: (
                      <span style={{ color: "#22c55e" }}>
                        ↑ From paid orders
                      </span>
                    ),
                  },
                  {
                    icon: "🪑",
                    bg: "#fff7ed",
                    c: "#f97316",
                    label: "Active Tables",
                    val: `${activeTables} / ${tables.length}`,
                    sub: (
                      <span style={{ color: "#64748b" }}>
                        {tables.length > 0
                          ? Math.round((activeTables / tables.length) * 100)
                          : 0}
                        % Active
                      </span>
                    ),
                  },
                  {
                    icon: "⏰",
                    bg: "#fef2f2",
                    c: "#ef4444",
                    label: "Pending Orders",
                    val: pendingOrders.length,
                    sub: (
                      <Link
                        to="/dashboard/orders"
                        style={{
                          color: "#4361ee",
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      >
                        View orders
                      </Link>
                    ),
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="stat-card"
                    style={{
                      background: "#fff",
                      borderRadius: "14px",
                      padding: "20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      transition: "transform .2s,box-shadow .2s",
                      animation: `fadeUp .35s ease ${i * 0.08}s both`,
                    }}
                  >
                    <div
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "14px",
                        background: s.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        flexShrink: 0,
                      }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12.5px",
                          color: "#64748b",
                          fontWeight: 500,
                          marginBottom: "4px",
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: 800,
                          color: "#1a1f2e",
                          letterSpacing: "-.5px",
                          lineHeight: 1,
                        }}
                      >
                        {s.val}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          marginTop: "5px",
                          fontWeight: 500,
                        }}
                      >
                        {s.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTTOM GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 360px",
                  gap: "20px",
                }}
              >
                {/* LEFT */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    minWidth: 0,
                  }}
                >
                  {/* Recent Orders */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "14px",
                      boxShadow: "0 1px 3px rgba(0,0,0,.08)",
                      overflow: "hidden",
                      animation: "fadeUp .4s ease .25s both",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "18px 20px 14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#1a1f2e",
                        }}
                      >
                        Recent Orders
                      </span>
                      <Link
                        to="/dashboard/orders"
                        style={{
                          fontSize: "13px",
                          color: "#4361ee",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        View All Orders →
                      </Link>
                    </div>
                    {orders.length === 0 ? (
                      <div
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#94a3b8",
                          fontSize: "13px",
                        }}
                      >
                        No orders yet. Share your QR code to start receiving
                        orders!
                      </div>
                    ) : (
                      orders.slice(0, 5).map((order, i) => (
                        <div
                          key={order._id}
                          className="order-row"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "13px 20px",
                            borderBottom: i < 4 ? "1px solid #f8fafc" : "none",
                            transition: "background .15s",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              width: "3.5px",
                              height: "38px",
                              borderRadius: "4px",
                              background: SC[order.status] || "#94a3b8",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              padding: "3px 9px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: SBG[order.status] || "#f8fafc",
                              color: SC[order.status] || "#94a3b8",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {order.status?.charAt(0).toUpperCase() +
                              order.status?.slice(1)}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "13.5px",
                                fontWeight: 700,
                                color: "#1a1f2e",
                              }}
                            >
                              Table {order.table?.tableNumber || "?"}
                            </div>
                            <div
                              style={{
                                fontSize: "11.5px",
                                color: "#94a3b8",
                                marginTop: "2px",
                              }}
                            >
                              👤 {order.items?.length || 0} Items
                            </div>
                          </div>
                          <div style={{ minWidth: "130px" }}>
                            <div
                              style={{
                                fontSize: "12.5px",
                                color: "#64748b",
                                fontWeight: 500,
                              }}
                            >
                              Order #{order._id?.slice(-6)?.toUpperCase()}
                            </div>
                            <div
                              style={{
                                fontSize: "11.5px",
                                color: "#94a3b8",
                                marginTop: "2px",
                              }}
                            >
                              {timeAgo(order.createdAt)}
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#1a1f2e",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Rs. {order.totalAmount?.toLocaleString()}
                          </div>
                          <Link
                            to="/dashboard/orders"
                            style={{ textDecoration: "none" }}
                          >
                            <button
                              className="view-btn"
                              style={{
                                padding: "5px 14px",
                                border: "1.5px solid #e2e8f0",
                                borderRadius: "8px",
                                background: "#fff",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#64748b",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "all .18s",
                              }}
                            >
                              View
                            </button>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Revenue Chart */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "14px",
                      boxShadow: "0 1px 3px rgba(0,0,0,.08)",
                      overflow: "hidden",
                      animation: "fadeUp .4s ease .3s both",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "18px 20px 0",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#1a1f2e",
                        }}
                      >
                        Revenue Overview
                      </span>
                      <span
                        style={{
                          fontSize: "12.5px",
                          color: "#64748b",
                          padding: "6px 12px",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      >
                        This Week ▾
                      </span>
                    </div>
                    <div style={{ padding: "12px 20px 20px", height: "200px" }}>
                      <RevenueChart orders={orders} />
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {/* Donut */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "14px",
                      boxShadow: "0 1px 3px rgba(0,0,0,.08)",
                      overflow: "hidden",
                      animation: "fadeUp .4s ease .3s both",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px 12px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#1a1f2e",
                        }}
                      >
                        Order Status Overview
                      </span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          color: "#64748b",
                          padding: "4px 10px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "7px",
                        }}
                      >
                        Today ▾
                      </span>
                    </div>
                    <div
                      style={{
                        padding: "14px 20px",
                        display: "flex",
                        gap: "14px",
                        alignItems: "center",
                      }}
                    >
                      <DonutChart counts={statusCounts} total={totalOrders} />
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        {[
                          { k: "pending", l: "New", c: "#eab308" },
                          { k: "preparing", l: "Preparing", c: "#8b5cf6" },
                          { k: "ready", l: "Ready", c: "#f97316" },
                          { k: "served", l: "Completed", c: "#22c55e" },
                          { k: "cancelled", l: "Cancelled", c: "#ef4444" },
                        ].map((item) => (
                          <div
                            key={item.k}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "12px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "7px",
                                color: "#64748b",
                                fontWeight: 500,
                              }}
                            >
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background: item.c,
                                }}
                              />
                              {item.l}
                            </div>
                            <div style={{ fontWeight: 700, color: "#1a1f2e" }}>
                              {statusCounts[item.k] || 0}
                              <span
                                style={{
                                  color: "#94a3b8",
                                  fontWeight: 400,
                                  marginLeft: "3px",
                                }}
                              >
                                (
                                {Math.round(
                                  ((statusCounts[item.k] || 0) / totalOrders) *
                                    100,
                                )}
                                %)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Selling */}
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "14px",
                      boxShadow: "0 1px 3px rgba(0,0,0,.08)",
                      overflow: "hidden",
                      flex: 1,
                      animation: "fadeUp .4s ease .35s both",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px 12px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#1a1f2e",
                        }}
                      >
                        Top Selling Items
                      </span>
                      <Link
                        to="/dashboard/menu"
                        style={{
                          fontSize: "12px",
                          color: "#4361ee",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        View All →
                      </Link>
                    </div>
                    {topItems.length === 0 ? (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#94a3b8",
                          fontSize: "13px",
                        }}
                      >
                        No sales data yet
                      </div>
                    ) : (
                      topItems.map((item, i) => (
                        <div
                          key={i}
                          className="top-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 20px",
                            borderBottom: "1px solid #f8fafc",
                            transition: "background .15s",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              background: "#f0f2f8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "20px",
                              flexShrink: 0,
                            }}
                          >
                            {foodEmoji(item.name)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#1a1f2e",
                              }}
                            >
                              {item.name}
                            </div>
                            <div
                              style={{
                                fontSize: "11.5px",
                                color: "#94a3b8",
                                marginTop: "1px",
                              }}
                            >
                              {item.count} Orders
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#1a1f2e",
                            }}
                          >
                            Rs. {item.revenue.toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Quick Actions */}
                    <div
                      style={{
                        padding: "14px 20px 16px",
                        borderTop: "1px solid #f1f5f9",
                        marginTop: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#1a1f2e",
                          marginBottom: "12px",
                        }}
                      >
                        Quick Actions
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4,1fr)",
                          gap: "8px",
                        }}
                      >
                        {[
                          {
                            l: "Add Menu Item",
                            e: "🍽️",
                            to: "/dashboard/menu",
                            bg: "#eff3ff",
                          },
                          {
                            l: "Generate QR",
                            e: "📱",
                            to: "/dashboard/tables",
                            bg: "#f0fdf4",
                          },
                          {
                            l: "Add Table",
                            e: "🪑",
                            to: "/dashboard/tables",
                            bg: "#fff7ed",
                          },
                          {
                            l: "View Reports",
                            e: "📊",
                            to: "/dashboard/orders",
                            bg: "#fef2f2",
                          },
                        ].map((qa) => (
                          <Link
                            key={qa.l}
                            to={qa.to}
                            style={{ textDecoration: "none" }}
                          >
                            <div
                              className="qa-btn"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "7px",
                                padding: "10px 4px",
                                borderRadius: "12px",
                                cursor: "pointer",
                                background: qa.bg,
                                transition: "all .2s",
                              }}
                            >
                              <span style={{ fontSize: "20px" }}>{qa.e}</span>
                              <span
                                style={{
                                  fontSize: "10.5px",
                                  fontWeight: 600,
                                  color: "#475569",
                                  textAlign: "center",
                                  lineHeight: 1.3,
                                }}
                              >
                                {qa.l}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {pkg && pkg.daysLeft <= 7 && (
                <div
                  style={{
                    background: "#fefce8",
                    border: "1px solid rgba(234,179,8,.4)",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13.5px",
                      color: "#a16207",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ Your subscription expires in{" "}
                    <strong>{pkg.daysLeft} day(s)</strong>. Contact admin to
                    renew.
                  </span>
                  <Link
                    to="/dashboard/package"
                    style={{
                      fontSize: "13px",
                      color: "#4361ee",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    View Package →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ counts, total }) {
  const segs = [
    { k: "served", c: "#22c55e" },
    { k: "preparing", c: "#8b5cf6" },
    { k: "pending", c: "#eab308" },
    { k: "ready", c: "#f97316" },
    { k: "cancelled", c: "#ef4444" },
  ];
  const r = 44,
    cx = 55,
    cy = 55,
    circ = 2 * Math.PI * r;
  let off = 0;
  const arcs = segs.map((s) => {
    const d = ((counts[s.k] || 0) / (total || 1)) * circ;
    const a = { ...s, d, off };
    off += d;
    return a;
  });
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="12"
        />
        {arcs.map((a) => (
          <circle
            key={a.k}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={a.c}
            strokeWidth="12"
            strokeDasharray={`${a.d} ${circ - a.d}`}
            strokeDashoffset={-a.off + circ / 4}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#1a1f2e",
            lineHeight: 1,
          }}
        >
          {total}
        </div>
        <div style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 500 }}>
          Total
        </div>
      </div>
    </div>
  );
}

function RevenueChart({ orders }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const rev = orders
      .filter(
        (o) =>
          new Date(o.createdAt).toDateString() === d.toDateString() && o.isPaid,
      )
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
    return { label: days[d.getDay()], revenue: rev };
  });
  const maxR = Math.max(...week.map((d) => d.revenue), 1000);
  const W = 480,
    H = 140,
    pX = 30,
    pY = 15;
  const pts = week.map((d, i) => ({
    x: pX + (i / 6) * (W - pX * 2),
    y: pY + (1 - d.revenue / maxR) * (H - pY * 2),
    ...d,
  }));
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${H - pY} L${pts[0].x},${H - pY} Z`;
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4361ee" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#4361ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <line
          key={v}
          x1={pX}
          y1={pY + (1 - v) * (H - pY * 2)}
          x2={W - pX}
          y2={pY + (1 - v) * (H - pY * 2)}
          stroke="#f1f5f9"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#rg)" />
      <path
        d={path}
        fill="none"
        stroke="#4361ee"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={i === pts.length - 1 ? "#4361ee" : "#fff"}
          stroke="#4361ee"
          strokeWidth="2.5"
        />
      ))}
      {pts.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={H}
          fill="#94a3b8"
          fontSize="10"
          textAnchor="middle"
          fontFamily="Plus Jakarta Sans"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

function foodEmoji(n = "") {
  const l = n.toLowerCase();
  if (l.includes("burger")) return "🍔";
  if (l.includes("pizza")) return "🍕";
  if (l.includes("momo")) return "🥟";
  if (l.includes("coffee") || l.includes("tea")) return "☕";
  if (l.includes("fries")) return "🍟";
  if (l.includes("chicken")) return "🍗";
  if (l.includes("rice") || l.includes("dal")) return "🍛";
  if (l.includes("noodle") || l.includes("pasta")) return "🍜";
  if (l.includes("juice") || l.includes("drink")) return "🥤";
  return "🍽️";
}
