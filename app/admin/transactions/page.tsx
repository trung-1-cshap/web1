"use client"

import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { getTransactions, addTransaction, deleteTransaction, updateTransaction, getCategories, getCustomers, addCustomer, deleteCustomer, updateCustomer, type Transaction, type Category, type Customer } from "../../../lib/mockService";
import TransactionsForm from "./components/TransactionsForm";
import TransactionsTable from "./components/TransactionsTable";
import CustomersSection from "./components/CustomersSection";
import TrashSection from "./components/TrashSection";
import ReceivedSection from "./components/ReceivedSection";
import useTransactions from "./hooks/useTransactions";

export default function TransactionsPage() {
  const { user } = useAuth();
  const {
    items,
    categories,
    amount,
    setAmount,
    type,
    setType,
    categoryId,
    setCategoryId,
    actorName,
    setActorName,
    customers,
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
    custContractMonths,
    setCustContractMonths,
    custCommission,
    setCustCommission,
    editingTransactionId,
    editTransactionData,
    setEditTransactionData,
    editingCustomerId,
    editCustomerData,
    setEditCustomerData,
    trash,
    customersTrash,
    flashMsg,
    handleAdd,
    handleAddCustomer,
    handleDeleteCustomer,
    handleApproveCustomer,
    toggleCustomerReceived,
    startEditTransaction,
    cancelEditTransaction,
    saveEditTransaction,
    toggleTransactionReceived,
    handleApprove,
    startEditCustomer,
    cancelEditCustomer,
    saveEditCustomer,
    handleExportExcel,
    handleDelete,
    restoreFromTrash,
    restoreCustomerFromTrash,
    permanentlyDeleteCustomer,
    permanentlyDelete,
    permanentlyDeleteAll,
    permanentlyDeleteAllCustomers,
  } = useTransactions(user);
  const [activeTab, setActiveTab] = useState<"transactions" | "customers" | "received" | "trash">("customers");


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Giao dịch Thu/Chi</h2>

      <div className="mb-4 flex gap-2 items-center">
        <button type="button" onClick={() => setActiveTab("transactions")} className={`px-3 py-1 rounded-t ${activeTab === "transactions" ? "bg-white border-t border-l border-r" : "bg-gray-100"}`}>Giao dịch</button>
        <button type="button" onClick={() => setActiveTab("customers")} className={`px-3 py-1 rounded-t ${activeTab === "customers" ? "bg-white border-t border-l border-r" : "bg-gray-100"}`}>Khách hàng</button>
        <button type="button" onClick={() => setActiveTab("received")} className={`px-3 py-1 rounded-t ${activeTab === "received" ? "bg-white border-t border-l border-r" : "bg-gray-100"}`}>Đã thu</button>
        <button type="button" onClick={() => setActiveTab("trash")} className={`px-3 py-1 rounded-t ${activeTab === "trash" ? "bg-white border-t border-l border-r" : "bg-gray-100"}`}>Thùng rác</button>
      </div>
      {flashMsg && (
        <div className="mb-3 text-sm text-green-700 bg-green-100 p-2 rounded">{flashMsg}</div>
      )}

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeTab === "transactions" ? "max-h-[2000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"}`}>
        <TransactionsForm
          amount={amount}
          setAmount={setAmount}
          type={type}
          setType={setType}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          actorName={actorName}
          setActorName={setActorName}
          categories={categories}
          onAdd={handleAdd}
        />
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeTab === "received" ? "max-h-[2000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"}`}>
        <ReceivedSection
          items={items}
          customers={customers}
          categories={categories}
          user={user}
          startEditTransaction={startEditTransaction}
          handleDelete={handleDelete}
          toggleTransactionReceived={toggleTransactionReceived}
          
          toggleCustomerReceived={toggleCustomerReceived}
        />
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeTab === "customers" ? "max-h-[2000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"}`}>
        <CustomersSection
          customers={customers}
          custName={custName}
          setCustName={setCustName}
          custPhone={custPhone}
          setCustPhone={setCustPhone}
          custDateType={custDateType}
          setCustDateType={setCustDateType}
          custDate={custDate}
          setCustDate={setCustDate}
          custDepositAmount={custDepositAmount}
          setCustDepositAmount={setCustDepositAmount}
          custContractAmount={custContractAmount}
          setCustContractAmount={setCustContractAmount}
          custContractMonths={custContractMonths}
          setCustContractMonths={setCustContractMonths}
          custCommission={custCommission}
          setCustCommission={setCustCommission}
          handleAddCustomer={handleAddCustomer}
          handleExportExcel={handleExportExcel}
          editingCustomerId={editingCustomerId}
          editCustomerData={editCustomerData}
          setEditCustomerData={setEditCustomerData}
          startEditCustomer={startEditCustomer}
          cancelEditCustomer={cancelEditCustomer}
          saveEditCustomer={saveEditCustomer}
          handleDeleteCustomer={handleDeleteCustomer}
          toggleCustomerReceived={toggleCustomerReceived}
          handleApproveCustomer={handleApproveCustomer}
          user={user}
        />
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeTab === "trash" ? "max-h-[2000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"}`}>
        <TrashSection
          trash={trash}
          customersTrash={customersTrash}
          user={user}
          categories={categories}
          restoreFromTrash={restoreFromTrash}
          restoreCustomerFromTrash={restoreCustomerFromTrash}
          permanentlyDelete={permanentlyDelete}
          permanentlyDeleteCustomer={permanentlyDeleteCustomer}
          permanentlyDeleteAll={permanentlyDeleteAll}
          permanentlyDeleteAllCustomers={permanentlyDeleteAllCustomers}
        />
      </div>

      

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeTab === "transactions" ? "max-h-[2000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"}`}>
        <TransactionsTable
          items={items}
          categories={categories}
          user={user}
          editingTransactionId={editingTransactionId}
          editTransactionData={editTransactionData}
          setEditTransactionData={(p) => setEditTransactionData(p)}
          startEditTransaction={startEditTransaction}
          cancelEditTransaction={cancelEditTransaction}
          saveEditTransaction={saveEditTransaction}
          toggleTransactionReceived={toggleTransactionReceived}
          handleDelete={handleDelete}
          
        />
      </div>
      
    </div>
  );
}
