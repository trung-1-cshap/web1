"use client"

import { useEffect, useState } from "react";
import { getTransactions, getCustomers } from "../../../lib/mockService";
import { exportToCsv } from "../../../lib/csv";
import { useAuth } from '../../components/AuthProvider'

export default function ReportsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    getTransactions().then(setTransactions);
    getCustomers().then(setCustomers);
  }, []);

  const totals = transactions.reduce(
    (acc, t) => {
      const amt = Number(t.amount ?? 0);
      if (t.type === "thu" || t.type === 'INCOME') acc.thu += amt;
      else acc.chi += amt;
      return acc;
    },
    { thu: 0, chi: 0 }
  );

  // tổng từ customers: tiền cọc đã thu và tiền hợp đồng đã thu
  const customerTotals = customers.reduce((acc, c) => {
    const deposit = Number(c.depositAmount ?? 0);
    const contract = Number(c.contractAmount ?? 0);
    if (c.received) {
      acc.depositReceived += deposit;
      acc.contractReceived += contract;
    }
    return acc;
  }, { depositReceived: 0, contractReceived: 0 });

  function handleExport() {
    const rows = transactions.map((t) => ({ id: t.id, date: t.date ? new Date(t.date).toLocaleString() : "", amount: Number(t.amount ?? 0), type: t.type, description: t.description }));
    exportToCsv("transactions.csv", rows);
  }

  // dữ liệu biểu đồ đơn giản (Thu vs Chi)
  const chartData = [
    { label: "Thu", value: totals.thu },
    { label: "Chi", value: totals.chi },
  ];

  const max = Math.max(chartData[0].value, chartData[1].value, 1);

  // Truy cập: yêu cầu đăng nhập nhưng không giới hạn theo vai trò
  if (!user) return <div className="p-6">Bạn cần đăng nhập để xem báo cáo.</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Báo cáo Thu/Chi</h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded">Xuất CSV</button>
        </div>
      </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="border rounded p-4">
              <div className="text-sm text-gray-500">Tổng Thu</div>
              <div className="text-2xl font-bold">{totals.thu != null ? totals.thu.toLocaleString('vi-VN') : "0"}</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-500">Tổng Chi</div>
              <div className="text-2xl font-bold">{totals.chi != null ? totals.chi.toLocaleString('vi-VN') : "0"}</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-500">Tiền cọc đã thu</div>
              <div className="text-2xl font-bold">{customerTotals.depositReceived != null ? customerTotals.depositReceived.toLocaleString('vi-VN') : "0"}</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-500">Tiền hợp đồng đã thu</div>
              <div className="text-2xl font-bold">{customerTotals.contractReceived != null ? customerTotals.contractReceived.toLocaleString('vi-VN') : "0"}</div>
            </div>
          </div>

      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">So sánh Thu vs Chi</div>
        <svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet" className="bg-white border rounded p-2">
          {chartData.map((d, i) => {
            const barW = 80;
            const gap = 20;
            const x = 20 + i * (barW + gap);
            const h = (d.value / max) * 90;
            const y = 120 - h;
            return (
              <g key={d.label}>
                <rect x={x} y={y} width={barW} height={h} rx={6} fill={i === 0 ? '#16a34a' : '#ef4444'} />
                <text x={x + barW / 2} y={135} fontSize={12} textAnchor="middle">{d.label}</text>
                <text x={x + barW / 2} y={y - 6} fontSize={12} textAnchor="middle">{d.value != null ? d.value.toLocaleString() : "0"}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="bg-white border rounded">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Ngày</th>
              <th className="text-left p-3">Số tiền</th>
              <th className="text-left p-3">Loại</th>
              <th className="text-left p-3">Diễn giải</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.date ? new Date(t.date).toLocaleString() : "-"}</td>
                <td className="p-3">{t.amount != null ? Number(t.amount).toLocaleString() : "-"}</td>
                <td className="p-3">{(t.type === 'INCOME' || t.type === 'thu') ? 'Thu' : (t.type === 'EXPENSE' || t.type === 'chi') ? 'Chi' : t.type}</td>
                <td className="p-3">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
