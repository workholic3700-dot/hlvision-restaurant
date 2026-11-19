
import { useState } from "react";

type CheckoutProps = {
  total: number;
  onClose: () => void;
  onSubmit: (customer: {
    name: string;
    phone: string;
    orderType: string;
    instructions: string;
  }) => void;
};

function Checkout({ total, onClose, onSubmit }: CheckoutProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState("");
  const [instructions, setInstructions] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      name,
      phone,
      orderType,
      instructions
    });
  }

  return (
    <div className="checkout-section">
      <h2>Customer Checkout</h2>

      <p>Complete your details to place your order.</p>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
        />

        <label>Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          required
        />

        <label>Order Type</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          required
        >
          <option value="">Select order type</option>
          <option value="Dine-in">Dine-in</option>
          <option value="Takeaway">Takeaway</option>
        </select>

        <label>Special Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Any special requests?"
        />

        <h3>
          Total: TSh {total.toLocaleString()}
        </h3>

        <button type="submit">
          Place Order
        </button>

        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default Checkout;
