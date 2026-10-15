/**
 * Seed data converted 1:1 from the standalone admin panel's embedded script.
 * This is local-only mock data. It lives here (not in services/) so a real
 * backend can replace it without touching components.
 */
import type {
  ActivityItem,
  AuditEntry,
  Broker,
  FreightRoute,
  Invite,
  ListingRow,
  NavItem,
  Negotiation,
  QueueItem,
  Trade,
  UserRecord,
} from '../types';

export const CATEGORIES = ['Besan', 'Dal', 'Matar', 'Chana', 'Rajma', 'Rice'];

export const NAV: NavItem[] = [
  { key: 'dash', label: 'Dashboard', badge: '' },
  { key: 'users', label: 'Users', badge: '3' },
  { key: 'listings', label: 'Listings', badge: '' },
  { key: 'negotiations', label: 'Negotiations', badge: '4' },
  { key: 'trades', label: 'Trades & brokerage', badge: '' },
  { key: 'settings', label: 'Settings', badge: '' },
  { key: 'audit', label: 'Audit log', badge: '' },
  { key: 'freight', label: 'Freight', badge: '' },
];

export const PAGES: Record<string, [string, string, string]> = {
  dash: ['Dashboard', 'Sunday, 9 August · market open', 'Export day sheet'],
  users: ['Users & access', 'Invite-only platform. A user can hold both modes.', 'Export user list'],
  listings: ['Listings oversight', 'Sell listings and buy requirements in one table', 'Export CSV'],
  negotiations: ['Negotiations', 'Live offer threads between buyers and sellers', 'Export thread'],
  trades: ['Trades & brokerage', 'Closed trades and what each broker earned', 'Log offline trade'],
  settings: ['Settings', 'Platform-wide rules and taxonomy', 'Save changes'],
  audit: ['Audit log', 'Every admin action, attributable and reversible', 'Export log'],
  freight: ['Freight management', 'Origin → destination road-freight rates, per quintal', 'Upload freight sheet'],
};

export const SEED_USERS: UserRecord[] = [
  { id: 1, firm: 'Rajat SP Co Commodities Pvt Ltd', owner: 'Kunj Bihari', phone: '98108 71966', modes: ['Seller'], status: 'Active', invitedBy: 'Kunj Bihari', lastActive: '11:20 AM', paymentTerms: '' },
  { id: 2, firm: 'Kuber Marketing', owner: 'Kunj Bihari · sub-entity', phone: '98108 71967', modes: ['Seller'], status: 'Active', invitedBy: 'Kunj Bihari', lastActive: '09:35 AM', paymentTerms: '' },
  { id: 3, firm: 'Ismail Enterprises', owner: 'Waseem Ahmed', phone: '99100 22334', modes: ['Buyer'], status: 'Active', invitedBy: 'Ratan', lastActive: '10:52 AM', paymentTerms: '8-10 days' },
  { id: 4, firm: 'Mohd Akbar Farooq Ahmad', owner: 'Mahesh Gupta', phone: '98111 40522', modes: ['Buyer', 'Seller'], status: 'Active', invitedBy: 'Kunj Bihari', lastActive: '11:04 AM', paymentTerms: '10-15 days' },
  { id: 5, firm: 'GH Mohi-ud-Din Mir & Co', owner: 'Dinesh Agarwal', phone: '95602 71188', modes: ['Buyer', 'Seller'], status: 'Pending', invitedBy: 'Sanjay', lastActive: '—', paymentTerms: '15-20 days' },
  { id: 6, firm: 'Nagesh Trading Co', owner: 'Praveen Bansal', phone: '98730 55410', modes: ['Seller'], status: 'Active', invitedBy: 'Kunj Bihari', lastActive: 'Yesterday', paymentTerms: '' },
  { id: 7, firm: 'Mehraj ud Din & Co', owner: 'Sunil Yadav', phone: '90045 66271', modes: ['Buyer'], status: 'Suspended', invitedBy: 'Naveen', lastActive: '8 Aug', paymentTerms: '8-10 days' },
];

export const SEED_INVITES: Invite[] = [
  { id: 1, firm: 'Maheshwari Dal Udyog', meta: '+91 98290 41155 · sent 2 days ago by Kunj Bihari' },
  { id: 2, firm: 'Sethi Brothers', meta: '+91 99711 08823 · sent yesterday by Ratan' },
  { id: 3, firm: 'Agarwal Pulses', meta: '+91 97112 66004 · sent 4 hours ago by Kunj Bihari' },
];

export const SEED_ROWS: ListingRow[] = [
  { id: 1, side: 'SELL', firm: 'Rajat SP Co Commodities Pvt Ltd', subEntity: '', item: 'Disco', category: 'Rajma', weight: '30KG', price: 12600, status: 'Active', validUntil: 'until 2:00 AM' },
  { id: 2, side: 'SELL', firm: 'Rajat SP Co Commodities Pvt Ltd', subEntity: '', item: 'Bohon', category: 'Rajma', weight: '30KG', price: 12300, status: 'Traded', validUntil: 'closed 4:55 PM' },
  { id: 3, side: 'SELL', firm: 'Kuber Marketing', subEntity: 'sub-entity of Rajat SP Co.', item: 'Kabli Chana', category: 'Chana', weight: '30KG', price: 7550, status: 'Active', validUntil: 'until 2:00 AM' },
  { id: 4, side: 'SELL', firm: 'Nagesh Trading Co', subEntity: '', item: 'Kabli Chana', category: 'Chana', weight: '30KG', price: 8000, status: 'Active', validUntil: 'until 2:00 AM' },
  { id: 5, side: 'SELL', firm: 'Rajat SP Co Commodities Pvt Ltd', subEntity: '', item: 'Malka Masoor', category: 'Dal', weight: '30KG', price: null, status: 'Active', validUntil: 'until 2:00 AM' },
  { id: 6, side: 'SELL', firm: 'Kuber Marketing', subEntity: 'sub-entity of Rajat SP Co.', item: 'Besan', category: 'Besan', weight: '35KG', price: 2630, status: 'Price expired', validUntil: 'expired 2:00 AM' },
  { id: 7, side: 'BUY', firm: 'Mohd Akbar Farooq Ahmad', subEntity: '50 bags wanted', item: 'Kabli Chana', category: 'Chana', weight: '30KG', price: 7800, status: 'Active', validUntil: 'until 2:00 AM' },
  { id: 8, side: 'BUY', firm: 'GH Mohi-ud-Din Mir & Co', subEntity: '30 bags wanted', item: 'Matar White', category: 'Matar', weight: '30KG', price: 4700, status: 'Active', validUntil: 'until 2:00 AM' },
  { id: 9, side: 'BUY', firm: 'Ismail Enterprises', subEntity: '40 bags wanted', item: 'Kabli Chana', category: 'Chana', weight: '30KG', price: 7200, status: 'Withdrawn', validUntil: 'pulled 10:10 AM' },
  { id: 10, side: 'BUY', firm: 'Mohd Akbar Farooq Ahmad', subEntity: '20 bags wanted', item: 'Disco', category: 'Rajma', weight: '30KG', price: 12300, status: 'Traded', validUntil: 'closed 11:20 AM' },
];

export const SEED_NEGOTIATIONS: Negotiation[] = [
  { id: 1, item: 'Kabli Chana', seller: 'Nagesh Trading Co', buyer: 'Mohd Akbar Farooq Ahmad', bags: 50, standing: 7900, state: 'Active', expiry: 'expires in 3h 12m', urgent: false,
    thread: [
      { who: 'Mohd Akbar Farooq Ahmad (buyer)', side: 'buyer', price: '₹7,800', time: '10:52 AM · opening offer' },
      { who: 'Nagesh Trading Co (seller)', side: 'seller', price: '₹8,000', time: '10:58 AM · counter' },
      { who: 'Mohd Akbar Farooq Ahmad (buyer)', side: 'buyer', price: '₹7,850', time: '11:01 AM · counter' },
      { who: 'Nagesh Trading Co (seller)', side: 'seller', price: '₹7,900', time: '11:04 AM · standing offer' },
    ] },
  { id: 2, item: 'Matar White', seller: 'GH Mohi-ud-Din Mir & Co', buyer: 'Ismail Enterprises', bags: 30, standing: 4780, state: 'Stalled', expiry: 'no reply for 2h 40m', urgent: true,
    thread: [
      { who: 'Ismail Enterprises (buyer)', side: 'buyer', price: '₹4,700', time: '08:20 AM · opening offer' },
      { who: 'GH Mohi-ud-Din Mir & Co (seller)', side: 'seller', price: '₹4,780', time: '08:31 AM · standing offer' },
    ] },
  { id: 3, item: 'Disco', seller: 'Rajat SP Co Commodities Pvt Ltd', buyer: 'Mohd Akbar Farooq Ahmad', bags: 20, standing: 12450, state: 'Near expiry', expiry: 'expires in 34m', urgent: true,
    thread: [
      { who: 'Mohd Akbar Farooq Ahmad (buyer)', side: 'buyer', price: '₹12,300', time: '10:44 AM · opening offer' },
      { who: 'Rajat SP Co Commodities Pvt Ltd (seller)', side: 'seller', price: '₹12,600', time: '10:51 AM · counter' },
      { who: 'Mohd Akbar Farooq Ahmad (buyer)', side: 'buyer', price: '₹12,450', time: '11:12 AM · standing offer' },
    ] },
  { id: 4, item: 'Besan', seller: 'Kuber Marketing', buyer: 'Ismail Enterprises', bags: 60, standing: 2630, state: 'Completed', expiry: 'accepted 12:08 PM', urgent: false,
    thread: [
      { who: 'Ismail Enterprises (buyer)', side: 'buyer', price: '₹2,580', time: '11:40 AM · opening offer' },
      { who: 'Kuber Marketing (seller)', side: 'seller', price: '₹2,630', time: '11:52 AM · counter' },
      { who: 'Ismail Enterprises (buyer)', side: 'buyer', price: '₹2,630', time: '12:08 PM · accepted' },
    ] },
];

export const SEED_TRADES: Trade[] = [
  { code: 'TR-4181', item: 'Disco', seller: 'Rajat SP Co Commodities Pvt Ltd', buyer: 'Mohd Akbar Farooq Ahmad', bags: 20, price: 12450, broker: 'Ratan' },
  { code: 'TR-4180', item: 'Kabli Chana', seller: 'Nagesh Trading Co', buyer: 'Mohd Akbar Farooq Ahmad', bags: 50, price: 7900, broker: 'Sanjay' },
  { code: 'TR-4179', item: 'Matar White', seller: 'GH Mohi-ud-Din Mir & Co', buyer: 'Ismail Enterprises', bags: 30, price: 4780, broker: 'Self' },
  { code: 'TR-4178', item: 'Kabli Chana', seller: 'Kuber Marketing', buyer: 'Mehraj ud Din & Co', bags: 40, price: 7480, broker: 'Naveen' },
  { code: 'TR-4177', item: 'Bohon', seller: 'Rajat SP Co Commodities Pvt Ltd', buyer: 'GH Mohi-ud-Din Mir & Co', bags: 25, price: 12250, broker: 'Ratan' },
  { code: 'TR-4176', item: 'Malka Masoor', seller: 'Nagesh Trading Co', buyer: 'Mohd Akbar Farooq Ahmad', bags: 15, price: 6300, broker: 'Mukesh (typed)' },
  { code: 'TR-4175', item: 'Besan', seller: 'Kuber Marketing', buyer: 'Ismail Enterprises', bags: 60, price: 2630, broker: 'Sanjay' },
];

export const SEED_BROKERS: Broker[] = [
  { name: 'Ratan', phone: '98108 71966' },
  { name: 'Sanjay', phone: '76658 99003' },
  { name: 'Naveen', phone: '89502 78270' },
];

export const FREIGHT_STATES = ['Punjab', 'Haryana', 'Rajasthan', 'J&K'];

export const SEED_FREIGHT: FreightRoute[] = [
  { id: 1, origin: 'Punjab', dest: 'Kandla Port', low: 160, high: 165, capacity: '30-35 MT', status: 'Published' },
  { id: 2, origin: 'Punjab', dest: 'Mundra Port', low: 170, high: 178, capacity: '30-35 MT', status: 'Published' },
  { id: 3, origin: 'Punjab', dest: 'Pipavav Port', low: 200, high: 205, capacity: '25-30 MT', status: 'Published' },
  { id: 4, origin: 'Punjab', dest: 'Nhava Sheva', low: 210, high: 210, capacity: '30-35 MT', status: 'Published' },
  { id: 5, origin: 'Haryana', dest: 'Kandla Port', low: 150, high: 155, capacity: '30-35 MT', status: 'Published' },
  { id: 6, origin: 'Haryana', dest: 'Mundra Port', low: 160, high: 165, capacity: '30-35 MT', status: 'Published' },
  { id: 7, origin: 'Haryana', dest: 'Nhava Sheva', low: 195, high: 195, capacity: '30-35 MT', status: 'Published' },
  { id: 8, origin: 'Rajasthan', dest: 'Kandla Port', low: 120, high: 125, capacity: '30-35 MT', status: 'Published' },
  { id: 9, origin: 'Rajasthan', dest: 'Mundra Port', low: 130, high: 135, capacity: '30-35 MT', status: 'Published' },
  { id: 10, origin: 'Rajasthan', dest: 'Nhava Sheva', low: 175, high: 175, capacity: '30-35 MT', status: 'Published' },
  { id: 11, origin: 'J&K', dest: 'Kandla Port', low: 210, high: 220, capacity: '25-30 MT', status: 'Pending review' },
  { id: 12, origin: 'J&K', dest: 'Mundra Port', low: 225, high: 235, capacity: '25-30 MT', status: 'Pending review' },
  { id: 13, origin: 'J&K', dest: 'Nhava Sheva', low: 260, high: 260, capacity: '25-30 MT', status: 'Pending review' },
];

export const SEED_AUDIT: AuditEntry[] = [
  { when: '09 Aug, 11:26 AM', admin: 'Kunj Bihari', action: 'Edit on behalf', entity: 'Listing · Disco', before: '₹12,600', after: '₹12,450' },
  { when: '09 Aug, 11:14 AM', admin: 'Ratan', action: 'Negotiation nudge', entity: 'NEG-3 · Mohd Akbar Farooq Ahmad', before: 'no message', after: 'relayed ₹12,450' },
  { when: '09 Aug, 10:40 AM', admin: 'Kunj Bihari', action: 'User access', entity: 'Mehraj ud Din & Co', before: 'Active', after: 'Suspended' },
  { when: '09 Aug, 09:58 AM', admin: 'Kunj Bihari', action: 'Invite sent', entity: 'Agarwal Pulses', before: '—', after: '+91 97112 66004' },
  { when: '09 Aug, 09:12 AM', admin: 'Sanjay', action: 'Edit on behalf', entity: 'Requirement · Matar White', before: '30 bags', after: '35 bags' },
  { when: '08 Aug, 06:20 PM', admin: 'Kunj Bihari', action: 'Force expire', entity: 'Listing · Besan', before: 'Active', after: 'Price expired' },
  { when: '08 Aug, 05:02 PM', admin: 'Naveen', action: 'Negotiation nudge', entity: 'NEG-1 · Nagesh Trading Co', before: 'no message', after: 'messaged seller' },
  { when: '08 Aug, 02:44 PM', admin: 'Kunj Bihari', action: 'Settings', entity: 'Commodity taxonomy', before: '15 categories', after: '16 categories' },
];

export const SEED_QUEUE: QueueItem[] = [
  { count: '3', title: 'Pending invites', meta: 'Oldest sent 2 days ago to Maheshwari Dal Udyog', action: 'Review', target: 'users', tone: 'info' },
  { count: '2', title: 'Negotiations stalled or near expiry', meta: 'Matar (no reply 2h 40m) · Rajma (34m left)', action: 'Open', target: 'negotiations', tone: 'bad' },
  { count: '1', title: 'Listing published without a price', meta: 'Malka Masoor · Rajat SP Co Commodities Pvt Ltd', action: 'Fix', target: 'listings', tone: 'warn' },
  { count: '2', title: 'Users called in for a manual edit', meta: 'Kunj Bihari wants Rajma down ₹150; Mohd Akbar Farooq Ahmad wants 35 bags', action: 'Edit', target: 'listings', tone: 'warn' },
];

export const SEED_ACTIVITY: ActivityItem[] = [
  { time: '11:20', text: 'Rajat SP Co Commodities Pvt Ltd accepted Mohd Akbar Farooq Ahmad\u2019 offer at ₹12,450 · broker Ratan' },
  { time: '11:04', text: 'Nagesh Trading Co counter-offered ₹7,900 on 50 bags of Kabli Chana' },
  { time: '10:52', text: 'Mohd Akbar Farooq Ahmad posted a requirement: 50 bags Kabli Chana at ₹7,800' },
  { time: '10:10', text: 'Ismail Enterprises withdrew its Kabli Chana requirement' },
  { time: '09:35', text: 'Kuber Marketing scanned a price sheet — 5 rows published' },
  { time: '02:00', text: 'All prices from 8 August expired automatically' },
];

export const TONE_COLOR: Record<string, string> = {
  warn: '#d98806',
  bad: '#d64545',
  info: 'var(--color-accent-600)',
};

export const STATUS_CLS: Record<string, string> = {
  Active: 'tag-accent',
  Traded: 'tag-accent-2',
  'Price expired': 'tag-neutral',
  Withdrawn: 'tag-neutral',
  Pending: 'tag-accent-2',
  Suspended: 'tag-neutral',
  'N/A': 'tag-neutral',
  Stalled: 'tag-neutral',
  'Near expiry': 'tag-accent-2',
  Completed: 'tag-accent',
};

export const SEED_PARSE_TEMPLATES = [
  { firm: 'Rajat SP Co Commodities Pvt Ltd', meta: 'v3 · learned 12 Jul · 5 columns' },
  { firm: 'Nagesh Trading Co', meta: 'v1 · learned 28 Jul · 4 columns' },
];
