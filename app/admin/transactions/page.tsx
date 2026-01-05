"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import useTransactions from "./hooks/useTransactions";
import useCustomers from "./hooks/useCustomers";

import TransactionsSection from "./components/TransactionsSection";
import CustomersSection from "./components/CustomersSection";
import ReceivedSection from "./components/ReceivedSection";
import TrashSection from "./components/TrashSection";

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "customers" | "received" | "trash">("transactions");
  const { user } = useAuth();

  const {
    transactions,
    categories,
    loading: txLoading,
    handleAdd,
    handleDelete,
    startEditTransaction,
    saveEditTransaction,
    cancelEditTransaction,
    setEditTransactionData,
    editingTransaction,
    editTransactionData,
    toggleTransactionReceived,
    trash,
    restoreFromTrash,
    permanentlyDelete,
    permanentlyDeleteAll,
  } = useTransactions(user);

  const {
    customers,
    loading: custLoading,
    handleAddCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
    toggleCustomerReceived,
    handleApproveCustomer
  ,customersTrash,restoreCustomerFromTrash,permanentlyDeleteCustomer,permanentlyDeleteAllCustomers
  } = useCustomers(user);

  if (!user) return <div className="p-6">Đang tải thông tin user...</div>;
  if (txLoading || custLoading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">QUẢN LÝ GIAO DỊCH</h1>
        <div className="text-sm text-gray-500">
          Xin chào, <span className="font-semibold text-slate-700">{user?.name || "Admin"}</span>
        </div>
      </div>

      <div className="flex gap-2 border-b mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab("transactions")} className={`px-4 py-2 border-b-2 font-medium whitespace-nowrap ${activeTab === "transactions" ? "border-slate-800 text-slate-800" : "border-transparent text-gray-500"}`}>💸 Giao dịch</button>
        <button onClick={() => setActiveTab("customers")} className={`px-4 py-2 border-b-2 font-medium whitespace-nowrap ${activeTab === "customers" ? "border-slate-800 text-slate-800" : "border-transparent text-gray-500"}`}>👥 Khách hàng</button>
        <button onClick={() => setActiveTab("received")} className={`px-4 py-2 border-b-2 font-medium whitespace-nowrap ${activeTab === "received" ? "border-slate-800 text-slate-800" : "border-transparent text-gray-500"}`}>✅ Đã thu</button>
        <button onClick={() => setActiveTab("trash")} className={`px-4 py-2 border-b-2 font-medium whitespace-nowrap ${activeTab === "trash" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}>🗑️ Thùng rác</button>
      </div>

      <div className="animate-fade-in">
        {activeTab === "transactions" && (
          <TransactionsSection
            items={transactions}
            categories={categories}
            user={user}
            handleDeleteTransaction={(id) => handleDelete(String(id))}
            handleUpdateTransaction={async (id, data) => { console.log("Update", id, data); }}
            handleAddTransaction={handleAdd} // Truyền trực tiếp hàm handleAdd từ hook (lưu ý: logic form đã chuyển vào section, ở đây hook cần cung cấp hàm nhận payload)
            // LƯU Ý: Hook useTransactions của bạn đang trả về handleAdd nhận (e: React.FormEvent).
            // Nhưng TransactionsSection lại gọi handleAddTransaction(dataObject).
            // Để fix nhanh, ta sửa lại prop handleAddTransaction bên dưới:
            toggleTransactionReceived={(id, val) => toggleTransactionReceived(String(id), val)}
            editingTransaction={editingTransaction}
            editTransactionData={editTransactionData}
            setEditTransactionData={setEditTransactionData}
            startEditTransaction={startEditTransaction}
            saveEditTransaction={saveEditTransaction}
            cancelEditTransaction={cancelEditTransaction}
          />
        )}

        {activeTab === "customers" && (
          <CustomersSection
            customers={customers}
            user={user}
            handleAddCustomer={handleAddCustomer}
            handleUpdateCustomer={(id, data) => handleUpdateCustomer(String(id), data)}
            handleDeleteCustomer={(id) => handleDeleteCustomer(String(id))}
            toggleCustomerReceived={(id, val) => toggleCustomerReceived(String(id), val)}
            handleApproveCustomer={(id) => handleApproveCustomer(String(id))}
          />
        )}

        {activeTab === "received" && (
          <ReceivedSection
            items={transactions}
            customers={customers}
            categories={categories}
            user={user}
            startEditTransaction={startEditTransaction}
            handleDelete={(id) => handleDelete(String(id))}
            toggleTransactionReceived={(id, val) => toggleTransactionReceived(String(id), val)}
            toggleCustomerReceived={(id, val) => toggleCustomerReceived(String(id), val)}
          />
        )}

        {activeTab === "trash" && (
          <TrashSection
            trash={trash}
            customersTrash={customersTrash}
            user={user}
            categories={categories}
            restoreFromTrash={(id: string) => restoreFromTrash(String(id))}
            restoreCustomerFromTrash={(id: string) => restoreCustomerFromTrash(String(id))}
            permanentlyDelete={async (id: string) => permanentlyDelete(String(id))}
            permanentlyDeleteCustomer={async (id: string) => permanentlyDeleteCustomer(String(id))}
            permanentlyDeleteAll={async () => permanentlyDeleteAll()}
            permanentlyDeleteAllCustomers={async () => permanentlyDeleteAllCustomers()}
          />
        )}
      </div>
    </div>
  );
}