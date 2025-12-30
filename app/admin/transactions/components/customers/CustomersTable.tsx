"use client";

import React from "react";
import type { Customer } from "../../../../../lib/mockService";
import { formatVND } from "../../../../../lib/format";
import { canSoftDelete, canApproveTransaction } from "../../../../../lib/permissions";

type Props = {
  customers: Customer[];
  user: any;
  startEditCustomer: (c: Customer) => void;
  handleDeleteCustomer: (id: string) => Promise<void> | void;
  handleApproveCustomer: (id: string) => Promise<void> | void;
  toggleCustomerReceived?: (id: string, val: boolean) => Promise<void> | void;
};

export default function CustomersTable({
  customers,
  user,
  startEditCustomer,
  handleDeleteCustomer,
  handleApproveCustomer,
  toggleCustomerReceived,
}: Props) {
  // Safe check array
  const safeCustomers = Array.isArray(customers) ? customers : [];

  return (
    <div className="overflow-x-auto bg-white border rounded shadow-sm">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3">Tên khách hàng</th>
            <th className="px-4 py-3">SĐT</th>
            <th className="px-4 py-3 text-right">Tiền cọc</th>
            <th className="px-4 py-3 text-right">Tiền HĐ</th>
            <th className="px-4 py-3 text-center">Số tháng</th>
            <th className="px-4 py-3 text-right">Hoa hồng</th>
            <th className="px-4 py-3 text-center">%</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {safeCustomers.map((c) => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {c.name}
              </td>
              <td className="px-4 py-3">
                {c.phone ?? "-"}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                {c.depositAmount != null ? formatVND(c.depositAmount) : "-"}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                {c.contractAmount != null ? formatVND(c.contractAmount) : "-"}
              </td>
              <td className="px-4 py-3 text-center">
               {typeof c.contractValidityMonths === "number"
  ? `${c.contractValidityMonths} tháng`
  : "-"}

              </td>
              <td className="px-4 py-3 text-right font-bold text-green-600">
                {c.commission != null && (c.contractAmount ?? c.depositAmount) != null
                  ? formatVND(Math.round(Number(c.contractAmount ?? c.depositAmount) * (Number(c.commission) / 100)))
                  : "-"}
              </td>
              <td className="px-4 py-3 text-center">
                {c.commission != null ? `${c.commission}%` : "-"}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") : "-"}
              </td>
              
              <td className="px-4 py-3 text-center">
                <div className="flex flex-col gap-2 items-center">
                   {/* Nút Sửa */}
                  <button 
                    className="text-blue-600 hover:underline" 
                    onClick={() => startEditCustomer(c)}
                  >
                    Sửa
                  </button>

                  {/* Nút Xóa (Đã sửa lỗi Type ở đây) */}
                  {canSoftDelete(user) && (
                    <button 
                      className="text-red-600 hover:underline" 
                      onClick={() => handleDeleteCustomer(String(c.id))}
                    >
                      Xóa
                    </button>
                  )}

                  {/* Nút Duyệt */}
                  {c.approved ? (
                    <span className="text-xs text-green-600 border border-green-200 bg-green-50 px-2 py-1 rounded">
                      Đã duyệt
                    </span>
                  ) : canApproveTransaction(user) ? (
                    <button 
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      onClick={() => handleApproveCustomer(String(c.id))}
                    >
                      Duyệt
                    </button>
                  ) : (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      Chờ duyệt
                    </span>
                  )}

                  {/* Nút Thu (Đánh dấu đã thu) */}
                  {c.received ? (
                    <span className="text-xs text-green-700 border border-green-100 bg-green-50 px-2 py-1 rounded">
                      Đã thu
                    </span>
                  ) : canApproveTransaction(user) ? (
                    <button
                      className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                      onClick={() => toggleCustomerReceived && toggleCustomerReceived(String(c.id), true)}
                    >
                      Thu
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300">-</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {safeCustomers.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-400 italic">
                Chưa có khách hàng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}