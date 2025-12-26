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
}: Props)

 {
  const safeItems: Transaction[] = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white border rounded p-4">
      <h3 className="font-semibold mb-3">Đã thu</h3>

      {/* ================= GIAO DỊCH ================= */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Giao dịch đã thu</h4>

        <div className="overflow-x-auto bg-white border rounded">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Ngày giờ</th>
                <th className="p-3 text-left">Người thực hiện</th>
                <th className="p-3 text-left">Người thu/chi</th>
                <th className="p-3 text-left">Số tiền</th>
                <th className="p-3 text-left">Loại</th>
                <th className="p-3 text-left">Danh mục</th>
                <th className="p-3 text-center">Hành động</th>
                <th className="p-3 text-center">Đã thu</th>
              </tr>
            </thead>

            <tbody>
              {safeItems
                .filter((it) => it.received)
                .map((it, i) => (
                  <tr key={`${it.id}-${i}`} className="border-t">
                    <td className="p-3">{it.date ? new Date(it.date).toLocaleString() : "-"}</td>
                    <td className="p-3">{it.performedBy ?? user?.name ?? "-"}</td>
                    <td className="p-3">{it.actorName ?? "-"}</td>
                    <td className="p-3">{it.amount != null ? formatNumberVN(it.amount) : "-"}</td>
                    <td className="p-3">
                      {String(it.type) === "INCOME" || String(it.type) === "thu" ? "Thu" :
                       String(it.type) === "EXPENSE" || String(it.type) === "chi" ? "Chi" : String(it.type)}
                    </td>
                    <td className="p-3">
                      {categories.find((c) => String(c.id) === String(it.categoryId))?.name ?? "-"}
                    </td>
                    <td className="p-3 text-center">
                      <button className="text-blue-600 mr-2" onClick={() => startEditTransaction(it)}>
                        Sửa
                      </button>
                      {canSoftDelete(user) ? (
                        <button className="text-red-600" onClick={() => handleDelete(it.id)}>
                          Xóa
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(it.received)}
                        onChange={(e) => toggleTransactionReceived(it.id, e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= KHÁCH HÀNG ================= */}
      <div>
        <h4 className="font-medium mb-2">Khách hàng đã thu</h4>

        <div className="overflow-x-auto bg-white border rounded">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Tên</th>
                <th className="p-3 text-left">SĐT</th>
                <th className="p-3 text-left">Ngày</th>
                <th className="p-3 text-left">Tiền cọc</th>
                <th className="p-3 text-left">Tiền hợp đồng</th>
                <th className="p-3 text-left">Tiền hoa hồng</th>
                <th className="p-3 text-left">Hoa hồng</th>
                <th className="p-3 text-left">Ngày giờ</th>
                <th className="p-3 text-left">Thực hiện</th>
                <th className="p-3 text-center">Đã thu</th>
              </tr>
            </thead>

            <tbody>
              {customers
                .filter((c) => c.received)
                .map((c, i) => (
                  <tr key={`${c.id}-${i}`} className="border-t">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.phone ?? "-"}</td>
                    <td className="p-3">
                      {c.depositDate
                        ? new Date(c.depositDate).toLocaleDateString()
                        : c.contractDate
                        ? new Date(c.contractDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3">{c.depositAmount != null ? formatVND(c.depositAmount) : "-"}</td>
                    <td className="p-3">{c.contractAmount != null ? formatVND(c.contractAmount) : "-"}</td>
                    <td className="p-3">
                      {c.commission != null && (c.contractAmount ?? c.depositAmount) != null
                        ? formatVND(
                            Math.round(
                              Number(c.contractAmount ?? c.depositAmount) *
                                (Number(c.commission) / 100)
                            )
                          )
                        : "-"}
                    </td>
                    <td className="p-3">{c.commission != null ? `${c.commission}%` : "-"}</td>
                    <td className="p-3">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</td>
                    <td className="p-3">{c.performedBy ?? "-"}</td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(c.received)}
                        onChange={(e) => toggleCustomerReceived(c.id, e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
