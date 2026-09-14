# SparkSales

SparkSales is a student Entrepreneurship Day financial dashboard for recording sales and expenses, calculating gross profit, SparkSales 5% commission, and net profit.

## Development

```bash
npm install
npm run dev
```

## CI

GitHub Actions runs `npm ci`, ESLint, and the production build for pull requests into `develop`.

## Team workflow

`feature/*` → Pull Request → `develop` → release PR → `main`

## Notes

The application currently uses browser localStorage for its development template data. Replace this with the production backend when authentication/database work is introduced.
# 🚀 SparkSales

**SparkSales — Ignite Your Earnings**

SparkSales is a student-built financial management dashboard created for an **Entrepreneurship Day** project. The application is designed to help small student businesses record their daily sales and expenses while providing a clear view of their financial performance.

The system calculates:

- Total Revenue
- Total Expenses
- Gross Profit
- SparkSales Commission (5% of positive gross profit)
- Net Profit
- Average Sale Value
- Sales and expense analytics
- Payment method breakdowns
- Business performance insights

The project was developed collaboratively using GitHub, feature branches, pull requests, code reviews, and CI/CD practices.

---

## 📌 Project Overview

SparkSales provides a centralized dashboard where a business can track its financial activity throughout the trading day.

The application is focused on answering a few important questions:

> How much have we sold?

> How much have we spent?

> How much profit have we made?

> How much commission is owed?

> How much money do we actually keep?

The dashboard presents this information through financial summary cards, charts, recent transactions, seller performance, and business health insights.

---

## ✨ Main Features

### 📊 Dashboard

The dashboard provides a real-time overview of the business's financial performance.

It includes:

- Revenue summary
- Expense summary
- Gross profit
- SparkSales commission
- Net profit
- Average sale value
- Revenue performance chart
- Expense breakdown
- Payment method analytics
- Revenue by category
- Seller performance
- Recent transactions
- Quick actions
- Business health / Trading Pulse score

---

### 💰 Sales Management

Users can record sales and track important information such as:

- Product or service
- Category
- Quantity
- Selling price
- Payment method
- Date

Sales are automatically included in the dashboard's financial calculations.

---

### 💸 Expense Management

Users can record business expenses and categorize them for better financial tracking.

Supported expense categories include areas such as:

- Supplies
- Ingredients
- Marketing
- Stall Fees
- Transport

---

### 📈 Financial Calculations

SparkSales automatically calculates the business's financial position based on recorded sales and expenses.

The calculation flow is:

```text
Revenue
   ↓
- Expenses
   ↓
Gross Profit
   ↓
- 5% SparkSales Commission
   ↓
Net Profit
