"use client";

import { useEffect, useState } from "react";
import { 
  getCategories, 
  addCategory, 
  deleteCategory, 
  type Category 
} from "../../../lib/mockService";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"thu" | "chi">("thu");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getCategories();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    
    await addCategory({ name, type });
    setName("");
    // Reload lại dữ liệu sau khi thêm
    await loadData();
  }

  // ✅ SỬA LỖI Ở ĐÂY: Cho phép id là string HOẶC number
  async function handleDelete(id: string | number) {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    
    await deleteCategory(id);
    // Reload lại dữ liệu sau khi xóa
    await loadData();
  }

  if (loading) return <div>Đang tải danh mục...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản Lý Danh Mục</h1>

      {/* Form thêm danh mục */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-8 bg-white p-4 rounded shadow">
        <input 
          className="border rounded px-3 py-2 flex-1" 
          placeholder="Tên danh mục (Ví dụ: Tiền nhà, Lương...)" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <select 
          className="border rounded px-3 py-2" 
          value={type} 
          onChange={(e) => setType(e.target.value as "thu" | "chi")}
        >
          <option value="thu">Khoản Thu (Income)</option>
          <option value="chi">Khoản Chi (Expense)</option>
        </select>
        <button className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700">
          Thêm
        </button>
      </form>

      {/* Danh sách danh mục */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột Thu */}
        <div>
          <h3 className="font-semibold text-lg text-green-600 mb-3 border-b pb-2">Khoản Thu</h3>
          <div className="space-y-2">
            {items.filter(i => i.type === 'thu' || i.type === 'INCOME').map((it) => (
              <div key={it.id} className="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                <span>{it.name}</span>
                <button 
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                  onClick={() => handleDelete(it.id)}
                >
                  Xóa
                </button>
              </div>
            ))}
            {items.filter(i => i.type === 'thu' || i.type === 'INCOME').length === 0 && (
              <p className="text-gray-400 text-sm italic">Chưa có danh mục thu nào</p>
            )}
          </div>
        </div>

        {/* Cột Chi */}
        <div>
          <h3 className="font-semibold text-lg text-red-600 mb-3 border-b pb-2">Khoản Chi</h3>
          <div className="space-y-2">
            {items.filter(i => i.type === 'chi' || i.type === 'EXPENSE').map((it) => (
              <div key={it.id} className="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                <span>{it.name}</span>
                <button 
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                  onClick={() => handleDelete(it.id)}
                >
                  Xóa
                </button>
              </div>
            ))}
             {items.filter(i => i.type === 'chi' || i.type === 'EXPENSE').length === 0 && (
              <p className="text-gray-400 text-sm italic">Chưa có danh mục chi nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}