"use client"

import React from "react";
import type { Category } from "../../../../lib/mockService";

type Props = {
  amount: number | "";
  setAmount: (v: number | "") => void;
  type: "thu" | "chi";
  setType: (v: "thu" | "chi") => void;
  categoryId?: string;
  setCategoryId: (v?: string) => void;
  actorName: string;
  setActorName: (v: string) => void;
  categories: Category[];
  onAdd: (e: React.FormEvent) => void;
};

export default function TransactionsForm({ amount, setAmount, type, setType, categoryId, setCategoryId, actorName, setActorName, categories, onAdd }: Props) {
  return (
    <form onSubmit={onAdd} className="flex flex-wrap gap-2 mb-4 items-center">
      <input
        inputMode="decimal"
        className="border rounded px-3 py-2"
        placeholder="Số tiền"
        value={amount || ""}
        onChange={(e) => {
          const v = String(e.target.value).replace(/[^0-9.]/g, '');
          setAmount(v === '' ? '' : Number(v));
        }}
      />
      <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="thu">Thu</option>
        <option value="chi">Chi</option>
      </select>
      <select className="border rounded px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input type="text" className="border rounded px-3 py-2" placeholder="Người thu/chi" value={actorName} onChange={(e) => setActorName(e.target.value)} />
      <button className="bg-slate-800 text-white px-4 py-2 rounded">Thêm</button>
    </form>
  );
}
