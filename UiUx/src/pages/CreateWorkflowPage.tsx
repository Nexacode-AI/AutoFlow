import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router';
import { DETAILED_WORKFLOW_STEPS } from '../types';
import {
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    Check,
    Camera,
    MessageSquare,
    Wrench,
    Package,
    DollarSign,
    FileText,
    Send,
    Upload,
    X,
    Clock,
    AlertTriangle,
    Copy,
    CheckCheck,
    Share2,
    Plus
} from 'lucide-react';

export default function CreateWorkflowPage() {
    const navigate = useNavigate();
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const [isFeedbackEmailExpanded, setIsFeedbackEmailExpanded] = useState(true);
    
    // ─── Step 7: Spare Parts selection + supplier message ───────────────────
    const PARTS_CATALOG: Record<string, { id: string; name: string; price: number }[]> = {
        'Brake System': [
            { id: 'BP-F-001', name: 'Brake Pads (Front)', price: 150 },
            { id: 'BP-R-002', name: 'Brake Pads (Rear)',  price: 130 },
            { id: 'BD-F-003', name: 'Brake Disc (Front)', price: 280 },
            { id: 'BC-004',   name: 'Brake Caliper',      price: 320 },
        ],
        'Engine Parts': [
            { id: 'EO-5W30-4L', name: 'Engine Oil 5W-30 (4L)', price: 85 },
            { id: 'OF-001',     name: 'Oil Filter',             price: 25 },
            { id: 'AF-002',     name: 'Air Filter',             price: 45 },
            { id: 'SP-003',     name: 'Spark Plugs (set of 4)', price: 120 },
        ],
        'Electrical': [
            { id: 'BAT-001', name: 'Car Battery (55Ah)',  price: 350 },
            { id: 'ALT-002', name: 'Alternator',          price: 480 },
            { id: 'FUS-003', name: 'Fuse Box Set',        price: 60  },
        ],
        'AC System': [
            { id: 'ACF-001', name: 'AC Filter / Cabin Filter', price: 55  },
            { id: 'ACG-002', name: 'AC Gas Refill (R134a)',    price: 120 },
            { id: 'ACP-003', name: 'AC Compressor',            price: 950 },
        ],
        'Suspension': [
            { id: 'SA-001', name: 'Shock Absorber (Front pair)', price: 420 },
            { id: 'CS-002', name: 'Coil Spring (Front)',         price: 180 },
            { id: 'BJ-003', name: 'Ball Joint',                  price: 95  },
        ],
    };

    const WORKFLOW_CODE = 'WF-2024-0001';
    const CHASSIS_NUMBER = 'MH1234567890'; // would come from step 4 in real app
    const PLATE_NUMBER   = 'WXY 1234';     // would come from step 1 in real app

    type PartEntry = { id: string; name: string; price: number; qty: number };

    const [partsCategory, setPartsCategory] = useState<string>('');
    const [selectedParts, setSelectedParts] = useState<Record<string, PartEntry>>({});
    const [supplierMessage, setSupplierMessage] = useState<string>('');
    const [messageCopied, setMessageCopied] = useState(false);
    const [partsConfirmed, setPartsConfirmed] = useState(false);

    const togglePart = (part: { id: string; name: string; price: number }) => {
        setSelectedParts(prev => {
            if (prev[part.id]) {
                const next = { ...prev };
                delete next[part.id];
                return next;
            }
            return { ...prev, [part.id]: { ...part, qty: 1 } };
        });
        setPartsConfirmed(false);
        setSupplierMessage('');
    };

    const updateQty = (partId: string, qty: number) => {
        setSelectedParts(prev => ({
            ...prev,
            [partId]: { ...prev[partId], qty: Math.max(1, qty) }
        }));
        setPartsConfirmed(false);
        setSupplierMessage('');
    };

    const generateSupplierMessage = () => {
        const parts = Object.values(selectedParts);
        if (parts.length === 0) return;
        const totalPrice = parts.reduce((sum, p) => sum + p.price * p.qty, 0);
        const dateStr = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });

        const partLines = parts
            .map((p, i) =>
`  ${String(i + 1).padStart(2, ' ')}. ${p.name}
      Part ID    : ${p.id}
      Quantity   : ${p.qty} unit${p.qty > 1 ? 's' : ''}
      Unit Price : RM ${p.price.toFixed(2)}
      Subtotal   : RM ${(p.price * p.qty).toFixed(2)}`
            )
            .join('\n\n');

        const msg =
`*SPARE PARTS ENQUIRY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Workshop      : Autoflow Service Centre
Workflow Code : ${WORKFLOW_CODE}
Vehicle Plate : ${PLATE_NUMBER}
Chassis No.   : ${CHASSIS_NUMBER}
Date          : ${dateStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTS REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${partLines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL ESTIMATED COST : RM ${totalPrice.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kindly confirm the following:
  • Parts availability (In Stock / To Order)
  • Your best quoted price per unit
  • Expected delivery date / lead time

Please reply at your earliest convenience.

Thank you.

Best Regards,
Autoflow Service Centre
Ref: ${WORKFLOW_CODE}`;
        setSupplierMessage(msg);
        setPartsConfirmed(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(supplierMessage).then(() => {
            setMessageCopied(true);
            setTimeout(() => setMessageCopied(false), 2500);
        });
    };

    const shareViaWhatsApp = () => {
        window.open(
            `https://api.whatsapp.com/send/?text=${encodeURIComponent(supplierMessage)}&type=custom_url&app_absent=0`,
            '_blank'
        );
    };

    // ─── Step 8: Supplier Quote Entry (connected to Step 7) ──────────────────
    type SupplierQuote = { price: string; availability: string };
    const [supplierQuotes, setSupplierQuotes] = useState<Record<string, SupplierQuote>>({});

    const updateQuote = (partId: string, field: keyof SupplierQuote, value: string) => {
        setSupplierQuotes(prev => ({
            ...prev,
            [partId]: { ...(prev[partId] ?? { price: '', availability: 'In Stock' }), [field]: value }
        }));
    };

    const getQuote = (partId: string): SupplierQuote =>
        supplierQuotes[partId] ?? {
            price: selectedParts[partId] ? String(selectedParts[partId].price) : '',
            availability: 'In Stock'
        };

    const step8Parts = Object.values(selectedParts);
    const step8Total = step8Parts.reduce((sum, p) => {
        const price = parseFloat(getQuote(p.id).price);
        return sum + (isNaN(price) ? 0 : price * p.qty);
    }, 0);
    const step8AllFilled = step8Parts.length > 0 &&
        step8Parts.every(p => getQuote(p.id).price !== '' && !isNaN(parseFloat(getQuote(p.id).price)));

    // ─── Step 9: Markup Pricing (connected to Steps 7 & 8) ──────────────────
    const MIN_MARGIN = 60; // minimum required profit margin %
    const [markupPrices, setMarkupPrices] = useState<Record<string, string>>({});

    const updateMarkup = (partId: string, value: string) =>
        setMarkupPrices(prev => ({ ...prev, [partId]: value }));

    // margin = (sellingPrice - cost) / sellingPrice * 100
    const calcMargin = (supplierPrice: number, markupPrice: number): number | null => {
        if (!markupPrice || markupPrice <= 0) return null;
        return ((markupPrice - supplierPrice) / markupPrice) * 100;
    };

    const step9TotalCost   = step8Parts.reduce((s, p) => {
        const sp = parseFloat(getQuote(p.id).price);
        return s + (isNaN(sp) ? 0 : sp * p.qty);
    }, 0);
    const step9TotalMarkup = step8Parts.reduce((s, p) => {
        const mp = parseFloat(markupPrices[p.id] ?? '');
        return s + (isNaN(mp) ? 0 : mp * p.qty);
    }, 0);
    const step9OverallMargin =
        step9TotalMarkup > 0
            ? ((step9TotalMarkup - step9TotalCost) / step9TotalMarkup) * 100
            : null;
    const step9AllValid = step8Parts.length > 0 && step8AllFilled &&
        step8Parts.every(p => {
            const sp = parseFloat(getQuote(p.id).price);
            const mp = parseFloat(markupPrices[p.id] ?? '');
            if (isNaN(sp) || isNaN(mp) || mp <= 0) return false;
            const margin = calcMargin(sp, mp);
            return margin !== null && margin >= MIN_MARGIN;
        });

    // ─── Step 10: Customer Approval Message (standalone – mock data) ──────────
    const APPROVAL_TOKEN  = 'abc123xyz789secure';
    const APPROVAL_LINK   = `https://yourworkshop.com/client-approval?token=${APPROVAL_TOKEN}`;
    const [customerMessage,       setCustomerMessage]       = useState<string>('');
    const [customerMessageCopied, setCustomerMessageCopied] = useState(false);

    // Each part has ORI and OM variants — must match ClientApprovalPage DATA.parts
    type ApprovalChoice = { id: string; type: 'ORI' | 'OM' };
    const STEP10_MOCK_PARTS = [
        { id: 'mp1', name: 'Timing Belt',        qty: 1, variants: [{ type: 'ORI' as const, price: 220.00 }, { type: 'OM' as const, price: 120.00 }] },
        { id: 'mp2', name: 'Radiator Hose',      qty: 1, variants: [{ type: 'ORI' as const, price: 95.00  }, { type: 'OM' as const, price: 48.00  }] },
        { id: 'mp3', name: 'Wiper Blade Set',    qty: 1, variants: [{ type: 'ORI' as const, price: 65.00  }, { type: 'OM' as const, price: 32.00  }] },
        { id: 'mp4', name: 'Engine Oil Filter',  qty: 1, variants: [{ type: 'ORI' as const, price: 45.00  }, { type: 'OM' as const, price: 25.00  }] },
        { id: 'mp5', name: 'Brake Pads (Front)', qty: 1, variants: [{ type: 'ORI' as const, price: 180.00 }, { type: 'OM' as const, price: 140.00 }] },
    ];
    const getApprovalPrice = (p: typeof STEP10_MOCK_PARTS[number], type: 'ORI' | 'OM') =>
        p.variants.find(v => v.type === type)?.price ?? p.variants[0].price;

    const generateCustomerMessage = () => {
        const parts = STEP10_MOCK_PARTS;
        const dateStr  = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });
        const partLines = parts.map((p, i) =>
            `  ${String(i + 1).padStart(2, ' ')}. ${p.name} (x${p.qty}) — ORI RM ${(p.variants[0].price * p.qty).toFixed(2)} / OM RM ${(p.variants[1].price * p.qty).toFixed(2)}`
        ).join('\n');
        const total = parts.reduce((s, p) => s + p.variants[0].price * p.qty, 0);
        const msg =
`Dear ${mockApprovalData.customerName},

We have completed the diagnosis for your vehicle.

Workflow Ref : ${WORKFLOW_CODE}
Vehicle Plate: ${PLATE_NUMBER}
Date         : ${dateStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTS REQUIRED FOR YOUR VEHICLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${partLines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL AMOUNT : RM ${total.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kindly review and approve via the secure link below:
${APPROVAL_LINK}

This link expires in 48 hours.

If you have any questions, please contact us at
+60 12-345 6789.

Thank you,
Autoflow Service Centre`;
        setCustomerMessage(msg);
    };

    const copyCustomerMessage = () => {
        navigator.clipboard.writeText(customerMessage).then(() => {
            setCustomerMessageCopied(true);
            setTimeout(() => setCustomerMessageCopied(false), 2500);
        });
    };

    const shareCustomerMessageViaWhatsApp = () => {
        window.open(
            `https://api.whatsapp.com/send/?text=${encodeURIComponent(customerMessage)}&type=custom_url&app_absent=0`,
            '_blank'
        );
    };

    // Mock customer data (would come from Step 5 in real app)
    const mockApprovalData = {
        customerName: 'Ahmad bin Abdullah',
    };

    // ─── Step 10 → 11: Customer approval response (from ClientApprovalPage via localStorage) ──
    // null  = customer hasn't responded yet
    // ApprovalChoice[] = {id, type} pairs the customer approved (ORI or OM per part)
    const [customerApproval, setCustomerApproval] = useState<ApprovalChoice[] | null>(() => {
        try {
            const saved = localStorage.getItem('autoflow_approved_ids');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const refreshCustomerResponse = () => {
        try {
            const saved = localStorage.getItem('autoflow_approved_ids');
            if (saved) setCustomerApproval(JSON.parse(saved));
        } catch {}
    };

    // ─── Parts catalogue (used by Step 11 Add Part dropdowns) ────────────────
    const QUOTE_PARTS_CATALOG: Record<string, { name: string; price: number }[]> = {
        'Engine': [
            { name: 'Engine Oil Filter',        price: 45.00 },
            { name: 'Engine Oil (5W-30, 4 L)',  price: 85.00 },
            { name: 'Timing Belt',              price: 220.00 },
            { name: 'Spark Plugs (Set of 4)',   price: 120.00 },
            { name: 'Valve Cover Gasket',       price: 75.00 },
        ],
        'Air & Fuel': [
            { name: 'Air Filter',               price: 55.00 },
            { name: 'Cabin Air Filter',         price: 40.00 },
            { name: 'Fuel Filter',              price: 65.00 },
            { name: 'Throttle Body Cleaner',    price: 30.00 },
        ],
        'Brakes': [
            { name: 'Brake Pads (Front)',        price: 180.00 },
            { name: 'Brake Pads (Rear)',         price: 150.00 },
            { name: 'Brake Disc (Front Pair)',   price: 320.00 },
            { name: 'Brake Fluid (DOT4)',        price: 35.00 },
        ],
        'Electrical': [
            { name: 'Car Battery (DIN65)',       price: 280.00 },
            { name: 'Alternator Belt',           price: 55.00 },
            { name: 'Fuse Set',                 price: 15.00 },
        ],
        'Wipers & Exterior': [
            { name: 'Windshield Wiper Blades',  price: 25.00 },
            { name: 'Windshield Washer Fluid',  price: 12.00 },
            { name: 'Headlight Bulb (H4)',      price: 45.00 },
        ],
        'Cooling': [
            { name: 'Coolant / Radiator Fluid', price: 40.00 },
            { name: 'Radiator Cap',             price: 20.00 },
            { name: 'Thermostat',               price: 65.00 },
        ],
        'Transmission': [
            { name: 'Transmission Fluid (ATF)', price: 75.00 },
            { name: 'Clutch Kit',               price: 450.00 },
        ],
        'Tyres & Wheels': [
            { name: 'Tyre (195/65R15)',          price: 280.00 },
            { name: 'Wheel Alignment',           price: 60.00 },
            { name: 'Wheel Balancing (per wheel)', price: 15.00 },
        ],
    };

    // ─── Step 11: Quotation builder ──────────────────────────────────────────
    type QuotePart = { id: string; name: string; qty: number; price: number; partType?: 'ORI' | 'OM' };
    const [quoteParts,        setQuoteParts]        = useState<QuotePart[]>([]);
    const [quoteAddCategory,  setQuoteAddCategory]  = useState('');
    const [quoteAddName,      setQuoteAddName]      = useState('');
    const [quoteAddQty,       setQuoteAddQty]       = useState('1');
    const [quoteAddPrice,     setQuoteAddPrice]     = useState('');
    const [showQuoteAdd,      setShowQuoteAdd]      = useState(false);
    const [quotePdfGenerated, setQuotePdfGenerated] = useState(false);
    const [shortMsgExpanded,   setShortMsgExpanded]   = useState(true);

    // ─── Step 12: Spare Part Order message ───────────────────────────
    const SUPPLIERS = [
        'ABC Auto Parts Sdn Bhd',
        'XYZ Motor Supply',
        'Premium Parts Malaysia',
    ];
    const [orderSupplier,    setOrderSupplier]    = useState('');
    const [orderMsg,         setOrderMsg]         = useState('');
    const [orderMsgCopied,   setOrderMsgCopied]   = useState(false);

    // ─── Step 12 (NEW): Multi-Supplier Pricing Tool ──────────────────────────
    type SupplierDef = { id: string; name: string; color: string };
    const [spo12Suppliers, setSpo12Suppliers] = useState<SupplierDef[]>([
        { id: 'suan-huat',      name: 'Suan Huat',      color: '#3b82f6' },
        { id: 'stuttgart',      name: 'Stuttgart',      color: '#16a34a' },
        { id: 'bavaria',        name: 'Bavaria',        color: '#9333ea' },
        { id: 'ramon',          name: 'Ramon',          color: '#c2410c' },
        { id: 'ba-auto',        name: 'BA Auto',        color: '#db2777' },
        { id: 'other-supplier', name: 'Other Supplier', color: '#374151' },
    ]);
    const [spo12SelectedIds, setSpo12SelectedIds] = useState<string[]>(['suan-huat', 'stuttgart', 'bavaria']);
    const [spo12Markup, setSpo12Markup]           = useState<40 | 55 | 70>(55);
    const [spo12Tab, setSpo12Tab]                 = useState<'parts' | 'summary' | 'whatsapp'>('parts');
    const [spo12Costs, setSpo12Costs]             = useState<Record<string, string>>({
        'crank-sensor_ORI_suan-huat': '380', 'crank-sensor_ORI_stuttgart': '400', 'crank-sensor_ORI_bavaria': '420',
        'crank-sensor_OEM_suan-huat': '130', 'crank-sensor_OEM_stuttgart': '150', 'crank-sensor_OEM_bavaria': '160',
        'crank-sensor_LABOUR_suan-huat': '100', 'crank-sensor_LABOUR_stuttgart': '120', 'crank-sensor_LABOUR_bavaria': '110',
        'ignition-coil_ORI_suan-huat': '180', 'ignition-coil_ORI_stuttgart': '170', 'ignition-coil_ORI_bavaria': '195',
        'ignition-coil_OEM_suan-huat': '70',  'ignition-coil_OEM_stuttgart': '80',  'ignition-coil_OEM_bavaria': '75',
        'ignition-coil_USED_suan-huat': '40',
        'ignition-coil_LABOUR_suan-huat': '80', 'ignition-coil_LABOUR_stuttgart': '90', 'ignition-coil_LABOUR_bavaria': '85',
        'agm-battery_ORI_suan-huat': '1250', 'agm-battery_ORI_stuttgart': '1300', 'agm-battery_ORI_bavaria': '1280',
        'agm-battery_LABOUR_suan-huat': '50',  'agm-battery_LABOUR_stuttgart': '60',  'agm-battery_LABOUR_bavaria': '55',
    });
    const [spo12Charge, setSpo12Charge] = useState<Record<string, string>>({
        'crank-sensor_ORI': 'suan-huat',   'crank-sensor_LABOUR': 'suan-huat',
        'ignition-coil_ORI': 'stuttgart',  'ignition-coil_LABOUR': 'suan-huat',
        'agm-battery_ORI': 'suan-huat',    'agm-battery_LABOUR': 'suan-huat',
    });
    const [spo12Ordered, setSpo12Ordered] = useState<Record<string, boolean>>({ 'ignition-coil': true });
    const [spo12AddName, setSpo12AddName] = useState('');
    const [spo12ShowAdd, setSpo12ShowAdd] = useState(false);

    const generateOrderMsg = (supplier: string) => {
        if (!supplier || quoteParts.length === 0) return;
        const dateStr = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });
        const lines = quoteParts
            .map((p, i) => `  ${String(i + 1).padStart(2, ' ')}. ${p.name.padEnd(30, ' ')} × ${String(p.qty).padStart(2, ' ')}   —  RM ${(p.price * p.qty).toFixed(2)}`)
            .join('\n');
        const total = quoteParts.reduce((s, p) => s + p.price * p.qty, 0);
        setOrderMsg(
`Dear ${supplier},

We would like to place a spare parts order on behalf of our customer. Please see details below.

Workflow Ref   : ${WORKFLOW_CODE}
Chassis No.    : ${CHASSIS_NUMBER}
Plate No.      : ${PLATE_NUMBER}
Vehicle        : Honda Civic 2020
Customer       : ${mockApprovalData.customerName}
Order Date     : ${dateStr}

Parts Required:
${lines}

${'  Total'.padEnd(37, ' ')}   RM ${total.toFixed(2)}

Kindly confirm availability, pricing, and estimated delivery date at your earliest convenience.

Thank you,
Autoflow Service Centre
+60 3-1234 5678`
        );
    };

    const copyOrderMsg = () => {
        navigator.clipboard.writeText(orderMsg);
        setOrderMsgCopied(true);
        setTimeout(() => setOrderMsgCopied(false), 2000);
    };

    // ─── Step 13: Spare Parts in Workshop ────────────────────────────────────
    type ReceivedPart = { qtyOrdered: number; qtyReceived: string; condition: string };
    const [receivedParts, setReceivedParts] = useState<Record<string, ReceivedPart>>({});

    const initReceivedParts = () => {
        if (Object.keys(receivedParts).length === 0 && quoteParts.length > 0) {
            const init: Record<string, ReceivedPart> = {};
            quoteParts.forEach(p => {
                init[p.id] = { qtyOrdered: p.qty, qtyReceived: String(p.qty), condition: 'Good' };
            });
            setReceivedParts(init);
        }
    };

    const updateReceived = (id: string, field: 'qtyReceived' | 'condition', value: string) =>
        setReceivedParts(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

    const allPartsConfirmed = quoteParts.length > 0 &&
        quoteParts.every(p => receivedParts[p.id]?.qtyReceived !== '' && Number(receivedParts[p.id]?.qtyReceived) > 0);

    useEffect(() => {
        if (expandedStep === 13) initReceivedParts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandedStep]);

    // ─── Step 18: Send Receipt ───────────────────────────────────────────────
    const [receiptLaborCost, setReceiptLaborCost] = useState('150');
    const [receiptMsg,       setReceiptMsg]       = useState('');
    const [receiptMsgCopied, setReceiptMsgCopied] = useState(false);

    const generateReceiptMsg = () => {
        const dateStr = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });
        const inspectionDate = new Date();
        inspectionDate.setMonth(inspectionDate.getMonth() + 6);
        const inspectionStr = inspectionDate.toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });
        const partsCost = quoteTotal;
        const labor = parseFloat(receiptLaborCost) || 0;
        const subtotal = partsCost + labor;
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        const receiptNo = `RCP-${WORKFLOW_CODE.replace('WF-', '')}`;
        const divider = '─'.repeat(45);
        const parts = quoteParts
            .map((p, i) => `  ${String(i + 1).padStart(2)}. ${p.name.padEnd(32)} RM ${(p.price * p.qty).toFixed(2)}`)
            .join('\n');
        setReceiptMsg(
`AUTOFLOW SERVICE CENTRE
Official Service Receipt
${'='.repeat(45)}
Workflow Ref   : ${WORKFLOW_CODE}
Receipt No.    : ${receiptNo}
Date           : ${dateStr}
${divider}
Customer       : ${mockApprovalData.customerName}
Vehicle        : Honda Civic 2020 (${PLATE_NUMBER})
Chassis No.    : ${CHASSIS_NUMBER}
${divider}
PARTS REPLACED:
${parts}
  ${divider}
  Parts Subtotal                       RM ${partsCost.toFixed(2)}
  Labor Charges                        RM ${labor.toFixed(2)}
  ${divider}
  Subtotal                             RM ${subtotal.toFixed(2)}
  Service Tax (8%)                     RM ${tax.toFixed(2)}
${'='.repeat(45)}
  TOTAL AMOUNT                         RM ${total.toFixed(2)}
${'='.repeat(45)}

* Your next scheduled inspection date is: ${inspectionStr}

Thank you for choosing Autoflow Service Centre!
For enquiries: +60 3-1234 5678
www.autoflowservice.com`
        );
    };

    const copyReceiptMsg = () => {
        navigator.clipboard.writeText(receiptMsg);
        setReceiptMsgCopied(true);
        setTimeout(() => setReceiptMsgCopied(false), 2000);
    };

    // Seed quote parts from customer-approved parts (called when Step 10 completes)
    const initQuoteParts = () => {
        if (quoteParts.length === 0) {
            const approval = customerApproval ?? [];
            setQuoteParts(
                STEP10_MOCK_PARTS
                    .filter(p => approval.some(c => c.id === p.id))
                    .map(p => {
                        const choice = approval.find(c => c.id === p.id)!;
                        return { id: p.id, name: p.name, qty: p.qty, price: getApprovalPrice(p, choice.type), partType: choice.type };
                    })
            );
        }
    };

    // Seed when the user navigates directly to step 11 (accordion open)
    useEffect(() => {
        if (expandedStep === 11 && quoteParts.length === 0) {
            initQuoteParts();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandedStep]);

    const quoteTotal = quoteParts.reduce((s, p) => s + p.price * p.qty, 0);

    const addQuotePart = () => {
        if (!quoteAddName.trim() || !quoteAddPrice) return;
        setQuoteParts(prev => [...prev, {
            id: `admin-${Date.now()}`,
            name: quoteAddName.trim(),
            qty: parseInt(quoteAddQty) || 1,
            price: parseFloat(quoteAddPrice) || 0,
        }]);
        setQuoteAddCategory(''); setQuoteAddName(''); setQuoteAddQty('1'); setQuoteAddPrice('');
        setShowQuoteAdd(false);
    };

    const removeQuotePart = (id: string) =>
        setQuoteParts(prev => prev.filter(p => p.id !== id));

    const shareQuoteViaWhatsApp = () => {
        const dateStr = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });
        const lines = quoteParts.map((p, i) =>
            `  ${i + 1}. ${p.name} (x${p.qty}) — RM ${(p.price * p.qty).toFixed(2)}`
        ).join('\n');
        const msg =
`Dear ${mockApprovalData.customerName},

Here is your final quotation from Autoflow Service Centre.

Ref  : ${WORKFLOW_CODE}
Date : ${dateStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUOTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${lines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL : RM ${quoteTotal.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you,
Autoflow Service Centre
+60 3-1234 5678`;
        window.open(
            `https://api.whatsapp.com/send/?text=${encodeURIComponent(msg)}&type=custom_url&app_absent=0`,
            '_blank'
        );
    };
    // ─────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    // Step completion tracking with timestamps
    const [stepCompletionTimes, setStepCompletionTimes] = useState<{[key: number]: number}>({});
    const [currentTimers, setCurrentTimers] = useState<{[key: number]: number}>({});
    const [exceededSteps, setExceededSteps] = useState<Set<number>>(new Set());
    
    // Time limits for each step (in minutes)
    const stepTimeLimits: {[key: number]: number} = {
        1: 5,   // Customer Details Form - 5 minutes
        2: 1,   // Photo Upload - 1 minute
        3: 2,   // WhatsApp Group - 2 minutes
        4: 15,  // Parts Selection - 15 minutes
        5: 10,  // Parts Pricing - 10 minutes
        6: 5,   // Parts Confirmation - 5 minutes
        7: 5,   // Markup Configuration - 5 minutes
        8: 10,  // Work Progress Photos - 10 minutes
        9: 30,  // Email Client Approval - 30 minutes
        10: 30  // Workflow Summary - 30 minutes
    };

    const toggleStep = (stepNumber: number) => {
        setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
    };

    // Mark step as complete and start timer for next step
    const completeStep = (stepNumber: number) => {
        const currentTime = Date.now();
        setStepCompletionTimes(prev => ({
            ...prev,
            [stepNumber]: currentTime
        }));
        
        // Check if previous step was completed within time limit
        if (stepNumber > 1) {
            const prevStepTime = stepCompletionTimes[stepNumber - 1];
            if (prevStepTime) {
                const elapsedMinutes = (currentTime - prevStepTime) / 1000 / 60;
                const timeLimit = stepTimeLimits[stepNumber];
                if (elapsedMinutes > timeLimit) {
                    setExceededSteps(prev => new Set(prev).add(stepNumber));
                }
            }
        }
    };

    // Timer tick effect
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const newTimers: {[key: number]: number} = {};
            
            Object.entries(stepCompletionTimes).forEach(([step, completionTime]) => {
                const stepNum = parseInt(step);
                const nextStep = stepNum + 1;
                
                if (nextStep <= 10 && !stepCompletionTimes[nextStep]) {
                    const elapsedMs = now - completionTime;
                    const elapsedMinutes = elapsedMs / 1000 / 60;
                    const limitMinutes = stepTimeLimits[nextStep] || 5;
                    
                    newTimers[nextStep] = limitMinutes - elapsedMinutes;
                    
                    if (elapsedMinutes > limitMinutes && !exceededSteps.has(nextStep)) {
                        setExceededSteps(prev => new Set(prev).add(nextStep));
                    }
                }
            });
            
            setCurrentTimers(newTimers);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [stepCompletionTimes, exceededSteps, stepTimeLimits]);

    // Format timer display
    const formatTimer = (minutes: number): string => {
        if (minutes <= 0) return '0:00';
        const mins = Math.floor(Math.abs(minutes));
        const secs = Math.floor((Math.abs(minutes) % 1) * 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get timer status for a step
    const getTimerStatus = (stepNumber: number) => {
        const isCompleted = !!stepCompletionTimes[stepNumber];
        const timeRemaining = currentTimers[stepNumber];
        const isExceeded = exceededSteps.has(stepNumber);
        const timeLimit = stepTimeLimits[stepNumber];
        
        return {
            isCompleted,
            timeRemaining,
            isExceeded,
            timeLimit,
            isActive: timeRemaining !== undefined && !isCompleted
        };
    };

    // Generate WhatsApp group name from workout data
    const generateWhatsAppGroupName = (workflowCode: string, plateNumber: string) => {
        return `${workflowCode} - ${plateNumber} Repair`;
    };

    // Generate WhatsApp group creation link
    const generateWhatsAppGroupLink = (workflowCode: string, carModel: string) => {
        const message = `Please create a WhatsApp group with the name ${workflowCode} - ${carModel} and add the customer, service advisor, and bay mechanic.`;
        return `https://api.whatsapp.com/send/?text=${encodeURIComponent(message)}&type=custom_url&app_absent=0`;
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            'SUPERADMIN': 'Super Admin',
            'ADMIN': 'Admin',
            'MANAGEMENT': 'Management',
            'TECHNICIAN': 'Technician',
            'CUSTOMER_SERVICE': 'Customer Service'
        };
        return labels[role] || role;
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            'SUPERADMIN': 'bg-purple-100 text-purple-800 border-purple-300',
            'ADMIN': 'bg-blue-100 text-blue-800 border-blue-300',
            'MANAGEMENT': 'bg-indigo-100 text-indigo-800 border-indigo-300',
            'TECHNICIAN': 'bg-green-100 text-green-800 border-green-300',
            'CUSTOMER_SERVICE': 'bg-orange-100 text-orange-800 border-orange-300'
        };
        return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStepUI = (stepNumber: number) => {
        switch (stepNumber) {
            case 1: // Create Workflow
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Enter vehicle plate number to create new workflow</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number *</label>
                                <input type="text" placeholder="e.g., WXY 1234" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Code (Auto-generated)</label>
                                <input type="text" value="WF-2024-0001" disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => completeStep(1)}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Create Workflow
                            </button>
                            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                );

            case 2: // Inspection Sheet
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Complete vehicle inspection checklist and get customer approval</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-indigo-600" />
                                <label className="text-gray-700">Exterior condition checked</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-indigo-600" />
                                <label className="text-gray-700">Interior condition checked</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-indigo-600" />
                                <label className="text-gray-700">Existing damages documented</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-indigo-600" />
                                <label className="text-gray-700">Customer approval received</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea rows={3} placeholder="Add any additional notes..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button 
                            onClick={() => completeStep(2)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Mark as Complete
                        </button>
                    </div>
                );

            case 3: // WhatsApp Group
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Create WhatsApp group for workflow communication</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Group Name *</label>
                            <input 
                                type="text" 
                                value={generateWhatsAppGroupName('WF-2024-0001', 'WXY 1234')} 
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-generated from Workflow Code and Plate Number</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-900 mb-2">Add Members:</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 bg-white rounded">
                                    <input type="checkbox" checked className="w-4 h-4" readOnly />
                                    <span className="text-sm">Customer (+60 12-345 6789)</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-white rounded">
                                    <input type="checkbox" checked className="w-4 h-4" readOnly />
                                    <span className="text-sm">Service Advisor</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-white rounded">
                                    <input type="checkbox" checked className="w-4 h-4" readOnly />
                                    <span className="text-sm">Bay Mechanic</span>
                                </div>
                            </div>
                        </div>
                        <a 
                            href={generateWhatsAppGroupLink('WF-2024-0001', 'Honda Civic Repair')}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => completeStep(3)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 w-fit"
                        >
                            <MessageSquare className="w-4 h-4" /> Create WhatsApp Group
                        </a>
                    </div>
                );

            case 4: // Vehicle Photos (Body + Chassis)
                return (
                    <div className="space-y-4">
                        {/* Car Body Photos Section */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>Upload 4 car body photos from different angles:</strong></p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Front View</p>
                                <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                    Upload
                                </button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Back View</p>
                                <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                    Upload
                                </button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Left Side</p>
                                <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                    Upload
                                </button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Right Side</p>
                                <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                    Upload
                                </button>
                            </div>
                        </div>

                        {/* Chassis Number Photo Section - Separate */}
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-6">
                            <p className="text-sm text-green-800"><strong>Upload chassis number plate photo (separate):</strong></p>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 cursor-pointer">
                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-700 mb-2">Click to upload chassis number photo</p>
                            <p className="text-sm text-gray-500 mb-4">Ensure the chassis number is clearly visible</p>
                            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                                Choose Chassis Photo
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chassis Number *
                            </label>
                            <input 
                                type="text" 
                                placeholder="e.g., MH1234567890" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button 
                                onClick={() => completeStep(4)}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Complete Upload
                            </button>
                        </div>
                    </div>
                );

            case 5: // Update Customer Details
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Fill in complete customer and vehicle information</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                                <input type="text" placeholder="Ahmad bin Abdullah" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                                <input type="tel" placeholder="+60 12-345 6789" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Car Model *</label>
                                <input type="text" placeholder="Honda Civic 2020" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km) *</label>
                                <input type="number" placeholder="45230" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chassis Number *</label>
                                <input type="text" placeholder="MH1234567890" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Car Plate Number *</label>
                                <input type="text" placeholder="WXY 1234" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <button 
                            onClick={() => completeStep(5)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Save Customer Details
                        </button>
                    </div>
                );

            case 6: // Troubleshooting
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Diagnose vehicle issues and document findings</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Category *</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option>-- Select Category --</option>
                                <option>Engine</option>
                                <option>Transmission</option>
                                <option>Brakes</option>
                                <option>Electrical</option>
                                <option>AC System</option>
                                <option>Suspension</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description *</label>
                            <textarea rows={4} placeholder="Describe the issue in detail..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis Result *</label>
                            <textarea rows={3} placeholder="What was found during troubleshooting..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recommended Action *</label>
                            <textarea rows={2} placeholder="What needs to be done..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button 
                            onClick={() => completeStep(6)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Wrench className="w-4 h-4" /> Save Troubleshooting Report
                        </button>
                    </div>
                );

            case 7: // Spare Parts Needed
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Select category &amp; parts, then generate a professional supplier enquiry message to share via WhatsApp.</p>
                        </div>

                        {/* ── Category + Parts selector ── */}
                        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Parts Category</label>
                                <select
                                    value={partsCategory}
                                    onChange={e => { setPartsCategory(e.target.value); setPartsConfirmed(false); setSupplierMessage(''); }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">-- Select Category --</option>
                                    {Object.keys(PARTS_CATALOG).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {partsCategory && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Parts</label>
                                    <div className="space-y-2">
                                        {PARTS_CATALOG[partsCategory].map(part => {
                                            const isChecked = !!selectedParts[part.id];
                                            return (
                                                <div
                                                    key={part.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                                        isChecked ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => togglePart(part)}
                                                            className="w-4 h-4 accent-indigo-600"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{part.name}</p>
                                                            <p className="text-xs text-gray-500">Part ID: {part.id} &nbsp;·&nbsp; RM {part.price.toFixed(2)} / unit</p>
                                                        </div>
                                                    </div>
                                                    {isChecked && (
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <label className="text-xs text-gray-500">Qty</label>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={selectedParts[part.id].qty}
                                                                onChange={e => updateQty(part.id, parseInt(e.target.value) || 1)}
                                                                className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Selected parts summary ── */}
                        {Object.keys(selectedParts).length > 0 && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-700">Selected Parts</span>
                                    <span className="ml-auto text-xs text-gray-500">{Object.keys(selectedParts).length} item{Object.keys(selectedParts).length > 1 ? 's' : ''}</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {Object.values(selectedParts).map(p => (
                                        <div key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-800">{p.name}</span>
                                                <span className="ml-2 text-xs text-gray-400">{p.id}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-right">
                                                <span className="text-xs text-gray-500">× {p.qty}</span>
                                                <span className="font-medium text-gray-700 w-24">RM {(p.price * p.qty).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">Total Estimate</span>
                                    <span className="font-bold text-indigo-700">RM {Object.values(selectedParts).reduce((s, p) => s + p.price * p.qty, 0).toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* ── Generate button ── */}
                        <div className="flex gap-3">
                            <button
                                onClick={generateSupplierMessage}
                                disabled={Object.keys(selectedParts).length === 0}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" /> Generate Supplier Message
                            </button>
                        </div>

                        {/* ── Generated message panel ── */}
                        {supplierMessage && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-semibold text-gray-700">Supplier Enquiry Message</span>
                                        <span className="text-xs text-gray-400">· Editable before sending</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={copyToClipboard}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                messageCopied
                                                    ? 'bg-green-50 border-green-400 text-green-700'
                                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {messageCopied
                                                ? <><CheckCheck className="w-3.5 h-3.5" /> Copied</>
                                                : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                        </button>
                                        <button
                                            onClick={shareViaWhatsApp}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                                        >
                                            <Share2 className="w-3.5 h-3.5" /> Send via WhatsApp
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    value={supplierMessage}
                                    onChange={e => setSupplierMessage(e.target.value)}
                                    rows={20}
                                    className="w-full p-4 font-mono text-sm text-gray-700 bg-white border-0 focus:outline-none focus:ring-0 resize-y leading-relaxed"
                                    spellCheck={false}
                                />
                            </div>
                        )}

                        {/* ── Complete step ── */}
                        {partsConfirmed && (
                            <button
                                onClick={() => completeStep(7)}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Confirm Parts Selection
                            </button>
                        )}
                    </div>
                );

            case 8: // Spare Part Price/Availability
                return (
                    <div className="space-y-4">
                        {/* ── Info ── */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>User Action:</strong> Parts enquiry was sent to supplier via WhatsApp in Step 7.
                                Update the supplier's quoted price and availability for each part below.
                            </p>
                        </div>

                        {/* ── No parts guard ── */}
                        {step8Parts.length === 0 ? (
                            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6 text-center">
                                <Package className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-yellow-800">No parts selected yet.</p>
                                <p className="text-xs text-yellow-600 mt-1">Go back to Step 7 and select the required spare parts first.</p>
                            </div>
                        ) : (
                            <>
                                {/* ── Parts from Step 7 ── */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-semibold text-gray-700">Supplier Price Update</span>
                                        <span className="ml-auto text-xs text-gray-400">{step8Parts.length} part{step8Parts.length > 1 ? 's' : ''} from Step 7</span>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {step8Parts.map(p => {
                                            const q = getQuote(p.id);
                                            const suppliedPrice = parseFloat(q.price);
                                            const subtotal = isNaN(suppliedPrice) ? null : suppliedPrice * p.qty;
                                            const availabilityColors: Record<string, string> = {
                                                'In Stock':      'bg-green-100 text-green-800 border-green-200',
                                                'To Order':      'bg-yellow-100 text-yellow-800 border-yellow-200',
                                                'Not Available': 'bg-red-100 text-red-800 border-red-200',
                                            };
                                            return (
                                                <div key={p.id} className="p-4">
                                                    {/* Part header */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{p.name}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                Part ID: {p.id}&nbsp;&nbsp;·&nbsp;&nbsp;Qty ordered: {p.qty} unit{p.qty > 1 ? 's' : ''}&nbsp;&nbsp;·&nbsp;&nbsp;Est. unit price: RM {p.price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${availabilityColors[q.availability] ?? availabilityColors['In Stock']}`}>
                                                            {q.availability}
                                                        </span>
                                                    </div>

                                                    {/* Input row */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Supplier Quoted Price (RM / unit) *</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RM</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    placeholder="0.00"
                                                                    value={q.price}
                                                                    onChange={e => updateQuote(p.id, 'price', e.target.value)}
                                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Availability Status</label>
                                                            <select
                                                                value={q.availability}
                                                                onChange={e => updateQuote(p.id, 'availability', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                            >
                                                                <option>In Stock</option>
                                                                <option>To Order</option>
                                                                <option>Not Available</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Subtotal line */}
                                                    {subtotal !== null && (
                                                        <div className="mt-2.5 flex justify-end">
                                                            <span className="text-xs text-gray-500">
                                                                {p.qty} × RM {suppliedPrice.toFixed(2)} =&nbsp;
                                                                <span className="font-semibold text-gray-700">RM {subtotal.toFixed(2)}</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ── Running total ── */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                                        <span className="text-sm font-semibold text-gray-700">Cost Summary</span>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {step8Parts.map(p => {
                                            const price = parseFloat(getQuote(p.id).price);
                                            const sub = isNaN(price) ? null : price * p.qty;
                                            return (
                                                <div key={p.id} className="flex items-center justify-between px-4 py-2 text-sm">
                                                    <span className="text-gray-600">{p.name} <span className="text-gray-400">× {p.qty}</span></span>
                                                    <span className={sub === null ? 'text-gray-400 italic text-xs' : 'font-medium text-gray-700'}>
                                                        {sub === null ? 'Price pending' : `RM ${sub.toFixed(2)}`}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Total Supplier Cost</span>
                                        <span className="text-base font-bold text-indigo-700">RM {step8Total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* ── Confirm ── */}
                                <button
                                    onClick={() => completeStep(8)}
                                    disabled={!step8AllFilled}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Confirm Supplier Prices
                                </button>
                            </>
                        )}
                    </div>
                );

            case 9: // Mark Up
                return (
                    <div className="space-y-4">
                        {/* ── Info ── */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>User Action:</strong> Enter your selling price for each part. A minimum profit margin of {MIN_MARGIN}% is required on every item.
                            </p>
                        </div>

                        {/* ── Guard: Step 8 not completed ── */}
                        {!step8AllFilled ? (
                            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6 text-center">
                                <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-yellow-800">Supplier prices not confirmed yet.</p>
                                <p className="text-xs text-yellow-600 mt-1">Complete Step 8 (Supplier Price Update) before setting markup prices.</p>
                            </div>
                        ) : (
                            <>
                                {/* ── Minimum margin notice ── */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center gap-3">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
                                    <p className="text-sm text-yellow-800">
                                        <strong>Minimum margin required: {MIN_MARGIN}%.</strong> Rows below the threshold are highlighted in red.
                                    </p>
                                </div>

                                {/* ── Per-part markup table ── */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-semibold text-gray-700">Markup Pricing</span>
                                        <span className="ml-auto text-xs text-gray-400">{step8Parts.length} part{step8Parts.length > 1 ? 's' : ''} from Step 7</span>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {step8Parts.map(p => {
                                            const supplierUnitPrice = parseFloat(getQuote(p.id).price);
                                            const markupRaw         = markupPrices[p.id] ?? '';
                                            const markupUnitPrice   = parseFloat(markupRaw);
                                            const margin            = isNaN(markupUnitPrice) ? null : calcMargin(supplierUnitPrice, markupUnitPrice);
                                            const belowMin          = margin !== null && margin < MIN_MARGIN;
                                            const atMin             = margin !== null && margin >= MIN_MARGIN;
                                            // suggested minimum selling price
                                            const suggestedPrice    = supplierUnitPrice / (1 - MIN_MARGIN / 100);

                                            return (
                                                <div
                                                    key={p.id}
                                                    className={`p-4 transition-colors ${
                                                        belowMin ? 'bg-red-50' : ''
                                                    }`}
                                                >
                                                    {/* Header row */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                Part ID: {p.id}&nbsp;&nbsp;·&nbsp;&nbsp;Qty: {p.qty} unit{p.qty > 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                        {/* Margin badge */}
                                                        {margin !== null && (
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                                                belowMin
                                                                    ? 'bg-red-100 text-red-700 border-red-200'
                                                                    : 'bg-green-100 text-green-700 border-green-200'
                                                            }`}>
                                                                {margin.toFixed(1)}% margin
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Input grid */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        {/* Supplier price — read-only */}
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">Supplier Price (RM / unit)</label>
                                                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium">
                                                                RM {supplierUnitPrice.toFixed(2)}
                                                            </div>
                                                        </div>

                                                        {/* Markup price input */}
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                Selling Price (RM / unit) *
                                                            </label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RM</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    placeholder={suggestedPrice.toFixed(2)}
                                                                    value={markupRaw}
                                                                    onChange={e => updateMarkup(p.id, e.target.value)}
                                                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${
                                                                        belowMin
                                                                            ? 'border-red-400 bg-red-50'
                                                                            : 'border-gray-300'
                                                                    }`}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Min for {MIN_MARGIN}% margin: <span className="font-medium text-gray-500">RM {suggestedPrice.toFixed(2)}</span>
                                                            </p>
                                                        </div>

                                                        {/* Profit margin display */}
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Profit Margin</label>
                                                            <div className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                                                                margin === null
                                                                    ? 'bg-gray-50 border-gray-200 text-gray-400'
                                                                    : belowMin
                                                                    ? 'bg-red-50 border-red-300 text-red-700'
                                                                    : 'bg-green-50 border-green-300 text-green-700'
                                                            }`}>
                                                                {margin === null ? '—' : `${margin.toFixed(1)}%`}
                                                            </div>
                                                            {belowMin && (
                                                                <p className="text-xs text-red-600 mt-1">Below minimum {MIN_MARGIN}%</p>
                                                            )}
                                                            {atMin && (
                                                                <p className="text-xs text-green-600 mt-1">Meets requirement</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Subtotal row */}
                                                    {!isNaN(markupUnitPrice) && markupUnitPrice > 0 && (
                                                        <div className="mt-2.5 flex justify-between text-xs text-gray-500">
                                                            <span>Cost: {p.qty} × RM {supplierUnitPrice.toFixed(2)} = <span className="font-medium text-gray-600">RM {(supplierUnitPrice * p.qty).toFixed(2)}</span></span>
                                                            <span>Selling: {p.qty} × RM {markupUnitPrice.toFixed(2)} = <span className="font-semibold text-gray-700">RM {(markupUnitPrice * p.qty).toFixed(2)}</span></span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ── Financial Summary ── */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                                        <span className="text-sm font-semibold text-gray-700">Financial Summary</span>
                                    </div>
                                    <div className="px-4 py-3 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Supplier Cost</span>
                                            <span className="font-medium text-gray-700">RM {step9TotalCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Selling Price</span>
                                            <span className="font-medium text-gray-700">RM {step9TotalMarkup.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Profit</span>
                                            <span className={`font-semibold ${ step9TotalMarkup > step9TotalCost ? 'text-green-600' : 'text-gray-400'}`}>
                                                RM {(step9TotalMarkup - step9TotalCost).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                                            <span className="font-semibold text-gray-700">Overall Margin</span>
                                            <span className={`text-base font-bold ${
                                                step9OverallMargin === null
                                                    ? 'text-gray-400'
                                                    : step9OverallMargin < MIN_MARGIN
                                                    ? 'text-red-600'
                                                    : 'text-green-600'
                                            }`}>
                                                {step9OverallMargin === null ? '—' : `${step9OverallMargin.toFixed(1)}%`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Confirm ── */}
                                <button
                                    onClick={() => completeStep(9)}
                                    disabled={!step9AllValid}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <DollarSign className="w-4 h-4" /> Confirm Markup &amp; Generate Quotation
                                </button>
                            </>
                        )}
                    </div>
                );

            case 10: // Spare Part Confirmation
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>User Action:</strong> Generate the customer approval message, share it via WhatsApp, and send the secure approval link for the customer to review and confirm.
                            </p>
                        </div>

                        {/* ── Parts summary (mock) ── */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                                <Package className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-semibold text-gray-700">Parts &amp; Prices for Customer</span>
                                <span className="ml-auto text-xs text-gray-400">{STEP10_MOCK_PARTS.length} items</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {STEP10_MOCK_PARTS.map(p => (
                                    <div key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-800">{p.name}</span>
                                            <span className="ml-2 text-xs text-gray-400">× {p.qty}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200">ORI</span>
                                                <span className="font-semibold text-gray-700">RM {(p.variants[0].price * p.qty).toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 justify-end mt-0.5">
                                                <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full border bg-amber-100 text-amber-800 border-amber-200">OM</span>
                                                <span className="text-xs text-gray-400">RM {(p.variants[1].price * p.qty).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">ORI Estimate</span>
                                <span className="font-bold text-indigo-700">
                                    RM {STEP10_MOCK_PARTS.reduce((s, p) => s + p.variants[0].price * p.qty, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* ── Customer Approval Message (editable) ── */}
                        {!customerMessage ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={generateCustomerMessage}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" /> Generate Customer Message
                                </button>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-semibold text-gray-700">Customer Approval Message</span>
                                        <span className="text-xs text-gray-400">· Editable before sending</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={copyCustomerMessage}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                customerMessageCopied
                                                    ? 'bg-green-50 border-green-400 text-green-700'
                                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {customerMessageCopied
                                                ? <><CheckCheck className="w-3.5 h-3.5" /> Copied</>
                                                : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                        </button>
                                        <button
                                            onClick={shareCustomerMessageViaWhatsApp}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                                        >
                                            <Share2 className="w-3.5 h-3.5" /> Send via WhatsApp
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={customerMessage}
                                    onChange={e => setCustomerMessage(e.target.value)}
                                    rows={16}
                                    className="w-full p-4 font-mono text-sm text-gray-700 bg-white border-0 focus:outline-none focus:ring-0 resize-y leading-relaxed"
                                    spellCheck={false}
                                />
                            </div>
                        )}

                        {/* ── Secure approval link ── */}
                        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Check className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Secure Approval Link</p>
                                    <p className="text-xs text-gray-500">Unique to this workflow · expires in 48 hours.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                <code className="text-xs text-indigo-700 flex-1 truncate">{APPROVAL_LINK}</code>
                                <a
                                    href="/client-approval?token=abc123xyz789secure"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
                                >
                                    Preview
                                </a>
                            </div>
                            <div className="flex gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Token: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{APPROVAL_TOKEN}</code>
                                </span>
                                <span className="flex items-center gap-1 text-yellow-600">
                                    <Clock className="w-3 h-3" /> Pending approval
                                </span>
                            </div>
                        </div>

                        {/* ── Short message panel with collapse toggle ── */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setShortMsgExpanded(v => !v)}
                                className="w-full bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Send className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-700">WhatsApp Message Preview</span>
                                    <span className="text-xs text-gray-400">· Short &amp; simple</span>
                                </div>
                                <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${shortMsgExpanded ? '' : 'rotate-180'}`} />
                            </button>
                            {shortMsgExpanded && (
                                <div className="px-4 py-4 bg-white">
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{`Hi ${mockApprovalData.customerName},

Kindly review and approve your vehicle service parts via the secure link below:

${APPROVAL_LINK}

This link expires in 48 hours.

If you have any questions, please contact us at +60 12-345 6789.`}</pre>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `Hi ${mockApprovalData.customerName},\n\nKindly review and approve your vehicle service parts via the secure link below:\n\n${APPROVAL_LINK}\n\nThis link expires in 48 hours.\n\nIf you have any questions, please contact us at +60 12-345 6789.`
                                                );
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copy
                                        </button>
                                        <button
                                            onClick={() => {
                                                const msg = `Hi ${mockApprovalData.customerName},\n\nKindly review and approve your vehicle service parts via the secure link below:\n\n${APPROVAL_LINK}\n\nThis link expires in 48 hours.\n\nIf you have any questions, please contact us at +60 12-345 6789.`;
                                                window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(msg)}&type=custom_url&app_absent=0`, '_blank');
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                                        >
                                            <Share2 className="w-3.5 h-3.5" /> Send via WhatsApp
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Customer response ── */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-gray-700">Customer Response</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {customerApproval !== null && (
                                        <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                                            {customerApproval.length} of {STEP10_MOCK_PARTS.length} parts approved
                                        </span>
                                    )}
                                    <button
                                        onClick={refreshCustomerResponse}
                                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft className="w-3 h-3 rotate-[135deg]" /> Refresh
                                    </button>
                                </div>
                            </div>

                            {customerApproval === null ? (
                                <div className="px-4 py-8 text-center space-y-2">
                                    <Clock className="w-8 h-8 text-amber-400 mx-auto" />
                                    <p className="text-sm font-medium text-gray-600">Awaiting customer response</p>
                                    <p className="text-xs text-gray-400">Once the customer approves via the secure link, click <strong>Refresh</strong> above or open the link in another tab and approve.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="divide-y divide-gray-100">
                                        {STEP10_MOCK_PARTS.map(p => {
                                            const choice = customerApproval.find(c => c.id === p.id);
                                            const approved = !!choice;
                                            const partType = choice?.type;
                                            const price = partType ? getApprovalPrice(p, partType) : p.variants[0].price;
                                            return (
                                                <div key={p.id} className={`flex items-center justify-between px-4 py-2.5 text-sm ${approved ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                                            approved ? 'bg-green-100' : 'bg-red-100'
                                                        }`}>
                                                            {approved
                                                                ? <Check className="w-3 h-3 text-green-600" />
                                                                : <X className="w-3 h-3 text-red-400" />}
                                                        </span>
                                                        <div>
                                                            <span className={approved ? 'text-gray-800 font-medium' : 'text-gray-400 line-through'}>{p.name}</span>
                                                            {approved && partType && (
                                                                <span className={`ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full border ${
                                                                    partType === 'ORI'
                                                                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                                                        : 'bg-amber-100 text-amber-800 border-amber-200'
                                                                }`}>{partType}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                                                            approved
                                                                ? 'bg-green-100 text-green-800 border-green-200'
                                                                : 'bg-red-100 text-red-600 border-red-200'
                                                        }`}>
                                                            {approved ? 'Approved' : 'Not approved'}
                                                        </span>
                                                        <span className={`font-semibold w-20 text-right ${approved ? 'text-gray-700' : 'text-gray-300'}`}>
                                                            RM {(price * p.qty).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Approved Total</span>
                                        <span className="font-bold text-indigo-700">
                                            RM {STEP10_MOCK_PARTS
                                                .filter(p => customerApproval.some(c => c.id === p.id))
                                                .reduce((s, p) => {
                                                    const t = customerApproval.find(c => c.id === p.id)!.type;
                                                    return s + getApprovalPrice(p, t) * p.qty;
                                                }, 0)
                                                .toFixed(2)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── Complete step ── */}
                        <button
                            onClick={() => { initQuoteParts(); completeStep(10); }}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" /> Mark as Sent &amp; Complete
                        </button>
                    </div>
                );

            case 11: // Quotation
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>User Action:</strong> Review customer-approved parts, add any additional parts if needed, then generate and send the final quotation.
                            </p>
                        </div>

                        {/* ── Customer approval summary ── */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-gray-700">Customer Approval Summary</span>
                                <span className="ml-auto text-xs font-medium bg-green-100 text-green-800 border border-green-200 px-2.5 py-0.5 rounded-full">
                                    {(customerApproval ?? []).length} of {STEP10_MOCK_PARTS.length} parts approved
                                </span>
                            </div>
                            <div className="px-4 py-3 text-sm text-gray-600 space-y-1">
                                <p>Parts approved by the customer from Step 10 have been pre-filled below with the customer's chosen type (ORI/OM) and corresponding price.</p>
                                {customerApproval && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {customerApproval.map(c => {
                                            const p = STEP10_MOCK_PARTS.find(x => x.id === c.id);
                                            if (!p) return null;
                                            return (
                                                <span key={c.id} className="flex items-center gap-1 text-xs bg-gray-100 border border-gray-200 rounded-full px-2.5 py-0.5">
                                                    {p.name}
                                                    <span className={`px-1 py-0.5 text-xs font-semibold rounded-full border ${
                                                        c.type === 'ORI' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                                                    }`}>{c.type}</span>
                                                    <span className="text-gray-500">RM {getApprovalPrice(p, c.type).toFixed(2)}</span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Editable parts table ── */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-700">Parts in Quotation</span>
                                </div>
                                <button
                                    onClick={() => setShowQuoteAdd(!showQuoteAdd)}
                                    className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Part
                                </button>
                            </div>

                            {/* Add part inline form */}
                            {showQuoteAdd && (
                                <div className="bg-gray-50 border-b border-gray-200 px-4 py-4 space-y-3">
                                    <p className="text-xs font-semibold text-gray-700">Add New Part</p>

                                    {/* Row 1: Category + Part */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                                            <select
                                                value={quoteAddCategory}
                                                onChange={e => {
                                                    setQuoteAddCategory(e.target.value);
                                                    setQuoteAddName('');
                                                    setQuoteAddPrice('');
                                                }}
                                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">— Select category —</option>
                                                {Object.keys(QUOTE_PARTS_CATALOG).map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Part *</label>
                                            <select
                                                value={quoteAddName}
                                                disabled={!quoteAddCategory}
                                                onChange={e => {
                                                    const entry = QUOTE_PARTS_CATALOG[quoteAddCategory]?.find(p => p.name === e.target.value);
                                                    setQuoteAddName(e.target.value);
                                                    setQuoteAddPrice(entry ? String(entry.price) : '');
                                                }}
                                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                <option value="">— Select part —</option>
                                                {(QUOTE_PARTS_CATALOG[quoteAddCategory] ?? []).map(p => (
                                                    <option key={p.name} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row 2: Qty + Unit Price */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                                            <input
                                                type="number"
                                                placeholder="1"
                                                value={quoteAddQty}
                                                onChange={e => setQuoteAddQty(e.target.value)}
                                                min="1"
                                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price (RM)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RM</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={quoteAddPrice}
                                                    onChange={e => setQuoteAddPrice(e.target.value)}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => { setShowQuoteAdd(false); setQuoteAddCategory(''); setQuoteAddName(''); setQuoteAddQty('1'); setQuoteAddPrice(''); }}
                                            className="text-sm text-gray-600 hover:text-gray-800 px-4 py-1.5 rounded-lg border border-gray-300 hover:bg-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={addQuotePart}
                                            disabled={!quoteAddName || !quoteAddPrice}
                                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Add to Quote
                                        </button>
                                    </div>
                                </div>
                            )}

                            {quoteParts.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-gray-400">
                                    No parts added yet. Use the &ldquo;Add Part&rdquo; button above.
                                </div>
                            ) : (
                                <>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50">
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Part</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Unit</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                                                <th className="px-3 py-2 w-8"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {quoteParts.map(p => (
                                                <tr key={p.id} className="bg-white hover:bg-gray-50">
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-800">{p.name}</span>
                                                            {p.partType && (
                                                                <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full border ${
                                                                    p.partType === 'ORI'
                                                                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                                                        : 'bg-amber-100 text-amber-800 border-amber-200'
                                                                }`}>{p.partType}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600">{p.qty}</td>
                                                    <td className="px-3 py-2.5 text-right text-gray-500">RM {p.price.toFixed(2)}</td>
                                                    <td className="px-4 py-2.5 text-right font-semibold text-gray-800">RM {(p.price * p.qty).toFixed(2)}</td>
                                                    <td className="px-3 py-2.5">
                                                        <button
                                                            onClick={() => removeQuotePart(p.id)}
                                                            className="w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Total Quotation Amount</span>
                                        <span className="font-bold text-indigo-700">RM {quoteTotal.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── Quotation details ── */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-semibold text-gray-700">Quotation Details</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <span className="text-gray-500">Customer</span>
                                    <span className="font-medium text-gray-800">{mockApprovalData.customerName}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <span className="text-gray-500">Vehicle</span>
                                    <span className="font-medium text-gray-800">Honda Civic 2020 ({PLATE_NUMBER})</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <span className="text-gray-500">Workflow Ref</span>
                                    <span className="font-medium text-gray-800">{WORKFLOW_CODE}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-medium text-gray-800">{new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2.5 text-sm bg-indigo-50">
                                    <span className="font-semibold text-indigo-700">Total Quotation Amount</span>
                                    <span className="font-bold text-indigo-700">RM {quoteTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Actions ── */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setQuotePdfGenerated(true)}
                                disabled={quoteParts.length === 0}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    quoteParts.length > 0
                                        ? quotePdfGenerated
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                {quotePdfGenerated ? 'PDF Ready ✓' : 'Generate PDF'}
                            </button>

                            <button
                                onClick={shareQuoteViaWhatsApp}
                                disabled={quoteParts.length === 0}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Share2 className="w-4 h-4" /> Send via WhatsApp
                            </button>

                            <button
                                onClick={() => completeStep(11)}
                                disabled={quoteParts.length === 0}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Finalise Quotation
                            </button>
                        </div>
                    </div>
                );

            case 12: { // Spare Part Order — Multi-Supplier Pricing Tool
                const SPO12_PARTS = [
                    { id: 'crank-sensor',  name: 'Crank Sensor',     types: ['ORI', 'OEM', 'USED', 'LABOUR'] as const },
                    { id: 'ignition-coil', name: 'Ignition Coil',    types: ['ORI', 'OEM', 'USED', 'LABOUR'] as const },
                    { id: 'agm-battery',   name: 'AGM Battery 92AH', types: ['ORI', 'OEM', 'USED', 'LABOUR'] as const },
                ];
                const calcMU = (cost: number, pct: number) => Math.round(cost * (1 + pct / 100));
                const getCost = (partId: string, type: string, suppId: string): number => {
                    const v = spo12Costs[`${partId}_${type}_${suppId}`];
                    return v ? (parseFloat(v) || 0) : 0;
                };
                const TYPE_COLOR: Record<string, string> = {
                    ORI: 'text-emerald-600', OEM: 'text-amber-600', USED: 'text-orange-500', LABOUR: 'text-purple-600',
                };
                const selectedSuppliers = spo12Suppliers.filter(s => spo12SelectedIds.includes(s.id));
                const addNewSupplier = () => {
                    if (!spo12AddName.trim()) return;
                    const id = spo12AddName.trim().toLowerCase().replace(/\s+/g, '-');
                    const palette = ['#f59e0b', '#06b6d4', '#84cc16', '#f43f5e', '#8b5cf6'];
                    const color = palette[spo12Suppliers.length % palette.length];
                    setSpo12Suppliers(prev => [...prev, { id, name: spo12AddName.trim(), color }]);
                    setSpo12SelectedIds(prev => [...prev, id]);
                    setSpo12AddName('');
                    setSpo12ShowAdd(false);
                };

                return (
                    <div className="space-y-5">

                        {/* ① SELECT SUPPLIERS FOR THIS JOB */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
                                <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Select Suppliers for This Job</span>
                                <span className="text-xs text-gray-400 ml-1">Tick suppliers to show their pricing columns</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {spo12Suppliers.map(sup => {
                                    const isSel = spo12SelectedIds.includes(sup.id);
                                    return (
                                        <button
                                            key={sup.id}
                                            onClick={() => setSpo12SelectedIds(prev =>
                                                prev.includes(sup.id) ? prev.filter(x => x !== sup.id) : [...prev, sup.id]
                                            )}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                                                isSel ? 'bg-white shadow-sm text-gray-800' : 'bg-white text-gray-400 border-gray-200'
                                            }`}
                                            style={isSel ? { borderColor: sup.color } : {}}
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: isSel ? sup.color : '#d1d5db' }} />
                                            {sup.name}
                                        </button>
                                    );
                                })}

                                {spo12ShowAdd ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={spo12AddName}
                                            onChange={e => setSpo12AddName(e.target.value)}
                                            placeholder="Supplier name"
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') addNewSupplier();
                                                if (e.key === 'Escape') { setSpo12ShowAdd(false); setSpo12AddName(''); }
                                            }}
                                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        />
                                        <button onClick={addNewSupplier} className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">Add</button>
                                        <button onClick={() => { setSpo12ShowAdd(false); setSpo12AddName(''); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setSpo12ShowAdd(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add New Supplier
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                <span className="text-base">💡</span>
                                <p className="text-xs text-blue-800">
                                    <span className="font-semibold">{selectedSuppliers.length} supplier(s) selected.</span> Unticked suppliers are hidden from the table.
                                </p>
                            </div>
                        </div>

                        {/* ② MARKUP % (PARTS ONLY — LABOUR EXCLUDED) */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
                                <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Markup % (Parts Only — Labour Excluded)</span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-gray-500">Active Markup:</span>
                                {([40, 55, 70] as const).map(pct => (
                                    <button
                                        key={pct}
                                        onClick={() => setSpo12Markup(pct)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                                            spo12Markup === pct
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                                <span className="text-xs text-gray-400 ml-1">All 3 columns always visible. <span className="text-blue-600 font-medium">Bold blue</span> = active markup.</span>
                            </div>
                        </div>

                        {/* TABS + TABLE */}
                        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                            {/* Tab bar */}
                            <div className="flex border-b border-gray-200 px-4 pt-3 gap-1 bg-gray-50">
                                {([
                                    { id: 'parts'    as const, label: '⊞  Parts Table' },
                                    { id: 'summary'  as const, label: '📊  Summary' },
                                    { id: 'whatsapp' as const, label: '💬  WhatsApp Orders' },
                                ]).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSpo12Tab(tab.id)}
                                        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors -mb-px ${
                                            spo12Tab === tab.id
                                                ? 'border-indigo-600 text-indigo-600 bg-white'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="p-4">
                                {/* ── PARTS TABLE TAB ── */}
                                {spo12Tab === 'parts' && (
                                    <div>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                                            <table
                                                className="text-xs border-collapse"
                                                style={{ minWidth: `${200 + selectedSuppliers.length * 230 + 180 + 90}px` }}
                                            >
                                                <thead>
                                                    {/* Row 1 — Supplier group headers */}
                                                    <tr>
                                                        <th
                                                            className="bg-gray-900 text-white px-3 py-3 text-left font-semibold border-r border-gray-700"
                                                            style={{ minWidth: 140, position: 'sticky', left: 0, zIndex: 20 }}
                                                        >PART</th>
                                                        <th className="bg-gray-900 text-white px-3 py-3 text-left font-semibold border-r border-gray-700" style={{ minWidth: 64 }}>TYPE</th>
                                                        {selectedSuppliers.map(sup => (
                                                            <th
                                                                key={sup.id}
                                                                colSpan={4}
                                                                className="text-white text-center py-2.5 px-2 font-semibold border-r border-white/20 tracking-wide"
                                                                style={{ background: sup.color }}
                                                            >
                                                                {sup.name}
                                                            </th>
                                                        ))}
                                                        <th
                                                            className="text-white text-center py-2.5 px-2 font-semibold border-r border-white/20 uppercase tracking-wide leading-tight"
                                                            style={{ background: '#b45309', minWidth: 160 }}
                                                        >
                                                            Customer<br />Charge
                                                        </th>
                                                        <th className="bg-gray-900 text-white px-3 py-3 text-center font-semibold" style={{ minWidth: 80 }}>ORDERED</th>
                                                    </tr>
                                                    {/* Row 2 — Sub-column labels */}
                                                    <tr>
                                                        <th className="bg-gray-800 border-r border-gray-600 px-3 py-2" style={{ position: 'sticky', left: 0, zIndex: 20 }}></th>
                                                        <th className="bg-gray-800 border-r border-gray-600 px-3 py-2"></th>
                                                        {selectedSuppliers.map(sup => (
                                                            <Fragment key={sup.id}>
                                                                <th className="bg-gray-50 border border-gray-200 px-2 py-2 text-gray-600 font-semibold text-center whitespace-nowrap" style={{ minWidth: 68 }}>Cost (RM)</th>
                                                                {([40, 55, 70] as const).map(pct => (
                                                                    <th
                                                                        key={pct}
                                                                        className={`border border-gray-200 px-2 py-2 text-center font-semibold bg-gray-50 ${spo12Markup === pct ? 'text-blue-600' : 'text-gray-500'}`}
                                                                        style={{ minWidth: 46 }}
                                                                    >
                                                                        {pct}%
                                                                    </th>
                                                                ))}
                                                            </Fragment>
                                                        ))}
                                                        <th className="bg-amber-50 border border-amber-100 px-2 py-2"></th>
                                                        <th className="bg-gray-50 border border-gray-200 px-2 py-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {SPO12_PARTS.map(part => {
                                                        const TYPES = ['ORI', 'OEM', 'USED', 'LABOUR'] as const;
                                                        return TYPES.map((type, typeIdx) => {
                                                            const isFirst   = typeIdx === 0;
                                                            const isLabour  = type === 'LABOUR';
                                                            const rowKey    = `${part.id}_${type}`;
                                                            const validCosts = selectedSuppliers.map(s => getCost(part.id, type, s.id)).filter(c => c > 0);
                                                            const minCost   = validCosts.length ? Math.min(...validCosts) : null;

                                                            return (
                                                                <tr key={rowKey} className={isFirst ? 'border-t-2 border-t-gray-300' : 'border-t border-t-gray-100'}>

                                                                    {/* Part name — rowSpan 4 */}
                                                                    {isFirst && (
                                                                        <td
                                                                            rowSpan={4}
                                                                            className="px-3 py-2 font-semibold text-gray-800 bg-white border-r border-gray-200 align-top pt-3"
                                                                            style={{ position: 'sticky', left: 0, zIndex: 10 }}
                                                                        >
                                                                            {part.name}
                                                                        </td>
                                                                    )}

                                                                    {/* Type label */}
                                                                    <td className={`px-3 py-2 font-semibold bg-white border-r border-gray-100 ${TYPE_COLOR[type]}`}>
                                                                        {type}
                                                                    </td>

                                                                    {/* Per-supplier columns */}
                                                                    {selectedSuppliers.map(sup => {
                                                                        const costKey = `${part.id}_${type}_${sup.id}`;
                                                                        const costVal = spo12Costs[costKey] || '';
                                                                        const costNum = parseFloat(costVal) || 0;
                                                                        const isCheapest = costNum > 0 && costNum === minCost;

                                                                        return (
                                                                            <Fragment key={sup.id}>
                                                                                {/* Cost input */}
                                                                                <td className="px-1 py-1 bg-white border-l border-gray-100">
                                                                                    <div className="relative inline-block">
                                                                                        {isCheapest && (
                                                                                            <span className="absolute -top-1 right-0 text-amber-400 text-xs leading-none pointer-events-none">★</span>
                                                                                        )}
                                                                                        <input
                                                                                            type="number"
                                                                                            value={costVal}
                                                                                            onChange={e => setSpo12Costs(prev => ({ ...prev, [costKey]: e.target.value }))}
                                                                                            placeholder="—"
                                                                                            className={`w-16 px-1.5 py-1 text-xs text-center rounded border focus:ring-1 focus:ring-indigo-400 focus:outline-none ${
                                                                                                costVal ? 'bg-amber-50 border-amber-200 font-medium' : 'bg-gray-50 border-gray-200 text-gray-300'
                                                                                            }`}
                                                                                        />
                                                                                    </div>
                                                                                </td>

                                                                                {/* 40% / 55% / 70% markup columns */}
                                                                                {isLabour ? (
                                                                                    <td colSpan={3} className="px-2 py-1 text-center text-gray-400 italic bg-gray-50 text-xs border-l border-gray-100">
                                                                                        No markup
                                                                                    </td>
                                                                                ) : (
                                                                                    ([40, 55, 70] as const).map(pct => (
                                                                                        <td
                                                                                            key={pct}
                                                                                            className={`px-2 py-1 text-center text-xs border-l border-gray-100 ${
                                                                                                !costNum ? 'text-gray-300' : spo12Markup === pct ? 'text-blue-600 font-bold' : 'text-gray-600'
                                                                                            }`}
                                                                                        >
                                                                                            {costNum > 0 ? calcMU(costNum, pct) : '—'}
                                                                                        </td>
                                                                                    ))
                                                                                )}
                                                                            </Fragment>
                                                                        );
                                                                    })}

                                                                    {/* Customer Charge dropdown */}
                                                                    <td className="px-2 py-1 bg-amber-50 border-l border-amber-200">
                                                                        <select
                                                                            value={spo12Charge[rowKey] || ''}
                                                                            onChange={e => setSpo12Charge(prev => ({ ...prev, [rowKey]: e.target.value }))}
                                                                            className="w-full text-xs border border-gray-200 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                                            style={{ minWidth: 130 }}
                                                                        >
                                                                            <option value="">— Select —</option>
                                                                            {selectedSuppliers.map(sup => {
                                                                                const c = getCost(part.id, type, sup.id);
                                                                                if (!c) return null;
                                                                                const price = isLabour ? c : calcMU(c, spo12Markup);
                                                                                return (
                                                                                    <option key={sup.id} value={sup.id}>
                                                                                        {sup.name} · RM{price}
                                                                                    </option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                    </td>

                                                                    {/* Ordered checkbox — rowSpan 4, first row only */}
                                                                    {isFirst && (
                                                                        <td rowSpan={4} className="px-2 py-1 text-center bg-white border-l border-gray-200 align-middle">
                                                                            {spo12Ordered[part.id] ? (
                                                                                <div className="flex flex-col items-center gap-1">
                                                                                    <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                                                                                        <Check className="w-4 h-4 text-white" />
                                                                                    </div>
                                                                                    <span className="text-xs text-green-600 font-medium">Done ✓</span>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex flex-col items-center gap-1">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={false}
                                                                                        onChange={e => setSpo12Ordered(prev => ({ ...prev, [part.id]: e.target.checked }))}
                                                                                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                                                                                    />
                                                                                    <span className="text-[10px] text-gray-400 leading-tight text-center">Auto on<br />Step 14</span>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            );
                                                        });
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Add Part from Database */}
                                        <div className="mt-3">
                                            <button className="flex items-center gap-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg px-3 py-2 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                                                <Plus className="w-3.5 h-3.5" /> Add Part from Database
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ── SUMMARY TAB ── */}
                                {spo12Tab === 'summary' && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-500">
                                            Summary of selected customer charges at <span className="font-semibold text-indigo-600">{spo12Markup}%</span> active markup
                                        </p>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Part</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Supplier</th>
                                                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Cost (RM)</th>
                                                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Charge (RM)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {SPO12_PARTS.flatMap(part =>
                                                        (['ORI', 'OEM', 'USED', 'LABOUR'] as const).map(type => {
                                                            const rk = `${part.id}_${type}`;
                                                            const cId = spo12Charge[rk];
                                                            if (!cId) return null;
                                                            const cost = getCost(part.id, type, cId);
                                                            if (!cost) return null;
                                                            const supName = spo12Suppliers.find(s => s.id === cId)?.name || '';
                                                            const charge  = type === 'LABOUR' ? cost : calcMU(cost, spo12Markup);
                                                            return (
                                                                <tr key={rk} className="hover:bg-gray-50">
                                                                    <td className="px-3 py-2 font-medium text-gray-800">{part.name}</td>
                                                                    <td className={`px-3 py-2 font-semibold ${TYPE_COLOR[type]}`}>{type}</td>
                                                                    <td className="px-3 py-2 text-gray-600">{supName}</td>
                                                                    <td className="px-3 py-2 text-right text-gray-600">{cost}</td>
                                                                    <td className="px-3 py-2 text-right font-semibold text-gray-800">{charge}</td>
                                                                </tr>
                                                            );
                                                        }).filter(Boolean)
                                                    )}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                                                        <td colSpan={4} className="px-3 py-2 font-semibold text-indigo-800">Total Customer Charge</td>
                                                        <td className="px-3 py-2 text-right font-bold text-indigo-800">
                                                            RM {SPO12_PARTS.flatMap(part =>
                                                                (['ORI', 'OEM', 'USED', 'LABOUR'] as const).map(type => {
                                                                    const cId = spo12Charge[`${part.id}_${type}`];
                                                                    if (!cId) return 0;
                                                                    const c = getCost(part.id, type, cId);
                                                                    return type === 'LABOUR' ? c : calcMU(c, spo12Markup);
                                                                })
                                                            ).reduce((a, b) => a + b, 0)}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* ── WHATSAPP ORDERS TAB ── */}
                                {spo12Tab === 'whatsapp' && (
                                    <div className="space-y-4">
                                        <p className="text-xs text-gray-500">Per-supplier WhatsApp order messages based on your Customer Charge selections</p>
                                        {selectedSuppliers.map(sup => {
                                            const supParts = SPO12_PARTS.flatMap(part =>
                                                (['ORI', 'OEM', 'USED', 'LABOUR'] as const)
                                                    .filter(type => spo12Charge[`${part.id}_${type}`] === sup.id && getCost(part.id, type, sup.id) > 0)
                                                    .map(type => ({ partName: part.name, type, cost: getCost(part.id, type, sup.id) }))
                                            );
                                            if (supParts.length === 0) return (
                                                <div key={sup.id} className="border border-gray-100 rounded-lg px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: sup.color }} />
                                                    <span className="font-medium" style={{ color: sup.color }}>{sup.name}</span>
                                                    <span>— No parts selected from this supplier</span>
                                                </div>
                                            );
                                            const msg = `Dear ${sup.name},\n\nOrder for Workflow: ${WORKFLOW_CODE}\nVehicle: ${PLATE_NUMBER} (Chassis: ${CHASSIS_NUMBER})\n\nParts Required:\n${supParts.map((p, i) => `${i + 1}. ${p.partName} (${p.type}) — Cost: RM${p.cost}`).join('\n')}\n\nKindly confirm availability and ETA.\n\nThank you,\nAutoflow Service Centre`;
                                            return (
                                                <div key={sup.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100" style={{ background: `${sup.color}18` }}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: sup.color }} />
                                                            <span className="text-sm font-semibold" style={{ color: sup.color }}>{sup.name}</span>
                                                            <span className="text-xs text-gray-400">· {supParts.length} item(s)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(msg)}
                                                                className="flex items-center gap-1 text-xs border border-gray-300 bg-white rounded-lg px-2.5 py-1 hover:bg-gray-50"
                                                            >
                                                                <Copy className="w-3 h-3" /> Copy
                                                            </button>
                                                            <button
                                                                onClick={() => window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(msg)}&type=custom_url&app_absent=0`, '_blank')}
                                                                className="flex items-center gap-1 text-xs bg-green-600 text-white rounded-lg px-2.5 py-1 hover:bg-green-700"
                                                            >
                                                                <Share2 className="w-3 h-3" /> WhatsApp
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <pre className="px-4 py-3 text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white leading-relaxed">{msg}</pre>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom action bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-400 italic">Auto-saves on every input change · Prices recalculate live</p>
                            <div className="flex gap-3">
                                <button className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                    Save Draft
                                </button>
                                <button
                                    onClick={() => completeStep(12)}
                                    className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2"
                                >
                                    Mark Step Complete →
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            case 13: // Spare Parts in Workshop
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>User Action:</strong> Confirm receipt of each spare part ordered from the supplier in Step 12.
                            </p>
                        </div>

                        {/* ── Order reference ── */}
                        {quoteParts.length === 0 ? (
                            <div className="border border-amber-200 bg-amber-50 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                No parts order found. Please complete Steps 11 and 12 first.
                            </div>
                        ) : (
                            <>
                                {/* Order summary header */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-semibold text-gray-700">Parts Receipt Confirmation</span>
                                        <span className="ml-auto text-xs text-gray-400">
                                            {orderSupplier || 'Supplier not set'} &nbsp;·&nbsp; {quoteParts.length} parts ordered
                                        </span>
                                    </div>

                                    {/* Mark all good shortcut */}
                                    <div className="px-4 py-2.5 border-b border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => {
                                                const updated: Record<string, ReceivedPart> = {};
                                                quoteParts.forEach(p => {
                                                    updated[p.id] = { qtyOrdered: p.qty, qtyReceived: String(p.qty), condition: 'Good' };
                                                });
                                                setReceivedParts(updated);
                                            }}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors"
                                        >
                                            Mark All as Good
                                        </button>
                                    </div>

                                    {/* Per-part rows */}
                                    <div className="divide-y divide-gray-100">
                                        {quoteParts.map(p => {
                                            const rec = receivedParts[p.id] ?? { qtyOrdered: p.qty, qtyReceived: String(p.qty), condition: 'Good' };
                                            const conditionColor = rec.condition === 'Good'
                                                ? 'text-green-700 bg-green-50 border-green-200'
                                                : rec.condition === 'Damaged'
                                                    ? 'text-red-700 bg-red-50 border-red-200'
                                                    : 'text-amber-700 bg-amber-50 border-amber-200';
                                            return (
                                                <div key={p.id} className="px-4 py-3">
                                                    <div className="flex items-center justify-between mb-2.5">
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                                            <span className="ml-2 text-xs text-gray-400">Ordered: {p.qty} unit{p.qty !== 1 ? 's' : ''}</span>
                                                        </div>
                                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${conditionColor}`}>
                                                            {rec.condition}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Qty Received</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={p.qty}
                                                                value={rec.qtyReceived}
                                                                onChange={e => updateReceived(p.id, 'qtyReceived', e.target.value)}
                                                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
                                                            <select
                                                                value={rec.condition}
                                                                onChange={e => updateReceived(p.id, 'condition', e.target.value)}
                                                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            >
                                                                <option>Good</option>
                                                                <option>Damaged</option>
                                                                <option>Wrong Item</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Summary footer */}
                                    <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Parts Received</span>
                                        <span className="font-bold text-indigo-700">
                                            {Object.values(receivedParts).filter(r => r.condition === 'Good' && Number(r.qtyReceived) > 0).length} / {quoteParts.length} in good condition
                                        </span>
                                    </div>
                                </div>

                                {/* Issues banner if any not good */}
                                {Object.values(receivedParts).some(r => r.condition !== 'Good') && (
                                    <div className="border border-amber-200 bg-amber-50 rounded-lg px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>Some parts have issues. Contact the supplier to arrange replacements before proceeding to repair.</span>
                                    </div>
                                )}

                                {/* Complete */}
                                <button
                                    onClick={() => completeStep(13)}
                                    disabled={!allPartsConfirmed}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Confirm All Parts Received
                                </button>
                            </>
                        )}
                    </div>
                );

            case 14: // Work Progress Photos
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Upload photos documenting repair progress</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Before Repair</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">During Repair</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">After Repair</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Progress Description</label>
                            <textarea rows={3} placeholder="Describe the work completed..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button 
                            onClick={() => completeStep(12)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" /> Save Progress Update
                        </button>
                    </div>
                );

            case 15: // QC
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Perform quality control inspection</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">All repairs completed as specified</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Test drive completed successfully</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">No additional issues found</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Vehicle ready for delivery</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Name</label>
                            <input type="text" placeholder="Encik Rahman" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => completeStep(15)}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Approve QC
                            </button>
                            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
                                <X className="w-4 h-4" /> Reject - Needs Rework
                            </button>
                        </div>
                    </div>
                );

            case 16: // Car Wash
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Complete vehicle washing and detailing</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-blue-600" />
                                <label className="text-gray-700">Exterior wash completed</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-blue-600" />
                                <label className="text-gray-700">Interior vacuum and cleaning</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-blue-600" />
                                <label className="text-gray-700">Windows cleaned</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-blue-600" />
                                <label className="text-gray-700">Tire shine applied</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Washed By</label>
                            <input type="text" placeholder="Staff name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <button onClick={() => completeStep(16)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Complete Car Wash
                        </button>
                    </div>
                );

            case 17: // Send Receipt
                return (() => {
                    const labor       = parseFloat(receiptLaborCost) || 0;
                    const subtotal    = quoteTotal + labor;
                    const tax         = subtotal * 0.08;
                    const total       = subtotal + tax;
                    const inspDate    = new Date();
                    inspDate.setMonth(inspDate.getMonth() + 6);
                    const inspStr     = inspDate.toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });

                    return (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>User Action:</strong> Review the receipt, adjust labor cost if needed, generate and send to customer via WhatsApp.
                                </p>
                            </div>

                            {/* ── Invoice summary ── */}
                            {quoteParts.length === 0 ? (
                                <div className="border border-amber-200 bg-amber-50 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    No quotation parts found. Please complete the earlier steps first.
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-semibold text-gray-700">Invoice Summary</span>
                                    </div>

                                    {/* Parts rows */}
                                    <div className="divide-y divide-gray-100">
                                        {quoteParts.map(p => (
                                            <div key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-800">{p.name}</span>
                                                    <span className="ml-2 text-xs text-gray-400">× {p.qty}</span>
                                                </div>
                                                <span className="font-semibold text-gray-700">RM {(p.price * p.qty).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Labor input row */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                                        <span className="text-sm font-medium text-gray-700">Labor Charges</span>
                                        <div className="relative w-32">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RM</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={receiptLaborCost}
                                                onChange={e => { setReceiptLaborCost(e.target.value); setReceiptMsg(''); }}
                                                className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                                            />
                                        </div>
                                    </div>

                                    {/* Subtotal / tax / total */}
                                    <div className="divide-y divide-gray-100 border-t border-gray-200 bg-gray-50">
                                        <div className="flex items-center justify-between px-4 py-2 text-sm">
                                            <span className="text-gray-500">Parts Subtotal</span>
                                            <span className="text-gray-700">RM {quoteTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-2 text-sm">
                                            <span className="text-gray-500">Labor</span>
                                            <span className="text-gray-700">RM {labor.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-2 text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="text-gray-700">RM {subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-2 text-sm">
                                            <span className="text-gray-500">Service Tax (8%)</span>
                                            <span className="text-gray-700">RM {tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3 border-t-2 border-gray-200">
                                            <span className="text-sm font-bold text-gray-800">Total Amount</span>
                                            <span className="text-base font-bold text-indigo-700">RM {total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Inspection date notice */}
                                    <div className="flex items-center gap-2.5 px-4 py-3 border-t border-indigo-100 bg-indigo-50">
                                        <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                                        <p className="text-xs text-indigo-700">
                                            Next scheduled inspection date: <strong>{inspStr}</strong> (6 months from today)
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Generate button ── */}
                            {quoteParts.length > 0 && !receiptMsg && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={generateReceiptMsg}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" /> Generate Receipt Message
                                    </button>
                                </div>
                            )}

                            {/* ── Editable receipt message ── */}
                            {receiptMsg && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-semibold text-gray-700">Receipt Message</span>
                                            <span className="text-xs text-gray-400">· Editable before sending</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={copyReceiptMsg}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                    receiptMsgCopied
                                                        ? 'bg-green-50 border-green-400 text-green-700'
                                                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                {receiptMsgCopied
                                                    ? <><CheckCheck className="w-3.5 h-3.5" /> Copied</>
                                                    : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                            </button>
                                            <button
                                                onClick={() => window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(receiptMsg)}&type=custom_url&app_absent=0`, '_blank')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                                            >
                                                <Share2 className="w-3.5 h-3.5" /> Send via WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={receiptMsg}
                                        onChange={e => setReceiptMsg(e.target.value)}
                                        rows={24}
                                        className="w-full p-4 font-mono text-sm text-gray-700 bg-white border-0 focus:outline-none focus:ring-0 resize-y leading-relaxed"
                                        spellCheck={false}
                                    />
                                </div>
                            )}

                            {/* ── Complete step ── */}
                            {receiptMsg && (
                                <button
                                    onClick={() => completeStep(17)}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Mark as Sent &amp; Complete
                                </button>
                            )}
                        </div>
                    );
                })();

            case 18: // Receive Payment
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Record customer payment</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                            <div className="flex justify-between text-lg">
                                <span className="font-semibold">Total Amount Due:</span>
                                <span className="text-2xl font-bold text-indigo-600">RM 3,392</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option>-- Select Method --</option>
                                <option>Cash</option>
                                <option>Credit Card</option>
                                <option>Debit Card</option>
                                <option>Online Banking</option>
                                <option>QR Payment (DuitNow)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid (RM) *</label>
                                <input type="number" placeholder="3392.00" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                                <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Reference</label>
                            <input type="text" placeholder="TXN-123456" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes</label>
                            <textarea rows={2} placeholder="Any additional notes..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button 
                            onClick={() => completeStep(18)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <DollarSign className="w-4 h-4" /> Confirm Payment Received
                        </button>
                    </div>
                );

            case 19: // Car Delivery
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Complete vehicle handover to customer</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Customer ID verified</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Payment confirmed</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Vehicle inspection with customer completed</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">All documents handed over</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Customer signature obtained</label>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivered By *</label>
                                <input type="text" placeholder="Staff name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date & Time *</label>
                                <input type="datetime-local" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes</label>
                            <textarea rows={2} placeholder="Any additional notes about the delivery..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>

                        {/* Customer Feedback WhatsApp Section */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden mt-2">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-700">Customer Feedback Request</span>
                                    <span className="text-xs text-gray-400">· Editable before sending</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const msg = `Hi ${mockApprovalData.customerName},\n\nThank you for choosing Autoflow Service Centre for your Honda Civic 2020 (${PLATE_NUMBER}) service!\n\nWe hope you're satisfied with the work. We'd love to hear your feedback — it only takes 2 minutes:\n\nhttps://yourworkshop.com/customer-feedback?token=feedback123xyz\n\nYour Service Advisor: Ahmad bin Rahman\nContact: +60 3-1234 5678\n\nThank you,\nAutoflow Service Centre`;
                                            navigator.clipboard.writeText(msg);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <Copy className="w-3.5 h-3.5" /> Copy
                                    </button>
                                    <button
                                        onClick={() => {
                                            const msg = `Hi ${mockApprovalData.customerName},\n\nThank you for choosing Autoflow Service Centre for your Honda Civic 2020 (${PLATE_NUMBER}) service!\n\nWe hope you're satisfied with the work. We'd love to hear your feedback — it only takes 2 minutes:\n\nhttps://yourworkshop.com/customer-feedback?token=feedback123xyz\n\nYour Service Advisor: Ahmad bin Rahman\nContact: +60 3-1234 5678\n\nThank you,\nAutoflow Service Centre`;
                                            window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(msg)}&type=custom_url&app_absent=0`, '_blank');
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                                    >
                                        <Share2 className="w-3.5 h-3.5" /> Send via WhatsApp
                                    </button>
                                </div>
                            </div>
                            <div className="px-4 py-4 bg-white">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{`Hi ${mockApprovalData.customerName},

Thank you for choosing Autoflow Service Centre for your Honda Civic 2020 (${PLATE_NUMBER}) service!

We hope you're satisfied with the work. We'd love to hear your feedback — it only takes 2 minutes:

https://yourworkshop.com/customer-feedback?token=feedback123xyz

Your Service Advisor: Ahmad bin Rahman
Contact: +60 3-1234 5678

Thank you,
Autoflow Service Centre`}</pre>
                            </div>
                        </div>

                        <button 
                            onClick={() => completeStep(19)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 mt-6"
                        >
                            <Check className="w-4 h-4" /> Complete Delivery & Close Workflow
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Production UI for this step coming soon</p>
                        <p className="text-sm text-gray-500 mt-2">This step will have interactive forms, buttons, and input fields</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/workflows')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Workflows
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Workflow</h1>
                    <p className="text-gray-600 mt-2">Follow the 21-step process to create a complete workflow</p>
                </div>

                {/* Production-Level UI Preview Banner */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-purple-900 mb-2">Production-Level UI Preview</h3>
                    <p className="text-sm text-purple-700">
                        Click on any step below to see the ACTUAL production interface with forms, buttons, checkboxes, and all interactive elements that users will see and use.
                    </p>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                    {DETAILED_WORKFLOW_STEPS.map((step) => (
                        <div
                            key={step.number}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                        >
                            <button
                                onClick={() => toggleStep(step.number)}
                                className={`w-full px-6 py-4 transition-colors flex items-center justify-between ${
                                    getTimerStatus(step.number).isExceeded 
                                        ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' 
                                        : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-10 h-10 text-white rounded-full flex items-center justify-center font-bold ${
                                        getTimerStatus(step.number).isCompleted 
                                            ? 'bg-green-600' 
                                            : getTimerStatus(step.number).isExceeded 
                                                ? 'bg-red-600' 
                                                : 'bg-indigo-600'
                                    }`}>
                                        {step.number}
                                    </div>
                                    <div className="text-left flex-1">
                                        <h4 className="font-semibold text-gray-900">{step.name}</h4>
                                        <p className="text-sm text-gray-600">{step.description}</p>
                                    </div>
                                    
                                    {/* Timer Display */}
                                    <div className="flex items-center gap-4">
                                        {getTimerStatus(step.number).isCompleted && (
                                            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                                <span className="text-xl">✓</span> Completed
                                            </span>
                                        )}
                                        
                                        {getTimerStatus(step.number).isActive && (
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                                getTimerStatus(step.number).isExceeded 
                                                    ? 'bg-red-100 text-red-700' 
                                                    : getTimerStatus(step.number).timeRemaining! <= stepTimeLimits[step.number] * 0.3
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {getTimerStatus(step.number).isExceeded ? (
                                                    <AlertTriangle className="w-4 h-4" />
                                                ) : (
                                                    <Clock className="w-4 h-4" />
                                                )}
                                                <span className="font-mono font-bold">
                                                    {getTimerStatus(step.number).isExceeded && '-'}
                                                    {formatTimer(Math.abs(getTimerStatus(step.number).timeRemaining!))}
                                                </span>
                                                {getTimerStatus(step.number).isExceeded && (
                                                    <span className="text-xs font-semibold">OVERDUE</span>
                                                )}
                                            </div>
                                        )}
                                        
                                        {!getTimerStatus(step.number).isCompleted && !getTimerStatus(step.number).isActive && step.number > 1 && (
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {stepTimeLimits[step.number]} min limit
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {expandedStep === step.number ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500 ml-2" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500 ml-2" />
                                )}
                            </button>

                            {expandedStep === step.number && (
                                <div className="px-6 py-6 bg-white space-y-6 border-t-2 border-indigo-100">
                                    {/* Overdue Warning Alert */}
                                    {getTimerStatus(step.number).isExceeded && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-pulse">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                                <div>
                                                    <h4 className="text-red-900 font-bold text-lg">⚠️ OVERDUE - Action Required!</h4>
                                                    <p className="text-red-800 text-sm mt-1">
                                                        This step has exceeded its time limit. Please complete this step ASAP to keep the workflow on track!
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Authorized Roles */}
                                    <div>
                                        <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                            Authorized Roles
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {step.roles.map((role, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(role)}`}
                                                >
                                                    {getRoleLabel(role)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Production UI */}
                                    <div>
                                        <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                                            Production Interface
                                        </h5>
                                        {getStepUI(step.number)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
