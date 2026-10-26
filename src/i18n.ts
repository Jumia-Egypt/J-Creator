import { useStore } from './Store';

export type Lang = 'en' | 'ar';

// UI text only. Category names, brands, model families, ecosystem names,
// colors, storage and the Admin Portal intentionally stay in English.
const ar: Record<string, string> = {
  // Landing
  'landing.tagline': 'أنشئ منتجاتك بشكل أسرع وأسهل وفي وقت قصير.',
  'landing.storeName': 'اسم المتجر',
  'landing.placeholder': 'اكتب اسم متجرك',
  'landing.error': 'من فضلك أدخل اسم متجرك قبل بدء الدفعة.',
  'landing.start': 'ابدأ دفعة جديدة',
  'landing.admin': 'بوابة الإدارة',

  // Header / store name modal
  'header.activeStore': 'المتجر الحالي',
  'header.changeStore': 'تغيير اسم المتجر',
  'header.storeVendorName': 'اسم المتجر / البائع',
  'header.cancel': 'إلغاء',
  'header.saveStore': 'حفظ اسم المتجر',
  'header.language': 'English',

  // Wizard steps
  'step.category': 'الفئة',
  'step.deviceType': 'نوع الجهاز',
  'step.brand': 'العلامة التجارية',
  'step.model': 'الموديل',
  'step.variants': 'الخيارات',

  // Category (only the "Soon" badge; category names stay English)
  'category.soon': 'قريباً',

  // Ecosystem
  'device.backCategories': 'العودة إلى الفئات',
  'device.title': 'اختر النظام',
  'device.desc': 'حدد نظام التشغيل أو نوع الجهاز.',
  'device.soon': 'قريباً',

  // Brand
  'brand.back': 'العودة إلى النظام',
  'brand.title': 'اختر العلامة التجارية',
  'brand.desc': 'اختر الشركة المصنّعة الأصلية.',

  // Model
  'model.backBrands': 'العودة إلى العلامات التجارية',
  'model.backEcosystem': 'العودة إلى النظام',
  'model.title': 'عائلة الموديلات',
  'model.desc': 'اختر خط المنتج المحدد لإعداده.',
  'model.newLaunch': 'إصدار جديد',
  'model.empty': 'لا توجد موديلات متاحة لهذه العلامة التجارية.',

  // Variants
  'variant.back': 'العودة إلى الموديلات',
  'variant.desc': 'اختر الألوان وسعات التخزين.',
  'variant.header': 'الخيارات (الرام/التخزين)',
  'variant.selectAll': 'تحديد الكل',
  'variant.deselectAll': 'إلغاء تحديد الكل',
  'variant.inQueue': 'في القائمة',
  'variant.sku': 'رمز المورد (اختياري)',
  'variant.none': 'لا توجد خيارات متاحة لهذا الموديل.',
  'variant.batchSettings': 'إعدادات الدفعة',
  'variant.applies': 'تُطبّق على جميع العناصر المحددة',
  'variant.origin': 'بلد المنشأ',
  'variant.selectCountry': 'اختر البلد',
  'variant.warranty': 'فترة الضمان',
  'variant.selectWarranty': 'اختر الضمان',
  'variant.formError': 'من فضلك اختر بلد المنشأ وفترة الضمان للمتابعة.',
  'variant.selectedItems': 'العناصر المحددة',
  'variant.addToQueue': 'أضف إلى القائمة',
  'variant.hint': 'اختر خياراً واحداً على الأقل لإضافته إلى قائمة التصدير.',

  // Origin / warranty values (display only; stored values stay English)
  'Egypt': 'مصر',
  'China': 'الصين',
  'Vietnam': 'فيتنام',
  'China, Egypt': 'الصين، مصر',
  'No Warranty': 'بدون ضمان',
  '6 Months': '6 أشهر',
  '1 Year': 'سنة',
  '18 Months': '18 شهراً',
  '2 Years': 'سنتان',

  // Queue
  'queue.emptyTitle': 'القائمة فارغة',
  'queue.emptyDesc': 'أضف بعض خيارات المنتجات لإنشاء دفعتك.',
  'queue.browse': 'تصفّح الكتالوج',
  'queue.title': 'قائمة التصدير',
  'queue.review': 'راجع اختياراتك قبل الإنهاء.',
  'queue.clearAll': 'مسح الكل',
  'queue.total': 'إجمالي الخيارات',
  'queue.removeItem': 'إزالة من القائمة',
  'queue.removeVariant': 'إزالة الخيار',
  'queue.skuLabel': 'رمز المورد:',
  'queue.origin': 'المنشأ:',
  'queue.warranty': 'الضمان:',
  'queue.ready': 'هل أنت مستعد للإنهاء؟',
  'queue.readyDesc': 'سيتم إنشاء ملف CSV منسّق لبوابة البائعين.',
  'queue.addMore': 'إضافة المزيد',
  'queue.submit': 'إرسال الدفعة',

  // Export confirmation
  'export.badge': 'تم التسجيل بنجاح',
  'export.title': 'تم تأكيد الإرسال',
  'export.desc': 'تم إرسال دفعتك وإضافتها إلى سجل العمليات النشط.',
  'export.vendorStore': 'متجر البائع',
  'export.variantsCount': 'عدد الخيارات',
  'export.items': 'عنصر',
  'export.submittedItems': 'العناصر المرسلة',
  'export.startNew': 'ابدأ دفعة جديدة',
  'export.selfTitle': 'كيفية رفع الملف',
  'export.stepPress': 'اضغط على',
  'export.stepType': 'اضغط على Type Box ثم اختر',
  'export.stepAction': 'اضغط على Action Box ثم اختر',
  'export.stepShop': 'سيظهر اسم المتجر',
  'export.stepDrop': 'اسحب الملف الذي تم تنزيله وأفلته في منطقة الرفع',
  'export.downloadAgain': 'تنزيل الملف مرة أخرى',
  'export.downloadFailed': 'تعذّر تنزيل الملف. يرجى المحاولة مرة أخرى.',
  'export.teamTitle': 'فريق المحتوى سيتولى الباقي',
  'export.teamDesc': 'سيقوم فريق المحتوى لدينا بإنشاء منتجاتك. لا تحتاج إلى فعل أي شيء آخر.',

  // Who creates the products (shown after Submit Batch)
  'choice.title': 'كيف تريد المتابعة؟',
  'choice.desc': 'اختر من سيقوم بإنشاء هذه المنتجات على بوابة جوميا للبائعين.',
  'choice.selfTitle': 'تنزيل الملف ورفعه بنفسي',
  'choice.selfDesc': 'ستحصل على الملف الجاهز للرفع الآن وترفعه بنفسك على بوابة جوميا للبائعين.',
  'choice.teamTitle': 'دع فريق المحتوى يتولى ذلك',
  'choice.teamDesc': 'سيقوم فريق المحتوى لدينا بإنشاء المنتجات نيابةً عنك. لا يلزم منك أي إجراء آخر.',
  'choice.cancel': 'العودة إلى دفعتي',
  'choice.downloadFailed': 'تم إرسال دفعتك، لكن تعذّر تنزيل الملف. يمكنك تنزيله مرة أخرى في الشاشة التالية.',

  // New version notice
  'update.ready': 'يتوفر إصدار جديد. سيتم التحديث تلقائيًا فور انتهائك من هذه الخطوة.',
  'update.now': 'حدّث الآن',
  'update.confirm': 'اختياراتك في هذه الشاشة لم تُضف إلى القائمة بعد وستُفقد. هل تريد التحديث الآن؟',
};

// Returns a translator: `t('landing.start', 'Start New Batch')`. The English
// text lives at the call site (so English output is byte-for-byte unchanged);
// in Arabic mode the key is looked up, falling back to the English text.
export const useT = () => {
  const { lang } = useStore();
  // The page layout stays left-to-right in Arabic. An invisible right-to-left
  // mark at the end of each Arabic text keeps its final punctuation (. : ؟)
  // on the correct side of the sentence without moving anything.
  const RLM = '‏';
  const t = (key: string, en: string) => (lang === 'ar' ? (ar[key] !== undefined ? ar[key] + RLM : en) : en);
  return { t, lang, isAr: lang === 'ar' };
};
