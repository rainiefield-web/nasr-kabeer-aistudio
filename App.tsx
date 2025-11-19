
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { HeroScene, StructureGrid } from './components/IndustrialScene';
import { ProductCategoryGrid, ProductionProcessFlow, CapacityGrowthChart } from './components/Diagrams';
import { Menu, X, Download, MapPin, Mail, Linkedin, Twitter, ArrowRight, CheckCircle2, Globe, FileText, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES & CONTENT ---
type Language = 'en' | 'ar';

const content = {
  en: {
    nav: {
      about: "About",
      products: "Products",
      expansion: "Expansion",
      contact: "Get in Touch"
    },
    hero: {
      vision: "Vision 2030 Partner",
      titleLine1: "SHAPING",
      titleLine2: "EXCELLENCE",
      titleLine3: "IN EVERY PROFILE",
      desc: "A world-class manufacturing facility in Dammam Third Industrial City, delivering 200,000 tons of high-end profiles for the architectural, industrial, and transportation sectors.",
      btnProduct: "Discover Products",
      btnProfile: "Corporate Profile",
      scroll: "Scroll"
    },
    about: {
      subtitle: "Strategic Overview",
      title: "The Foundation of Modern Industry",
      p1: "Nasr Kabeer Aluminum Co., Ltd. represents a cornerstone investment in Saudi Arabia's industrial diversification. Located strategically in Dammam, we bridge the gap between raw material abundance and sophisticated engineering demand.",
      p2: "Our facility is integrated with the Kingdom's industrial ecosystem, benefiting from proximity to Ma'aden's aluminum smelter (80km) and direct access to King Abdulaziz Port for global exports.",
      statCapacity: "Tons/Year Capacity",
      statExport: "Export Target"
    },
    phases: {
      subtitle: "Growth Roadmap",
      title: "Phased Industrial Expansion",
      desc: "A calculated approach to market dominance, scaling from architectural essentials to advanced transportation components.",
      p1Title: "Architectural Foundation",
      p1Desc: "Establishment of 50,000 tons capacity focused on high-end curtain walls, windows, and structural profiles for NEOM and Red Sea Project.",
      p1Item1: "High-End Facades",
      p1Item2: "Thermal Break Systems",
      p2Title: "Industrial Diversification",
      p2Desc: "Expansion to 100,000 tons adding industrial capabilities for automation, solar energy mounting systems, and heavy machinery.",
      p2Item1: "Solar Frames",
      p2Item2: "Automation Profiles",
      p3Title: "Mobility & Transport",
      p3Desc: "Final expansion to 200,000 tons targeting the automotive (EV) and rail sectors with large-scale, high-strength extrusions.",
      p3Item1: "EV Battery Trays",
      p3Item2: "Rail Body Structures"
    },
    products: {
      subtitle: "Product Portfolio",
      title: "Engineered for Excellence"
    },
    process: {
      title: "Integrated Value Chain",
      desc: "Complete in-house control from casting to finishing ensures superior quality and traceability."
    },
    footer: {
      desc: "Forging the future of Saudi Arabia's industrial sector with precision aluminum solutions. Located in the heart of Dammam's industrial hub.",
      navTitle: "Navigation",
      contactTitle: "Contact Us",
      brochure: "Corporate Brochure",
      cr: "CR No.",
      unified: "Unified No.",
      rights: "© 2025 Nasr Kabeer Aluminum",
      privacy: "Privacy Policy",
      terms: "Terms of Use"
    }
  },
  ar: {
    nav: {
      about: "عن الشركة",
      products: "المنتجات",
      expansion: "التوسع",
      contact: "تواصل معنا"
    },
    hero: {
      vision: "شريك رؤية 2030",
      titleLine1: "صياغة",
      titleLine2: "التميز",
      titleLine3: "في كل قطاع",
      desc: "منشأة تصنيع عالمية المستوى في المدينة الصناعية الثالثة بالدمام، تنتج 200,000 طن من المقاطع عالية الجودة للقطاعات المعمارية والصناعية وقطاع النقل.",
      btnProduct: "اكتشف منتجاتنا",
      btnProfile: "الملف التعريفي",
      scroll: "تمرير"
    },
    about: {
      subtitle: "نظرة استراتيجية",
      title: "أساس الصناعة الحديثة",
      p1: "تمثل شركة نصر كبير للألمنيوم المحدودة استثماراً محورياً في التنوع الصناعي للمملكة العربية السعودية. بفضل موقعنا الاستراتيجي في الدمام، نسد الفجوة بين وفرة المواد الخام والطلب الهندسي المتطور.",
      p2: "منشأتنا متكاملة مع المنظومة الصناعية في المملكة، مستفيدة من قربها من مصهر معادن للألمنيوم (80 كم) والوصول المباشر إلى ميناء الملك عبد العزيز للتصدير العالمي.",
      statCapacity: "طن/سنة طاقة إنتاجية",
      statExport: "هدف التصدير"
    },
    phases: {
      subtitle: "خارطة الطريق للنمو",
      title: "التوسع الصناعي المرحلي",
      desc: "نهج مدروس للهيمنة على السوق، يتدرج من الأساسيات المعمارية إلى مكونات النقل المتقدمة.",
      p1Title: "الأساس المعماري",
      p1Desc: "تأسيس طاقة إنتاجية بـ 50,000 طن تركز على الجدران الستائرية الراقية والنوافذ والقطاعات الإنشائية لمشاريع نيوم والبحر الأحمر.",
      p1Item1: "واجهات راقية",
      p1Item2: "أنظمة العزل الحراري",
      p2Title: "التنوع الصناعي",
      p2Desc: "توسع إلى 100,000 طن بإضافة قدرات صناعية للأتمتة وأنظمة تثبيت الطاقة الشمسية والآلات الثقيلة.",
      p2Item1: "إطارات الطاقة الشمسية",
      p2Item2: "قطاعات الأتمتة",
      p3Title: "التنقل والنقل",
      p3Desc: "التوسع النهائي إلى 200,000 طن مستهدفاً قطاعات السيارات (المركبات الكهربائية) والسكك الحديدية بقطاعات ضخمة عالية القوة.",
      p3Item1: "صواني بطاريات السيارات الكهربائية",
      p3Item2: "هياكل السكك الحديدية"
    },
    products: {
      subtitle: "محفظة المنتجات",
      title: "هندسة التميز"
    },
    process: {
      title: "سلسلة القيمة المتكاملة",
      desc: "تحكم داخلي كامل من الصب إلى التشطيب يضمن جودة فائقة وتتبعاً دقيقاً."
    },
    footer: {
      desc: "صياغة مستقبل القطاع الصناعي في المملكة العربية السعودية بحلول ألمنيوم دقيقة. نقع في قلب المركز الصناعي بالدمام.",
      navTitle: "التصفح",
      contactTitle: "اتصل بنا",
      brochure: "كتيب الشركة",
      cr: "سجل تجاري",
      unified: "الرقم الموحد",
      rights: "© 2025 شركة نصر كبير للألمنيوم.",
      privacy: "سياسة الخصوصية",
      terms: "شروط الاستخدام"
    }
  }
};

// Logo Component
const AlxLogo = () => (
  <img 
    src="https://i.postimg.cc/C1YWG8vt/ALX-gao-qing-tu-hua-ban-1-fu-ben.png" 
    alt="Nasr Kabeer Logo" 
    className="h-12 w-auto object-contain" 
  />
);

const SectionHeading = ({ title, subtitle, dark = false, lang }: { title: string, subtitle?: string, dark?: boolean, lang: Language }) => (
  <div className="mb-16 max-w-3xl">
    <motion.div 
      initial={{ opacity: 0, x: lang === 'en' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className={`inline-block mb-4 px-3 py-1 border ${dark ? 'border-nasr-accent text-nasr-accent' : 'border-nasr-blue text-nasr-blue'} text-xs font-bold tracking-[0.2em] uppercase rounded-sm`}
    >
      {subtitle || "Section"}
    </motion.div>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`font-serif font-medium leading-tight ${dark ? 'text-white' : 'text-nasr-dark'} ${lang === 'ar' ? 'font-arabic text-5xl md:text-6xl lg:text-7xl' : 'text-4xl md:text-5xl lg:text-6xl'}`}
    >
      {title}
    </motion.h2>
  </div>
);

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  const t = content[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');

  // Navigation Handlers
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleBrochureClick = () => {
    alert(lang === 'en' ? 'Coming Soon' : 'قريباً');
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-nasr-dark selection:bg-nasr-blue selection:text-white ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a href="#" onClick={scrollToTop} className="flex items-center gap-4 group">
            <AlxLogo />
            <div className={`hidden md:flex flex-col ${isRTL ? 'border-r pr-4' : 'border-l pl-4'} border-gray-400 h-8 justify-center`}>
              <span className={`font-serif font-bold text-lg leading-none tracking-wide uppercase ${scrolled ? 'text-nasr-dark' : 'text-white'} ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'نصر كبير' : 'Nasr Kabeer'}
              </span>
              <span className={`text-[10px] tracking-[0.2em] uppercase ${scrolled ? 'text-gray-500' : 'text-gray-300'} ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'للألمنيوم' : 'Aluminum'}
              </span>
            </div>
          </a>
          
          <div className={`hidden md:flex items-center gap-10 text-sm font-medium tracking-widest uppercase ${scrolled ? 'text-gray-800' : 'text-white'}`}>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-nasr-blue transition-colors relative group">
              {t.nav.about}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-nasr-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#products" onClick={(e) => scrollToSection(e, 'products')} className="hover:text-nasr-blue transition-colors relative group">
              {t.nav.products}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-nasr-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#phases" onClick={(e) => scrollToSection(e, 'phases')} className="hover:text-nasr-blue transition-colors relative group">
              {t.nav.expansion}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-nasr-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
            
            <div className="flex items-center gap-4">
              <button onClick={toggleLang} className="flex items-center gap-1 hover:text-nasr-blue transition-colors">
                <Globe size={16} />
                <span>{lang === 'en' ? 'AR' : 'EN'}</span>
              </button>
              
              <a 
                href="#contact" 
                onClick={(e) => scrollToSection(e, 'contact')}
                className={`px-6 py-3 border ${scrolled ? 'border-nasr-dark text-nasr-dark hover:bg-nasr-dark hover:text-white' : 'border-white text-white hover:bg-white hover:text-nasr-dark'} transition-all duration-300`}
              >
                {t.nav.contact}
              </a>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-4">
             <button onClick={toggleLang} className={`${scrolled ? 'text-nasr-dark' : 'text-white'}`}>
                {lang === 'en' ? 'AR' : 'EN'}
             </button>
             <button className={`p-2 ${scrolled ? 'text-nasr-dark' : 'text-white'}`} onClick={() => setMenuOpen(!menuOpen)}>
               {menuOpen ? <X size={32} /> : <Menu size={32} />}
             </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 text-2xl font-serif text-nasr-dark"
          >
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')}>{t.nav.about}</a>
              <a href="#products" onClick={(e) => scrollToSection(e, 'products')}>{t.nav.products}</a>
              <a href="#phases" onClick={(e) => scrollToSection(e, 'phases')}>{t.nav.expansion}</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="px-8 py-3 bg-nasr-blue text-white text-lg">{t.nav.contact}</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="relative h-screen flex items-center overflow-hidden bg-nasr-dark">
        <HeroScene />
        
        <div className="relative z-10 container mx-auto px-6 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[1px] w-12 bg-nasr-accent"></span>
              <span className="text-nasr-accent text-sm font-bold tracking-[0.3em] uppercase">{t.hero.vision}</span>
            </div>
            <h1 className={`font-serif font-bold leading-none mb-8 text-white mix-blend-overlay opacity-90 ${isRTL ? 'font-arabic text-5xl md:text-7xl' : 'text-6xl md:text-8xl'}`}>
              {t.hero.titleLine1}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">{t.hero.titleLine2}</span><br/>
              {t.hero.titleLine3}
            </h1>
            <p className={`text-lg md:text-2xl text-gray-400 font-light leading-relaxed mb-12 max-w-2xl ${isRTL ? 'border-r-2 pr-8' : 'border-l-2 pl-8'} border-gray-700`}>
              {t.hero.desc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
               <a href="#products" onClick={(e) => scrollToSection(e, 'products')} className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-nasr-dark font-bold uppercase tracking-wider hover:bg-nasr-accent hover:text-white transition-all duration-300">
                  {t.hero.btnProduct}
                  <ArrowRight size={20} className={`transition-transform ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
               </a>
               <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="flex items-center justify-center gap-3 px-8 py-4 border border-gray-500 text-gray-300 font-bold uppercase tracking-wider hover:border-white hover:text-white transition-colors">
                  {t.hero.btnProfile}
               </a>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
        >
            <span className="text-[10px] uppercase tracking-widest">{t.hero.scroll}</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-gray-500 to-transparent"></div>
        </motion.div>
      </header>

      <main>
        {/* Strategic Overview */}
        <section id="about" className="py-24 md:py-32 bg-white relative overflow-hidden">
          <StructureGrid />
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                 <SectionHeading title={t.about.title} subtitle={t.about.subtitle} lang={lang} />
                 <div className="space-y-8 text-lg text-gray-600 leading-relaxed">
                   <p>
                     <strong className="text-nasr-dark">{isRTL ? 'شركة نصر كبير للألمنيوم المحدودة' : 'Nasr Kabeer Aluminum Co., Ltd.'}</strong> {t.about.p1.substring(isRTL ? 35 : 31)}
                   </p>
                   <p>
                     {t.about.p2}
                   </p>
                   
                   <div className="grid grid-cols-2 gap-8 mt-12">
                      <div className={`p-6 bg-gray-50 ${isRTL ? 'border-r-4' : 'border-l-4'} border-nasr-blue`}>
                        <div className="text-4xl font-serif font-bold text-nasr-dark mb-2">200K</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{t.about.statCapacity}</div>
                      </div>
                      <div className={`p-6 bg-gray-50 ${isRTL ? 'border-r-4' : 'border-l-4'} border-nasr-red`}>
                        <div className="text-4xl font-serif font-bold text-nasr-dark mb-2">30%</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{t.about.statExport}</div>
                      </div>
                   </div>
                 </div>
              </div>
              <div className="relative">
                 <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="aspect-[4/5] bg-gray-200 overflow-hidden shadow-2xl relative z-10"
                 >
                    <img 
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" 
                      alt="Modern Skyscraper Facade" 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out" 
                    />
                    <div className="absolute inset-0 bg-nasr-blue/20 mix-blend-multiply"></div>
                 </motion.div>
                 {/* Decorative Elements */}
                 <div className={`absolute -top-10 ${isRTL ? '-left-10' : '-right-10'} w-64 h-64 bg-gray-100 -z-10 pattern-dots`}></div>
                 <div className={`absolute -bottom-10 ${isRTL ? '-right-10' : '-left-10'} w-40 h-40 border-2 border-nasr-accent -z-10`}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Phased Expansion - Vision 2030 */}
        <section id="phases" className="py-24 bg-nasr-dark text-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20">
                   <SectionHeading title={t.phases.title} subtitle={t.phases.subtitle} dark lang={lang} />
                   <p className={`text-gray-400 max-w-md mb-16 md:mb-0 ${isRTL ? 'text-left' : 'text-right'}`}>
                     {t.phases.desc}
                   </p>
                </div>

                <CapacityGrowthChart lang={lang} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                   {/* Phase 1 */}
                   <div className="p-8 border border-gray-800 bg-gray-900/50 hover:border-nasr-accent transition-colors group relative">
                      <div className={`text-5xl font-serif font-bold text-gray-800 group-hover:text-nasr-accent/20 transition-colors absolute top-4 ${isRTL ? 'left-4' : 'right-4'} select-none`}>01</div>
                      <h3 className="text-2xl font-serif mb-4 text-white group-hover:text-nasr-accent transition-colors">{t.phases.p1Title}</h3>
                      <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        {t.phases.p1Desc}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-nasr-accent"/> {t.phases.p1Item1}</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-nasr-accent"/> {t.phases.p1Item2}</li>
                      </ul>
                   </div>

                   {/* Phase 2 */}
                   <div className="p-8 border border-gray-800 bg-gray-900/50 hover:border-nasr-blue transition-colors group relative">
                      <div className={`text-5xl font-serif font-bold text-gray-800 group-hover:text-nasr-blue/20 transition-colors absolute top-4 ${isRTL ? 'left-4' : 'right-4'} select-none`}>02</div>
                      <h3 className="text-2xl font-serif mb-4 text-white group-hover:text-nasr-blue transition-colors">{t.phases.p2Title}</h3>
                      <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        {t.phases.p2Desc}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-nasr-blue"/> {t.phases.p2Item1}</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-nasr-blue"/> {t.phases.p2Item2}</li>
                      </ul>
                   </div>

                   {/* Phase 3 */}
                   <div className="p-8 border border-gray-800 bg-gray-900/50 hover:border-nasr-red transition-colors group relative">
                      <div className={`text-5xl font-serif font-bold text-gray-800 group-hover:text-nasr-red/20 transition-colors absolute top-4 ${isRTL ? 'left-4' : 'right-4'} select-none`}>03</div>
                      <h3 className="text-2xl font-serif mb-4 text-white group-hover:text-nasr-red transition-colors">{t.phases.p3Title}</h3>
                      <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        {t.phases.p3Desc}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-nasr-red"/> {t.phases.p3Item1}</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-nasr-red"/> {t.phases.p3Item2}</li>
                      </ul>
                   </div>
                </div>
            </div>
        </section>

        {/* Products Showcase */}
        <section id="products" className="py-24 bg-gray-50">
            <div className="container mx-auto px-6">
                <SectionHeading title={t.products.title} subtitle={t.products.subtitle} lang={lang} />
                <div className="h-[700px] lg:h-[600px] mt-12">
                    <ProductCategoryGrid lang={lang} />
                </div>
            </div>
        </section>

        {/* Process Flow */}
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className={`font-serif mb-6 text-nasr-dark ${isRTL ? 'font-arabic text-4xl md:text-6xl' : 'text-4xl md:text-5xl'}`}>{t.process.title}</h2>
                    <p className="text-gray-600">
                       {t.process.desc}
                    </p>
                </div>
                <ProductionProcessFlow lang={lang} />
            </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="bg-nasr-dark text-gray-400 pt-24 pb-12 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-nasr-blue via-nasr-accent to-nasr-red"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-8">
                           <AlxLogo />
                           <div className={`mt-2 text-white font-serif text-xl tracking-wider uppercase ${isRTL ? 'font-arabic' : ''}`}>
                             {isRTL ? 'نصر كبير للألمنيوم' : 'Nasr Kabeer Aluminum'}
                           </div>
                        </div>
                        <p className="text-lg max-w-md mb-8 leading-relaxed text-gray-500">
                            {t.footer.desc}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-nasr-blue hover:text-white transition-all duration-300">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-nasr-blue hover:text-white transition-all duration-300">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest mb-8 text-sm">{t.footer.navTitle}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-nasr-accent transition-colors">{t.nav.about}</a></li>
                            <li><a href="#products" onClick={(e) => scrollToSection(e, 'products')} className="hover:text-nasr-accent transition-colors">{t.nav.products}</a></li>
                            <li><a href="#phases" onClick={(e) => scrollToSection(e, 'phases')} className="hover:text-nasr-accent transition-colors">{t.nav.expansion}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest mb-8 text-sm">{t.footer.contactTitle}</h4>
                        <ul className="space-y-6 text-sm">
                            <li className="flex items-start gap-4">
                                <MapPin size={20} className="text-nasr-accent shrink-0" />
                                <span>{isRTL ? 'المدينة الصناعية الثالثة بالدمام،' : 'Dammam Third Industrial City,'}<br/>{isRTL ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail size={20} className="text-nasr-accent shrink-0" />
                                <span className="hover:text-white cursor-pointer transition-colors">Business@nkaluminum.com</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <FileText size={20} className="text-nasr-accent shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-nasr-accent text-xs font-bold uppercase">{t.footer.cr}</span>
                                    <span className="text-gray-300">2050202550</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone size={20} className="text-nasr-accent shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-nasr-accent text-xs font-bold uppercase">{t.footer.unified}</span>
                                    <span className="text-gray-300">7043052724</span>
                                </div>
                            </li>
                            <li className="mt-6">
                                <button 
                                  onClick={handleBrochureClick}
                                  className="flex items-center gap-2 text-white border border-gray-600 px-6 py-3 hover:bg-white hover:text-nasr-dark transition-colors text-xs uppercase tracking-widest font-bold"
                                >
                                    <Download size={16} /> {t.footer.brochure}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 uppercase tracking-wider">
                    <p>{t.footer.rights}</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
                        <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
  );
};

export default App;
