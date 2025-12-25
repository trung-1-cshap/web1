type Category = {
  id: string;
  name: string;
  type: "thu" | "chi";
  description?: string;
};

let categories: Category[] = [];

export function getCategories(): Promise<Category[]> {
  // lấy từ API nếu có
  if (typeof window !== 'undefined') {
    return fetch('/api/categories').then((r) => r.json())
  }
  return Promise.resolve([...categories]);
}

export function addCategory(payload: Omit<Category, "id">): Promise<Category> {
  if (typeof window !== 'undefined') {
    return fetch('/api/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then((r) => r.json())
  }
  const newCat: Category = { id: `c${Date.now()}`, ...payload };
  categories = [newCat, ...categories];
  return Promise.resolve(newCat);
}

export function updateCategory(id: string, payload: Partial<Category>): Promise<Category | null> {
  // cập nhật phía client qua API chưa được triển khai trên server; dùng bộ nhớ trong thay thế
  if (typeof window !== 'undefined') {
    // chưa có endpoint PUT cho categories; giả lập cập nhật lạc quan bằng cách trả về payload
    return fetch('/api/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...payload }) }).then((r) => r.json())
  }
  let updated: Category | null = null;
  categories = categories.map((c) => {
    if (c.id === id) {
      updated = { ...c, ...payload };
      return updated;
    }
    return c;
  });
  return Promise.resolve(updated);
}

export function deleteCategory(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return fetch('/api/categories', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) }).then((r) => r.json()).then((r) => Boolean(r.ok))
  }
  const before = categories.length;
  categories = categories.filter((c) => c.id !== id);
  return Promise.resolve(categories.length < before);
}

export type { Category };

// Giao dịch và Tài khoản (trong bộ nhớ)
type Transaction = {
  id: string;
  date: string; // ISO
  amount: number;
  type: "thu" | "chi";
  categoryId?: string;
  description?: string;
  accountId?: string;
  performedBy?: string; // người dùng đã nhập giao dịch
  actorName?: string; // người nhận/thanh toán (được nhập bởi người dùng)
  received?: boolean; // đã thu
  approved?: boolean; // đã duyệt
  approvedBy?: string | null;
  approvedAt?: string | null;
};

let transactions: Transaction[] = [];

export function getTransactions(): Promise<Transaction[]> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions').then(async (r) => {
      const text = await r.text().catch(() => '')
      let json: any = {}
      try {
        json = text ? JSON.parse(text) : {}
      } catch (e) {
        json = { _raw: text }
      }
      if (!r.ok) {
        console.error('getTransactions failed', { status: r.status, statusText: r.statusText, body: json })
        throw new Error(json?.error || JSON.stringify(json) || `HTTP ${r.status} ${r.statusText}`)
      }
      return json
    })
  }
  return Promise.resolve([...transactions]);
}

export function addTransaction(payload: Omit<Transaction, "id">): Promise<Transaction> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) {
          console.error('addTransaction failed', json);
          throw new Error(json?.error || JSON.stringify(json) || `HTTP ${r.status}`);
        }
        return json;
      })
  }
  const t: Transaction = { id: `t${Date.now()}`, approved: false, approvedBy: null, approvedAt: null, ...payload };
  transactions = [t, ...transactions];
  return Promise.resolve(t);
}

export function updateTransaction(id: string, payload: Partial<Transaction>): Promise<Transaction | null> {
  if (typeof window !== 'undefined') {
    // sanitize payload: server may not accept approval fields or other private props
    const safePayload: any = { ...(payload || {}) };
    delete safePayload.approved;
    delete safePayload.approvedBy;
    delete safePayload.approvedAt;
    return fetch('/api/transactions', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...safePayload }) })
      .then(async (r) => {
        const text = await r.text().catch(() => '')
        let json: any = {}
        try { json = text ? JSON.parse(text) : {} } catch { json = { _raw: text } }
        if (!r.ok) {
          console.error('updateTransaction failed', { status: r.status, statusText: r.statusText, body: json })
          const msg = json?.error || JSON.stringify(json) || `HTTP ${r.status} ${r.statusText}`
          throw new Error(msg)
        }
        return json
      })
  }
  let updated: Transaction | null = null;
  transactions = transactions.map((t) => {
    if (t.id === id) {
      updated = { ...t, ...payload };
      return updated;
    }
    return t;
  });
  return Promise.resolve(updated);
}

export function deleteTransaction(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) })
      .then(async (r) => {
        const text = await r.text().catch(() => '')
        let parsed: any = undefined
        try {
          parsed = text ? JSON.parse(text) : undefined
        } catch {
          parsed = undefined
        }
        const bodyForLog = parsed ?? (text ? { _raw: text } : undefined)
        if (!r.ok) {
          console.error('deleteTransaction failed', { status: r.status, statusText: r.statusText, body: bodyForLog })
          // Nếu server báo không tìm thấy, coi như đã bị xóa (delete idempotent)
          if (r.status === 404) return false
          const errMsg = parsed?.error ?? (parsed ? JSON.stringify(parsed) : (text || `HTTP ${r.status} ${r.statusText}`))
          throw new Error(errMsg)
        }
        // Trường hợp server trả r.ok nhưng không có body — coi là thành công
        if (parsed === undefined) return true
        return Boolean(parsed.ok ?? true)
      })
  }
  const before = transactions.length;
  transactions = transactions.filter((t) => t.id !== id);
  return Promise.resolve(transactions.length < before);
}

type Account = {
  id: string;
  name: string;
  balance: number;
};

let accounts: Account[] = [];

export function getAccounts(): Promise<Account[]> {
  return Promise.resolve([...accounts]);
}

export function addAccount(payload: Omit<Account, "id">): Promise<Account> {
  const a: Account = { id: `a${Date.now()}`, ...payload };
  accounts = [a, ...accounts];
  return Promise.resolve(a);
}

export function updateAccount(id: string, payload: Partial<Account>): Promise<Account | null> {
  let updated: Account | null = null;
  accounts = accounts.map((a) => {
    if (a.id === id) {
      updated = { ...a, ...payload };
      return updated;
    }
    return a;
  });
  return Promise.resolve(updated);
}

export function transferBetweenAccounts(fromId: string, toId: string, amount: number): Promise<boolean> {
  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
  if (!from || !to || from.balance < amount) return Promise.resolve(false);
  from.balance -= amount;
  to.balance += amount;
  return Promise.resolve(true);
}

export type { Transaction, Account };

// Customers (in-memory)
type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  depositDate?: string; // ngày cọc (ISO)
  contractDate?: string; // ngày ký hợp đồng (ISO)
  depositAmount?: number; // tiền cọc
  contractAmount?: number; // tiền hợp đồng
  commission?: number; // hoa hồng
  received?: boolean; // đã thu
  approved?: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  note?: string;
  createdAt?: string;
  performedBy?: string;
};

let customers: Customer[] = [];

export function getCustomers(): Promise<Customer[]> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers').then((r) => r.json())
  }
  return Promise.resolve([...customers]);
}

export function addCustomer(payload: Omit<Customer, "id">): Promise<Customer> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then((r) => r.json())
  }
  const c: Customer = { id: `u${Date.now()}`, approved: false, approvedBy: null, approvedAt: null, ...payload };
  customers = [c, ...customers];
  return Promise.resolve(c);
}

export function updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer | null> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...payload }) }).then((r) => r.json())
  }
  let updated: Customer | null = null;
  customers = customers.map((c) => {
    if (c.id === id) {
      updated = { ...c, ...payload };
      return updated;
    }
    return c;
  });
  return Promise.resolve(updated);
}

export function deleteCustomer(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) }).then((r) => r.json()).then((r) => Boolean(r.ok))
  }
  const before = customers.length;
  customers = customers.filter((c) => c.id !== id);
  return Promise.resolve(customers.length < before);
}

export type { Customer };