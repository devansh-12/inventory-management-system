export interface MoveHistoryItem {
  id: string;
  reference: string;
  product: string;
  productCode: string;
  sku: string;
  from: string;
  to: string;
  quantity: number;
  date: string;
  user: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  direction: 'in' | 'out';
}

