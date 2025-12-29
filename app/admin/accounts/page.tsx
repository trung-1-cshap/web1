"use client"

import { useEffect, useState } from "react";
import { getAccounts, addAccount, transferBetweenAccounts, type Account } from "../../../lib/mockService";

export default function AccountsPage() {
  const [items, setItems] = useState<Account[]>([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);

  // ✅ SỬA: Cho phép state nhận cả chuỗi và số (vì ID từ DB là số)
  // Và để mặc định là "" (chuỗi rỗng) thay vì null
  const [from, setFrom] = useState<string | number>("");
  const [to, setTo] = useState<string | number>("");
  
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    getAccounts().then((a) => {
      setItems(a);
      // ✅ Code này giờ sẽ chạy ngon, không báo lỗi đỏ nữa
      if (a.length >= 2) {
        setFrom(a[0].id);
        setTo(a[1].id);
      } else if (a.length === 1) {
        setFrom(a[0].id);
      }
    });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    const created = await addAccount({ name, balance });
    setItems((s) => [created, ...s]);
    setName("");
    setBalance(0);
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    // Kiểm tra from/to khác rỗng và số tiền hợp lệ
    if (!from || !to || from === to || amount <= 0) return;
    
    const ok = await transferBetweenAccounts(from, to, amount);
    if (ok) {
      alert("Chuyển khoản thành công!"); // Thêm thông báo cho dễ biết
      const refreshed = await getAccounts();
      setItems(refreshed);
    } else {
      alert("Chuyển khoản thất bại (Chưa có API chuyển khoản)");
    }
    setAmount(0);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Quản lý Tài khoản</h2>

      {/* Form Thêm Tài Khoản */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input 
            className="border rounded px-3 py-2 flex-1" 
            placeholder="Tên tài khoản" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
        />
        <input 
            type="number" 
            className="border rounded px-3 py-2" 
            placeholder="Số dư" 
            value={balance || ""} 
            onChange={(e) => setBalance(Number(e.target.value))} 
        />
        <button className="bg-slate-800 text-white px-4 py-2 rounded">Thêm</button>
      </form>

      {/* Danh sách Tài khoản */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {items.map((a) => (
          <div key={a.id} className="border rounded p-3 bg-white shadow-sm">
            <div className="font-semibold">{a.name}</div>
            <div className="text-sm text-gray-600">
                {Number(a.balance).toLocaleString('vi-VN')} đ
            </div>
            <div className="text-xs text-gray-400 mt-1">ID: {a.id}</div>
          </div>
        ))}
      </div>

      {/* Form Chuyển Khoản */}
      <div className="bg-gray-50 p-4 rounded border">
        <h3 className="font-medium mb-2">Chuyển khoản nội bộ</h3>
        <form onSubmit={handleTransfer} className="flex gap-2 items-center flex-wrap">
            <select 
                className="border rounded px-3 py-2" 
                value={from} 
                onChange={(e) => setFrom(e.target.value)}
            >
            <option value="">Từ tài khoản...</option>
            {items.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>

            <span>➡️</span>

            <select 
                className="border rounded px-3 py-2" 
                value={to} 
                onChange={(e) => setTo(e.target.value)}
            >
            <option value="">Đến tài khoản...</option>
            {items.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>

            <input 
                type="number" 
                className="border rounded px-3 py-2 w-32" 
                placeholder="Số tiền" 
                value={amount || ""} 
                onChange={(e) => setAmount(Number(e.target.value))} 
            />
            <button className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded text-white transition-colors">
                Chuyển
            </button>
        </form>
      </div>
    </div>
  );
}