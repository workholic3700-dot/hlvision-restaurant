
import { useEffect, useState } from "react";

type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

type DatabaseReservation = {
  id: number;
  customer_name: string;
  phone: string;
  email: string | null;
  reservation_date: string | Date;
  reservation_time: string;
  guests: number;
  celebration: string;
  celebration_type: string | null;
  preferred_food: string[];
  other_food: string | null;
  special_requests: string | null;
  status: ReservationStatus;
  created_at: string;
};

type Reservation = {
  id: number;
  customer: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  celebration: string;
  celebrationType: string;
  preferredFood: string[];
  otherFood: string;
  requests: string;
  status: ReservationStatus;
};

// FORMAT RESERVATION DATE SAFELY
function formatReservationDate(value: string | Date): string {
  if (!value) return "Date unavailable";

  const dateString =
    value instanceof Date
      ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
      : String(value).slice(0, 10);

  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return "Date unavailable";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const filters = [
  "All Reservations",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

function Reservations() {
  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [activeFilter, setActiveFilter] =
    useState("All Reservations");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH RESERVATIONS
  async function fetchReservations() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reservations", {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load reservations."
        );
      }

      if (!Array.isArray(result.reservations)) {
        throw new Error("Invalid reservations data received.");
      }

      const formattedReservations: Reservation[] =
        result.reservations.map(
          (reservation: DatabaseReservation) => ({
            id: reservation.id,
            customer: reservation.customer_name,
            phone: reservation.phone,
            email: reservation.email || "Not provided",

            date: formatReservationDate(
              reservation.reservation_date
            ),

            time: reservation.reservation_time
              ? reservation.reservation_time.slice(0, 5)
              : "Not provided",

            guests: reservation.guests,
            celebration: reservation.celebration,
            celebrationType:
              reservation.celebration_type || "None",

            preferredFood: Array.isArray(
              reservation.preferred_food
            )
              ? reservation.preferred_food
              : [],

            otherFood: reservation.other_food || "None",
            requests: reservation.special_requests || "None",
            status: reservation.status,
          })
        );

      setReservations(formattedReservations);

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  // UPDATE RESERVATION STATUS
  async function updateStatus(
    reservationId: number,
    newStatus: ReservationStatus
  ) {
    const reservation = reservations.find(
      (item) => item.id === reservationId
    );

    if (
      !reservation ||
      reservation.status === "Completed" ||
      reservation.status === "Cancelled"
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/reservations/${reservationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update reservation."
        );
      }

      setReservations((previous) =>
        previous.map((item) =>
          item.id === reservationId
            ? { ...item, status: newStatus }
            : item
        )
      );

    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Status update failed."
      );
    }
  }

  // FILTER RESERVATIONS
  const filteredReservations =
    activeFilter === "All Reservations"
      ? reservations
      : reservations.filter(
          (reservation) =>
            reservation.status === activeFilter
        );

  return (
    <div className="admin-page-content">

      <div className="admin-page-title">
        <div>
          <h2>Reservations Management</h2>
          <p>
            Manage customer table bookings and reservation requests.
          </p>
        </div>
      </div>

      {/* RESERVATION SUMMARY */}
      <div className="order-summary">

        <div>
          <span>Total Reservations</span>
          <strong>{reservations.length}</strong>
        </div>

        <div>
          <span>Pending</span>
          <strong>
            {reservations.filter(
              (r) => r.status === "Pending"
            ).length}
          </strong>
        </div>

        <div>
          <span>Confirmed</span>
          <strong>
            {reservations.filter(
              (r) => r.status === "Confirmed"
            ).length}
          </strong>
        </div>

        <div>
          <span>Completed</span>
          <strong>
            {reservations.filter(
              (r) => r.status === "Completed"
            ).length}
          </strong>
        </div>

      </div>

      {/* FILTER BUTTONS */}
      <div className="order-filters">

        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={
              activeFilter === filter ? "filter-active" : ""
            }
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}

      </div>

      {/* RESERVATIONS TABLE */}
      <div className="admin-content-card">

        <div className="orders-table-heading">

          <div>
            <h3>{activeFilter}</h3>
            <p>
              {filteredReservations.length} reservations found
            </p>
          </div>

          <button
            type="button"
            className="refresh-orders-button"
            onClick={fetchReservations}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Refresh Reservations"}
          </button>

        </div>

        {error && (
          <p style={{ color: "red", padding: "15px" }}>
            {error}
          </p>
        )}

        <div className="orders-table-wrapper">

          <table className="orders-table">

            <thead>
              <tr>
                <th>Reservation ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan={9} className="table-empty">
                    Loading reservations...
                  </td>
                </tr>

              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-empty">
                    No reservations found.
                  </td>
                </tr>

              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id}>

                    <td>
                      #RES{String(reservation.id).padStart(3, "0")}
                    </td>

                    <td>{reservation.customer}</td>

                    <td>{reservation.phone}</td>

                    <td>{reservation.date}</td>

                    <td>{reservation.time}</td>

                    <td>{reservation.guests}</td>

                    <td>
                      <span
                        className={`order-status ${reservation.status.toLowerCase()}`}
                      >
                        {reservation.status}
                      </span>
                    </td>

                    <td>
                      <select
                        className="order-status-select"
                        value={reservation.status}
                        disabled={
                          reservation.status === "Completed" ||
                          reservation.status === "Cancelled"
                        }
                        onChange={(e) =>
                          updateStatus(
                            reservation.id,
                            e.target.value as ReservationStatus
                          )
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td>
                      <details>
                        <summary>View Details</summary>

                        <div
                          style={{
                            minWidth: "220px",
                            padding: "8px",
                          }}
                        >
                          <p>
                            <strong>Email:</strong>{" "}
                            {reservation.email}
                          </p>

                          <p>
                            <strong>Celebration:</strong>{" "}
                            {reservation.celebration}
                          </p>

                          <p>
                            <strong>Type:</strong>{" "}
                            {reservation.celebrationType}
                          </p>

                          <p>
                            <strong>Preferred Food:</strong>{" "}
                            {reservation.preferredFood.join(", ")}
                          </p>

                          <p>
                            <strong>Specific Dishes:</strong>{" "}
                            {reservation.otherFood}
                          </p>

                          <p>
                            <strong>Special Requests:</strong>{" "}
                            {reservation.requests}
                          </p>
                        </div>
                      </details>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Reservations;
