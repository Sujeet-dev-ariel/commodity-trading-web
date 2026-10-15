/** Shared domain types for the KKPK admin console. */

export type ScreenKey =
  | 'dash'
  | 'users'
  | 'listings'
  | 'negotiations'
  | 'trades'
  | 'settings'
  | 'audit'
  | 'freight';

export interface NavItem {
  key: ScreenKey;
  label: string;
  badge: string;
}

export interface UserRecord {
  id: number;
  firm: string;
  owner: string;
  phone: string;
  modes: string[];
  status: 'Active' | 'Pending' | 'Suspended';
  invitedBy: string;
  lastActive: string;
  paymentTerms: string;
}

export interface Invite {
  id: number;
  firm: string;
  meta: string;
  /** Backend UUID when loaded live (invites API). Local rows omit it. */
  backendId?: string;
}

export type ListingSide = 'SELL' | 'BUY';

export interface ListingRow {
  id: number;
  side: ListingSide;
  firm: string;
  subEntity: string;
  item: string;
  category: string;
  weight: string;
  price: number | null;
  status: 'Active' | 'Traded' | 'Price expired' | 'Withdrawn' | 'N/A';
  validUntil: string;
  /** Backend UUID when loaded live (listings API). Local rows omit it. */
  backendId?: string;
}

export interface NegoMessage {
  who: string;
  side: 'buyer' | 'seller' | 'admin';
  price: string;
  time: string;
}

export interface Negotiation {
  id: number;
  item: string;
  seller: string;
  buyer: string;
  bags: number;
  standing: number;
  state: 'Active' | 'Stalled' | 'Near expiry' | 'Completed';
  expiry: string;
  urgent: boolean;
  thread: NegoMessage[];
}

export interface Trade {
  code: string;
  item: string;
  seller: string;
  buyer: string;
  bags: number;
  price: number;
  broker: string;
}

export interface Broker {
  name: string;
  phone: string;
}

export interface FreightRoute {
  id: number;
  origin: string;
  dest: string;
  low: number;
  high: number;
  capacity: string;
  status: 'Published' | 'Pending review';
}

export interface AuditEntry {
  when: string;
  admin: string;
  action: string;
  entity: string;
  before: string;
  after: string;
}

export interface QueueItem {
  count: string;
  title: string;
  meta: string;
  action: string;
  target: ScreenKey;
  tone: 'info' | 'warn' | 'bad';
}

export interface ActivityItem {
  time: string;
  text: string;
}
