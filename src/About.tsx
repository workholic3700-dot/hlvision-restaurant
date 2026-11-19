
import { useEffect, useState } from "react";

function About() {
  const [aboutImage, setAboutImage] = useState(
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000"
  );

  useEffect(() => {
    async function fetchAboutImage() {
      try {
        const response = await fetch("/api/website-images");
        const data = await response.json();

        if (response.ok && data.images?.about) {
          setAboutImage(data.images.about);
        }
      } catch (error) {
        console.error("Our Story image loading error:", error);
      }
    }

    fetchAboutImage();
  }, []);

  return (
    <section className="about-section" id="about">
      <div className="about-image">
        <img
          src={aboutImage}
          alt="Elegant restaurant dining experience"
        />
      </div>

      <div className="about-content">
        <span className="about-label">
          OUR STORY
        </span>

        <h2>
          Welcome to HLVision Restaurant
        </h2>

        <p>
          At HLVision Restaurant, we believe that great food
          brings people together. We are passionate about
          preparing delicious meals using quality ingredients
          and delivering exceptional hospitality.
        </p>

        <p>
          Whether you are enjoying a family meal, meeting
          friends or celebrating a special occasion, we make
          every visit memorable.
        </p>

        <a href="#menu" className="about-button">
          Discover Our Menu
        </a>
      </div>
    </section>
  );
}

export default About;
