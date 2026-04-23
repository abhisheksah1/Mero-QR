import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus } from "../../services/api";
import { Card, Btn, Spinner } from "../../components/common/UI";
import {
  ChefHat,
  Clock,
  CheckCircle,
  RefreshCw,
  Bell,
  User,
} from "lucide-react";
import io from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function KitchenDashboard() {
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    load();
    const socket = io("http://localhost:5000");

    socket.emit("join:kitchen", user?.restaurantId);

    socket.on("order:new", (order) => {
      setOrders((prev) => [order, ...prev]);
      setUnread((prev) => prev + 1);
      toast.success(`New Order - Table ${order.table?.tableNumber}`);
    });

    return () => socket.disconnect();
  }, []);

  const load = async () => {
    const res = await getOrders();
    setOrders(res.data.data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await updateOrderStatus(id, { status });
    load();
  };

  const pending = orders.filter((o) => o.status === "pending");
  const cooking = orders.filter((o) => o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready");

  return (
    <div className="kitchen">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="brand">
          <ChefHat />
          <div>
            <h2>Kitchen Panel</h2>
            <p>Live Orders System</p>
          </div>
        </div>

        <div className="actions">
          <button onClick={load} className="btn">
            <RefreshCw size={16} />
          </button>

          <div className="bell">
            <Bell />
            {unread > 0 && <span>{unread}</span>}
          </div>

          <div className="profile">
            <User size={16} />
            <span>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      {/* BOARD */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="board">
          <Column title="Pending" count={pending.length} color="#facc15">
            {pending.map((o) => (
              <OrderCard key={o._id} order={o} color="#facc15">
                <Btn onClick={() => updateStatus(o._id, "preparing")}>
                  Start Cooking
                </Btn>
              </OrderCard>
            ))}
          </Column>

          <Column title="Cooking" count={cooking.length} color="#3b82f6">
            {cooking.map((o) => (
              <OrderCard key={o._id} order={o} color="#3b82f6">
                <Btn
                  onClick={() => updateStatus(o._id, "ready")}
                  variant="success"
                >
                  Mark Ready
                </Btn>
              </OrderCard>
            ))}
          </Column>

          <Column title="Ready" count={ready.length} color="#22c55e">
            {ready.map((o) => (
              <OrderCard key={o._id} order={o} color="#22c55e" />
            ))}
          </Column>
        </div>
      )}

      {/* CSS */}
      <style>{`
        .kitchen {
          height: 100vh;
          background: #0f172a;
          color: white;
          display: flex;
          flex-direction: column;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          padding: 16px 20px;
          background: #111827;
          border-bottom: 1px solid #1f2937;
        }

        .brand {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .board {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        .column {
          background: #111827;
          border-radius: 12px;
          padding: 12px;
          border-top: 4px solid var(--color);
        }

        .card {
          background: #1f2937;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .bell span {
          background: red;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          position: absolute;
        }
      `}</style>
    </div>
  );
}

/* COLUMN */
function Column({ title, count, color, children }) {
  return (
    <div className="column" style={{ "--color": color }}>
      <h3>
        {title} ({count})
      </h3>
      {children}
    </div>
  );
}

/* ORDER CARD */
function OrderCard({ order, color, children }) {
  const mins = Math.floor((Date.now() - new Date(order.createdAt)) / 60000);

  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <b>Table {order.table?.tableNumber}</b>
        <small>{mins}m ago</small>
      </div>

      <div style={{ marginTop: 8 }}>
        {order.items?.map((i, idx) => (
          <div key={idx}>
            {i.quantity} × {i.name}
          </div>
        ))}
      </div>

      {children && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  );
}
