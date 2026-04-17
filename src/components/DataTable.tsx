import React from 'react';
import { ExportData } from '../types';
import { formatCurrency, formatNumber } from '../lib/utils';
import { Search } from 'lucide-react';

interface DataTableProps {
  data: ExportData[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredData = React.useMemo(() => {
    return data.filter(item => 
      item.exporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.importCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hsCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.declarationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  return (
    <div className="high-density-card !p-0 overflow-hidden">
      <div className="p-4 border-b border-border-line flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fafafa]">
        <div>
          <h3 className="pane-title text-ink">Danh sách giao dịch chi tiết</h3>
          <p className="text-[10px] text-subtle-gray uppercase mt-1">Hiển thị {filteredData.length} bản ghi</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-subtle-gray" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-8 pr-4 py-1 bg-white border border-border-line rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-accent-blue transition-all w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full dense-table border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr>
              <th>Ngày</th>
              <th>Số Tờ Khai</th>
              <th>Cty Xuất Khẩu</th>
              <th>Thị trường</th>
              <th>HS Code</th>
              <th>Mô tả hàng hóa</th>
              <th className="text-right">Trị giá USD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 whitespace-nowrap">
            {filteredData.slice(0, 100).map((item, i) => (
              <tr key={i} className="hover:bg-[#f9f9f9]">
                <td className="font-mono text-subtle-gray">
                  {String(item.day).padStart(2, '0')}/{String(item.month).padStart(2, '0')}/{item.year}
                </td>
                <td className="font-mono text-ink">{item.declarationNumber}</td>
                <td>
                  <div className="font-bold text-ink truncate max-w-[180px]" title={item.exporterName}>{item.exporterName}</div>
                  <div className="text-[9px] text-subtle-gray font-mono">{item.exporterTaxId}</div>
                </td>
                <td>{item.importCountry}</td>
                <td className="font-mono text-accent-blue">{item.hsCode}</td>
                <td className="text-subtle-gray truncate max-w-[250px]" title={item.productDescription}>{item.productDescription}</td>
                <td className="text-right font-mono font-bold text-ink">{formatCurrency(item.valueUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length > 100 && (
          <div className="p-4 text-center bg-gray-50 text-xs text-gray-400 font-mono italic">
            Hiển thị 100 dòng đầu tiên. Sử dụng tìm kiếm để lọc dữ liệu.
          </div>
        )}
      </div>
    </div>
  );
};
