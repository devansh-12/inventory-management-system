import type { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
}

export interface Receipt {
  id: string;
  reference: string;
  from: string;
  to: string;
  contact: string;
  scheduleDate: string | null;
  status: 'Ready' | 'Draft' | 'In Progress' | 'Done' | 'Cancelled';
  responsible?: string;
  products?: Product[];
}

export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
}

export interface Contact {
  id: number;
  name: string;
}

export interface Warehouse {
  id: number;
  name: string;
  short_code: string;
}
