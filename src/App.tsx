
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
  // Separate reservation page
  if (window.location.pathname === "/reservation") {
    return <ReservationPage />;
  }
  if (window.location.pathname === "/write-review") return <ReviewPage />;

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
