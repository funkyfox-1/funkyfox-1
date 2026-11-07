import * as React from 'react';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { AdminOrder } from '../../lib/types';

interface PrintableInvoiceProps {
  order: AdminOrder;
  onClose?: () => void;
  isModal?: boolean;
}

// Convert number to Indian Rupees in words
function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n === 0) return 'Zero';
    let str = '';
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const hundred = Math.floor(n / 100);
    n %= 100;

    if (crore > 0) str += inWords(crore) + 'Crore ';
    if (lakh > 0) str += inWords(lakh) + 'Lakh ';
    if (thousand > 0) str += inWords(thousand) + 'Thousand ';
    if (hundred > 0) str += inWords(hundred) + 'Hundred ';
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) str += a[n];
      else str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    }
    return str.trim();
  }

  const rounded = Math.round(num);
  return 'INR ' + inWords(rounded) + ' Only';
}

export function PrintableInvoice({ order, onClose, isModal = true }: PrintableInvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const invoiceNumber = `INV-${order.orderNumber.replace(/[^A-Za-z0-9]/g, '')}`;

  const content = (
    <div className="admin-printable-invoice bg-white text-black p-6 sm:p-10 font-sans max-w-4xl mx-auto rounded-xl">
      {/* Top Company & Invoice Header */}
      <div className="border-b-2 border-black pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black uppercase tracking-tight font-display">
              FUNKY <span className="text-[#FF6B35]">FOX</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black text-white rounded">
              Official
            </span>
          </div>
          <p className="text-xs font-bold text-neutral-800 mt-1">Funky Fox Retail Private Limited</p>
          <p className="text-[11px] text-neutral-600 leading-relaxed mt-0.5 max-w-xs">
            402, Signature One, Outer Ring Road, Bellandur, Bengaluru, Karnataka, India - 560103
          </p>
          <p className="text-[11px] text-neutral-600 mt-1">
            <span className="font-semibold">GSTIN:</span> 29AABCF9241Q1Z6 &bull; <span className="font-semibold">PAN:</span> AABCF9241Q
          </p>
          <p className="text-[11px] text-neutral-600">
            <span className="font-semibold">Email:</span> care@funkyfox.in &bull; <span className="font-semibold">Support:</span> +91 98765 43210
          </p>
        </div>

        <div className="sm:text-right">
          <div className="inline-block bg-neutral-100 border border-neutral-300 px-3 py-1 text-xs font-black uppercase tracking-widest text-neutral-900 rounded">
            Tax Invoice / Retail Bill
          </div>
          <table className="mt-3 text-xs text-left sm:text-right border-collapse">
            <tbody>
              <tr>
                <td className="text-neutral-500 font-semibold pr-3 py-0.5">Invoice No:</td>
                <td className="font-mono font-bold text-neutral-900">{invoiceNumber}</td>
              </tr>
              <tr>
                <td className="text-neutral-500 font-semibold pr-3 py-0.5">Invoice Date:</td>
                <td className="font-semibold text-neutral-900">{invoiceDate}</td>
              </tr>
              <tr>
                <td className="text-neutral-500 font-semibold pr-3 py-0.5">Order Reference:</td>
                <td className="font-mono font-bold text-neutral-900">{order.orderNumber}</td>
              </tr>
              <tr>
                <td className="text-neutral-500 font-semibold pr-3 py-0.5">Payment Status:</td>
                <td className="font-bold uppercase text-emerald-800">{order.paymentStatus} ({order.paymentMethod.toUpperCase()})</td>
              </tr>
              {order.shipmentDetails?.awbCode && (
                <tr>
                  <td className="text-neutral-500 font-semibold pr-3 py-0.5">AWB Tracking:</td>
                  <td className="font-mono font-bold text-neutral-900">{order.shipmentDetails.courierName || 'Logistics'}: {order.shipmentDetails.awbCode}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-neutral-200">
        <div className="p-4 rounded-lg bg-neutral-50/70 border border-neutral-200">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1.5">
            Customer / Billed To
          </p>
          <p className="text-sm font-bold text-neutral-900">{order.customer.name}</p>
          <p className="text-xs text-neutral-600 mt-0.5">Phone: {order.customer.phone}</p>
          <p className="text-xs text-neutral-600">Email: {order.customer.email}</p>
          <p className="text-xs text-neutral-700 mt-2 font-medium">
            {order.shippingAddress.street}
            {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
          </p>
          <p className="text-xs text-neutral-700">
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-neutral-50/70 border border-neutral-200">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1.5">
            Delivery / Shipped To
          </p>
          <p className="text-sm font-bold text-neutral-900">
            {order.shippingAddress.fullName || order.customer.name}
          </p>
          <p className="text-xs text-neutral-600 mt-0.5">Contact: {order.shippingAddress.phone || order.customer.phone}</p>
          <p className="text-xs text-neutral-700 mt-2 font-medium">
            {order.shippingAddress.street}
            {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
          </p>
          <p className="text-xs text-neutral-700">
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
          <p className="text-xs text-neutral-500 mt-1">Country: {order.shippingAddress.country || 'India'}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-6 border-b border-neutral-200 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-neutral-100 text-neutral-800 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3">SKU</th>
              <th className="py-2.5 px-3 text-center">Size</th>
              <th className="py-2.5 px-3 text-center">Color</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {order.items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-3 px-3 text-center font-medium text-neutral-500">{idx + 1}</td>
                <td className="py-3 px-3 font-semibold text-neutral-900">{item.name}</td>
                <td className="py-3 px-3 font-mono text-[11px] text-neutral-600">{item.sku}</td>
                <td className="py-3 px-3 text-center font-bold text-neutral-800">{item.size}</td>
                <td className="py-3 px-3 text-center text-neutral-700">{item.color}</td>
                <td className="py-3 px-3 text-center font-bold text-neutral-900">{item.quantity}</td>
                <td className="py-3 px-3 text-right font-medium text-neutral-800">
                  ₹{item.price.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-3 text-right font-bold text-neutral-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculations & Summary Section */}
      <div className="py-6 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="max-w-md">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Amount in Words:</p>
          <p className="text-xs font-bold text-neutral-900 mt-1 italic">{numberToWords(order.total)}</p>

          <div className="mt-4 p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-[11px] text-neutral-600 leading-relaxed">
            <span className="font-bold text-neutral-900 block mb-1">Return &amp; Exchange Policy:</span>
            Unworn items with tags attached can be exchanged or returned within 15 days of delivery. For queries, scan your tracking AWB on funkyfox.in or contact care@funkyfox.in.
          </div>
        </div>

        <div className="w-full sm:w-72">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="py-1 text-neutral-600">Items Subtotal:</td>
                <td className="py-1 text-right font-semibold text-neutral-900">
                  ₹{order.subtotal.toLocaleString('en-IN')}
                </td>
              </tr>
              {order.discount > 0 && (
                <tr>
                  <td className="py-1 text-emerald-700 font-medium">
                    Discount {order.couponCode ? `(${order.couponCode})` : ''}:
                  </td>
                  <td className="py-1 text-right font-bold text-emerald-700">
                    -₹{order.discount.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-1 text-neutral-600">Standard Delivery:</td>
                <td className="py-1 text-right font-semibold text-neutral-900">
                  {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-neutral-600">Applicable GST (included):</td>
                <td className="py-1 text-right font-semibold text-neutral-900">
                  ₹{order.tax.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="border-t-2 border-black">
                <td className="py-2.5 text-sm font-black uppercase tracking-tight text-neutral-900">
                  Grand Total:
                </td>
                <td className="py-2.5 text-right text-base font-black text-neutral-900">
                  ₹{order.total.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Sign-off */}
      <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 gap-4">
        <p className="text-[11px] text-center sm:text-left">
          This is a system-generated electronic tax invoice authorized by Funky Fox Retail Pvt Ltd.
        </p>
        <div className="text-center sm:text-right">
          <p className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
            For Funky Fox Retail Pvt. Ltd.
          </p>
          <p className="text-[10px] text-neutral-500 mt-4 border-t border-neutral-300 pt-1">
            Authorized Signatory
          </p>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 admin-no-print">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-white border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-[#FF6B35]" />
            <span className="text-sm font-bold tracking-tight">
              Tax Invoice Preview &bull; {order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#FF6B35] hover:bg-[#E85D26] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Printable Sheet View */}
        <div className="max-h-[82vh] overflow-y-auto p-4 sm:p-8 bg-neutral-100">
          {content}
        </div>
      </div>
    </div>
  );
}

