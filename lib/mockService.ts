// lib/mockService.ts

/* ================= HELPER ================= */
function getCurrentUserEmail() {
  if (typeof window === 'undefined') return null;
  try {
    const userJson = localStorage.getItem("auth_user");
    return userJson ? JSON.parse(userJson).email : null;
  } catch {
    return null;
  }
}

/* ================= CATEGORIES ================= */
export type Category = {
  id: number | string;
  name: string;
  type: "thu" | "chi" | "INCOME" | "EXPENSE";
  contractValidity?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  description?: string;
};

export function getCategories(): Promise<Category[]> {
  if (typeof window !== 'undefined') {
    return fetch('/api/categories').then((r) => {
      if (!r.ok) return [];
      return r.json();
    });
  }
  return Promise.resolve([]);
}

export function addCategory(payload: Omit<Category, "id">): Promise<Category> {
  if (typeof window !== 'undefined') {
    return fetch('/api/categories', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }).then((r) => r.json());
  }
  return Promise.resolve({} as Category);
}

export function updateCategory(id: string | number, payload: Partial<Category>): Promise<Category | null> {
  if (typeof window !== 'undefined') {
    return fetch('/api/categories', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, ...payload })
    }).then((r) => r.json());
  }
  return Promise.resolve(null);
}

export function deleteCategory(id: string | number): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id })
    }).then((r) => r.json()).then((r) => Boolean(r.ok));
  }
  return Promise.resolve(false);
}


/* ================= TRANSACTIONS ================= */
export type Transaction = {
  id: number | string;
  date: string;
  amount: number;
  type: "thu" | "chi" | "INCOME" | "EXPENSE";
  categoryId?: number | string;
  categoryName?: string;
  description?: string;
  accountId?: number | string;
  accountName?: string;
  performedBy?: string;
  received?: boolean;
  approved?: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  user?: { name: string; email: string };
  createdAt?: string; 
};

export function getTransactions(): Promise<Transaction[]> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions')
      .then(async (r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .catch(err => []);
  }
  return Promise.resolve([]);
}

export function addTransaction(payload: Omit<Transaction, "id">): Promise<Transaction> {
  if (typeof window !== 'undefined') {
    const email = getCurrentUserEmail();
    const bodyToSend = { ...payload, email: email };

    return fetch('/api/transactions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(bodyToSend)
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || `Lỗi: ${r.status}`);
      return json;
    });
  }
  return Promise.resolve({} as Transaction);
}

export function updateTransaction(id: string | number, payload: Partial<Transaction>): Promise<Transaction | null> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, ...payload })
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Update failed");
      return json;
    });
  }
  return Promise.resolve(null);
}

export function deleteTransaction(id: string | number): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id })
    }).then((r) => r.ok);
  }
  return Promise.resolve(false);
}


/* ================= ACCOUNTS ================= */
export type Account = {
  id: number | string;
  name: string;
  balance: number;
  initialBalance?: number;
};

export function getAccounts(): Promise<Account[]> {
  if (typeof window !== 'undefined') {
    return fetch('/api/accounts').then(async (r) => {
      if (!r.ok) return []; 
      const data = await r.json();
      return data.map((a: any) => ({
        ...a,
        balance: Number(a.currentBalance || a.balance || 0)
      }));
    });
  }
  return Promise.resolve([]);
}

export function addAccount(payload: Omit<Account, "id">): Promise<Account> {
  if (typeof window !== 'undefined') {
    return fetch('/api/accounts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }
  return Promise.resolve({} as Account);
}

export function updateAccount(id: string | number, payload: Partial<Account>): Promise<Account | null> {
   if (typeof window !== 'undefined') {
    return fetch('/api/accounts', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, ...payload })
    }).then(r => r.json());
  }
  return Promise.resolve(null);
}

export function transferBetweenAccounts(fromId: string | number, toId: string | number, amount: number): Promise<boolean> {
  console.warn("Tính năng chuyển khoản cần API Backend");
  return Promise.resolve(false); 
}


/* ================= CUSTOMERS ================= */
export type Customer = {
  id: number | string;
  name: string;
  phone?: string;
  email?: string;
  depositDate?: string;
  contractDate?: string;
  contractValidityMonths?: number;
  depositAmount?: number;
  contractAmount?: number;
  commission?: number;
  received?: boolean;
  approved?: boolean;
  
  // ✅ ĐÃ BỔ SUNG 2 DÒNG NÀY ĐỂ FIX LỖI:
  approvedBy?: string | null;
  approvedAt?: string | null;

  note?: string;
  performedBy?: string;
  createdAt?: string;
};

export function getCustomers(): Promise<Customer[]> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers').then((r) => {
        if (!r.ok) return [];
        return r.json();
    });
  }
  return Promise.resolve([]);
}

export function addCustomer(payload: Omit<Customer, "id">): Promise<Customer> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }).then((r) => r.json());
  }
  return Promise.resolve({} as Customer);
}

export function updateCustomer(id: string | number, payload: Partial<Customer>): Promise<Customer | null> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, ...payload })
    }).then((r) => r.json());
  }
  return Promise.resolve(null);
}

export function deleteCustomer(id: string | number): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id })
    }).then((r) => Boolean(r.ok));
  }
  return Promise.resolve(false);
}