import * as React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, X, ArrowRight, BellRing } from 'lucide-react';

interface IncomingOrder {
  id: string;
  orderNumber?: string;
  order_number?: string;
  total: number;
  customerName?: string;
  customer?: { name?: string; email?: string; phone?: string };
  customer_info?: { name?: string; email?: string; phone?: string };
  paymentMethod?: string;
  payment_method?: string;
  timestamp: number;
}

/**
 * Web Audio API synthesized notification sound (gentle double chime)
 */
function playOrderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // Chime 1 (D5 = 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Chime 2 (A5 = 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.28, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch (err) {
    // Audio might be blocked if user hasn't interacted yet
    console.debug('[NotificationSound] Audio chime omitted:', err);
  }
}

export function NewOrderNotification() {
  const [activeNotifications, setActiveNotifications] = React.useState<IncomingOrder[]>([]);

  React.useEffect(() => {
    const handleNewOrder = (event: Event) => {
      const customEvent = event as CustomEvent;
      const order = customEvent.detail;
      if (!order) return;

      const orderRef = order.orderNumber || order.order_number || order.id || 'NEW';
      const cust = order.customer || order.customer_info;
      const custName = cust?.name || order.customerName || 'Customer';

      const item: IncomingOrder = {
        id: order.id,
        orderNumber: orderRef,
        total: Number(order.total) || 0,
        customerName: custName,
        paymentMethod: order.paymentMethod || order.payment_method || 'Online',
        timestamp: Date.now(),
      };

      playOrderChime();

      setActiveNotifications((prev) => {
        // Prevent duplicate toasts for same order
        if (prev.some((o) => o.id === item.id)) return prev;
        return [item, ...prev].slice(0, 3);
      });

      // Auto dismiss after 10 seconds
      setTimeout(() => {
        setActiveNotifications((prev) => prev.filter((o) => o.timestamp !== item.timestamp));
      }, 10000);
    };

    window.addEventListener('funkyfox:new_order', handleNewOrder);
    return () => window.removeEventListener('funkyfox:new_order', handleNewOrder);
  }, []);

  const dismiss = (timestamp: number) => {
    setActiveNotifications((prev) => prev.filter((o) => o.timestamp !== timestamp));
  };

  if (activeNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {activeNotifications.map((order) => (
        <div
          key={order.timestamp}
          className="pointer-events-auto bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-emerald-500/80 text-zinc-900 animate-slideDown overflow-hidden relative"
        >
          {/* Top pulse bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#FF6B35] to-emerald-500 animate-pulse" />

          <div className="flex items-start gap-3.5">
            {/* Pulsing Icon */}
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 relative">
              <ShoppingBag size={18} />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white animate-ping" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {/* Order Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  New Order Received
                </span>
                <button
                  type="button"
                  onClick={() => dismiss(order.timestamp)}
                  className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded-lg transition-colors cursor-pointer"
                  aria-label="Dismiss order notification"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mt-1.5">
                <p className="font-mono text-xs font-bold text-zinc-900 truncate">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5 truncate">
                  {order.customerName} · <strong className="text-zinc-900 font-extrabold">₹{order.total.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-zinc-100">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {order.paymentMethod}
                </span>
                <Link
                  to={`/admin/orders/${order.id}`}
                  onClick={() => dismiss(order.timestamp)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:text-[#e05a2b] transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
