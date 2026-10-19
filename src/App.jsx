import { useEffect, useState } from "react";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
} from "./services/api";
import "./App.css";

const DEFAULT_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Education",
  "Salary",
  "Other",
];

const today = () => new Date().toISOString().split("T")[0];
const currentMonth = () => today().slice(0, 7);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(today());
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [budgetCategory, setBudgetCategory] = useState("Food");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetMonth, setBudgetMonth] = useState(currentMonth());
  const [editingBudgetId, setEditingBudgetId] = useState(null);

  const [message, setMessage] = useState("");

  const categoryNames = [
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...categories.map((item) => item.name).filter(Boolean),
    ]),
  ];

  async function loadTransactions() {
    const data = await getTransactions();
    setTransactions(Array.isArray(data) ? data : []);
  }

  async function loadCategories() {
    const data = await getCategories();
    setCategories(Array.isArray(data) ? data : []);
  }

  async function loadBudgets() {
    const data = await getBudgets();
    setBudgets(Array.isArray(data) ? data : []);
  }

  async function loadAllData() {
    try {
      await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadBudgets(),
      ]);
    } catch (error) {
      console.error("Loading data failed:", error);
      setMessage(
        "Could not load data. Please check that JSON Server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const totalIncome = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalExpenses = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const balance = totalIncome - totalExpenses;

  const highestExpense = transactions
    .filter((item) => item.type === "Expense")
    .reduce(
      (highest, item) => Math.max(highest, Number(item.amount || 0)),
      0
    );

  const categoryTotals = transactions
    .filter((item) => item.type === "Expense")
    .reduce((totals, item) => {
      const name = item.category || "Other";
      totals[name] = (totals[name] || 0) + Number(item.amount || 0);
      return totals;
    }, {});

  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch = (item.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;

    const matchesStartDate = !startDate || item.date >= startDate;
    const matchesEndDate = !endDate || item.date <= endDate;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  function resetTransactionForm() {
    setTitle("");
    setAmount("");
    setType("Expense");
    setCategory("Food");
    setDate(today());
    setEditingId(null);
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setTitle(item.title || "");
    setAmount(String(item.amount ?? ""));
    setType(item.type || "Expense");
    setCategory(item.category || "Other");
    setDate(item.date || today());
    setMessage("Edit the details below, then save your changes.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !title.trim() ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !date
    ) {
      setMessage("Enter a title, a valid positive amount, and a date.");
      return;
    }

    const transactionData = {
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date,
    };

    try {
      if (editingId !== null) {
        await updateTransaction(editingId, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      await loadTransactions();
      setMessage(
        editingId !== null
          ? "Transaction updated successfully!"
          : "Transaction added successfully!"
      );
      resetTransactionForm();
    } catch (error) {
      console.error("Saving transaction failed:", error);
      setMessage("Could not save the transaction. Check JSON Server.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await deleteTransaction(id);

      if (String(editingId) === String(id)) {
        resetTransactionForm();
      }

      await loadTransactions();
      setMessage("Transaction deleted successfully!");
    } catch (error) {
      console.error("Deleting transaction failed:", error);
      setMessage("Could not delete the transaction.");
    }
  }

  function resetCategoryForm() {
    setCategoryName("");
    setEditingCategoryId(null);
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setMessage("Please enter a category name.");
      return;
    }

    const duplicate = categoryNames.some(
      (existing) =>
        existing.toLowerCase() === name.toLowerCase() &&
        (!editingCategoryId ||
          !categories.some(
            (item) =>
              String(item.id) === String(editingCategoryId) &&
              item.name.toLowerCase() === name.toLowerCase()
          ))
    );

    if (duplicate) {
      setMessage("This category already exists.");
      return;
    }

    try {
      if (editingCategoryId !== null) {
        await updateCategory(editingCategoryId, { name });
        setMessage("Category updated successfully!");
      } else {
        await addCategory({ name });
        setMessage("Category added successfully!");
      }

      await loadCategories();
      resetCategoryForm();
    } catch (error) {
      console.error("Saving category failed:", error);
      setMessage("Could not save the category.");
    }
  }

  async function handleCategoryDelete(item) {
    if (
      !window.confirm(
        `Delete the category "${item.name}"? Existing transactions will not be deleted.`
      )
    ) {
      return;
    }

    try {
      await deleteCategory(item.id);

      if (String(editingCategoryId) === String(item.id)) {
        resetCategoryForm();
      }

      await loadCategories();
      setMessage("Category deleted successfully!");
    } catch (error) {
      console.error("Deleting category failed:", error);
      setMessage("Could not delete the category.");
    }
  }

  function resetBudgetForm() {
    setBudgetCategory(categoryNames[0] || "Food");
    setBudgetAmount("");
    setBudgetMonth(currentMonth());
    setEditingBudgetId(null);
  }

  function handleBudgetEdit(item) {
    setEditingBudgetId(item.id);
    setBudgetCategory(item.category || "Food");
    setBudgetAmount(String(item.amount ?? ""));
    setBudgetMonth(item.month || currentMonth());
  }

  async function handleBudgetSubmit(event) {
    event.preventDefault();

    if (
      !budgetCategory ||
      budgetAmount === "" ||
      !Number.isFinite(Number(budgetAmount)) ||
      Number(budgetAmount) <= 0 ||
      !budgetMonth
    ) {
      setMessage("Enter a category, valid budget amount, and month.");
      return;
    }

    const budgetData = {
      category: budgetCategory,
      amount: Number(budgetAmount),
      month: budgetMonth,
    };

    try {
      if (editingBudgetId !== null) {
        await updateBudget(editingBudgetId, budgetData);
        setMessage("Budget updated successfully!");
      } else {
        await addBudget(budgetData);
        setMessage("Budget added successfully!");
      }

      await loadBudgets();
      resetBudgetForm();
    } catch (error) {
      console.error("Saving budget failed:", error);
      setMessage("Could not save the budget.");
    }
  }

  async function handleBudgetDelete(id) {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    try {
      await deleteBudget(id);

      if (String(editingBudgetId) === String(id)) {
        resetBudgetForm();
      }

      await loadBudgets();
      setMessage("Budget deleted successfully!");
    } catch (error) {
      console.error("Deleting budget failed:", error);
      setMessage("Could not delete the budget.");
    }
  }

  function getBudgetSpent(item) {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "Expense" &&
          transaction.category === item.category &&
          transaction.date?.startsWith(item.month || "")
      )
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Expense &amp; Finance Portal</h1>
          <p>Manage your money in one place.</p>
        </div>
      </header>

      <main className="container">
        <h2>Dashboard</h2>

        <section className="add-transaction">
          <h2>
            {editingId !== null ? "Edit Transaction" : "Add New Transaction"}
          </h2>
          <p className="form-description">
            Record and manage your income and expenses.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Transaction title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Lunch or Monthly Salary"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              type="number"
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />

            <label htmlFor="type">Transaction type</label>
            <select
              id="type"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>

            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categoryNames.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <button type="submit" className="save-button">
              {editingId !== null ? "Save Changes" : "+ Save Transaction"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="delete-button"
                onClick={() => {
                  resetTransactionForm();
                  setMessage("Editing cancelled.");
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>

        {message && <p className="form-message">{message}</p>}

        <section className="summary">
          <div className="summary-card">
            <h3>Total Income</h3>
            <p>₹{totalIncome.toLocaleString("en-IN")}</p>
          </div>
          <div className="summary-card">
            <h3>Total Expenses</h3>
            <p>₹{totalExpenses.toLocaleString("en-IN")}</p>
          </div>
          <div className="summary-card">
            <h3>Current Balance</h3>
            <p>₹{balance.toLocaleString("en-IN")}</p>
          </div>
          <div className="summary-card">
            <h3>Highest Expense</h3>
            <p>₹{highestExpense.toLocaleString("en-IN")}</p>
          </div>
        </section>

        <section className="transactions">
          <h2>Category-wise Expenses</h2>
          {Object.keys(categoryTotals).length === 0 ? (
            <p>No expenses recorded yet.</p>
          ) : (
            <ul>
              {Object.entries(categoryTotals).map(([name, total]) => (
                <li key={name}>
                  <span>{name}</span>
                  <strong>₹{total.toLocaleString("en-IN")}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="transactions">
          <h2>Category Management</h2>
          <p className="form-description">
            Add your own categories or manage existing custom categories.
          </p>

          <form onSubmit={handleCategorySubmit}>
            <label htmlFor="categoryName">Category name</label>
            <input
              id="categoryName"
              type="text"
              placeholder="e.g. Medical"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              required
            />

            <button type="submit" className="save-button">
              {editingCategoryId !== null ? "Update Category" : "Add Category"}
            </button>

            {editingCategoryId !== null && (
              <button
                type="button"
                className="delete-button"
                onClick={resetCategoryForm}
              >
                Cancel Edit
              </button>
            )}
          </form>

          {categories.length === 0 ? (
            <p>No custom categories added yet. Default categories are available in the transaction form.</p>
          ) : (
            <ul>
              {categories.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong>
                  <button
                    type="button"
                    className="save-button"
                    onClick={() => {
                      setEditingCategoryId(item.id);
                      setCategoryName(item.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleCategoryDelete(item)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="transactions">
          <h2>Budget Management</h2>
          <p className="form-description">
            Set a monthly spending limit for each category and track your spending.
          </p>

          <form onSubmit={handleBudgetSubmit}>
            <label htmlFor="budgetCategory">Budget category</label>
            <select
              id="budgetCategory"
              value={budgetCategory}
              onChange={(event) => setBudgetCategory(event.target.value)}
            >
              {categoryNames.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label htmlFor="budgetAmount">Monthly limit (₹)</label>
            <input
              id="budgetAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter spending limit"
              value={budgetAmount}
              onChange={(event) => setBudgetAmount(event.target.value)}
              required
            />

            <label htmlFor="budgetMonth">Budget month</label>
            <input
              id="budgetMonth"
              type="month"
              value={budgetMonth}
              onChange={(event) => setBudgetMonth(event.target.value)}
              required
            />

            <button type="submit" className="save-button">
              {editingBudgetId !== null ? "Update Budget" : "Add Budget"}
            </button>

            {editingBudgetId !== null && (
              <button
                type="button"
                className="delete-button"
                onClick={resetBudgetForm}
              >
                Cancel Edit
              </button>
            )}
          </form>

          {budgets.length === 0 ? (
            <p>No budgets added yet.</p>
          ) : (
            <ul>
              {budgets.map((item) => {
                const spent = getBudgetSpent(item);
                const limit = Number(item.amount || 0);
                const remaining = limit - spent;

                return (
                  <li key={item.id}>
                    <div>
                      <strong>{item.category}</strong>
                      <p>Month: {item.month}</p>
                      <p>Budget: ₹{limit.toLocaleString("en-IN")}</p>
                      <p>Spent: ₹{spent.toLocaleString("en-IN")}</p>
                      <p>
                        {remaining >= 0 ? "Remaining" : "Over budget"}: ₹
                        {Math.abs(remaining).toLocaleString("en-IN")}
                      </p>
                      {remaining < 0 && (
                        <p>Warning: You have exceeded this budget.</p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="save-button"
                      onClick={() => handleBudgetEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleBudgetDelete(item.id)}
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="transactions">
          <h2>Transactions</h2>

          <div className="filters">
            <input
              type="search"
              placeholder="Search by transaction title"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              aria-label="Filter by category"
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
            >
              <option value="All">All Categories</option>
              {categoryNames.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div>
              <label htmlFor="startDate">From date</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="endDate">To date</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="delete-button"
              onClick={() => {
                setSearch("");
                setFilterCategory("All");
                setStartDate("");
                setEndDate("");
              }}
            >
              Clear Filters
            </button>
          </div>

          {loading ? (
            <p>Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <p>No matching transactions found.</p>
          ) : (
            <ul>
              {filteredTransactions.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.category} · {item.date}</p>
                  </div>

                  <span>{item.type}</span>

                  <strong>
                    {item.type === "Income" ? "+" : "-"}₹
                    {Number(item.amount).toLocaleString("en-IN")}
                  </strong>

                  <button
                    type="button"
                    className="save-button"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;