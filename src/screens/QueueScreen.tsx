import React, { useState } from 'react';
import { useStore } from '../Store';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Trash2, Settings2, FileSpreadsheet, Plus } from 'lucide-react';
import { getVariantsByModelId } from '../data';
import { useT } from '../i18n';
import { BatchChoiceModal } from '../components/BatchChoiceModal';
import { downloadBatchSheet } from '../downloadSheet';
import { HandledBy, Submission } from '../types';

export const QueueScreen = () => {
  const { 
    queue, 
    removeFromQueue,
    removeVariantFromQueue,
    clearQueue, 
    setCurrentView, 
    shopName, 
    addSubmission
  } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const { t, isAr } = useT();

  const totalItems = queue.reduce((acc, item) => acc + item.selectedVariants.length, 0);

  const getColorName = (modelId: string, variantId: string) => {
    const variants = getVariantsByModelId(modelId);
    const v = variants.find(v => v.id === variantId);
    return v ? v.color : variantId;
  };

  const getBarcode = (modelId: string, variantId: string, storage: string) => {
    const variants = getVariantsByModelId(modelId);
    const v = variants.find(v => v.id === variantId);
    return v?.storageBarcodes?.[storage];
  };

  const createBatchSubmission = (handledBy: HandledBy): Submission => {
    const totalVariantsCount = queue.reduce((acc, item) => acc + item.selectedVariants.length, 0);
    const brandsList: string[] = Array.from(new Set<string>(queue.map(q => q.brand.name)));
    
    const allSubmissionItems = queue.flatMap(item => 
      item.selectedVariants.map(v => ({
        brandName: item.brand.name,
        modelName: item.modelFamily.name,
        variantId: v.variantId,
        colorName: getColorName(item.modelFamily.id, v.variantId),
        storage: v.storage,
        productionCountry: item.productionCountry,
        warrantyPeriod: item.warrantyPeriod,
        supplierSku: v.supplierSku,
        barcode: getBarcode(item.modelFamily.id, v.variantId, v.storage)
      }))
    );

    // Real uuid — used as both the display id and submissions.batch_id in
    // the sandbox DB, so a page reload shows the exact same batch identity
    // as the optimistic just-submitted view.
    const batchId = crypto.randomUUID();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const submission: Submission = {
      id: batchId,
      batchId: batchId,
      shopName: shopName || 'Default Store',
      date: dateStr,
      itemsCount: totalVariantsCount,
      brands: brandsList,
      status: 'Processed',
      items: allSubmissionItems,
      timestamp: Date.now(),
      handledBy
    };
    addSubmission(submission);
    return submission;
  };

  // Submit Batch first asks who creates the products.
  const handleExport = () => setShowChoice(true);

  const handleChoose = async (choice: HandledBy) => {
    setIsExporting(true);
    const submission = createBatchSubmission(choice);

    if (choice === 'vendor') {
      // The batch is already recorded; if the download fails the vendor can
      // download again from the confirmation screen.
      try {
        await downloadBatchSheet(submission.items, submission.shopName, submission.date);
      } catch (err) {
        console.error('Vendor sheet download failed', err);
        alert(t('choice.downloadFailed', 'Your batch was submitted, but the sheet could not be downloaded. You can download it again on the next screen.'));
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    clearQueue();
    setIsExporting(false);
    setShowChoice(false);
    setCurrentView('export');
  };

  const containerAnim = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  };

  if (queue.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center py-24"
      >
        <div className="w-24 h-24 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-3xl flex items-center justify-center text-gray-300 mb-8 shadow-xl shadow-gray-200/20">
          <Package className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">{t('queue.emptyTitle', 'Empty Queue')}</h2>
        <p className="text-gray-500 font-medium mb-10">{t('queue.emptyDesc', 'Add some product variants to build your batch.')}</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentView('category')}
          className="bg-gray-900 hover:bg-black text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-gray-900/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> {t('queue.browse', 'Browse Catalog')}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerAnim}
      initial="hidden"
      animate="show"
      className="max-w-none mx-auto w-full pt-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
        <motion.div variants={itemAnim}>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('queue.title', 'Export Queue')}</h2>
          <p className="text-gray-500 font-medium mt-1">{t('queue.review', 'Review your selections before finalizing.')}</p>
        </motion.div>
        
        <motion.div variants={itemAnim} className="flex items-center gap-3">
          <button
            onClick={clearQueue}
            className="bg-white/80 backdrop-blur-md border border-gray-200/60 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors shadow-sm"
          >
            {t('queue.clearAll', 'Clear All')}
          </button>
          <div className="bg-white/80 backdrop-blur-md border border-gray-200/60 px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-lg shadow-gray-200/20 text-gray-700">
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4 text-[#F68B1E]" />
            </div>
            {isAr ? `${totalItems} ${t('queue.total', '')}` : `${totalItems} total variant${totalItems !== 1 ? 's' : ''}`}
          </div>
        </motion.div>
      </div>

      <motion.div className="space-y-6 mb-12">
        <AnimatePresence>
          {queue.map((item) => (
            <motion.div 
              layout
              variants={itemAnim}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              key={item.id} 
              className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-3xl p-6 shadow-lg shadow-gray-200/20 flex flex-col sm:flex-row gap-6 relative group"
            >
              <button 
                onClick={() => removeFromQueue(item.id)}
                className="absolute top-5 end-5 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                title={t('queue.removeItem', 'Remove from queue')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="flex-1">
                <div className="mb-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">{item.brand.name}</div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{item.modelFamily.name}</h3>
                </div>
                
                <div className="flex flex-wrap gap-2.5 mb-6 pe-12">
                  {item.selectedVariants.map((v, i) => (
                    <span key={i} className="group/variant relative inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200/60 bg-gray-50 text-gray-700 text-xs font-bold shadow-sm pe-8">
                      {getColorName(item.modelFamily.id, v.variantId)} <span className="mx-2 text-gray-300">•</span> {v.storage}
                      {v.supplierSku && (
                        <span className="ml-2 pl-2 border-l border-gray-100 text-gray-500 font-medium">{t('queue.skuLabel', 'SKU:')} {v.supplierSku}</span>
                      )}
                      <button
                        onClick={() => removeVariantFromQueue(item.id, v.variantId, v.storage)}
                        className="absolute end-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title={t('queue.removeVariant', 'Remove variant')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-5 text-xs bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/60 inline-flex items-center text-gray-600">
                  <Settings2 className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">{t('queue.origin', 'Origin:')}</span>
                    <span className="font-bold text-gray-900">{t(item.productionCountry, item.productionCountry)}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">{t('queue.warranty', 'Warranty:')}</span>
                    <span className="font-bold text-gray-900">{t(item.warrantyPeriod, item.warrantyPeriod)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row items-center justify-between p-8 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-xl shadow-gray-200/40 gap-6">
        <div>
          <div className="font-extrabold text-lg text-gray-900">{t('queue.ready', 'Ready to finalize?')}</div>
          <div className="text-gray-500 font-medium text-sm mt-1">{t('queue.readyDesc', 'This will generate a formatted CSV for the vendor portal.')}</div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('category')}
            className="px-5 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            {t('queue.addMore', 'Add More')}
          </motion.button>
          
          <motion.button 
            whileHover={!isExporting ? { scale: 1.02 } : {}}
            whileTap={!isExporting ? { scale: 0.98 } : {}}
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-[#F68B1E] hover:bg-[#E87B10] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors disabled:opacity-70 shadow-lg shadow-orange-500/20 border border-[#F68B1E] cursor-pointer"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>{t('queue.submit', 'Submit Batch')}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {showChoice && (
        <BatchChoiceModal busy={isExporting} onChoose={handleChoose} onCancel={() => setShowChoice(false)} />
      )}
    </motion.div>
  );
};
