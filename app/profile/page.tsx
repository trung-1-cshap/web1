"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
// ❌ Đã xóa dòng import getUserPassword
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, register, listUsers, deleteUser } = useAuth();
  const router = useRouter();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newName, setNewName] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (user?.role === 'admin') {
        try {
          const all = await listUsers();
          setUsersList(all);
        } catch (e) {}
      }
    }
    load();
  }, [user, listUsers]);

  if (!user) return <div className="p-6">Bạn cần đăng nhập để xem trang này.</div>;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await updateProfile({ name });
      setMsg('Cập nhật thông tin thành công');
    } catch (err: any) {
      setMsg(err?.message || 'Lỗi');
    }
  }

  async function handleChangePwd(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await changePassword(oldPwd, newPwd);
      setMsg('Đổi mật khẩu thành công');
      setOldPwd('');
      setNewPwd('');
    } catch (err: any) {
      setMsg(err?.message || 'Lỗi');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Thông tin người dùng</h2>
      <form onSubmit={saveProfile} className="flex flex-col gap-3">
        <label className="text-sm">Email</label>
        <div className="p-2 bg-slate-100 rounded">{user.email}</div>
        <label className="text-sm">Tên</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-3 py-2" />
        <button className="bg-amber-500 text-white px-4 py-2 rounded">Lưu thông tin</button>
      </form>

      <h3 className="text-lg font-semibold mt-6">Đổi mật khẩu</h3>
      <form onSubmit={handleChangePwd} className="flex flex-col gap-3 mt-2">
        <div className="relative">
          <input value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} type={showOld ? 'text' : 'password'} placeholder="Mật khẩu cũ" className="border rounded px-3 py-2 w-full" />
          <button type="button" onClick={() => setShowOld(s => !s)} className="absolute right-2 top-2 text-slate-600">
            {showOld ? "Ẩn" : "Hiện"}
          </button>
        </div>
        <div className="relative">
          <input value={newPwd} onChange={(e) => setNewPwd(e.target.value)} type={showNew ? 'text' : 'password'} placeholder="Mật khẩu mới" className="border rounded px-3 py-2 w-full" />
          <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-2 top-2 text-slate-600">
            {showNew ? "Ẩn" : "Hiện"}
          </button>
        </div>
        <button className="bg-slate-800 text-white px-4 py-2 rounded">Đổi mật khẩu</button>
      </form>

      {msg && <div className="mt-4 text-sm">{msg}</div>}

      {user.role === 'admin' && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Quản lý người dùng (Admin)</h3>
          <div className="flex gap-2 mb-4">
            <button onClick={() => router.push('/admin/users')} className="bg-slate-800 text-white px-4 py-2 rounded">Mở trang quản lý</button>
          </div>

          <div className="mb-4 border p-4 rounded">
            <div className="text-sm text-gray-600 mb-2">Thêm người dùng (gmail.com, mật khẩu mạnh)</div>
            <input placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="border rounded px-3 py-2 w-full mb-2" />
            <input placeholder="Mật khẩu" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="border rounded px-3 py-2 w-full mb-2" />
            <input placeholder="Tên" value={newName} onChange={(e) => setNewName(e.target.value)} className="border rounded px-3 py-2 w-full mb-2" />
            <button onClick={async () => {
              try {
                await register(newEmail, newPass, newName || undefined);
                setNewEmail(''); setNewPass(''); setNewName('');
                const all = await listUsers(); setUsersList(all);
                alert('Thêm người dùng thành công');
              } catch (e: any) { alert(e?.message || 'Lỗi thêm người dùng'); }
            }} className="bg-amber-500 text-white px-4 py-2 rounded">Thêm</button>
          </div>

          <div className="border p-4 rounded">
            <div className="text-sm text-gray-600 mb-2">Danh sách người dùng</div>
            <ul className="space-y-2">
              {usersList.map(u => (
                <li key={u.email} className="flex items-center justify-between border rounded px-3 py-2">
                  <div>
                    <div className="font-medium">{u.name || '—'}</div>
                    <div className="text-sm text-gray-600">{u.email} • {u.role}</div>
                  </div>
                  <div className="flex gap-2">
                    {/* ❌ Đã xóa nút Hiện mật khẩu ở đây */}
                    <button onClick={async () => { if (confirm(`Xóa ${u.email}?`)) { try { await deleteUser(u.email); const all = await listUsers(); setUsersList(all); alert('Đã xóa'); } catch (e:any) { alert(e?.message || 'Lỗi'); } } }} className="bg-red-500 text-white px-3 py-1 rounded">Xóa</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}