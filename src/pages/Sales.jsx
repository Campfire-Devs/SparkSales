import { useState, useEffect } from "react";
import PageTemplate from "../components/ui/PageTemplate";

function Sales() {
  const [sales, setSales] = useState(() => JSON.parse(localStorage.getItem("sales")) || []);
  const [product, setProduct] = useState("");
  const [seller, setSeller] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(""); 
  const [search, setSearch] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null); 
  const [showForm, setShowForm] = useState(false);

  // Edit state
  const [editProduct, setEditProduct] = useState("");
  const [editSeller, setEditSeller] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("Snacks");

  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  const addSale = (e) => {
    e.preventDefault();
    if (!product || !quantity || !price || !category) return;

    const total = Number(quantity) * Number(price);
    const newSale = {
      product,
      seller: seller || "Unknown",
      quantity: Number(quantity),
      price: Number(price),
      total,
      category,
      date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setSales([...sales, newSale]);
    setProduct("");
    setSeller("");
    setQuantity("");
    setPrice("");
    setCategory(""); 
    setShowForm(false);
  };

  const handleDeleteClick = (index) => setDeleteIndex(index);

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      setSales(sales.filter((_, i) => i !== deleteIndex));
      if (editingIndex === deleteIndex) setEditingIndex(null);
      setDeleteIndex(null);
    }
  };

  const toggleEdit = (index) => {
    if (editingIndex === index) {
      setEditingIndex(null);
    } else {
      const sale = sales[index];
      setEditingIndex(index);
      setEditProduct(sale.product);
      setEditSeller(sale.seller);
      setEditQuantity(sale.quantity);
      setEditPrice(sale.price);
      setEditCategory(sale.category);
    }
  };

  const saveEdit = (e) => {
    e.preventDefault();
    const updatedSale = {
      ...sales[editingIndex],
      product: editProduct,
      seller: editSeller,
      quantity: Number(editQuantity),
      price: Number(editPrice),
      total: Number(editQuantity) * Number(editPrice),
      category: editCategory,
    };
    const updatedSales = [...sales];
    updatedSales[editingIndex] = updatedSale;
    setSales(updatedSales);
    setEditingIndex(null);
  };

  const filteredSales = sales.filter((sale) => {
    const productMatch = (sale.product || "").toLowerCase().includes(search.toLowerCase());
    const sellerMatch = (sale.seller || "").toLowerCase().includes(search.toLowerCase());
    return productMatch || sellerMatch;
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  // --- REUSABLE STYLES ---
  const btnPrimary = "rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-emerald-800 hover:shadow-md hover:shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-2";
  const btnSecondary = "rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200 active:scale-95";
  const btnDanger = "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md hover:shadow-red-500/30 active:scale-95";
  
  const inputClass = "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white accent-emerald-600";
  const selectClass = `${inputClass} text-emerald-700 border-emerald-300 font-medium`;

  return (
    <PageTemplate
      title={
        <span className="bg-gradient-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent drop-shadow-sm transition-all duration-300 hover:tracking-wider cursor-default">
          Sales log
        </span>
      }
      description="Every transaction your stall made — searchable, editable and connected to your financial summary."
    >
      {/* Custom CSS for Gradient and Dropdown Highlight */}
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
          select option {
            background-color: white;
            color: #1e293b;
          }
        `}
      </style>

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
                placeholder="Search product or seller..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 ${inputClass}`}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-800 font-medium hidden sm:block bg-white/95 px-3 py-1 rounded-full shadow-sm">
                Showing <span className="font-bold">{filteredSales.length}</span> of <span className="font-bold">{sales.length}</span> sales · <span className="font-bold text-emerald-700">R {totalRevenue.toFixed(2)}</span>
              </span>
              <button
                onClick={() => { setShowForm(!showForm); setEditingIndex(null); setCategory(""); }}
                className={`w-full sm:w-auto ${showForm ? btnSecondary : btnPrimary}`}
              >
                {!showForm && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                {showForm ? "Cancel" : "New sale"}
              </button>
            </div>
          </div>

          {/* Record Sale Form */}
          {showForm && (
            <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Record New Sale</h2>
              <form onSubmit={addSale} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Product name" value={product} onChange={(e) => setProduct(e.target.value)} className={inputClass} required />
                <input type="text" placeholder="Seller name" value={seller} onChange={(e) => setSeller(e.target.value)} className={inputClass} />
                <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} required />
                <input type="number" placeholder="Price (R)" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} required />
                
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className={selectClass} 
                  required
                >
                  <option value="" disabled className="text-emerald-700">Type of product / service</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Crafts">Crafts</option>
                  <option value="Merch">Merch</option>
                  <option value="Services">Services</option>
                </select>

                <button type="submit" className={`sm:col-span-2 ${btnPrimary}`}>
                  Save Sale
                </button>
              </form>
            </div>
          )}

          {/* Sales List */}
          <div className="space-y-3">
            {filteredSales.length === 0 ? (
              <div className="text-center py-12 bg-white/95 rounded-xl border border-emerald-100 border-dashed">
                <p className="text-slate-500">No sales found. Click "New sale" to get started.</p>
              </div>
            ) : (
              filteredSales.map((sale, index) => (
                <div key={index} className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{sale.product}</h4>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{sale.category}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{sale.seller} · {sale.date}</p>
                    <p className="text-sm text-slate-500">{sale.quantity} × R{sale.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                    <span className="font-semibold text-slate-900 text-lg">R {sale.total.toFixed(2)}</span>
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
            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Sale</h3>
            <form onSubmit={saveEdit} className="flex flex-col gap-4">
              <input type="text" value={editProduct} onChange={(e) => setEditProduct(e.target.value)} className={inputClass} placeholder="Product" required />
              <input type="text" value={editSeller} onChange={(e) => setEditSeller(e.target.value)} className={inputClass} placeholder="Seller" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} className={inputClass} placeholder="Qty" required />
                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className={inputClass} placeholder="Price" required />
              </div>
              
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={selectClass}>
                <option value="Snacks">Snacks</option>
                <option value="Drinks">Drinks</option>
                <option value="Crafts">Crafts</option>
                <option value="Merch">Merch</option>
                <option value="Services">Services</option>
              </select>
              
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
            <p className="text-sm text-slate-500 mb-6">Do you really want to delete this sale? This action cannot be undone.</p>
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

export default Sales;