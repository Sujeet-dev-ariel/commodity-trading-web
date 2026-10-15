import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  AuditEntry,
  Broker,
  FreightRoute,
  Invite,
  ListingRow,
  Negotiation,
  Trade,
  UserRecord,
} from '../types';
import { FREIGHT_STATES } from '../data/constants';
import { ApiError } from '../services/api';
import { authService, normalizePhone } from '../services/authService';
import {
  categoriesApi,
  commoditiesApi,
  invitesApi,
  listingsApi,
  settingsApi,
  toE164Indian,
  tosVersionsApi,
  type BackendCategory,
  type BackendCommodity,
  type BackendListing,
  type BackendListingStatus,
  type TosVersion,
} from '../services/backend';

function nextExpiryCountdown(): string {
  // Time left until 02:00 Asia/Kolkata (UTC+5:30), the daily price expiry.
  const now = new Date();
  const istNow = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  const expiry = new Date(istNow);
  expiry.setHours(2, 0, 0, 0);
  if (expiry.getTime() <= istNow.getTime()) expiry.setDate(expiry.getDate() + 1);
  const diffMs = expiry.getTime() - istNow.getTime();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  return `${h}h ${m}m`;
}

interface AdminState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  countdown: string;
  toast: string | null;
  flash: (msg: string) => void;

  users: UserRecord[];
  userFilter: string;
  setUserFilter: (f: string) => void;
  suspendUser: (id: number) => void;
  editRoles: () => void;

  invites: Invite[];
  revokeInvite: (id: number) => void;
  inviteePhone: string;
  setInviteePhone: (v: string) => void;
  inviteeFirm: string;
  setInviteeFirm: (v: string) => void;
  inviteBuyer: boolean;
  toggleInviteBuyer: () => void;
  inviteSeller: boolean;
  toggleInviteSeller: () => void;
  invitePaymentTerms: string;
  setInvitePaymentTerms: (v: string) => void;
  inviteError: string | null;
  sendInvite: () => void;

  rows: ListingRow[];
  sideFilter: string;
  setSideFilter: (f: string) => void;
  catFilter: string;
  setCatFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  editId: number | null;
  openEdit: (id: number) => void;
  closeEdit: () => void;
  editPrice: string;
  setEditPrice: (v: string) => void;
  editWeight: string;
  setEditWeight: (v: string) => void;
  editReason: string;
  setEditReason: (v: string) => void;
  editError: string | null;
  saveEdit: () => void;
  forceExpire: (id: number) => void;

  negotiations: Negotiation[];
  negoFilter: 'active' | 'done';
  setNegoFilter: (f: 'active' | 'done') => void;
  selectedNegoId: number;
  selectNego: (id: number) => void;
  nudgeMessage: string;
  setNudgeMessage: (v: string) => void;
  relayPrice: string;
  setRelayPrice: (v: string) => void;
  relaySide: 'as Seller' | 'as Buyer';
  setRelaySide: (v: 'as Seller' | 'as Buyer') => void;
  nudge: () => void;
  relay: () => void;

  trades: Trade[];
  exportCsv: (kind: 'trades' | 'listings' | 'generic', filename: string, rows: string[][]) => void;

  brokers: Broker[];
  removeBroker: (name: string) => void;
  addBroker: () => void;
  categories: string[];
  addCategory: () => void;
  newCategory: string;
  setNewCategory: (v: string) => void;
  expiryTime: string;
  setExpiryTime: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  defaultPaymentTerms: string;
  setDefaultPaymentTerms: (v: string) => void;
  saveSettings: () => void;

  audit: AuditEntry[];
  auditAdmin: string;
  setAuditAdmin: (v: string) => void;
  auditAction: string;
  setAuditAction: (v: string) => void;
  auditQuery: string;
  setAuditQuery: (v: string) => void;

  freightRoutes: FreightRoute[];
  freightOriginFilter: string;
  setFreightOriginFilter: (f: string) => void;
  freightStatusFilter: string;
  setFreightStatusFilter: (v: string) => void;
  publishPending: () => void;
  freightEditId: number | null;
  openFreightEdit: (id: number) => void;
  closeFreightEdit: () => void;
  freightEditLow: string;
  setFreightEditLow: (v: string) => void;
  freightEditHigh: string;
  setFreightEditHigh: (v: string) => void;
  freightEditCapacity: string;
  setFreightEditCapacity: (v: string) => void;
  freightEditError: string | null;
  saveFreightEdit: () => void;
  removeFreightRoute: (id: number) => void;
  newFreightOrigin: string;
  setNewFreightOrigin: (v: string) => void;
  newFreightDest: string;
  setNewFreightDest: (v: string) => void;
  newFreightLow: string;
  setNewFreightLow: (v: string) => void;
  newFreightHigh: string;
  setNewFreightHigh: (v: string) => void;
  newFreightCapacity: string;
  setNewFreightCapacity: (v: string) => void;
  newFreightError: string | null;
  addFreightRoute: () => void;
  uploadFreightSheet: () => void;

  /* ----- live backend ----- */
  /** True when VITE_API_BASE_URL is set and routes hit the real backend. */
  liveMode: boolean;
  invitesLoading: boolean;
  invitesError: string | null;
  refreshInvites: () => Promise<void>;
  listingsLoading: boolean;
  listingsError: string | null;
  listingPage: number;
  setListingPage: (p: number) => void;
  listingTotal: number;
  listingTotalPages: number;
  refreshListings: () => Promise<void>;
  settingsLoading: boolean;
  settingsError: string | null;
  refreshLiveSettings: () => Promise<void>;
  liveCategories: BackendCategory[];
  categoryError: string | null;
  renameCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
  liveCommodities: BackendCommodity[];
  commoditiesLoading: boolean;
  commodityError: string | null;
  refreshCommodities: (categoryId?: string) => Promise<void>;
  addCommodity: (categoryId: string, name: string) => Promise<void>;
  renameCommodity: (id: string, name: string, categoryId: string) => Promise<void>;
  deleteCommodity: (id: string, categoryId: string) => Promise<void>;
  tosVersions: TosVersion[];
  tosVersionsLoading: boolean;
  tosVersionsError: string | null;
  refreshTosVersions: () => Promise<void>;
  publishTosVersion: (body: { effectiveDate: string; termsUrl: string; privacyUrl: string }) => Promise<void>;
}

const AdminContext = createContext<AdminState | null>(null);

export function useAdmin(): AdminState {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}

function downloadCsv(filename: string, rows: string[][]) {
  const esc = (c: string) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const LIVE_PAGE_SIZE = 20;

const BACKEND_STATUS_LABEL: Record<BackendListingStatus, ListingRow['status']> = {
  active: 'Active',
  price_expired: 'Price expired',
  na: 'N/A',
  withdrawn: 'Withdrawn',
  traded: 'Traded',
};

const UI_STATUS_PARAM: Record<string, string> = {
  Active: 'active',
  'Price expired': 'price_expired',
  Traded: 'traded',
  Withdrawn: 'withdrawn',
  'N/A': 'na',
};

function mapBackendListing(b: BackendListing, index: number, categoryName: (id: string) => string): ListingRow {
  const valid = b.priceValidUntil ? new Date(b.priceValidUntil) : null;
  return {
    id: index + 1,
    backendId: b.id,
    side: b.side,
    firm: b.user?.firmName || b.user?.name || '—',
    subEntity: b.user?.phone ?? '',
    item: b.itemName,
    category: categoryName(b.categoryId),
    weight: b.weightKg != null ? `${b.weightKg}KG` : '—',
    price: b.price,
    status: BACKEND_STATUS_LABEL[b.status] ?? 'Active',
    validUntil: valid && !Number.isNaN(valid.getTime())
      ? `until ${valid.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })}`
      : BACKEND_STATUS_LABEL[b.status] ?? '',
  };
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState(nextExpiryCountdown);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userFilter, setUserFilter] = useState('all');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteePhone, setInviteePhone] = useState('');
  const [inviteeFirm, setInviteeFirm] = useState('');
  const [inviteBuyer, setInviteBuyer] = useState(true);
  const [inviteSeller, setInviteSeller] = useState(false);
  const [invitePaymentTerms, setInvitePaymentTerms] = useState('10-15 days');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [rows, setRows] = useState<ListingRow[]>([]);
  const [sideFilter, setSideFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [editId, setEditId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [negoFilter, setNegoFilter] = useState<'active' | 'done'>('active');
  const [selectedNegoId, setSelectedNegoId] = useState(0);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [relayPrice, setRelayPrice] = useState('');
  const [relaySide, setRelaySide] = useState<'as Seller' | 'as Buyer'>('as Seller');

  // No trades endpoint on the backend yet — closed trades are recorded here
  // once the trade flow exists. Starts empty; never seeded.
  const [trades] = useState<Trade[]>([]);

  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [expiryTime, setExpiryTime] = useState('02:00');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('10-15 days');

  // Session-local audit trail (no audit-log endpoint on the backend yet).
  // Starts empty; entries are appended as the admin acts this session.
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [auditAdmin, setAuditAdmin] = useState('All admins');
  const [auditAction, setAuditAction] = useState('All actions');
  const [auditQuery, setAuditQuery] = useState('');

  // No freight endpoint on the backend yet — routes entered here live in
  // local state only. Starts empty; never seeded.
  const [freightRoutes, setFreightRoutes] = useState<FreightRoute[]>([]);
  const [freightOriginFilter, setFreightOriginFilter] = useState('All');
  const [freightStatusFilter, setFreightStatusFilter] = useState('All statuses');
  const [freightEditId, setFreightEditId] = useState<number | null>(null);
  const [freightEditLow, setFreightEditLow] = useState('');
  const [freightEditHigh, setFreightEditHigh] = useState('');
  const [freightEditCapacity, setFreightEditCapacity] = useState('');
  const [freightEditError, setFreightEditError] = useState<string | null>(null);
  const [newFreightOrigin, setNewFreightOrigin] = useState(FREIGHT_STATES[0]);
  const [newFreightDest, setNewFreightDest] = useState('');
  const [newFreightLow, setNewFreightLow] = useState('');
  const [newFreightHigh, setNewFreightHigh] = useState('');
  const [newFreightCapacity, setNewFreightCapacity] = useState('');
  const [newFreightError, setNewFreightError] = useState<string | null>(null);

  /* ----- live backend state (used only when VITE_API_BASE_URL is set) ----- */
  const [liveMode] = useState(() => !authService.isDemoMode());
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesError, setInvitesError] = useState<string | null>(null);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [listingPage, setListingPage] = useState(1);
  const [listingTotal, setListingTotal] = useState(0);
  const [listingTotalPages, setListingTotalPages] = useState(0);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [liveCategories, setLiveCategories] = useState<BackendCategory[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [liveCommodities, setLiveCommodities] = useState<BackendCommodity[]>([]);
  const [commoditiesLoading, setCommoditiesLoading] = useState(false);
  const [commodityError, setCommodityError] = useState<string | null>(null);
  const [tosVersions, setTosVersions] = useState<TosVersion[]>([]);
  const [tosVersionsLoading, setTosVersionsLoading] = useState(false);
  const [tosVersionsError, setTosVersionsError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setCountdown(nextExpiryCountdown()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const logAudit = useCallback((entry: Omit<AuditEntry, 'when'>) => {
    const when = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit',
    });
    setAudit((prev) => [{ ...entry, when }, ...prev]);
  }, []);

  /* ================= live backend integration =================
     All routes below are verified against D:\Tradding_backend\routes.
     Admin-only enforcement happens server-side (requireRole(['admin']));
     the UI additionally gates on the session's roles (see RequireAdmin)
     and surfaces backend 403s honestly. Endpoints the backend does not
     expose (user directory/suspend, negotiations, trades, freight, audit
     log, brokers) intentionally keep local state, starting empty — the
     console never shows invented rows. */
  const liveCategoriesRef = useRef<BackendCategory[]>([]);

  const liveErr = (e: unknown, fallback: string) =>
    e instanceof ApiError ? e.message : fallback;

  const ensureCategories = useCallback(async (): Promise<BackendCategory[]> => {
    if (liveCategoriesRef.current.length) return liveCategoriesRef.current;
    const { data } = await categoriesApi.list(undefined, 100);
    liveCategoriesRef.current = data;
    setLiveCategories(data);
    setCategories(data.map((c) => c.name));
    return data;
  }, []);

  const refreshInvites = useCallback(async () => {
    if (!liveMode) return;
    setInvitesLoading(true);
    setInvitesError(null);
    try {
      const { data } = await invitesApi.list({ status: 'pending', limit: 100 });
      setInvites(data.map((inv, i) => ({
        id: i + 1,
        backendId: inv.id,
        firm: inv.phone,
        meta: `${inv.roleHint} · invited ${new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`,
      })));
    } catch (e) {
      setInvites([]);
      setInvitesError(liveErr(e, 'Could not load invites from the backend.'));
    } finally {
      setInvitesLoading(false);
    }
  }, [liveMode]);

  const refreshListings = useCallback(async () => {
    if (!liveMode) return;
    setListingsLoading(true);
    setListingsError(null);
    try {
      const cats = await ensureCategories();
      const nameOf = (id: string) => cats.find((c) => c.id === id)?.name ?? '—';
      const catId = cats.find((c) => c.name === catFilter)?.id;
      const statusParam = statusFilter === 'All statuses'
        ? 'active,price_expired,na,withdrawn,traded'
        : (UI_STATUS_PARAM[statusFilter] ?? 'active');
      const sides = sideFilter === 'all' ? ['SELL', 'BUY'] as const : [sideFilter as 'SELL' | 'BUY'];
      const combined: ListingRow[] = [];
      let total = 0;
      let pages = 0;
      for (const side of sides) {
        const { data, meta } = await listingsApi.list({
          side,
          status: statusParam,
          categoryId: catId,
          itemName: searchQuery.trim() || undefined,
          page: listingPage,
          limit: LIVE_PAGE_SIZE,
        });
        total += meta?.total ?? data.length;
        pages = Math.max(pages, meta?.totalPages ?? 1);
        data.forEach((b, i) => combined.push(mapBackendListing(b, combined.length + i, nameOf)));
      }
      if (!total) {
        setRows([]);
        setListingTotal(0);
        setListingTotalPages(0);
        return;
      }
      setRows(combined);
      setListingTotal(total);
      setListingTotalPages(pages);
    } catch (e) {
      setRows([]);
      setListingTotal(0);
      setListingTotalPages(0);
      setListingsError(liveErr(e, 'Could not load listings from the backend.'));
    } finally {
      setListingsLoading(false);
    }
  }, [liveMode, sideFilter, statusFilter, catFilter, listingPage, searchQuery, ensureCategories]);

  const refreshLiveSettings = useCallback(async () => {
    if (!liveMode) return;
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      try {
        const s = await settingsApi.getByKey('price_expiry_time');
        const t = (s.value as { time?: unknown } | null)?.time;
        if (typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t)) setExpiryTime(t);
      } catch (e) {
        // A missing row (404) just means "not configured yet" — keep 02:00.
        if (!(e instanceof ApiError && e.status === 404)) throw e;
      }
      await ensureCategories();
    } catch (e) {
      setSettingsError(liveErr(e, 'Could not load settings from the backend.'));
    } finally {
      setSettingsLoading(false);
    }
  }, [liveMode, ensureCategories]);

  const refreshCommodities = useCallback(async (categoryId?: string) => {
    if (!liveMode) return;
    setCommoditiesLoading(true);
    setCommodityError(null);
    try {
      const { data } = await commoditiesApi.list(categoryId, undefined, 100);
      setLiveCommodities(data);
    } catch (e) {
      setCommodityError(liveErr(e, 'Could not load items.'));
    } finally {
      setCommoditiesLoading(false);
    }
  }, [liveMode]);

  const addCommodity = useCallback(async (categoryId: string, name: string) => {
    await commoditiesApi.create(categoryId, name.trim());
    await refreshCommodities(categoryId);
    flash('Item added');
  }, [refreshCommodities, flash]);

  const renameCommodity = useCallback(async (id: string, name: string, categoryId: string) => {
    await commoditiesApi.update(id, { name: name.trim() });
    await refreshCommodities(categoryId);
    flash('Item renamed');
  }, [refreshCommodities, flash]);

  const deleteCommodity = useCallback(async (id: string, categoryId: string) => {
    await commoditiesApi.remove(id);
    await refreshCommodities(categoryId);
    flash('Item deleted');
  }, [refreshCommodities, flash]);

  const refreshTosVersions = useCallback(async () => {
    if (!liveMode) return;
    setTosVersionsLoading(true);
    setTosVersionsError(null);
    try {
      const { data } = await tosVersionsApi.list(1, 20);
      setTosVersions(data);
    } catch (e) {
      setTosVersionsError(liveErr(e, 'Could not load terms versions.'));
    } finally {
      setTosVersionsLoading(false);
    }
  }, [liveMode]);

  const publishTosVersion = useCallback(async (body: { effectiveDate: string; termsUrl: string; privacyUrl: string }) => {
    await tosVersionsApi.publish(body);
    await refreshTosVersions();
    flash('Terms version published — users will re-accept on next login');
  }, [refreshTosVersions, flash]);

  const suspendUser = useCallback((id: number) => {
    setUsers((prev) => {
      const target = prev.find((u) => u.id === id);
      if (target) {
        logAudit({
          admin: 'Kunj Bihari', action: 'User access', entity: target.firm,
          before: target.status, after: target.status === 'Suspended' ? 'Active' : 'Suspended',
        });
      }
      return prev.map((u) => (u.id === id
        ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' }
        : u));
    });
    flash(liveMode
      ? 'Changed locally only — the backend exposes no user suspend endpoint yet'
      : 'Access updated — logged to the audit trail');
  }, [flash, logAudit, liveMode]);

  const editRoles = useCallback(() => {
    flash('Role editor opens here — buyer, seller, or both');
  }, [flash]);

  const revokeInvite = useCallback((id: number) => {
    if (liveMode) {
      const target = invites.find((i) => i.id === id);
      if (!target?.backendId) {
        flash('This invite has no backend id — reload the list.');
        return;
      }
      void (async () => {
        try {
          await invitesApi.cancel(target.backendId as string);
          await refreshInvites();
          flash('Invite revoked');
        } catch (e) {
          flash(liveErr(e, 'Revoke failed.'));
        }
      })();
      return;
    }
    setInvites((prev) => prev.filter((i) => i.id !== id));
    flash('Invite revoked');
  }, [flash, liveMode, invites, refreshInvites]);

  const sendInvite = useCallback(async () => {
    const digits = normalizePhone(inviteePhone);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setInviteError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!liveMode && !inviteeFirm.trim()) {
      setInviteError('Enter the firm name.');
      return;
    }
    if (!inviteBuyer && !inviteSeller) {
      setInviteError('Pick at least one mode (Buyer or Seller).');
      return;
    }
    setInviteError(null);
    if (liveMode) {
      // Backend invites store phone + a single roleHint only (no firm name,
      // no payment terms) — invite.service.js.
      const roleHint = !inviteBuyer && inviteSeller ? 'seller' : 'buyer';
      try {
        await invitesApi.send(toE164Indian(digits), roleHint);
        await refreshInvites();
        setInviteePhone('');
        setInviteeFirm('');
        flash('Invite sent — they can sign in with OTP straight away');
      } catch (e) {
        setInviteError(liveErr(e, 'Send failed.'));
      }
      return;
    }
    const modes: string[] = [];
    if (inviteBuyer) modes.push('Buyer');
    if (inviteSeller) modes.push('Seller');
    setInvites((prev) => [
      { id: Math.max(0, ...prev.map((i) => i.id)) + 1, firm: inviteeFirm.trim(), meta: `+91 ${digits} · sent just now by Kunj Bihari` },
      ...prev,
    ]);
    logAudit({
      admin: 'Kunj Bihari', action: 'Invite sent', entity: inviteeFirm.trim(),
      before: '—', after: `+91 ${digits} · ${modes.join(', ')}`,
    });
    setInviteePhone('');
    setInviteeFirm('');
    flash('Invite sent — they can sign in with OTP straight away');
  }, [inviteePhone, inviteeFirm, inviteBuyer, inviteSeller, flash, logAudit, liveMode, refreshInvites]);

  const openEdit = useCallback((id: number) => {
    const r = rows.find((x) => x.id === id);
    setEditId(id);
    setEditPrice(r && r.price != null ? String(r.price) : '');
    setEditWeight(r ? r.weight : '');
    setEditReason('');
    setEditError(null);
  }, [rows]);

  const closeEdit = useCallback(() => {
    setEditId(null);
    setEditError(null);
  }, []);

  const saveEdit = useCallback(async () => {
    if (editId == null) return;
    if (liveMode) {
      // PATCH /listings/:id is owner-only on the backend and price is sticky
      // (never null). There is no admin edit-on-behalf endpoint, so a 403
      // here is the backend's real answer — surfaced, not hidden.
      const target = rows.find((r) => r.id === editId);
      if (!target?.backendId) {
        setEditError('This row has no backend id — reload the list.');
        return;
      }
      const price = Number(editPrice.trim());
      if (editPrice.trim() === '' || !Number.isFinite(price) || price <= 0) {
        setEditError('Enter a positive price — the backend does not allow clearing it.');
        return;
      }
      const patch: { price: number; weightKg?: number } = { price };
      if (target.side === 'SELL' && editWeight.trim()) {
        const kg = Number(editWeight.replace(/[^0-9]/g, ''));
        if (!Number.isInteger(kg) || kg <= 0) {
          setEditError('Weight must be a positive whole-kg number (e.g. 30KG).');
          return;
        }
        patch.weightKg = kg;
      }
      if (!editReason.trim()) {
        setEditError('Add a reason — it is written to the audit log.');
        return;
      }
      try {
        setEditError(null);
        await listingsApi.update(target.backendId, patch);
        logAudit({
          admin: 'Kunj Bihari', action: 'Edit on behalf',
          entity: `${target.side === 'BUY' ? 'Requirement' : 'Listing'} · ${target.item}`,
          before: target.price == null ? 'N/A' : `₹${target.price.toLocaleString('en-IN')}`,
          after: `₹${price.toLocaleString('en-IN')}`,
        });
        setEditId(null);
        setEditReason('');
        flash('Saved to the backend');
        await refreshListings();
      } catch (e) {
        setEditError(liveErr(e, 'Save failed.'));
      }
      return;
    }
    if (editPrice !== '' && !/^\d+(\.\d+)?$/.test(editPrice.trim())) {
      setEditError('Price must be a number (or leave blank for N/A).');
      return;
    }
    if (!editWeight.trim()) {
      setEditError('Weight is required (e.g. 30KG).');
      return;
    }
    if (!editReason.trim()) {
      setEditError('Add a reason — it is written to the audit log.');
      return;
    }
    const before = rows.find((r) => r.id === editId);
    setEditError(null);
    setRows((prev) => prev.map((r) => (r.id === editId
      ? { ...r, price: editPrice.trim() === '' ? null : Number(editPrice), weight: editWeight.trim() }
      : r)));
    if (before) {
      logAudit({
        admin: 'Kunj Bihari', action: 'Edit on behalf',
        entity: `${before.side === 'BUY' ? 'Requirement' : 'Listing'} · ${before.item}`,
        before: before.price == null ? 'N/A' : `₹${before.price.toLocaleString('en-IN')}`,
        after: editPrice.trim() === '' ? 'N/A' : `₹${Number(editPrice).toLocaleString('en-IN')}`,
      });
    }
    setEditId(null);
    setEditReason('');
    flash('Saved on behalf of the user — entry written to the audit log');
  }, [editId, editPrice, editWeight, editReason, rows, flash, logAudit, liveMode, refreshListings]);

  const forceExpire = useCallback((id: number) => {
    if (liveMode) {
      // No admin force-expire endpoint exists; withdraw is the closest real
      // action (owner-only, records Withdrawn). A 403 is the backend answer.
      const target = rows.find((r) => r.id === id);
      if (!target?.backendId) {
        flash('This row has no backend id — reload the list.');
        return;
      }
      void (async () => {
        try {
          await listingsApi.withdraw(target.backendId as string);
          flash('Withdrawn on the backend (records as Withdrawn)');
          await refreshListings();
        } catch (e) {
          flash(liveErr(e, 'Withdraw failed.'));
        }
      })();
      return;
    }
    setRows((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) {
        logAudit({
          admin: 'Kunj Bihari', action: 'Force expire',
          entity: `${target.side === 'BUY' ? 'Requirement' : 'Listing'} · ${target.item}`,
          before: target.status, after: 'Price expired',
        });
      }
      return prev.map((r) => (r.id === id ? { ...r, status: 'Price expired' as const, validUntil: 'expired by admin' } : r));
    });
    flash('Force-expired — the seller is notified');
  }, [flash, logAudit, liveMode, rows, refreshListings]);

  const selectNego = useCallback((id: number) => setSelectedNegoId(id), []);

  const nudge = useCallback(() => {
    if (!nudgeMessage.trim()) {
      flash('Type a message first — it is attributed to Kunj Bihari (admin)');
      return;
    }
    const active = negotiations.find((n) => n.id === selectedNegoId);
    setNegotiations((prev) => prev.map((n) => (n.id === selectedNegoId
      ? { ...n, thread: [...n.thread, { who: 'Kunj Bihari (admin)', side: 'admin' as const, price: nudgeMessage.trim(), time: 'just now · admin nudge' }] }
      : n)));
    if (active) {
      logAudit({
        admin: 'Kunj Bihari', action: 'Negotiation nudge',
        entity: `NEG-${active.id} · ${active.seller}`, before: 'no message', after: 'messaged party',
      });
    }
    setNudgeMessage('');
    flash('Message sent, attributed to Kunj Bihari (admin)');
  }, [nudgeMessage, negotiations, selectedNegoId, flash, logAudit]);

  const relay = useCallback(() => {
    if (!relayPrice.trim() || Number.isNaN(Number(relayPrice.replace(/[,₹\s]/g, '')))) {
      flash('Enter a numeric ₹ price to relay');
      return;
    }
    const amount = Number(relayPrice.replace(/[,₹\s]/g, ''));
    setNegotiations((prev) => prev.map((n) => {
      if (n.id !== selectedNegoId) return n;
      const relayedSide = relaySide === 'as Seller' ? 'seller' : 'buyer';
      const party = relaySide === 'as Seller' ? n.seller : n.buyer;
      return {
        ...n,
        standing: amount,
        thread: [...n.thread, {
          who: `${party} (via Kunj Bihari, admin)`,
          side: relayedSide as 'seller' | 'buyer',
          price: `₹${amount.toLocaleString('en-IN')}`,
          time: 'just now · relayed by admin',
        }],
      };
    }));
    setRelayPrice('');
    flash('Offer relayed on their behalf — both parties see the admin tag');
  }, [relayPrice, relaySide, selectedNegoId, flash]);

  const exportCsv = useCallback((kind: 'trades' | 'listings' | 'generic', filename: string, csvRows: string[][]) => {
    downloadCsv(filename, csvRows);
    flash(kind === 'trades' ? 'Trades CSV downloaded' : 'CSV export downloaded');
  }, [flash]);

  const removeBroker = useCallback((name: string) => {
    setBrokers((prev) => prev.filter((b) => b.name !== name));
    flash(`Broker ${name} removed`);
  }, [flash]);

  const addBroker = useCallback(() => {
    const name = window.prompt('Broker name:');
    if (!name || !name.trim()) return;
    const phone = window.prompt('Broker phone (optional):') ?? '';
    setBrokers((prev) => [...prev, { name: name.trim(), phone: phone.trim() || '—' }]);
    flash(`Broker ${name.trim()} added`);
  }, [flash]);

  const addCategory = useCallback(() => {
    const v = newCategory.trim();
    if (!v) {
      flash('Type a category name first');
      return;
    }
    if (liveMode) {
      // POST /commodity-categories { name } — requireRole(['admin']).
      if (liveCategoriesRef.current.some((c) => c.name.toLowerCase() === v.toLowerCase())) {
        flash('That category already exists');
        return;
      }
      setCategoryError(null);
      void (async () => {
        try {
          const created = await categoriesApi.create(v);
          liveCategoriesRef.current = [...liveCategoriesRef.current, created];
          setLiveCategories(liveCategoriesRef.current);
          setCategories(liveCategoriesRef.current.map((c) => c.name));
          setNewCategory('');
          flash(`Category “${v}” added`);
        } catch (e) {
          setCategoryError(liveErr(e, 'Add failed.'));
        }
      })();
      return;
    }
    if (categories.some((c) => c.toLowerCase() === v.toLowerCase())) {
      flash('That category already exists');
      return;
    }
    setCategories((prev) => [...prev, v]);
    setNewCategory('');
    flash(`Category “${v}” added`);
  }, [newCategory, categories, flash, liveMode]);

  const renameCategory = useCallback((name: string) => {
    // PATCH /commodity-categories/:id { name } — admin only.
    const found = liveCategoriesRef.current.find((c) => c.name === name);
    if (!found) {
      flash('Reload the taxonomy first.');
      return;
    }
    const next = window.prompt('Rename category:', name);
    if (!next || !next.trim() || next.trim() === name) return;
    setCategoryError(null);
    void (async () => {
      try {
        const updated = await categoriesApi.rename(found.id, next.trim());
        liveCategoriesRef.current = liveCategoriesRef.current.map((c) => (c.id === found.id ? updated : c));
        setLiveCategories(liveCategoriesRef.current);
        setCategories(liveCategoriesRef.current.map((c) => c.name));
        flash('Category renamed');
      } catch (e) {
        setCategoryError(liveErr(e, 'Rename failed.'));
      }
    })();
  }, [flash]);

  const deleteCategory = useCallback((name: string) => {
    // DELETE /commodity-categories/:id — admin only; 409 when still referenced.
    const found = liveCategoriesRef.current.find((c) => c.name === name);
    if (!found) {
      flash('Reload the taxonomy first.');
      return;
    }
    void (async () => {
      try {
        await categoriesApi.remove(found.id);
        liveCategoriesRef.current = liveCategoriesRef.current.filter((c) => c.id !== found.id);
        setLiveCategories(liveCategoriesRef.current);
        setCategories(liveCategoriesRef.current.map((c) => c.name));
        flash('Category deleted');
      } catch (e) {
        flash(liveErr(e, 'Delete failed.'));
      }
    })();
  }, [flash]);

  const saveSettings = useCallback(() => {
    if (liveMode) {
      // PATCH /settings/price_expiry_time { value: { time: "HH:mm" } } —
      // requireRole(['admin']). Timezone is a fixed backend constant
      // (Asia/Kolkata), not a stored setting.
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(expiryTime)) {
        flash('Expiry time must be HH:mm (24-hour).');
        return;
      }
      void (async () => {
        try {
          await settingsApi.update('price_expiry_time', { time: expiryTime });
          flash('Price expiry saved to the backend');
        } catch (e) {
          flash(liveErr(e, 'Save failed.'));
        }
      })();
      return;
    }
    flash('Settings saved — expiry, brokers and taxonomy updated');
  }, [flash, liveMode, expiryTime]);

  const publishPending = useCallback(() => {
    setFreightRoutes((prev) => prev.map((r) => (r.status === 'Pending review' ? { ...r, status: 'Published' as const } : r)));
    flash('Published pending freight routes');
  }, [flash]);

  const openFreightEdit = useCallback((id: number) => {
    const r = freightRoutes.find((x) => x.id === id);
    setFreightEditId(id);
    setFreightEditLow(r ? String(r.low) : '');
    setFreightEditHigh(r ? String(r.high) : '');
    setFreightEditCapacity(r ? r.capacity : '');
    setFreightEditError(null);
  }, [freightRoutes]);

  const closeFreightEdit = useCallback(() => {
    setFreightEditId(null);
    setFreightEditError(null);
  }, []);

  const saveFreightEdit = useCallback(() => {
    if (freightEditId == null) return;
    const low = Number(freightEditLow);
    const high = freightEditHigh.trim() === '' ? low : Number(freightEditHigh);
    if (!Number.isFinite(low) || low <= 0) {
      setFreightEditError('Price low must be a positive number.');
      return;
    }
    if (!Number.isFinite(high) || high < low) {
      setFreightEditError('Price high must be a number ≥ price low.');
      return;
    }
    if (!freightEditCapacity.trim()) {
      setFreightEditCapacity('Capacity is required.');
      return;
    }
    setFreightEditError(null);
    setFreightRoutes((prev) => prev.map((r) => (r.id === freightEditId
      ? { ...r, low, high, capacity: freightEditCapacity.trim() }
      : r)));
    setFreightEditId(null);
    flash('Route updated');
  }, [freightEditId, freightEditLow, freightEditHigh, freightEditCapacity, flash]);

  const removeFreightRoute = useCallback((id: number) => {
    setFreightRoutes((prev) => prev.filter((r) => r.id !== id));
    flash('Route removed');
  }, [flash]);

  const addFreightRoute = useCallback(() => {
    if (!newFreightDest.trim() || !newFreightLow.trim()) {
      setNewFreightError('Add a destination and price first.');
      return;
    }
    const low = Number(newFreightLow);
    const high = newFreightHigh.trim() === '' ? low : Number(newFreightHigh);
    if (!Number.isFinite(low) || low <= 0) {
      setNewFreightError('Price low must be a positive number.');
      return;
    }
    if (!Number.isFinite(high) || high < low) {
      setNewFreightError('Price high must be ≥ price low.');
      return;
    }
    setNewFreightError(null);
    setFreightRoutes((prev) => [
      {
        id: Math.max(0, ...prev.map((r) => r.id)) + 1,
        origin: newFreightOrigin,
        dest: newFreightDest.trim(),
        low, high,
        capacity: newFreightCapacity.trim() || '30-35 MT',
        status: 'Published',
      },
      ...prev,
    ]);
    setNewFreightDest('');
    setNewFreightLow('');
    setNewFreightHigh('');
    setNewFreightCapacity('');
    flash('Route added and published');
  }, [newFreightDest, newFreightLow, newFreightHigh, newFreightCapacity, newFreightOrigin, flash]);

  const uploadFreightSheet = useCallback(() => {
    flash('Sheet upload is not wired to a backend endpoint yet — add routes manually below');
  }, [flash]);

  const value = useMemo<AdminState>(() => ({
    searchQuery, setSearchQuery, countdown, toast, flash,
    users, userFilter, setUserFilter, suspendUser, editRoles,
    invites, revokeInvite,
    inviteePhone, setInviteePhone, inviteeFirm, setInviteeFirm,
    inviteBuyer, toggleInviteBuyer: () => setInviteBuyer((v) => !v),
    inviteSeller, toggleInviteSeller: () => setInviteSeller((v) => !v),
    invitePaymentTerms, setInvitePaymentTerms, inviteError, sendInvite,
    rows, sideFilter, setSideFilter, catFilter, setCatFilter, statusFilter, setStatusFilter,
    editId, openEdit, closeEdit, editPrice, setEditPrice, editWeight, setEditWeight,
    editReason, setEditReason, editError, saveEdit, forceExpire,
    negotiations, negoFilter, setNegoFilter, selectedNegoId, selectNego,
    nudgeMessage, setNudgeMessage, relayPrice, setRelayPrice, relaySide, setRelaySide,
    nudge, relay,
    trades, exportCsv,
    brokers, removeBroker, addBroker,
    categories, addCategory, newCategory, setNewCategory,
    expiryTime, setExpiryTime, timezone, setTimezone,
    defaultPaymentTerms, setDefaultPaymentTerms, saveSettings,
    audit, auditAdmin, setAuditAdmin, auditAction, setAuditAction, auditQuery, setAuditQuery,
    freightRoutes, freightOriginFilter, setFreightOriginFilter,
    freightStatusFilter, setFreightStatusFilter, publishPending,
    freightEditId, openFreightEdit, closeFreightEdit,
    freightEditLow, setFreightEditLow, freightEditHigh, setFreightEditHigh,
    freightEditCapacity, setFreightEditCapacity, freightEditError, saveFreightEdit,
    removeFreightRoute,
    newFreightOrigin, setNewFreightOrigin, newFreightDest, setNewFreightDest,
    newFreightLow, setNewFreightLow, newFreightHigh, setNewFreightHigh,
    newFreightCapacity, setNewFreightCapacity, newFreightError, addFreightRoute,
    uploadFreightSheet,
    liveMode,
    invitesLoading, invitesError, refreshInvites,
    listingsLoading, listingsError, listingPage, setListingPage,
    listingTotal, listingTotalPages, refreshListings,
    settingsLoading, settingsError, refreshLiveSettings,
    liveCategories, categoryError, renameCategory, deleteCategory,
    liveCommodities, commoditiesLoading, commodityError, refreshCommodities,
    addCommodity, renameCommodity, deleteCommodity,
    tosVersions, tosVersionsLoading, tosVersionsError, refreshTosVersions, publishTosVersion,
  }), [
    searchQuery, countdown, toast, flash,
    users, userFilter, suspendUser, editRoles, invites, revokeInvite,
    inviteePhone, inviteeFirm, inviteBuyer, inviteSeller, invitePaymentTerms, inviteError, sendInvite,
    rows, sideFilter, catFilter, statusFilter, editId, openEdit, closeEdit,
    editPrice, editWeight, editReason, editError, saveEdit, forceExpire,
    negotiations, negoFilter, selectedNegoId, selectNego,
    nudgeMessage, relayPrice, relaySide, nudge, relay, trades, exportCsv,
    brokers, removeBroker, addBroker, categories, addCategory, newCategory,
    expiryTime, timezone, defaultPaymentTerms, saveSettings,
    audit, auditAdmin, auditAction, auditQuery,
    freightRoutes, freightOriginFilter, freightStatusFilter, publishPending,
    freightEditId, openFreightEdit, closeFreightEdit,
    freightEditLow, freightEditHigh, freightEditCapacity, freightEditError, saveFreightEdit,
    removeFreightRoute, newFreightOrigin, newFreightDest, newFreightLow, newFreightHigh,
    newFreightCapacity, newFreightError, addFreightRoute, uploadFreightSheet,
    liveMode,
    invitesLoading, invitesError, refreshInvites,
    listingsLoading, listingsError, listingPage, setListingPage,
    listingTotal, listingTotalPages, refreshListings,
    settingsLoading, settingsError, refreshLiveSettings,
    liveCategories, categoryError, renameCategory, deleteCategory,
    liveCommodities, commoditiesLoading, commodityError, refreshCommodities,
    addCommodity, renameCommodity, deleteCommodity,
    tosVersions, tosVersionsLoading, tosVersionsError, refreshTosVersions, publishTosVersion,
  ]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
