import React from 'react';
import { ExportData } from '../types';
import { formatCurrency, formatNumber } from '../lib/utils';
import { Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

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
      item.declarationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.packageSpec?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleExport = () => {
    const exportData = filteredData.map(item => ({
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

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chi tiết dữ liệu");
    XLSX.writeFile(wb, `Du_lieu_xuat_khau_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="high-density-card !p-0 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border-line flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
        <div>
          <h3 className="pane-title text-indigo-900">Chi tiết dữ liệu giao dịch</h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Found {filteredData.length} records in analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search data..."
              className="pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>XUẤT EXCEL</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full dense-table border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr>
              <th>Ngày</th>
              <th>Số Tờ Khai</th>
              <th>Cty Xuất Khẩu</th>
              <th>Sản phẩm</th>
              <th>Quy cách</th>
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
                <td className="font-medium">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[9px] uppercase tracking-wide">
                    {item.productName || 'Khác'}
                  </span>
                </td>
                <td className="text-[10px] text-slate-500 font-mono italic">
                  {item.packageSpec || 'N/A'}
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
