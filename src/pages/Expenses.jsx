import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Pencil,
  Plus,
  Receipt,
  Search,
  Tag,
  Trash2,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";

import PageTemplate from "../components/ui/PageTemplate";
import { useSparkSales } from "../context/SparkSalesContext";
import {
  EXPENSE_CATEGORIES,
  formatCurrency,
  formatDate,
} from "../utils/sparkSales";

const createEmptyForm = () => ({
  item: "",
  seller: "",
  category: EXPENSE_CATEGORIES[0] || "Supplies",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
});

function Expenses() {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    totals,
  } = useSparkSales();

  const today = new Date().toISOString().slice(0, 10);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [dateFilter, setDateFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(createEmptyForm());

  const [showModal, setShowModal] = useState(false);
  const [remove, setRemove] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");

  const todayExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) => expense.date === today,
      ),
    [expenses, today],
  );

  const todayTotal = useMemo(
    () =>
      todayExpenses.reduce(
        (sum, expense) =>
          sum + Number(expense.amount || 0),
        0,
      ),
    [todayExpenses],
  );

  const averageExpense = expenses.length
    ? totals.expenses / expenses.length
    : 0;

  const largestExpense = useMemo(
    () =>
      [...expenses].sort(
        (a, b) =>
          Number(b.amount || 0) -
          Number(a.amount || 0),
      )[0] || null,
    [expenses],
  );

  const categoryBreakdown = useMemo(() => {
    const grouped = new Map();

    expenses.forEach((expense) => {
      const key = expense.category || "Other";

      grouped.set(
        key,
        (grouped.get(key) || 0) +
          Number(expense.amount || 0),
      );
    });

    return [...grouped.entries()]
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const topCategory = categoryBreakdown[0] || null;

  const filteredExpenses = useMemo(() => {
    return [...expenses]
      .filter((expense) => {
        const searchValue =
          `${expense.item || ""} ${
            expense.seller || ""
          } ${expense.note || ""} ${
            expense.category || ""
          }`.toLowerCase();

        const matchesSearch =
          !search ||
          searchValue.includes(search.toLowerCase());

        const matchesCategory =
          category === "All categories" ||
          expense.category === category;

        const matchesDate =
          dateFilter === "all" ||
          expense.date === today;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesDate
        );
      })
      .sort((a, b) => {
        if (sort === "highest") {
          return (
            Number(b.amount || 0) -
            Number(a.amount || 0)
          );
        }

        if (sort === "lowest") {
          return (
            Number(a.amount || 0) -
            Number(b.amount || 0)
          );
        }

        if (sort === "oldest") {
          return a.date.localeCompare(b.date);
        }

        return b.date.localeCompare(a.date);
      });
  }, [
    expenses,
    search,
    category,
    dateFilter,
    sort,
    today,
  ]);

  const openNew = () => {
    setEditing(null);
    setForm(createEmptyForm());
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (expense) => {
    setEditing(expense.id);

    setForm({
      item: expense.item || "",
      seller: expense.seller || "",
      category:
        expense.category ||
        EXPENSE_CATEGORIES[0] ||
        "Supplies",
      amount: String(expense.amount ?? ""),
      date: expense.date || today,
      note: expense.note || "",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditing(null);
    setForm(createEmptyForm());
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const amount = Number(form.amount);

    if (!form.item.trim()) {
      setFormError(
        "Please enter an expense description.",
      );
      return;
    }

    if (Number.isNaN(amount) || amount <= 0) {
      setFormError(
        "Please enter an expense amount greater than R0.",
      );
      return;
    }

    if (!form.date) {
      setFormError("Please select an expense date.");
      return;
    }

    const payload = {
      item: form.item.trim(),
      seller: form.seller.trim(),
      category: form.category,
      amount,
      date: form.date,
      note: form.note.trim(),
    };

    try {
      setSaving(true);

      if (editing) {
        await updateExpense(editing, payload);
      } else {
        await addExpense(payload);
      }

      closeModal();
    } catch (error) {
      setFormError(
        error?.message ||
          "We couldn't save this expense. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!remove) return;

    try {
      setDeleting(true);

      await deleteExpense(remove.id);

      setRemove(null);
    } catch (error) {
      console.error(
        "Failed to delete expense:",
        error,
      );
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters =
    Boolean(search) ||
    category !== "All categories" ||
    dateFilter !== "all";

  return (
    <>
      <PageTemplate
        title="Expenses"
        description="Track every cost so your profit figure reflects what your business actually spent."
        action={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#063D35] px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#052F29] hover:shadow-md"
          >
            <Plus size={17} />
            Record expense
          </button>
        }
      />

      {/* ================================================= */}
      {/* KPI CARDS                                          */}
      {/* ================================================= */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total expenses"
          value={formatCurrency(totals.expenses)}
          detail={`${expenses.length} recorded costs`}
          icon={Receipt}
          primary
        />

        <MetricCard
          label="Spent today"
          value={formatCurrency(todayTotal)}
          detail={`${todayExpenses.length} expenses today`}
          icon={CalendarDays}
        />

        <MetricCard
          label="Average expense"
          value={formatCurrency(averageExpense)}
          detail="Average recorded cost"
          icon={CircleDollarSign}
        />

        <MetricCard
          label="Largest expense"
          value={
            largestExpense
              ? formatCurrency(largestExpense.amount)
              : "R 0.00"
          }
          detail={
            largestExpense
              ? largestExpense.item
              : "No expenses yet"
          }
          icon={TrendingDown}
        />
      </section>

      {/* ================================================= */}
      {/* SPENDING SNAPSHOT                                  */}
      {/* ================================================= */}

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Spending snapshot
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
              Where your business is spending
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep an eye on the categories consuming the
              most of your budget.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <SummaryChip
              icon={Tag}
              label="Top category"
              value={
                topCategory
                  ? topCategory.name
                  : "No data"
              }
              detail={
                topCategory
                  ? formatCurrency(topCategory.amount)
                  : "Start recording expenses"
              }
            />

            <SummaryChip
              icon={BarChart3}
              label="Expense share"
              value={
                totals.revenue
                  ? `${(
                      (totals.expenses /
                        totals.revenue) *
                      100
                    ).toFixed(1)}%`
                  : "0.0%"
              }
              detail="of current revenue"
            />
          </div>
        </div>

        {categoryBreakdown.length > 0 && (
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categoryBreakdown
              .slice(0, 6)
              .map((entry) => {
                const percentage =
                  totals.expenses > 0
                    ? (entry.amount /
                        totals.expenses) *
                      100
                    : 0;

                return (
                  <div
                    key={entry.name}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-bold text-slate-700">
                        {entry.name}
                      </span>

                      <span className="shrink-0 text-sm font-extrabold text-[#063D35]">
                        {formatCurrency(
                          entry.amount,
                        )}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#7FCFC0]"
                        style={{
                          width: `${Math.min(
                            percentage,
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                      {percentage.toFixed(1)}% of
                      total spending
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* ================================================= */}
      {/* FILTERS                                            */}
      {/* ================================================= */}

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="flex-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Search expenses

              <div className="relative mt-1.5">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-3 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search item, seller, category or note..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#7FCFC0] focus:bg-white focus:ring-4 focus:ring-[#7FCFC0]/10"
                />
              </div>
            </label>

            <FilterSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={[
                "All categories",
                ...EXPENSE_CATEGORIES,
              ]}
            />

            <FilterSelect
              label="View"
              value={dateFilter}
              onChange={setDateFilter}
              options={["all", "today"]}
              display={(value) =>
                value === "today"
                  ? "Today only"
                  : "All dates"
              }
            />

            <FilterSelect
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                "newest",
                "oldest",
                "highest",
                "lowest",
              ]}
              display={(value) =>
                ({
                  newest: "Newest first",
                  oldest: "Oldest first",
                  highest: "Highest value",
                  lowest: "Lowest value",
                })[value]
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-800">
              {filteredExpenses.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-800">
              {expenses.length}
            </span>{" "}
            expenses
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All categories");
                setDateFilter("all");
              }}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#063D35] hover:underline"
            >
              <X size={15} />
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* ================================================= */}
      {/* EXPENSE HISTORY                                    */}
      {/* ================================================= */}

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Expense history
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
              Spending activity
            </h2>
          </div>

          <div className="hidden rounded-full bg-[#E6F7F3] px-3 py-1.5 text-xs font-bold text-[#063D35] sm:block">
            {filteredExpenses.length} visible
          </div>
        </div>

        {filteredExpenses.length ? (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Expense
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Seller
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-[#F7FAF9]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <Receipt size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {expense.item}
                            </p>

                            {expense.note ? (
                              <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                {expense.note}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-slate-400">
                                Business expense
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {expense.seller || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {formatDate(expense.date)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#B8F2E6] px-2.5 py-1 text-[11px] font-bold text-[#063D35]">
                          {expense.category || "Other"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <p className="font-extrabold text-red-500">
                          −{formatCurrency(expense.amount)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton
                            label={`Edit ${expense.item}`}
                            onClick={() =>
                              openEdit(expense)
                            }
                          >
                            <Pencil size={16} />
                          </IconButton>

                          <IconButton
                            label={`Delete ${expense.item}`}
                            danger
                            onClick={() =>
                              setRemove(expense)
                            }
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredExpenses.map((expense) => (
                <article
                  key={expense.id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <Receipt size={17} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-900">
                          {expense.item}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {expense.seller ||
                            "Business expense"}{" "}
                          ·{" "}
                          {formatDate(
                            expense.date,
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 font-extrabold text-red-500">
                      −
                      {formatCurrency(
                        expense.amount,
                      )}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#B8F2E6] px-2.5 py-1 text-xs font-bold text-[#063D35]">
                      {expense.category ||
                        "Other"}
                    </span>

                    {expense.note && (
                      <span className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {expense.note}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <IconButton
                      label={`Edit ${expense.item}`}
                      onClick={() =>
                        openEdit(expense)
                      }
                    >
                      <Pencil size={16} />
                    </IconButton>

                    <IconButton
                      label={`Delete ${expense.item}`}
                      danger
                      onClick={() =>
                        setRemove(expense)
                      }
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            hasFilters={hasFilters}
            onRecordExpense={openNew}
          />
        )}
      </section>

      {/* ================================================= */}
      {/* EXPENSE MODAL                                      */}
      {/* ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#063D35]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#43A99A]">
                  {editing
                    ? "Update expense"
                    : "New expense"}
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-[#063D35]">
                  {editing
                    ? "Edit expense"
                    : "Record an expense"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close expense dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >
              {formError && (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Expense description"
                  placeholder="e.g. Packaging materials"
                  value={form.item}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      item: value,
                    }))
                  }
                  required
                  autoFocus
                />

                <InputField
                  label="Seller / supplier"
                  placeholder="e.g. Shoprite"
                  value={form.seller}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      seller: value,
                    }))
                  }
                />

                <SelectField
                  label="Category"
                  value={form.category}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                  options={EXPENSE_CATEGORIES}
                />

                <InputField
                  label="Amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  prefix="R"
                  value={form.amount}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      amount: value,
                    }))
                  }
                  required
                />

                <InputField
                  label="Expense date"
                  type="date"
                  value={form.date}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      date: value,
                    }))
                  }
                  required
                />

                <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                  Note
                  <textarea
                    value={form.note}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        note: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Optional note about this expense..."
                    className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7FCFC0] focus:ring-4 focus:ring-[#7FCFC0]/10"
                  />
                </label>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-red-100 bg-red-50/60">
                <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
                      Expense total
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Amount that will be deducted from
                      your business performance.
                    </p>
                  </div>

                  <strong className="text-2xl font-black text-red-500">
                    {formatCurrency(
                      Number(form.amount || 0),
                    )}
                  </strong>
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063D35] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#052F29] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ClipboardList size={16} />
                      {editing
                        ? "Save changes"
                        : "Record expense"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* DELETE CONFIRMATION                               */}
      {/* ================================================= */}

      {remove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#063D35]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-slate-900">
              Delete this expense?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You're about to delete{" "}
              <span className="font-bold text-slate-800">
                {remove.item}
              </span>{" "}
              worth{" "}
              <span className="font-bold text-red-500">
                {formatCurrency(remove.amount)}
              </span>
              . This cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRemove(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete expense
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================================= */
/* REUSABLE COMPONENTS                                      */
/* ========================================================= */

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  primary = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
        primary
          ? "border-[#0B6156] bg-[#063D35] text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-[0.14em] ${
              primary
                ? "text-[#B8F2E6]"
                : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-2 text-2xl font-black tracking-tight ${
              primary
                ? "text-white"
                : "text-[#063D35]"
            }`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-xs font-medium ${
              primary
                ? "text-slate-300"
                : "text-slate-500"
            }`}
          >
            {detail}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            primary
              ? "bg-white/10 text-[#B8F2E6]"
              : "bg-[#E6F7F3] text-[#063D35]"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function SummaryChip({
  icon: Icon,
  label,
  value,
  detail,
}) {
  return (
    <div className="flex min-w-[180px] items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#063D35] shadow-sm">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">
          {label}
        </p>

        <p className="truncate text-sm font-extrabold text-slate-800">
          {value}
        </p>

        <p className="text-[11px] font-medium text-slate-400">
          {detail}
        </p>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  display,
}) {
  return (
    <label className="min-w-[150px] text-xs font-bold uppercase tracking-wider text-slate-400">
      {label}

      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#7FCFC0] focus:bg-white focus:ring-4 focus:ring-[#7FCFC0]/10"
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {display ? display(option) : option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-3 text-slate-400"
        />
      </div>
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  prefix,
  ...props
}) {
  return (
    <label className="text-sm font-bold text-slate-700">
      {label}

      <div className="relative mt-1.5">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
            {prefix}
          </span>
        )}

        <input
          {...props}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7FCFC0] focus:ring-4 focus:ring-[#7FCFC0]/10 ${
            prefix ? "pl-8" : ""
          }`}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="text-sm font-bold text-slate-700">
      {label}

      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-800 outline-none transition focus:border-[#7FCFC0] focus:ring-4 focus:ring-[#7FCFC0]/10"
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-3 text-slate-400"
        />
      </div>
    </label>
  );
}

function IconButton({
  children,
  label,
  danger = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        danger
          ? "border-red-100 text-red-500 hover:bg-red-50"
          : "border-slate-200 text-[#063D35] hover:bg-[#E6F7F3]"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  hasFilters,
  onRecordExpense,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F7F3] text-[#063D35]">
        {hasFilters ? (
          <Search size={24} />
        ) : (
          <Wallet size={24} />
        )}
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-slate-900">
        {hasFilters
          ? "No expenses match your filters"
          : "Your expense log is empty"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try adjusting your search or filters to find the expense you're looking for."
          : "Record your business costs so SparkSales can calculate a more accurate profit figure."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onRecordExpense}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052F29]"
        >
          <Plus size={16} />
          Record your first expense
        </button>
      )}
    </div>
  );
}

export default Expenses;