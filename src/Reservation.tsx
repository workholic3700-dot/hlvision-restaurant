import { useState, type FormEvent } from "react";

const foodOptions = [
  "Chicken",
  "Beef",
  "Fish",
  "Seafood",
  "Pork",
  "Vegetarian",
  "Mixed Dishes",
  "Other",
];

const celebrationOptions = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Graduation",
  "Business Meeting",
  "Other Celebration",
];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Reservation() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [attendees, setAttendees] = useState("2");

  const [celebration, setCelebration] = useState("No");
  const [celebrationType, setCelebrationType] = useState("");

  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [otherFood, setOtherFood] = useState("");
  const [requests, setRequests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleFoodChange(food: string) {
    setSelectedFoods((previous) =>
      previous.includes(food)
        ? previous.filter((item) => item !== food)
        : [...previous, food],
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (selectedFoods.length === 0) {
      setError("Please select at least one food preference.");
      return;
    }

    if (celebration === "Yes" && !celebrationType) {
      setError("Please select your celebration type.");
      return;
    }

    if (selectedFoods.includes("Other") && !otherFood.trim()) {
      setError("Please specify your other food preference.");
      return;
    }

    setSubmitting(true);

    try {
      const reservationData = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        date,
        time,
        attendees,
        celebration,
        celebrationType,
        selectedFoods,
        otherFood: otherFood.trim(),
        requests: requests.trim(),
      };

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `Server returned an invalid response (HTTP ${response.status}).`,
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || `Reservation failed (HTTP ${response.status}).`,
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit your reservation.");
      }

      setSuccess(
        "Your reservation has been submitted successfully! Opening WhatsApp...",
      );

      const whatsappNumber = "255765696771";

      const whatsappMessage = `
Hello HLVision Restaurant!

I have submitted a table reservation.

Name: ${name}
Phone: ${phone}
Email: ${email || "Not provided"}
Date: ${date}
Time: ${time}
Number of Guests: ${attendees}
Celebration: ${celebration}
Celebration Type: ${celebration === "Yes" ? celebrationType : "None"}
Food Preferences: ${selectedFoods.join(", ")}
Other Food: ${otherFood || "None"}
Special Requests: ${requests || "None"}

Reservation Reference: ${data.reservation?.id || "Submitted"}

Thank you!
      `.trim();

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        whatsappMessage,
      )}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      setName("");
      setPhone("");
      setEmail("");
      setDate("");
      setTime("");
      setAttendees("2");
      setCelebration("No");
      setCelebrationType("");
      setSelectedFoods([]);
      setOtherFood("");
      setRequests("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="reservation-section" id="reservation">
      <div className="reservation-container">
        <div className="reservation-heading">
          <span className="reservation-subtitle">BOOK YOUR EXPERIENCE</span>

          <h2>Reserve Your Table</h2>

          <p>
            Plan your dining experience with us. Complete the form below and let
            us prepare a memorable experience for you.
          </p>
        </div>

        <form className="reservation-form" onSubmit={handleSubmit}>
          <div className="reservation-form-group">
            <label htmlFor="reservationName">Full Name *</label>
            <input
              id="reservationName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div className="reservation-form-group">
            <label htmlFor="reservationPhone">Phone Number *</label>
            <input
              id="reservationPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              maxLength={30}
              autoComplete="tel"
              required
            />
          </div>

          <div className="reservation-form-group">
            <label htmlFor="reservationEmail">Email Address</label>
            <input
              id="reservationEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              maxLength={150}
              autoComplete="email"
            />
          </div>

          <div className="reservation-form-row">
            <div className="reservation-form-group">
              <label htmlFor="reservationDate">Reservation Date *</label>
              <input
                id="reservationDate"
                type="date"
                value={date}
                min={getTodayDate()}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="reservation-form-group">
              <label htmlFor="reservationTime">Reservation Time *</label>
              <input
                id="reservationTime"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="reservation-form-group">
            <label htmlFor="reservationGuests">Number of Guests *</label>
            <input
              id="reservationGuests"
              type="number"
              min="1"
              max="100"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              required
            />
          </div>

          <div className="reservation-form-group">
            <label>Are you celebrating a special occasion? *</label>

            <div className="reservation-radio-group">
              <label>
                <input
                  type="radio"
                  name="celebration"
                  value="Yes"
                  checked={celebration === "Yes"}
                  onChange={() => setCelebration("Yes")}
                />
                Yes
              </label>

              <label>
                <input
                  type="radio"
                  name="celebration"
                  value="No"
                  checked={celebration === "No"}
                  onChange={() => {
                    setCelebration("No");
                    setCelebrationType("");
                  }}
                />
                No
              </label>
            </div>
          </div>

          {celebration === "Yes" && (
            <div className="reservation-form-group">
              <label htmlFor="celebrationType">Celebration Type *</label>

              <select
                id="celebrationType"
                value={celebrationType}
                onChange={(e) => setCelebrationType(e.target.value)}
                required
              >
                <option value="">Select celebration type</option>

                {celebrationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="reservation-form-group">
            <label>Food Preferences *</label>

            <p className="reservation-form-hint">
              Select the food options you are interested in.
            </p>

            <div className="reservation-food-options">
              {foodOptions.map((food) => (
                <label key={food}>
                  <input
                    type="checkbox"
                    checked={selectedFoods.includes(food)}
                    onChange={() => handleFoodChange(food)}
                  />
                  {food}
                </label>
              ))}
            </div>
          </div>

          {selectedFoods.includes("Other") && (
            <div className="reservation-form-group">
              <label htmlFor="otherFood">Specify Other Food *</label>

              <input
                id="otherFood"
                type="text"
                value={otherFood}
                onChange={(e) => setOtherFood(e.target.value)}
                placeholder="Specify your food preference"
                maxLength={200}
                required
              />
            </div>
          )}

          <div className="reservation-form-group">
            <label htmlFor="specialRequests">Special Requests</label>

            <textarea
              id="specialRequests"
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              placeholder="Any additional requests or instructions?"
              maxLength={1000}
              rows={4}
            />
          </div>

          {success && (
            <div className="reservation-success-message" role="status">
              {success}
            </div>
          )}

          {error && (
            <div className="reservation-error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="reservation-submit-button"
            disabled={submitting}
          >
            {submitting ? "Submitting Reservation..." : "Book Your Table"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Reservation;
