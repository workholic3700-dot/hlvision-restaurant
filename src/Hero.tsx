
import { useEffect, useState } from "react";

function Hero() {
  const [heroImage, setHeroImage] = useState(
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=1000"
  );

  useEffect(() => {
    async function fetchHeroImage() {
      try {
        const response = await fetch("/api/website-images");
        const data = await response.json();

        if (response.ok && data.images?.hero) {
          setHeroImage(data.images.hero);
        }
      } catch (error) {
        console.error("Hero image loading error:", error);
      }
    }

    fetchHeroImage();
  }, []);

  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        <span className="hero-label">
          WELCOME TO HLVISION RESTAURANT
        </span>

        <h1>
          Experience the
          <span> Taste of Excellence</span>
        </h1>

        <p>
          Discover delicious meals, fresh ingredients
          and exceptional hospitality. Every meal is
          prepared to make your dining experience special.
        </p>

        <div className="hero-buttons">
          <a href="#menu" className="primary-button">
            Explore Our Menu
          </a>

          <a href="#about" className="secondary-button">
            Discover More
          </a>

          <a href="/reservation" className="book-now-button">
            Book Now
          </a>
        </div>
      </div>

      <div className="hero-image">
        <img
          src={heroImage}
          alt="Delicious restaurant food"
        />
      </div>
    </section>
  );
}

export default Hero;
