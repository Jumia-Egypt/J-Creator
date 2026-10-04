import React from 'react';
import { useStore } from '../Store';
import { getModelFamiliesByBrand, getBrandById } from '../data';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Sparkles, Flame, Tag } from 'lucide-react';

export const ModelScreen = () => {
  const { selectedBrandId, selectedCondition, setSelectedModelId, setCurrentView, getModelTags } = useStore();
  const models = selectedBrandId ? getModelFamiliesByBrand(selectedBrandId, selectedCondition || 'new') : [];
  const brand = selectedBrandId ? getBrandById(selectedBrandId) : null;

  const handleSelect = (id: string) => {
    setSelectedModelId(id);
    setCurrentView('variant');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.3 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="max-w-none mx-auto w-full pt-8"
    >
      <motion.div variants={item} className="mb-12">
        <button 
          onClick={() => setCurrentView('brand')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 text-sm font-bold mb-6 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Brands
        </button>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Model Family {brand && <span className="text-gray-400 font-medium ml-2">/ {brand.name}</span>}
        </h2>
        <p className="text-gray-500 font-medium">Choose the specific product line to configure.</p>
      </motion.div>

      {models.length > 0 ? (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {models.map((model) => {
            const tags = getModelTags(model.id);
            const hasNewLaunch = tags.includes('New Launch');

            return (
              <motion.button
                variants={item}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                key={model.id}
                onClick={() => handleSelect(model.id)}
                className="relative flex items-center justify-between p-6 bg-white border border-gray-200/60 rounded-3xl hover:border-[#F68B1E]/40 hover:shadow-xl hover:shadow-orange-500/5 transition-colors text-left group"
              >
                <div>
                  <span className="block font-bold text-gray-900 text-lg mb-1.5 group-hover:text-[#F68B1E] transition-colors">
                    {model.name}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {hasNewLaunch && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-50 to-orange-100 text-[#F68B1E] text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-orange-200/60 shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5" /> New Launch
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F68B1E] transition-colors" />
              </motion.button>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={item} className="bg-white/80 backdrop-blur-lg border border-gray-200/60 rounded-3xl p-16 text-center shadow-lg shadow-gray-200/20">
          <p className="text-gray-500 font-medium text-base">No models available for this brand.</p>
        </motion.div>
      )}
    </motion.div>
  );
};
