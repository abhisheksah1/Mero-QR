import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getPackageStatus,
  getOrders,
  getTables,
  getEmployees,
} from "../../services/api";
import {
  StatCard,
  Card,
  Badge,
  Alert,
  Spinner,
} from "../../components/common/UI";
import {
  ShoppingBag,
  Users,
  QrCode,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [pkgRes, ordersRes, tablesRes, empRes] = await Promise.allSettled([
        getPackageStatus(),
        getOrders(),
        getTables(),
        getEmployees(),
      ]);
      if (pkgRes.status === "fulfilled") setPkg(pkgRes.value.data.data);
      if (ordersRes.status === "fulfilled")
        setOrders(ordersRes.value.data.data || []);
      if (tablesRes.status === "fulfilled")
        setTables(tablesRes.value.data.data || []);
      if (empRes.status === "fulfilled")
        setEmployees(empRes.value.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === new Date().toDateString(),
  );
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const revenue = orders
    .filter((o) => o.isPaid)
    .reduce((s, o) => s + (o.totalAmount || 0), 0);

  if (loading) return <Spinner />;

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "26px",
            fontFamily: "var(--font-display)",
            marginBottom: "4px",
          }}
        >
          Good {hour()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text3)", fontSize: "14px" }}>
          Here's what's happening at your restaurant today
        </p>
      </div>

      {/* KYC Warning */}
      {!user?.isKYCVerified && (
        <div style={{ marginBottom: "20px" }}>
          <Alert
            type="warning"
            message={
              <span>
                Your KYC is not verified.{" "}
                <Link
                  to="/dashboard/kyc"
                  style={{
                    color: "var(--yellow)",
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  Verify KYC →
                </Link>{" "}
                to unlock all features.
              </span>
            }
          />
        </div>
      )}

      {/* Package Alert */}
      {pkg && pkg.daysLeft <= 7 && pkg.daysLeft > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <Alert
            type="warning"
            message={`Your subscription expires in ${pkg.daysLeft} day(s). Please renew to avoid interruption.`}
          />
        </div>
      )}
      {pkg && pkg.daysLeft === 0 && (
        <div style={{ marginBottom: "20px" }}>
          <Alert
            type="error"
            message="Your subscription has expired! Contact platform admin to renew."
          />
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <StatCard
          label="Today's Orders"
          value={todayOrders.length}
          icon={<ShoppingBag size={20} />}
          color="orange"
          sub="orders placed today"
        />
        <StatCard
          label="Pending Orders"
          value={pendingOrders.length}
          icon={<Clock size={20} />}
          color="yellow"
          sub="awaiting kitchen"
        />
        <StatCard
          label="Total Revenue"
          value={`Rs. ${revenue.toLocaleString()}`}
          icon={<TrendingUp size={20} />}
          color="green"
          sub="all paid orders"
        />
        <StatCard
          label="Active Tables"
          value={tables.filter((t) => t.isActive).length}
          icon={<QrCode size={20} />}
          color="blue"
          sub={`of ${tables.length} total`}
        />
        <StatCard
          label="Employees"
          value={employees.length}
          icon={<Users size={20} />}
          color="purple"
          sub="kitchen & cashier"
        />
        <StatCard
          label="Package"
          value={pkg ? `${pkg.daysLeft}d left` : "No plan"}
          icon={<Package size={20} />}
          color="orange"
          sub={pkg?.plan?.name || "Contact admin"}
        />
      </div>

      {/* Recent Orders + Quick Links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "20px",
        }}
      >
        {/* Recent Orders */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "15px", fontFamily: "var(--font-display)" }}>
              Recent Orders
            </h3>
            <Link
              to="/dashboard/orders"
              style={{ fontSize: "13px", color: "var(--accent)" }}
            >
              View all →
            </Link>
          </div>
          {orders.length === 0 ? (
            <p
              style={{
                color: "var(--text3)",
                fontSize: "14px",
                textAlign: "center",
                padding: "20px",
              }}
            >
              No orders yet
            </p>
          ) : (
            orders.slice(0, 6).map((o) => (
              <div
                key={o._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>
                    Table {o.table?.tableNumber || "?"}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text3)" }}>
                    {o.items?.length} items · Rs. {o.totalAmount}
                  </p>
                </div>
                <Badge color={statusColor(o.status)}>{o.status}</Badge>
              </div>
            ))
          )}
        </Card>

        {/* Quick Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "15px", fontFamily: "var(--font-display)" }}>
            Quick Actions
          </h3>
          {[
            {
              label: "Add Menu Item",
              to: "/dashboard/menu",
              icon: "🍽️",
              color: "var(--accent)",
            },
            {
              label: "Create Table",
              to: "/dashboard/tables",
              icon: "🪑",
              color: "var(--blue)",
            },
            {
              label: "Add Employee",
              to: "/dashboard/employees",
              icon: "👤",
              color: "var(--purple)",
            },
            {
              label: "View Orders",
              to: "/dashboard/orders",
              icon: "📋",
              color: "var(--green)",
            },
            {
              label: "KYC Status",
              to: "/dashboard/kyc",
              icon: "✅",
              color: "var(--yellow)",
            },
          ].map((item) => (
            <Link key={item.to} to={item.to}>
              <Card hover style={{ padding: "14px 16px" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span style={{ fontSize: "20px" }}>{item.icon}</span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: item.color,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const hour = () => {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
};

const statusColor = (s) =>
  ({
    pending: "yellow",
    preparing: "blue",
    ready: "orange",
    served: "green",
    cancelled: "red",
  })[s] || "default";
