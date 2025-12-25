"use client"

import React, { useEffect, useState } from "react";
import { getCustomers, addCustomer, deleteCustomer, updateCustomer, type Customer } from "../../../../lib/mockService";

export default function useCustomers(user?: any, setFlashMsg?: (s: string | null) => void) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custDateType, setCustDateType] = useState<"deposit" | "contract">("deposit");
  const [custDate, setCustDate] = useState("");
  const [custDepositAmount, setCustDepositAmount] = useState("");
  const [custContractAmount, setCustContractAmount] = useState("");
  const [custCommission, setCustCommission] = useState("");

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editCustomerData, setEditCustomerData] = useState<Partial<Customer>>({});

  const [customersTrash, setCustomersTrash] = useState<Customer[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('customers_trash') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('customers_trash', JSON.stringify(customersTrash)); } catch {}
    }
  }, [customersTrash]);

  useEffect(() => {
    getCustomers().then(setCustomers).catch(() => {});
  }, []);

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!custName) return;
    const created = await addCustomer({
      name: custName,
      phone: custPhone || undefined,
      depositDate: custDateType === "deposit" && custDate ? new Date(custDate).toISOString() : undefined,
      depositAmount: custDateType === "deposit" && custDepositAmount ? Number(custDepositAmount) : undefined,
      contractDate: custDateType === "contract" && custDate ? new Date(custDate).toISOString() : undefined,
      contractAmount: custDateType === "contract" && custContractAmount ? Number(custContractAmount) : undefined,
      // Lưu `commission` bất kể loại ngày (có thể nhập hoa hồng cho tiền cọc hoặc hợp đồng)
      commission: custCommission ? Math.max(0, Math.min(100, Number(custCommission))) : undefined,
      createdAt: new Date().toISOString(),
      performedBy: user?.name ?? "-",
    });
    setCustomers((s) => [created, ...s]);
    setCustName(""); setCustPhone(""); setCustDate(""); setCustDateType("deposit"); setCustDepositAmount(""); setCustContractAmount(""); setCustCommission("");
  }

  async function handleDeleteCustomer(id: string) {
    const c = customers.find((x) => String(x.id) === String(id));
    if (!c) return;
    setCustomers((s) => s.filter((x) => String(x.id) !== String(id)));
    setCustomersTrash((s) => [c, ...s]);
    setFlashMsg?.('Đã chuyển khách hàng vào Thùng rác');
    window.setTimeout(() => setFlashMsg?.(null), 3000);
    try { await deleteCustomer(id); } catch (err) { console.warn('deleteCustomer failed', err); }
  }

  async function toggleCustomerReceived(id: string, val: boolean) {
    const updated = await updateCustomer(id, { received: val });
    if (updated) setCustomers((s) => s.map((c) => String(c.id) === String(updated.id) ? updated : c));
  }

  async function handleApproveCustomer(id: string) {
    const approver = user?.name ?? user?.email ?? 'system';
    try {
      const updated = await updateCustomer(id, { approved: true, approvedBy: approver, approvedAt: new Date().toISOString() });
      if (updated) setCustomers((s) => s.map((c) => String(c.id) === String(updated.id) ? updated : c));
    } catch (err) {
      console.error('approve customer failed', err);
      alert('Duyệt khách hàng thất bại');
    }
  }

  function startEditCustomer(c: Customer) {
    setEditingCustomerId(String(c.id));
    // Prefill edit data including tiền và hoa hồng để không làm mất giá trị khi sửa
    setEditCustomerData({
      name: c.name,
      phone: c.phone,
      depositDate: c.depositDate,
      depositAmount: c.depositAmount,
      contractDate: c.contractDate,
      contractAmount: c.contractAmount,
      commission: c.commission,
      note: c.note,
      received: c.received,
      createdAt: c.createdAt,
      performedBy: c.performedBy,
    });
  }

  function cancelEditCustomer() {
    setEditingCustomerId(null); setEditCustomerData({});
  }

  async function saveEditCustomer() {
    if (!editingCustomerId) return;
    const payload: Partial<Customer> = { ...editCustomerData };
    if (payload.depositDate === '') delete payload.depositDate;
    if (payload.contractDate === '') delete payload.contractDate;
    if ((payload.depositAmount === undefined) || payload.depositAmount === null) delete payload.depositAmount;
    if ((payload.contractAmount === undefined) || payload.contractAmount === null) delete payload.contractAmount;
    if ((payload.commission === undefined) || payload.commission === null) delete payload.commission;
    if (payload.commission != null) payload.commission = Math.max(0, Math.min(100, payload.commission));
    const updated = await updateCustomer(editingCustomerId, payload);
    if (updated) setCustomers((s) => s.map((it) => String(it.id) === String(updated.id) ? updated : it));
    setEditingCustomerId(null); setEditCustomerData({});
  }

  async function handleExportExcel() {
    if (!customers || customers.length === 0) { alert('Không có khách hàng để xuất'); return; }
    const rows = customers.map((c) => ({
      ID: c.id,
      Tên: c.name,
      SĐT: c.phone ?? '',
      Ngày_Cọc: c.depositDate ? new Date(c.depositDate).toLocaleDateString() : '',
      Tiền_Cọc: c.depositAmount != null ? `${c.depositAmount.toLocaleString('vi-VN')} ₫` : '',
      Ngày_Ký_Hợp_Đồng: c.contractDate ? new Date(c.contractDate).toLocaleDateString() : '',
      Tiền_Hợp_Đồng: c.contractAmount != null ? `${c.contractAmount.toLocaleString('vi-VN')} ₫` : '',
      Tien_Hoa_hong: (c.commission != null && (c.contractAmount ?? c.depositAmount) != null) ? `${Math.round(((c.contractAmount ?? c.depositAmount)! * (c.commission!/100)) ).toLocaleString('vi-VN')} ₫` : '',
      Hoa_hong: c.commission != null ? `${c.commission}%` : '',
      Ngày_Giờ_Tạo: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
      Người_Thực_Hiện: c.performedBy ?? '',
    }));
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'customers.xlsx'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function restoreCustomerFromTrash(id: string) {
    const entry = customersTrash.find((c) => String(c.id) === String(id));
    if (!entry) return;
    (async () => {
      try {
        const created = await addCustomer({
          name: entry.name,
          phone: entry.phone ?? undefined,
          depositDate: entry.depositDate ?? undefined,
          depositAmount: entry.depositAmount ?? undefined,
          contractDate: entry.contractDate ?? undefined,
          contractAmount: entry.contractAmount ?? undefined,
          commission: entry.commission ?? undefined,
          createdAt: entry.createdAt ?? new Date().toISOString(),
          performedBy: entry.performedBy ?? undefined,
        });
        setCustomers((s) => [created, ...s]);
      } catch (err) {
        console.error('restoreCustomerFromTrash failed', err);
        setCustomers((s) => [entry, ...s]);
      } finally {
        setCustomersTrash((s) => s.filter((c) => String(c.id) !== String(id)));
      }
    })();
  }

  async function permanentlyDeleteCustomer(id: string) {
    if (!user || user.role !== 'admin') { alert('Chỉ admin mới có quyền xóa'); return; }
    try { await deleteCustomer(id); } catch (err) { console.warn('permanentlyDeleteCustomer: server delete failed', err); }
    setCustomersTrash((s) => s.filter((c) => String(c.id) !== String(id)));
  }

  async function permanentlyDeleteAllCustomers() {
    if (!user || user.role !== 'admin') { alert('Chỉ admin mới có quyền xóa'); return; }
    if (!customersTrash || customersTrash.length === 0) return;
    try {
      await Promise.allSettled(customersTrash.map((c) => deleteCustomer(String(c.id))));
    } catch (err) {
      console.warn('permanentlyDeleteAllCustomers: some deletes failed', err);
    }
    setCustomersTrash([]);
  }

  return {
    customers,
    setCustomers,
    custName,
    setCustName,
    custPhone,
    setCustPhone,
    custDateType,
    setCustDateType,
    custDate,
    setCustDate,
    custDepositAmount,
    setCustDepositAmount,
    custContractAmount,
    setCustContractAmount,
    custCommission,
    setCustCommission,
    editingCustomerId,
    setEditingCustomerId,
    editCustomerData,
    setEditCustomerData,
    customersTrash,
    setCustomersTrash,
    handleAddCustomer,
    handleDeleteCustomer,
    toggleCustomerReceived,
    handleApproveCustomer,
    startEditCustomer,
    cancelEditCustomer,
    saveEditCustomer,
    handleExportExcel,
    restoreCustomerFromTrash,
    permanentlyDeleteCustomer,
    permanentlyDeleteAllCustomers,
  } as const;
}
