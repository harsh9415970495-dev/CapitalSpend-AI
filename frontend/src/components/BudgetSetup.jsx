import { useState } from "react";

function BudgetSetup({ setBudget }) {
  const [input, setInput] = useState("");

  const handleSet = () => {
    setBudget(Number(input));
    setInput("");
  };

  return (
    <div className="flex gap-3">

      <input
        type="number"
        placeholder="Set Budget"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <button
        onClick={handleSet}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        Set Budget
      </button>

    </div>
  );
}

export default BudgetSetup;