import React, { useState } from 'react';
import { useStore } from '../Store';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Store, Package, Layers, FileDown, Users } from 'lucide-react';
import { useT } from '../i18n';
import { downloadBatchSheet } from '../downloadSheet';

// A button or menu name the vendor has to look for in Vendor Center.
const chip = 'px-3 py-1 rounded-xl bg-white border border-orange-200 font-extrabold text-gray-900 text-sm shadow-sm';
// White circle with an orange ring: dark number keeps good contrast.
const stepNumber = 'w-7 h-7 rounded-full bg-white border-2 border-[#F68B1E] text-gray-900 text-xs font-extrabold flex items-center justify-center shrink-0';
const chevron = 'w-4 h-4 text-gray-400 shrink-0 rtl:rotate-180';

export const ExportScreen = () => {
  const { t } = useT();
  const { queue, clearQueue, setCurrentView, lastSubmission, shopName } = useStore();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadAgain = async () => {
    if (!lastSubmission) return;
    setDownloading(true);
    try {
      await downloadBatchSheet(lastSubmission.items, lastSubmission.shopName, lastSubmission.date);
    } catch (err) {
      console.error('Vendor sheet download failed', err);
      alert(t('export.downloadFailed', 'The sheet could not be downloaded. Please try again.'));
    } finally {
      setDownloading(false);
    }
  };

  const activeCount = lastSubmission?.itemsCount || queue.reduce((acc, item) => acc + item.selectedVariants.length, 0);
  const activeShop = lastSubmission?.shopName || shopName || 'Default Store';
  const activeItems = lastSubmission?.items || [];
  // A second card (upload steps or content-team note) sits next to the confirmation.
  const hasInfoCard = lastSubmission?.handledBy === 'vendor' || lastSubmission?.handledBy === 'content-team';

  const handleDone = () => {
    clearQueue();
    setCurrentView('landing');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex-1 flex flex-col items-center justify-center py-12 mx-auto w-full px-4 ${hasInfoCard ? 'max-w-6xl' : 'max-w-3xl'}`}
    >
      <div className={`w-full grid grid-cols-1 gap-6 ${hasInfoCard ? 'lg:grid-cols-5' : ''}`}>
        {lastSubmission?.handledBy === 'vendor' && (
          <div className="lg:col-span-2 bg-orange-50/60 border border-orange-200/70 rounded-3xl p-6 sm:p-8 text-start shadow-xl shadow-orange-100/50">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-white border border-orange-200 text-[#F68B1E] flex items-center justify-center shrink-0 shadow-sm">
                <FileDown className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                {t('export.selfTitle', 'How to upload the file')}
              </h3>
            </div>

            <ol className="mt-5 space-y-4 text-sm font-semibold text-gray-700">
              <li className="flex items-start gap-3">
                <span className={stepNumber}>1</span>
                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2 pt-0.5">
                  <span>{t('export.stepPress', 'Press')}</span>
                  <span className={chip}>Products</span>
                  <ChevronRight className={chevron} aria-hidden="true" />
                  <span className={chip}>Add Products</span>
                  <ChevronRight className={chevron} aria-hidden="true" />
                  <span className={chip}>Add Multiple Products</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className={stepNumber}>2</span>
                <div className="flex-1 min-w-0 space-y-2.5 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t('export.stepType', 'Press Type Box and choose')}</span>
                    <span className={chip}>Product</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t('export.stepAction', 'Press Action Box and choose')}</span>
                    <span className={chip}>Create Products</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className={stepNumber}>3</span>
                <div className="flex-1 min-w-0 space-y-2.5 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t('export.stepPress', 'Press')}</span>
                    <span className={chip}>Next</span>
                  </div>
                  <div>{t('export.stepShop', 'The Shop name will be displayed')}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t('export.stepPress', 'Press')}</span>
                    <span className={chip}>Next</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className={stepNumber}>4</span>
                <div className="flex-1 min-w-0 font-extrabold text-gray-900 pt-0.5">
                  {t('export.stepDrop', 'Drop the downloaded file in the upload area')}
                </div>
              </li>
            </ol>

            <button
              onClick={handleDownloadAgain}
              disabled={downloading}
              className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-orange-200 text-[#F68B1E] hover:bg-orange-50 font-bold text-sm transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              {t('export.downloadAgain', 'Download the sheet again')}
            </button>
          </div>
        )}
        {lastSubmission?.handledBy === 'content-team' && (
          <div className="lg:col-span-2 bg-blue-50/60 border border-blue-200/70 rounded-3xl p-6 sm:p-8 text-start flex items-start gap-3 shadow-xl shadow-blue-100/50 self-start">
            <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-extrabold text-gray-900 text-sm">{t('export.teamTitle', 'The content team will take it from here')}</div>
              <p className="text-gray-600 text-xs font-semibold mt-1">
                {t('export.teamDesc', 'Our content team will create your products. You do not need to do anything else.')}
              </p>
            </div>
          </div>
        )}
        <div className={`w-full bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 sm:p-10 text-center shadow-2xl shadow-gray-200/40 relative overflow-hidden space-y-6 ${hasInfoCard ? 'lg:col-span-3' : ''}`}>
        
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        
          <div className="relative z-10 space-y-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200/80 shadow-xl shadow-emerald-500/10"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
          
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-extrabold uppercase tracking-widest border border-emerald-200 mb-2">
                {t('export.badge', 'Successfully Logged & Recorded')}
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {t('export.title', 'Submission Confirmed')}
              </h2>
              <p className="text-gray-500 text-sm font-semibold mt-1">
                {t('export.desc', 'Your vendor batch has been submitted and added to the active operations log.')}
              </p>
            </div>
          
            {/* Submission Info Summary Box */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 text-start space-y-3">
              <div className="grid grid-cols-2 gap-3 border-b border-gray-200/60 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">{t('export.vendorStore', 'Vendor Store')}</span>
                  <span className="font-bold text-gray-900 text-xs break-words block mt-0.5">
                    {activeShop}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">{t('export.variantsCount', 'Variants Count')}</span>
                  <span className="font-black text-[#F68B1E] text-sm block mt-0.5">
                    {activeCount} {t('export.items', 'items')}
                  </span>
                </div>
              </div>

              {/* Itemized List inside Submission Confirmation */}
              {activeItems.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">{t('export.submittedItems', 'Submitted Variant Items')} ({activeItems.length})</span>
                  <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1 font-sans text-xs">
                    {activeItems.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-white border border-gray-200/80 rounded-xl flex items-start justify-between gap-2">
                        <div className="min-w-0 break-words">
                          <span className="font-extrabold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded mr-1.5 text-[10px]">{item.brandName}</span>
                          <span className="font-bold text-gray-900">{item.modelName}</span>
                          <span className="text-gray-500 font-semibold ml-1">({item.variantId || item.colorName})</span>
                        </div>
                        <span className="text-gray-600 font-mono text-[11px] bg-gray-50 px-2 py-0.5 rounded border border-gray-200/60 shrink-0">
                          {item.storage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDone}
                className="w-full flex items-center justify-center gap-2 bg-[#F68B1E] hover:bg-[#E87B10] text-white font-bold py-3.5 px-6 rounded-xl transition-all text-xs shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                {t('export.startNew', 'Start New Batch')}
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
