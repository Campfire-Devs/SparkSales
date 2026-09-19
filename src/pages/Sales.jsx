import { useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  Pencil,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import PageTemplate from "../components/ui/PageTemplate";
import { useSparkSales } from "../context/SparkSalesContext";
import {
  formatCurrency,
  formatDate,
  SALE_CATEGORIES,
  saleTotal,
} from "../utils/sparkSales";

const PAYMENT_METHODS = ["Cash", "Card", "EFT"];

const EMPTY_FORM = {
  product: "",
  category: SALE_CATEGORIES[0] || "Snacks",
  seller: "",
  quantity: "1",
  unitPrice: "",
  paymentMethod: "Cash",
  date: new Date().toISOString().slice(0, 10),
};

function Sales() {
  const {
    sales,
    addSale,
    updateSale,
    deleteSale,
    totals,
  } = useSparkSales();

  const today = new Date().toISOString().slice(0, 10);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [paymentMethod, setPaymentMethod] = useState("All methods");
  const [dateFilter, setDateFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [showModal, setShowModal] = useState(false);
  const [remove, setRemove] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");

  const filteredSales = useMemo(() => {
    return [...sales]
      .filter((sale) => {
        const searchValue = `${sale.product || ""} ${
          sale.seller || ""
        } ${sale.paymentMethod || ""}`.toLowerCase();

        const matchesSearch =
          !search ||
          searchValue.includes(search.toLowerCase());

        const matchesCategory =
          category === "All categories" ||
          sale.category === category;

        const matchesPayment =
          paymentMethod === "All methods" ||
          sale.paymentMethod === paymentMethod;

        const matchesDate =
          dateFilter === "all" ||
          sale.date === today;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesPayment &&
          matchesDate
        );
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
  }, [
    sales,
    search,
    category,
    paymentMethod,
    dateFilter,
    sort,
    today,
  ]);

  const todaySales = useMemo(
    () => sales.filter((sale) => sale.date === today),
    [sales, today],
  );

  const todayRevenue = useMemo(
    () =>
      todaySales.reduce(
        (sum, sale) => sum + saleTotal(sale),
        0,
      ),
    [todaySales],
  );

  const cashRevenue = useMemo(
    () =>
      sales
        .filter((sale) => sale.paymentMethod === "Cash")
        .reduce(
          (sum, sale) => sum + saleTotal(sale),
          0,
        ),
    [sales],
  );

  const cardRevenue = useMemo(
    () =>
      sales
        .filter((sale) => sale.paymentMethod === "Card")
        .reduce(
          (sum, sale) => sum + saleTotal(sale),
          0,
        ),
    [sales],
  );

  const eftRevenue = useMemo(
    () =>
      sales
        .filter((sale) => sale.paymentMethod === "EFT")
        .reduce(
          (sum, sale) => sum + saleTotal(sale),
          0,
        ),
    [sales],
  );

  const liveFormTotal =
    Number(form.quantity || 0) *
    Number(form.unitPrice || 0);

  const openNew = () => {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      date: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (sale) => {
    setEditing(sale.id);

    setForm({
      product: sale.product || "",
      category: sale.category || SALE_CATEGORIES[0],
      seller: sale.seller || "",
      quantity: String(sale.quantity ?? 1),
      unitPrice: String(sale.unitPrice ?? ""),
      paymentMethod: sale.paymentMethod || "Cash",
      date: sale.date || today,
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const quantity = Number(form.quantity);
    const unitPrice = Number(form.unitPrice);

    if (!form.product.trim()) {
      setFormError("Please enter a product or service.");
      return;
    }

    if (!quantity || quantity < 1) {
      setFormError("Quantity must be at least 1.");
      return;
    }

    if (unitPrice < 0 || Number.isNaN(unitPrice)) {
      setFormError("Please enter a valid unit price.");
      return;
    }

    if (!form.date) {
      setFormError("Please select a sale date.");
      return;
    }

    const payload = {
      product: form.product.trim(),
      category: form.category,
      seller: form.seller.trim(),
      quantity,
      unitPrice,
      paymentMethod: form.paymentMethod,
      date: form.date,
    };

    try {
      setSaving(true);

      if (editing) {
        await updateSale(editing, payload);
      } else {
        await addSale(payload);
      }

      closeModal();
    } catch (error) {
      setFormError(
        error?.message ||
          "We couldn't save this sale. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!remove) return;

    try {
      setDeleting(true);
      await deleteSale(remove.id);
      setRemove(null);
    } catch (error) {
      console.error("Failed to delete sale:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageTemplate
        title="Sales"
        description="Record every transaction and keep your financial picture up to date."
        action={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#063D35] px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#052F29] hover:shadow-md"
          >
            <Plus size={17} />
            Record sale
          </button>
        }
      />

      {/* -------------------------------------------------- */}
      {/* KPI CARDS                                           */}
      {/* -------------------------------------------------- */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total revenue"
          value={formatCurrency(totals.revenue)}
          detail={`${sales.length} total transactions`}
          icon={Receipt}
          primary
        />

        <MetricCard
          label="Today's revenue"
          value={formatCurrency(todayRevenue)}
          detail={`${todaySales.length} sales today`}
          icon={CalendarDays}
        />

        <MetricCard
          label="Average sale"
          value={formatCurrency(totals.averageSale)}
          detail={`${totals.unitsSold} units sold`}
          icon={ShoppingBag}
        />

        <MetricCard
          label="Transactions"
          value={String(sales.length)}
          detail="Recorded sales"
          icon={WalletCards}
        />
      </section>

      {/* -------------------------------------------------- */}
      {/* PAYMENT SNAPSHOT                                    */}
      {/* -------------------------------------------------- */}

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Payment snapshot
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
              Where your revenue is coming from
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <PaymentSnapshot
              label="Cash"
              amount={cashRevenue}
              icon={Banknote}
            />

            <PaymentSnapshot
              label="Card"
              amount={cardRevenue}
              icon={CreditCard}
            />

            <PaymentSnapshot
              label="EFT"
              amount={eftRevenue}
              icon={WalletCards}
            />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* FILTER BAR                                          */}
      {/* -------------------------------------------------- */}

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="flex-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Search sales
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
                  placeholder="Search product, seller or payment..."
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
                ...SALE_CATEGORIES,
              ]}
            />

            <FilterSelect
              label="Payment"
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                "All methods",
                ...PAYMENT_METHODS,
              ]}
            />

            <FilterSelect
              label="View"
              value={dateFilter}
              onChange={setDateFilter}
              options={["all", "today"]}
              display={(value) =>
                value === "today" ? "Today only" : "All dates"
              }
            />

            <FilterSelect
              label="Sort"
              value={sort}
              onChange={setSort}
              options={["newest", "oldest", "highest"]}
              display={(value) =>
                ({
                  newest: "Newest first",
                  oldest: "Oldest first",
                  highest: "Highest value",
                })[value]
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-800">
              {filteredSales.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-800">
              {sales.length}
            </span>{" "}
            sales
          </p>

          {(search ||
            category !== "All categories" ||
            paymentMethod !== "All methods" ||
            dateFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All categories");
                setPaymentMethod("All methods");
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

      {/* -------------------------------------------------- */}
      {/* SALES TABLE                                         */}
      {/* -------------------------------------------------- */}

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Transaction history
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
              Sales activity
            </h2>
          </div>

          <div className="hidden rounded-full bg-[#E6F7F3] px-3 py-1.5 text-xs font-bold text-[#063D35] sm:block">
            {filteredSales.length} visible
          </div>
        </div>

        {filteredSales.length ? (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Product
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Seller
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Payment
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Qty
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Total
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-[#F7FAF9]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
                            <ShoppingBag size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {sale.product}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-[#B8F2E6] px-2 py-0.5 text-[11px] font-bold text-[#063D35]">
                                {sale.category}
                              </span>

                              <span className="text-xs text-slate-400">
                                {formatCurrency(sale.unitPrice)} each
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {sale.seller || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {formatDate(sale.date)}
                      </td>

                      <td className="px-5 py-4">
                        <PaymentBadge
                          method={sale.paymentMethod}
                        />
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-bold text-slate-700">
                        {sale.quantity}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <p className="font-extrabold text-[#063D35]">
                          {formatCurrency(saleTotal(sale))}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton
                            label={`Edit ${sale.product}`}
                            onClick={() => openEdit(sale)}
                          >
                            <Pencil size={16} />
                          </IconButton>

                          <IconButton
                            label={`Delete ${sale.product}`}
                            danger
                            onClick={() => setRemove(sale)}
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

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredSales.map((sale) => (
                <article
                  key={sale.id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
                        <ShoppingBag size={17} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-900">
                          {sale.product}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {sale.seller || "No seller"} ·{" "}
                          {formatDate(sale.date)}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 font-extrabold text-[#063D35]">
                      {formatCurrency(saleTotal(sale))}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#B8F2E6] px-2.5 py-1 text-xs font-bold text-[#063D35]">
                      {sale.category}
                    </span>

                    <PaymentBadge
                      method={sale.paymentMethod}
                    />

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {sale.quantity} ×{" "}
                      {formatCurrency(sale.unitPrice)}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <IconButton
                      label={`Edit ${sale.product}`}
                      onClick={() => openEdit(sale)}
                    >
                      <Pencil size={16} />
                    </IconButton>

                    <IconButton
                      label={`Delete ${sale.product}`}
                      danger
                      onClick={() => setRemove(sale)}
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
            hasFilters={
              Boolean(search) ||
              category !== "All categories" ||
              paymentMethod !== "All methods" ||
              dateFilter !== "all"
            }
            onRecordSale={openNew}
          />
        )}
      </section>

      {/* -------------------------------------------------- */}
      {/* SALE MODAL                                          */}
      {/* -------------------------------------------------- */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#063D35]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#43A99A]">
                  {editing ? "Update transaction" : "New transaction"}
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-[#063D35]">
                  {editing
                    ? "Edit sale"
                    : "Record a sale"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close sale dialog"
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
                  label="Product / service"
                  placeholder="e.g. Brownie box"
                  value={form.product}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      product: value,
                    }))
                  }
                  required
                  autoFocus
                />

                <InputField
                  label="Seller"
                  placeholder="e.g. Thabo"
                  value={form.seller}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      seller: value,
                    }))
                  }
                />

                <InputField
                  label="Quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={form.quantity}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: value,
                    }))
                  }
                  required
                />

                <InputField
                  label="Unit price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  prefix="R"
                  value={form.unitPrice}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      unitPrice: value,
                    }))
                  }
                  required
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
                  options={SALE_CATEGORIES}
                />

                <SelectField
                  label="Payment method"
                  value={form.paymentMethod}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      paymentMethod: value,
                    }))
                  }
                  options={PAYMENT_METHODS}
                />

                <InputField
                  label="Sale date"
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
              </div>

              {/* Live total */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-[#B8F2E6] bg-[#F3FBF9]">
                <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#43A99A]">
                      Transaction total
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {form.quantity || 0} ×{" "}
                      {formatCurrency(
                        Number(form.unitPrice || 0),
                      )}
                    </p>
                  </div>

                  <strong className="text-2xl font-black text-[#063D35]">
                    {formatCurrency(liveFormTotal)}
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
                      <Check size={16} />
                      {editing
                        ? "Save changes"
                        : "Record sale"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* DELETE CONFIRMATION                                */}
      {/* -------------------------------------------------- */}

      {remove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#063D35]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-slate-900">
              Delete this sale?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You're about to delete{" "}
              <span className="font-bold text-slate-800">
                {remove.product}
              </span>{" "}
              worth{" "}
              <span className="font-bold text-slate-800">
                {formatCurrency(
                  saleTotal(remove),
                )}
              .
              </span>{" "}
              This cannot be undone.
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
                    Delete sale
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
/* SMALL REUSABLE COMPONENTS                                */
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

function PaymentSnapshot({
  label,
  amount,
  icon: Icon,
}) {
  return (
    <div className="flex min-w-[150px] items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#063D35] shadow-sm">
        <Icon size={16} />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400">
          {label}
        </p>

        <p className="text-sm font-extrabold text-slate-800">
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}

function PaymentBadge({ method }) {
  const config = {
    Cash: {
      icon: Banknote,
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    Card: {
      icon: CreditCard,
      className:
        "bg-blue-50 text-blue-700 border-blue-100",
    },
    EFT: {
      icon: WalletCards,
      className:
        "bg-violet-50 text-violet-700 border-violet-100",
    },
  };

  const current = config[method] || {
    icon: WalletCards,
    className:
      "bg-slate-50 text-slate-600 border-slate-200",
  };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${current.className}`}
    >
      <Icon size={12} />
      {method || "Cash"}
    </span>
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
            <option key={option} value={option}>
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
            <option key={option} value={option}>
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
  onRecordSale,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F7F3] text-[#063D35]">
        {hasFilters ? (
          <Search size={24} />
        ) : (
          <Receipt size={24} />
        )}
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-slate-900">
        {hasFilters
          ? "No sales match your filters"
          : "Your sales log is empty"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try adjusting your search or filters to find the transaction you're looking for."
          : "Record your first transaction and SparkSales will start building your financial picture."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onRecordSale}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052F29]"
        >
          <Plus size={16} />
          Record your first sale
        </button>
      )}
    </div>
  );
}

export default Sales;