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

export function useTransactions(user: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states - QUAN TRỌNG: Cho phép string hoặc number
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
      const [txs, cats, accs] = await Promise.all([
        getTransactions(),
        getCategories(),
        getAccounts(),
      ]);
      setTransactions(txs);
      setCategories(cats);
      setAccounts(accs);

      // Set default selections
      if (cats.length > 0) setCategoryId(cats[0].id);
      if (accs.length > 0) setAccountId(accs[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !categoryId || !accountId) return;

    const catName = categories.find((c) => String(c.id) === String(categoryId))?.name;
    const accName = accounts.find((a) => String(a.id) === String(accountId))?.name;

    try {
      const newTx = await addTransaction({
        date: new Date(date).toISOString(),
        amount: Number(amount),
        type,
        categoryId,
        categoryName: catName,
        accountId,
        accountName: accName,
        description,
        performedBy: user?.name || user?.email,
        approved: false, // Mặc định chưa duyệt
        received: false, // Mặc định chưa thu
      });

      setTransactions([newTx, ...transactions]);
      
      // Reset form
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 16));
    } catch (error) {
      console.error("Add failed", error);
      alert("Lỗi khi thêm giao dịch");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa giao dịch này?")) return;
    try {
      const ok = await deleteTransaction(id);
      if (ok) {
        setTransactions(transactions.filter((t) => String(t.id) !== String(id)));
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Edit logic
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
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật");
    }
  }

  async function toggleTransactionReceived(id: string, val: boolean) {
    try {
      const updated = await updateTransaction(id, { received: val });
      if (updated) {
        setTransactions(
          transactions.map((t) => (String(t.id) === String(updated.id) ? updated : t))
        );
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
    // Form props
    amount, setAmount,
    description, setDescription,
    categoryId, setCategoryId,
    accountId, setAccountId,
    type, setType,
    date, setDate,
    handleAdd,
    handleDelete,
    // Edit props
    editingTransaction,
    editTransactionData,
    setEditTransactionData,
    startEditTransaction,
    cancelEditTransaction,
    saveEditTransaction,
    toggleTransactionReceived
  };
}