
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        HLVision<span> Restaurant</span>
      </div>

      <ul className="nav-links">
        <li><Link to="/#home">Home</Link></li>
        <li><Link to="/#about">About</Link></li>
        <li><Link to="/#menu">Our Menu</Link></li>
        <li><Link to="/#contact">Contact</Link></li>
      </ul>

      <Link to="/#menu" className="nav-button">
        Explore Menu
      </Link>
    </nav>
  );
}

export default Navbar;
