"use client";

import React from "react";
import type { Transaction, Customer, Category } from "../../../../lib/mockService";
import { formatNumberVN, formatVND } from "../../../../lib/format";

type Props = {
  trash: Transaction[];
  customersTrash: Customer[];
  user?: any;
  categories: Category[];
  restoreFromTrash: (id: string) => void;
  restoreCustomerFromTrash: (id: string) => void;
  permanentlyDelete: (id: string) => Promise<void>;
  permanentlyDeleteCustomer: (id: string) => Promise<void>;
  permanentlyDeleteAll: () => Promise<void>;
  permanentlyDeleteAllCustomers: () => Promise<void>;
};

export default function TrashSection({
  trash,
  customersTrash,
  user,
  categories,
  restoreFromTrash,
  restoreCustomerFromTrash,
  permanentlyDelete,
  permanentlyDeleteCustomer,
  permanentlyDeleteAll,
  permanentlyDeleteAllCustomers,
}: Props) {
  
  // Safe array check
  const safeTrash = Array.isArray(trash) ? trash : [];
  const safeCustomersTrash = Array.isArray(customersTrash) ? customersTrash : [];

  return (
    <>
      <div className="bg-white border rounded p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Thùng rác</h3>
          <div>
            <button
              className="text-red-600 text-sm hover:underline"
              onClick={() => {
                if (!confirm("Xác nhận xóa hết giao dịch trong thùng rác?")) return;
                if (typeof permanentlyDeleteAll !== "undefined")
                  (permanentlyDeleteAll as any)();
                else alert("Chức năng chưa sẵn sàng");
              }}
            >
              Xóa hết
            </button>
          </div>
        </div>
        
        <h4 className="font-medium mb-3">Giao dịch đã xóa</h4>
        <div className="overflow-x-auto bg-white border rounded">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Ngày giờ</th>
                <th className="text-left p-3">Người thực hiện</th>
                {/* Đã xóa cột ActorName */}
                <th className="text-left p-3">Số tiền</th>
                <th className="text-left p-3">Loại</th>
                <th className="text-left p-3">Danh mục</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {safeTrash.map((t, i) => (
                <tr key={`${String(t.id ?? "")}-${i}`} className="border-t">
                  <td className="p-3 whitespace-normal break-words">
                    {t.date ? new Date(t.date).toLocaleString() : "-"}
                  </td>
                  <td className="p-3 whitespace-normal break-words">
                    {t.performedBy ?? "-"}
                  </td>
                  {/* Đã xóa ô ActorName */}
                  <td className="p-3 whitespace-normal break-words">
                    {t.amount != null ? formatNumberVN(t.amount) : "-"}
                  </td>
                  <td className="p-3 whitespace-normal break-words">
                    {String(t.type) === "INCOME" || String(t.type) === "thu"
                      ? "Thu"
                      : String(t.type) === "EXPENSE" || String(t.type) === "chi"
                      ? "Chi"
                      : String(t.type)}
                  </td>
                  <td className="p-3 whitespace-normal break-words">
                    {categories.find((c) => String(c.id) === String(t.categoryId))?.name ?? "-"}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className="text-green-600 mr-2 hover:underline"
                      onClick={() => restoreFromTrash(String(t.id))}
                    >
                      Khôi phục
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => permanentlyDelete(String(t.id))}
                    >
                      Xóa vĩnh viễn
                    </button>
                  </td>
                </tr>
              ))}
              {safeTrash.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">Thùng rác rỗng</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Khách hàng đã xóa</h4>
          <div>
            <button
              className="text-red-600 text-sm hover:underline"
              onClick={() => {
                if (!confirm("Xác nhận xóa hết khách hàng trong thùng rác?")) return;
                if (typeof permanentlyDeleteAllCustomers !== "undefined")
                  (permanentlyDeleteAllCustomers as any)();
                else alert("Chức năng chưa sẵn sàng");
              }}
            >
              Xóa hết
            </button>
          </div>
        </div>
        <div className="overflow-x-auto bg-white border rounded">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Tên</th>
                <th className="text-left p-3">SĐT</th>
                <th className="text-left p-3">Tiền cọc</th>
                <th className="text-left p-3">Tiền HĐ</th>
                <th className="text-left p-3">Hoa hồng</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {safeCustomersTrash.map((c, i) => (
                <tr key={`${String(c.id ?? "")}-${i}`} className="border-t">
                  <td className="p-3 whitespace-normal break-words">{c.name}</td>
                  <td className="p-3 whitespace-normal break-words">{c.phone ?? "-"}</td>
                  <td className="p-3 whitespace-normal break-words">
                    {c.depositAmount != null ? formatVND(c.depositAmount) : "-"}
                  </td>
                  <td className="p-3 whitespace-normal break-words">
                    {c.contractAmount != null ? formatVND(c.contractAmount) : "-"}
                  </td>
                  <td className="p-3 whitespace-normal break-words">
                    {c.commission != null ? `${c.commission}%` : "-"}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className="text-green-600 mr-2 hover:underline"
                      onClick={() => restoreCustomerFromTrash(String(c.id))}
                    >
                      Khôi phục
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => permanentlyDeleteCustomer(String(c.id))}
                    >
                      Xóa vĩnh viễn
                    </button>
                  </td>
                </tr>
              ))}
               {safeCustomersTrash.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">Thùng rác rỗng</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}