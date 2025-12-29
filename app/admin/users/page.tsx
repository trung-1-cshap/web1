"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
// ❌ Đã xóa dòng import getUserPassword

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, listUsers, setUserRole, deleteUser, setPassword } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // ❌ Đã xóa state revealedPassword

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    async function load() {
      setLoading(true);
      const all = await listUsers();
      setUsers(all);
      setLoading(false);
    }
    load();
  }, [user, listUsers, router]);

  async function handleChangeRole(email: string, role: string) {
    await setUserRole(email, role);
    const all = await listUsers();
    setUsers(all);
  }

  async function handleDelete(email: string) {
    if (!confirm(`Xác nhận xóa người dùng ${email}?`)) return;
    try {
      await deleteUser(email);
      const all = await listUsers();
      setUsers(all);
    } catch (e: any) {
      alert(e?.message || 'Lỗi khi xóa người dùng');
    }
  }

  function openManage(u: any) {
    setSelectedUser(u);
    setNewPassword('');
  }

  function closeManage() {
    setSelectedUser(null);
    setNewPassword('');
  }

  async function handleSetPassword() {
    if (!selectedUser) return;
    if (!newPassword) return alert('Nhập mật khẩu mới');
    try {
      await setPassword(selectedUser.email, newPassword);
      alert('Đặt mật khẩu thành công');
      setNewPassword('');
    } catch (e: any) {
      alert(e?.message || 'Lỗi khi đặt mật khẩu');
    }
  }

  // ❌ Đã xóa function handleRevealPassword

  const rolesBase = ['user', 'accountant', 'manager', 'admin'];
  const specialRole = 'user_manager';
  const roleLabels: Record<string, string> = {
    user: 'user',
    accountant: 'accountant',
    manager: 'manager',
    admin: 'admin',
    [specialRole]: 'Quản lý người dùng',
  };
  const availableRoles = user?.role === 'admin' ? [...rolesBase, specialRole] : rolesBase;

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Quản lý người dùng</h1>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.email}>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <button onClick={() => openManage(u)} className="text-left w-full text-blue-600 underline">{u.name || '—'}</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <button onClick={() => openManage(u)} className="text-left w-full text-blue-600 underline">{u.email}</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <select
                      value={u.role || 'user'}
                      onChange={(e) => handleChangeRole(u.email, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {availableRoles.map((r) => (
                        <option key={r} value={r}>{roleLabels[r] || r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-28 text-center">
                    <button onClick={() => handleDelete(u.email)} className="bg-red-500 text-white px-3 py-1 rounded">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={closeManage} />
              <div className="relative bg-white rounded shadow-lg w-full max-w-md p-6 z-10">
                <h2 className="text-lg font-semibold mb-3">Quản lý: {selectedUser.name || selectedUser.email}</h2>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{selectedUser.email}</div>
                </div>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Vai trò hiện tại</div>
                  <div className="font-medium mb-2">{selectedUser.role || 'user'}</div>
                  <div>
                    <label className="text-sm">Đổi vai trò:</label>
                    <select className="ml-2 border rounded px-2 py-1" value={selectedUser.role || 'user'} onChange={async (e) => { await setUserRole(selectedUser.email, e.target.value); const all = await listUsers(); setUsers(all); const refreshed = all.find((x:any)=>x.email===selectedUser.email); setSelectedUser(refreshed || null); }}>
                      {availableRoles.map((r) => (
                        <option key={r} value={r}>{roleLabels[r] || r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Đặt mật khẩu mới</div>
                  <div className="flex gap-2 mt-2">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="border rounded px-3 py-2 flex-1" placeholder="Mật khẩu mới" />
                    <button onClick={handleSetPassword} className="bg-amber-500 text-white px-4 py-2 rounded">Đặt</button>
                  </div>
                  {/* ❌ Đã xóa nút hiện mật khẩu ở đây */}
                </div>
                <div className="flex justify-between">
                  <button onClick={() => { if (confirm(`Xác nhận xóa ${selectedUser.email}?`)) { handleDelete(selectedUser.email); closeManage(); } }} className="bg-red-500 text-white px-4 py-2 rounded">Xóa người dùng</button>
                  <button onClick={closeManage} className="px-4 py-2 rounded border">Đóng</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}