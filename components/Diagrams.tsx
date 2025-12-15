/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Factory, Car, Zap, Hammer, ArrowRight, ShieldCheck, Settings, Truck } from 'lucide-react';

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
      image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=1000"
    },
    ind: {
      ...t.ind,
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1000"
    },
    trans: {
      ...t.trans,
      image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&q=80&w=1000" // Automotive Chassis/Structure
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
        <Hammer size={32}/>,
        <Settings size={32}/>,
        <Factory size={32}/>,
        <Zap size={32}/>,
        <Truck size={32}/>
    ];

    const steps = t.process.map((step, idx) => ({
        ...step,
        icon: icons[idx]
    }));

  return (
    <div className="relative w-full overflow-x-auto pb-10 pt-4">
      <div className="flex min-w-max md:min-w-0 justify-between items-start relative px-4">
        {/* Connecting Line */}
        <div className="absolute top-10 left-0 right-0 h-1 bg-gray-100 -z-10"></div>

        {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center w-48 group">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center mb-6 group-hover:border-nasr-blue group-hover:scale-110 transition-all duration-300 shadow-sm z-10 relative">
                    <div className="text-gray-400 group-hover:text-nasr-blue transition-colors">
                        {step.icon}
                    </div>
                    {/* Arrow */}
                    {idx < steps.length - 1 && (
                         <div className={`absolute ${isRTL ? '-left-12 rotate-180' : '-right-12'} text-gray-300`}>
                             <ArrowRight size={24} />
                         </div>
                    )}
                </div>
                <h4 className={`font-serif text-xl text-nasr-dark mb-2 ${isRTL ? 'font-arabic' : ''}`}>{step.title}</h4>
                <p className="text-center text-sm text-gray-500 px-2">{step.desc}</p>
            </div>
        ))}
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
        { id: 1, capacity: 50000, year: "2026", label: lang === 'en' ? "Phase 1" : "المرحلة 1", color: "bg-gray-400", focus: lang === 'en' ? "Architectural" : "معماري" },
        { id: 2, capacity: 100000, year: "2027", label: lang === 'en' ? "Phase 2" : "المرحلة 2", color: "bg-nasr-blue", focus: lang === 'en' ? "Industrial" : "صناعي" },
        { id: 3, capacity: 200000, year: "2028", label: lang === 'en' ? "Phase 3" : "المرحلة 3", color: "bg-nasr-red", focus: lang === 'en' ? "Transportation" : "النقل" }
    ];

    return (
        <div className="bg-gray-900 rounded-sm p-8 md:p-12 border border-gray-800">
            <div className="flex flex-col md:flex-row gap-12 items-end">
                <div className="flex-1">
                    <h3 className={`text-white font-serif text-3xl mb-6 ${isRTL ? 'font-arabic' : ''}`}>{t.chart.title}</h3>
                    <p className="text-gray-400 mb-10 leading-relaxed">
                        {t.chart.desc}
                    </p>
                    
                    <div className="space-y-4">
                        {phases.map((phase) => (
                            <button 
                                key={phase.id}
                                onClick={() => setActivePhase(phase.id)}
                                className={`w-full flex items-center justify-between p-4 rounded border transition-all ${activePhase === phase.id ? 'bg-white/10 border-white' : 'bg-transparent border-gray-700 hover:bg-white/5'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${activePhase === phase.id ? 'bg-nasr-accent' : 'bg-gray-600'}`}></div>
                                    <span className={`text-white font-serif text-lg ${isRTL ? 'font-arabic' : ''}`}>{phase.label}</span>
                                </div>
                                <span className={`text-gray-400 text-sm ${isRTL ? 'font-arabic' : ''}`}>{phase.focus}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 w-full h-80 flex items-end justify-around gap-4 relative border-b border-gray-700 pb-4">
                    {/* Y-Axis Labels */}
                    <div className={`absolute ${isRTL ? '-right-8' : '-left-8'} top-0 bottom-4 flex flex-col justify-between text-xs text-gray-600 font-mono`}>
                        <span>200k</span>
                        <span>100k</span>
                        <span>50k</span>
                        <span>0</span>
                    </div>

                    {phases.map((phase) => (
                        <div key={phase.id} className="flex flex-col items-center w-1/3 h-full justify-end group relative">
                            <div className="mb-3 text-white font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {phase.capacity.toLocaleString()}
                            </div>
                            <MotionDiv 
                                className={`w-full max-w-[60px] ${phase.id <= activePhase ? (phase.id === 3 ? 'bg-nasr-red' : phase.id === 2 ? 'bg-nasr-blue' : 'bg-gray-500') : 'bg-gray-800'} rounded-t-sm relative overflow-hidden`}
                                initial={{ height: 0 }}
                                animate={{ height: `${(phase.capacity / 200000) * 100}%` }}
                                transition={{ duration: 1, delay: phase.id * 0.2 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </MotionDiv>
                            <div className="mt-4 text-gray-400 text-sm font-mono">{phase.year}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}