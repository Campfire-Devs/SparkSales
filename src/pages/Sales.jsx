import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

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
  );
}

export default Sales;