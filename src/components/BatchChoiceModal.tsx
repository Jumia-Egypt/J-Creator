import React from 'react';
import { motion } from 'motion/react';
import { FileDown, Users, ChevronRight } from 'lucide-react';
import { HandledBy } from '../types';
import { useT } from '../i18n';

interface Props {
  busy: boolean;
  onChoose: (choice: HandledBy) => void;
  onCancel: () => void;
}

// Shown when the vendor presses Submit Batch: who creates the products?
export const BatchChoiceModal = ({ busy, onChoose, onCancel }: Props) => {
  const { t } = useT();

  const options: { choice: HandledBy; icon: React.ReactNode; title: string; desc: string }[] = [
    {
      choice: 'vendor',
      icon: <FileDown className="w-6 h-6" />,
      title: t('choice.selfTitle', 'Download the sheet and upload it myself'),
      desc: t('choice.selfDesc', 'You get the ready-to-upload sheet now and upload it to Jumia Vendor Center yourself.'),
    },
    {
      choice: 'content-team',
      icon: <Users className="w-6 h-6" />,
      title: t('choice.teamTitle', 'Let the content team do it'),
      desc: t('choice.teamDesc', 'Our content team will create the products for you. Nothing else is needed from you.'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      onClick={() => { if (!busy) onCancel(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200/80"
      >
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          {t('choice.title', 'How do you want to proceed?')}
        </h2>
        <p className="text-gray-500 text-sm font-semibold mt-1">
          {t('choice.desc', 'Choose who creates these products on Jumia Vendor Center.')}
        </p>

        <div className="mt-6 space-y-3">
          {options.map(o => (
            <button
              key={o.choice}
              disabled={busy}
              onClick={() => onChoose(o.choice)}
              className="w-full flex items-center gap-4 text-start p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#F68B1E] hover:bg-orange-50/40 transition-colors disabled:opacity-60 cursor-pointer group"
            >
              <span className="shrink-0 w-12 h-12 rounded-2xl bg-orange-50 text-[#F68B1E] border border-orange-100 flex items-center justify-center">
                {o.icon}
              </span>
              <span className="flex-1">
                <span className="block font-extrabold text-gray-900 text-sm">{o.title}</span>
                <span className="block text-gray-500 text-xs font-semibold mt-0.5">{o.desc}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F68B1E] rtl:rotate-180 shrink-0" />
            </button>
          ))}
        </div>

        <button
          disabled={busy}
          onClick={onCancel}
          className="mt-5 w-full text-xs font-bold text-gray-500 hover:text-gray-700 py-2 disabled:opacity-60 cursor-pointer"
        >
          {t('choice.cancel', 'Back to my batch')}
        </button>
      </motion.div>
    </motion.div>
  );
};
