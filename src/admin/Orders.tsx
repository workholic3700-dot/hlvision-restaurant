import { useEffect, useState } from "react";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Completed";

type DatabaseOrder = {
  id: number;
  customer_name: string;
  phone: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  total: string | number;
  status: OrderStatus;
  created_at: string;
};

type Order = {
  id: number;
  customer: string;
  phone: string;
  items: string;
  total: string;
  date: string;
  status: OrderStatus;
};

const filters = [
  "All Orders",
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Completed",
];

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchOrders() {
    try {
      setError("");

      const response = await fetch("/api/orders", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      const formattedOrders: Order[] = data.orders.map(
        (order: DatabaseOrder) => ({
          id: order.id,
          customer: order.customer_name,
          phone: order.phone,
          items: order.items
            .map((item) => `${item.name} x${item.quantity}`)
            .join(", "),
          total: `TSh ${Number(order.total).toLocaleString()}`,
          date: new Date(order.created_at).toLocaleString(),
          status: order.status,
        }),
      );

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Loading orders error:", error);

      setError(
        error instanceof Error ? error.message : "Unable to load orders.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function updateStatus(orderId: number, newStatus: OrderStatus) {
    const selectedOrder = orders.find((order) => order.id === orderId);

    if (!selectedOrder || selectedOrder.status === "Completed") {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update order status.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      setError("");
    } catch (error) {
      console.error("Updating order status error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update order status.",
      );
    }
  }

  const filteredOrders =
    activeFilter === "All Orders"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  return (
    <div className="admin-page-content">
      <div className="admin-page-title">
        <div>
          <h2>Orders Management</h2>
          <p>Manage and monitor customer orders.</p>
        </div>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={fetchOrders}
        >
          Refresh Orders
        </button>
      </div>

      <div className="order-summary">
        <div>
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div>
          <span>Pending Orders</span>
          <strong>
            {orders.filter((order) => order.status === "Pending").length}
          </strong>
        </div>

        <div>
          <span>Preparing</span>
          <strong>
            {orders.filter((order) => order.status === "Preparing").length}
          </strong>
        </div>

        <div>
          <span>Completed</span>
          <strong>
            {orders.filter((order) => order.status === "Completed").length}
          </strong>
        </div>
      </div>

      <div className="order-filters">
        {filters.map((filter) => (
          <button
            key={filter}
            className={activeFilter === filter ? "filter-active" : ""}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="admin-content-card">
        <div className="orders-table-heading">
          <div>
            <h3>{activeFilter}</h3>
            <p>{filteredOrders.length} orders found</p>
          </div>
        </div>

        {error && <p style={{ color: "red", padding: "12px" }}>{error}</p>}

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table-empty">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>ORD{String(order.id).padStart(3, "0")}</td>
                    <td>{order.customer}</td>
                    <td>{order.phone}</td>
                    <td>{order.items}</td>
                    <td>{order.total}</td>
                    <td>{order.date}</td>

                    <td>
                      <span
                        className={`order-status ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td>
                      <select
                        className="order-status-select"
                        value={order.status}
                        disabled={order.status === "Completed"}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value as OrderStatus)
                        }
                      >
                        {[
                          "Pending",
                          "Confirmed",
                          "Preparing",
                          "Ready",
                          "Completed",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Orders;
