/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { DataTable } from './components/DataTable';
import { ExportData } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Download, Bell, User, Search as SearchIcon } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<ExportData[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Filters state
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterHsCode, setFilterHsCode] = useState<string>('all');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleDataLoaded = (loadedData: ExportData[]) => {
    setData(loadedData);
    setActiveTab('dashboard');
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu hiện tại?')) {
      setData([]);
      setFilterYear('all');
      setFilterMonth('all');
      setFilterHsCode('all');
      setActiveTab('dashboard');
    }
  };

  // Derived filter options
  const filterOptions = React.useMemo(() => {
    if (!data.length) return { years: [], months: [], hsCodes: [] };
    
    const years = Array.from(new Set(data.map(d => String(d.year)))).sort();
    const months = Array.from(new Set(data.map(d => String(d.month)))).sort((a, b) => Number(a) - Number(b));
    const hsCodes = Array.from(new Set(data.map(d => d.hsCode))).sort();
    
    return { years, months, hsCodes };
  }, [data]);

  // Apply filters
  const filteredData = React.useMemo(() => {
    return data.filter(d => {
      const yearMatch = filterYear === 'all' || String(d.year) === filterYear;
      const monthMatch = filterMonth === 'all' || String(d.month) === filterMonth;
      const hsMatch = filterHsCode === 'all' || d.hsCode === filterHsCode;
      return yearMatch && monthMatch && hsMatch;
    });
  }, [data, filterYear, filterMonth, filterHsCode]);

  if (!isLoaded) return null;

  return (
    <div className="flex min-h-screen bg-bg text-ink font-sans">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onReset={handleReset}
        hasData={data.length > 0} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-[56px] bg-white border-b border-border-line px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="breadcrumb text-[11px] text-slate-500 font-medium tracking-tight">
            WORK AREA / <span className="text-indigo-600 font-bold uppercase tracking-wider">{activeTab}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-md border border-slate-200">
               <span className="text-[9px] font-bold uppercase text-slate-400 px-2 tracking-widest">Filters</span>
               
               {/* HS Code Filter */}
               <select 
                className="text-[10px] font-semibold border-none px-2 py-1 bg-transparent text-slate-600 outline-none cursor-pointer hover:text-indigo-600 transition-colors max-w-[110px]"
                value={filterHsCode}
                onChange={(e) => setFilterHsCode(e.target.value)}
               >
                  <option value="all">HS CODE (ALL)</option>
                  {filterOptions.hsCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
               </select>

               {/* Year Filter */}
               <select 
                className="text-[10px] font-semibold border-none px-2 py-1 bg-transparent text-slate-600 outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
               >
                  <option value="all">YEAR (ALL)</option>
                  {filterOptions.years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
               </select>

               {/* Month Filter */}
               <select 
                className="text-[10px] font-semibold border-none px-2 py-1 bg-transparent text-slate-600 outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
               >
                  <option value="all">MONTH (ALL)</option>
                  {filterOptions.months.map(m => (
                    <option key={m} value={m}>MONTH {m}</option>
                  ))}
               </select>
            </div>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-slate-100 ring-offset-1">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!data.length ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FileUpload onDataLoaded={handleDataLoaded} />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {activeTab === 'dashboard' && <Dashboard data={filteredData} />}
                {activeTab === 'companies' && <Dashboard data={filteredData} />}
                {activeTab === 'markets' && <Dashboard data={filteredData} />}
                {activeTab === 'data' && <DataTable data={filteredData} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
