import React, { useMemo, useState } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, Cell 
} from 'recharts';
import { TrendingUp, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { ExportData, CompanyStats, MarketStats, PartnerStats } from '../types';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  data: ExportData[];
}

const CollapsibleRow: React.FC<{ 
  title: string; 
  subtitle?: string;
  quantity: number; 
  valueUsd: number; 
  children: PartnerStats[];
  topHsCodes?: PartnerStats[];
  isMarket?: boolean;
}> = ({ title, subtitle, quantity, valueUsd, children, topHsCodes, isMarket }) => {
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
        <td className="text-right font-bold font-mono">{formatNumber(quantity)}</td>
        <td className="text-right font-bold font-mono text-accent-blue">{formatCurrency(valueUsd)}</td>
      </tr>
      <AnimatePresence>
        {isOpen && (
          <tr>
            <td colSpan={3} className="p-0 border-none bg-gray-50/50">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden p-3 space-y-3"
              >
                {/* Secondary Table: Markets/Partners */}
                <div className="space-y-1">
                  <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-4">
                    {isMarket ? 'CÁC NHÀ NHẬP KHẨU CHÍNH' : 'CÁC THỊ TRƯỜNG CHÍNH'}
                  </h4>
                  <table className="w-full dense-table ml-4 w-[calc(100%-1rem)]">
                    <tbody className="bg-white">
                      {children.map((child, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="text-[10px] text-slate-700 pl-4">{child.name}</td>
                          <td className="text-right text-[10px] font-mono text-slate-500">{formatNumber(child.totalQuantity)}</td>
                          <td className="text-right text-[10px] font-mono text-slate-500">{formatCurrency(child.totalValueUsd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* New Section: Top HS Codes per Company */}
                {!isMarket && topHsCodes && topHsCodes.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest px-4">
                      TOP 5 MẶT HÀNG (HS CODE)
                    </h4>
                    <table className="w-full dense-table ml-4 w-[calc(100%-1rem)]">
                      <tbody className="bg-white">
                        {topHsCodes.map((hs, idx) => (
                          <tr key={idx} className="hover:bg-indigo-50/50 transition-colors">
                            <td className="text-[10px] font-mono text-indigo-700 pl-4">{hs.name}</td>
                            <td className="text-right text-[10px] font-mono text-slate-500">{formatNumber(hs.totalQuantity)}</td>
                            <td className="text-right text-[10px] font-mono text-slate-500">{formatCurrency(hs.totalValueUsd)}</td>
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

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [companySearch, setCompanySearch] = useState('');
  const [marketSearch, setMarketSearch] = useState('');

  const stats = useMemo(() => {
    const totalValue = data.reduce((sum, item) => sum + (item.valueUsd || 0), 0);
    const totalShipments = data.length;
    
    // Aggregation logic
    const companyMap = new Map<string, { base: CompanyStats, partners: Map<string, PartnerStats>, hsCodes: Map<string, PartnerStats> }>();
    const marketMap = new Map<string, { base: MarketStats, importers: Map<string, PartnerStats> }>();
    const timeSeriesMap = new Map<string, number>();
    const hsCodeMap = new Map<string, number>();

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

      // Time series
      const timeKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
      timeSeriesMap.set(timeKey, (timeSeriesMap.get(timeKey) || 0) + (item.valueUsd || 0));

      // HS Code aggregation
      const hsKey = item.hsCode;
      hsCodeMap.set(hsKey, (hsCodeMap.get(hsKey) || 0) + (item.valueUsd || 0));
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

    const timeData = Array.from(timeSeriesMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }));

    const hsCodeData = Array.from(hsCodeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return { totalValue, totalShipments, sortedCompanies, sortedMarkets, timeData, hsCodeData };
  }, [data, companySearch, marketSearch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Companies Drill-down */}
        <div className="high-density-card flex flex-col !p-0">
          <div className="pane-header flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border-b border-border-line bg-slate-50 gap-2">
            <h3 className="pane-title text-[11px] text-slate-900">XẾP HẠNG CÔNG TY XUẤT KHẨU</h3>
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
                </tr>
              </thead>
              <tbody>
                {stats.sortedCompanies.slice(0, 50).map((company, i) => (
                  <CollapsibleRow 
                    key={i}
                    title={company.name}
                    subtitle={company.taxId}
                    quantity={company.totalQuantity}
                    valueUsd={company.totalValueUsd}
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
            <h3 className="pane-title text-[11px] text-slate-900">XẾP HẠNG THỊ TRƯỜNG NHẬP KHẨU</h3>
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
                </tr>
              </thead>
              <tbody>
                {stats.sortedMarkets.slice(0, 50).map((market, i) => (
                  <CollapsibleRow 
                    key={i}
                    title={market.country}
                    quantity={market.totalQuantity}
                    valueUsd={market.totalValueUsd}
                    children={market.importers}
                    isMarket
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="high-density-card !p-6">
          <h3 className="pane-title mb-6 border-b border-border-line pb-2">BIẾN ĐỘNG KIM NGẠCH THEO THỜI GIAN</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cfcfcf" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#cfcfcf' }} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#1a1a1a' }}
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
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#6366f1' }} 
                  activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="high-density-card !p-6">
          <h3 className="pane-title mb-6 border-b border-border-line pb-2">TOP 10 MÃ HS CODE THEO TRỊ GIÁ</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hsCodeData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cfcfcf" />
                <XAxis 
                  type="number"
                  axisLine={{ stroke: '#cfcfcf' }} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#1a1a1a' }}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  axisLine={{ stroke: '#cfcfcf' }} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#1a1a1a' }}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ fontSize: '11px', border: '1px solid #cfcfcf', backgroundColor: '#fff' }}
                  formatter={(val: number) => [formatCurrency(val), 'Trị giá']}
                  cursor={{ fill: '#f5f5f5' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#6366f1" 
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                >
                  {stats.hsCodeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#818cf8'} fillOpacity={1 - (index * 0.08)} />
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
