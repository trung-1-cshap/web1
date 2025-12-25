"use client"

import { useEffect, useState } from "react";
import { getCategories, addCategory, updateCategory, deleteCategory, type Category } from "../../../lib/mockService";

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"thu" | "chi">("thu");
  

  useEffect(() => {
    getCategories().then((cats) => setItems((cats || []).filter((c) => (c.name || '').trim() !== 'Uncategorized')));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    // ngăn tên danh mục trùng lặp (không phân biệt hoa thường)
    const norm = name.trim().toLowerCase();
    if (norm === 'uncategorized') {
      alert('Tên "Uncategorized" không được phép');
      return;
    }
    if (items.some(i => (i.name || '').trim().toLowerCase() === norm)) {
      alert('Danh mục này đã tồn tại');
      return;
    }
    const created = await addCategory({ name, type });
    // nếu backend trả về 'Uncategorized', không hiển thị
    if ((created.name || '').trim() === 'Uncategorized') {
      setName("");
      return;
    }
    setItems((s) => [created, ...s]);
    setName("");
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id);
      setItems((s) => s.filter((x) => String(x.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete category', err);
      alert('Xóa danh mục thất bại: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Quản lý Danh mục</h2>
      

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Tên danh mục" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="thu">Thu</option>
          <option value="chi">Chi</option>
        </select>
        <button className="bg-slate-800 text-white px-4 py-2 rounded">Thêm</button>
      </form>

      <div className="bg-white border rounded">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Tên</th>
              <th className="text-left p-3">Loại</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-3">{it.name}</td>
                <td className="p-3">{(String(it.type) === 'INCOME' || String(it.type) === 'thu') ? 'Thu' : (String(it.type) === 'EXPENSE' || String(it.type) === 'chi') ? 'Chi' : String(it.type)}</td>
                <td className="p-3 text-center">
                  <button className="text-red-600" onClick={() => handleDelete(it.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
