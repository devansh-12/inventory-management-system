import type { LucideIcon } from 'lucide-react';

export interface KPIData {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

export interface RecentActivity {
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment' | 'alert';
  action: string;
  user: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

export interface Alert {
  sku: string;
  product: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  issue: string;
}

export interface WarehouseData {
  name: string;
  stock: string;
  lowStock: number;
  operations: number;
  status: 'normal' | 'high' | 'low';
}

export interface FastMovingItem {
  name: string;
  sku: string;
  moved: number;
  trend: string;
}

export interface WarehouseLocation {
  name: string;
  city: string;
  coordinates: [number, number];
  operations: number;
  status: 'normal' | 'warning' | 'critical';
  inbound: number;
  outbound: number;
}

export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

