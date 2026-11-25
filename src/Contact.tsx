function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <div className="contact-heading">
          <span>GET IN TOUCH</span>
          <h2>We'd Love to Hear From You</h2>
          <p>
            Have a question or planning to visit us? We'd be happy to hear from
            you.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <h3>Our Location</h3>
            <p>Sunset Hall, Mbezi Beach, Dar es Salaam</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Sunset+Hall+Mbezi+Beach+Dar+es+Salaam"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions →
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h3>Call Us</h3>
            <p>0765696771</p>
            <a href="tel:+255765696771">Call Restaurant →</a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">💬</div>
            <h3>WhatsApp</h3>
            <p>Chat with us directly</p>
            <a
              href="https://wa.me/255765696771"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp →
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">🕒</div>
            <h3>Opening Hours</h3>
            <p>Monday – Sunday</p>
            <strong>8:00 AM – 11:00 PM</strong>
          </div>
        </div>
      </div>

      <div className="contact-map">
        <iframe
          src="https://www.google.com/maps?q=Sunset+Hall+Mbezi+Beach+Dar+es+Salaam&output=embed"
          width="100%"
          height="350"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title="Restaurant Location"
        ></iframe>
      </div>
    </section>
  );
}

export default Contact;
