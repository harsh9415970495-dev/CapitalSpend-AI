function StatsCards({ total, remaining, budget, todaySpend }) {

  const percent = budget
    ? Math.min((total / budget) * 100, 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

      {/* TOTAL BUDGET */}
      <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
        <p className="text-gray-600 text-sm font-medium">
          Total Budget
        </p>
        <h2 className="text-2xl font-bold text-gray-900">
          ₹{budget}
        </h2>
      </div>

      {/* REMAINING */}
      <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
        <p className="text-gray-600 text-sm font-medium">
          Remaining
        </p>
        <h2 className="text-2xl font-bold text-green-600">
          ₹{remaining}
        </h2>
      </div>

      {/* TODAY SPEND */}
      <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
        <p className="text-gray-600 text-sm font-medium">
          Today Spend
        </p>
        <h2 className="text-2xl font-bold text-red-500">
          ₹{todaySpend}
        </h2>
      </div>

      {/* DAILY LIMIT */}
      <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
        <p className="text-gray-600 text-sm font-medium">
          Daily Limit
        </p>
        <p>Daily Limit</p>
<h2>
  ₹{remaining > 0 ? Math.floor(remaining / (30 - new Date().getDate() || 1)) : 0}
</h2>
      </div>

    </div>
  );
}

export default StatsCards;