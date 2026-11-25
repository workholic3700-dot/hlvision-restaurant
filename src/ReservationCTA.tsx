function ReservationCTA() {
  return (
    <section className="reservation-cta-section" id="reservation-cta">
      <div className="reservation-cta-content">
        <span className="reservation-cta-subtitle">BOOK YOUR EXPERIENCE</span>

        <div className="reservation-cta-divider"></div>

        <h2>Ready for a Memorable Dining Experience?</h2>

        <p>
          Reserve your table at HLVision Restaurant.{" "}
          <span>We'd love to host you.</span>
        </p>

        <a href="/reservation" className="reservation-cta-button">
          Book Your Table
          <span> →</span>
        </a>
      </div>
    </section>
  );
}

export default ReservationCTA;
