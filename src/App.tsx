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

function App() {
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname === "/reservation" ||
      location.pathname === "/write-review"
    ) {
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
