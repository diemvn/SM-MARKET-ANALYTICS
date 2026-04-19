/**
 * Logic to automatically extract a "Product Name" from a long "Goods Description".
 * This uses keyword matching for common Vietnamese export categories.
 */

const PRODUCT_KEYWORDS = [
  // Seafood
  { name: 'Cá tra', keywords: ['cá tra', 'pangasius'] },
  { name: 'Cá basa', keywords: ['cá basa', 'basa'] },
  { name: 'Cá ngừ', keywords: ['cá ngừ', 'tuna'] },
  { name: 'Tôm sú', keywords: ['tôm sú', 'black tiger'] },
  { name: 'Tôm thẻ', keywords: ['tôm thẻ', 'vannamei'] },
  { name: 'Tôm hùm', keywords: ['tôm hùm', 'lobster'] },
  { name: 'Cua/Ghẹ', keywords: ['cua', 'ghẹ', 'crab'] },
  { name: 'Mực/Bạch tuộc', keywords: ['mực', 'squid', 'cuttlefish', 'bạch tuộc', 'octopus'] },
  
  // Agriculture
  { name: 'Gạo', keywords: ['gạo', 'rice'] },
  { name: 'Cà phê', keywords: ['cà phê', 'coffee'] },
  { name: 'Hạt điều', keywords: ['điều', 'cashew'] },
  { name: 'Hạt tiêu', keywords: ['tiêu', 'pepper'] },
  { name: 'Trà/Chè', keywords: ['trà', 'chè', 'tea'] },
  { name: 'Cao su', keywords: ['cao su', 'rubber'] },
  { name: 'Sắn/Khoai mì', keywords: ['sắn', 'cassava', 'khoai mì'] },
  { name: 'Bắp/Ngô', keywords: ['bắp', 'ngô', 'corn', 'maize'] },
  
  // Fruits & Veggies
  { name: 'Thanh long', keywords: ['thanh long', 'dragon fruit'] },
  { name: 'Sầu riêng', keywords: ['sầu riêng', 'durian'] },
  { name: 'Xoài', keywords: ['xoài', 'mango'] },
  { name: 'Dừa', keywords: ['dừa', 'coconut'] },
  { name: 'Chuối', keywords: ['chuối', 'banana'] },
  { name: 'Mít', keywords: ['mít', 'jackfruit'] },
  { name: 'Vải thiều', keywords: ['vải thiều', 'lychee'] },
  { name: 'Chanh dây', keywords: ['chanh dây', 'passion fruit'] },
  { name: 'Dưa hấu', keywords: ['dưa hấu', 'watermelon'] },
  { name: 'Cam', keywords: ['nước cam', 'quả cam', 'orange'] },
  { name: 'Ổi', keywords: ['nước ổi', 'quả ổi', 'guava'] },
  { name: 'Dứa/Thơm', keywords: ['nước dứa', 'nước thơm', 'quả dứa', 'quả thơm', 'pineapple'] },
  
  // Beverages
  { name: 'Nước ép', keywords: ['nước ép', 'fruit juice', 'juice'] },
  { name: 'Nước giải khát', keywords: ['nước giải khát', 'beverage', 'drink'] },
  
  // Manufacturing
  { name: 'May mặc', keywords: ['áo', 'quần', 'vải', 'may mặc', 'textile', 'garment'] },
  { name: 'Giày dép', keywords: ['giày', 'dép', 'footwear', 'shoes'] },
  { name: 'Gỗ', keywords: ['gỗ', 'wood', 'furniture'] },
  { name: 'Điện tử', keywords: ['điện tử', 'linh kiện', 'electronics'] },
  { name: 'Cơ khí', keywords: ['máy móc', 'cơ khí', 'machinery'] }
];

export function extractProductName(description: string): string {
  if (!description) return 'Khác';
  
  // 1. Pre-cleaning: Remove leading codes/brands (sequences of uppercase letters/numbers at start)
  let cleanedDesc = description.trim();
  
  // Remove leading all-caps codes that are attached to the next word (even short ones like 'A')
  // e.g. "AMEUSANước" -> "Nước", "ANước" -> "Nước"
  cleanedDesc = cleanedDesc.replace(/^[A-Z0-9]+(?=[A-Z][a-z\u00C0-\u1EF9])/, '');
  
  // Remove leading all-caps codes followed by space
  // e.g. "CCCAUS Nước dưa hấu" -> "Nước dưa hấu"
  cleanedDesc = cleanedDesc.replace(/^[A-Z0-9]{2,}\s+/, '');

  const lowerDesc = cleanedDesc.toLowerCase();
  
  // 2. Try to find a match in our keyword list
  for (const product of PRODUCT_KEYWORDS) {
    if (product.keywords.some(k => lowerDesc.includes(k))) {
      // If it's a specific fruit juice, we'd like to return "Nước ép [Trái cây]"
      // but simpler for now: just return the specific category
      return product.name;
    }
  }
  
  // 3. Fallback: Clean up and take first few words
  const words = cleanedDesc
    .replace(/[^\p{L}\s]/gu, ' ') // Replace non-letters with spaces
    .split(/\s+/)
    .filter(word => word.length > 1);

  // If the first word is still all caps and we have more words, skip it or trim it
  if (words.length > 1 && words[0] === words[0].toUpperCase() && words[0].length > 3) {
    words.shift();
  }

  const final = words.slice(0, 3).join(' ');
  return final || 'Khác';
}

/**
 * Logic to extract packaging specification (quy cách đóng gói) from description.
 * Looks for patterns like "330ml x 24 lon", "1kg/gói", etc.
 */
export function extractPackageSpec(description: string): string {
  if (!description) return 'N/A';
  
  const lowerDesc = description.toLowerCase();
  
  // Patterns for packaging
  const patterns = [
    // Volume/Weight x Quantity (e.g., 330ml x 24, 500g*12)
    /(\d+\s*(ml|l|g|kg|pcs|gr|lb|oz)\s*[x*]\s*\d+)/i,
    // Quantity per container (e.g., 24 lon/thùng)
    /(\d+\s*(lon|chai|bao|gói|hộp|thùng|cái|chiếc)\s*\/\s*(thùng|bao|kiện))/i,
    // Size/Weight alone (e.g., loại 1kg, 500ml)
    /(loại|quy cách|đóng)\s*[:\s]*(\d+\s*(ml|l|g|kg|gr))/i,
    // Catch-all for simple volume/weight at end or middle
    /(\d+\s*(ml|l|g|kg|gr|thùng|lon|chai|bao|gói|hộp))/i
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      // Return the first captured group or the whole match
      return match[0].trim();
    }
  }

  // Common keywords if regex fails
  const keywords = ['thùng', 'lon', 'chai', 'bao', 'gói', 'hộp', 'kiện', 'khay', 'túi'];
  for (const kw of keywords) {
    if (lowerDesc.includes(kw)) {
      // Find the word with the keyword and maybe some numbers around it
      const regex = new RegExp(`(\\d+\\s*)?${kw}(\\s*\\d+)?`, 'i');
      const match = description.match(regex);
      if (match) return match[0].trim();
    }
  }

  return 'Theo mô tả';
}
