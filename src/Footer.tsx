
function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-about">
          <h2>HLVision <span>Restaurant</span></h2>

          <p>
            Experience delicious meals, exceptional
            hospitality and unforgettable dining
            moments at Mbezi Beach, Dar es Salaam.
          </p>

          <div className="footer-socials">
            <a
              href="https://wa.me/255765696771"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#menu">Our Menu</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p>Sunset Hall, Mbezi Beach</p>
          <p>Dar es Salaam, Tanzania</p>
          <a href="tel:+255765696771">
            +255 765 696 771
          </a>
          <a href="https://wa.me/255765696771">
            Chat on WhatsApp
          </a>
        </div>

        <div className="footer-hours">
          <h3>Opening Hours</h3>
          <p>Monday - Sunday</p>
          <p>8:00 AM - 11:00 PM</p>
          <p>We're open every day!</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © 2026 HLVision Restaurant.
          All rights reserved.
        </p>
      </div>

    </footer>
  );
}

export default Footer;
