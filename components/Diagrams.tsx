/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Building2, Factory, Car, ShieldCheck, Drill, SprayCan, Ship } from 'lucide-react';

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
    title?: string;
    desc?: string;
    action?: {
        label: string;
        onClick: React.MouseEventHandler<HTMLButtonElement>;
    };
}

type ProcessStep = {
    title: string;
    desc: string;
    image: string;
    icon: React.ReactNode;
};

const CastingIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 17h12" />
    <path d="M5 17l1.5 4h8L16 17" />
    <path d="M13 5l5 2.5-2.5 5-5-2.5Z" />
    <path d="M17.2 9.2c1.5.8 2.8 2 2.8 3.8" />
    <path d="M12 12c1.7.8 2.6 1.7 2.8 3" />
    <path d="M8 7c-.8 1-.8 2 0 3" />
    <path d="M6 4c-.9 1.1-.9 2.2 0 3.4" />
  </svg>
);

const ExtrusionIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12h5" />
    <path d="M5 9l3 3-3 3" />
    <rect x="9" y="8" width="3" height="8" rx="0.8" />
    <path d="M12 10h4" />
    <path d="M12 14h4" />
    <path d="M16 9h5" />
    <path d="M16 15h5" />
    <path d="M20 9v6" />
  </svg>
);

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

const ProcessStepCard: React.FC<{
    step: ProcessStep;
    index: number;
    total: number;
    progress: any;
    isRTL: boolean;
}> = ({ step, index, total, progress, isRTL }) => {
    const start = index / total;
    const middle = (index + 0.5) / total;
    const end = (index + 1) / total;
    const active = useTransform(progress, [start - 0.04, middle, end + 0.04], [0, 1, 0]);
    const cardOpacity = useTransform(active, [0, 1], [0.52, 1]);
    const descOpacity = useTransform(active, [0.15, 0.75], [0, 1]);
    const descHeight = useTransform(active, [0, 1], ['0rem', '2.35rem']);
    const indicatorScale = useTransform(active, [0, 1], [0.24, 1]);

    return (
        <MotionDiv
            className={`process-step-card ${isRTL ? 'text-right' : 'text-left'}`}
            style={{ opacity: cardOpacity }}
        >
            <div className={`process-step-row flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="process-stage-icon relative mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(from_-18deg,rgba(255,255,232,0.98),rgba(170,181,181,0.88),rgba(255,255,210,0.84),rgba(89,101,104,0.84),rgba(255,255,232,0.98))] text-[#344044] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-10px_20px_rgba(45,55,58,0.22),0_14px_30px_rgba(0,0,0,0.22)] ring-1 ring-[#F8F7BC]/40">
                        {step.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-4">
                        <span className="font-serif text-xl text-white/42">
                        {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className={`process-stage-title font-serif text-white ${isRTL ? 'font-arabic' : ''}`}>
                            {step.title}
                        </h3>
                    </div>
                    <MotionDiv className="process-step-desc overflow-hidden" style={{ opacity: descOpacity, maxHeight: descHeight }}>
                        <p className="mt-2 max-w-[31rem] text-sm leading-relaxed text-[#C8D2D5] md:text-[0.95rem]">
                            {step.desc}
                        </p>
                    </MotionDiv>
                    <div className="process-step-rule mt-3 h-px overflow-hidden bg-white/10">
                        <MotionDiv className="h-full origin-left bg-[#D7DEE0]" style={{ scaleX: indicatorScale }} />
                    </div>
                </div>
            </div>
        </MotionDiv>
    );
};

const ProcessImagePanel: React.FC<{
    step: ProcessStep;
    index: number;
    total: number;
    progress: any;
    isRTL: boolean;
}> = ({ step, index, total, progress, isRTL }) => {
    const start = index / total;
    const holdStart = start + 0.07;
    const holdEnd = (index + 0.86) / total;
    const exitEnd = (index + 1.08) / total;
    const opacity = useTransform(progress, [start - 0.04, holdStart, holdEnd, exitEnd], [0, 1, 1, 0]);
    const x = useTransform(progress, [start, holdStart], [isRTL ? '-4%' : '4%', '0%']);
    const scale = useTransform(progress, [start, holdStart, exitEnd], [1.035, 1, 1.015]);

    return (
            <MotionDiv
            className="process-image-panel absolute inset-0"
            style={{ opacity, x, zIndex: index + 1 }}
            >
                <MotionImg
                    src={step.image}
                    alt={`${step.title} process`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="h-full w-full object-cover"
                style={{ scale }}
                />
            </MotionDiv>
    );
};

// --- PRODUCTION PROCESS FLOW ---
export const ProductionProcessFlow: React.FC<DiagramProps> = ({ lang, title, desc, action }) => {
    const t = diagramContent[lang];
    const isRTL = lang === 'ar';
    const stageRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: stageRef,
        offset: ['start start', 'end end']
    });

    const icons = [
        <CastingIcon size={24}/>,
        <Drill size={24}/>,
        <ExtrusionIcon size={24}/>,
        <SprayCan size={24}/>,
        <Ship size={24}/>
    ];

    const images = [
        '/site-assets/process-casting.png',
        '/site-assets/process-die-shop.png',
        '/site-assets/process-extrusion.png',
        '/site-assets/process-finishing.png',
        '/site-assets/process-logistics.png'
    ];

    const steps = t.process.map((step, idx) => ({
        ...step,
        icon: icons[idx],
        image: images[idx]
    }));

    return (
        <div ref={stageRef} className="process-scroll-stage relative h-[520svh] min-h-[260rem]">
            <div className="process-sticky-frame sticky flex items-center">
                <div className="process-sticky-inner mx-auto w-full max-w-[1360px]">
                    <div className={`process-sticky-header ${isRTL ? 'text-right' : 'text-left md:text-center'}`}>
                        <h2 className={`font-serif text-white ${isRTL ? 'font-arabic' : ''}`}>
                            {title || 'Integrated Value Chain'}
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#AEBABE] md:text-base">
                            {desc || 'Complete in-house control from casting to finishing ensures superior quality and traceability.'}
                        </p>
                    </div>

                    <div className="process-panel-shell relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.028)_52%,rgba(0,0,0,0.08))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_26px_90px_rgba(0,0,0,0.20)] md:p-6 lg:p-7">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.038)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.026)_1px,transparent_1px)] bg-[length:5.5rem_5.5rem] opacity-30" />
                        <div className="process-flow-layout relative z-10 grid h-full grid-cols-1 gap-5 lg:grid-cols-[minmax(22rem,0.92fr)_minmax(0,1.08fr)] lg:gap-8">
                            <div className="process-step-stack">
                                {steps.map((step, idx) => (
                                    <ProcessStepCard
                                        key={step.title}
                                        step={step}
                                        index={idx}
                                        total={steps.length}
                                        progress={scrollYProgress}
                                        isRTL={isRTL}
                                    />
                                ))}
                            </div>
                            <div className="process-media-shell relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_22px_60px_rgba(0,0,0,0.20)]">
                                <div className="relative h-full overflow-hidden rounded-md">
                                    {steps.map((step, idx) => (
                                        <ProcessImagePanel
                                            key={`image-${step.title}`}
                                            step={step}
                                            index={idx}
                                            total={steps.length}
                                            progress={scrollYProgress}
                                            isRTL={isRTL}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {action && (
                        <div className={`process-flow-footer flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                            <button onClick={action.onClick} className="inline-flex items-center gap-2 rounded-full border border-white/16 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#D7DEE0] transition-colors hover:border-white/32 hover:text-white">
                                {action.label}
                            </button>
                        </div>
                    )}
                </div>
            </div>
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
