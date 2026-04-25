import { useState, useEffect, useRef } from "react";
import { getOrders, updateOrderStatus } from "../../services/api";
import { Card, Btn, Badge, Spinner } from "../../components/common/UI";
import {
  ChefHat,
  Clock,
  CheckCircle,
  RefreshCw,
  ArrowBigLeft,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { useAuth } from "../../context/AuthContext";

const statusColor = (s) =>
  ({
    pending: "yellow",
    preparing: "blue",
    ready: "green",
    served: "green",
    cancelled: "red",
  })[s] || "default";

export default function KitchenDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    load();
    setupSocket();
    return () => socketRef.current?.disconnect();
  }, []);

  const setupSocket = () => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;
    socket.emit("join:kitchen", user?.restaurantId);
    socket.on("order:new", (order) => {
      setOrders((prev) => [order, ...prev]);
      toast.success(`🔔 New order — Table ${order.table?.tableNumber}!`, {
        duration: 6000,
      });
      // Flash title
      document.title = "🔔 NEW ORDER! — Kitchen";
      setTimeout(() => (document.title = "Kitchen Dashboard"), 3000);
    });
    socket.on("order:updated", (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o)),
      );
    });
  };

  const load = async () => {
    try {
      const res = await getOrders();
      const active = (res.data.data || []).filter((o) =>
        ["pending", "preparing"].includes(o.status),
      );
      setOrders(active);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const markPreparing = async (id) => {
    try {
      await updateOrderStatus(id, { status: "preparing" });
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const markReady = async (id) => {
    try {
      await updateOrderStatus(id, { status: "ready" });
      toast.success("Order marked ready! 🎉");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const pending = orders.filter((o) => o.status === "pending");
  const preparing = orders.filter((o) => o.status === "preparing");

  return (
    <div
      style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px" }}
      className="fade-in"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "var(--accent)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChefHat size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontFamily: "var(--font-display)" }}>
              Kitchen Dashboard
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text3)" }}>
              Live order queue
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "24px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  color: "var(--yellow)",
                }}
              >
                {pending.length}
              </p>
              <p style={{ fontSize: "11px", color: "var(--text3)" }}>PENDING</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "24px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  color: "var(--blue)",
                }}
              >
                {preparing.length}
              </p>
              <p style={{ fontSize: "11px", color: "var(--text3)" }}>
                PREPARING
              </p>
            </div>
          </div>
          <Btn
            variant="ghost"
            icon={<RefreshCw size={15} />}
            onClick={load}
          ></Btn>
          <Btn
            variant="ghost"
            icon={<ArrowRight size={15} />}
            onClick={() => {
              localStorage.removeItem("role");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.reload();
            }}
          ></Btn>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* Pending Column */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "2px solid var(--yellow)",
              }}
            >
              <Clock size={18} color="var(--yellow)" />
              <h2
                style={{
                  fontSize: "16px",
                  fontFamily: "var(--font-display)",
                  color: "var(--yellow)",
                }}
              >
                Pending ({pending.length})
              </h2>
            </div>
            {pending.length === 0 ? (
              <p
                style={{
                  color: "var(--text3)",
                  textAlign: "center",
                  padding: "30px",
                  fontSize: "14px",
                }}
              >
                No pending orders 🎉
              </p>
            ) : (
              pending.map((order) => (
                <OrderCard key={order._id} order={order}>
                  <Btn
                    fullWidth
                    onClick={() => markPreparing(order._id)}
                    icon={<ChefHat size={14} />}
                  >
                    Start Preparing
                  </Btn>
                </OrderCard>
              ))
            )}
          </div>

          {/* Preparing Column */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "2px solid var(--blue)",
              }}
            >
              <ChefHat size={18} color="var(--blue)" />
              <h2
                style={{
                  fontSize: "16px",
                  fontFamily: "var(--font-display)",
                  color: "var(--blue)",
                }}
              >
                Preparing ({preparing.length})
              </h2>
            </div>
            {preparing.length === 0 ? (
              <p
                style={{
                  color: "var(--text3)",
                  textAlign: "center",
                  padding: "30px",
                  fontSize: "14px",
                }}
              >
                Nothing cooking yet
              </p>
            ) : (
              preparing.map((order) => (
                <OrderCard key={order._id} order={order}>
                  <Btn
                    fullWidth
                    variant="success"
                    onClick={() => markReady(order._id)}
                    icon={<CheckCircle size={14} />}
                  >
                    Mark Ready
                  </Btn>
                </OrderCard>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, children }) {
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt)) / 60000);
  const urgent = elapsed > 15;

  return (
    <Card
      style={{
        marginBottom: "12px",
        borderColor: urgent ? "var(--red)30" : "var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ fontSize: "18px", fontFamily: "var(--font-display)" }}>
          Table {order.table?.tableNumber || "?"}
        </h3>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "12px",
              color: urgent ? "var(--red)" : "var(--text3)",
              fontWeight: urgent ? 700 : 400,
            }}
          >
            {elapsed}m ago
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        {order.items?.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 0",
              borderBottom: "1px solid var(--border)",
              fontSize: "14px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "18px",
                color: "var(--accent)",
                minWidth: "28px",
              }}
            >
              {item.quantity}×
            </span>
            <span style={{ fontWeight: 500 }}>{item.name}</span>
          </div>
        ))}
      </div>

      {order.note && (
        <div
          style={{
            padding: "8px 10px",
            background: "var(--yellow-dim)",
            borderRadius: "6px",
            fontSize: "13px",
            color: "var(--yellow)",
            marginBottom: "10px",
          }}
        >
          📝 {order.note}
        </div>
      )}

      {children}
    </Card>
  );
}
