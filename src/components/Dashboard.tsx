import React, { useMemo, useState } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, Cell, PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, FileText, ChevronRight, ChevronDown, Download } from 'lucide-react';
import { ExportData, CompanyStats, MarketStats, PartnerStats } from '../types';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

interface DashboardProps {
  data: ExportData[];
}

const CollapsibleRow: React.FC<{ 
  title: string; 
  subtitle?: string;
  quantity: number; 
  valueUsd: number; 
  shipmentCount: number;
  children: PartnerStats[];
  topHsCodes?: PartnerStats[];
  isMarket?: boolean;
}> = ({ title, subtitle, quantity, valueUsd, shipmentCount, children, topHsCodes, isMarket }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        className="hover:bg-slate-50 cursor-pointer group transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="font-semibold flex items-center space-x-2">
          <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          <div className="flex flex-col">
            <span className="text-accent-blue uppercase leading-tight tracking-tight">{title}</span>
            {subtitle && <span className="text-[9px] text-subtle-gray font-mono">{subtitle}</span>}
          </div>
        </td>
        <td className="text-right font-bold font-mono text-[11px]">{formatNumber(quantity)}</td>
        <td className="text-right font-bold font-mono text-[11px] text-accent-blue">{formatCurrency(valueUsd)}</td>
        <td className="text-right font-bold font-mono text-[11px] text-slate-500">{formatNumber(shipmentCount)}</td>
      </tr>
      <AnimatePresence>
        {isOpen && (
          <tr>
            <td colSpan={4} className="p-0 border-none bg-gray-50/50">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden p-3 space-y-3"
              >
                {/* Secondary Table: Markets/Partners */}
                <div className="space-y-1">
                  <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-4">
                    {isMarket ? `CÁC NHÀ NHẬP KHẨU CHÍNH (${children.length})` : `CÁC THỊ TRƯỜNG CHÍNH (${children.length})`}
                  </h4>
                  <table className="w-full dense-table ml-4 w-[calc(100%-1rem)]">
                    <tbody className="bg-white">
                      {children.map((child, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="text-[10px] text-slate-700 pl-4">{child.name}</td>
                          <td className="text-right text-[10px] font-mono text-slate-500">{formatNumber(child.totalQuantity)}</td>
                          <td className="text-right text-[10px] font-mono text-slate-500">{formatCurrency(child.totalValueUsd)}</td>
                          <td className="text-right text-[10px] font-mono text-slate-400">{formatNumber(child.shipmentCount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* New Section: Top HS Codes per Company */}
                {!isMarket && topHsCodes && topHsCodes.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest px-4">
                      TOP 5 MẶT HÀNG (HS CODE) - TỔNG {topHsCodes.length} LOẠI
                    </h4>
                    <table className="w-full dense-table ml-4 w-[calc(100%-1rem)]">
                      <tbody className="bg-white">
                        {topHsCodes.map((hs, idx) => (
                          <tr key={idx} className="hover:bg-indigo-50/50 transition-colors">
                            <td className="text-[10px] font-mono text-indigo-700 pl-4">{hs.name}</td>
                            <td className="text-right text-[10px] font-mono text-slate-500">{formatNumber(hs.totalQuantity)}</td>
                            <td className="text-right text-[10px] font-mono text-slate-500">{formatCurrency(hs.totalValueUsd)}</td>
                            <td className="text-right text-[10px] font-mono text-slate-400">{formatNumber(hs.shipmentCount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', 
  '#10b981', '#06b6d4', '#14b8a6', '#3b82f6', '#4f46e5'
];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [companySearch, setCompanySearch] = useState('');
  const [marketSearch, setMarketSearch] = useState('');

  const stats = useMemo(() => {
    const totalValue = data.reduce((sum, item) => sum + (item.valueUsd || 0), 0);
    const totalShipments = data.length;
    
    // Aggregation logic
    const companyMap = new Map<string, { base: CompanyStats, partners: Map<string, PartnerStats>, hsCodes: Map<string, PartnerStats> }>();
    const marketMap = new Map<string, { base: MarketStats, importers: Map<string, PartnerStats> }>();
    const hsCodeMap = new Map<string, number>();
    const productMap = new Map<string, PartnerStats>();
    const packageMap = new Map<string, PartnerStats>();

    data.forEach(item => {
      // (filtering comments)
    });

    // To keep it simple and responsive, let's calculate all and filter the final lists
    data.forEach(item => {
      // Company aggregation
      const companyKey = item.exporterTaxId || item.exporterName;
      let comp = companyMap.get(companyKey);
      if (!comp) {
        comp = {
          base: { name: item.exporterName, taxId: item.exporterTaxId, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0, partners: [], topHsCodes: [], markets: new Set<string>() },
          partners: new Map(), // Markets for company
          hsCodes: new Map()   // HS Codes for company
        };
        companyMap.set(companyKey, comp);
      }
      comp.base.totalValueUsd += item.valueUsd || 0;
      comp.base.totalQuantity += item.quantity || 0;
      comp.base.shipmentCount += 1;
      comp.base.markets.add(item.importCountry);

      // Aggregate MARKETS for this company
      const mKey = item.importCountry;
      let marketStat = comp.partners.get(mKey);
      if (!marketStat) {
        marketStat = { name: item.importCountry, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        comp.partners.set(mKey, marketStat);
      }
      marketStat.totalValueUsd += item.valueUsd || 0;
      marketStat.totalQuantity += item.quantity || 0;
      marketStat.shipmentCount += 1;

      // Aggregate HS Codes for this company
      const companyHsKey = item.hsCode;
      let companyHsStat = comp.hsCodes.get(companyHsKey);
      if (!companyHsStat) {
        companyHsStat = { name: item.hsCode, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        comp.hsCodes.set(companyHsKey, companyHsStat);
      }
      companyHsStat.totalValueUsd += item.valueUsd || 0;
      companyHsStat.totalQuantity += item.quantity || 0;
      companyHsStat.shipmentCount += 1;

      // Market aggregation (Global)
      const marketKey = item.importCountry;
      let mark = marketMap.get(marketKey);
      if (!mark) {
        mark = {
          base: { country: item.importCountry, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0, importers: [], exporters: new Set<string>() },
          importers: new Map()
        };
        marketMap.set(marketKey, mark);
      }
      mark.base.totalValueUsd += item.valueUsd || 0;
      mark.base.totalQuantity += item.quantity || 0;
      mark.base.shipmentCount += 1;
      mark.base.exporters.add(item.exporterName);

      const pKey = item.importerName;
      let mPart = mark.importers.get(pKey);
      if (!mPart) {
        mPart = { name: item.importerName, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        mark.importers.set(pKey, mPart);
      }
      mPart.totalValueUsd += item.valueUsd || 0;
      mPart.totalQuantity += item.quantity || 0;
      mPart.shipmentCount += 1;

      // HS Code aggregation
      const hsKey = item.hsCode;
      hsCodeMap.set(hsKey, (hsCodeMap.get(hsKey) || 0) + (item.valueUsd || 0));

      // Product aggregation
      const prodKey = item.productName || 'Khác';
      let prodStat = productMap.get(prodKey);
      if (!prodStat) {
        prodStat = { name: prodKey, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        productMap.set(prodKey, prodStat);
      }
      prodStat.totalValueUsd += item.valueUsd || 0;
      prodStat.totalQuantity += item.quantity || 0;
      prodStat.shipmentCount += 1;

      // Packaging aggregation
      const pkgKey = item.packageSpec || 'Theo mô tả';
      let pkgStat = packageMap.get(pkgKey);
      if (!pkgStat) {
        pkgStat = { name: pkgKey, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        packageMap.set(pkgKey, pkgStat);
      }
      pkgStat.totalValueUsd += item.valueUsd || 0;
      pkgStat.totalQuantity += item.quantity || 0;
      pkgStat.shipmentCount += 1;
    });

    const sortedCompanies = Array.from(companyMap.values())
      .map(c => ({
        ...c.base,
        partners: Array.from(c.partners.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd),
        topHsCodes: Array.from(c.hsCodes.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd).slice(0, 5)
      }))
      .filter(c => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase()) || c.taxId.includes(companySearch))
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);
    
    const sortedMarkets = Array.from(marketMap.values())
      .map(m => ({
        ...m.base,
        importers: Array.from(m.importers.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd)
      }))
      .filter(m => !marketSearch || m.country.toLowerCase().includes(marketSearch.toLowerCase()))
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

    const hsCodeData = Array.from(hsCodeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const top10HsCodes = hsCodeData.slice(0, 10);

    const sortedProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

    const sortedPackages = Array.from(packageMap.values())
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

    // Market Share Data (Pie Chart)
    const top5Markets = sortedMarkets.slice(0, 5);
    const otherMarketsValue = sortedMarkets.slice(5).reduce((sum, m) => sum + m.totalValueUsd, 0);
    const marketShareData = [
      ...top5Markets.map(m => ({ name: m.country, value: m.totalValueUsd })),
      { name: 'Khác', value: otherMarketsValue }
    ];

    return { 
      totalValue, 
      totalShipments, 
      sortedCompanies, 
      sortedMarkets, 
      sortedProducts,
      sortedPackages,
      hsCodeData: top10HsCodes,
      marketShareData
    };
  }, [data, companySearch, marketSearch]);

  const exportRankings = () => {
    const wb = XLSX.utils.book_new();

    // Companies Sheet
    const companyData = stats.sortedCompanies.map(c => ({
      'Tên Công ty': c.name,
      'Mã số thuế': c.taxId,
      'Tổng trị giá USD': c.totalValueUsd,
      'Tổng số lượng': c.totalQuantity,
      'Số tờ khai': c.shipmentCount,
      'Số thị trường': c.markets.size
    }));
    const wsComp = XLSX.utils.json_to_sheet(companyData);
    XLSX.utils.book_append_sheet(wb, wsComp, "Xếp hạng Công ty");

    // Markets Sheet
    const marketData = stats.sortedMarkets.map(m => ({
      'Thị trường': m.country,
      'Tổng trị giá USD': m.totalValueUsd,
      'Tổng số lượng': m.totalQuantity,
      'Số tờ khai': m.shipmentCount,
      'Số doanh nghiệp xuất khẩu': m.exporters.size
    }));
    const wsMark = XLSX.utils.json_to_sheet(marketData);
    XLSX.utils.book_append_sheet(wb, wsMark, "Xếp hạng Thị trường");

    // Product Ranking Sheet
    const productData = stats.sortedProducts.map(p => ({
      'Tên Sản phẩm': p.name,
      'Tổng trị giá USD': p.totalValueUsd,
      'Tổng số lượng': p.totalQuantity,
      'Số tờ khai': p.shipmentCount
    }));
    const wsProd = XLSX.utils.json_to_sheet(productData);
    XLSX.utils.book_append_sheet(wb, wsProd, "Xếp hạng Sản phẩm");

    // Packaging Ranking Sheet
    const packageData = stats.sortedPackages.map(p => ({
      'Quy cách đóng gói': p.name,
      'Tổng trị giá USD': p.totalValueUsd,
      'Tổng số lượng': p.totalQuantity,
      'Số tờ khai': p.shipmentCount
    }));
    const wsPkg = XLSX.utils.json_to_sheet(packageData);
    XLSX.utils.book_append_sheet(wb, wsPkg, "Xếp hạng Đóng gói");

    // Detailed Data Sheet
    const detailedData = data.map(item => ({
      'Năm': item.year,
      'Tháng': item.month,
      'Ngày': item.day,
      'MST Cty xuất khẩu': item.exporterTaxId,
      'Tên Cty xuất khẩu': item.exporterName,
      'Địa chỉ Cty xuất khẩu': item.exporterAddress,
      'Điện thoại Cty xuất khẩu': item.exporterPhone,
      'Tên Cty nhập khẩu': item.importerName,
      'Địa chỉ Cty nhập khẩu': item.importerAddress,
      'HS Code': item.hsCode,
      'Tên sản phẩm': item.productName || 'Khác',
      'Quy cách đóng gói': item.packageSpec || 'Theo mô tả',
      'Mô tả hàng hóa': item.productDescription,
      'Thuế xuất khẩu': item.exportTax,
      'Xuất xứ': item.origin,
      'Mã đơn vị tính giá': item.unit,
      'Số lượng': item.quantity,
      'Đơn giá nguyên tệ': item.priceForeign,
      'Đơn giá USD': item.priceUsd,
      'Trị giá USD': item.valueUsd,
      'Tỷ giá VND': item.exchangeRateVnd,
      'Mã đồng tiền': item.currency,
      'Điều kiện giá': item.incoterms,
      'Phương thức thanh toán': item.paymentMethod,
      'Chi cục Hải quan': item.customsOffice,
      'Tên loại hình': item.businessType,
      'Tên nước xuất khẩu': item.exportCountry,
      'Tên nước nhập khẩu': item.importCountry,
      'Số tờ khai': item.declarationNumber
    }));
    const wsDetail = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(wb, wsDetail, "Chi tiết dữ liệu");

    XLSX.writeFile(wb, `Bao_cao_tong_hop_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Metrics Row */}
      <div className="flex justify-between items-end">
        <div className="grid grid-cols-2 gap-4 flex-1">
          {[
            { label: 'Tổng trị giá xuất khẩu (USD)', value: formatCurrency(stats.totalValue), icon: TrendingUp },
            { label: 'Tổng số tờ khai khai báo', value: formatNumber(stats.totalShipments), icon: FileText },
          ].map((metric, i) => (
            <div key={i} className="high-density-card flex flex-col justify-center min-h-[90px]">
              <p className="stat-label">{metric.label}</p>
              <h4 className="stat-value">{metric.value}</h4>
            </div>
          ))}
        </div>
        <button 
          onClick={exportRankings}
          className="ml-4 mb-0.5 flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded shadow-md transition-all font-bold text-[12px] h-[90px]"
        >
          <Download className="w-5 h-5" />
          <span>XUẤT BÁO CÁO TỔNG HỢP</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Companies Drill-down */}
        <div className="high-density-card flex flex-col !p-0">
          <div className="pane-header flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border-b border-border-line bg-slate-50 gap-2">
            <h3 className="pane-title text-[11px] text-slate-900">
              XẾP HẠNG CÔNG TY XUẤT KHẨU ({stats.sortedCompanies.length})
            </h3>
            <div className="relative w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Tìm công ty..."
                className="text-[10px] px-2 py-1 border border-border-line rounded w-full sm:w-40 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full dense-table">
              <thead>
                <tr className="bg-slate-50">
                  <th className="w-1/2">CÔNG TY XUẤT KHẨU</th>
                  <th className="text-right">SỐ LƯỢNG</th>
                  <th className="text-right">TRỊ GIÁ USD</th>
                  <th className="text-right">SỐ TỜ KHAI</th>
                </tr>
              </thead>
              <tbody>
                {stats.sortedCompanies.map((company, i) => (
                  <CollapsibleRow 
                    key={i}
                    title={company.name}
                    subtitle={company.taxId}
                    quantity={company.totalQuantity}
                    valueUsd={company.totalValueUsd}
                    shipmentCount={company.shipmentCount}
                    children={company.partners}
                    topHsCodes={company.topHsCodes}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Markets Drill-down */}
        <div className="high-density-card flex flex-col !p-0">
          <div className="pane-header flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border-b border-border-line bg-slate-50 gap-2">
            <h3 className="pane-title text-[11px] text-slate-900">
              XẾP HẠNG THỊ TRƯỜNG NHẬP KHẨU ({stats.sortedMarkets.length})
            </h3>
            <div className="relative w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Tìm thị trường..."
                className="text-[10px] px-2 py-1 border border-border-line rounded w-full sm:w-40 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full dense-table">
              <thead>
                <tr className="bg-slate-50">
                  <th className="w-1/2">THỊ TRƯỜNG NHẬP KHẨU</th>
                  <th className="text-right">SỐ LƯỢNG</th>
                  <th className="text-right">TRỊ GIÁ USD</th>
                  <th className="text-right">SỐ TỜ KHAI</th>
                </tr>
              </thead>
              <tbody>
                {stats.sortedMarkets.map((market, i) => (
                  <CollapsibleRow 
                    key={i}
                    title={market.country}
                    quantity={market.totalQuantity}
                    valueUsd={market.totalValueUsd}
                    shipmentCount={market.shipmentCount}
                    children={market.importers}
                    isMarket
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products Drill-down */}
        <div className="high-density-card flex flex-col !p-0">
          <div className="pane-header p-3 border-b border-border-line bg-slate-50">
            <h3 className="pane-title text-[11px] text-slate-900 uppercase">
              XẾP HẠNG THEO TÊN SẢN PHẨM ({stats.sortedProducts.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full dense-table">
              <thead>
                <tr className="bg-slate-50">
                  <th className="w-1/2">SẢN PHẨM</th>
                  <th className="text-right">SỐ LƯỢNG</th>
                  <th className="text-right">TRỊ GIÁ USD</th>
                  <th className="text-right">SỐ TỜ KHAI</th>
                </tr>
              </thead>
              <tbody>
                {stats.sortedProducts.slice(0, 10).map((prod, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="font-semibold text-accent-blue uppercase text-[10px] pl-4">{prod.name}</td>
                    <td className="text-right font-mono text-[11px]">{formatNumber(prod.totalQuantity)}</td>
                    <td className="text-right font-mono text-[11px] text-accent-blue">{formatCurrency(prod.totalValueUsd)}</td>
                    <td className="text-right font-mono text-[11px] text-slate-500">{formatNumber(prod.shipmentCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Packaging Drill-down */}
        <div className="high-density-card flex flex-col !p-0">
          <div className="pane-header p-3 border-b border-border-line bg-slate-50">
            <h3 className="pane-title text-[11px] text-slate-900 uppercase">
              XẾP HẠNG THEO QUY CÁCH ĐÓNG GÓI ({stats.sortedPackages.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full dense-table">
              <thead>
                <tr className="bg-slate-50">
                  <th className="w-1/2">QUY CÁCH ĐÓNG GÓI</th>
                  <th className="text-right">SỐ LƯỢNG</th>
                  <th className="text-right">TRỊ GIÁ USD</th>
                  <th className="text-right">SỐ TỜ KHAI</th>
                </tr>
              </thead>
              <tbody>
                {stats.sortedPackages.slice(0, 10).map((pkg, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="font-semibold text-slate-700 text-[10px] pl-4">{pkg.name}</td>
                    <td className="text-right font-mono text-[11px]">{formatNumber(pkg.totalQuantity)}</td>
                    <td className="text-right font-mono text-[11px] text-accent-blue">{formatCurrency(pkg.totalValueUsd)}</td>
                    <td className="text-right font-mono text-[11px] text-slate-500">{formatNumber(pkg.shipmentCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Charts - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Market Share Donut Chart */}
        <div className="high-density-card !p-6">
          <h3 className="pane-title mb-6 border-b border-border-line pb-2 font-bold text-slate-900 uppercase tracking-tight">PHÂN BỔ THỊ TRƯỜNG NHẬP KHẨU</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.marketShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.marketShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none' }}
                  formatter={(val: number) => [formatCurrency(val), 'Trị giá']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="high-density-card !p-6">
          <h3 className="pane-title mb-6 border-b border-border-line pb-2 font-bold text-slate-900 uppercase tracking-tight">TOP 10 MÃ HS CODE THEO TRỊ GIÁ</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hsCodeData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cfcfcf" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#cfcfcf' }} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#1a1a1a' }}
                />
                <YAxis 
                  axisLine={{ stroke: '#cfcfcf' }} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#1a1a1a' }}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  contentStyle={{ fontSize: '11px', border: '1px solid #cfcfcf', backgroundColor: '#fff' }}
                  formatter={(val: number) => [formatCurrency(val), 'Trị giá']}
                  cursor={{ fill: '#f5f5f5' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                >
                  {stats.hsCodeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
