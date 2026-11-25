
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Testimonial = {
  id: number;
  customer_name: string;
  location: string;
  rating: number;
  message: string;
};

function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/customer-reviews");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load reviews.");
        }

        setTestimonials(data.reviews || []);
      } catch (err) {
        console.error("Customer reviews error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-container">

        <div className="testimonials-heading">
          <span className="testimonials-subtitle">
            CUSTOMER EXPERIENCES
          </span>

          <h2>What Our Customers Say</h2>

          <p>
            We value every customer and every experience.
            Here's what makes dining with us special.
          </p>

        </div>

        <div className="testimonials-grid">
          {loading ? (
            <p className="reviews-empty-message">
              Loading customer reviews...
            </p>
          ) : testimonials.length === 0 ? (
            <p className="reviews-empty-message">
              No customer reviews yet. Be the first to share your dining experience!
            </p>
          ) : (
            testimonials.map((testimonial) => (
              <div className="testimonial-card" key={testimonial.id}>
                <div className="testimonial-stars">
                  {"★".repeat(testimonial.rating)}
                  {"☆".repeat(5 - testimonial.rating)}
                </div>

                <p className="testimonial-message">
                  "{testimonial.message}"
                </p>

                <div className="testimonial-customer">
                  <div className="testimonial-avatar">
                    {testimonial.customer_name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3>{testimonial.customer_name}</h3>
                    <span>{testimonial.location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="write-review-link-container">
          <Link to="/write-review" className="write-review-link">
            Write a Review
          </Link>
        </div>

      </div>
    </section>
  );
}

export default Testimonials;
