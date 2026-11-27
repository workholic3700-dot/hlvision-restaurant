import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function CustomerLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/customer-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      navigate("/customer-dashboard");
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
          <h1>Welcome Back</h1>
          <p>Sign in to access your HLVision customer account.</p>
        </div>

        <form className="customer-auth-form" onSubmit={handleSubmit}>
          <div className="customer-auth-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="customer-auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="customer-auth-error">{error}</p>}

          <button
            type="submit"
            className="customer-auth-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="customer-auth-switch">
            Don't have an account?{" "}
            <Link to="/customer-register">Create Account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default CustomerLoginPage;
