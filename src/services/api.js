
const API_URL = "http://localhost:3000";

// TRANSACTIONS API

export async function getTransactions() {
  const response = await fetch(`${API_URL}/transactions`);
  if (!response.ok) throw new Error("Failed to fetch transactions");
  return response.json();
}

export async function getTransactionById(id) {
  const response = await fetch(`${API_URL}/transactions/${id}`);
  if (!response.ok) throw new Error("Transaction not found");
  return response.json();
}

export async function addTransaction(transaction) {
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error("Failed to add transaction");
  return response.json();
}

export async function updateTransaction(id, transaction) {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error("Failed to update transaction");
  return response.json();
}

export async function deleteTransaction(id) {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete transaction");
  return response;
}

// CATEGORIES API

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

export async function getCategoryById(id) {
  const response = await fetch(`${API_URL}/categories/${id}`);
  if (!response.ok) throw new Error("Category not found");
  return response.json();
}

export async function addCategory(category) {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Failed to add category");
  return response.json();
}

export async function updateCategory(id, category) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Failed to update category");
  return response.json();
}

export async function deleteCategory(id) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete category");
  return response;
}

// BUDGETS API

export async function getBudgets() {
  const response = await fetch(`${API_URL}/budgets`);
  if (!response.ok) throw new Error("Failed to fetch budgets");
  return response.json();
}

export async function getBudgetById(id) {
  const response = await fetch(`${API_URL}/budgets/${id}`);
  if (!response.ok) throw new Error("Budget not found");
  return response.json();
}

export async function addBudget(budget) {
  const response = await fetch(`${API_URL}/budgets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(budget),
  });
  if (!response.ok) throw new Error("Failed to add budget");
  return response.json();
}

export async function updateBudget(id, budget) {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(budget),
  });
  if (!response.ok) throw new Error("Failed to update budget");
  return response.json();
}

export async function deleteBudget(id) {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete budget");
  return response;
}
