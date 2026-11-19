
import { useEffect, useState } from "react";

type GalleryImage = {
  id: number;
  title: string;
  category: string;
  image_url: string;
};

function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGalleryImages() {
      try {
        const response = await fetch("/api/gallery");
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Unable to load gallery images.");
        }

        setGalleryImages(data.images || []);
      } catch (error) {
        console.error("Gallery loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryImages();
  }, []);

  return (
    <section className="gallery-section" id="gallery">
      <div className="gallery-container">

        <div className="gallery-heading">
          <span className="gallery-subtitle">
            OUR GALLERY
          </span>

          <h2>A Taste of Our Experience</h2>

          <p>
            Explore our food, atmosphere and memorable dining experiences.
          </p>
        </div>

        <div className="gallery-grid">

          {loading ? (
            <p>Loading gallery...</p>
          ) : galleryImages.length === 0 ? (
            <p>Our gallery pictures will be available soon.</p>
          ) : (
            galleryImages.map((item) => (
              <div
                className="gallery-item"
                key={item.id}
                onClick={() => setSelectedImage(item.image_url)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedImage(item.image_url);
                  }
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                />

                <div className="gallery-overlay">
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                </div>
              </div>
            ))
          )}

        </div>

      </div>

      {selectedImage && (
        <div
          className="gallery-lightbox"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="gallery-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image"
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Selected gallery image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </section>
  );
}

export default Gallery;
