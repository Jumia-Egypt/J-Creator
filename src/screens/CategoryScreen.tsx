import React from 'react';
import { useStore } from '../Store';
import { categories } from '../data';
import { motion } from 'motion/react';
import { Smartphone, Laptop, Watch, Headphones, Tablet, Camera, Tv, Speaker, ChevronRight } from 'lucide-react';

const icons = {
  Smartphone, Laptop, Watch, Headphones, Tablet, Camera, Tv, Speaker
};

export const CategoryScreen = () => {
  const { setSelectedCategory, setCurrentView } = useStore();

  const handleSelect = (id: string) => {
    setSelectedCategory(id);
    setCurrentView('condition');
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
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Select Category
        </h2>
        <p className="text-gray-500 font-medium">Choose a primary product category to configure its catalog variants.</p>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const IconComponent = icons[cat.icon as keyof typeof icons] || Smartphone;
          return (
            <motion.button
              variants={item}
              whileHover={cat.available ? { y: -4, scale: 1.01 } : {}}
              whileTap={cat.available ? { scale: 0.98 } : {}}
              key={cat.id}
              disabled={!cat.available}
              onClick={() => handleSelect(cat.id)}
              className={`relative flex flex-col p-6 rounded-3xl border text-left transition-colors ${
                cat.available 
                  ? 'bg-white border-gray-200/60 hover:border-[#F68B1E]/40 hover:shadow-xl hover:shadow-orange-500/5 cursor-pointer group' 
                  : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
              }`}
            >
              {!cat.available && (
                <div className="absolute top-5 right-5 bg-gray-200/80 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest backdrop-blur-sm">
                  Soon
                </div>
              )}
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                cat.available 
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 text-[#F68B1E] group-hover:from-[#E87B10] group-hover:to-[#F9A246] group-hover:text-white group-hover:shadow-md' 
                  : 'bg-gray-200/50 text-gray-400'
              }`}>
                <IconComponent className="w-7 h-7" />
              </div>
              
              <div className="flex items-center justify-between w-full mt-auto">
                <span className={`font-bold text-lg ${cat.available ? 'text-gray-900 group-hover:text-[#F68B1E] transition-colors' : 'text-gray-400'}`}>
                  {cat.name}
                </span>
                {cat.available && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F68B1E] transition-colors" />}
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
