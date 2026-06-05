/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Factory, Car, Zap, Hammer, ArrowRight, ShieldCheck, Settings, Truck, Boxes, Gauge, Route } from 'lucide-react';

// Fix for Framer Motion types in strict environments
const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;

type Language = 'en' | 'ar';

// --- TRANSLATIONS ---
const diagramContent = {
  en: {
    arch: {
      title: "Architectural",
      subtitle: "Construction & Infrastructure",
      desc: "Meeting the demands of Saudi Arabia's mega-projects with high-performance profiles for skyscrapers and smart cities.",
      items: ["Curtain Wall Systems", "Thermal Break Windows", "Structural Glazing", "Decorative Facades", "Sun Control Louvers"]
    },
    ind: {
      title: "Industrial",
      subtitle: "Automation & Energy",
      desc: "Precision engineering for the renewable energy sector and automated manufacturing lines.",
      items: ["Solar Mounting Structures", "Heat Sinks & Cooling", "Automation Framing", "Modular Conveyors", "Electronic Enclosures"]
    },
    trans: {
      title: "Transportation",
      subtitle: "Mobility & Aerospace",
      desc: "Lightweight, high-strength alloys driving the future of EVs and rail transit in the Kingdom.",
      items: ["EV Battery Trays", "Rail Transit Car Bodies", "Chassis Components", "Aerospace Interiors", "Marine Structures"]
    },
    process: [
        { title: "Casting", desc: "Customized alloys, energy-efficient and eco-friendly casting." },
        { title: "Die Shop", desc: "In-house precision mold manufacturing." },
        { title: "Extrusion", desc: "Full range of extrusion equipment." },
        { title: "Finishing", desc: "Powder Coating, Anodizing & PVDF." },
        { title: "Logistics", desc: "Global distribution from King Abdulaziz Port." },
    ],
    chart: {
        title: "Capacity Ramp-Up",
        desc: "Our strategic roadmap ensures a steady increase in production volume to meet the Kingdom's growing demand. By Phase 3, we will be a dominant player in the region."
    }
  },
  ar: {
    arch: {
      title: "معماري",
      subtitle: "البناء والبنية التحتية",
      desc: "تلبية متطلبات المشاريع الضخمة في المملكة العربية السعودية بمقاطع عالية الأداء لناطحات السحاب والمدن الذكية.",
      items: ["أنظمة الجدران الستائرية", "نوافذ العزل الحراري", "التزجيج الهيكلي", "الواجهات الزخرفية", "كاسرات الشمس"]
    },
    ind: {
      title: "صناعي",
      subtitle: "الأتمتة والطاقة",
      desc: "هندسة دقيقة لقطاع الطاقة المتجددة وخطوط التصنيع الآلي.",
      items: ["هياكل تثبيت الطاقة الشمسية", "المشتتات الحرارية والتبريد", "إطارات الأتمتة", "السيور الناقلة المعيارية", "حاويات الإلكترونيات"]
    },
    trans: {
      title: "النقل",
      subtitle: "التنقل والطيران",
      desc: "سبائك خفيفة الوزن وعالية القوة تقود مستقبل المركبات الكهربائية والسكك الحديدية في المملكة.",
      items: ["صواني بطاريات المركبات الكهربائية", "هياكل عربات السكك الحديدية", "مكونات الشاسيه", "التصميم الداخلي للطائرات", "الهياكل البحرية"]
    },
    process: [
        { title: "الصب", desc: "سبائك مخصصة، وعمليات صب صديقة للبيئة وموفرة للطاقة." },
        { title: "ورشة القوالب", desc: "تصنيع قوالب دقيقة داخلياً." },
        { title: "البثق", desc: "مجموعة كاملة من معدات البثق." },
        { title: "التشطيب", desc: "طلاء البودرة، الأنودة و PVDF." },
        { title: "اللوجستيات", desc: "توزيع عالمي من ميناء الملك عبد العزيز." },
    ],
    chart: {
        title: "زيادة السعة الإنتاجية",
        desc: "تضمن خارطة الطريق الاستراتيجية زيادة مطردة في حجم الإنتاج لتلبية الطلب المتزايد في المملكة. بحلول المرحلة الثالثة، سنكون لاعباً مهيمناً في المنطقة."
    }
  }
}

interface DiagramProps {
    lang: Language;
}

// --- PRODUCT CATEGORY GRID ---
export const ProductCategoryGrid: React.FC<DiagramProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState<string>('arch');
  const t = diagramContent[lang];
  const isRTL = lang === 'ar';

  const categories = {
    arch: {
      ...t.arch,
      image: "/site-assets/category-architectural.jpg"
    },
    ind: {
      ...t.ind,
      image: "/site-assets/category-industrial.jpg"
    },
    trans: {
      ...t.trans,
      image: "/site-assets/category-transportation.jpg"
    }
  };

  const activeData = categories[activeCategory as keyof typeof categories];

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-full bg-white shadow-2xl rounded-sm overflow-hidden border border-gray-100">
      {/* Navigation Sidebar */}
      <div className={`w-full lg:w-1/4 bg-gray-50 ${isRTL ? 'border-l' : 'border-r'} border-gray-200 flex lg:flex-col overflow-x-auto`}>
        {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex-1 lg:flex-none min-w-[120px] p-3 md:p-4 lg:p-6 text-left transition-all duration-300 group relative overflow-hidden flex flex-col lg:block items-center justify-center lg:items-start ${activeCategory === key ? 'bg-white text-nasr-dark shadow-md z-10' : 'text-gray-500 hover:bg-gray-100'}`}
            style={{ textAlign: isRTL ? 'right' : 'left' }}
          >
            {/* Desktop Active Indicator (Side) */}
            {activeCategory === key && <div className={`hidden lg:block absolute ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 w-1 bg-nasr-blue`}></div>}
            {/* Mobile Active Indicator (Bottom) */}
            {activeCategory === key && <div className="block lg:hidden absolute bottom-0 left-0 right-0 h-1 bg-nasr-blue"></div>}
            
            <div className="relative z-10 flex flex-col items-center lg:items-start gap-1 lg:gap-2">
                {key === 'arch' && <Building2 className={`w-6 h-6 lg:w-7 lg:h-7 ${activeCategory === key ? "text-nasr-blue" : "text-gray-400"}`} />}
                {key === 'ind' && <Factory className={`w-6 h-6 lg:w-7 lg:h-7 ${activeCategory === key ? "text-nasr-blue" : "text-gray-400"}`} />}
                {key === 'trans' && <Car className={`w-6 h-6 lg:w-7 lg:h-7 ${activeCategory === key ? "text-nasr-blue" : "text-gray-400"}`} />}
                <span className={`font-serif text-xs lg:text-lg font-bold uppercase tracking-wide mt-1 lg:mt-2 break-words text-center lg:text-left leading-tight ${isRTL ? 'font-arabic' : ''}`}>{categories[key].title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="w-full lg:w-3/4 relative min-h-[500px] lg:min-h-0">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
              <MotionImg 
                key={activeData.image}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                src={activeData.image} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-${isRTL ? 'l' : 'r'} from-white via-white/90 to-transparent z-10`}></div>
          </div>

          <div className="relative z-20 p-6 md:p-16 h-full flex flex-col justify-center">
            <MotionDiv
              key={activeCategory}
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-nasr-blue font-bold tracking-widest uppercase text-xs md:text-sm mb-2 block">{activeData.subtitle}</span>
              <h3 className={`font-serif text-2xl md:text-5xl text-nasr-dark mb-4 md:mb-6 ${isRTL ? 'font-arabic' : ''}`}>
                {activeData.title} {lang === 'en' ? 'Profiles' : 'المقاطع'}
              </h3>
              <p className={`text-gray-600 text-sm md:text-lg mb-8 md:mb-10 max-w-xl leading-relaxed ${isRTL ? 'border-r-4 pr-4 md:pr-6' : 'border-l-4 pl-4 md:pl-6'} border-nasr-silver`}>
                {activeData.desc}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl">
                {activeData.items.map((item, idx) => (
                  <MotionDiv 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 md:p-4 border border-gray-200 rounded-sm hover:border-nasr-blue transition-colors"
                  >
                    <ShieldCheck size={16} className="text-nasr-accent shrink-0 md:w-[18px] md:h-[18px]" />
                    <span className="font-medium text-gray-800 text-sm md:text-base">{item}</span>
                  </MotionDiv>
                ))}
              </div>
            </MotionDiv>
          </div>
      </div>
    </div>
  );
};

// --- PRODUCTION PROCESS FLOW ---
export const ProductionProcessFlow: React.FC<DiagramProps> = ({ lang }) => {
    const t = diagramContent[lang];
    const isRTL = lang === 'ar';

    const icons = [
        <Hammer size={30}/>,
        <Settings size={30}/>,
        <Factory size={30}/>,
        <Zap size={30}/>,
        <Truck size={30}/>
    ];

    const steps = t.process.map((step, idx) => ({
        ...step,
        icon: icons[idx]
    }));

    const outcomes = [
        { label: "Traceability", value: "5 controlled stages" },
        { label: "Quality gates", value: "In-house inspection" },
        { label: "Market reach", value: "Port-linked logistics" }
    ];
    const outcomeIcons = [<Route size={18} />, <Gauge size={18} />, <Boxes size={18} />];

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,218,0.18),transparent_28%),conic-gradient(from_-20deg_at_50%_4%,rgba(255,255,218,0.26),transparent_8%,rgba(180,191,191,0.16)_15%,transparent_24%,rgba(255,255,218,0.18)_31%,transparent_43%,rgba(72,82,84,0.20)_54%,transparent_65%,rgba(255,255,218,0.16)_78%,transparent_88%,rgba(255,255,218,0.24)),linear-gradient(145deg,rgba(246,248,247,0.08),rgba(247,250,252,0.018)_44%,rgba(0,0,0,0.10))] px-5 py-10 md:px-10 md:py-12">
      <div className="pointer-events-none absolute inset-x-10 top-[7.25rem] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(248,247,188,0.58),rgba(238,244,247,0.48),transparent)] md:block" />
      <div className="pointer-events-none absolute inset-x-10 top-[7.25rem] hidden h-[2px] bg-[linear-gradient(90deg,transparent,rgba(248,247,188,0.42),rgba(238,244,247,0.62),rgba(156,169,176,0.42),transparent)] opacity-80 md:block" />

      <div className="grid grid-cols-1 gap-9 md:grid-cols-5 md:gap-4">
        {steps.map((step, idx) => (
          <MotionDiv
            key={step.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ delay: idx * 0.07, duration: 0.58, ease: 'easeOut' }}
            className="group relative flex flex-col items-center text-center"
          >
            <div className="relative mb-7 flex h-[8.5rem] w-full items-center justify-center">
              <div className="absolute h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,218,0.18),rgba(238,244,247,0.045)_58%,transparent_70%)] opacity-75 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[conic-gradient(from_-18deg,rgba(255,255,232,0.98),rgba(170,181,181,0.88),rgba(255,255,210,0.84),rgba(89,101,104,0.84),rgba(255,255,232,0.98))] text-[#344044] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-12px_24px_rgba(45,55,58,0.24),0_18px_42px_rgba(0,0,0,0.30)] ring-1 ring-[#F8F7BC]/40 transition-transform duration-500 group-hover:-translate-y-1 group-hover:text-[#151A1C]">
                {step.icon}
              </div>
              {idx < steps.length - 1 && (
                <div className={`absolute top-1/2 hidden h-px w-[calc(50%-2.7rem)] bg-white/18 md:block ${isRTL ? 'left-0' : 'right-0'}`} />
              )}
              {idx > 0 && (
                <div className={`absolute top-1/2 hidden h-px w-[calc(50%-2.7rem)] bg-white/18 md:block ${isRTL ? 'right-0' : 'left-0'}`} />
              )}
            </div>

            <h4 className={`mb-3 font-serif text-2xl text-white ${isRTL ? 'font-arabic' : ''}`}>{step.title}</h4>
            <p className="max-w-[13.5rem] text-sm leading-relaxed text-[#B8C3C9]">{step.desc}</p>
          </MotionDiv>
        ))}
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.55 }}
        className="mt-12 grid grid-cols-1 gap-y-6 border-t border-white/10 pt-7 md:grid-cols-3 md:divide-x md:divide-white/10"
      >
        {outcomes.map((outcome, idx) => (
          <div
            key={outcome.label}
            className="flex items-center justify-center gap-3 px-4 text-center md:justify-start md:text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[#8FC8DF] ring-1 ring-white/10">
              {outcomeIcons[idx]}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">{outcome.label}</div>
              <div className="mt-1 font-serif text-lg text-[#EEF4F7]">{outcome.value}</div>
            </div>
          </div>
        ))}
      </MotionDiv>
    </div>
  );
};
// --- CAPACITY GROWTH CHART ---
export const CapacityGrowthChart: React.FC<DiagramProps> = ({ lang }) => {
    const [activePhase, setActivePhase] = useState(1);
    const t = diagramContent[lang];
    const isRTL = lang === 'ar';

    const phases = [
        { id: 1, capacity: 50000, year: "2026", label: lang === 'en' ? "Phase 1" : "Phase 1", focus: lang === 'en' ? "Architectural" : "Architectural" },
        { id: 2, capacity: 100000, year: "2027", label: lang === 'en' ? "Phase 2" : "Phase 2", focus: lang === 'en' ? "Industrial" : "Industrial" },
        { id: 3, capacity: 200000, year: "2028", label: lang === 'en' ? "Phase 3" : "Phase 3", focus: lang === 'en' ? "Transportation" : "Transportation" }
    ];

    return (
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(225,231,231,0.76))] p-4 shadow-[0_26px_70px_rgba(26,34,38,0.13)] sm:p-7 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_12%,rgba(255,255,220,0.22),transparent_24%)]"></div>
            <div className="relative flex flex-col gap-10 md:flex-row md:items-end">
                <div className="flex-1">
                    <h3 className={`text-nasr-dark font-serif text-3xl mb-5 ${isRTL ? 'font-arabic' : ''}`}>{t.chart.title}</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {t.chart.desc}
                    </p>

                    <div className="space-y-3">
                        {phases.map((phase) => (
                            <button
                                key={phase.id}
                                onClick={() => setActivePhase(phase.id)}
                                className={`w-full rounded-full px-4 py-3 transition-all duration-500 ease-out ${activePhase === phase.id ? 'bg-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_30px_rgba(22,29,32,0.10)] ring-1 ring-[#DCE2E2]' : 'bg-white/18 hover:bg-white/42'}`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className={`h-2.5 w-2.5 rounded-full transition-colors ${activePhase === phase.id ? 'bg-[#1E2527]' : 'bg-[#B8C1C2]'}`}></div>
                                        <span className={`text-nasr-dark truncate font-serif text-base sm:text-lg ${isRTL ? 'font-arabic' : ''}`}>{phase.label}</span>
                                    </div>
                                    <span className={`shrink-0 text-xs text-gray-500 sm:text-sm ${isRTL ? 'font-arabic' : ''}`}>{phase.focus}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative h-[17.5rem] w-full overflow-hidden rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(248,250,250,0.88),rgba(215,223,224,0.56))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.84),inset_0_-24px_48px_rgba(58,68,72,0.07)] sm:h-80 sm:p-5 md:flex-1">
                    <div className="pointer-events-none absolute inset-x-4 bottom-[4.55rem] h-px bg-gradient-to-r from-transparent via-[#9EA9AB]/45 to-transparent sm:inset-x-8"></div>
                    <MotionDiv
                        key={`roadmap-sheen-${activePhase}`}
                        initial={{ opacity: 0, x: '-18%' }}
                        animate={{ opacity: 1, x: '18%' }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="pointer-events-none absolute inset-y-8 w-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,230,0.22),transparent)] blur-xl"
                    />

                    <div className="absolute inset-x-4 bottom-14 top-7 flex items-end justify-around gap-2 sm:inset-x-7 sm:top-8 sm:gap-5">
                        {phases.map((phase) => {
                            const isActive = phase.id <= activePhase;
                            return (
                            <button key={phase.id} onClick={() => setActivePhase(phase.id)} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                                <MotionDiv
                                    animate={{ opacity: isActive ? 1 : 0.58, y: isActive ? 0 : 6 }}
                                    transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                                    className="mb-2 font-serif text-base text-[#1E2527] sm:mb-3 sm:text-lg"
                                >
                                    {(phase.capacity / 1000).toLocaleString()}k
                                </MotionDiv>
                                <MotionDiv
                                    className="relative w-full max-w-[3.9rem] overflow-hidden rounded-full sm:max-w-[4.6rem]"
                                    initial={{ height: 0 }}
                                    animate={{
                                        height: `${(phase.capacity / 200000) * 100}%`,
                                        opacity: isActive ? 1 : 0.28,
                                        scaleX: isActive ? 1 : 0.82
                                    }}
                                    transition={{ duration: 0.72, delay: phase.id * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <MotionDiv
                                        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,238,0.96),rgba(186,197,198,0.92)_42%,rgba(86,98,102,0.94))]"
                                        animate={{ filter: isActive ? 'brightness(1.04)' : 'brightness(0.92)' }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <div className="absolute inset-x-0 top-0 h-1/3 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.88),transparent_68%)]"></div>
                                    <MotionDiv
                                        className="absolute inset-y-0 left-1/2 w-px bg-white/55"
                                        animate={{ opacity: isActive ? 0.72 : 0.22 }}
                                        transition={{ duration: 0.45 }}
                                    />
                                </MotionDiv>
                                <MotionDiv
                                    animate={{ opacity: activePhase === phase.id ? 1 : 0.55, y: activePhase === phase.id ? 0 : 3 }}
                                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                                    className={`mt-3 rounded-full px-2.5 py-1 font-sans text-xs font-semibold sm:mt-4 sm:px-3 sm:text-sm ${activePhase === phase.id ? 'bg-white/72 text-[#1E2527] shadow-sm' : 'text-gray-500'}`}
                                >
                                    {phase.year}
                                </MotionDiv>
                            </button>
                            );
                        })}
                    </div>

                    <div className="absolute bottom-5 left-4 right-4 flex items-center justify-center border-t border-[#AAB4B6]/24 pt-3 sm:left-6 sm:right-6">
                        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:text-xs sm:tracking-[0.18em]">Capacity ramp-up</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
