
import { useEffect, useState } from "react";

type CustomerReview = {
  id: number;
  customer_name: string;
  location: string;
  rating: number;
  message: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function CustomerReviews() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchReviews() {
    try {
      const response = await fetch("/api/customer-reviews/admin", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reviews.");
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function updateStatus(
    id: number,
    status: "approved" | "rejected"
  ) {
    try {
      const response = await fetch(
        `/api/customer-reviews/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update review.");
      }

      await fetchReviews();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  async function deleteReview(id: number) {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/customer-reviews/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete review.");
      }

      await fetchReviews();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <div className="customer-reviews-management">
      <div className="admin-section-header">
        <h2>Customer Reviews</h2>
        <p>Review and manage customer feedback.</p>
      </div>

      {loading ? (
        <p>Loading customer reviews...</p>
      ) : error ? (
        <p>{error}</p>
      ) : reviews.length === 0 ? (
        <p>No customer reviews have been submitted yet.</p>
      ) : (
        <div className="customer-reviews-grid">
          {reviews.map((review) => (
            <div className="customer-review-admin-card" key={review.id}>
              <div className="customer-review-admin-top">
                <div>
                  <h3>{review.customer_name}</h3>
                  <span>{review.location}</span>
                </div>

                <span className={`review-status ${review.status}`}>
                  {review.status}
                </span>
              </div>

              <div className="testimonial-stars">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>

              <p className="customer-review-admin-message">
                {review.message}
              </p>

              <small>
                {new Date(review.created_at).toLocaleDateString()}
              </small>

              <div className="customer-review-admin-actions">
                {review.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(review.id, "approved")}
                    className="review-approve-button"
                  >
                    Approve
                  </button>
                )}

                {review.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(review.id, "rejected")}
                    className="review-reject-button"
                  >
                    Reject
                  </button>
                )}

                <button
                  onClick={() => deleteReview(review.id)}
                  className="review-delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerReviews;
