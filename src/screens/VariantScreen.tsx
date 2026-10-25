import React, { useState } from 'react';
import { useStore } from '../Store';
import { getModelFamilyById, getVariantsByModelId, getBrandById } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, ArrowLeft, Plus, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';
import { SelectedVariant } from '../types';
import { useT } from '../i18n';

export const VariantScreen = () => {
  const { t } = useT();
  const { 
    selectedModelId, 
    selectedBrandId, 
    setCurrentView, 
    addToQueue,
    queue,
    getModelTags
  } = useStore();
  
  const model = selectedModelId ? getModelFamilyById(selectedModelId) : null;
  const brand = selectedBrandId ? getBrandById(selectedBrandId) : null;
  const variants = selectedModelId ? getVariantsByModelId(selectedModelId) : [];

  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  
  // Batch details state
  const [productionCountry, setProductionCountry] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [formError, setFormError] = useState('');

  const isVariantInQueue = (variantId: string, storage: string) => {
    return queue.some(qItem => 
      qItem.modelFamily.id === selectedModelId && 
      qItem.selectedVariants.some(sv => sv.variantId === variantId && sv.storage === storage)
    );
  };

  const getQueuedVariant = (variantId: string, storage: string) => {
    for (const qItem of queue) {
      if (qItem.modelFamily.id === selectedModelId) {
        const found = qItem.selectedVariants.find(sv => sv.variantId === variantId && sv.storage === storage);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleVariantSelection = (variantId: string, storage: string) => {
    if (isVariantInQueue(variantId, storage)) return;
    setSelectedVariants(prev => {
      const exists = prev.find(v => v.variantId === variantId && v.storage === storage);
      if (exists) {
        return prev.filter(v => !(v.variantId === variantId && v.storage === storage));
      } else {
        return [...prev, { variantId, storage }];
      }
    });
  };

  const updateSupplierSku = (variantId: string, storage: string, sku: string) => {
    setSelectedVariants(prev => prev.map(v => 
      v.variantId === variantId && v.storage === storage 
        ? { ...v, supplierSku: sku }
        : v
    ));
  };

  const isSelected = (variantId: string, storage: string) => {
    return selectedVariants.some(v => v.variantId === variantId && v.storage === storage);
  };

  const selectAllForVariant = (variantId: string, storageOptions: string[]) => {
    const availableOptions = storageOptions.filter(s => !isVariantInQueue(variantId, s));
    if (availableOptions.length === 0) return;

    const allSelected = availableOptions.every(s => isSelected(variantId, s));
    
    setSelectedVariants(prev => {
      const filtered = prev.filter(v => !(v.variantId === variantId && storageOptions.includes(v.storage)));
      if (allSelected) {
        return filtered;
      } else {
        const toAdd = availableOptions.map(s => ({ variantId, storage: s }));
        return [...filtered, ...toAdd];
      }
    });
  };

  const handleAddToQueue = () => {
    if (selectedVariants.length === 0 || !model || !brand) return;
    if (!productionCountry || !warrantyPeriod) {
      setFormError(t('variant.formError', 'Please select a production country and warranty period to proceed.'));
      return;
    }
    setFormError('');
    
    addToQueue({
      id: crypto.randomUUID(),
      modelFamily: model,
      brand,
      selectedVariants: [...selectedVariants],
      productionCountry,
      warrantyPeriod,
      timestamp: Date.now()
    });
    
    setSelectedVariants([]);
    setCurrentView('model');
  };

  if (!model) return null;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.3 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="w-full max-w-none mx-auto pt-8"
    >
      <motion.div variants={itemAnim} className="mb-10">
        <button
          onClick={() => setCurrentView('model')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 text-sm font-bold mb-6 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('variant.back', 'Back to Models')}
        </button>
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {model.name}
          </h2>
          {getModelTags(model.id).includes('New Launch') && (
            <span className="bg-gradient-to-r from-orange-50 to-orange-100 text-[#F68B1E] text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-widest border border-orange-200/50">
              {t('model.newLaunch', 'New Launch')}
            </span>
          )}
        </div>
        <p className="text-gray-500 font-medium">{t('variant.desc', 'Select colors and storage configurations.')}</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        {variants.length > 0 ? (
          <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {variants.map((variant) => {
              const allSelected = variant.storageOptions.length > 0 && variant.storageOptions.every(s => isSelected(variant.id, s));
              
              return (
                <motion.div variants={itemAnim} key={variant.id} className="bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/20 flex flex-col h-full">
                  <div className="flex flex-col p-6 bg-gradient-to-b from-gray-50/50 to-gray-50 border-b border-gray-200/60 shrink-0">
                    <div className="aspect-square bg-white border border-gray-200/60 rounded-2xl shadow-sm mb-4 p-2 relative group overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        src={variant.thumbnailUrl}
                        alt={variant.color}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover rounded-xl transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 truncate">{variant.color}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col bg-white">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest shrink-0">{t('variant.header', 'Variants (RAM/ROM)')}</span>
                      <button 
                        onClick={() => selectAllForVariant(variant.id, variant.storageOptions)}
                        className="text-[11px] font-extrabold uppercase tracking-widest text-[#F68B1E] hover:text-orange-700 transition-colors"
                      >
                        {allSelected ? t('variant.deselectAll', 'Deselect All') : t('variant.selectAll', 'Select All')}
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {variant.storageOptions.map(storage => {
                        const inQueue = isVariantInQueue(variant.id, storage);
                        const queuedVar = inQueue ? getQueuedVariant(variant.id, storage) : null;
                        const checked = isSelected(variant.id, storage) || inQueue;
                        const selectedVar = selectedVariants.find(v => v.variantId === variant.id && v.storage === storage);
                        
                        return (
                          <motion.div 
                            layout
                            key={storage} 
                            onClick={() => toggleVariantSelection(variant.id, storage)}
                            className={`flex flex-col p-4 rounded-2xl border-2 transition-all overflow-hidden ${inQueue ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${
                              checked 
                                ? 'bg-orange-50/50 border-[#F68B1E] shadow-sm shadow-orange-500/10' 
                                : 'bg-white border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full pointer-events-none">
                              <div className="flex flex-col gap-0.5">
                                <span className={`font-bold text-sm ${checked ? 'text-[#F68B1E]' : 'text-gray-700'}`}>{storage}</span>
                                {inQueue && <span className="text-[10px] font-extrabold text-[#F68B1E] uppercase tracking-wider">{t('variant.inQueue', 'In Queue')}</span>}
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                checked ? 'bg-[#F68B1E] border-[#F68B1E] text-white' : 'border-gray-200 bg-gray-50'
                              }`}>
                                <AnimatePresence>
                                  {checked && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                    >
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {checked && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                >
                                  <input 
                                    type="text"
                                    disabled={inQueue}
                                    placeholder={t('variant.sku', 'Supplier SKU (Optional)')}
                                    value={inQueue ? (queuedVar?.supplierSku || '') : (selectedVar?.supplierSku || '')}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => updateSupplierSku(variant.id, storage, e.target.value)}
                                    className="w-full bg-white border border-gray-200/60 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#F68B1E] focus:ring-2 focus:ring-[#F68B1E]/20 transition-all placeholder:text-gray-400 placeholder:font-medium shadow-inner disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
           <motion.div variants={itemAnim} className="bg-white/80 backdrop-blur-lg border border-gray-200/60 rounded-3xl p-16 text-center shadow-lg shadow-gray-200/20">
            <p className="text-gray-500 font-medium text-base">{t('variant.none', 'No variants available for this model.')}</p>
          </motion.div>
        )}
      </div>

      <motion.div variants={itemAnim} className="w-full lg:w-80 shrink-0">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-xl shadow-gray-200/40 sticky top-28 overflow-hidden">
          <div className="p-6 border-b border-gray-200/60 bg-gradient-to-b from-gray-50/50 to-transparent">
            <h3 className="font-extrabold text-lg text-gray-900">{t('variant.batchSettings', 'Batch Settings')}</h3>
            <p className="text-gray-500 font-medium text-xs mt-1">{t('variant.applies', 'Applies to all selected items')}</p>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {t('variant.origin', 'Production Origin')}
              </label>
              <div className="relative">
                <CustomSelect 
                  value={productionCountry}
                  onChange={val => {
                    setProductionCountry(val);
                    if (val && warrantyPeriod) setFormError('');
                  }}
                  options={[
                    { value: 'Egypt', label: t('Egypt', 'Egypt') },
                    { value: 'China', label: t('China', 'China') },
                    { value: 'Vietnam', label: t('Vietnam', 'Vietnam') },
                    { value: 'China, Egypt', label: t('China, Egypt', 'China, Egypt') }
                  ]}
                  placeholder={t('variant.selectCountry', 'Select Country')}
                  error={!productionCountry && !!formError}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {t('variant.warranty', 'Warranty Period')}
              </label>
              <div className="relative">
                <CustomSelect 
                  value={warrantyPeriod}
                  onChange={val => {
                    setWarrantyPeriod(val);
                    if (val && productionCountry) setFormError('');
                  }}
                  options={[
                    { value: 'No Warranty', label: t('No Warranty', 'No Warranty') },
                    { value: '6 Months', label: t('6 Months', '6 Months') },
                    { value: '1 Year', label: t('1 Year', '1 Year') },
                    { value: '18 Months', label: t('18 Months', '18 Months') },
                    { value: '2 Years', label: t('2 Years', '2 Years') }
                  ]}
                  placeholder={t('variant.selectWarranty', 'Select Warranty')}
                  error={!warrantyPeriod && !!formError}
                />
              </div>
            </div>
            
            <AnimatePresence>
              {formError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -5 }}
                  className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{formError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-gradient-to-b from-gray-50/50 to-gray-50 border-t border-gray-200/60">
            <div className="flex items-center justify-between mb-5">
              <span className="text-gray-500 font-bold text-sm">{t('variant.selectedItems', 'Selected Items')}</span>
              <motion.span 
                key={selectedVariants.length}
                initial={{ scale: 1.5, color: '#F68B1E' }}
                animate={{ scale: 1, color: '#111827' }}
                className="bg-white border border-gray-200 shadow-sm text-gray-900 font-extrabold px-3 py-1 rounded-lg text-sm"
              >
                {selectedVariants.length}
              </motion.span>
            </div>
            
            <div>
              <motion.button 
                whileHover={selectedVariants.length > 0 ? { scale: 1.02 } : {}}
                whileTap={selectedVariants.length > 0 ? { scale: 0.98 } : {}}
                onClick={handleAddToQueue}
                disabled={selectedVariants.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-gray-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                {t('variant.addToQueue', 'Add to Queue')}
              </motion.button>
            </div>
            
            <AnimatePresence>
              {selectedVariants.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-start gap-2.5 text-gray-400 text-xs font-medium"
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{t('variant.hint', 'Select at least one variant configuration to add to your export queue.')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
};

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder,
  error 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: {value: string, label: string}[];
  placeholder: string;
  error?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
            : isOpen 
              ? 'border-[#F68B1E] ring-2 ring-[#F68B1E]/20' 
              : 'border-gray-200 hover:border-gray-300'
        } rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 focus:outline-none transition-all cursor-pointer shadow-sm`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? <bdi>{options.find(o => o.value === value)?.label}</bdi> : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${
                    value === option.value 
                      ? 'bg-orange-50 text-[#F68B1E]' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <bdi>{option.label}</bdi>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
