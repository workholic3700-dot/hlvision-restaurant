
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function ReviewPage() {
  const [customerName, setCustomerName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleReviewSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
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
    <div>
      <Navbar />

      <section className="review-page-header">
        <h1>Share Your Experience</h1>
        <p>
          We would love to hear about your dining experience
          at HLVision Restaurant.
        </p>
      </section>

      <section className="testimonials-section">
        <div className="testimonials-container">

          <div className="write-review-container">
            <div className="write-review-heading">
              <h3>Write Your Review</h3>
              <p>
                Tell us what you enjoyed about your visit.
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

      <Footer />
    </div>
  );
}

export default ReviewPage;
