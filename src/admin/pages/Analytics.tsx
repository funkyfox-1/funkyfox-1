import * as React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Download,
  Calendar,
  CreditCard,
  Package,
  AlertTriangle,
  Percent,
  Tag,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { StatCard } from '../components/ui/StatCard';
import { exportToCsv } from '../lib/csvExport';
import { useAdminToast } from '../context/ToastContext';
import { AdminOrder, AdminProduct } from '../lib/types';

export function Analytics() {
  const { showToast } = useAdminToast();
  const [timeRange, setTimeRange] = React.useState<'today' | '7d' | '30d' | '90d' | 'this_year' | 'all'>('30d');
  const [chartInterval, setChartInterval] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [bestSellerSort, setBestSellerSort] = React.useState<'revenue' | 'quantity'>('revenue');
  const [activeTab, setActiveTab] = React.useState<'overview' | 'profitability' | 'inventory' | 'campaigns'>('overview');
  const [snapshotTime, setSnapshotTime] = React.useState(() => Date.now());
  const [, setRefreshTick] = React.useState(0);

  React.useEffect(() => {
    const handleStoreUpdate = () => {
      setSnapshotTime(Date.now());
      setRefreshTick((t) => t + 1);
    };
    window.addEventListener('funkyfox:store_updated', handleStoreUpdate);
    return () => window.removeEventListener('funkyfox:store_updated', handleStoreUpdate);
  }, []);

  const products: AdminProduct[] = storeService.getProducts();
  const orders: AdminOrder[] = storeService.getOrders();
  const customers = storeService.getCustomers();

  // Filter orders by selected date range
  const filteredOrders = React.useMemo(() => {
    const now = snapshotTime;
    const startOfYear = new Date(new Date(now).getFullYear(), 0, 1).getTime();

    return orders.filter((o) => {
      const orderTime = new Date(o.createdAt).getTime();
      if (timeRange === 'today') return now - orderTime <= 86400000;
      if (timeRange === '7d') return now - orderTime <= 7 * 86400000;
      if (timeRange === '30d') return now - orderTime <= 30 * 86400000;
      if (timeRange === '90d') return now - orderTime <= 90 * 86400000;
      if (timeRange === 'this_year') return orderTime >= startOfYear;
      return true; // 'all'
    });
  }, [orders, timeRange, snapshotTime]);

  // Accurate Financial Calculations (verified captured orders only, exclude cancelled)
  const paidOrders = React.useMemo(() => {
    return filteredOrders.filter((o) => o.paymentStatus === 'captured' && o.shippingStatus !== 'cancelled');
  }, [filteredOrders]);

  const grossSales = paidOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalDiscounts = paidOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const totalShippingCollected = paidOrders.reduce((sum, o) => sum + (o.shippingCharge || 0), 0);
  const netRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const aov = paidOrders.length > 0 ? Math.round(netRevenue / paidOrders.length) : 0;

  // Cancellation and Return Rates
  const cancelledOrders = filteredOrders.filter((o) => o.shippingStatus === 'cancelled' || o.paymentStatus === 'failed');
  const cancellationRate = filteredOrders.length > 0 ? (cancelledOrders.length / filteredOrders.length) * 100 : 0;

  const fulfilledOrDeliveredOrders = filteredOrders.filter((o) =>
    ['shipped', 'out_for_delivery', 'delivered', 'returned'].includes(o.shippingStatus)
  );
  const returnedOrders = filteredOrders.filter((o) => o.shippingStatus === 'returned');
  const returnRate =
    fulfilledOrDeliveredOrders.length > 0
      ? (returnedOrders.length / fulfilledOrDeliveredOrders.length) * 100
      : 0;

  // Customer Retention and Repeat-Purchase Analysis
  const customerOrderCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    // Consider all captured orders across store history to determine customer repeat status accurately
    orders.forEach((o) => {
      if (o.paymentStatus === 'captured' && o.shippingStatus !== 'cancelled') {
        const key = (o.customer?.email || o.customer?.phone || o.customer?.id || 'unknown').toLowerCase().trim();
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  }, [orders]);

  const totalOrderingCustomers = customerOrderCounts.size;
  const repeatCustomerCount = React.useMemo(() => {
    let count = 0;
    customerOrderCounts.forEach((orderCount) => {
      if (orderCount >= 2) count++;
    });
    return count;
  }, [customerOrderCounts]);

  const repeatCustomerRate =
    totalOrderingCustomers > 0 ? (repeatCustomerCount / totalOrderingCustomers) * 100 : 0;

  // Best-Selling Products Calculation
  const productSalesMap = React.useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        sku: string;
        units: number;
        revenue: number;
        costPrice?: number;
      }
    >();

    paidOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
        const existing = map.get(item.productId) || {
          id: item.productId,
          name: item.name || prod?.name || 'Garment Item',
          sku: item.sku || prod?.sku || 'SKU-UNKNOWN',
          units: 0,
          revenue: 0,
          costPrice: prod?.costPrice,
        };
        existing.units += item.quantity;
        existing.revenue += item.price * item.quantity;
        map.set(item.productId, existing);
      });
    });

    return map;
  }, [paidOrders, products]);

  const bestSellers = React.useMemo(() => {
    const list = Array.from(productSalesMap.values());
    if (bestSellerSort === 'revenue') {
      return list.sort((a, b) => b.revenue - a.revenue);
    }
    return list.sort((a, b) => b.units - a.units);
  }, [productSalesMap, bestSellerSort]);

  // Slow-Moving Inventory: Active products with stock > 0 and low or zero units sold
  const slowMovingInventory = React.useMemo(() => {
    return products
      .filter((p) => p.status === 'active' && p.totalStock > 0)
      .map((p) => {
        const salesData = productSalesMap.get(p.id);
        const unitsSold = salesData ? salesData.units : 0;
        const revenue = salesData ? salesData.revenue : 0;
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          currentStock: p.totalStock,
          costPrice: p.costPrice,
          price: p.price,
          unitsSold,
          revenue,
          velocityStatus: unitsSold === 0 ? 'Zero Velocity' : unitsSold <= 2 ? 'Slow Moving' : 'Active',
        };
      })
      .filter((item) => item.unitsSold <= 2)
      .sort((a, b) => a.unitsSold - b.unitsSold || b.currentStock - a.currentStock);
  }, [products, productSalesMap]);

  // Product-wise Profit and Margin Analysis
  // CRITICAL RULE: If cost data is missing, clearly show unavailable rather than inventing profit.
  const productProfitAnalysis = React.useMemo(() => {
    return Array.from(productSalesMap.values()).map((item) => {
      const prod = products.find((p) => p.id === item.id || p.sku === item.sku);
      const costPrice = prod?.costPrice ?? item.costPrice;
      const hasCostPrice = typeof costPrice === 'number' && costPrice > 0;

      if (hasCostPrice) {
        const totalCost = costPrice * item.units;
        const grossProfit = item.revenue - totalCost;
        const marginPercent = item.revenue > 0 ? (grossProfit / item.revenue) * 100 : 0;

        return {
          ...item,
          hasCostPrice: true,
          unitCost: costPrice,
          totalCost,
          grossProfit,
          marginPercent,
        };
      }

      return {
        ...item,
        hasCostPrice: false,
        unitCost: null,
        totalCost: null,
        grossProfit: null,
        marginPercent: null,
      };
    });
  }, [productSalesMap, products]);

  // Marketing Campaign Performance & Attributed Sales
  const campaignAttribution = React.useMemo(() => {
    const map = new Map<
      string,
      {
        couponCode: string;
        ordersCount: number;
        totalDiscount: number;
        attributedRevenue: number;
      }
    >();

    paidOrders.forEach((o) => {
      const code = (o.couponCode || '').trim().toUpperCase() || 'DIRECT / ORGANIC';
      const existing = map.get(code) || {
        couponCode: code,
        ordersCount: 0,
        totalDiscount: 0,
        attributedRevenue: 0,
      };
      existing.ordersCount += 1;
      existing.totalDiscount += o.discount || 0;
      existing.attributedRevenue += o.total || 0;
      map.set(code, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.attributedRevenue - a.attributedRevenue);
  }, [paidOrders]);

  // Payment Breakdown
  const paymentBreakdown = React.useMemo(() => {
    return {
      cashfree: paidOrders.filter((o) => o.paymentMethod === 'cashfree' || o.paymentMethod === 'upi' || o.paymentMethod === 'razorpay').length,
      card: paidOrders.filter((o) => o.paymentMethod === 'card').length,
      cod: paidOrders.filter((o) => o.paymentMethod === 'cod').length,
    };
  }, [paidOrders]);

  // Sales Trend Chart Aggregation
  const trendData = React.useMemo(() => {
    const buckets = new Map<string, { label: string; revenue: number; ordersCount: number }>();

    // Generate buckets depending on chartInterval
    if (chartInterval === 'daily') {
      const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : 14;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(snapshotTime - i * 86400000);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        buckets.set(key, { label, revenue: 0, ordersCount: 0 });
      }

      paidOrders.forEach((o) => {
        const key = new Date(o.createdAt).toISOString().split('T')[0];
        if (buckets.has(key)) {
          const b = buckets.get(key)!;
          b.revenue += o.total;
          b.ordersCount += 1;
        }
      });
    } else if (chartInterval === 'weekly') {
      for (let i = 7; i >= 0; i--) {
        const d = new Date(snapshotTime - i * 7 * 86400000);
        const label = `Wk of ${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
        buckets.set(`week-${i}`, { label, revenue: 0, ordersCount: 0 });
      }

      paidOrders.forEach((o) => {
        const ageMs = snapshotTime - new Date(o.createdAt).getTime();
        const weekIndex = Math.floor(ageMs / (7 * 86400000));
        if (weekIndex <= 7 && buckets.has(`week-${weekIndex}`)) {
          const b = buckets.get(`week-${weekIndex}`)!;
          b.revenue += o.total;
          b.ordersCount += 1;
        }
      });
    } else {
      // Monthly: Past 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        buckets.set(key, { label, revenue: 0, ordersCount: 0 });
      }

      paidOrders.forEach((o) => {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (buckets.has(key)) {
          const b = buckets.get(key)!;
          b.revenue += o.total;
          b.ordersCount += 1;
        }
      });
    }

    return Array.from(buckets.values());
  }, [paidOrders, chartInterval, timeRange, snapshotTime]);

  const maxRevenue = Math.max(...trendData.map((t) => t.revenue), 1000);

  // CSV Export Handlers
  const handleExportSummary = () => {
    const reportData = [
      { Section: 'Executive KPI', Metric: 'Net Settled Revenue (INR)', Value: netRevenue },
      { Section: 'Executive KPI', Metric: 'Gross Retail Sales (INR)', Value: grossSales },
      { Section: 'Executive KPI', Metric: 'Promotional Discounts (INR)', Value: totalDiscounts },
      { Section: 'Executive KPI', Metric: 'Shipping Fees Collected (INR)', Value: totalShippingCollected },
      { Section: 'Executive KPI', Metric: 'Total Paid Orders', Value: paidOrders.length },
      { Section: 'Executive KPI', Metric: 'Average Order Value (AOV)', Value: aov },
      { Section: 'Executive KPI', Metric: 'Cancellation Rate (%)', Value: cancellationRate.toFixed(2) },
      { Section: 'Executive KPI', Metric: 'Return Rate (%)', Value: returnRate.toFixed(2) },
      { Section: 'Executive KPI', Metric: 'Repeat Customer Rate (%)', Value: repeatCustomerRate.toFixed(2) },
      { Section: 'Executive KPI', Metric: 'Active Registered Customers', Value: customers.length },
    ];
    exportToCsv(`funkyfox_bi_summary_${timeRange}`, reportData);
    showToast('Executive financial summary exported to CSV', 'info');
  };

  const handleExportProfitReport = () => {
    const rows = productProfitAnalysis.map((p) => ({
      Product_Name: p.name,
      SKU: p.sku,
      Units_Sold: p.units,
      Gross_Revenue: p.revenue,
      Unit_Cost_Price: p.hasCostPrice ? p.unitCost : 'Unavailable (Cost Unset)',
      Total_Cost_Of_Goods: p.hasCostPrice ? p.totalCost : 'Unavailable',
      Gross_Profit: p.hasCostPrice ? p.grossProfit : 'Unavailable',
      Gross_Margin_Percent: p.hasCostPrice ? `${p.marginPercent?.toFixed(2)}%` : 'Unavailable',
    }));
    exportToCsv(`funkyfox_profit_analysis_${timeRange}`, rows);
    showToast('Product profit and margin report exported', 'info');
  };

  const handleExportSlowMoving = () => {
    const rows = slowMovingInventory.map((item) => ({
      Product_Name: item.name,
      SKU: item.sku,
      Category: item.category,
      Current_Stock: item.currentStock,
      Units_Sold_In_Period: item.unitsSold,
      Revenue_Generated: item.revenue,
      Movement_Status: item.velocityStatus,
    }));
    exportToCsv(`funkyfox_slow_moving_stock_${timeRange}`, rows);
    showToast('Slow-moving inventory report exported', 'info');
  };

  const handleExportCampaigns = () => {
    const rows = campaignAttribution.map((c) => ({
      Coupon_Campaign_Code: c.couponCode,
      Attributed_Paid_Orders: c.ordersCount,
      Total_Discount_Granted: c.totalDiscount,
      Attributed_Net_Revenue: c.attributedRevenue,
      Revenue_Contribution_Percent: netRevenue > 0 ? `${((c.attributedRevenue / netRevenue) * 100).toFixed(2)}%` : '0%',
    }));
    exportToCsv(`funkyfox_campaign_attribution_${timeRange}`, rows);
    showToast('Marketing campaign attribution report exported', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 font-display">
            Business Intelligence & Marketing Telemetry
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Real-time sales velocity, unit margin analysis, slow-moving inventory, and campaign ROI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-zinc-200/80 shadow-xs text-xs overflow-x-auto">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'this_year', label: 'Year' },
              { id: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeRange(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  timeRange === tab.id
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export Action */}
          <div className="relative inline-block text-left group">
            <button
              type="button"
              onClick={handleExportSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-50 transition-colors shadow-xs"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          title="Net Captured Revenue"
          value={`₹${netRevenue.toLocaleString('en-IN')}`}
          trend="up"
          subtitle="verified sales"
          icon={<DollarSign size={18} className="text-emerald-600" />}
        />
        <StatCard
          title="Paid Orders"
          value={paidOrders.length}
          trend="up"
          subtitle="captured checkouts"
          icon={<ShoppingBag size={18} className="text-blue-600" />}
        />
        <StatCard
          title="Average Order Value"
          value={`₹${aov.toLocaleString('en-IN')}`}
          subtitle="per transaction"
          icon={<TrendingUp size={18} className="text-purple-600" />}
        />
        <StatCard
          title="Cancellation Rate"
          value={`${cancellationRate.toFixed(1)}%`}
          trend={cancellationRate > 15 ? 'down' : 'neutral'}
          subtitle={`${cancelledOrders.length} cancelled`}
          icon={<AlertTriangle size={18} className="text-amber-600" />}
        />
        <StatCard
          title="Return Rate"
          value={`${returnRate.toFixed(1)}%`}
          subtitle={`${returnedOrders.length} returned`}
          icon={<RefreshCw size={18} className="text-rose-600" />}
        />
        <StatCard
          title="Repeat Customer Rate"
          value={`${repeatCustomerRate.toFixed(1)}%`}
          subtitle={`${repeatCustomerCount} repeat buyers`}
          icon={<Users size={18} className="text-[#FF6B35]" />}
        />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Sales & Financial Trends
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profitability')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profitability'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Product Profit & Margins
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Inventory Velocity & Slow Stock
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          Marketing & Coupon Attribution
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SALES TRENDS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Sales Trend Chart Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Sales Revenue & Order Velocity
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Visual breakdown of captured revenue across the selected timeframe
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
                {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setChartInterval(mode)}
                    className={`px-3 py-1 rounded-md capitalize transition-all ${
                      chartInterval === mode
                        ? 'bg-white text-zinc-900 shadow-xs font-bold'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive SVG Bar Chart */}
            <div className="h-56 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-zinc-100">
              {trendData.map((col, idx) => {
                const heightPercent = maxRevenue > 0 ? Math.max((col.revenue / maxRevenue) * 100, 4) : 4;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                      <div className="font-bold">₹{col.revenue.toLocaleString('en-IN')}</div>
                      <div className="text-zinc-400">{col.ordersCount} orders</div>
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[42px] rounded-t-md transition-all ${
                        col.revenue > 0
                          ? 'bg-[#FF6B35] group-hover:bg-[#E55A25]'
                          : 'bg-zinc-100 group-hover:bg-zinc-200'
                      }`}
                    />
                    <span className="text-[10px] text-zinc-400 mt-2 truncate w-full text-center">
                      {col.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statement & Payment Gateways */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Accounting & Settlement Breakdown (INR)
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-zinc-600 font-medium">Gross Retail Sales</span>
                  <span className="font-bold text-zinc-900">₹{grossSales.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100 text-emerald-600">
                  <span className="font-medium">Promotional Discounts</span>
                  <span className="font-bold">-₹{totalDiscounts.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-zinc-600 font-medium">Shipping Fees Collected</span>
                  <span className="font-bold text-zinc-900">₹{totalShippingCollected.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                  <span className="text-zinc-600 font-medium">Estimated GST (18% inclusive)</span>
                  <span className="font-bold text-zinc-900">
                    ₹{Math.round(netRevenue * 0.18).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 text-sm font-black text-zinc-900 bg-zinc-50 px-4 rounded-xl">
                  <span>Net Settled Merchant Revenue</span>
                  <span className="text-[#FF6B35]">₹{netRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Share */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-[#FF6B35]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Payment Channels
                </h2>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-700">Cashfree UPI / Gateway</span>
                    <span className="font-bold text-zinc-900">{paymentBreakdown.cashfree} orders</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${paidOrders.length ? (paymentBreakdown.cashfree / paidOrders.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-700">Credit / Debit Cards</span>
                    <span className="font-bold text-zinc-900">{paymentBreakdown.card} orders</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${paidOrders.length ? (paymentBreakdown.card / paidOrders.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-700">Cash on Delivery (COD)</span>
                    <span className="font-bold text-zinc-900">{paymentBreakdown.cod} orders</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${paidOrders.length ? (paymentBreakdown.cod / paidOrders.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT-WISE PROFIT & MARGIN ANALYSIS */}
      {activeTab === 'profitability' && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden space-y-0">
          <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Product Profitability & Gross Margin Analysis
              </h2>
              <p className="text-[11px] text-zinc-500 mt-1">
                Calculates actual profit based strictly on verified Cost Price (<code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">costPrice</code>). Missing cost data is clearly marked as Unavailable to preserve reporting integrity.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportProfitReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Download size={13} /> Export Profit Report
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Units Sold</th>
                  <th className="py-3 px-4 text-right">Gross Sales</th>
                  <th className="py-3 px-4 text-right">Unit Cost Price</th>
                  <th className="py-3 px-4 text-right">Total Estimated Profit</th>
                  <th className="py-3 px-4 text-right">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {productProfitAnalysis.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      No product sales recorded in this period.
                    </td>
                  </tr>
                ) : (
                  productProfitAnalysis.map((item) => (
                    <tr key={item.sku} className="hover:bg-zinc-50/50">
                      <td className="py-3.5 px-4 font-bold text-zinc-900">{item.name}</td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500">{item.sku}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-zinc-800">{item.units}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-zinc-900">
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {item.hasCostPrice ? (
                          <span className="font-mono text-zinc-700">₹{item.unitCost?.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500">
                            Unavailable (Cost Unset)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {item.hasCostPrice && item.grossProfit !== null ? (
                          <span
                            className={`font-black ${
                              item.grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            ₹{item.grossProfit.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">Unavailable</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {item.hasCostPrice && item.marginPercent !== null ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              item.marginPercent >= 40
                                ? 'bg-emerald-50 text-emerald-700'
                                : item.marginPercent >= 20
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {item.marginPercent.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY VELOCITY & SLOW MOVING */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Best-Sellers Control */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Best-Selling Products
                </h2>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Top performing items ranked by overall customer demand
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBestSellerSort('revenue')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bestSellerSort === 'revenue'
                      ? 'bg-white text-zinc-900 shadow-xs font-bold'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  By Revenue (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setBestSellerSort('quantity')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bestSellerSort === 'quantity'
                      ? 'bg-white text-zinc-900 shadow-xs font-bold'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  By Quantity (Units)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Gross Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {bestSellers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400">
                        No sales recorded for this timeframe.
                      </td>
                    </tr>
                  ) : (
                    bestSellers.slice(0, 10).map((item, idx) => (
                      <tr key={item.sku} className="hover:bg-zinc-50/50">
                        <td className="py-3.5 px-4 font-black text-zinc-400">#{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900">{item.name}</td>
                        <td className="py-3.5 px-4 font-mono text-zinc-500">{item.sku}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-zinc-800">{item.units} units</td>
                        <td className="py-3.5 px-4 text-right font-black text-zinc-900">
                          ₹{item.revenue.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slow-Moving Stock Section */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Slow-Moving Inventory Alert
                  </h2>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Active in-stock products with ≤ 2 units sold in the selected period. Consider promotional bundles or price optimization.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportSlowMoving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <Download size={13} /> Export Slow Stock
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stock On Hand</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Status Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {slowMovingInventory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        Excellent velocity! No slow-moving stock identified.
                      </td>
                    </tr>
                  ) : (
                    slowMovingInventory.slice(0, 15).map((item) => (
                      <tr key={item.sku} className="hover:bg-zinc-50/50">
                        <td className="py-3.5 px-4 font-bold text-zinc-900">{item.name}</td>
                        <td className="py-3.5 px-4 font-mono text-zinc-500">{item.sku}</td>
                        <td className="py-3.5 px-4 text-zinc-600">{item.category}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-zinc-900">{item.currentStock}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-zinc-700">{item.unitsSold}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.velocityStatus === 'Zero Velocity'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.velocityStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MARKETING & CAMPAIGN ATTRIBUTION */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#FF6B35]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Marketing Campaign & Coupon Attribution
                </h2>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Direct revenue impact and discount distribution by promo campaign code
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCampaigns}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Download size={13} /> Export Campaigns
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Coupon / Campaign Code</th>
                  <th className="py-3 px-4 text-center">Attributed Paid Orders</th>
                  <th className="py-3 px-4 text-right">Total Discount Given</th>
                  <th className="py-3 px-4 text-right">Net Attributed Revenue</th>
                  <th className="py-3 px-4 text-right">Revenue Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {campaignAttribution.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      No campaign orders recorded in this period.
                    </td>
                  </tr>
                ) : (
                  campaignAttribution.map((camp) => {
                    const share = netRevenue > 0 ? (camp.attributedRevenue / netRevenue) * 100 : 0;
                    return (
                      <tr key={camp.couponCode} className="hover:bg-zinc-50/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 flex items-center gap-2">
                          <Tag size={13} className="text-zinc-400" />
                          {camp.couponCode}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-zinc-800">
                          {camp.ordersCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                          -₹{camp.totalDiscount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-zinc-900">
                          ₹{camp.attributedRevenue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 text-zinc-800">
                            {share.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
