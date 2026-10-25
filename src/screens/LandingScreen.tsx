import React, { useState } from 'react';
import { useStore } from '../Store';
import { useT } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';
import { PackageSearch, Shield, AlertCircle } from 'lucide-react';

export const LandingScreen = () => {
  const { shopName, setShopName, resetWizard, setCurrentView, setLang } = useStore();
  const [error, setError] = useState('');
  const { t, isAr } = useT();

  const handleStart = () => {
    if (!shopName.trim()) {
      setError(t('landing.error', 'Please enter your shop name before starting a batch.'));
      return;
    }
    setError('');
    resetWizard();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="flex-1 flex flex-col items-center justify-center py-12 space-y-16"
    >
      <button
        onClick={() => setLang(isAr ? 'en' : 'ar')}
        className="absolute top-4 end-4 px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200/70 shadow-sm cursor-pointer z-20"
      >
        {isAr ? 'English' : 'العربية'}
      </button>
      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div variants={item} className="w-20 h-20 bg-gradient-to-tr from-[#E87B10] to-[#F9A246] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-500/20 text-white relative">
          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse blur-md -z-10"></div>
          <PackageSearch className="w-10 h-10" />
        </motion.div>
        
        <motion.h1 variants={item} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          J-Creator
        </motion.h1>
        
        <motion.p variants={item} className="text-gray-500 text-lg mb-10 max-w-lg mx-auto font-medium">
          {t('landing.tagline', 'Build your products faster, easier, and in no time.')}
        </motion.p>

        <motion.div variants={item} className="w-full sm:max-w-md mx-auto mb-10">
          <div className={`bg-gray-50/80 border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full shadow-sm transition-colors ${
            error ? 'border-red-300' : 'border-gray-200/70'
          }`}>
            <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
              {t('landing.storeName', 'Store Name')}
            </div>
            <input
              type="text"
              value={shopName}
              onChange={(e) => {
                setShopName(e.target.value);
                if (error && e.target.value.trim()) setError('');
              }}
              placeholder={t('landing.placeholder', 'Write Your Shop Name')}
              className={`bg-white border rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 w-full transition-all shadow-sm placeholder:text-gray-400 placeholder:font-normal ${
                error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#F68B1E]/40 focus:border-[#F68B1E]'
              }`}
            />
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="flex items-center justify-center gap-2 text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100 text-xs font-bold overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={item}>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="px-8 py-4 text-base font-bold bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-900/20 transition-all hover:bg-black w-full sm:w-auto mx-auto border border-gray-800 cursor-pointer"
          >
            {t('landing.start', 'Start New Batch')}
          </motion.button>
        </motion.div>

        <motion.div variants={item} className="pt-8">
          <button
            onClick={() => setCurrentView('admin')}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium py-1 px-2.5 rounded-lg hover:bg-gray-100 cursor-pointer"
            title="Open Admin Portal"
          >
            <Shield className="w-3.5 h-3.5" />
            {t('landing.admin', 'Admin Portal')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
