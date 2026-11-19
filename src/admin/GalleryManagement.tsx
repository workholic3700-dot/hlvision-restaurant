
import { useEffect, useState } from "react";

type GalleryImage = {
  id: number;
  title: string;
  category: string;
  image_url: string;
  visible: boolean;
  created_at: string;
};

function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Food");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "Food",
    "Interior",
    "Events",
    "Dining",
    "Celebrations",
    "Experiences",
  ];

  const API = "/api/gallery";

  function getImageUrl(url: string) {
    if (url.startsWith("http")) return url;
    return url;
  }

  async function fetchImages() {
    try {
      setLoading(true);
      const response = await fetch(`${API}/admin`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load gallery.");
      }

      setImages(data.images || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load gallery."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchImages();
  }, []);

  function resetForm() {
    setTitle("");
    setCategory("Food");
    setSelectedFile(null);
    setPreview("");
    setEditingId(null);

    const fileInput = document.getElementById(
      "gallery-image-input"
    ) as HTMLInputElement | null;

    if (fileInput) fileInput.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter an image title.");
      return;
    }

    if (!editingId && !selectedFile) {
      setError("Please select a picture.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      setSaving(true);

      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save picture.");
      }

      setSuccess(data.message);
      resetForm();
      await fetchImages();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save picture."
      );
    } finally {
      setSaving(false);
    }
  }

  function editImage(image: GalleryImage) {
    setEditingId(image.id);
    setTitle(image.title);
    setCategory(image.category);
    setSelectedFile(null);
    setPreview(image.image_url);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function toggleVisibility(image: GalleryImage) {
    try {
      const response = await fetch(
        `${API}/${image.id}/visibility`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            visible: !image.visible,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update visibility.");
      }

      setImages((previous) =>
        previous.map((item) =>
          item.id === image.id ? data.image : item
        )
      );

      setSuccess(data.message);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update visibility."
      );
    }
  }

  async function deleteImage(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this gallery picture?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete picture.");
      }

      setImages((previous) =>
        previous.filter((image) => image.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      setSuccess(data.message);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete picture."
      );
    }
  }

  return (
    <div className="gallery-management">

      <section className="admin-content-card gallery-form-card">
        <div className="section-heading">
          <div>
            <h2>
              {editingId ? "Edit Gallery Picture" : "Add Gallery Picture"}
            </h2>
            <p>
              Upload and manage pictures displayed on your restaurant website.
            </p>
          </div>
        </div>

        {error && (
          <div className="gallery-message gallery-error">
            {error}
          </div>
        )}

        {success && (
          <div className="gallery-message gallery-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="gallery-admin-form">

          <div className="gallery-form-group">
            <label htmlFor="gallery-title">Picture Title</label>
            <input
              id="gallery-title"
              type="text"
              placeholder="e.g. Our Delicious Grilled Chicken"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
            />
          </div>

          <div className="gallery-form-group">
            <label htmlFor="gallery-category">Category</label>
            <select
              id="gallery-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="gallery-form-group">
            <label htmlFor="gallery-image-input">
              Picture (JPG, PNG or WEBP, maximum 5 MB)
            </label>

            <input
              id="gallery-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              required={!editingId}
            />
          </div>

          {preview && (
            <div className="gallery-upload-preview">
              <img
                src={getImageUrl(preview)}
                alt="Gallery preview"
              />
            </div>
          )}

          <div className="gallery-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Picture"
                  : "Upload Picture"}
            </button>

            {editingId && (
              <button
                type="button"
                className="gallery-cancel-button"
                onClick={resetForm}
              >
                Cancel Editing
              </button>
            )}
          </div>

        </form>
      </section>

      <section className="admin-content-card gallery-list-card">

        <div className="section-heading">
          <div>
            <h2>Gallery Pictures</h2>
            <p>
              {images.length} picture{images.length !== 1 ? "s" : ""} in your gallery.
            </p>
          </div>

          <button type="button" onClick={fetchImages}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-empty-state">
            <p>Loading gallery pictures...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No gallery pictures yet</h3>
            <p>Upload your first picture using the form above.</p>
          </div>
        ) : (
          <div className="gallery-admin-grid">
            {images.map((image) => (
              <div className="gallery-admin-item" key={image.id}>

                <div className="gallery-admin-image">
                  <img
                    src={getImageUrl(image.image_url)}
                    alt={image.title}
                  />

                  <span
                    className={
                      image.visible
                        ? "gallery-status visible"
                        : "gallery-status hidden"
                    }
                  >
                    {image.visible ? "Visible" : "Hidden"}
                  </span>
                </div>

                <div className="gallery-admin-details">
                  <span className="gallery-admin-category">
                    {image.category}
                  </span>

                  <h3>{image.title}</h3>

                  <div className="gallery-admin-actions">

                    <button
                      type="button"
                      onClick={() => editImage(image)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="gallery-visibility-button"
                      onClick={() => toggleVisibility(image)}
                    >
                      {image.visible ? "Hide" : "Show"}
                    </button>

                    <button
                      type="button"
                      className="gallery-delete-button"
                      onClick={() => deleteImage(image.id)}
                    >
                      Delete
                    </button>

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

    </div>
  );
}

export default GalleryManagement;
