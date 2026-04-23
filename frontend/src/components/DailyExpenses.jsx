function DailyExpenses({ expenses }) {

  // 📅 group by date
  const grouped = {};

  expenses.forEach((e) => {
    if (!grouped[e.date]) {
      grouped[e.date] = [];
    }
    grouped[e.date].push(e);
  });

  const sortedDates = Object.keys(grouped).sort().reverse();

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6">

      <h2 className="font-semibold mb-4">
        📅 Daily Expenses Timeline
      </h2>

      {sortedDates.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No expenses yet 🚀
        </p>
      ) : (
        sortedDates.map((date) => {
          const total = grouped[date].reduce(
            (sum, e) => sum + e.amount,
            0
          );

          return (
            <div key={date} className="mb-4">

              {/* DATE HEADER */}
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">
                  {date}
                </p>
                <p className="text-sm font-bold text-blue-600">
                  ₹{total}
                </p>
              </div>

              {/* EXPENSES */}
              <div className="space-y-2">
                {grouped[date].map((e, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 p-2 rounded flex justify-between"
                  >
                    <span>
                      {e.category} • {e.note || "No note"}
                    </span>
                    <span className="font-semibold">
                      ₹{e.amount}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          );
        })
      )}

    </div>
  );
}

export default DailyExpenses;