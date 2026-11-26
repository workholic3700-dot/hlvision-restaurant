const monthlyRevenue = [
  { month: "January", revenue: 850000 },
  { month: "February", revenue: 1100000 },
  { month: "March", revenue: 950000 },
  { month: "April", revenue: 1400000 },
  { month: "May", revenue: 1250000 },
  { month: "June", revenue: 1650000 },
];

function Reports() {
  const highestRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue),
  );

  return (
    <div className="admin-page-content">
      <div className="admin-page-title">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Monitor restaurant performance and revenue.</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>245</p>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>TSh 8.5M</p>
        </div>

        <div className="stat-card">
          <h3>Completed Orders</h3>
          <p>198</p>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p>12</p>
        </div>
      </div>

      <div className="admin-content-card revenue-card">
        <div className="section-heading">
          <h3>Monthly Revenue Overview</h3>
          <span>January - June</span>
        </div>

        <div className="revenue-chart">
          {monthlyRevenue.map((item) => (
            <div className="revenue-item" key={item.month}>
              <div className="revenue-bar-container">
                <div
                  className="revenue-bar"
                  style={{
                    height: `${(item.revenue / highestRevenue) * 100}%`,
                  }}
                  title={`TSh ${item.revenue.toLocaleString("en-US")}`}
                />
              </div>

              <span>{item.month.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;
