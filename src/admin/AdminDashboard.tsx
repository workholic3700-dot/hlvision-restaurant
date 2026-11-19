
import { useState } from "react";
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

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activePage, setActivePage] = useState("Dashboard");

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

          <h2>HL<span>Vision</span></h2>
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
                <h2>0</h2>
                <span>Orders received</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon">Bookings</div>
                <p>Reservations</p>
                <h2>0</h2>
                <span>Booking requests</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon">Revenue</div>
                <p>Total Revenue</p>
                <h2>TSh 0</h2>
                <span>Recorded revenue</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon">People</div>
                <p>Customers</p>
                <h2>0</h2>
                <span>Customer records</span>
              </div>

            </section>

            <section className="admin-content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent Orders</h2>
                  <p>Keep track of your latest customer orders.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage("Orders")}
                >
                  View All Orders
                </button>
              </div>

              <div className="admin-empty-state">
                <h3>No orders yet</h3>
                <p>
                  Customer orders will appear here once the ordering
                  system is connected.
                </p>
              </div>
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

        {/* GALLERY MANAGEMENT */}
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
