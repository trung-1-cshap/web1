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
  permanentlyDeleteAllCustomers 
}: Props) {
  
  // Bảo vệ dữ liệu đầu vào
  const safeTrash = Array.isArray(trash) ? trash : [];
  const safeCustomersTrash = Array.isArray(customersTrash) ? customersTrash : [];

  return (
    <>
      <div className="bg-white border rounded p-4 shadow-sm border-red-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-red-700">🗑️ Thùng rác</h3>
          <div>
            <button 
              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm" 
              onClick={() => { 
                if (!confirm('Xác nhận xóa hết giao dịch trong thùng rác?')) return; 
                if (typeof permanentlyDeleteAll !== 'undefined') (permanentlyDeleteAll as any)(); 
                else alert('Chức năng chưa sẵn sàng'); 
              }}
            >
              Xóa tất cả
            </button>
          </div>
        </div>

        {/* === BẢNG GIAO DỊCH ĐÃ XÓA === */}
        <h4 className="font-medium mb-3 text-gray-700 border-b pb-1">Giao dịch đã xóa</h4>
        <div className="overflow-x-auto bg-gray-50 border rounded">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3">Ngày giờ</th>
                <th className="p-3">Người nhập</th>
                {/* ❌ Đã xóa cột Người thu/chi (actorName) */}
                <th className="p-3">Số tiền</th>
                <th className="p-3">Loại</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {safeTrash.map((t, i) => (
                <tr key={`${String(t.id ?? '')}-${i}`} className="border-t hover:bg-red-50">
                  <td className="p-3 whitespace-normal break-words">
                    {t.date ? new Date(t.date).toLocaleString("vi-VN") : "-"}
                  </td>
                  <td className="p-3 whitespace-normal break-words">
                    {t.performedBy ?? user?.name ?? "Admin"}
                  </td>
                  {/* ❌ Đã xóa dòng t.actorName ở đây */}
                  <td className="p-3 font-medium">
                    {t.amount != null ? formatNumberVN(t.amount) : "-"}
                  </td>
                  <td className="p-3 whitespace-normal break-words">
                    <span className={`px-2 py-1 rounded text-xs ${
                        String(t.type) === 'INCOME' || String(t.type) === 'thu' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'
                    }`}>
                        {String(t.type) === 'INCOME' || String(t.type) === 'thu' ? 'Thu' : 
                         String(t.type) === 'EXPENSE' || String(t.type) === 'chi' ? 'Chi' : String(t.type)}
                    </span>
                  </td>
                  <td className="p-3 whitespace-normal break-words">
                    {categories.find((c) => String(c.id) === String(t.categoryId))?.name ?? "-"}
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      className="text-blue-600 hover:underline mr-3" 
                      onClick={() => restoreFromTrash(String(t.id))}
                    >
                      Khôi phục
                    </button>
                    <button 
                      className="text-red-600 hover:underline font-bold" 
                      onClick={() => permanentlyDelete(String(t.id))}
                    >
                      Xóa vĩnh viễn
                    </button>
                  </td>
                </tr>
              ))}
              {safeTrash.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400 italic">Thùng rác rỗng</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* === BẢNG KHÁCH HÀNG ĐÃ XÓA === */}
      <div className="mt-8 bg-white border rounded p-4 shadow-sm border-red-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-700 border-b pb-1 w-full">Khách hàng đã xóa</h4>
          <div className="ml-4 min-w-max">
            <button 
              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm" 
              onClick={() => { 
                if (!confirm('Xác nhận xóa hết khách hàng trong thùng rác?')) return; 
                if (typeof permanentlyDeleteAllCustomers !== 'undefined') (permanentlyDeleteAllCustomers as any)(); 
                else alert('Chức năng chưa sẵn sàng'); 
              }}
            >
              Xóa tất cả
            </button>
          </div>
        </div>
        <div className="overflow-x-auto bg-gray-50 border rounded">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3">Tên</th>
                <th className="p-3">SĐT</th>
                <th className="p-3 text-right">Tiền cọc</th>
                <th className="p-3 text-right">Tiền HĐ</th>
                <th className="p-3 text-center">Hoa hồng</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {safeCustomersTrash.map((c, i) => (
                <tr key={`${String(c.id ?? '')}-${i}`} className="border-t hover:bg-red-50">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{c.phone ?? '-'}</td>
                  <td className="p-3 text-right text-gray-600">
                    {c.depositAmount != null ? formatVND(c.depositAmount) : '-'}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {c.contractAmount != null ? formatVND(c.contractAmount) : '-'}
                  </td>
                  <td className="p-3 text-center">
                    {c.commission != null ? `${c.commission}%` : '-'}
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      className="text-blue-600 hover:underline mr-3" 
                      onClick={() => restoreCustomerFromTrash(String(c.id))}
                    >
                      Khôi phục
                    </button>
                    <button 
                      className="text-red-600 hover:underline font-bold" 
                      onClick={() => permanentlyDeleteCustomer(String(c.id))}
                    >
                      Xóa vĩnh viễn
                    </button>
                  </td>
                </tr>
              ))}
               {safeCustomersTrash.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400 italic">Thùng rác rỗng</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}