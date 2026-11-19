import { useState } from "react";

function Settings() {
  const [restaurant, setRestaurant] = useState({
    name: "HLVision Restaurant",
    location: "Sunset Hall, Mbezi Beach, Dar es Salaam",
    phone: "+255765696771",
    email: "",
    openingHours: "8:00 AM - 11:00 PM"
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestaurant({
      ...restaurant,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("Settings updated in this session.");
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-title">
        <div>
          <h2>Settings</h2>
          <p>Manage your restaurant information and contact details.</p>
        </div>
      </div>

      <div className="admin-content-card settings-card">
        <h3>Restaurant Information</h3>

        <form className="settings-form" onSubmit={handleSubmit}>
          <label>
            Restaurant Name
            <input
              name="name"
              value={restaurant.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Restaurant Location
            <input
              name="location"
              value={restaurant.location}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phone Number
            <input
              name="phone"
              value={restaurant.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={restaurant.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Opening Hours
            <input
              name="openingHours"
              value={restaurant.openingHours}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="admin-primary-btn">
            Save Settings
          </button>

          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Settings;