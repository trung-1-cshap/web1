"use client"

import React from "react";
import type { Transaction, Category } from "../../../../lib/mockService";
import { canApproveTransaction, canSoftDelete } from "../../../../lib/permissions";
import { formatNumberVN } from "../../../../lib/format";

type Props = {
  items: Transaction[];
  categories: Category[];
  user?: any;
  editingTransactionId: string | null;
  editTransactionData: Partial<Transaction>;
  setEditTransactionData: React.Dispatch<React.SetStateAction<Partial<Transaction>>>;
  startEditTransaction: (t: Transaction) => void;
  cancelEditTransaction: () => void;
  saveEditTransaction: () => Promise<void>;
  toggleTransactionReceived: (id: string, val: boolean) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleApprove?: (id: string) => Promise<void> | void;
};
export default function TransactionsTable({ items, categories, user, editingTransactionId, editTransactionData, setEditTransactionData, startEditTransaction, cancelEditTransaction, saveEditTransaction, toggleTransactionReceived, handleDelete, handleApprove }: Props) {
  return (
    <div className="bg-white border rounded">
      <div className="overflow-x-auto">
        <table className="w-full">
          <colgroup>
            <col style={{ width: 180 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 100 }} />
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Ngày giờ</th>
              <th className="text-left p-3">Người thực hiện</th>
              <th className="text-left p-3">Người thu/chi</th>
              <th className="text-left p-3">Số tiền</th>
              <th className="text-left p-3">Loại</th>
              <th className="text-left p-3">Danh mục</th>
              <th className="p-3">Hành động</th>
              
              <th className="p-3">Đã thu</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={`${String(it.id ?? '')}-${i}`} className="border-t">
                {String(it.id) === editingTransactionId ? (
                  <>
                    <td className="p-3 whitespace-normal break-words">{it.date ? new Date(it.date).toLocaleString() : "-"}</td>
                    <td className="p-3 whitespace-normal break-words">{it.performedBy ?? "-"}</td>
                    <td className="p-3"><input className="border px-2 py-1 w-40" value={String(editTransactionData.actorName ?? '')} onChange={(e) => setEditTransactionData({ ...(editTransactionData || {}), actorName: e.target.value })} /></td>
                    <td className="p-3"><input type="number" className="border px-2 py-1 w-32" value={editTransactionData.amount ?? ''} onChange={(e) => setEditTransactionData({ ...(editTransactionData || {}), amount: e.target.value === '' ? undefined : Number(e.target.value) })} /></td>
                    <td className="p-3">
                      <select className="border px-2 py-1 w-32" value={String(editTransactionData.type ?? it.type)} onChange={(e) => setEditTransactionData({ ...(editTransactionData || {}), type: e.target.value as any })}>
                        <option value="thu">Thu</option>
                        <option value="chi">Chi</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select className="border px-2 py-1 w-44" value={String(editTransactionData.categoryId ?? it.categoryId ?? '')} onChange={(e) => setEditTransactionData({ ...(editTransactionData || {}), categoryId: e.target.value })}>
                        <option value="">-</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <button className="text-green-600 mr-2" onClick={saveEditTransaction}>Lưu</button>
                      <button className="text-gray-600" onClick={cancelEditTransaction}>Hủy</button>
                    </td>
                    <td className="p-3 text-center">
                      <input type="checkbox" checked={Boolean(editTransactionData.received ?? it.received)} onChange={(e) => setEditTransactionData({ ...(editTransactionData || {}), received: e.target.checked })} />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3">{it.date ? new Date(it.date).toLocaleString() : "-"}</td>
                    <td className="p-3">{it.performedBy ?? "-"}</td>
                    <td className="p-3 whitespace-normal break-words">{it.actorName ?? "-"}</td>
                    <td className="p-3 whitespace-normal break-words">{it.amount != null ? formatNumberVN(it.amount) : "-"}</td>
                    <td className="p-3 whitespace-normal break-words">{(String(it.type) === 'INCOME' || String(it.type) === 'thu') ? 'Thu' : (String(it.type) === 'EXPENSE' || String(it.type) === 'chi') ? 'Chi' : String(it.type)}</td>
                    <td className="p-3 whitespace-normal break-words">{categories.find((c) => String(c.id) === String(it.categoryId))?.name ?? "-"}</td>
                    <td className="p-3 text-center">
                      <button className="text-blue-600 mr-2" onClick={() => startEditTransaction(it)}>Sửa</button>
                      {canSoftDelete(user) ? <button className="text-red-600" onClick={() => handleDelete(it.id)}>Xóa</button> : '-'}
                    </td>
                    
                    <td className="p-3 text-center">
                      <input type="checkbox" checked={Boolean(it.received)} onChange={(e) => toggleTransactionReceived(it.id, e.target.checked)} />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
