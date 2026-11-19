
import { useEffect, useState } from "react";

type Meal = {
  id: number;
  name: string;
  price: string | number;
};

type DiscountOffer = {
  id: number;
  meal_id: number;
  meal_name: string;
  title: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  original_price: number;
  offer_price: number;
  start_date: string;
  end_date: string;
  active: boolean;
};

const emptyForm = {
  title: "",
  meal_id: "",
  description: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: "",
  start_date: "",
  end_date: "",
};

function DiscountOffers() {
  const [offers, setOffers] = useState<DiscountOffer[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH OFFERS
  const fetchOffers = async () => {
    try {
      const response = await fetch("/api/discount-offers/admin", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load offers.");
      }

      setOffers(data.offers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load offers.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH AVAILABLE MEALS
  const fetchMeals = async () => {
    try {
      const response = await fetch("/api/discount-offers/meals", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load meals.");
      }

      setMeals(data.meals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load meals.");
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchMeals();
  }, []);

  // SELECTED MEAL
  const selectedMeal = meals.find(
    (meal) => meal.id === Number(form.meal_id)
  );

  // CALCULATE OFFER PRICE
  const originalPrice = selectedMeal
    ? Number(selectedMeal.price)
    : 0;

  const discountValue = Number(form.discount_value) || 0;

  const offerPrice =
    form.discount_type === "percentage"
      ? originalPrice - (originalPrice * discountValue) / 100
      : originalPrice - discountValue;

  const validPreview =
    selectedMeal !== undefined &&
    discountValue > 0 &&
    offerPrice >= 0 &&
    (form.discount_type !== "percentage" || discountValue <= 100);

  const formatPrice = (price: number) =>
    `TSh ${Number(price).toLocaleString("en-TZ", {
      maximumFractionDigits: 2,
    })}`;

  // HANDLE FORM INPUTS
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // RESET FORM
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  // CREATE OR UPDATE OFFER
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.meal_id) {
      setError("Please select a meal.");
      return;
    }

    if (form.discount_type === "percentage" && discountValue > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (discountValue <= 0 || offerPrice < 0) {
      setError("Please enter a valid discount that does not exceed the meal price.");
      return;
    }

    if (form.end_date < form.start_date) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `/api/discount-offers/${editingId}`
        : "/api/discount-offers";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          meal_id: Number(form.meal_id),
          discount_value: discountValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save offer.");
      }

      setSuccess(
        editingId
          ? "Discount offer updated successfully."
          : "Discount offer created successfully."
      );

      resetForm();
      await fetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save offer.");
    } finally {
      setSaving(false);
    }
  };

  // EDIT OFFER
  const handleEdit = (offer: DiscountOffer) => {
    setEditingId(offer.id);

    setForm({
      title: offer.title,
      meal_id: String(offer.meal_id),
      description: offer.description || "",
      discount_type: offer.discount_type,
      discount_value: String(offer.discount_value),
      start_date: String(offer.start_date).slice(0, 10),
      end_date: String(offer.end_date).slice(0, 10),
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ACTIVATE OR DEACTIVATE OFFER
  const handleStatus = async (offer: DiscountOffer) => {
    try {
      const response = await fetch(
        `/api/discount-offers/${offer.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !offer.active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update offer.");
      }

      setSuccess("Offer status updated successfully.");
      await fetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update offer.");
    }
  };

  // DELETE OFFER
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) {
      return;
    }

    try {
      const response = await fetch(`/api/discount-offers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete offer.");
      }

      setSuccess("Discount offer deleted successfully.");
      await fetchOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete offer.");
    }
  };

  // FORMAT DISCOUNT
  const formatDiscount = (offer: DiscountOffer) =>
    offer.discount_type === "percentage"
      ? `${offer.discount_value}% OFF`
      : `${formatPrice(offer.discount_value)} OFF`;

  // CHECK OFFER DATE STATUS
  const getDateStatus = (offer: DiscountOffer) => {
    const today = new Date().toISOString().slice(0, 10);
    const start = String(offer.start_date).slice(0, 10);
    const end = String(offer.end_date).slice(0, 10);

    if (end < today) return "Expired";
    if (start > today) return "Upcoming";
    return "Running";
  };

  return (
    <div className="discount-management">

      <div className="discount-page-heading">
        <div>
          <h2>Discount Offers Management</h2>
          <p>Create and manage special promotions for your customers.</p>
        </div>
      </div>

      {error && (
        <div className="discount-message discount-error">{error}</div>
      )}

      {success && (
        <div className="discount-message discount-success">{success}</div>
      )}

      <section className="admin-content-card discount-form-card">
        <div className="section-heading">
          <div>
            <h2>{editingId ? "Edit Discount Offer" : "Create New Offer"}</h2>
            <p>Select a meal and set its promotional price.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="discount-form">
          <div className="discount-form-grid">

            <div className="discount-field">
              <label>Offer Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Weekend Special"
                required
              />
            </div>

            <div className="discount-field">
              <label>Select Meal *</label>
              <select
                name="meal_id"
                value={form.meal_id}
                onChange={handleChange}
                required
              >
                <option value="">Choose a meal</option>
                {meals.map((meal) => (
                  <option key={meal.id} value={meal.id}>
                    {meal.name} - {formatPrice(Number(meal.price))}
                  </option>
                ))}
              </select>
              {meals.length === 0 && (
                <small>No available meals found. Add meals in Menu Management first.</small>
              )}
            </div>

            <div className="discount-field">
              <label>Discount Type *</label>
              <select
                name="discount_type"
                value={form.discount_type}
                onChange={handleChange}
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (TSh)</option>
              </select>
            </div>

            <div className="discount-field">
              <label>Discount Value *</label>
              <input
                type="number"
                name="discount_value"
                value={form.discount_value}
                onChange={handleChange}
                placeholder={form.discount_type === "percentage" ? "e.g. 20" : "e.g. 5000"}
                min="0.01"
                max={form.discount_type === "percentage" ? 100 : undefined}
                step="0.01"
                required
              />
            </div>

            <div className="discount-field">
              <label>Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="discount-field">
              <label>End Date *</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                min={form.start_date || undefined}
                required
              />
            </div>

            <div className="discount-field discount-full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your special offer..."
                rows={4}
              />
            </div>

          </div>

          {/* LIVE PRICE PREVIEW */}
          {selectedMeal && (
            <div className="discount-price-preview">
              <span className="discount-preview-label">PRICE PREVIEW</span>

              <h3>{selectedMeal.name}</h3>

              <div className="discount-preview-prices">
                <span className="discount-original-price">
                  {formatPrice(originalPrice)}
                </span>

                {validPreview && (
                  <strong className="discount-offer-price">
                    {formatPrice(offerPrice)}
                  </strong>
                )}
              </div>

              {validPreview && (
                <span className="discount-preview-badge">
                  {form.discount_type === "percentage"
                    ? `${discountValue}% OFF`
                    : `${formatPrice(discountValue)} OFF`}
                </span>
              )}

              {!validPreview && (
                <small>Enter a valid discount to see the offer price.</small>
              )}
            </div>
          )}

          <div className="discount-form-actions">
            <button
              type="submit"
              className="discount-save-button"
              disabled={saving || meals.length === 0}
            >
              {saving ? "Saving..." : editingId ? "Update Offer" : "Create Offer"}
            </button>

            {editingId && (
              <button
                type="button"
                className="discount-cancel-button"
                onClick={resetForm}
              >
                Cancel Editing
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-content-card discount-list-card">
        <div className="section-heading">
          <div>
            <h2>All Discount Offers</h2>
            <p>View and manage your restaurant promotions.</p>
          </div>

          <span className="discount-count">{offers.length} Offers</span>
        </div>

        {loading ? (
          <div className="admin-empty-state">Loading discount offers...</div>
        ) : offers.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No discount offers yet</h3>
            <p>Create your first promotion using the form above.</p>
          </div>
        ) : (
          <div className="discount-table-wrapper">
            <table className="discount-table">
              <thead>
                <tr>
                  <th>Meal / Offer</th>
                  <th>Original Price</th>
                  <th>Offer Price</th>
                  <th>Discount</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {offers.map((offer) => {
                  const dateStatus = getDateStatus(offer);

                  return (
                    <tr key={offer.id}>
                      <td>
                        <strong>{offer.meal_name || offer.title}</strong>
                        <small>{offer.title}</small>
                        {offer.description && <small>{offer.description}</small>}
                      </td>

                      <td>
                        <span className="discount-original-price">
                          {formatPrice(Number(offer.original_price))}
                        </span>
                      </td>

                      <td>
                        <strong className="discount-offer-price">
                          {formatPrice(Number(offer.offer_price))}
                        </strong>
                      </td>

                      <td>
                        <strong className="discount-value">
                          {formatDiscount(offer)}
                        </strong>
                      </td>

                      <td>
                        {String(offer.start_date).slice(0, 10)}
                        <br />
                        {String(offer.end_date).slice(0, 10)}
                      </td>

                      <td>
                        <div className="discount-status-group">
                          <span className={`discount-status ${dateStatus.toLowerCase()}`}>
                            {dateStatus}
                          </span>
                          <span className={`discount-status ${offer.active ? "enabled" : "disabled"}`}>
                            {offer.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="discount-action-buttons">
                          <button
                            type="button"
                            onClick={() => handleEdit(offer)}
                            className="discount-edit-button"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatus(offer)}
                            className="discount-toggle-button"
                          >
                            {offer.active ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(offer.id)}
                            className="discount-delete-button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default DiscountOffers;
