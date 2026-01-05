import { useState, useEffect } from "react";
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  Customer,
} from "../../../../lib/mockService";

// 👇 THÊM CHỮ "default" VÀO ĐÂY
export default function useCustomers(user: any) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersTrash, setCustomersTrash] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadTrash();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadTrash() {
    try {
      const data = await getCustomers(true);
      setCustomersTrash(data);
    } catch (err) {
      console.error('loadTrash failed', err);
    }
  }

  async function handleAddCustomer(payload: Omit<Customer, "id">) {
    try {
      const newC = await addCustomer({
        ...payload,
        performedBy: user?.name || user?.email,
      });
      setCustomers([newC, ...customers]);
    } catch (error) {
      console.error("Add customer failed", error);
    }
  }

  async function handleUpdateCustomer(id: string, payload: Partial<Customer>) {
    try {
      const updated = await updateCustomer(id, payload);
      if (updated) {
        setCustomers((s) => s.map((c) => (String(c.id) === String(updated.id) ? updated : c)));
      }
    } catch (error) {
      console.error("Update customer failed", error);
    }
  }

  async function handleDeleteCustomer(id: string) {
    if (!confirm("Xóa khách hàng này?")) return;
    try {
      const ok = await deleteCustomer(id);
      if (ok) {
        // remove from active list and refresh trash list
        setCustomers((s) => s.filter((c) => String(c.id) !== String(id)));
        await loadTrash();
      }
    } catch (error) {
      console.error("Delete customer failed", error);
    }
  }

  async function restoreCustomerFromTrash(id: string) {
    try {
      const updated = await updateCustomer(id, { deleted: false });
      if (updated) {
        await loadData();
        await loadTrash();
      }
    } catch (err) {
      console.error('restoreCustomerFromTrash failed', err);
    }
  }

  async function permanentlyDeleteCustomer(id: string) {
    if (!confirm('Xác nhận xóa vĩnh viễn khách hàng này?')) return;
    try {
      const ok = await deleteCustomer(id, true);
      if (ok) {
        setCustomersTrash((s) => s.filter((c) => String(c.id) !== String(id)));
      }
    } catch (err) {
      console.error('permanentlyDeleteCustomer failed', err);
    }
  }

  async function permanentlyDeleteAllCustomers() {
    if (!confirm('Xác nhận xóa vĩnh viễn tất cả khách hàng trong thùng rác?')) return;
    try {
      await Promise.allSettled(customersTrash.map((c) => deleteCustomer(String(c.id), true)));
      setCustomersTrash([]);
    } catch (err) {
      console.error('permanentlyDeleteAllCustomers failed', err);
    }
  }

  async function toggleCustomerReceived(id: string, val: boolean) {
    await handleUpdateCustomer(id, { received: val });
  }

  async function handleApproveCustomer(id: string) {
    if (!confirm("Duyệt khách hàng này?")) return;
    const approver = user?.name ?? user?.email ?? 'system';
    
    await handleUpdateCustomer(id, { 
        approved: true, 
        approvedBy: approver,
        approvedAt: new Date().toISOString()
    });
  }

  return {
    customers,
    loading,
    customersTrash,
    handleAddCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
    toggleCustomerReceived,
    handleApproveCustomer
    ,restoreCustomerFromTrash,permanentlyDeleteCustomer,permanentlyDeleteAllCustomers
  };
}