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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
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
        setCustomers((s) => s.filter((c) => String(c.id) !== String(id)));
      }
    } catch (error) {
      console.error("Delete customer failed", error);
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
    handleAddCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
    toggleCustomerReceived,
    handleApproveCustomer
  };
}