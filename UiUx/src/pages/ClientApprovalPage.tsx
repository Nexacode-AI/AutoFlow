import { useSearchParams } from "react-router";
import { useState } from "react";
import {
    Check, Car, ShieldCheck, AlertTriangle, CheckCircle2,
    Clock, Wrench, Building2
} from "lucide-react";

type PartType = 'ORI' | 'OM';
type Variant  = { type: PartType; price: number; warranty: string; desc: string };
type PartData = { id: string; name: string; qty: number; variants: Variant[] };

const WARRANTY: Record<PartType, string> = { ORI: '1 Year', OM: '6 Months' };
const TYPE_BADGE: Record<PartType, string> = {
    ORI: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    OM:  'bg-amber-100  text-amber-800  border-amber-200',
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const DATA = {
    token: "abc123xyz789secure",
    workshop: { name: "Autoflow Service Centre", phone: "+60 3-1234 5678" },
    workflow: { code: "WF-2024-0001", date: "16 Feb 2026", expires: "18 Feb 2026, 10:30 AM" },
    customer: { name: "Ahmad bin Abdullah", phone: "+60 12-345 6789" },
    vehicle:  { label: "Honda Civic 2020", plate: "WXY 1234", chassis: "MH1234567890", color: "Silver" },
    advisor:  { name: "Sarah Johnson", phone: "+60 11-987 6543" },
    parts: [
        {
            id: "mp1", name: "Timing Belt", qty: 1,
            variants: [
                { type: 'ORI', price: 220.00, warranty: WARRANTY.ORI, desc: "OEM — original manufacturer belt" },
                { type: 'OM',  price: 120.00, warranty: WARRANTY.OM,  desc: "Aftermarket — other manufacturer" },
            ],
        },
        {
            id: "mp2", name: "Radiator Hose", qty: 1,
            variants: [
                { type: 'ORI', price: 95.00,  warranty: WARRANTY.ORI, desc: "OEM upper radiator hose" },
                { type: 'OM',  price: 48.00,  warranty: WARRANTY.OM,  desc: "Aftermarket radiator hose" },
            ],
        },
        {
            id: "mp3", name: "Wiper Blade Set", qty: 1,
            variants: [
                { type: 'ORI', price: 65.00,  warranty: WARRANTY.ORI, desc: "OEM front wiper blades" },
                { type: 'OM',  price: 32.00,  warranty: WARRANTY.OM,  desc: "Aftermarket wiper blades" },
            ],
        },
        {
            id: "mp4", name: "Engine Oil Filter", qty: 1,
            variants: [
                { type: 'ORI', price: 45.00,  warranty: WARRANTY.ORI, desc: "OEM specification filter" },
                { type: 'OM',  price: 25.00,  warranty: WARRANTY.OM,  desc: "Aftermarket compatible filter" },
            ],
        },
        {
            id: "mp5", name: "Brake Pads (Front)", qty: 1,
            variants: [
                { type: 'ORI', price: 180.00, warranty: WARRANTY.ORI, desc: "Ceramic, OEM grade" },
                { type: 'OM',  price: 140.00, warranty: WARRANTY.OM,  desc: "Ceramic, other manufacturer" },
            ],
        },
    ] as PartData[],
};

type View = "main" | "approved";
type Choice = { selected: boolean; type: PartType };

export default function ClientApprovalPage() {
    const [params] = useSearchParams();
    const valid = params.get("token") === DATA.token;

    // Per-part choice: selected + which type (ORI/OM) the customer wants
    const [choices, setChoices] = useState<Record<string, Choice>>(() =>
        Object.fromEntries(DATA.parts.map(p => [p.id, { selected: true, type: 'ORI' as PartType }]))
    );
    const [view, setView] = useState<View>("main");

    const toggleSelect = (id: string) =>
        setChoices((prev: Record<string, Choice>) => ({ ...prev, [id]: { ...prev[id], selected: !prev[id].selected } }));

    const setType = (id: string, type: PartType) =>
        setChoices((prev: Record<string, Choice>) => ({ ...prev, [id]: { ...prev[id], type, selected: true } }));

    const getVariant = (p: PartData, type: PartType) =>
        p.variants.find(v => v.type === type) ?? p.variants[0];

    const selectedCount = (Object.values(choices) as Choice[]).filter(c => c.selected).length;
    const selTotal = DATA.parts.reduce((s, p) => {
        const c = choices[p.id];
        if (!c?.selected) return s;
        return s + getVariant(p, c.type).price * p.qty;
    }, 0);
    const oriTotal = DATA.parts.reduce((s, p) => s + (p.variants.find(v => v.type === 'ORI')?.price ?? p.variants[0].price) * p.qty, 0);

    // ── Invalid token ─────────────────────────────────────────────────────────
    if (!valid) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-sm p-8 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Link Unavailable</h2>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        This approval link is invalid or has expired. Please contact your service advisor.
                    </p>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 text-left">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <Wrench className="w-4 h-4 text-gray-400 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800">{DATA.advisor.name}</p>
                                <p className="text-xs text-gray-400">{DATA.advisor.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3">
                            <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800">{DATA.workshop.name}</p>
                                <p className="text-xs text-gray-400">{DATA.workshop.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Approved ──────────────────────────────────────────────────────────────
    if (view === "approved") {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b border-gray-200">
                    <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                            <Car className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{DATA.workshop.name}</p>
                            <p className="text-xs text-gray-400">{DATA.workshop.phone}</p>
                        </div>
                    </div>
                </header>
                <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <h2 className="text-base font-semibold text-green-800">Approval Confirmed</h2>
                            <p className="text-sm text-green-700 mt-1 leading-relaxed">
                                Thank you, <strong>{DATA.customer.name}</strong>. Your approval has been recorded.
                                Our team will begin sourcing the selected parts shortly.
                            </p>
                            <p className="text-xs text-green-600 mt-2">Ref: {DATA.workflow.code}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">Approved Parts</p>
                            <span className="text-xs text-gray-500">{selectedCount} of {DATA.parts.length} items</span>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Part</th>
                                    <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500">Qty</th>
                                    <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {DATA.parts.filter(p => choices[p.id]?.selected).map(p => {
                                    const c = choices[p.id];
                                    const v = getVariant(p, c.type);
                                    return (
                                        <tr key={p.id}>
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-gray-800">{p.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full border ${TYPE_BADGE[c.type]}`}>
                                                        {c.type}
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                                        <ShieldCheck className="w-3 h-3" />{v.warranty} warranty
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-600">{p.qty}</td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-800">
                                                RM {(v.price * p.qty).toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-indigo-50 border-t border-indigo-100">
                                    <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-indigo-800">Total Approved</td>
                                    <td className="px-5 py-3 text-right text-base font-bold text-indigo-700">RM {selTotal.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">What Happens Next</p>
                        <ol className="space-y-3">
                            {[
                                "Our team will source and procure your approved parts.",
                                "Work will begin once the parts have arrived.",
                                "Your service advisor will keep you updated throughout."
                            ].map((s, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                    {s}
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <Wrench className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">{DATA.advisor.name}</p>
                            <p className="text-xs text-gray-400">Service Advisor · {DATA.advisor.phone}</p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-300 pt-2">{DATA.workshop.name} · Parts Approval Portal</p>
                </div>
            </div>
        );
    }

    // ── Main page ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                            <Car className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{DATA.workshop.name}</p>
                            <p className="text-xs text-gray-400">{DATA.workshop.phone}</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Approval
                    </span>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">

                {/* Page title */}
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Parts Approval Request</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Workflow <span className="font-medium text-gray-700">{DATA.workflow.code}</span> ·
                        Issued {DATA.workflow.date} · Expires {DATA.workflow.expires}
                    </p>
                </div>

                {/* Info strip */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 divide-x divide-gray-100">
                        <div className="px-4 py-4">
                            <p className="text-xs text-gray-400 mb-1">Customer</p>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{DATA.customer.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{DATA.customer.phone}</p>
                        </div>
                        <div className="px-4 py-4">
                            <p className="text-xs text-gray-400 mb-1">Vehicle</p>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{DATA.vehicle.label}</p>
                            <p className="text-xs text-gray-400 mt-1">Plate: {DATA.vehicle.plate}</p>
                        </div>
                        <div className="px-4 py-4">
                            <p className="text-xs text-gray-400 mb-1">Service Advisor</p>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{DATA.advisor.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{DATA.advisor.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Security notice */}
                <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    This is a <strong>secure, one-time link</strong> issued exclusively for this workflow. Please do not share it.
                </div>

                {/* ORI vs OM legend */}
                <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600">
                    <span className="font-semibold text-gray-500 shrink-0">Part Types:</span>
                    <span className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200">ORI</span>
                        Original manufacturer — <strong>1-year warranty</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full border bg-amber-100 text-amber-800 border-amber-200">OM</span>
                        Other manufacturer — <strong>6-month warranty</strong>
                    </span>
                </div>

                {/* Parts list */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Recommended Parts</p>
                            <p className="text-xs text-gray-400 mt-0.5">Choose ORI or OM for each part, then select the ones you approve.</p>
                        </div>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                            {selectedCount} / {DATA.parts.length} selected
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {DATA.parts.map(p => {
                            const c = choices[p.id];
                            const on = c.selected;
                            const activeVariant = getVariant(p, c.type);
                            const otherType: PartType = c.type === 'ORI' ? 'OM' : 'ORI';
                            const otherVariant = getVariant(p, otherType);
                            const hasBoth = p.variants.length > 1;
                            return (
                                <div
                                    key={p.id}
                                    className={`px-4 py-4 transition-colors ${
                                        on ? "bg-white" : "bg-gray-50 opacity-60"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleSelect(p.id)}
                                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                                on ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300"
                                            }`}
                                        >
                                            {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-semibold ${
                                                    on ? "text-gray-900" : "text-gray-400 line-through"
                                                }`}>{p.name}</p>
                                                <div className="text-right shrink-0">
                                                    <p className={`text-sm font-bold ${
                                                        on ? "text-gray-900" : "text-gray-300"
                                                    }`}>
                                                        RM {(activeVariant.price * p.qty).toFixed(2)}
                                                    </p>
                                                    {p.qty > 1 && (
                                                        <p className="text-xs text-gray-400">RM {activeVariant.price.toFixed(2)} × {p.qty}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Type toggle — only when both options exist */}
                                            {hasBoth && (
                                                <div className="mt-2.5 flex gap-2">
                                                    {p.variants.map(v => (
                                                        <button
                                                            key={v.type}
                                                            onClick={() => setType(p.id, v.type)}
                                                            className={`flex-1 rounded-lg border-2 px-3 py-2 text-left transition-all ${
                                                                c.type === v.type
                                                                    ? v.type === 'ORI'
                                                                        ? 'border-indigo-500 bg-indigo-50'
                                                                        : 'border-amber-500 bg-amber-50'
                                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full border ${TYPE_BADGE[v.type]}`}>
                                                                    {v.type}
                                                                </span>
                                                                {c.type === v.type && (
                                                                    <Check className="w-3.5 h-3.5 text-indigo-600" strokeWidth={3} />
                                                                )}
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-800 mt-1">RM {v.price.toFixed(2)}</p>
                                                            <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                                                                <ShieldCheck className="w-3 h-3" />{v.warranty}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{v.desc}</p>
                                                            {c.type !== v.type && (
                                                                <p className={`text-xs font-medium mt-1 ${
                                                                    v.price < activeVariant.price ? 'text-green-600' : 'text-orange-600'
                                                                }`}>
                                                                    {v.price < activeVariant.price
                                                                        ? `Save RM ${(activeVariant.price - v.price).toFixed(2)}`
                                                                        : `+RM ${(v.price - activeVariant.price).toFixed(2)} for longer warranty`}
                                                                </p>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Single-type part — just show badge */}
                                            {!hasBoth && (
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full border ${TYPE_BADGE[activeVariant.type]}`}>
                                                        {activeVariant.type}
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                                        <ShieldCheck className="w-3 h-3" />{activeVariant.warranty}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{activeVariant.desc}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer totals */}
                    <div className="border-t border-gray-200">
                        <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
                            <span className="text-xs text-gray-400">ORI estimate — all {DATA.parts.length} parts</span>
                            <span className="text-sm font-medium text-gray-500">RM {oriTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3 bg-indigo-50 border-t border-indigo-100">
                            <span className="text-sm font-semibold text-indigo-800">
                                Your Selection ({selectedCount} part{selectedCount !== 1 ? "s" : ""})
                            </span>
                            <span className="text-base font-bold text-indigo-700">RM {selTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom action bar */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <button
                        onClick={() => {
                            localStorage.setItem('autoflow_approved_ids', JSON.stringify(
                                DATA.parts.filter(p => choices[p.id]?.selected).map(p => ({
                                    id: p.id, type: choices[p.id].type
                                }))
                            ));
                            setView("approved");
                        }}
                        disabled={selectedCount === 0}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg text-sm font-semibold transition-colors ${
                            selectedCount > 0
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            {selectedCount > 0
                                ? `Approve ${selectedCount} Part${selectedCount !== 1 ? "s" : ""}`
                                : "Select at least one part to approve"}
                        </span>
                        {selectedCount > 0 && (
                            <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-md">
                                RM {selTotal.toFixed(2)}
                            </span>
                        )}
                    </button>
                </div>
            </div>

        </div>
    );
}
