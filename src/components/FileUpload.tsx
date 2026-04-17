import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { parseFile } from '../lib/parsers';
import { ExportData } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface FileUploadProps {
  onDataLoaded: (data: ExportData[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(extension || '')) {
      setError('Vui lòng chọn tệp CSV hoặc Excel (.xlsx, .xls)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await parseFile(file);
      if (data.length === 0) {
        throw new Error('Không có dữ liệu hợp lệ trong tệp hoặc tiêu đề cột không khớp.');
      }
      onDataLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xử lý tệp');
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-sans font-bold tracking-tight text-gray-900 mb-4">
          Nhập Dữ Liệu Thị Trường
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Tải lên tệp CSV hoặc Excel chứa dữ liệu thông quan xuất khẩu của bạn. 
          Ứng dụng sẽ tự động phân tích và xếp hạng công ty cũng như thị trường.
        </p>
      </motion.div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer group",
          isDragging ? "border-black bg-gray-50 bg-opacity-50" : "border-gray-200 hover:border-black bg-white",
          loading && "pointer-events-none opacity-60"
        )}
        onClick={() => !loading && document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            "p-4 rounded-full transition-colors",
            isDragging ? "bg-black text-white" : "bg-gray-100 text-gray-400 group-hover:bg-black group-hover:text-white"
          )}>
            {loading ? (
              <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              {loading ? 'Đang xử lý dữ liệu...' : 'Kéo thả tệp vào đây hoặc click để chọn'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Hỗ trợ .CSV, .XLSX, .XLS
            </p>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-600"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FileSpreadsheet, title: 'Định dạng chuẩn', desc: 'Dữ liệu thô từ hải quan hoặc phần mềm ERP' },
          { icon: Upload, title: 'Tốc độ cao', desc: 'Xử lý hàng nghìn dòng dữ liệu trong tích tắc' },
          { icon: AlertCircle, title: 'An toàn bảo mật', desc: 'Dữ liệu được xử lý trực tiếp trên trình duyệt' }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <item.icon className="w-6 h-6 text-black mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
