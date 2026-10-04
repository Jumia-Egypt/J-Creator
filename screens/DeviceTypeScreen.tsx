import React from 'react';
import { useStore } from '../Store';
import { deviceTypes, refurbDeviceTypes } from '../data';
import { motion } from 'motion/react';
import { Smartphone, MonitorPlay, ChevronRight, ArrowLeft } from 'lucide-react';

export const DeviceTypeScreen = () => {
  const { setSelectedDeviceType, setCurrentView, selectedCondition } = useStore();
  const types = selectedCondition === 'refurbished' ? refurbDeviceTypes : deviceTypes;

  const handleSelect = (id: string) => {
    setSelectedDeviceType(id);
    setCurrentView('brand');
  };

  const getIcon = (id: string) => {
    if (id.includes('android')) return <Smartphone className="w-6 h-6" />;
    if (id.includes('ios')) return <Smartphone className="w-6 h-6" />;
    if (id.includes('feature')) return <MonitorPlay className="w-6 h-6" />;
    return <Smartphone className="w-6 h-6" />;
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
          onClick={() => setCurrentView('condition')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 text-sm font-bold mb-6 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Condition
        </button>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Select Ecosystem
        </h2>
        <p className="text-gray-500 font-medium">Narrow down the operating system or device type.</p>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((type) => (
            <motion.button
              variants={item}
              whileHover={type.available ? { y: -4, scale: 1.01 } : {}}
              whileTap={type.available ? { scale: 0.98 } : {}}
              key={type.id}
              disabled={!type.available}
              onClick={() => handleSelect(type.id)}
              className={`relative flex items-center p-6 rounded-3xl border text-left transition-colors group ${
                type.available 
                  ? 'bg-white border-gray-200/60 hover:border-[#F68B1E]/40 hover:shadow-xl hover:shadow-orange-500/5 cursor-pointer' 
                  : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`mr-5 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                type.available 
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 text-[#F68B1E] group-hover:from-[#E87B10] group-hover:to-[#F9A246] group-hover:text-white group-hover:shadow-md' 
                  : 'bg-gray-200/50 text-gray-400'
              }`}>
                {getIcon(type.id)}
              </div>
              
              <div className="flex-1">
                <span className={`block font-bold text-lg mb-1 ${type.available ? 'text-gray-900 group-hover:text-[#F68B1E] transition-colors' : 'text-gray-400'}`}>
                  {type.name}
                </span>
                {!type.available && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Coming Soon</span>
                )}
              </div>

              {type.available && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F68B1E] transition-colors" />}
            </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};
