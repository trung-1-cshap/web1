import { useState, useEffect } from "react";
import {
  getTransactions,
  getCategories,
  getAccounts,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  Transaction,
  Category,
  Account,
} from "../../../../lib/mockService";

// 👇 THÊM CHỮ "default" VÀO ĐÂY
export default function useTransactions(user: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trash, setTrash] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | number>(""); 
  const [accountId, setAccountId] = useState<string | number>("");
  const [type, setType] = useState<"thu" | "chi">("thu");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));

  // Edit states
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editTransactionData, setEditTransactionData] = useState<Partial<Transaction>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [txs, deletedTxs, cats, accs] = await Promise.all([
        getTransactions(false),
        getTransactions(true),
        getCategories(),
        getAccounts(),
      ]);
      setTransactions(txs);
      setTrash(deletedTxs);
      setCategories(cats);
      setAccounts(accs);

      if (cats.length > 0) setCategoryId(cats[0].id);
      if (accs.length > 0) setAccountId(accs[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(eOrPayload: React.FormEvent | any) {
    // Support two call styles:
    // - called from a form: handleAdd(event)
    // - called with payload: handleAdd({ amount, description, categoryId, ... })
    let payload: any = null;

    if (eOrPayload && typeof eOrPayload.preventDefault === "function") {
      eOrPayload.preventDefault();
      if (!amount || !categoryId || !accountId) return;
      payload = {
        date: new Date(date).toISOString(),
        amount: Number(amount),
        type,
        categoryId,
        description,
      };
    } else {
      payload = eOrPayload || {};
      if (!payload.amount || !payload.categoryId || !payload.accountId) {
        // If accountId isn't provided in payload, try to fall back to hook state
        if (!payload.accountId && accountId) payload.accountId = accountId;
        if (!payload.amount && amount) payload.amount = amount;
        if (!payload.categoryId && categoryId) payload.categoryId = categoryId;
      }
    }

    const catName = categories.find((c) => String(c.id) === String(payload.categoryId))?.name;
    const accName = accounts.find((a) => String(a.id) === String(payload.accountId))?.name;

    try {
      const newTx = await addTransaction({
        date: payload.date || new Date().toISOString(),
        amount: Number(payload.amount),
        type: payload.type || type,
        categoryId: payload.categoryId,
        categoryName: catName,
        accountId: payload.accountId,
        accountName: accName,
        description: payload.description || "",
        performedBy: user?.name || user?.email,
        approved: payload.approved || false,
        received: payload.received || false,
      });

      setTransactions([newTx, ...transactions]);

      // If the call came from the hook's own form, reset hook form state
      if (eOrPayload && typeof eOrPayload.preventDefault === "function") {
        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().slice(0, 16));
      }
    } catch (error) {
      console.error("Add failed", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa giao dịch này?")) return;
    try {
      // Soft-delete via PUT (sets `deleted` flag)
      const updated = await updateTransaction(id, { deleted: true });
      if (updated) {
        setTransactions(transactions.filter((t) => String(t.id) !== String(id)));
        setTrash([updated, ...trash]);
      } else {
        console.warn("updateTransaction returned null when trying to soft-delete", id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function restoreFromTrash(id: string) {
    try {
      const updated = await updateTransaction(id, { deleted: false, deletedAt: null });
      if (updated) {
        setTrash(trash.filter((t) => String(t.id) !== String(id)));
        setTransactions([updated, ...transactions]);
      } else {
        console.warn("updateTransaction returned null when trying to restore from trash", id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function permanentlyDelete(id: string) {
    try {
      const ok = await deleteTransaction(id, true);
      if (ok) {
        setTrash(trash.filter((t) => String(t.id) !== String(id)));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function permanentlyDeleteAll() {
    try {
      const ids = trash.map((t) => String(t.id));
      await Promise.all(ids.map((id) => deleteTransaction(id, true)));
      setTrash([]);
    } catch (error) {
      console.error(error);
    }
  }

  function startEditTransaction(t: Transaction) {
    setEditingTransaction(t);
    setEditTransactionData(t);
  }

  function cancelEditTransaction() {
    setEditingTransaction(null);
    setEditTransactionData({});
  }

  async function saveEditTransaction() {
    if (!editingTransaction) return;
    try {
      const updated = await updateTransaction(String(editingTransaction.id), editTransactionData);
      if (updated) {
        setTransactions(
          transactions.map((t) => (String(t.id) === String(updated.id) ? updated : t))
        );
        cancelEditTransaction();
      } else {
        console.warn("updateTransaction returned null when saving edited transaction", editingTransaction.id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleTransactionReceived(id: string, val: boolean) {
    try {
      const updated = await updateTransaction(id, { received: val });
      if (updated) {
        setTransactions(
          transactions.map((t) => (String(t.id) === String(updated.id) ? updated : t))
        );
      } else {
        console.warn("updateTransaction returned null when toggling received", id, val);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return {
    transactions,
    categories,
    accounts,
    loading,
    amount, setAmount,
    description, setDescription,
    categoryId, setCategoryId,
    accountId, setAccountId,
    type, setType,
    date, setDate,
    handleAdd,
    handleDelete,
    editingTransaction,
    editTransactionData,
    setEditTransactionData,
    startEditTransaction,
    cancelEditTransaction,
    saveEditTransaction,
    toggleTransactionReceived
    ,
    trash,
    restoreFromTrash,
    permanentlyDelete,
    permanentlyDeleteAll
  };
}