import { useEffect, useState } from "react";
import "./admin.css";

import Orders from "./Orders";
import Reservations from "./Reservations";
import MenuManagement from "./MenuManagement";
import GalleryManagement from "./GalleryManagement";
import Customers from "./Customers";
import Reports from "./Reports";
import Settings from "./Settings";
import WebsiteImagesManagement from "./WebsiteImagesManagement";
import DiscountOffers from "./DiscountOffers";
import CustomerReviews from "./CustomerReviews";

type AdminDashboardProps = {
  onLogout: () => void;
};

interface Order {
  id: number;
  customer_name: string;
  phone: string;
  order_type: string;
  total: number;
  status: string;
  created_at: string;
}

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activePage, setActivePage] = useState("Dashboard");

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // LOAD DASHBOARD ORDERS
  useEffect(() => {
    if (activePage !== "Dashboard") return;

    let cancelled = false;

    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError("");

      try {
        const response = await fetch("/api/orders", {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load dashboard orders.");
        }

        if (!cancelled) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        if (!cancelled) {
          setOrdersError(
            error instanceof Error ? error.message : "Unable to load orders.",
          );
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [activePage]);

  // FORMAT PRICE
  const formatPrice = (price: number) => {
    return `TSh ${Number(price || 0).toLocaleString("en-TZ")}`;
  };

  // FORMAT DATE
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-TZ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // DASHBOARD STATISTICS
  const totalOrders = orders.length;

  const totalRevenue = orders
    .filter((order) => order.status === "Completed")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-profile admin-mobile-profile">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Administrator</strong>
              <span>Restaurant Manager</span>
            </div>

            <button
              type="button"
              className="admin-logout-button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>

          <h2>
            HL<span>Vision</span>
          </h2>
          <p>RESTAURANT ADMIN</p>
        </div>

        <nav className="admin-nav">
          {[
            "Dashboard",
            "Orders",
            "Reservations",
            "Menu Management",
            "Discount Offers",
            "Gallery",
            "Website Images",
            "Customer Reviews",
            "Customers",
            "Reports",
            "Settings",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className={activePage === item ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActivePage(item);
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <a href="/">View Restaurant Website</a>
          <p>HLVision Restaurant © 2026</p>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{activePage}</h1>
            <p>
              {activePage === "Dashboard"
                ? "Welcome back! Here's what's happening today."
                : `Manage your restaurant ${activePage.toLowerCase()}.`}
            </p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Administrator</strong>
              <span>Restaurant Manager</span>
            </div>

            <button
              type="button"
              className="admin-logout-button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* DASHBOARD */}

        {activePage === "Dashboard" && (
          <>
            <section className="admin-welcome">
              <div>
                <span>RESTAURANT OVERVIEW</span>
                <h2>Welcome to HLVision Restaurant</h2>
                <p>Manage your restaurant operations from one place.</p>
              </div>

              <div className="welcome-icon">HL</div>
            </section>

            <section className="admin-stats">
              <div className="stat-card">
                <div className="stat-icon">Orders</div>
                <p>Total Orders</p>
                <h2>{ordersLoading ? "..." : totalOrders}</h2>
                <span>Orders received</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon">Bookings</div>
                <p>Reservations</p>
                <h2>—</h2>
                <span>Booking requests</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon">Revenue</div>
                <p>Completed Revenue</p>
                <h2>{ordersLoading ? "..." : formatPrice(totalRevenue)}</h2>
                <span>Revenue from completed orders</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon">People</div>
                <p>Customers</p>
                <h2>—</h2>
                <span>Registered customers</span>
              </div>
            </section>

            <section className="admin-content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent Orders</h2>
                  <p>Keep track of your latest customer orders.</p>
                </div>

                <button type="button" onClick={() => setActivePage("Orders")}>
                  View All Orders
                </button>
              </div>

              {ordersError && (
                <p className="customer-auth-error">{ordersError}</p>
              )}

              {ordersLoading ? (
                <div className="admin-empty-state">
                  <p>Loading recent orders...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No orders yet</h3>
                  <p>Customer orders will appear here once submitted.</p>
                </div>
              ) : (
                <div className="admin-recent-orders">
                  {recentOrders.map((order) => (
                    <div className="admin-recent-order" key={order.id}>
                      <div>
                        <strong>Order #{order.id}</strong>
                        <p>{order.customer_name}</p>
                        <span>{formatDate(order.created_at)}</span>
                      </div>

                      <div>
                        <strong>{formatPrice(order.total)}</strong>
                        <p>{order.order_type}</p>
                        <span
                          className={`customer-order-status status-${order.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ORDERS */}
        {activePage === "Orders" && <Orders />}

        {/* RESERVATIONS */}
        {activePage === "Reservations" && <Reservations />}

        {/* MENU MANAGEMENT */}
        {activePage === "Menu Management" && <MenuManagement />}

        {/* DISCOUNT OFFERS */}
        {activePage === "Discount Offers" && <DiscountOffers />}

        {/* GALLERY */}
        {activePage === "Gallery" && <GalleryManagement />}

        {/* WEBSITE IMAGES */}
        {activePage === "Website Images" && <WebsiteImagesManagement />}

        {/* CUSTOMERS */}
        {activePage === "Customers" && <Customers />}

        {/* CUSTOMER REVIEWS */}
        {activePage === "Customer Reviews" && <CustomerReviews />}

        {/* REPORTS */}
        {activePage === "Reports" && <Reports />}

        {/* SETTINGS */}
        {activePage === "Settings" && <Settings />}
      </main>
    </div>
  );
}

export default AdminDashboard;
