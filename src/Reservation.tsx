
import { useEffect, useState } from "react";

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

  const [customerName, setCustomerName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // FETCH APPROVED REVIEWS
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

  // SUBMIT CUSTOMER REVIEW
  async function handleReviewSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch("/api/customer-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          location,
          rating,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit your review.");
      }

      setSuccess(
        "Thank you for sharing your experience! Your review is awaiting approval."
      );

      setCustomerName("");
      setLocation("");
      setRating(5);
      setMessage("");

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

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
            <p>Loading customer reviews...</p>
          ) : testimonials.length === 0 ? (
            <p>
              No customer reviews yet. Be the first to share
              your dining experience!
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

        {/* WRITE A REVIEW FORM */}

        <div className="write-review-container">

          <div className="write-review-heading">
            <h3>Share Your Experience</h3>

            <p>
              Have you dined with us? We'd love to hear
              what you think!
            </p>
          </div>

          <form className="review-form" onSubmit={handleReviewSubmit}>

            <div className="review-form-group">
              <label htmlFor="customerName">Your Name</label>

              <input
                id="customerName"
                type="text"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="review-form-group">
              <label htmlFor="customerLocation">Your Location</label>

              <input
                id="customerLocation"
                type="text"
                placeholder="e.g. Dar es Salaam"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="review-form-group">
              <label>Your Rating</label>

              <div className="review-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= rating ? "active" : ""}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} out of 5 stars`}
                    aria-pressed={rating === star}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="review-form-group">
              <label htmlFor="reviewMessage">Your Review</label>

              <textarea
                id="reviewMessage"
                placeholder="Tell us about your dining experience..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minLength={10}
                maxLength={1000}
                required
              />
            </div>

            {success && (
              <div className="review-success-message">
                {success}
              </div>
            )}

            {error && (
              <div className="review-error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="review-submit-button"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Your Review"}
            </button>

          </form>

        </div>

      </div>
    </section>
  );
}

export default Testimonials;
