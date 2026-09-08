import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

import PageTemplate from "../components/ui/PageTemplate";
import { useSparkSales } from "../context/SparkSalesContext";
import {
  EXPENSE_CATEGORIES,
  formatCurrency,
  formatDate,
} from "../utils/sparkSales";

const emptyExpense = {
  item: "",
  category: "Supplies",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

function Expenses() {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    totals,
  } = useSparkSales();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyExpense);

  const [showForm, setShowForm] = useState(false);
  const [remove, setRemove] = useState(null);

  const filtered = useMemo(() => {
    return expenses
      .filter((expense) => {
        const searchText = `${expense.item} ${
          expense.note || ""
        }`.toLowerCase();

        const matchesSearch =
          !search ||
          searchText.includes(search.toLowerCase());

        const matchesCategory =
          category === "All categories" ||
          expense.category === category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, search, category]);

  const openNew = () => {
    setEditing(null);
    setForm({
      ...emptyExpense,
      date: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const openEdit = (expense) => {
    setEditing(expense.id);

    setForm({
      ...expense,
      amount: String(expense.amount),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyExpense);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!form.item.trim()) {
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      return;
    }

    const input = {
      item: form.item.trim(),
      category: form.category,
      amount,
      date: form.date,
      note: form.note.trim(),
    };

    if (editing) {
      updateExpense(editing, input);
    } else {
      addExpense(input);
    }

    closeForm();
  };

  const confirmDelete = () => {
    if (!remove) {
      return;
    }

    deleteExpense(remove.id);
    setRemove(null);
  };

  const expenseShare =
    totals.revenue > 0
      ? ((totals.expenses / totals.revenue) * 100).toFixed(1)
      : "0.0";

  return (
    <>
      <PageTemplate
        title="Expenses"
        description="Track every cost so your profit figure is honest."
        action={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#063D35] px-4 text-sm font-bold text-white transition hover:bg-[#052f29]"
          >
            <Plus size={17} />
            Add expense
          </button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Total spent"
          value={formatCurrency(totals.expenses)}
        />

        <Stat
          label="Share of revenue"
          value={`${expenseShare}%`}
        />

        <Stat
          label="Gross profit left"
          value={formatCurrency(totals.grossProfit)}
          positive={totals.grossProfit >= 0}
        />
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
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
                placeholder="Item or note"
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
              ...EXPENSE_CATEGORIES,
            ]}
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          Showing {filtered.length} of {expenses.length} expenses{" "}
          <span className="mx-1">·</span>
          <span className="font-semibold text-[#063D35]">
            {formatCurrency(totals.expenses)}
          </span>
        </p>
      </section>

      <section className="mt-4 space-y-2">
        {filtered.map((expense) => (
          <article
            key={expense.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-[#063D35]">
                  {expense.item}
                </h2>

                <span className="rounded-full bg-[#B8F2E6] px-2.5 py-1 text-xs font-bold text-[#063D35]">
                  {expense.category}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {formatDate(expense.date)}
                {expense.note
                  ? ` · ${expense.note}`
                  : ""}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <strong className="text-lg text-red-500">
                −{formatCurrency(expense.amount)}
              </strong>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(expense)}
                  className="rounded-xl border border-slate-200 p-2.5 text-[#063D35] transition hover:bg-[#E6F7F3]"
                  aria-label={`Edit ${expense.item}`}
                  title={`Edit ${expense.item}`}
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => setRemove(expense)}
                  className="rounded-xl border border-red-100 p-2.5 text-red-500 transition hover:bg-red-50"
                  aria-label={`Delete ${expense.item}`}
                  title={`Delete ${expense.item}`}
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
                No expenses found
              </p>

              <p className="mt-1 text-sm">
                No expenses match your current search or
                category filter.
              </p>
            </div>
          </div>
        )}
      </section>

      {showForm && (
        <Modal
          title={
            editing
              ? "Edit expense"
              : "Record an expense"
          }
          onClose={closeForm}
        >
          <form
            onSubmit={submit}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Input
              label="Item"
              value={form.item}
              set={(value) =>
                updateField("item", value)
              }
              placeholder="e.g. Craft beads"
            />

            <Select
              label="Category"
              value={form.category}
              onChange={(value) =>
                updateField("category", value)
              }
              options={EXPENSE_CATEGORIES}
            />

            <Input
              label="Amount (R)"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              set={(value) =>
                updateField("amount", value)
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

            <label className="text-sm font-semibold text-[#063D35] sm:col-span-2">
              Note

              <textarea
                value={form.note}
                onChange={(event) =>
                  updateField(
                    "note",
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Optional note"
                className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#B8F2E6]"
              />
            </label>

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
                  : "Add expense"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {remove && (
        <Confirm
          title="Delete this expense?"
          text={`Delete ${
            remove.item
          } for ${formatCurrency(
            remove.amount
          )}? This cannot be undone.`}
          onCancel={() => setRemove(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

function Stat({ label, value, positive = true }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-extrabold ${
          positive
            ? "text-[#063D35]"
            : "text-red-500"
        }`}
      >
        {value}
      </p>
    </div>
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
            {option}
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
      aria-labelledby="expense-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2
            id="expense-modal-title"
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
      aria-labelledby="delete-expense-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2
          id="delete-expense-title"
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

export default Expenses;