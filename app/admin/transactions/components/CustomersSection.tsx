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
  const [newDeposit, setNewDeposit] = useState<number | "">("");
  const [newContract, setNewContract] = useState<number | "">("");
  const [newContractMonths, setNewContractMonths] = useState<number | "">("");
  const [newCommission, setNewCommission] = useState<number | "">("");

  // State cho form sửa
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDeposit, setEditDeposit] = useState<number | "">("");
  const [editContract, setEditContract] = useState<number | "">("");
  const [editContractMonths, setEditContractMonths] = useState<number | "">("");
  const [editCommission, setEditCommission] = useState<number | "">("");

  // Bắt đầu sửa
  function startEditCustomer(c: Customer) {
    setEditingCustomer(c);
    setEditName(c.name);
    setEditPhone(c.phone || "");
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
      depositAmount: editDeposit === "" ? 0 : Number(editDeposit),
      contractAmount: editContract === "" ? 0 : Number(editContract),
      contractValidityMonths: editContractMonths === "" ? undefined : Number(editContractMonths),
      commission: editCommission === "" ? 0 : Number(editCommission),
    });
    cancelEdit();
  }

  // Thêm mới
  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName) return;
    await handleAddCustomer({
      name: newName,
      phone: newPhone,
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
    setNewDeposit("");
    setNewContract("");
    setNewContractMonths("");
    setNewCommission("");
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        👥 Quản lý Khách hàng
      </h3>

      {/* Form thêm khách hàng */}
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
            className="border p-2 rounded"
            placeholder="Số điện thoại"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Tiền cọc"
            value={newDeposit}
            onChange={(e) => setNewDeposit(e.target.value ? Number(e.target.value) : "")}
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Tiền Hợp đồng"
            value={newContract}
            onChange={(e) => setNewContract(e.target.value ? Number(e.target.value) : "")}
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Số tháng hợp đồng"
            value={newContractMonths}
            onChange={(e) => setNewContractMonths(e.target.value ? Number(e.target.value) : "")}
          />
          <div className="flex gap-2">
            <input
              type="number"
              className="border p-2 rounded w-24"
              placeholder="% HH"
              value={newCommission}
              onChange={(e) => setNewCommission(e.target.value ? Number(e.target.value) : "")}
            />
            <button className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 flex-1">
              Thêm
            </button>
          </div>
        </div>
      </form>

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

      {/* Bảng danh sách khách hàng */}
      <CustomersTable
        customers={customers}
        user={user}
        startEditCustomer={startEditCustomer}
        handleDeleteCustomer={handleDeleteCustomer}
        // ✅ FIX LỖI Ở ĐÂY: Thêm hàm dự phòng (async () => {}) nếu handleApproveCustomer bị null
        handleApproveCustomer={handleApproveCustomer ?? (async () => {})}
        toggleCustomerReceived={toggleCustomerReceived}
      />
    </div>
  );
}