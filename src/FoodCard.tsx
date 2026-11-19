
import { useRef, useState } from "react";

type FoodCardProps = {
  name: string;
  price: string;
  originalPrice?: string;
  discountLabel?: string;
  description: string;
  image: string;
  images?: string[];
  onAddToOrder: () => void;
};

function FoodCard({
  name,
  price,
  originalPrice,
  discountLabel,
  description,
  image,
  images,
  onAddToOrder,
}: FoodCardProps) {
  const galleryImages = images?.length ? images : [image];

  const [showViewer, setShowViewer] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const touchStartX = useRef<number | null>(null);

  function openViewer() {
    setActiveImage(0);
    setShowViewer(true);
  }

  function closeViewer() {
    setShowViewer(false);
  }

  function previousImage() {
    setActiveImage((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1
    );
  }

  function nextImage() {
    setActiveImage((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1
    );
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;

    const difference =
      touchStartX.current - e.changedTouches[0].clientX;

    if (difference > 50) {
      nextImage();
    } else if (difference < -50) {
      previousImage();
    }

    touchStartX.current = null;
  }

  return (
    <>
      <div className="menu-card">

        <div
          className="menu-card-image-container"
          onClick={openViewer}
          role="button"
          tabIndex={0}
          aria-label={`View pictures of ${name}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openViewer();
            }
          }}
        >
          <img src={galleryImages[0]} alt={name} />

        
          {galleryImages.length > 1 && (
            <span className="menu-image-count">
              {galleryImages.length}
            </span>
          )}

          <span className="menu-image-zoom"></span>
        </div>

        <div className="menu-card-content">
  <div className="meal-title-row">
    <h3>{name}</h3>

    {discountLabel && (
      <span className="meal-discount-badge">
        {discountLabel}
      </span>
    )}
  </div>

          <p>{description}</p>

          <div className="meal-price-display">
            {originalPrice && (
              <span className="meal-original-price">
                {originalPrice}
              </span>
            )}

            <strong className={originalPrice ? "meal-offer-price" : ""}>
              {price}
            </strong>
          </div>

          <button
            className="add-to-order-btn"
            onClick={onAddToOrder}
          >
            Add to Order
          </button>
        </div>
      </div>

      {showViewer && (
        <div
          className="meal-image-lightbox"
          onClick={closeViewer}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} pictures`}
        >
          <button
            className="meal-lightbox-close"
            onClick={closeViewer}
            aria-label="Close image viewer"
          >
            &times;
          </button>

          <div
            className="meal-lightbox-content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {galleryImages.length > 1 && (
              <button
                className="meal-lightbox-arrow previous"
                onClick={previousImage}
                aria-label="Previous picture"
              >
                &#10094;
              </button>
            )}

            <img
              src={galleryImages[activeImage]}
              alt={`${name} - picture ${activeImage + 1}`}
              className="meal-lightbox-image"
            />

            {galleryImages.length > 1 && (
              <button
                className="meal-lightbox-arrow next"
                onClick={nextImage}
                aria-label="Next picture"
              >
                &#10095;
              </button>
            )}

            {galleryImages.length > 1 && (
              <div className="meal-lightbox-counter">
                {activeImage + 1} / {galleryImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FoodCard;
