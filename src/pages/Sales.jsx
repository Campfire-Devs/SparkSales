<<<<<<< HEAD
// import PageTemplate from "../components/ui/PageTemplate";

// function Sales() {
//   return (
//     <PageTemplate
//       title="Sales"
//       icon="💰"
//       description="Manage and track sales transactions made by your business."
//     >
//       <div className="rounded-xl border bg-white p-6 shadow-sm">
//         <h2 className="text-xl font-semibold text-slate-900">
//           Sales
//         </h2>

//         <p className="mt-2 text-slate-600">
//           Your recorded sales transactions will appear here.
//         </p>
//       </div>
//     </PageTemplate>
//   );
// }

// export default Sales;
import { useState, useEffect } from "react";
=======
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

>>>>>>> 3f78591200886f3d9d1882fbbd96160ccfe33811
import PageTemplate from "../components/ui/PageTemplate";
import { useSparkSales } from "../context/SparkSalesContext";
import {
  formatCurrency,
  formatDate,
  SALE_CATEGORIES,
  saleTotal,
} from "../utils/sparkSales";

const emptySale = {
  product: "",
  category: "Snacks",
  quantity: "1",
  unitPrice: "",
  date: new Date().toISOString().slice(0, 10),
  seller: "",
};

function Sales() {
<<<<<<< HEAD
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
  
  // Added 'accent-emerald-600' to force the highlight color where the browser allows it
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
          /* Keep dropdown options with a white background as requested */
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
=======
  const {
    sales,
    addSale,
    updateSale,
    deleteSale,
    totals,
  } = useSparkSales();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [sort, setSort] = useState("newest");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySale);

  const [showForm, setShowForm] = useState(false);
  const [remove, setRemove] = useState(null);

  const filtered = useMemo(() => {
    return sales
      .filter((sale) => {
        const searchText = `${sale.product} ${sale.seller}`.toLowerCase();

        const matchesSearch =
          !search ||
          searchText.includes(search.toLowerCase());

        const matchesCategory =
          category === "All categories" ||
          sale.category === category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sort === "highest") {
          return saleTotal(b) - saleTotal(a);
        }

        if (sort === "oldest") {
          return a.date.localeCompare(b.date);
        }

        return b.date.localeCompare(a.date);
      });
  }, [sales, search, category, sort]);

  const openNew = () => {
    setEditing(null);
    setForm({
      ...emptySale,
      date: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const openEdit = (sale) => {
    setEditing(sale.id);

    setForm({
      ...sale,
      quantity: String(sale.quantity),
      unitPrice: String(sale.unitPrice),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptySale);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    const quantity = Number(form.quantity);
    const unitPrice = Number(form.unitPrice);

    if (!form.product.trim()) {
      return;
    }

    if (!form.seller.trim()) {
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      return;
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return;
    }

    const input = {
      product: form.product.trim(),
      category: form.category,
      quantity,
      unitPrice,
      date: form.date,
      seller: form.seller.trim(),
    };

    if (editing) {
      updateSale(editing, input);
    } else {
      addSale(input);
    }

    closeForm();
  };

  const confirmDelete = () => {
    if (!remove) {
      return;
    }

    deleteSale(remove.id);
    setRemove(null);
  };

  return (
    <>
      <PageTemplate
        title="Sales log"
        description="Every transaction your stall made — searchable, editable and connected to your financial summary."
        action={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#063D35] px-4 text-sm font-bold text-white transition hover:bg-[#052f29]"
          >
            <Plus size={17} />
            New sale
          </button>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Search

            <div className="relative mt-1">
              <Search
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
                size={17}
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Product or seller"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#B8F2E6]"
              />
            </div>
          </label>

          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              "All categories",
              ...SALE_CATEGORIES,
            ]}
          />

          <Select
            label="Sort by"
            value={sort}
            onChange={setSort}
            options={[
              "newest",
              "oldest",
              "highest",
            ]}
            display={(value) =>
              ({
                newest: "Newest first",
                oldest: "Oldest first",
                highest: "Highest value",
              })[value]
            }
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          Showing {filtered.length} of {sales.length} sales{" "}
          <span className="mx-1">·</span>
          <span className="font-semibold text-[#063D35]">
            {formatCurrency(totals.revenue)} revenue
          </span>
        </p>
      </section>

      <section className="mt-4 space-y-2">
        {filtered.map((sale) => (
          <article
            key={sale.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-[#063D35]">
                  {sale.product}
                </h2>

                <span className="rounded-full bg-[#B8F2E6] px-2.5 py-1 text-xs font-bold text-[#063D35]">
                  {sale.category}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {sale.seller} · {formatDate(sale.date)}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {sale.quantity} ×{" "}
                {formatCurrency(sale.unitPrice)}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <strong className="text-lg text-[#063D35]">
                {formatCurrency(saleTotal(sale))}
              </strong>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(sale)}
                  className="rounded-xl border border-slate-200 p-2.5 text-[#063D35] transition hover:bg-[#E6F7F3]"
                  aria-label={`Edit ${sale.product}`}
                  title={`Edit ${sale.product}`}
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => setRemove(sale)}
                  className="rounded-xl border border-red-100 p-2.5 text-red-500 transition hover:bg-red-50"
                  aria-label={`Delete ${sale.product}`}
                  title={`Delete ${sale.product}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </article>
        ))}

        {!filtered.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <div className="mx-auto max-w-sm">
              <p className="font-semibold text-[#063D35]">
                No sales found
              </p>

              <p className="mt-1 text-sm">
                No sales match your current search or category
                filter.
              </p>
            </div>
          </div>
        )}
      </section>

      {showForm && (
        <Modal
          title={editing ? "Edit sale" : "Record a sale"}
          onClose={closeForm}
        >
          <form
            onSubmit={submit}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Input
              label="Product"
              value={form.product}
              set={(value) =>
                updateField("product", value)
              }
              placeholder="e.g. Cookie Boxes"
            />

            <Input
              label="Seller"
              value={form.seller}
              set={(value) =>
                updateField("seller", value)
              }
              placeholder="e.g. Amara"
            />

            <Input
              label="Quantity"
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              set={(value) =>
                updateField("quantity", value)
              }
            />

            <Input
              label="Unit price (R)"
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              set={(value) =>
                updateField("unitPrice", value)
              }
              placeholder="0.00"
            />

            <Input
              label="Date"
              type="date"
              value={form.date}
              set={(value) =>
                updateField("date", value)
              }
            />

            <Select
              label="Category"
              value={form.category}
              onChange={(value) =>
                updateField("category", value)
              }
              options={SALE_CATEGORIES}
            />

            <div className="flex justify-end gap-2 pt-3 sm:col-span-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052f29]"
              >
                {editing
                  ? "Save changes"
                  : "Record sale"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {remove && (
        <Confirm
          title="Delete this sale?"
          text={`Delete ${remove.product} for ${formatCurrency(
            saleTotal(remove)
          )}? This cannot be undone.`}
          onCancel={() => setRemove(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

function Input({
  label,
  value,
  set,
  ...props
}) {
  return (
    <label className="text-sm font-semibold text-[#063D35]">
      {label}

      <input
        {...props}
        required
        value={value}
        onChange={(event) =>
          set(event.target.value)
        }
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#B8F2E6]"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  display,
}) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
      {label}

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-[#063D35] outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#B8F2E6]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {display
              ? display(option)
              : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#063D35]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sales-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2
            id="sales-modal-title"
            className="text-xl font-extrabold text-[#063D35]"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#063D35]"
            aria-label="Close dialog"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Confirm({
  title,
  text,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#063D35]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-sale-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2
          id="delete-sale-title"
          className="text-xl font-extrabold text-[#063D35]"
        >
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {text}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
>>>>>>> 3f78591200886f3d9d1882fbbd96160ccfe33811
  );
}

export default Sales;