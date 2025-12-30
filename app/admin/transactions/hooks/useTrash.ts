"use client"

import { useEffect, useState } from "react";
import { type Transaction, addTransaction, deleteTransaction, getDeletedTransactions, permanentlyDeleteTransaction, updateTransaction } from "../../../../lib/mockService";

export default function useTrash(items: Transaction[], setItems: (v: Transaction[] | ((s: Transaction[]) => Transaction[])) => void, user?: any, setFlashMsg?: (s: string | null) => void) {
  const [trash, setTrash] = useState<Transaction[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getDeletedTransactions();
        if (mounted) setTrash(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('load deleted transactions failed', err);
      }
    })();
    return () => { mounted = false };
  }, []);

  async function handleDelete(id: string) {
    if (!user || user.role !== 'admin') { alert('Chỉ admin mới có quyền xóa'); return; }
    const it = items.find((t) => String(t.id) === String(id));
    if (!it) return;
    setItems((s) => s.filter((t) => String(t.id) !== String(id)));
    setFlashMsg?.('Đã chuyển giao dịch vào Thùng rác');
    window.setTimeout(() => setFlashMsg?.(null), 3000);
    try {
      await deleteTransaction(it.id); // server soft-delete
      // refresh trash from server
      const data = await getDeletedTransactions();
      setTrash(Array.isArray(data) ? data : []);
    } catch (err) { console.warn('handleDelete: deleteTransaction failed', err); }
  }

  function restoreFromTrash(id: string) {
    const entry = trash.find((t) => String(t.id) === String(id));
    if (!entry) return;
    (async () => {
      try {
        const created = await addTransaction({
          date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
          amount: Number((entry as any).amount ?? 0),
          type: (entry as any).type ?? 'thu',
          categoryId: (entry as any).categoryId ?? undefined,
          description: entry.description ?? '-',
          accountId: (entry as any).accountId ?? undefined,
          performedBy: entry.performedBy ?? undefined,
          actorName: (entry as any).actorName ?? undefined,
        } as any);
        setItems((s) => [created, ...s]);
      } catch (err) {
        console.error('restoreFromTrash failed', err);
        setItems((s) => [entry, ...s]);
        } finally {
          // after restore, update server to clear deleted flag
          try { await updateTransaction(id, { deleted: false }); } catch (e) { console.warn('restore: updateTransaction failed', e); }
          // refresh trash
          try { const data = await getDeletedTransactions(); setTrash(Array.isArray(data) ? data : []); } catch {}
        }
    })();
  }

  async function permanentlyDelete(id: string) {
    if (!user || user.role !== 'admin') { alert('Chỉ admin mới có quyền xóa'); return; }
    try {
      await permanentlyDeleteTransaction(id);
    } catch (err) { console.warn('permanentlyDelete: server delete failed', err); }
    setTrash((s) => s.filter((t) => String(t.id) !== String(id)));
  }

  async function permanentlyDeleteAll() {
    if (!user || user.role !== 'admin') { alert('Chỉ admin mới có quyền xóa'); return; }
    if (!trash || trash.length === 0) return;
    try {
      await Promise.allSettled(trash.map((t) => deleteTransaction(String(t.id))));
    } catch (err) {
      console.warn('permanentlyDeleteAll: some deletes failed', err);
    }
    setTrash([]);
  }

  return {
    trash,
    setTrash,
    handleDelete,
    restoreFromTrash,
    permanentlyDelete,
    permanentlyDeleteAll,
  } as const;
}
