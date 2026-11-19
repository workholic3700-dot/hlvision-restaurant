
import { useEffect, useState } from "react";

type Meal = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string | null;
  image_urls?: string[] | null;
  available: boolean;
};

function MenuManagement() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // FETCH MEALS
  async function fetchMeals() {
    try {
      setLoading(true);

      const response = await fetch("/api/meals");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch meals.");
      }

      setMeals(data.meals || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load meals."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMeals();
  }, []);

  // RESET FORM
  function resetForm() {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    setName("");
    setCategory("Main Course");
    setPrice("");
    setDescription("");
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  // SELECT AND ADD MULTIPLE IMAGES
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    const combinedFiles = [...images, ...selectedFiles];

    if (combinedFiles.length > 10) {
      setError("You can add a maximum of 10 pictures per meal.");
      e.target.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    for (const file of selectedFiles) {
      if (!validTypes.includes(file.type)) {
        setError("Only JPG, PNG and WEBP pictures are allowed.");
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Each picture must not exceed 5 MB.");
        e.target.value = "";
        return;
      }
    }

    const newPreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImages(combinedFiles);
    setImagePreviews((previous) => [...previous, ...newPreviews]);
    setExistingImages([]);
    setError("");

    // Allow selecting more pictures using the same input
    e.target.value = "";
  }

  // SAVE MEAL
  async function saveMeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("category", category);
      formData.append("price", price);
      formData.append("description", description.trim());

      images.forEach((image) => {
        formData.append("images", image);
      });

      const url =
        editingId !== null
          ? `/api/meals/${editingId}`
          : "/api/meals";

      const response = await fetch(url, {
        method: editingId !== null ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save meal.");
      }

      await fetchMeals();
      resetForm();

      alert(
        editingId !== null
          ? "Meal updated successfully!"
          : "Meal added successfully!"
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save meal."
      );
    } finally {
      setSaving(false);
    }
  }

  // EDIT MEAL
  function editMeal(meal: Meal) {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    const savedImages = meal.image_urls?.length
      ? meal.image_urls
      : meal.image_url
        ? [meal.image_url]
        : [];

    setEditingId(meal.id);
    setName(meal.name);
    setCategory(meal.category);
    setPrice(String(meal.price));
    setDescription(meal.description || "");
    setImages([]);
    setImagePreviews([]);
    setExistingImages(savedImages);
    setError("");
    setShowForm(true);
  }

  // DELETE MEAL
  async function deleteMeal(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meal?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/meals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete meal.");
      }

      await fetchMeals();
      alert("Meal deleted successfully!");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Unable to delete meal."
      );
    }
  }

  // TOGGLE AVAILABILITY
  async function toggleAvailability(meal: Meal) {
    try {
      const response = await fetch(
        `/api/meals/${meal.id}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            available: !meal.available,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update availability.");
      }

      setMeals((previous) =>
        previous.map((item) =>
          item.id === meal.id ? data.meal : item
        )
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update availability."
      );
    }
  }

  return (
    <div className="admin-page-content">

      <div className="admin-page-title">
        <div>
          <h2>Menu Management</h2>
          <p>Add, edit and manage your restaurant meals.</p>
        </div>

        <button
          className="admin-primary-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add New Meal
        </button>
      </div>

      <div className="order-summary">
        <div>
          <span>Total Meals</span>
          <strong>{meals.length}</strong>
        </div>

        <div>
          <span>Available Meals</span>
          <strong>
            {meals.filter((meal) => meal.available).length}
          </strong>
        </div>

        <div>
          <span>Unavailable Meals</span>
          <strong>
            {meals.filter((meal) => !meal.available).length}
          </strong>
        </div>

        <div>
          <span>Categories</span>
          <strong>
            {new Set(meals.map((meal) => meal.category)).size}
          </strong>
        </div>
      </div>

      {showForm && (
        <section className="admin-content-card meal-form-card">

          <h3>
            {editingId !== null ? "Edit Meal" : "Add New Meal"}
          </h3>

          {error && <p className="meal-error">{error}</p>}

          <form onSubmit={saveMeal} className="meal-form">

            <div className="meal-form-grid">

              <label>
                Meal Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter meal name"
                  required
                />
              </label>

              <label>
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Main Course</option>
                  <option>Fast Food</option>
                  <option>Pizza</option>
                  <option>Drinks</option>
                  <option>Desserts</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Price (TSh)
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                  required
                />
              </label>

              <label>
                Description
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the meal"
                  required
                />
              </label>

            </div>

            <div className="meal-image-upload">

              <label htmlFor="meal-images">
                Meal Pictures (Maximum 10)
              </label>

              <input
                id="meal-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
              />

              <small>
                Select pictures in one or more batches.
                Maximum 10 pictures, 5 MB each.
              </small>

              <p>
                {images.length > 0
                  ? `${images.length} new picture(s) selected`
                  : `${existingImages.length} existing picture(s)`}
              </p>

              {existingImages.length > 0 && images.length === 0 && (
                <p>
                  Current pictures. Selecting new pictures will replace them.
                </p>
              )}

              {(imagePreviews.length > 0
                ? imagePreviews
                : existingImages
              ).length > 0 && (

                <div className="meal-multiple-previews">

                  {(imagePreviews.length > 0
                    ? imagePreviews
                    : existingImages
                  ).map((image, index) => (

                    <div className="meal-image-preview" key={image}>
                      <img
                        src={image}
                        alt={`Meal picture ${index + 1}`}
                      />

                      <span>{index + 1}</span>
                    </div>

                  ))}

                </div>
              )}

            </div>

            <div className="meal-form-actions">

              <button
                type="submit"
                className="admin-primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Add Meal"}
              </button>

              <button
                type="button"
                className="meal-cancel-btn"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>
        </section>
      )}

      <div className="admin-content-card">

        <div className="orders-table-heading">
          <div>
            <h3>Restaurant Menu</h3>
            <p>{meals.length} meals listed</p>
          </div>
        </div>

        <div className="orders-table-wrapper">

          {loading ? (
            <p>Loading meals...</p>
          ) : (

            <table className="orders-table">

              <thead>
                <tr>
                  <th>Picture</th>
                  <th>Meal Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {meals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      No meals added yet.
                    </td>
                  </tr>
                ) : (

                  meals.map((meal) => {

                    const firstImage =
                      meal.image_urls?.[0] || meal.image_url;

                    return (
                      <tr key={meal.id}>

                        <td>
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={meal.name}
                              className="meal-table-image"
                            />
                          ) : (
                            <span>No image</span>
                          )}
                        </td>

                        <td>{meal.name}</td>
                        <td>{meal.category}</td>

                        <td>
                          TSh {Number(meal.price).toLocaleString()}
                        </td>

                        <td>{meal.description}</td>

                        <td>
                          <button
                            type="button"
                            className={`meal-availability ${
                              meal.available ? "available" : "unavailable"
                            }`}
                            onClick={() => toggleAvailability(meal)}
                          >
                            {meal.available ? "Available" : "Unavailable"}
                          </button>
                        </td>

                        <td>
                          <div className="meal-actions">

                            <button
                              type="button"
                              onClick={() => editMeal(meal)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteMeal(meal.id)}
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>
            </table>
          )}

        </div>
      </div>

    </div>
  );
}

export default MenuManagement;
