import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";

interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer_id: number | null;
  customer_name: string;
  phone: string;
  order_type: string;
  instructions: string;
  items: OrderItem[] | string;
  total: number;
  status: string;
  created_at: string;
}

interface Reservation {
  id: number;
  customer_id: number | null;
  customer_name: string;
  phone: string;
  email: string | null;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  celebration: string;
  celebration_type: string | null;
  preferred_food: string[] | string;
  other_food: string | null;
  special_requests: string | null;
  status: string;
  created_at: string;
}

function CustomerDashboardPage() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [activeTab, setActiveTab] = useState<"orders" | "reservations">(
    "orders",
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // LOAD CUSTOMER, ORDERS AND RESERVATIONS
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const customerResponse = await fetch("/api/customer-auth/me", {
          credentials: "include",
        });

        const customerData = await customerResponse.json();

        if (customerResponse.status === 401) {
          navigate("/customer-login", { replace: true });
          return;
        }

        if (!customerResponse.ok) {
          throw new Error(
            customerData.message || "Unable to load customer account.",
          );
        }

        setCustomer(customerData.customer);

        // Load customer's food orders and reservations
        const [ordersResponse, reservationsResponse] = await Promise.all([
          fetch("/api/orders/my-orders", {
            credentials: "include",
          }),
          fetch("/api/reservations/my-reservations", {
            credentials: "include",
          }),
        ]);

        const ordersData = await ordersResponse.json();
        const reservationsData = await reservationsResponse.json();

        if (!ordersResponse.ok) {
          throw new Error(ordersData.message || "Unable to load your orders.");
        }

        if (!reservationsResponse.ok) {
          throw new Error(
            reservationsData.message || "Unable to load your reservations.",
          );
        }

        setOrders(ordersData.orders || []);
        setReservations(reservationsData.reservations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  // CUSTOMER LOGOUT
  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/customer-auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed.");
      }

      navigate("/customer-login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log out.");
    } finally {
      setLoggingOut(false);
    }
  };

  // FORMAT PRICE
  const formatPrice = (price: number | string) => {
    return `${Number(price).toLocaleString("en-TZ")} TSh`;
  };

  // FORMAT DATE
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-TZ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // FORMAT RESERVATION DATE WITHOUT DATE SHIFT
  const formatReservationDate = (date: string) => {
    const datePart = date.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-TZ", {
      dateStyle: "medium",
    });
  };

  // FORMAT RESERVATION TIME
  const formatReservationTime = (time: string) => {
    return time ? time.slice(0, 5) : "Not specified";
  };

  // HANDLE ORDER ITEMS
  const getOrderItems = (items: OrderItem[] | string): OrderItem[] => {
    if (Array.isArray(items)) {
      return items;
    }

    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // HANDLE PREFERRED FOOD
  const getPreferredFoods = (foods: string[] | string): string[] => {
    if (Array.isArray(foods)) {
      return foods;
    }

    try {
      const parsed = JSON.parse(foods);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="customer-dashboard-loading">Loading your account...</div>
    );
  }

  return (
    <div className="customer-dashboard-page">
      <Navbar />

      <main className="customer-dashboard-section">
        <div className="customer-dashboard-container">
          <div className="customer-dashboard-heading">
            <span>HLVISION RESTAURANT</span>
            <h1>My Account</h1>
            <p>Manage your account, food orders and table reservations.</p>
          </div>

          {error && <p className="customer-auth-error">{error}</p>}

          {customer && (
            <>
              {/* CUSTOMER PROFILE */}
              <div className="customer-profile-card">
                <div className="customer-profile-avatar">
                  {customer.full_name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2>{customer.full_name}</h2>
                  <p>{customer.email}</p>
                  <span>HLVision Customer</span>
                </div>
              </div>

              {/* ACCOUNT INFORMATION */}
              <div className="customer-dashboard-details">
                <h2>Account Information</h2>

                <div className="customer-detail-item">
                  <span>Full Name</span>
                  <strong>{customer.full_name}</strong>
                </div>

                <div className="customer-detail-item">
                  <span>Email Address</span>
                  <strong>{customer.email}</strong>
                </div>

                <div className="customer-detail-item">
                  <span>Phone Number</span>
                  <strong>{customer.phone || "Not provided"}</strong>
                </div>

                <div className="customer-detail-item">
                  <span>Customer ID</span>
                  <strong>{customer.id}</strong>
                </div>
              </div>

              {/* DASHBOARD TABS */}
              <div className="customer-dashboard-tabs">
                <button
                  type="button"
                  className={activeTab === "orders" ? "active" : ""}
                  onClick={() => setActiveTab("orders")}
                >
                  My Food Orders ({orders.length})
                </button>

                <button
                  type="button"
                  className={activeTab === "reservations" ? "active" : ""}
                  onClick={() => setActiveTab("reservations")}
                >
                  My Reservations ({reservations.length})
                </button>
              </div>

              {/* FOOD ORDERS */}
              {activeTab === "orders" && (
                <section className="customer-orders-section">
                  <div className="customer-orders-heading">
                    <div>
                      <h2>My Food Orders</h2>
                      <p>Track your orders and their current status.</p>
                    </div>

                    <span className="customer-orders-count">
                      {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="customer-orders-empty">
                      <h3>No orders yet</h3>
                      <p>
                        Your food orders will appear here after you place an
                        order while signed in.
                      </p>

                      <button type="button" onClick={() => navigate("/#menu")}>
                        Explore Menu
                      </button>
                    </div>
                  ) : (
                    <div className="customer-orders-list">
                      {orders.map((order) => {
                        const orderItems = getOrderItems(order.items);

                        return (
                          <article
                            className="customer-order-card"
                            key={order.id}
                          >
                            <div className="customer-order-header">
                              <div>
                                <h3>Order #{order.id}</h3>
                                <p>{formatDate(order.created_at)}</p>
                              </div>

                              <span
                                className={`customer-order-status status-${order.status
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}`}
                              >
                                {order.status}
                              </span>
                            </div>

                            <div className="customer-order-info">
                              <span>Order Type</span>
                              <strong>{order.order_type}</strong>
                            </div>

                            <div className="customer-order-items">
                              {orderItems.map((item, index) => (
                                <div
                                  className="customer-order-item"
                                  key={`${order.id}-${index}`}
                                >
                                  <span>
                                    {item.name} × {item.quantity}
                                  </span>

                                  <strong>
                                    {formatPrice(
                                      Number(item.price) *
                                        Number(item.quantity),
                                    )}
                                  </strong>
                                </div>
                              ))}
                            </div>

                            {order.instructions && (
                              <div className="customer-order-instructions">
                                <span>Instructions:</span>
                                <p>{order.instructions}</p>
                              </div>
                            )}

                            <div className="customer-order-total">
                              <span>Total</span>
                              <strong>{formatPrice(order.total)}</strong>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* TABLE RESERVATIONS */}
              {activeTab === "reservations" && (
                <section className="customer-orders-section customer-reservations-section">
                  <div className="customer-orders-heading">
                    <div>
                      <h2>My Reservations</h2>
                      <p>View your table bookings and confirmation status.</p>
                    </div>

                    <span className="customer-orders-count">
                      {reservations.length}{" "}
                      {reservations.length === 1
                        ? "Reservation"
                        : "Reservations"}
                    </span>
                  </div>

                  {reservations.length === 0 ? (
                    <div className="customer-orders-empty">
                      <h3>No reservations yet</h3>
                      <p>
                        Your table reservations will appear here after you book
                        a table while signed in.
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate("/reservation")}
                      >
                        Book a Table
                      </button>
                    </div>
                  ) : (
                    <div className="customer-orders-list">
                      {reservations.map((reservation) => {
                        const preferredFoods = getPreferredFoods(
                          reservation.preferred_food,
                        );

                        const status = reservation.status || "Pending";

                        return (
                          <article
                            className="customer-order-card customer-reservation-card"
                            key={reservation.id}
                          >
                            <div className="customer-order-header">
                              <div>
                                <h3>Reservation #{reservation.id}</h3>

                                <p>
                                  Submitted:{" "}
                                  {formatDate(reservation.created_at)}
                                </p>
                              </div>

                              <span
                                className={`customer-order-status status-${status
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}`}
                              >
                                {status}
                              </span>
                            </div>

                            <div className="customer-reservation-details">
                              <div className="customer-order-info">
                                <span>Reservation Date</span>
                                <strong>
                                  {formatReservationDate(
                                    reservation.reservation_date,
                                  )}
                                </strong>
                              </div>

                              <div className="customer-order-info">
                                <span>Reservation Time</span>
                                <strong>
                                  {formatReservationTime(
                                    reservation.reservation_time,
                                  )}
                                </strong>
                              </div>

                              <div className="customer-order-info">
                                <span>Number of Guests</span>
                                <strong>{reservation.guests}</strong>
                              </div>

                              <div className="customer-order-info">
                                <span>Celebration</span>
                                <strong>
                                  {reservation.celebration === "Yes"
                                    ? reservation.celebration_type || "Yes"
                                    : "No"}
                                </strong>
                              </div>
                            </div>

                            {preferredFoods.length > 0 && (
                              <div className="customer-order-instructions">
                                <span>Preferred Food:</span>
                                <p>{preferredFoods.join(", ")}</p>
                              </div>
                            )}

                            {reservation.other_food && (
                              <div className="customer-order-instructions">
                                <span>Other Food:</span>
                                <p>{reservation.other_food}</p>
                              </div>
                            )}

                            {reservation.special_requests && (
                              <div className="customer-order-instructions">
                                <span>Special Requests:</span>
                                <p>{reservation.special_requests}</p>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* DASHBOARD ACTIONS */}
              <div className="customer-dashboard-actions">
                <button type="button" onClick={() => navigate("/#menu")}>
                  Order Food
                </button>

                <button type="button" onClick={() => navigate("/reservation")}>
                  Book a Table
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CustomerDashboardPage;
