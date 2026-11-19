import { useState } from "react";

type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
};

const sampleCustomers: Customer[] = [
  {
    id: 1,
    name: "John Michael",
    phone: "+255 712 345 678",
    email: "john@example.com",
    totalOrders: 8,
    totalSpent: 185000
  },
  {
    id: 2,
    name: "Sarah James",
    phone: "+255 754 123 456",
    email: "sarah@example.com",
    totalOrders: 5,
    totalSpent: 120000
  },
  {
    id: 3,
    name: "David Peter",
    phone: "+255 765 987 321",
    email: "david@example.com",
    totalOrders: 3,
    totalSpent: 75000
  }
];

function Customers() {
  const [customers] = useState<Customer[]>(sampleCustomers);
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-page-content">
      <div className="admin-page-title">
        <div>
          <h2>Customers</h2>
          <p>View and manage restaurant customers.</p>
        </div>
      </div>

      <div className="order-summary">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{customers.length}</p>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="section-heading">
          <h3>Customer Directory</h3>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email}</td>
                  <td>{customer.totalOrders}</td>
                  <td>
                    TSh {customer.totalSpent.toLocaleString("en-US")}
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="table-empty">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Customers;