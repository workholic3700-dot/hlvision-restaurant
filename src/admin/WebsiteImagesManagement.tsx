
import { useEffect, useState } from "react";

type WebsiteImage = {
  id: number;
  section_key: string;
  image_url: string;
  updated_at: string;
};

const imageSections = [
  {
    key: "hero",
    title: "Hero Section",
    description: "Main banner image displayed at the top of your website.",
  },
  {
    key: "about",
    title: "Our Story Section",
    description: "Image displayed in the Our Story section.",
  },
];

function WebsiteImagesManagement() {
  const [images, setImages] = useState<WebsiteImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, File | null>
  >({
    hero: null,
    about: null,
  });
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const response = await fetch("/api/website-images/admin", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load website images.");
      }

      setImages(data.images || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load website images."
      );
    } finally {
      setLoading(false);
    }
  }

  function getImageUrl(url: string) {
    if (url.startsWith("http")) {
      return url;
    }

    return url;
  }

  function handleFileChange(section: string, file: File | null) {
    setMessage("");
    setError("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5MB.");
      return;
    }

    setSelectedFiles((previous) => ({
      ...previous,
      [section]: file,
    }));

    const previewUrl = URL.createObjectURL(file);

    setPreviews((previous) => {
      if (previous[section]) {
        URL.revokeObjectURL(previous[section]);
      }

      return {
        ...previous,
        [section]: previewUrl,
      };
    });
  }

  async function saveImage(section: string) {
    const file = selectedFiles[section];

    if (!file) {
      setError("Please select an image before saving.");
      return;
    }

    setSaving(section);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`/api/website-images/${section}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update website image.");
      }

      setImages((previous) =>
        previous.map((image) =>
          image.section_key === section ? data.image : image
        )
      );

      setSelectedFiles((previous) => ({
        ...previous,
        [section]: null,
      }));

      setPreviews((previous) => {
        if (previous[section]) {
          URL.revokeObjectURL(previous[section]);
        }

        const updated = { ...previous };
        delete updated[section];
        return updated;
      });

      setMessage(
        `${section === "hero" ? "Hero" : "Our Story"} image updated successfully!`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update website image."
      );
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="website-images-management">
        <p>Loading website images...</p>
      </div>
    );
  }

  return (
    <div className="website-images-management">
      <div className="website-images-heading">
        <div>
          <h2>Website Images</h2>
          <p>Manage the pictures displayed on your restaurant website.</p>
        </div>
      </div>

      {message && (
        <div className="website-image-success">{message}</div>
      )}

      {error && (
        <div className="website-image-error">{error}</div>
      )}

      <div className="website-images-grid">
        {imageSections.map((section) => {
          const currentImage = images.find(
            (image) => image.section_key === section.key
          );

          return (
            <div className="website-image-card" key={section.key}>
              <div className="website-image-card-heading">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>

              <div className="website-image-preview">
                {previews[section.key] || currentImage?.image_url ? (
                  <img
                    src={
                      previews[section.key] ||
                      getImageUrl(currentImage!.image_url)
                    }
                    alt={section.title}
                  />
                ) : (
                  <div className="website-image-empty">
                    No image available
                  </div>
                )}
              </div>

              <div className="website-image-upload">
                <label htmlFor={`website-image-${section.key}`}>
                  Choose New Image
                </label>

                <input
                  id={`website-image-${section.key}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    handleFileChange(
                      section.key,
                      e.target.files?.[0] || null
                    )
                  }
                />

                <span>JPG, PNG or WEBP. Maximum size: 5MB.</span>
              </div>

              <button
                type="button"
                className="website-image-save-button"
                onClick={() => saveImage(section.key)}
                disabled={
                  !selectedFiles[section.key] || saving !== null
                }
              >
                {saving === section.key ? "Saving..." : "Save Image"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WebsiteImagesManagement;
