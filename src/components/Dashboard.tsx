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
  topProducts?: PartnerStats[];
  topPackages?: PartnerStats[];
  childLabel?: string;
}> = ({ title, subtitle, quantity, valueUsd, shipmentCount, children, topHsCodes, topProducts, topPackages, childLabel }) => {
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
                {/* Secondary Table: Markets/Partners/Exporters */}
                <div className="space-y-1">
                  <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-4">
                    {childLabel || `DANH SÁCH CHI TIẾT`} ({children.length})
                  </h4>
                  <table className="w-full dense-table ml-4 w-[calc(100%-1rem)]">
                    <tbody className="bg-white">
                      {children.slice(0, 20).map((child, idx) => (
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

                {/* Section: Top Products per Company */}
                {topProducts && topProducts.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-accent-blue uppercase tracking-widest px-4">
                      TOP 5 SẢN PHẨM PHỔ BIẾN
                    </h4>
                    <table className="w-full dense-table ml-4 w-[calc(100%-1rem)]">
                      <tbody className="bg-white">
                        {topProducts.map((prod, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="text-[10px] text-slate-700 pl-4">{prod.name}</td>
                            <td className="text-right text-[10px] font-mono text-slate-500">{formatNumber(prod.totalQuantity)}</td>
                            <td className="text-right text-[10px] font-mono text-slate-500">{formatCurrency(prod.totalValueUsd)}</td>
                            <td className="text-right text-[10px] font-mono text-slate-400">{formatNumber(prod.shipmentCount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Section: Top Packages per Company */}
                {topPackages && topPackages.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-4">
                      QUY CÁCH ĐÓNG GÓI CHÍNH
                    </h4>
                    <table className="w-full dense-table ml-4 w-[calc(100%-1rem)]">
                      <tbody className="bg-white">
                        {topPackages.map((pkg, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="text-[10px] text-slate-700 pl-4">{pkg.name}</td>
                            <td className="text-right text-[10px] font-mono text-slate-500">{formatNumber(pkg.totalQuantity)}</td>
                            <td className="text-right text-[10px] font-mono text-slate-500">{formatCurrency(pkg.totalValueUsd)}</td>
                            <td className="text-right text-[10px] font-mono text-slate-400">{formatNumber(pkg.shipmentCount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Section: Top HS Codes per Company */}
                {topHsCodes && topHsCodes.length > 0 && (
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

const DonutCard: React.FC<{ title: string; data: any[] }> = ({ title, data }) => (
  <div className="high-density-card !p-6">
    <h3 className="pane-title mb-6 border-b border-border-line pb-2 font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(val: number) => [formatCurrency(val), 'Trị giá']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={60} 
            iconType="circle" 
            wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }}
            layout="horizontal"
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [companySearch, setCompanySearch] = useState('');
  const [marketSearch, setMarketSearch] = useState('');

  const stats = useMemo(() => {
    const totalValue = data.reduce((sum, item) => sum + (item.valueUsd || 0), 0);
    const totalShipments = data.length;
    
    // Aggregation logic
    const companyMap = new Map<string, { 
      base: CompanyStats, 
      partners: Map<string, PartnerStats>, 
      hsCodes: Map<string, PartnerStats>,
      products: Map<string, PartnerStats>,
      packages: Map<string, PartnerStats>
    }>();
    const marketMap = new Map<string, { 
      base: MarketStats, 
      importers: Map<string, PartnerStats>,
      products: Map<string, PartnerStats>,
      packages: Map<string, PartnerStats>
    }>();
    const hsCodeMap = new Map<string, number>();
    const productMap = new Map<string, { stats: PartnerStats, exporters: Map<string, PartnerStats> }>();
    const packageMap = new Map<string, { stats: PartnerStats, exporters: Map<string, PartnerStats> }>();

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
          hsCodes: new Map(),  // HS Codes for company
          products: new Map(), // Products for company
          packages: new Map()  // Packages for company
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

      // Aggregate Products for this company
      const companyProdKey = item.productName || 'Khác';
      let companyProdStat = comp.products.get(companyProdKey);
      if (!companyProdStat) {
        companyProdStat = { name: companyProdKey, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        comp.products.set(companyProdKey, companyProdStat);
      }
      companyProdStat.totalValueUsd += item.valueUsd || 0;
      companyProdStat.totalQuantity += item.quantity || 0;
      companyProdStat.shipmentCount += 1;

      // Aggregate Packages for this company
      const companyPkgKey = item.packageSpec || 'Theo mô tả';
      let companyPkgStat = comp.packages.get(companyPkgKey);
      if (!companyPkgStat) {
        companyPkgStat = { name: companyPkgKey, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        comp.packages.set(companyPkgKey, companyPkgStat);
      }
      companyPkgStat.totalValueUsd += item.valueUsd || 0;
      companyPkgStat.totalQuantity += item.quantity || 0;
      companyPkgStat.shipmentCount += 1;

      // Market aggregation (Global)
      const marketKey = item.importCountry;
      let mark = marketMap.get(marketKey);
      if (!mark) {
        mark = {
          base: { country: item.importCountry, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0, importers: [], exporters: new Set<string>() },
          importers: new Map(),
          products: new Map(),
          packages: new Map()
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

      // Aggregate Products for this market
      const marketProdKey = item.productName || 'Khác';
      let marketProdStat = mark.products.get(marketProdKey);
      if (!marketProdStat) {
        marketProdStat = { name: marketProdKey, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        mark.products.set(marketProdKey, marketProdStat);
      }
      marketProdStat.totalValueUsd += item.valueUsd || 0;
      marketProdStat.totalQuantity += item.quantity || 0;
      marketProdStat.shipmentCount += 1;

      // Aggregate Packages for this market
      const marketPkgKey = item.packageSpec || 'Theo mô tả';
      let marketPkgStat = mark.packages.get(marketPkgKey);
      if (!marketPkgStat) {
        marketPkgStat = { name: marketPkgKey, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        mark.packages.set(marketPkgKey, marketPkgStat);
      }
      marketPkgStat.totalValueUsd += item.valueUsd || 0;
      marketPkgStat.totalQuantity += item.quantity || 0;
      marketPkgStat.shipmentCount += 1;

      // HS Code aggregation
      const hsKey = item.hsCode;
      hsCodeMap.set(hsKey, (hsCodeMap.get(hsKey) || 0) + (item.valueUsd || 0));

      // Product aggregation
      const prodKey = item.productName || 'Khác';
      let prodEntry = productMap.get(prodKey);
      if (!prodEntry) {
        prodEntry = { 
          stats: { name: prodKey, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 },
          exporters: new Map()
        };
        productMap.set(prodKey, prodEntry);
      }
      prodEntry.stats.totalValueUsd += item.valueUsd || 0;
      prodEntry.stats.totalQuantity += item.quantity || 0;
      prodEntry.stats.shipmentCount += 1;

      const pExpKey = item.exporterName;
      let pExpStat = prodEntry.exporters.get(pExpKey);
      if (!pExpStat) {
        pExpStat = { name: item.exporterName, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        prodEntry.exporters.set(pExpKey, pExpStat);
      }
      pExpStat.totalValueUsd += item.valueUsd || 0;
      pExpStat.totalQuantity += item.quantity || 0;
      pExpStat.shipmentCount += 1;

      // Packaging aggregation
      const pkgKey = item.packageSpec || 'Theo mô tả';
      let pkgEntry = packageMap.get(pkgKey);
      if (!pkgEntry) {
        pkgEntry = { 
          stats: { name: pkgKey, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 },
          exporters: new Map()
        };
        packageMap.set(pkgKey, pkgEntry);
      }
      pkgEntry.stats.totalValueUsd += item.valueUsd || 0;
      pkgEntry.stats.totalQuantity += item.quantity || 0;
      pkgEntry.stats.shipmentCount += 1;

      const pkgExpKey = item.exporterName;
      let pkgExpStat = pkgEntry.exporters.get(pkgExpKey);
      if (!pkgExpStat) {
        pkgExpStat = { name: item.exporterName, totalValueUsd: 0, totalQuantity: 0, shipmentCount: 0 };
        pkgEntry.exporters.set(pkgExpKey, pkgExpStat);
      }
      pkgExpStat.totalValueUsd += item.valueUsd || 0;
      pkgExpStat.totalQuantity += item.quantity || 0;
      pkgExpStat.shipmentCount += 1;
    });

    const sortedCompanies = Array.from(companyMap.values())
      .map(c => ({
        ...c.base,
        partners: Array.from(c.partners.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd),
        topHsCodes: Array.from(c.hsCodes.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd).slice(0, 5),
        topProducts: Array.from(c.products.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd).slice(0, 5),
        topPackages: Array.from(c.packages.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd).slice(0, 5)
      }))
      .filter(c => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase()) || c.taxId.includes(companySearch))
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);
    
    const sortedMarkets = Array.from(marketMap.values())
      .map(m => ({
        ...m.base,
        importers: Array.from(m.importers.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd),
        topProducts: Array.from(m.products.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd).slice(0, 5),
        topPackages: Array.from(m.packages.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd).slice(0, 5)
      }))
      .filter(m => !marketSearch || m.country.toLowerCase().includes(marketSearch.toLowerCase()))
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

    const hsCodeData = Array.from(hsCodeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const top10HsCodes = hsCodeData.slice(0, 10);

    const sortedProducts = Array.from(productMap.values())
      .map(p => ({
        ...p.stats,
        exporters: Array.from(p.exporters.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd)
      }))
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

    const sortedPackages = Array.from(packageMap.values())
      .map(p => ({
        ...p.stats,
        exporters: Array.from(p.exporters.values()).sort((a, b) => b.totalValueUsd - a.totalValueUsd)
      }))
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

    // Market Share Data (Pie Chart)
    const top5Markets = sortedMarkets.slice(0, 5);
    const otherMarketsValue = sortedMarkets.slice(5).reduce((sum, m) => sum + m.totalValueUsd, 0);
    const marketShareData = [
      ...top5Markets.map(m => ({ name: m.country, value: m.totalValueUsd })),
      { name: 'Khác', value: otherMarketsValue }
    ].filter(d => d.value > 0);

    // Company Share Data
    const top5CompaniesChart = sortedCompanies.slice(0, 5);
    const otherCompaniesValue = sortedCompanies.slice(5).reduce((sum, c) => sum + c.totalValueUsd, 0);
    const companyShareData = [
      ...top5CompaniesChart.map(c => ({ name: c.name, value: c.totalValueUsd })),
      { name: 'Khác', value: otherCompaniesValue }
    ].filter(d => d.value > 0);

    // Product Share Data
    const top5ProductsChart = sortedProducts.slice(0, 5);
    const otherProductsValue = sortedProducts.slice(5).reduce((sum, p) => sum + p.totalValueUsd, 0);
    const productShareData = [
      ...top5ProductsChart.map(p => ({ name: p.name, value: p.totalValueUsd })),
      { name: 'Khác', value: otherProductsValue }
    ].filter(d => d.value > 0);

    // Package Share Data
    const top5PackagesChart = sortedPackages.slice(0, 5);
    const otherPackagesValue = sortedPackages.slice(5).reduce((sum, p) => sum + p.totalValueUsd, 0);
    const packageShareData = [
      ...top5PackagesChart.map(p => ({ name: p.name, value: p.totalValueUsd })),
      { name: 'Khác', value: otherPackagesValue }
    ].filter(d => d.value > 0);

    return { 
      totalValue, 
      totalShipments, 
      sortedCompanies, 
      sortedMarkets, 
      sortedProducts,
      sortedPackages,
      hsCodeData: top10HsCodes,
      marketShareData,
      companyShareData,
      productShareData,
      packageShareData
    };
  }, [data, companySearch, marketSearch]);

  const exportRankings = () => {
    const wb = XLSX.utils.book_new();

    // Companies Sheet
    const companyDataRows: any[] = [];
    stats.sortedCompanies.forEach(c => {
      // Header for company
      companyDataRows.push({
        'PHÂN LOẠI': 'CÔNG TY',
        'TÊN/DANH MỤC': c.name,
        'MÃ SỐ THUẾ': c.taxId,
        'TRỊ GIÁ USD': c.totalValueUsd,
        'TỔNG SỐ LƯỢNG': c.totalQuantity,
        'SỐ TỜ KHAI': c.shipmentCount,
        'GHI CHÚ': `Xuất khẩu tới ${c.markets.size} thị trường`
      });

      // Markets of this company
      c.partners.forEach(p => {
        companyDataRows.push({
          'PHÂN LOẠI': '    - Thị trường',
          'TÊN/DANH MỤC': p.name,
          'TRỊ GIÁ USD': p.totalValueUsd,
          'TỔNG SỐ LƯỢNG': p.totalQuantity,
          'SỐ TỜ KHAI': p.shipmentCount
        });
      });

      // Products of this company
      (c.topProducts || []).forEach(p => {
        companyDataRows.push({
          'PHÂN LOẠI': '    - Sản phẩm',
          'TÊN/DANH MỤC': p.name,
          'TRỊ GIÁ USD': p.totalValueUsd,
          'TỔNG SỐ LƯỢNG': p.totalQuantity,
          'SỐ TỜ KHAI': p.shipmentCount
        });
      });
      // Separator
      companyDataRows.push({});
    });
    const wsComp = XLSX.utils.json_to_sheet(companyDataRows);
    XLSX.utils.book_append_sheet(wb, wsComp, "Xếp hạng Công ty");

    // Markets Sheet
    const marketDataRows: any[] = [];
    stats.sortedMarkets.forEach(m => {
      marketDataRows.push({
        'PHÂN LOẠI': 'THỊ TRƯỜNG',
        'TÊN/DANH MỤC': m.country,
        'TRỊ GIÁ USD': m.totalValueUsd,
        'TỔNG SỐ LƯỢNG': m.totalQuantity,
        'SỐ TỜ KHAI': m.shipmentCount,
        'GHI CHÚ': `Có ${m.exporters.size} doanh nghiệp xuất khẩu`
      });

      // Importers in this market
      m.importers.forEach(p => {
        marketDataRows.push({
          'PHÂN LOẠI': '    - Nhà nhập khẩu',
          'TÊN/DANH MỤC': p.name,
          'TRỊ GIÁ USD': p.totalValueUsd,
          'TỔNG SỐ LƯỢNG': p.totalQuantity,
          'SỐ TỜ KHAI': p.shipmentCount
        });
      });

      // Products in this market
      (m.topProducts || []).forEach(p => {
        marketDataRows.push({
          'PHÂN LOẠI': '    - Sản phẩm',
          'TÊN/DANH MỤC': p.name,
          'TRỊ GIÁ USD': p.totalValueUsd,
          'TỔNG SỐ LƯỢNG': p.totalQuantity,
          'SỐ TỜ KHAI': p.shipmentCount
        });
      });
      marketDataRows.push({});
    });
    const wsMark = XLSX.utils.json_to_sheet(marketDataRows);
    XLSX.utils.book_append_sheet(wb, wsMark, "Xếp hạng Thị trường");

    // Product Ranking Sheet
    const productDataRows: any[] = [];
    stats.sortedProducts.forEach(p => {
      productDataRows.push({
        'PHÂN LOẠI': 'SẢN PHẨM',
        'TÊN/DANH MỤC': p.name,
        'TRỊ GIÁ USD': p.totalValueUsd,
        'TỔNG SỐ LƯỢNG': p.totalQuantity,
        'SỐ TỜ KHAI': p.shipmentCount
      });
      p.exporters.forEach(e => {
        productDataRows.push({
          'PHÂN LOẠI': '    - Cty xuất khẩu',
          'TÊN/DANH MỤC': e.name,
          'TRỊ GIÁ USD': e.totalValueUsd,
          'TỔNG SỐ LƯỢNG': e.totalQuantity,
          'SỐ TỜ KHAI': e.shipmentCount
        });
      });
      productDataRows.push({});
    });
    const wsProd = XLSX.utils.json_to_sheet(productDataRows);
    XLSX.utils.book_append_sheet(wb, wsProd, "Xếp hạng Sản phẩm");

    // Packaging Ranking Sheet
    const packageDataRows: any[] = [];
    stats.sortedPackages.forEach(p => {
      packageDataRows.push({
        'PHÂN LOẠI': 'QUY CÁCH',
        'TÊN/DANH MỤC': p.name,
        'TRỊ GIÁ USD': p.totalValueUsd,
        'TỔNG SỐ LƯỢNG': p.totalQuantity,
        'SỐ TỜ KHAI': p.shipmentCount
      });
      p.exporters.forEach(e => {
        packageDataRows.push({
          'PHÂN LOẠI': '    - Cty xuất khẩu',
          'TÊN/DANH MỤC': e.name,
          'TRỊ GIÁ USD': e.totalValueUsd,
          'TỔNG SỐ LƯỢNG': e.totalQuantity,
          'SỐ TỜ KHAI': e.shipmentCount
        });
      });
      packageDataRows.push({});
    });
    const wsPkg = XLSX.utils.json_to_sheet(packageDataRows);
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

      {/* Distribution Charts Grid - TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DonutCard title="PHÂN BỔ CÔNG TY XUẤT KHẨU" data={stats.companyShareData} />
        <DonutCard title="PHÂN BỔ THỊ TRƯỜNG NHẬP KHẨU" data={stats.marketShareData} />
        <DonutCard title="PHÂN BỔ THEO SẢN PHẨM" data={stats.productShareData} />
        <DonutCard title="PHÂN BỔ THEO QUY CÁCH ĐÓNG GÓI" data={stats.packageShareData} />
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
                    topProducts={company.topProducts}
                    topPackages={company.topPackages}
                    childLabel="CÁC THỊ TRƯỜNG CHÍNH"
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
                    topProducts={market.topProducts}
                    topPackages={market.topPackages}
                    childLabel="CÁC NHÀ NHẬP KHẨU CHÍNH"
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
                  <CollapsibleRow 
                    key={i}
                    title={prod.name}
                    quantity={prod.totalQuantity}
                    valueUsd={prod.totalValueUsd}
                    shipmentCount={prod.shipmentCount}
                    children={prod.exporters}
                    childLabel="CÁC CÔNG TY XUẤT KHẨU"
                  />
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
                  <CollapsibleRow 
                    key={i}
                    title={pkg.name}
                    quantity={pkg.totalQuantity}
                    valueUsd={pkg.totalValueUsd}
                    shipmentCount={pkg.shipmentCount}
                    children={pkg.exporters}
                    childLabel="CÁC CÔNG TY XUẤT KHẨU"
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
