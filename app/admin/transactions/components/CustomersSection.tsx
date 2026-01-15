"use client";

import React, { useState } from "react";
import type { Customer } from "../../../../lib/mockService";
import CustomersTable from "./customers/CustomersTable";

// Định nghĩa Props
type Props = {
  customers: Customer[];
  user: any;
  handleAddCustomer: (data: Omit<Customer, "id">) => Promise<void> | void;
  handleUpdateCustomer: (id: string, data: Partial<Customer>) => Promise<void> | void;
  handleDeleteCustomer: (id: string) => Promise<void> | void;
  toggleCustomerReceived: (id: string, val: boolean) => Promise<void> | void;
  // Dấu ? ở đây nghĩa là prop này có thể undefined (không bắt buộc)
  handleApproveCustomer?: (id: string) => Promise<void> | void;
};

export default function CustomersSection({
  customers,
  user,
  handleAddCustomer,
  handleUpdateCustomer,
  handleDeleteCustomer,
  toggleCustomerReceived,
  handleApproveCustomer,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // State cho form thêm mới
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newDeposit, setNewDeposit] = useState<number | "">("");
  const [newContract, setNewContract] = useState<number | "">("");
  const [newContractMonths, setNewContractMonths] = useState<number | "">("");
  const [newCommission, setNewCommission] = useState<number | "">("");
  const [searchName, setSearchName] = useState("");

  // State cho form sửa
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editDeposit, setEditDeposit] = useState<number | "">("");
  const [editContract, setEditContract] = useState<number | "">("");
  const [editContractMonths, setEditContractMonths] = useState<number | "">("");
  const [editCommission, setEditCommission] = useState<number | "">("");

  // Bắt đầu sửa
  function startEditCustomer(c: Customer) {
    setEditingCustomer(c);
    setEditName(c.name);
    setEditPhone(c.phone || "");
    setEditNote(c.note || "");
    setEditDeposit(c.depositAmount || "");
    setEditContract(c.contractAmount || "");
    setEditContractMonths(c.contractValidityMonths ?? "");
    setEditCommission(c.commission || "");
    setIsEditing(true);
  }

  // Hủy sửa
  function cancelEdit() {
    setIsEditing(false);
    setEditingCustomer(null);
  }

  // Lưu sửa
  async function saveEdit() {
    if (!editingCustomer) return;
    await handleUpdateCustomer(String(editingCustomer.id), {
      name: editName,
      phone: editPhone,
      note: editNote,
      depositAmount: editDeposit === "" ? 0 : Number(editDeposit),
      contractAmount: editContract === "" ? 0 : Number(editContract),
      contractValidityMonths: editContractMonths === "" ? undefined : Number(editContractMonths),
      commission: editCommission === "" ? 0 : Number(editCommission),
    });
    cancelEdit();
  }
  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName) return;
    await handleAddCustomer({
      name: newName,
      phone: newPhone,
      note: newNote,
      depositAmount: newDeposit === "" ? 0 : Number(newDeposit),
      contractAmount: newContract === "" ? 0 : Number(newContract),
      contractValidityMonths: newContractMonths === "" ? undefined : Number(newContractMonths),
      commission: newCommission === "" ? 0 : Number(newCommission),
      received: false,
      approved: false,
    });

    // Reset form
    setNewName("");
    setNewPhone("");
    setNewNote("");
    setNewDeposit("");
    setNewContract("");
    setNewContractMonths("");
    setNewCommission("");
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        Quản lý Khách hàng
      </h3>

      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2">
          <button onClick={async () => {
            const rows = customers.map(c => ({
              ID: c.id,
              Name: c.name,
              Phone: c.phone || "",
              Email: c.email || "",
              DepositAmount: Number(c.depositAmount ?? 0),
              ContractAmount: Number(c.contractAmount ?? 0),
              Received: Boolean(c.received),
              CreatedAt: c.createdAt || ""
            }));
            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Customers');
            XLSX.writeFile(wb, 'customers.xlsx');
          }} title="Xuất tất cả khách hàng ra file Excel" aria-label="Xuất Excel khách hàng" className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-500 ml-2">Xuất Excel</button>
        </div>
      </div>

      {/* Form thêm khách hàng */}
      {String(user?.role ?? "").toLowerCase() !== "manager" ? (
        <form onSubmit={onAdd} className="bg-gray-50 p-4 rounded mb-6 border border-gray-200">
          <h4 className="font-medium mb-3 text-gray-700">Thêm khách hàng mới</h4>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Tên khách hàng (*)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <input
              inputMode="numeric"
              pattern="\\d*"
              className="border p-2 rounded"
              placeholder="Số điện thoại"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value.replace(/\\D/g, ''))}
            />
            <input
              className="border p-2 rounded"
              placeholder="Ghi chú"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <input
              inputMode="decimal"
              className="border p-2 rounded"
              placeholder="Tiền cọc"
              value={newDeposit}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '');
                setNewDeposit(v === '' ? '' : Number(v));
              }}
            />
            <input
              inputMode="decimal"
              className="border p-2 rounded"
              placeholder="Tiền Hợp đồng"
              value={newContract}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '');
                setNewContract(v === '' ? '' : Number(v));
              }}
            />
            <input
              inputMode="numeric"
              pattern="\\d*"
              className="border p-2 rounded"
              placeholder="Số tháng hợp đồng"
              value={newContractMonths}
              onChange={(e) => {
                const v = e.target.value.replace(/\\D/g, '');
                setNewContractMonths(v === '' ? '' : Number(v));
              }}
            />
            <div className="flex gap-2">
              <input
                inputMode="decimal"
                className="border p-2 rounded w-24"
                placeholder="% HH"
                value={newCommission}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '');
                  setNewCommission(v === '' ? '' : Number(v));
                }}
              />
              <button className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 flex-1">
                Thêm
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded mb-6 border border-gray-200 text-sm text-gray-600">Bạn không có quyền tạo khách hàng.</div>
      )}

          {/* Tìm kiếm khách hàng (nằm dưới form thêm khách hàng) */}
          <div className="mb-4">
            <input
              type="search"
              placeholder="Tìm khách hàng theo tên, SĐT hoặc ghi chú..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border p-2 rounded text-sm w-full md:w-64 hover:shadow-md hover:border-gray-300 transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Modal Sửa Khách Hàng */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Sửa thông tin khách hàng</h3>
            <div className="flex flex-col gap-3">
              <input
                className="border p-2 rounded"
                placeholder="Tên"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="SĐT"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="Ghi chú"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                    type="number"
                    className="border p-2 rounded"
                    placeholder="Tiền cọc"
                    value={editDeposit}
                    onChange={(e) => setEditDeposit(e.target.value ? Number(e.target.value) : "")}
                />
                <input
                    type="number"
                    className="border p-2 rounded"
                    placeholder="Tiền HĐ"
                    value={editContract}
                    onChange={(e) => setEditContract(e.target.value ? Number(e.target.value) : "")}
                />
                <input
                    type="number"
                    className="border p-2 rounded"
                    placeholder="Số tháng hợp đồng"
                    value={editContractMonths}
                    onChange={(e) => setEditContractMonths(e.target.value ? Number(e.target.value) : "")}
                />
              </div>
              <input
                type="number"
                className="border p-2 rounded"
                placeholder="% Hoa hồng"
                value={editCommission}
                onChange={(e) => setEditCommission(e.target.value ? Number(e.target.value) : "")}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={cancelEdit} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bảng danh sách khách hàng (có lọc client-side theo tên / SĐT / ghi chú) */}
      {
        (() => {
          const q = String(searchName ?? "").trim().toLowerCase();
          const filtered = q === "" ? customers : (Array.isArray(customers) ? customers.filter(c => {
            return (
              (c.name ?? "").toString().toLowerCase().includes(q) ||
              (c.phone ?? "").toString().toLowerCase().includes(q) ||
              (c.note ?? "").toString().toLowerCase().includes(q)
            );
          }) : customers);

          return (
            <CustomersTable
              customers={filtered}
              user={user}
              startEditCustomer={startEditCustomer}
              handleDeleteCustomer={handleDeleteCustomer}
              // ✅ FIX LỖI Ở ĐÂY: Thêm hàm dự phòng (async () => {}) nếu handleApproveCustomer bị null
              handleApproveCustomer={handleApproveCustomer ?? (async () => {})}
              toggleCustomerReceived={toggleCustomerReceived}
            />
          );
        })()
      }
    </div>
  );
}