import * as XLSX from 'xlsx';
import { ExportData } from '../types';

const HEADER_MAP: Record<string, keyof ExportData> = {
  'Năm': 'year',
  'Tháng': 'month',
  'Ngày': 'day',
  'MST Cty xuất khẩu': 'exporterTaxId',
  'Tên Cty xuất khẩu': 'exporterName',
  'Địa chỉ Cty xuất khẩu': 'exporterAddress',
  'Điện thoại Cty xuất khẩu': 'exporterPhone',
  'Tên Cty nhập khẩu': 'importerName',
  'Địa chỉ Cty nhập khẩu': 'importerAddress',
  'HS Code': 'hsCode',
  'Mô tả hàng hóa': 'productDescription',
  'Thuế xuất khẩu': 'exportTax',
  'Xuất xứ': 'origin',
  'Mã đơn vị tính giá': 'unit',
  'Số lượng': 'quantity',
  'Đơn giá nguyên tệ': 'priceForeign',
  'Đơn giá USD': 'priceUsd',
  'Trị giá USD': 'valueUsd',
  'Tỷ giá VND': 'exchangeRateVnd',
  'Mã đồng tiền': 'currency',
  'Điều kiện giá': 'incoterms',
  'Phương thức thanh toán': 'paymentMethod',
  'Chi cục Hải quan': 'customsOffice',
  'Tên loại hình': 'businessType',
  'Tên nước xuất khẩu': 'exportCountry',
  'Tên nước nhập khẩu': 'importCountry',
  'Số tờ khai': 'declarationNumber'
};

export async function parseFile(file: File): Promise<ExportData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        const parsedData = json.map((row) => {
          const item: Record<string, any> = {};
          Object.entries(row).forEach(([key, value]) => {
            const mappedKey = HEADER_MAP[key.trim()];
            if (mappedKey) {
              if (['year', 'month', 'day', 'exportTax', 'quantity', 'priceForeign', 'priceUsd', 'valueUsd', 'exchangeRateVnd'].includes(mappedKey as string)) {
                item[mappedKey as string] = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : (value as any);
              } else {
                item[mappedKey as string] = String(value);
              }
            }
          });
          return item as ExportData;
        });

        resolve(parsedData.filter(item => item.exporterName && item.valueUsd));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsArrayBuffer(file);
  });
}
