// import PageTemplate from "../components/ui/PageTemplate";

// function Expenses() {
//   return (
//     <PageTemplate
//       title="Expenses"
//       icon="💳"
//       description="Track and manage your business expenses."
//     >
//       <div className="rounded-xl border bg-white p-6 shadow-sm">
//         <h2 className="text-xl font-semibold text-slate-900">
//           Expenses
//         </h2>

//         <p className="mt-2 text-slate-600">
//           Your recorded business expenses will appear here.
//         </p>
//       </div>
//     </PageTemplate>
//   );
// }

// export default Expenses;


import { useState, useEffect } from "react";
import PageTemplate from "../components/ui/PageTemplate";

function Expenses() {
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem("expenses")) || []);
  const [name, setName] = useState("");
  const [seller, setSeller] = useState(""); 
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Supplies");
  const [search, setSearch] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null); 
  const [showForm, setShowForm] = useState(false);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editSeller, setEditSeller] = useState(""); 
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Supplies");

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newExpense = {
      name,
      seller: seller || "General/Stall", 
      amount: Number(amount),
      category,
      date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setExpenses([...expenses, newExpense]);
    setName("");
    setSeller(""); 
    setAmount("");
    setCategory("Supplies");
    setShowForm(false);
  };

  const handleDeleteClick = (index) => setDeleteIndex(index);

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      setExpenses(expenses.filter((_, i) => i !== deleteIndex));
      if (editingIndex === deleteIndex) setEditingIndex(null);
      setDeleteIndex(null);
    }
  };

  const toggleEdit = (index) => {
    if (editingIndex === index) {
      setEditingIndex(null);
    } else {
      const expense = expenses[index];
      setEditingIndex(index);
      setEditName(expense.name);
      setEditSeller(expense.seller || ""); 
      setEditAmount(expense.amount);
      setEditCategory(expense.category);
    }
  };

  const saveEdit = (e) => {
    e.preventDefault();
    const updatedExpense = {
      ...expenses[editingIndex],
      name: editName,
      seller: editSeller || "General/Stall", 
      amount: Number(editAmount),
      category: editCategory,
    };
    const updatedExpenses = [...expenses];
    updatedExpenses[editingIndex] = updatedExpense;
    setExpenses(updatedExpenses);
    setEditingIndex(null);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const nameMatch = (expense.name || "").toLowerCase().includes(search.toLowerCase());
    const sellerMatch = (expense.seller || "").toLowerCase().includes(search.toLowerCase());
    return nameMatch || sellerMatch;
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // --- REUSABLE STYLES ---
  const btnPrimary = "rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-emerald-800 hover:shadow-md hover:shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-2";
  const btnSecondary = "rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200 active:scale-95";
  const btnDanger = "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md hover:shadow-red-500/30 active:scale-95";
  
  // Updated inputClass to include accent-emerald-600
  const inputClass = "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white accent-emerald-600";

  return (
    <PageTemplate
      title={
        <span className="bg-gradient-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent drop-shadow-sm transition-all duration-300 hover:tracking-wider cursor-default">
          Expenses log
        </span>
      }
      description="Track and manage your business expenses — searchable, editable and connected to your financial summary."
    >
      {/* Injected Custom CSS for the Darker, Slower 4-Color Flowing Gradient AND Green Select Highlights */}
      <style>
        {`
          @keyframes gradientFlowDark {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animated-gradient-dark {
            background: linear-gradient(-45deg, #063035, #0A4A52, #136A70, #0A4A52, #063035);
            background-size: 400% 400%;
            animation: gradientFlowDark 25s ease infinite;
          }
          /* Force green background on selected options where supported */
          select option {
            background-color: #ecfdf5 !important; /* emerald-50 */
            color: #064e3b !important; /* emerald-900 */
          }
        `}
      </style>

      {/* Main Content Wrapper with the Dark Gradient */}
      <div 
        className="rounded-2xl p-1 animated-gradient-dark relative overflow-hidden shadow-xl"
        style={{ minHeight: '80vh' }}
      >
        <div className="space-y-6 relative z-10 p-4 sm:p-6">
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search expense or seller..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 ${inputClass}`}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-800 font-medium hidden sm:block bg-white/95 px-3 py-1 rounded-full shadow-sm">
                Showing <span className="font-bold">{filteredExpenses.length}</span> of <span className="font-bold">{expenses.length}</span> expenses · <span className="font-bold text-red-600">R {totalSpent.toFixed(2)}</span>
              </span>
              <button
                onClick={() => { setShowForm(!showForm); setEditingIndex(null); }}
                className={`w-full sm:w-auto ${showForm ? btnSecondary : btnPrimary}`}
              >
                {!showForm && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                {showForm ? "Cancel" : "New expense"}
              </button>
            </div>
          </div>

          {/* Record Expense Form */}
          {showForm && (
            <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Record New Expense</h2>
              <form onSubmit={addExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Expense name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
                <input type="text" placeholder="Seller / Company linked" value={seller} onChange={(e) => setSeller(e.target.value)} className={inputClass} />
                <input type="number" placeholder="Amount (R)" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} required />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  <option>Supplies</option><option>Marketing</option><option>Transport</option><option>Ingredients</option><option>Stall Fees</option><option>Other</option>
                </select>
                <button type="submit" className={`sm:col-span-2 ${btnPrimary}`}>
                  Save Expense
                </button>
              </form>
            </div>
          )}

          {/* Expenses List */}
          <div className="space-y-3">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 bg-white/95 rounded-xl border border-emerald-100 border-dashed">
                <p className="text-slate-500">No expenses found. Click "New expense" to get started.</p>
              </div>
            ) : (
              filteredExpenses.map((expense, index) => (
                <div key={index} className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{expense.name}</h4>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{expense.category}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{expense.seller || "General/Stall"} · {expense.date}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                    <span className="font-semibold text-red-600 text-lg">- R {expense.amount.toFixed(2)}</span>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleEdit(index)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteClick(index)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Expense</h3>
            <form onSubmit={saveEdit} className="flex flex-col gap-4">
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} placeholder="Expense name" required />
              <input type="text" value={editSeller} onChange={(e) => setEditSeller(e.target.value)} className={inputClass} placeholder="Seller / Company" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className={inputClass} placeholder="Amount" required />
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass}>
                  <option>Supplies</option><option>Marketing</option><option>Transport</option><option>Ingredients</option><option>Stall Fees</option><option>Other</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="submit" className={`flex-1 ${btnPrimary}`}>Save Changes</button>
                <button type="button" onClick={() => setEditingIndex(null)} className={`flex-1 ${btnSecondary}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-slate-500 mb-6">Do you really want to delete this expense? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={confirmDelete} className={btnDanger}>Yes, Delete</button>
              <button onClick={() => setDeleteIndex(null)} className={btnSecondary}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}

export default Expenses;