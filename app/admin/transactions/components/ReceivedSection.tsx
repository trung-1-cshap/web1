"use client";

import React from "react";
import type { Transaction, Customer, Category } from "../../../../lib/mockService";
import { canSoftDelete } from "../../../../lib/permissions";
import { formatNumberVN, formatVND } from "../../../../lib/format";

type Props = {
  items: Transaction[];
  customers: Customer[];
  categories: Category[];
  user?: any;
  startEditTransaction: (t: Transaction) => void;
  handleDelete: (id: string) => Promise<void> | void;
  toggleTransactionReceived: (id: string, val: boolean) => Promise<void> | void;
  toggleCustomerReceived: (id: string, val: boolean) => Promise<void> | void;
};

export default function ReceivedSection({
  items,
  customers,
  categories,
  user,
  startEditTransaction,
  handleDelete,
  toggleTransactionReceived,
  toggleCustomerReceived,
}: Props) {
  // ✅ bảo vệ tuyệt đối
  const safeItems: Transaction[] = Array.isArray(items) ? items : [];
  const safeCustomers: Customer[] = Array.isArray(customers) ? customers : [];
  const safeCategories: Category[] = Array.isArray(categories) ? categories : [];

  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <h3 className="font-semibold mb-3 text-lg text-green-700">Giao Dịch Đã Thu</h3>

      {/* ================= GIAO DỊCH ================= */}
      <div className="mb-8">
        <h4 className="font-medium mb-3 border-b pb-2">Giao dịch đã thu</h4>

        <div className="overflow-x-auto bg-white border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 text-left">Ngày giờ</th>
                <th className="p-3 text-left">Người nhập</th>
                {/* ❌ Đã xóa cột "Người thu/chi" ở đây */}
                <th className="p-3 text-left">Số tiền</th>
                <th className="p-3 text-left">Loại</th>
                <th className="p-3 text-left">Danh mục</th>
                <th className="p-3 text-center">Hành động</th>
                <th className="p-3 text-center">Đã thu</th>
              </tr>
            </thead>

            <tbody>
              {safeItems
                .filter((it) => Boolean(it.received))
                .map((it, i) => (
                  <tr key={`${it.id}-${i}`} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {it.date ? new Date(it.date).toLocaleString("vi-VN") : "-"}
                    </td>
                    <td className="p-3">{it.performedBy ?? user?.name ?? "Admin"}</td>
                    {/* ❌ Đã xóa dòng it.actorName ở đây để fix lỗi Build */}
                    <td className="p-3 font-semibold">
                      {it.amount != null ? formatNumberVN(it.amount) : "-"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        String(it.type) === "INCOME" || String(it.type) === "thu" ? "bg-green-100 text-green-700" :
                        String(it.type) === "EXPENSE" || String(it.type) === "chi" ? "bg-red-100 text-red-700" : ""
                      }`}>
                        {String(it.type) === "INCOME" || String(it.type) === "thu"
                          ? "Thu"
                          : String(it.type) === "EXPENSE" || String(it.type) === "chi"
                          ? "Chi"
                          : String(it.type)}
                      </span>
                    </td>
                    <td className="p-3">
                      {safeCategories.find(
                        (c) => String(c.id) === String(it.categoryId)
                      )?.name ?? "-"}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        className="text-blue-600 mr-3 hover:underline"
                        onClick={() => startEditTransaction(it)}
                      >
                        Sửa
                      </button>
                      {canSoftDelete(user) ? (
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(String(it.id))}
                        >
                          Xóa
                        </button>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-green-600 rounded"
                        checked={Boolean(it.received)}
                        onChange={(e) =>
                          toggleTransactionReceived(String(it.id), e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
                {safeItems.filter((it) => Boolean(it.received)).length === 0 && (
                    <tr>
                        <td colSpan={7} className="p-4 text-center text-gray-400">Chưa có giao dịch nào đã thu</td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= KHÁCH HÀNG ================= */}
      <div>
        <h4 className="font-medium mb-3 border-b pb-2">Khách hàng đã thu</h4>

        <div className="overflow-x-auto bg-white border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 text-left">Tên</th>
                <th className="p-3 text-left">SĐT</th>
                <th className="p-3 text-left">Ngày GD</th>
                <th className="p-3 text-right">Cọc</th>
                <th className="p-3 text-right">Hợp đồng</th>
                <th className="p-3 text-right">Hoa hồng</th>
                <th className="p-3 text-center">% Hoa hồng</th>
                <th className="p-3 text-left">Ngày tạo</th>
                <th className="p-3 text-left">Sale</th>
                <th className="p-3 text-center">Đã thu</th>
              </tr>
            </thead>

            <tbody>
              {safeCustomers
                .filter((c) => Boolean(c.received))
                .map((c, i) => (
                  <tr key={`${c.id}-${i}`} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.phone ?? "-"}</td>
                    <td className="p-3 text-gray-600">
                      {c.depositDate
                        ? new Date(c.depositDate).toLocaleDateString("vi-VN")
                        : c.contractDate
                        ? new Date(c.contractDate).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {c.depositAmount != null
                        ? formatVND(c.depositAmount)
                        : "-"}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {c.contractAmount != null
                        ? formatVND(c.contractAmount)
                        : "-"}
                    </td>
                    <td className="p-3 text-right font-bold text-green-600">
                      {(() => {
                        if (c.commission == null) return "-";
                        const contract = c.contractAmount != null ? Number(c.contractAmount) : NaN;
                        const deposit = c.depositAmount != null ? Number(c.depositAmount) : NaN;
                        const base = Number.isFinite(contract) && contract > 0 ? contract : (Number.isFinite(deposit) ? deposit : null);
                        return base != null
                          ? formatVND(Math.round(base * (Number(c.commission) / 100)))
                          : "-";
                      })()}
                    </td>
                    <td className="p-3 text-center">
                      {c.commission != null ? `${c.commission}%` : "-"}
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString("vi-VN")
                        : "-"}
                    </td>
                    <td className="p-3">{c.performedBy ?? "-"}</td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-green-600 rounded"
                        checked={Boolean(c.received)}
                        onChange={(e) =>
                          toggleCustomerReceived(String(c.id), e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
                {safeCustomers.filter((c) => Boolean(c.received)).length === 0 && (
                    <tr>
                        <td colSpan={10} className="p-4 text-center text-gray-400">Chưa có khách hàng nào đã thu</td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}