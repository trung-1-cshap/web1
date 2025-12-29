"use client";

import React, { useState } from "react";
import TransactionsTable from "./TransactionsTable";
import { Transaction, Category } from "../../../../lib/mockService";

type Props = {
  items: Transaction[];
  categories: Category[];
  user: any;
  handleDeleteTransaction: (id: string) => void;
  handleUpdateTransaction: (id: string, data: any) => void;
  handleAddTransaction: (data: any) => void;
  toggleTransactionReceived: (id: string, val: boolean) => void;
  
  // Props cho chức năng sửa
  editingTransaction: Transaction | null;
  editTransactionData: Partial<Transaction>;
  setEditTransactionData: (data: Partial<Transaction>) => void;
  startEditTransaction: (t: Transaction) => void;
  saveEditTransaction: () => Promise<void>;
  cancelEditTransaction: () => void;
};

export default function TransactionsSection({
  items,
  categories,
  user,
  handleDeleteTransaction,
  handleAddTransaction,
  
  // Truyền props xuống Table
  editingTransaction,
  editTransactionData,
  setEditTransactionData,
  startEditTransaction,
  saveEditTransaction,
  cancelEditTransaction
}: Props) {
    // State riêng cho Form thêm mới
    const [amount, setAmount] = useState<number | "">("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState<string | number>("");
    const [type, setType] = useState<"thu" | "chi">("thu");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));

    const onAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryId) return;

        handleAddTransaction({
            amount: Number(amount),
            description,
            categoryId,
            type,
            date: new Date(date).toISOString(),
            received: false,
            approved: false
        });

        // Reset form
        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().slice(0, 16));
    };

    return (
        <div className="space-y-6">
            {/* Form Thêm Giao Dịch */}
            <div className="bg-white p-4 rounded border shadow-sm mt-6">
                <h3 className="font-bold mb-4 text-gray-700">➕ Thêm giao dịch mới</h3>
                <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                     <div className="md:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Thời gian</label>
                        <input type="datetime-local" className="border p-2 rounded w-full text-sm" value={date} onChange={e => setDate(e.target.value)} required />
                     </div>
                     
                     <div className="md:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Loại</label>
                        <select className="border p-2 rounded w-full text-sm" value={type} onChange={(e: any) => setType(e.target.value)}>
                            <option value="thu">Thu (+)</option>
                            <option value="chi">Chi (-)</option>
                        </select>
                     </div>

                     <div className="md:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
                        <select className="border p-2 rounded w-full text-sm" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                            <option value="">-- Chọn --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>

                     <div className="md:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Số tiền</label>
                        <input type="number" placeholder="0" className="border p-2 rounded w-full text-sm font-bold" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                        <div className="flex gap-2">
                            <input placeholder="Nội dung chi tiết..." className="border p-2 rounded w-full text-sm" value={description} onChange={e => setDescription(e.target.value)} />
                            <button className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700 whitespace-nowrap">Thêm</button>
                        </div>
                     </div>
                </form>
            </div>

            {/* Bảng Danh Sách */}
            <TransactionsTable 
                items={items}
                categories={categories}
                user={user}
                handleDelete={handleDeleteTransaction}
                editingTransaction={editingTransaction}
                editTransactionData={editTransactionData}
                setEditTransactionData={setEditTransactionData}
                startEditTransaction={startEditTransaction}
                saveEditTransaction={saveEditTransaction}
                cancelEditTransaction={cancelEditTransaction}
            />
        </div>
    );
}