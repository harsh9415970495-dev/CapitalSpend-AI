function BudgetProgress({ total, budget }) {
  const percent = budget
    ? Math.min((total / budget) * 100, 100)
    : 0;

  return (
    <div className="bg-white p-5 rounded-xl shadow mb-6">

      <div className="flex justify-between mb-2">
        <p className="font-medium text-gray-700">
          Budget Usage
        </p>
        <p className="text-sm text-gray-600">
          {percent.toFixed(0)}%
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            percent < 50
              ? "bg-green-500"
              : percent < 80
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm mt-2 text-gray-600">
        ₹{total} spent out of ₹{budget}
      </p>

    </div>
  );
}

export default BudgetProgress; 