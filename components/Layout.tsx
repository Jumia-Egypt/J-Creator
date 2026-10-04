import React, { useState } from 'react';
import { useStore } from '../Store';
import { ClipboardList, LogOut, Shield, Package2, Edit2, Store, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './ErrorBoundary';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { currentView, setCurrentView, shopName, setShopName, queue, isAdmin, setIsAdmin } = useStore();
  const [isEditingStoreName, setIsEditingStoreName] = useState(false);
  const [tempShopName, setTempShopName] = useState(shopName);

  const isWizard = !['landing', 'admin', 'queue', 'export'].includes(currentView);

  const steps = [
    { id: 'category', label: 'Category' },
    { id: 'condition', label: 'Condition' },
    { id: 'device-type', label: 'Device Type' },
    { id: 'brand', label: 'Brand' },
    { id: 'model', label: 'Model' },
    { id: 'variant', label: 'Variants' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentView);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] font-sans text-gray-900 selection:bg-[#F68B1E]/20">
      {/* Floating Header */}
      {currentView !== 'landing' && (
        <header className="sticky top-0 z-50 px-2 sm:px-4 lg:px-8 pt-4 pb-4 bg-[#F8F9FA]">
          <div className="w-full mx-auto h-16 flex items-center justify-between bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl px-4 sm:px-6 shadow-sm shadow-gray-200/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-[#E87B10] to-[#F9A246] rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Package2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">
                J-Creator
              </span>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Active Store Display & Change Button */}
              {currentView !== 'admin' && (
                <>
                  <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-1.5 hover:border-gray-100 transition-colors">
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-extrabold">Active Store</span>
                      <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{shopName || 'Default Store'}</span>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setTempShopName(shopName);
                        setIsEditingStoreName(true);
                      }}
                      className="p-1.5 text-[#F68B1E] hover:bg-orange-100/60 rounded-lg transition-colors ml-1"
                      title="Change Shop Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                  
                  <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
                </>
              )}

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('queue')}
                className="relative p-2.5 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200/50"
              >
                <ClipboardList className="w-5 h-5" />
                <AnimatePresence>
                  {queue.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-tr from-[#E87B10] to-[#F9A246] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                    >
                      {queue.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('admin')}
                className={`p-2.5 rounded-xl transition-all border ${
                  currentView === 'admin'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border-gray-200/50'
                }`}
                title="Admin Portal"
              >
                <Shield className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </header>
      )}

      {/* Wizard Progress Pill */}
      <AnimatePresence>
        {isWizard && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
            className="z-40 relative flex justify-center pt-4"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-full px-2 py-1.5 shadow-sm shadow-gray-200/30 overflow-x-auto max-w-[90vw] sm:max-w-none no-scrollbar">
              <nav className="flex items-center min-w-max px-2">
                {steps.map((step, idx) => {
                  const isActive = idx === currentStepIndex || (currentView === 'device-type' && step.id === 'category');
                  const isCompleted = idx < currentStepIndex;

                  return (
                    <React.Fragment key={step.id}>
                      <div className="flex items-center gap-2.5 relative">
                        {isActive && (
                          <motion.div 
                            layoutId="activeStep"
                            className="absolute inset-0 bg-gray-100 rounded-full -mx-3 -my-1.5 -z-10"
                            initial={false}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <motion.div 
                          initial={false}
                          animate={{ 
                            scale: isActive ? 1.1 : 1,
                            backgroundColor: isActive ? '#F68B1E' : isCompleted ? '#111827' : '#F3F4F6'
                          }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm ${
                            isActive || isCompleted ? 'text-white' : 'text-gray-400 border border-gray-200'
                          }`}
                        >
                          {idx + 1}
                        </motion.div>
                        <span className={`text-sm tracking-tight ${
                          isActive ? 'text-gray-900 font-bold' : isCompleted ? 'text-gray-700 font-semibold' : 'text-gray-400 font-semibold'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`w-6 h-[2px] mx-4 rounded-full transition-colors duration-300 ${isCompleted ? 'bg-gray-800' : 'bg-gray-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col p-2 sm:p-4 lg:p-8 w-full mx-auto relative z-10">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Change Store Name Modal */}
      <AnimatePresence>
        {isEditingStoreName && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-50 rounded-xl text-[#F68B1E]">
                    <Store className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Change Store Name</h3>
                </div>
                <button 
                  onClick={() => setIsEditingStoreName(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Store / Vendor Name
                </label>
                <input 
                  type="text" 
                  value={tempShopName}
                  onChange={(e) => setTempShopName(e.target.value)}
                  placeholder="Write Your Shop Name"
                  autoFocus
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#F68B1E]/50 focus:border-[#F68B1E] transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (tempShopName.trim()) setShopName(tempShopName.trim());
                      setIsEditingStoreName(false);
                    }
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsEditingStoreName(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (tempShopName.trim()) setShopName(tempShopName.trim());
                    setIsEditingStoreName(false);
                  }}
                  className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-[#E87B10] to-[#F9A246] text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Store Name
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
