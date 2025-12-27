"use client";

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

// helper trạng thái
function getStatus(t: Transaction) {
  if (t.received) return { text: "Đã thu", cls: "bg-green-600" };
  if (t.approved) return { text: "Đã duyệt", cls: "bg-blue-600" };
  return { text: "Chưa duyệt", cls: "bg-gray-500" };
}

export default function TransactionsTable({
  items,
  categories,
  user,
  editingTransactionId,
  editTransactionData,
  setEditTransactionData,
  startEditTransaction,
  cancelEditTransaction,
  saveEditTransaction,
  toggleTransactionReceived,
  handleDelete,
  handleApprove,
}: Props) {
  return (
    <div className="bg-white border rounded">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Ngày giờ</th>
              <th className="p-3 text-left">Người thực hiện</th>
              <th className="p-3 text-left">Người thu/chi</th>
              <th className="p-3 text-left">Số tiền</th>
              <th className="p-3 text-left">Loại</th>
              <th className="p-3 text-left">Danh mục</th>
              <th className="p-3 text-center">Trạng thái</th>
              <th className="p-3 text-center">Hành động</th>
              <th className="p-3 text-center">Đã thu</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it, i) => {
              const status = getStatus(it);

              return (
                <tr key={`${String(it.id)}-${i}`} className="border-t">
                  {/* ===== EDIT MODE ===== */}
                  {String(it.id) === editingTransactionId ? (
                    <>
                      <td className="p-3">{it.date ? new Date(it.date).toLocaleString() : "-"}</td>
                      <td className="p-3">{it.performedBy ?? "-"}</td>
                      <td className="p-3">
                        <input
                          className="border px-2 py-1 w-40"
                          value={String(editTransactionData.actorName ?? "")}
                          onChange={(e) =>
                            setEditTransactionData({ ...editTransactionData, actorName: e.target.value })
                          }
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="border px-2 py-1 w-32"
                          value={editTransactionData.amount ?? ""}
                          onChange={(e) =>
                            setEditTransactionData({
                              ...editTransactionData,
                              amount: e.target.value === "" ? undefined : Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td className="p-3">
                        <select
                          className="border px-2 py-1 w-32"
                          value={String(editTransactionData.type ?? it.type)}
                          onChange={(e) =>
                            setEditTransactionData({ ...editTransactionData, type: e.target.value as any })
                          }
                        >
                          <option value="thu">Thu</option>
                          <option value="chi">Chi</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          className="border px-2 py-1 w-44"
                          value={String(editTransactionData.categoryId ?? it.categoryId ?? "")}
                          onChange={(e) =>
                            setEditTransactionData({ ...editTransactionData, categoryId: e.target.value })
                          }
                        >
                          <option value="">-</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-white rounded ${status.cls}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button className="text-green-600 mr-2" onClick={saveEditTransaction}>
                          Lưu
                        </button>
                        <button className="text-gray-600" onClick={cancelEditTransaction}>
                          Hủy
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(editTransactionData.received ?? it.received)}
                          disabled={!it.approved}
                          title={!it.approved ? "Cần duyệt trước khi thu" : ""}
                          onChange={(e) =>
                            setEditTransactionData({ ...editTransactionData, received: e.target.checked })
                          }
                        />
                      </td>
                    </>
                  ) : (
                    /* ===== VIEW MODE ===== */
                    <>
                      <td className="p-3">{it.date ? new Date(it.date).toLocaleString() : "-"}</td>
                      <td className="p-3">{it.performedBy ?? "-"}</td>
                      <td className="p-3">{it.actorName ?? "-"}</td>
                      <td className="p-3">{it.amount != null ? formatNumberVN(it.amount) : "-"}</td>
                      <td className="p-3">
                        {String(it.type) === "INCOME" || String(it.type) === "thu" ? "Thu" : "Chi"}
                      </td>
                      <td className="p-3">
                        {categories.find((c) => String(c.id) === String(it.categoryId))?.name ?? "-"}
                      </td>

                      {/* trạng thái */}
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-white rounded ${status.cls}`}>
                          {status.text}
                        </span>
                      </td>

                      {/* hành động */}
                      <td className="p-3 text-center space-x-2">
                        <button className="text-blue-600" onClick={() => startEditTransaction(it)}>
                          Sửa
                        </button>

                        {canApproveTransaction(user) && !it.approved && handleApprove && (
                          <button className="text-green-700" onClick={() => handleApprove(it.id)}>
                            Duyệt
                          </button>
                        )}

                        {canSoftDelete(user) ? (
                          <button className="text-red-600" onClick={() => handleDelete(it.id)}>
                            Xóa
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* đã thu */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(it.received)}
                          disabled={!it.approved || it.received}
                          title={!it.approved ? "Cần duyệt trước khi thu" : ""}
                          onChange={(e) => toggleTransactionReceived(it.id, e.target.checked)}
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
