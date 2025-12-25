"use client"

import React from "react";
import type { Customer } from "../../../../lib/mockService";
import { formatNumberVN } from "../../../../lib/format";
import { canSoftDelete, canExport, canApproveTransaction } from "../../../../lib/permissions";

// CustomersSection: giao diện quản lý khách hàng
// - Form thêm khách hàng
// - Nút xuất Excel
// - Bảng danh sách khách hàng (hiển thị, sửa, xóa, đánh dấu "Đã thu")

type Props = {
  // customers: danh sách khách hàng hiện có
  customers: Customer[];
  // custName, custPhone, ...: các state và setter dùng cho form thêm khách
  custName: string;
  setCustName: (v: string) => void;
  custPhone: string;
  setCustPhone: (v: string) => void;
  custDateType: "deposit" | "contract";
  setCustDateType: (v: "deposit" | "contract") => void;
  custDate: string;
  setCustDate: (v: string) => void;
  custDepositAmount: string;
  setCustDepositAmount: (v: string) => void;
  custContractAmount: string;
  setCustContractAmount: (v: string) => void;
  custCommission: string;
  setCustCommission: (v: string) => void;
  // handleAddCustomer: gọi khi submit form thêm khách
  handleAddCustomer: (e: React.FormEvent) => void;
  // handleExportExcel: xuất file Excel từ danh sách khách
  handleExportExcel: () => Promise<void>;
  editingCustomerId: string | null;
  editCustomerData: Partial<Customer>;
  setEditCustomerData: React.Dispatch<React.SetStateAction<Partial<Customer>>>;
  startEditCustomer: (c: Customer) => void;
  cancelEditCustomer: () => void;
  saveEditCustomer: () => Promise<void>;
  handleDeleteCustomer: (id: string) => Promise<void>;
  toggleCustomerReceived: (id: string, val: boolean) => Promise<void>;
  handleApproveCustomer?: (id: string) => Promise<void> | void;
  user?: any;
};

export default function CustomersSection({ customers, custName, setCustName, custPhone, setCustPhone, custDateType, setCustDateType, custDate, setCustDate, custDepositAmount, setCustDepositAmount, custContractAmount, setCustContractAmount, custCommission, setCustCommission, handleAddCustomer, handleExportExcel, editingCustomerId, editCustomerData, setEditCustomerData, startEditCustomer, cancelEditCustomer, saveEditCustomer, handleDeleteCustomer, toggleCustomerReceived, handleApproveCustomer, user }: Props) {
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [editNameError, setEditNameError] = React.useState<string | null>(null);
  const [editPhoneError, setEditPhoneError] = React.useState<string | null>(null);
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [editDateError, setEditDateError] = React.useState<string | null>(null);
  const [depositFocused, setDepositFocused] = React.useState(false);
  const [contractFocused, setContractFocused] = React.useState(false);
  const [editDepositFocused, setEditDepositFocused] = React.useState(false);
  const [editContractFocused, setEditContractFocused] = React.useState(false);
  const depositRef = React.useRef<HTMLInputElement | null>(null);
  const contractRef = React.useRef<HTMLInputElement | null>(null);
  const editDepositRef = React.useRef<HTMLInputElement | null>(null);
  const editContractRef = React.useRef<HTMLInputElement | null>(null);

  function findCaretPos(formatted: string, digitsBefore: number) {
    if (!formatted) return 0;
    let count = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/[0-9]/.test(formatted[i])) count++;
      if (count === digitsBefore) return i + 1;
    }
    return formatted.length;
  }

  const handleLiveChange = (rawSetter: (v: string) => void, ref: React.RefObject<HTMLInputElement | null> | null, valueStr: string | undefined, e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;
    const sel = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
    const raw = String(el.value).replace(/[^0-9]/g, '');
    rawSetter(raw);
    const digitsBefore = (el.value.slice(0, sel).match(/\d/g) || []).length;
    const formatted = raw ? formatNumberVN(Number(raw)) : '';
    // đặt lịch khôi phục vị trí con trỏ sau khi render
    setTimeout(() => {
      try {
        const pos = findCaretPos(formatted, digitsBefore);
        if (ref && ref.current) ref.current.setSelectionRange(pos, pos);
      } catch (err) {}
    }, 0);
  } 

  // Preview tiền hoa hồng trong form (tính từ tiền cọc / hợp đồng và % hoa hồng)
  const previewAmount = custDateType === 'deposit' ? Number(custDepositAmount || 0) : Number(custContractAmount || 0);
  const previewCommissionPct = custCommission === '' ? NaN : Number(custCommission);
  const previewCommissionMoney = (isFinite(previewAmount) && isFinite(previewCommissionPct) && previewAmount > 0 && !isNaN(previewCommissionPct))
    ? `${Math.round(previewAmount * (previewCommissionPct / 100)).toLocaleString('vi-VN')} ₫`
    : null;

  // Khi chỉnh sửa 1 khách hàng: preview tiền hoa hồng từ editCustomerData
  const editBaseAmount = Number(editCustomerData.contractAmount ?? editCustomerData.depositAmount ?? NaN);
  const editPct = (editCustomerData.commission == null) ? NaN : Number(editCustomerData.commission);
  const editPreviewCommissionMoney = (isFinite(editBaseAmount) && isFinite(editPct) && editBaseAmount > 0 && !isNaN(editPct))
    ? `${Math.round(editBaseAmount * (editPct / 100)).toLocaleString('vi-VN')} ₫`
    : null;

  return (
    <div className="bg-white border rounded p-4">
      <h3 className="font-semibold mb-3">Thêm khách hàng</h3>
      {/* Form thêm khách hàng: nhập tên, số điện thoại, ngày (cọc/hd), số tiền và hoa hồng */}
      <form onSubmit={(e) => {
        e.preventDefault();
        // kiểm tra cuối trước khi submit
        if (!custName || nameError) { setNameError(nameError ?? 'Tên không hợp lệ'); return; }
        if (custPhone && phoneError) { setPhoneError(phoneError ?? 'Số điện thoại không hợp lệ'); return; }
        handleAddCustomer(e);
      }} className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1">
          <input type="text" className="border rounded px-3 py-2 w-full" placeholder="Tên khách hàng" value={custName} onChange={(e) => {
            const v = e.target.value;
            // cho phép chữ, dấu phụ, khoảng trắng, dấu nháy đơn, dấu chấm, dấu gạch ngang
            const valid = /^[\p{L}\p{M}\s'.-]*$/u.test(v);
            if (!valid) setNameError('Tên không được chứa ký tự đặc biệt'); else setNameError(null);
            setCustName(v);
          }} />
          {nameError ? <div className="text-red-600 text-sm mt-1">{nameError}</div> : null}
        </div>
        <div>
          <input type="text" className="border rounded px-3 py-2" placeholder="SĐT" value={custPhone} onChange={(e) => {
            const v = e.target.value;
            // phát hiện ký tự không phải chữ số
            const hasNonDigit = /\D/.test(v);
            if (hasNonDigit) setPhoneError('Số điện thoại chỉ được nhập chữ số'); else setPhoneError(null);
            // chỉ giữ chữ số trong giá trị lưu
            setCustPhone(v.replace(/\D/g, ''));
          }} />
          {phoneError ? <div className="text-red-600 text-sm mt-1">{phoneError}</div> : null}
        </div>
        <select className="border rounded px-3 py-2" value={custDateType} onChange={(e) => setCustDateType(e.target.value as any)}>
          <option value="deposit">Ngày Cọc</option>
          <option value="contract">Ngày ký hợp đồng</option>
        </select>
        <input type="date" className="border rounded px-3 py-2" value={custDate} onChange={(e) => {
          const v = e.target.value;
          if (v) {
            const y = new Date(v).getFullYear();
            if (isFinite(y) && y > 3000) {
              setDateError('Năm không được lớn hơn 3000');
            } else {
              setDateError(null);
            }
          } else {
            setDateError(null);
          }
          setCustDate(v);
        }} />
        {dateError ? <div className="text-red-600 text-sm mt-1">{dateError}</div> : null}
        {custDateType === 'deposit' && (
          <>
            <input
              ref={depositRef}
              type="text"
              inputMode="numeric"
              className="border rounded px-3 py-2"
              placeholder="Tiền cọc (VND)"
              value={depositFocused ? custDepositAmount : (custDepositAmount ? formatNumberVN(Number(custDepositAmount)) : '')}
              onFocus={() => setDepositFocused(true)}
              onBlur={() => setDepositFocused(false)}
              onChange={(e) => handleLiveChange(setCustDepositAmount, depositRef, custDepositAmount, e)}
            />
            <input type="number" min={0} max={100} step={0.01} className="border rounded px-3 py-2" placeholder="Hoa hồng (%)" value={custCommission} onChange={(e) => setCustCommission(e.target.value)} />
            {previewCommissionMoney ? <div className="w-full text-sm text-gray-600 mt-1">Dự kiến tiền hoa hồng: {previewCommissionMoney}</div> : null}
          </>
        )}
        {custDateType === 'contract' && (
          <>
            <input
              ref={contractRef}
              type="text"
              inputMode="numeric"
              className="border rounded px-3 py-2"
              placeholder="Tiền hợp đồng (VND)"
              value={contractFocused ? custContractAmount : (custContractAmount ? formatNumberVN(Number(custContractAmount)) : '')}
              onFocus={() => setContractFocused(true)}
              onBlur={() => setContractFocused(false)}
              onChange={(e) => handleLiveChange(setCustContractAmount, contractRef, custContractAmount, e)}
            />
            <input type="number" min={0} max={100} step={0.01} className="border rounded px-3 py-2" placeholder="Hoa hồng (%)" value={custCommission} onChange={(e) => setCustCommission(e.target.value)} />
            {previewCommissionMoney ? <div className="w-full text-sm text-gray-600 mt-1">Dự kiến tiền hoa hồng: {previewCommissionMoney}</div> : null}
          </>
        )}
        <button className="bg-slate-800 text-white px-4 py-2 rounded">Thêm</button>
      </form>

      <div className="flex justify-end mb-2">
        {/* Nút Xuất Excel: xuất toàn bộ danh sách khách hàng hiện tại */}
        {canExport(user) ? (
          <button type="button" onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded">Xuất Excel</button>
        ) : null}
      </div>
      {/* Danh sách khách hàng: hiển thị bảng, cho phép sửa/xóa/đánh dấu đã thu */}
      <div className="bg-white border rounded">
        <div className="overflow-x-auto">
          <table className="w-full">
            <colgroup>
              <col style={{ width: 220 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 100 }} />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Tên</th>
                <th className="text-left p-3">SĐT</th>
                <th className="text-left p-3">Ngày</th>
                <th className="text-left p-3">Tiền cọc</th>
                <th className="text-left p-3">Tiền hợp đồng</th>
                <th className="text-left p-3">Tiền hoa hồng</th>
                <th className="text-left p-3">Hoa hồng</th>
                <th className="text-left p-3">Ngày giờ</th>
                <th className="text-left p-3">Thực hiện</th>
                {/* Cột Hành động: Sửa / Xóa (chỉ admin có quyền xóa) */}
                <th className="p-3" style={{ width: 160 }}>Hành động</th>
                {/* Cột Đã thu: checkbox để ghi nhận khách đã thu */}
                <th className="p-3">Đã thu</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={`${String(c.id ?? '')}-${i}`} className="border-t">
                  {/* Nếu đang ở trạng thái sửa: hiển thị row editable */}
                  {String(c.id) === editingCustomerId ? (
                    <>
                      <td className="p-3">
                        <div>
                          <input className="border px-2 py-1 w-48" value={String(editCustomerData.name ?? '')} onChange={(e) => {
                            const v = e.target.value;
                            const valid = /^[\p{L}\p{M}\s'.-]*$/u.test(v);
                            if (!valid) setEditNameError('Tên không được chứa ký tự đặc biệt'); else setEditNameError(null);
                            setEditCustomerData((p) => ({ ...(p || {}), name: v }));
                          }} />
                          {editNameError ? <div className="text-red-600 text-sm mt-1">{editNameError}</div> : null}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <input className="border px-2 py-1 w-40" value={String(editCustomerData.phone ?? '')} onChange={(e) => {
                            const v = e.target.value;
                            const hasNonDigit = /\D/.test(v);
                            if (hasNonDigit) setEditPhoneError('Số điện thoại chỉ được nhập chữ số'); else setEditPhoneError(null);
                            setEditCustomerData((p) => ({ ...(p || {}), phone: String(v).replace(/\D/g, '') }));
                          }} />
                          {editPhoneError ? <div className="text-red-600 text-sm mt-1">{editPhoneError}</div> : null}
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <input type="date" className="border px-2 py-1 w-40" value={editCustomerData.depositDate ? new Date(editCustomerData.depositDate).toISOString().slice(0,10) : (editCustomerData.contractDate ? new Date(editCustomerData.contractDate).toISOString().slice(0,10) : '')} onChange={(e) => {
                            const v = e.target.value;
                            if (v) {
                              const y = new Date(v).getFullYear();
                              if (isFinite(y) && y > 3000) setEditDateError('Năm không được lớn hơn 3000'); else setEditDateError(null);
                            } else setEditDateError(null);
                            setEditCustomerData((p) => ({ ...(p || {}), depositDate: v ? new Date(v).toISOString() : '' }));
                          }} />
                          {editDateError ? <div className="text-red-600 text-sm mt-1">{editDateError}</div> : null}
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          ref={editDepositRef}
                          type="text"
                          inputMode="numeric"
                          className="border px-2 py-1 w-32"
                          placeholder="Tiền cọc (VND)"
                          value={editDepositFocused ? (editCustomerData.depositAmount != null ? String(editCustomerData.depositAmount) : '') : (editCustomerData.depositAmount != null ? formatNumberVN(editCustomerData.depositAmount) : '')}
                          onFocus={() => setEditDepositFocused(true)}
                          onBlur={() => setEditDepositFocused(false)}
                          onChange={(e) => {
                            // dùng thay đổi trực tiếp với bảo toàn vị trí con trỏ
                            const el = e.target as HTMLInputElement;
                            const sel = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
                            const raw = String(el.value).replace(/[^0-9]/g, '');
                            setEditCustomerData((p) => ({ ...(p || {}), depositAmount: raw === '' ? undefined : Number(raw) }));
                            const digitsBefore = (el.value.slice(0, sel).match(/\d/g) || []).length;
                            const formatted = raw ? formatNumberVN(Number(raw)) : '';
                            setTimeout(() => {
                              try {
                                const pos = findCaretPos(formatted, digitsBefore);
                                if (editDepositRef.current) editDepositRef.current.setSelectionRange(pos, pos);
                              } catch (err) {}
                            }, 0);
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          ref={editContractRef}
                          type="text"
                          inputMode="numeric"
                          className="border px-2 py-1 w-32"
                          placeholder="Tiền hợp đồng (VND)"
                          value={editContractFocused ? (editCustomerData.contractAmount != null ? String(editCustomerData.contractAmount) : '') : (editCustomerData.contractAmount != null ? formatNumberVN(editCustomerData.contractAmount) : '')}
                          onFocus={() => setEditContractFocused(true)}
                          onBlur={() => setEditContractFocused(false)}
                          onChange={(e) => {
                            const el = e.target as HTMLInputElement;
                            const sel = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
                            const raw = String(el.value).replace(/[^0-9]/g, '');
                            setEditCustomerData((p) => ({ ...(p || {}), contractAmount: raw === '' ? undefined : Number(raw) }));
                            const digitsBefore = (el.value.slice(0, sel).match(/\d/g) || []).length;
                            const formatted = raw ? formatNumberVN(Number(raw)) : '';
                            setTimeout(() => {
                              try {
                                const pos = findCaretPos(formatted, digitsBefore);
                                if (editContractRef.current) editContractRef.current.setSelectionRange(pos, pos);
                              } catch (err) {}
                            }, 0);
                          }}
                        />
                      </td>
                      <td className="p-3 whitespace-normal break-words">{(editCustomerData.commission != null && ((editCustomerData.contractAmount ?? editCustomerData.depositAmount) != null)) ? `${Math.round((Number(editCustomerData.contractAmount ?? editCustomerData.depositAmount) * (Number(editCustomerData.commission ?? 0) / 100))).toLocaleString('vi-VN')} ₫` : ((c.commission != null && (c.contractAmount ?? c.depositAmount) != null) ? `${Math.round((Number(c.contractAmount ?? c.depositAmount) * (Number(c.commission ?? 0) / 100))).toLocaleString('vi-VN')} ₫` : '-')}</td>
                      <td className="p-3"><input type="number" min={0} max={100} step={0.01} className="border px-2 py-1 w-32" placeholder="Hoa hồng (%)" value={editCustomerData.commission ?? ''} onChange={(e) => setEditCustomerData((p) => ({ ...(p || {}), commission: e.target.value === '' ? undefined : Number(e.target.value) }))} />
                        {editPreviewCommissionMoney ? <div className="text-sm text-gray-600 mt-1">Dự kiến: {editPreviewCommissionMoney}</div> : null}
                      </td>
                      <td className="p-3">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</td>
                      <td className="p-3">{c.performedBy ?? '-'}</td>
                      <td className="p-3 text-center">
                        <button className="text-green-600 mr-2" onClick={() => {
                          if (editNameError || editPhoneError || editDateError) {
                            alert('Vui lòng sửa các lỗi trước khi lưu');
                            return;
                          }
                          saveEditCustomer();
                        }} disabled={Boolean(editNameError || editPhoneError || editDateError)}>Lưu</button>
                        <button className="text-gray-600" onClick={cancelEditCustomer}>Hủy</button>
                      </td>
                      {/* Checkbox 'Đã thu' khi đang sửa: lưu vào editCustomerData (chưa gửi server) */}
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={Boolean(editCustomerData.received ?? c.received)} onChange={(e) => setEditCustomerData((p) => ({ ...(p || {}), received: e.target.checked }))} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 whitespace-normal break-words">{c.name}</td>
                      <td className="p-3 whitespace-normal break-words">{c.phone ?? "-"}</td>
                      <td className="p-3 whitespace-normal break-words">{(c.depositDate ? new Date(String(c.depositDate)) : c.contractDate ? new Date(String(c.contractDate)) : null) ? ((c.depositDate ? new Date(String(c.depositDate)) : new Date(String(c.contractDate))).toLocaleDateString()) : "-"}</td>
                      <td className="p-3 whitespace-normal break-words">{c.depositAmount != null ? `${c.depositAmount.toLocaleString('vi-VN')} ₫` : '-'}</td>
                      <td className="p-3 whitespace-normal break-words">{c.contractAmount != null ? `${c.contractAmount.toLocaleString('vi-VN')} ₫` : '-'}</td>
                      <td className="p-3 whitespace-normal break-words">{(c.commission != null && (c.contractAmount ?? c.depositAmount) != null) ? `${Math.round((Number(c.contractAmount ?? c.depositAmount) * (Number(c.commission ?? 0) / 100))).toLocaleString('vi-VN')} ₫` : '-'}</td>
                      <td className="p-3 whitespace-normal break-words">{c.commission != null ? `${c.commission}%` : '-'}</td>
                      <td className="p-3 whitespace-normal break-words">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</td>
                      <td className="p-3 whitespace-normal break-words">{c.performedBy ?? "-"}</td>
                      {/* Hành động: Sửa (bật form chỉnh sửa trên hàng), Xóa (chỉ admin) */}
                      <td className="p-3 text-center">
                        <button className="text-blue-600 mr-2" onClick={() => startEditCustomer(c)}>Sửa</button>
                        {canSoftDelete(user) ? <button className="text-red-600" onClick={() => handleDeleteCustomer(c.id)}>Xóa</button> : null}
                        {c.approved ? (
                          <div className="text-sm text-green-700 mt-1">Đã duyệt{c.approvedBy ? ` bởi ${c.approvedBy}` : ''}</div>
                        ) : canApproveTransaction(user) ? (
                          <button className="text-green-700 mt-1" onClick={() => (typeof handleApproveCustomer === 'function') && handleApproveCustomer(String(c.id))}>Duyệt</button>
                        ) : null}
                      </td>
                      {/* Checkbox 'Đã thu' trực tiếp: gọi toggleCustomerReceived để cập nhật */}
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={Boolean(c.received)} onChange={(e) => toggleCustomerReceived(c.id, e.target.checked)} />
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
