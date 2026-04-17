import React from 'react';
import { LayoutDashboard, FileSpreadsheet, Building2, Globe, History, Download, Trash2, LogOut, ChevronRight, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReset: () => void;
  hasData: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onReset, hasData }) => {
  const menuItems = [
    { id: 'dashboard', label: 'TỔNG QUAN THỊ TRƯỜNG', icon: LayoutDashboard, disabled: !hasData },
    { id: 'companies', label: 'XẾP HẠNG CTY XUẤT KHẨU', icon: Building2, disabled: !hasData },
    { id: 'markets', label: 'XẾP HẠNG THỊ TRƯỜNG', icon: Globe, disabled: !hasData },
    { id: 'data', label: 'DỮ LIỆU CHI TIẾT', icon: FileSpreadsheet, disabled: !hasData },
  ];

  return (
    <aside className="w-[240px] bg-slate-900 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800">
      <div className="sidebar-header p-6 border-b border-slate-800">
        <h1 className="text-[13px] font-bold uppercase tracking-[3px] text-white/90">Market Analyzer</h1>
        <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">Enterprise Edition</p>
      </div>

      <div className="p-3">
        {!hasData && (
          <div className="upload-zone p-4 border border-dashed border-slate-700 rounded bg-slate-800/50 text-center mb-6">
             <div className="flex justify-center mb-3">
                <Upload className="w-5 h-5 text-slate-500" />
             </div>
             <span className="text-[10px] text-slate-500 block leading-relaxed">Tải lên file CSV/Excel để phân tích thị trường</span>
          </div>
        )}

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              disabled={item.disabled}
              className={cn(
                "w-full text-left px-4 py-2.5 text-[11px] font-semibold transition-all rounded duration-200",
                activeTab === item.id 
                  ? "bg-slate-800 text-indigo-400 border-r-2 border-indigo-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                item.disabled && "opacity-20 cursor-not-allowed"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4" />
                <span className="uppercase tracking-tight">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4 border-t border-slate-800">
        {hasData && (
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-[10px] text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-all uppercase font-bold tracking-widest"
          >
            <Trash2 className="w-3 h-3" />
            <span>Xóa dữ liệu</span>
          </button>
        )}
        
        <div className="text-[9px] text-slate-600 font-mono text-center uppercase tracking-widest">
          {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>
    </aside>
  );
};

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
