export interface ExportData {
  year: number;
  month: number;
  day: number;
  exporterTaxId: string;
  exporterName: string;
  exporterAddress: string;
  exporterPhone: string;
  importerName: string;
  importerAddress: string;
  hsCode: string;
  productDescription: string;
  exportTax: number;
  origin: string;
  unit: string;
  quantity: number;
  priceForeign: number;
  priceUsd: number;
  valueUsd: number;
  exchangeRateVnd: number;
  currency: string;
  incoterms: string;
  paymentMethod: string;
  customsOffice: string;
  businessType: string;
  exportCountry: string;
  importCountry: string;
  declarationNumber: string;
  productName?: string;
  packageSpec?: string;
}

export interface PartnerStats {
  name: string;
  totalValueUsd: number;
  totalQuantity: number;
  shipmentCount: number;
}

export interface CompanyStats {
  name: string;
  taxId: string;
  totalValueUsd: number;
  totalQuantity: number;
  shipmentCount: number;
  partners: PartnerStats[];
  topHsCodes: PartnerStats[];
  topProducts?: PartnerStats[];
  topPackages?: PartnerStats[];
  markets: Set<string>;
}

export interface MarketStats {
  country: string;
  totalValueUsd: number;
  totalQuantity: number;
  shipmentCount: number;
  importers: PartnerStats[];
  exporters: Set<string>;
  topProducts?: PartnerStats[];
  topPackages?: PartnerStats[];
}
