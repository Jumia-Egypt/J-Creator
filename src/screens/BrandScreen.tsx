import React from 'react';
import { useStore } from '../Store';
import { getBrandsByDeviceType } from '../data';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export const BrandScreen = () => {
  const { selectedDeviceType, selectedCondition, setSelectedBrandId, setCurrentView } = useStore();
  const activeBrands = selectedDeviceType ? getBrandsByDeviceType(selectedDeviceType, selectedCondition || 'new') : [];

  const handleSelect = (id: string) => {
    setSelectedBrandId(id);
    setCurrentView('model');
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
          onClick={() => setCurrentView('device-type')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 text-sm font-bold mb-6 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Ecosystem
        </button>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Select Brand
        </h2>
        <p className="text-gray-500 font-medium">Choose the original manufacturer.</p>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {activeBrands.map((brand) => (
          <motion.button
            variants={item}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            key={brand.id}
            onClick={() => handleSelect(brand.id)}
            className="flex items-center justify-center p-6 bg-white border border-gray-200/60 rounded-3xl hover:border-[#F68B1E]/40 hover:shadow-xl hover:shadow-orange-500/5 transition-colors group aspect-video"
          >
            <span className="font-extrabold text-xl tracking-tight text-gray-700 group-hover:text-[#F68B1E] group-hover:scale-110 transition-all text-center">
              {brand.name}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};
