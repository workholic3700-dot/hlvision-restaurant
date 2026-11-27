import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        const response = await fetch("/api/customer-auth/me", {
          credentials: "include",
        });

        setIsCustomerLoggedIn(response.ok);
      } catch {
        setIsCustomerLoggedIn(false);
      }
    };

    checkCustomer();
  }, []);

  return (
    <nav className="navbar">
      <div className="logo">
        HLVision<span> Restaurant</span>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/#home">Home</Link>
        </li>

        <li>
          <Link to="/#about">About</Link>
        </li>

        <li>
          <Link to="/#menu">Our Menu</Link>
        </li>

        <li>
          <Link to="/#contact">Contact</Link>
        </li>

        <li>
          <Link
            to={isCustomerLoggedIn ? "/customer-dashboard" : "/customer-login"}
          >
            {isCustomerLoggedIn ? "My Account" : "Sign In"}
          </Link>
        </li>
      </ul>

      <Link to="/#menu" className="nav-button">
        Explore Menu
      </Link>
    </nav>
  );
}

export default Navbar;
