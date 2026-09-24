import React, { useState } from 'react';
import { useStore } from '../Store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, Download, Trash2, 
  Search, Store, Layers, X, Eye, 
  Building2, ShoppingBag, ArrowUpRight,
  Tag, Sparkles, Flame, ArrowLeft, LayoutDashboard, ChevronRight
} from 'lucide-react';
import { Submission, SubmissionItem } from '../types';
import { PhoneTagsManager } from '../components/PhoneTagsManager';
import { modelFamilies, BULK_HEADERS } from '../data';
import { sb } from '../supabase';

// Real admin account, same email production uses — must be created once in
// this sandbox project's Supabase dashboard (Authentication -> Users) with
// whatever password George chooses. There is no client-side password to
// read out of the shipped JS bundle anymore; the database's own RLS
// policies (scoped to this exact email) are what actually gate delete/
// read access, matching production's fix for the same issue.
const ADMIN_EMAIL = 'george.ayman@jumia.com';

const safeBrands = (val: any): string[] => {
  if (Array.isArray(val)) {
    return val.map(b => String(b || '').trim()).filter(Boolean);
  }
  if (typeof val === 'string' && val.trim()) {
    return [val.trim()];
  }
  return [];
};

export const AdminScreen = () => {
  const { 
    isAdmin, 
    setIsAdmin, 
    setCurrentView, 
    submissions, 
    addSubmission, 
    deleteSubmission, 
    shopName,
    modelTags
  } = useStore();

  const [adminSection, setAdminSection] = useState<'hub' | 'dashboard' | 'tags'>('hub');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<'submissions' | 'shops'>('submissions');
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setError(false);
    const { error: authError } = await sb.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password
    });
    setSigningIn(false);
    if (authError) {
      setError(true);
      return;
    }
    setIsAdmin(true);
    setPassword('');
  };

  const handleLogout = async () => {
    await sb.auth.signOut();
    setIsAdmin(false);
    setCurrentView('landing');
  };

  const handleResetData = () => {
    localStorage.removeItem('vendor_submissions');
    window.location.reload();
  };

  // Ultra-defensive sanitization of submissions
  const safeSubmissions: Submission[] = Array.isArray(submissions) 
    ? submissions.filter(Boolean).map(s => ({
        id: s.id || `JUM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        shopName: s.shopName || 'Default Store',
        date: s.date || new Date().toISOString().slice(0, 16).replace('T', ' '),
        itemsCount: typeof s.itemsCount === 'number' ? s.itemsCount : (Array.isArray(s.items) ? s.items.length : 0),
        brands: safeBrands(s.brands),
        status: s.status || 'Processed',
        items: Array.isArray(s.items) ? s.items : [],
        timestamp: s.timestamp || Date.now()
      }))
    : [];

  const totalSubmissions = safeSubmissions.length;
  
  const uniqueShopsCount = new Set(
    safeSubmissions.map(s => s.shopName.trim().toLowerCase()).filter(Boolean)
  ).size;

  // Filtered Submissions
  const filteredSubmissions = safeSubmissions.filter(s => {
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return true;
    const matchesId = (s.id || '').toLowerCase().includes(term);
    const matchesShop = (s.shopName || '').toLowerCase().includes(term);
    const matchesBrand = (s.brands || []).some(b => b.toLowerCase().includes(term));
    return matchesId || matchesShop || matchesBrand;
  });

  // This is the same real 75-column Jumia Vendor Center bulk-upload
  // template production exports (BULK_HEADERS, copied verbatim), built the
  // same way: fetch the live catalog fresh, match each submitted item back
  // to its real master_data row by barcode (falling back to whatever was
  // saved on the item itself if no match is found), and lay each field out
  // at the exact same column index production uses — so a CSV downloaded
  // here opens as the identical template vendors already know, not a
  // simplified custom sheet.
  const csvEsc = (v: any): string => {
    if (v === null || v === undefined || v === '') return '';
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  // Long all-digit values (barcodes, SKUs) get silently mangled by Excel —
  // opened normally, a 13-digit barcode gets auto-detected as a number and
  // shown in scientific notation. Wrapping as ="123..." forces Excel to
  // display it as exact text instead (production's Round 24 fix, same here).
  const csvForceText = (v: any): string => {
    if (v === null || v === undefined || v === '') return '';
    const s = String(v);
    if (/^\d{6,}$/.test(s)) return '="' + s.replace(/"/g, '""') + '"';
    return csvEsc(v);
  };
  // Column indices holding barcode/SKU-style long digit strings:
  // SellerSKU (6), ParentSKU (7), GTIN_Barcode (10) — same as production.
  const FORCE_TEXT_COLS = new Set([6, 7, 10]);
  const csvEscRow = (v: any, i: number) => (FORCE_TEXT_COLS.has(i) ? csvForceText(v) : csvEsc(v));

  const downloadSubmissionCSV = async (sub: Submission) => {
    if (!sub || !sub.items || sub.items.length === 0) {
      alert('No items to export for this submission.');
      return;
    }

    try {
      const { data: masterData, error: masterError } = await sb.from('master_data').select('*');
      if (masterError) {
        alert('Catalog loading failed: ' + masterError.message);
        return;
      }

      const byBarcode: Record<string, any> = {};
      (masterData || []).forEach((m: any) => {
        if (m.barcode) byBarcode[m.barcode] = m;
      });

      const csvRows: string[] = [];
      csvRows.push(BULK_HEADERS.map(csvEsc).join(','));

      sub.items.forEach((item: SubmissionItem) => {
        const m = item.barcode ? byBarcode[item.barcode] : undefined;
        const bc = m?.barcode || item.barcode || '';
        const sku = item.supplierSku && item.supplierSku.trim() ? item.supplierSku.trim() : bc;
        const nameAR = m?.name_ar || '';
        const colorAR = nameAR.indexOf(' - ') > -1 ? nameAR.split(' - ').pop()?.trim() || '' : '';

        const rowArr = new Array(75).fill('');
        rowArr[0] = m?.name_en || item.modelName || '';
        rowArr[1] = nameAR;
        rowArr[3] = m?.long_desc_en || '';
        rowArr[4] = m?.long_desc_ar || '';
        rowArr[6] = sku;
        rowArr[7] = sku;
        rowArr[8] = m?.brand || item.brandName || '';
        rowArr[9] = '1002300 - Phones & Tablets / Mobile Phones / Smartphones / Android Phones';
        rowArr[10] = bc;
        rowArr[15] = 0;
        rowArr[16] = '...';
        rowArr[21] = m?.color || item.colorName || '';
        rowArr[22] = colorAR;
        rowArr[42] = m?.model_family || item.modelName || '';
        rowArr[52] = item.warrantyPeriod || '';
        rowArr[54] = item.productionCountry || '';
        rowArr[58] = m?.highlights_en || '';
        rowArr[59] = m?.highlights_ar || '';

        // Bulk-sheet exports must always carry the vendor's real, original
        // image links -- never `image1_hosted` (our internal, resized
        // Supabase Storage copy used only for the on-site thumbnail picker).
        // A prior version of this line preferred `image1_hosted` when set,
        // which was harmless while that column was mostly empty/duplicate,
        // but started substituting our internal storage URLs for the real
        // vendor images the moment the on-site self-hosting migration
        // actually populated it for the whole catalog.
        const imgs = m
          ? [m.image1, m.image2, m.image3, m.image4, m.image5, m.image6, m.image7]
          : [];
        for (let k = 0; k < 7; k++) {
          rowArr[67 + k] = (imgs[k] || '').trim();
        }

        csvRows.push(rowArr.map(csvEscRow).join(','));
      });

      // UTF-8 BOM so Excel renders the Arabic (Name_AR, color_AR, etc.)
      // columns correctly instead of mojibake — production includes this.
      const blob = new Blob(['﻿' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeShop = (sub.shopName || 'store').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStamp = sub.date ? sub.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
      link.download = `Jumia_BulkSheet_${safeShop}_${dateStamp}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to build CSV: ' + err.message);
    }
  };


  // LOGIN SCREEN
  if (!isAdmin) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-4 min-h-[70vh]"
      >
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-8 shadow-2xl shadow-gray-200/50">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-50 to-orange-100 border border-orange-200/60 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Shield className="w-8 h-8 text-[#F68B1E]" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-1 tracking-tight">Admin Portal</h2>
          <p className="text-gray-500 text-center text-xs font-medium mb-8">Access vendor analytics and batch management.</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Security Passcode
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-gray-50 border ${error ? 'border-red-200 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-200'} rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:border-[#F68B1E] transition-all`}
                placeholder="••••••••"
                autoFocus
              />
              {error && <p className="text-red-500 font-bold text-xs mt-2">Sign-in failed. Check the password (or ask George to confirm the admin account exists in Supabase).</p>}
            </div>
            
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setCurrentView('landing')}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm shadow-sm"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={signingIn}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#E87B10] to-[#F9A246] hover:opacity-95 transition-opacity text-sm shadow-lg shadow-orange-500/20 disabled:opacity-60"
              >
                {signingIn ? 'Signing in…' : 'Sign In'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="max-w-none mx-auto w-full pt-4 space-y-6 pb-16">
      {/* Top Global Admin Bar */}
      <div
        className="animate-fade-in-safe bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gray-900 text-[#F68B1E] flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-gray-900 tracking-tight">Jumia Operations Hub</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Session
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Administration center for vendor submissions & catalog merchandising</p>
          </div>
        </div>

        {/* Global Action & Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setAdminSection('hub')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              adminSection === 'hub'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Hub</span>
          </button>

          <button
            onClick={() => setAdminSection('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              adminSection === 'dashboard'
                ? 'bg-[#F68B1E] text-white shadow-xs'
                : 'bg-orange-50 text-[#F68B1E] hover:bg-orange-100 border border-orange-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Submissions ({totalSubmissions})</span>
          </button>

          <button
            onClick={() => setAdminSection('tags')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              adminSection === 'tags'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Phone Tags</span>
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

          <button
            onClick={() => setCurrentView('landing')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            title="Return to J-Creator"
          >
            <Store className="w-3.5 h-3.5 text-gray-500" />
            <span>J-Creator</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 text-xs font-extrabold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-xl transition-all shadow-2xs whitespace-nowrap flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation when inside sub-sections */}
      {adminSection !== 'hub' && (
        <div
          className="animate-fade-in-safe flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-xs"
        >
          <button
            onClick={() => setAdminSection('hub')}
            className="inline-flex items-center gap-2 text-xs font-black text-gray-700 hover:text-[#F68B1E] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-[#F68B1E] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Admin Hub</span>
          </button>
          
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-gray-400">Current View:</span>
            <span className={`px-3 py-1 rounded-xl font-black ${
              adminSection === 'dashboard'
                ? 'bg-orange-50 text-[#F68B1E] border border-orange-200/80'
                : 'bg-purple-50 text-purple-700 border border-purple-200/80'
            }`}>
              {adminSection === 'dashboard' ? '📊 Submissions Dashboard' : '🏷️ Product Tags & Badges'}
            </span>
            <button
              onClick={() => setAdminSection(adminSection === 'dashboard' ? 'tags' : 'dashboard')}
              className="font-bold text-gray-500 hover:text-gray-900 underline transition-colors"
            >
              Switch to {adminSection === 'dashboard' ? 'Phone Tags' : 'Dashboard'} &rarr;
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: ADMIN HUB WITH TWO VISUAL CARDS */}
      {adminSection === 'hub' && (
        <div className="animate-fade-in-safe space-y-6">
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-purple-500/10 border border-orange-200/60 rounded-3xl p-6 md:p-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-orange-200/80 text-[#F68B1E] font-black text-xs uppercase tracking-wider mb-2">
                Operations Management
              </span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Admin Control Center</h2>
              <p className="text-sm text-gray-600 font-medium mt-2">
                Welcome to Jumia Catalog Administration. Select an operational section below to review submitted vendor batches or manage phone badges and promotional tags.
              </p>
            </div>
          </div>

          {/* TWO PRIMARY VISUAL CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VISUAL CARD 1: SUBMISSIONS DASHBOARD */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setAdminSection('dashboard')}
              className="animate-fade-in-safe group cursor-pointer bg-white rounded-3xl p-7 border border-gray-200/80 shadow-md shadow-gray-200/40 hover:border-[#F68B1E] hover:shadow-xl hover:shadow-orange-500/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F68B1E] to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                    <Layers className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-50 text-[#F68B1E] border border-orange-200/70">
                    Operations
                  </span>
                </div>

                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-[#F68B1E] transition-colors flex items-center gap-2">
                  <span>Submissions Dashboard</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#F68B1E] group-hover:translate-x-1 transition-all" />
                </h3>
                
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                  Real-time analytics and tracking for vendor store submissions, batch exports, SKU counts, and shop breakdowns.
                </p>

                {/* Key stats row inside card */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Recorded Batches</span>
                    <span className="text-xl font-black text-gray-900">{totalSubmissions} Batches</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Unique Shops</span>
                    <span className="text-xl font-black text-blue-600">{uniqueShopsCount} Stores</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">View logs & export CSV</span>
                <span className="text-xs font-black text-[#F68B1E] flex items-center gap-1 group-hover:underline">
                  Open Submissions &rarr;
                </span>
              </div>
            </motion.div>

            {/* VISUAL CARD 2: PRODUCT TAGS & BADGES */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setAdminSection('tags')}
              className="animate-fade-in-safe group cursor-pointer bg-white rounded-3xl p-7 border border-gray-200/80 shadow-md shadow-gray-200/40 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                    <Tag className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200/70">
                    Merchandising
                  </span>
                </div>

                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-purple-600 transition-colors flex items-center gap-2">
                  <span>Product Tags & Badges</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </h3>
                
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                  Assign or toggle promotional badges on phone models. For example, mark Galaxy A07 with <strong>New Launch</strong> live in the store.
                </p>

              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">Configure {modelFamilies.length} phone models</span>
                <span className="text-xs font-black text-purple-600 flex items-center gap-1 group-hover:underline">
                  Manage Phone Tags &rarr;
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* SECTION 2: PHONE TAGS MANAGER */}
      {adminSection === 'tags' && (
        <PhoneTagsManager />
      )}

      {/* SECTION 3: SUBMISSIONS DASHBOARD */}
      {adminSection === 'dashboard' && (
        <>
          {/* Dashboard Header Bar */}
          <div className="animate-fade-in-safe flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-50 text-[#F68B1E] text-xs font-bold mb-3 border border-orange-200/50">
                <Shield className="w-3.5 h-3.5" /> Vendor Operations Center
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                Admin Submissions Dashboard
              </h2>
              <p className="text-gray-500 font-medium text-sm mt-1">Real-time overview of vendor shop submissions, brands, and batch details.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search shop, ID, brand..."
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-[#F68B1E] w-56 md:w-64 shadow-sm transition-all text-gray-900"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>



      {/* KPI Stats Grid */}
      <div className="animate-fade-in-safe grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Metric 1: Total Submissions */}
        <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-md shadow-gray-200/30 relative overflow-hidden group hover:border-orange-100 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Total Submissions</span>
            <div className="p-2.5 bg-orange-50 text-[#F68B1E] rounded-2xl border border-orange-100">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-gray-900 tracking-tight mb-1">
            {totalSubmissions}
          </div>
          <div className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <span className="text-emerald-600 font-extrabold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> Active</span> batches recorded
          </div>
        </div>

        {/* Metric 2: Unique Submitted Shops */}
        <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-md shadow-gray-200/30 relative overflow-hidden group hover:border-blue-100 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Unique Submitted Shops</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-gray-900 tracking-tight mb-1">
            {uniqueShopsCount}
          </div>
          <div className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <span className="text-blue-600 font-extrabold">Distinct</span> vendor stores
          </div>
        </div>
      </div>

      {/* Panel View Mode Tabs */}
      <div className="animate-fade-in-safe flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'submissions'
              ? 'bg-[#F68B1E] text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Submissions Table ({safeSubmissions.length})
        </button>

        <button
          onClick={() => setActiveTab('shops')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'shops'
              ? 'bg-[#F68B1E] text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
          }`}
        >
          <Building2 className="w-4 h-4" /> Shops Breakdown ({uniqueShopsCount})
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS TABLE */}
      {activeTab === 'submissions' && (
      <div className="animate-fade-in-safe bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/30 overflow-hidden">
        <div className="p-6 border-b border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/80 to-white">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#F68B1E]" />
              Vendor Submissions List
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">All submitted product batches by registered store vendors</p>
          </div>
          
          <div className="text-xs font-bold text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            Showing <span className="text-gray-900 font-extrabold">{filteredSubmissions.length}</span> of {safeSubmissions.length} submissions
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200/80 text-gray-400 text-[10px] uppercase tracking-widest bg-gray-50/60">
                <th className="px-6 py-4 font-extrabold">Shop / Store Name</th>
                <th className="px-6 py-4 font-extrabold">Brands Submitted</th>
                <th className="px-6 py-4 font-extrabold text-center">Items Count</th>
                <th className="px-6 py-4 font-extrabold">Date Submitted</th>
                <th className="px-6 py-4 font-extrabold">Status</th>
                <th className="px-6 py-4 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-400 group-hover:text-[#F68B1E] transition-colors" />
                        <span>{sub.shopName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {safeBrands(sub.brands).map((brand, bi) => (
                          <span key={bi} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 font-bold text-[11px]">
                            {brand}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-900 text-sm">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-7 bg-gray-100 rounded-lg px-2 border border-gray-200/60">
                        {sub.itemsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-semibold whitespace-nowrap">
                      {sub.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${
                        sub.status === 'Processed' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Processed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedSubmission(sub)}
                          className="p-2 text-gray-500 hover:text-[#F68B1E] hover:bg-orange-50 rounded-xl transition-all border border-gray-200/80 bg-white shadow-2xs" 
                          title="View Submission Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => downloadSubmissionCSV(sub)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-200/80 bg-white shadow-2xs" 
                          title="Download CSV"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteSubmission(sub.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-200/80 bg-white shadow-2xs" 
                          title="Delete Submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <Search className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-gray-900 font-bold text-base">
                        {searchTerm ? 'No matching submissions found' : 'No vendor submissions yet'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {searchTerm ? 'Try adjusting your search query or clear filters.' : 'Vendor batches will appear here as soon as they are submitted.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* TAB 2: SHOPS BREAKDOWN */}
      {activeTab === 'shops' && (
        <div className="animate-fade-in-safe grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from(new Set(safeSubmissions.map(s => s.shopName || 'Default Store'))).map((shop, i) => {
            const shopSubs = safeSubmissions.filter(s => (s.shopName || 'Default Store') === shop);
            const totalShopItems = shopSubs.reduce((a, b) => a + (b.itemsCount || 0), 0);
            const shopBrands = Array.from(new Set(shopSubs.flatMap(s => safeBrands(s.brands))));

            return (
              <div key={i} className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-lg shadow-gray-200/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">{shop}</h4>
                      <p className="text-xs font-semibold text-gray-400">{shopSubs.length} batch submissions</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between text-xs font-bold text-gray-700">
                  <span>Total Items Submitted:</span>
                  <span className="text-[#F68B1E] font-extrabold">{totalShopItems} variants</span>
                </div>

                <div>
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Brands Handled</span>
                  <div className="flex flex-wrap gap-1.5">
                    {shopBrands.map((b, bi) => (
                      <span key={bi} className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold text-xs rounded-lg border border-purple-100">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-gray-200 shadow-2xl space-y-6 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-50 rounded-2xl text-[#F68B1E] border border-orange-100">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-gray-900">{selectedSubmission.shopName}</h3>
                    <p className="text-xs font-semibold text-gray-400">Batch ID: <span className="font-mono text-gray-700">{selectedSubmission.id}</span> • {selectedSubmission.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Brands summary in modal */}
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted Brands:</span>
                {safeBrands(selectedSubmission.brands).map((b, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-extrabold text-purple-700 shadow-2xs">
                    {b}
                  </span>
                ))}
              </div>

              {/* Items List inside Modal */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Item Breakdown ({selectedSubmission.items?.length || 0} items)</h4>
                {selectedSubmission.items && selectedSubmission.items.length > 0 ? (
                  selectedSubmission.items.map((item, ii) => (
                    <div key={ii} className="p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-100 transition-colors">
                      <div>
                        <div className="text-[11px] font-extrabold text-[#F68B1E] uppercase tracking-wider">{item.brandName}</div>
                        <div className="text-sm font-extrabold text-gray-900">{item.modelName}</div>
                        <div className="text-xs text-gray-500 font-semibold mt-0.5">
                          Variant: <span className="text-gray-800 font-bold">{item.variantId || item.colorName}</span> • Storage: <span className="text-gray-800 font-bold">{item.storage}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-bold text-gray-600 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs self-start sm:self-auto">
                        <span>Origin: {item.productionCountry}</span>
                        <span className="text-gray-300">•</span>
                        <span>Warranty: {item.warrantyPeriod}</span>
                        {item.supplierSku && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500 font-mono">SKU: {item.supplierSku}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm font-medium">No detailed item entries logged for this batch.</div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => downloadSubmissionCSV(selectedSubmission)}
                  className="px-5 py-2.5 text-sm font-bold bg-[#F68B1E] hover:bg-[#E87B10] text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download CSV
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};
