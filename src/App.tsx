import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import Menu from "./Menu";
import ReservationCTA from "./ReservationCTA";
import ReservationPage from "./ReservationPage";
import Gallery from "./Gallery";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import Contact from "./Contact";
import ReviewPage from "./ReviewPage";

import CustomerRegisterPage from "./CustomerRegisterPage";
import CustomerLoginPage from "./CustomerLoginPage";
import CustomerDashboardPage from "./CustomerDashboardPage";

function App() {
  const location = useLocation();

  useEffect(() => {
    const standalonePages = [
      "/reservation",
      "/write-review",
      "/customer-register",
      "/customer-login",
      "/customer-dashboard",
    ];

    if (standalonePages.includes(location.pathname)) {
      return;
    }

    if (location.hash) {
      const sectionId = location.hash.replace("#", "");

      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  // Reservation page
  if (location.pathname === "/reservation") {
    return <ReservationPage />;
  }

  // Review page
  if (location.pathname === "/write-review") {
    return <ReviewPage />;
  }

  // Customer registration page
  if (location.pathname === "/customer-register") {
    return <CustomerRegisterPage />;
  }

  // Customer login page
  if (location.pathname === "/customer-login") {
    return <CustomerLoginPage />;
  }

  // Customer dashboard
  if (location.pathname === "/customer-dashboard") {
    return <CustomerDashboardPage />;
  }

  // Main restaurant homepage
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Menu />
      <Gallery />
      <ReservationCTA />
      <Contact />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
