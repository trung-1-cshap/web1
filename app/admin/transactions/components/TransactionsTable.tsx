"use client";

import React from "react";
import type { Transaction, Category } from "../../../../lib/mockService";
import { formatNumberVN } from "../../../../lib/format";
import { canSoftDelete } from "../../../../lib/permissions";

type Props = {
  items: Transaction[];
  categories: Category[];
  user: any;
  editingTransaction: Transaction | null;
  editTransactionData: Partial<Transaction>;
  setEditTransactionData: (data: Partial<Transaction>) => void;
  startEditTransaction: (t: Transaction) => void;
  saveEditTransaction: () => Promise<void>;
  cancelEditTransaction: () => void;
  handleDelete: (id: string) => Promise<void> | void;
};

export default function TransactionsTable({
  items,
  categories,
  user,
  editingTransaction,
  editTransactionData,
  setEditTransactionData,
  startEditTransaction,
  saveEditTransaction,
  cancelEditTransaction,
  handleDelete,
}: Props) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="overflow-x-auto bg-white border rounded shadow-sm">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3">Ngày</th>
            <th className="px-4 py-3">Người nhập</th>
            {/* Đã xóa cột ActorName */}
            <th className="px-4 py-3">Số tiền</th>
            <th className="px-4 py-3">Loại</th>
            <th className="px-4 py-3">Danh mục</th>
            <th className="px-4 py-3">Mô tả</th>
            <th className="px-4 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {safeItems.map((it) => {
            const isEditing = editingTransaction?.id === it.id;

            return (
              <tr key={it.id} className="border-b hover:bg-gray-50">
                {/* 1. NGÀY */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      className="border rounded px-2 py-1 w-full"
                      value={
                        editTransactionData.date
                          ? new Date(editTransactionData.date).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditTransactionData({
                          ...editTransactionData,
                          date: e.target.value,
                        })
                      }
                    />
                  ) : (
                    it.date ? new Date(it.date).toLocaleString("vi-VN") : "-"
                  )}
                </td>

                {/* 2. NGƯỜI NHẬP */}
                <td className="px-4 py-3 text-gray-500">
                  {it.performedBy ?? user?.name ?? "Admin"}
                </td>

                {/* 3. SỐ TIỀN */}
                <td className="px-4 py-3 font-medium">
                  {isEditing ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-32"
                      value={editTransactionData.amount ?? 0}
                      onChange={(e) =>
                        setEditTransactionData({
                          ...editTransactionData,
                          amount: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    formatNumberVN(it.amount)
                  )}
                </td>

                {/* 4. LOẠI */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <select
                      className="border rounded px-2 py-1"
                      value={String(editTransactionData.type)}
                      onChange={(e) =>
                        setEditTransactionData({
                          ...editTransactionData,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="INCOME">Thu</option>
                      <option value="EXPENSE">Chi</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        String(it.type) === "INCOME" || String(it.type) === "thu"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {String(it.type) === "INCOME" || String(it.type) === "thu" ? "Thu" : "Chi"}
                    </span>
                  )}
                </td>

                {/* 5. DANH MỤC */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={editTransactionData.categoryId ?? ""}
                      onChange={(e) =>
                        setEditTransactionData({
                          ...editTransactionData,
                          categoryId: Number(e.target.value),
                        })
                      }
                    >
                      <option value="">-- Chọn --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    it.categoryName ??
                    categories.find((c) => String(c.id) === String(it.categoryId))?.name ??
                    "-"
                  )}
                </td>

                {/* 6. MÔ TẢ */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={editTransactionData.description ?? ""}
                      onChange={(e) =>
                        setEditTransactionData({
                          ...editTransactionData,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    it.description ?? "-"
                  )}
                </td>

                {/* 7. HÀNH ĐỘNG */}
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={saveEditTransaction}
                        className="text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-xs"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={cancelEditTransaction}
                        className="text-gray-600 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-xs"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => startEditTransaction(it)}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </button>
                      {canSoftDelete(user) && (
                        <button
                          onClick={() => handleDelete(String(it.id))}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}