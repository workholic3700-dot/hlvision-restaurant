import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function CustomerRegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/customer-auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/customer-login");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="customer-auth-section">
      <div className="customer-auth-container">
        <div className="customer-auth-heading">
          <span>HLVISION RESTAURANT</span>
          <h1>Create Your Account</h1>
          <p>Join us and enjoy a more convenient dining experience.</p>
        </div>

        <form className="customer-auth-form" onSubmit={handleSubmit}>
          <div className="customer-auth-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={150}
              autoComplete="name"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={255}
              autoComplete="email"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="phone">Phone Number (Optional)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              maxLength={30}
              autoComplete="tel"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="customer-auth-error">{error}</p>}

          {success && <p className="customer-auth-success">{success}</p>}

          <button
            type="submit"
            className="customer-auth-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="customer-auth-switch">
            Already have an account? <Link to="/customer-login">Sign In</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default CustomerRegisterPage;
