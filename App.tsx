
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StructureGrid, HeroScene } from './components/IndustrialScene';
import { ProductionProcessFlow, CapacityGrowthChart } from './components/Diagrams';
import { 
  Menu, X, Download, MapPin, Mail, Linkedin, Twitter, ArrowRight, 
  CheckCircle2, Globe, FileText, Phone, ChevronLeft, Factory, 
  Thermometer, Settings, Layers, ShieldCheck, Zap, Cpu, PaintBucket,
  PenTool, Beaker, Box, ExternalLink, Recycle, Leaf, 
  Wind, Droplets, Building2, Car, Newspaper, TrendingUp, BarChart3, Clock, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

// Fix for Framer Motion types in strict environments
const MotionDiv = motion.div as any;
const MotionH2 = motion.h2 as any;

// --- TYPES & CONTENT ---
type Language = 'en' | 'ar';
type Page = 'home' | 'technology' | 'sustainability' | 'products' | 'news';

// Process Step Type
interface ProcessStep {
  title: string;
  desc: string;
  details: string[];
  icon: React.ElementType;
}

interface NewsData {
  date: string;
  lme: string[];
  corporate: string[];
  trends: string[];
  factors: string[];
}

const content = {
  en: {
    nav: {
      about: "About",
      products: "Products",
      technology: "Technology",
      sustainability: "Sustainability",
      news: "News",
      contact: "Get in Touch",
      back: "Back to Home"
    },
    hero: {
      vision: "Vision 2030 Partner",
      titleLine1: "SHAPING",
      titleLine2: "EXCELLENCE",
      titleLine3: "IN EVERY", 
      desc: "A world-class manufacturing facility in Everwin Industrial Park, Dammam Third Industrial City, delivering 200,000 tons of high-end profiles for the architectural, industrial, and transportation sectors.",
      btnProduct: "Discover Products",
      btnTech: "Our Technology",
      scroll: "Scroll"
    },
    about: {
      subtitle: "Strategic Overview",
      title: "Beyond Extrusion. Engineering Excellence.",
      p1: "Nasr Kabeer Aluminum Co., Ltd. (NKAC) is a premier manufacturer of high-performance aluminum extrusions, strategically positioned in the Kingdom of Saudi Arabia to serve global industrial and transportation sectors.",
      p2: "We specialize in a diverse, high-end portfolio, ranging from advanced architectural systems to large-scale profiles for industrial and transportation applications, backed by a total designed capacity of 200,000 tons per year. Our operations are anchored by a state-of-the-art facility, utilizing large-tonnage extrusion presses and CNC precision machining to ensure superior strength-to-weight ratios and complex profile geometries.",
      p3: "We uphold the highest international benchmarks, certified to ISO 9001, ISO 14001, and ISO 45001, reflecting our unwavering commitment to quality, sustainability, and safety. Aligned with Saudi Vision 2030, NKAC is dedicated to driving local value creation and supporting export diversification for both domestic and international markets.",
      statCapacity: "Tons/Year Capacity",
      statExport: "Export Target"
    },
    park: {
      subtitle: "Industrial Ecosystem",
      title: "Everwin Industrial Park",
      desc: "Nasr Kabeer Aluminum operates within Everwin Industrial Park, a state-of-the-art industrial hub in Dammam Third Industrial City, providing world-class infrastructure for advanced manufacturing.",
      link: "Visit Park Website"
    },
    products: {
      subtitle: "Product Portfolio",
      title: "Engineered for Excellence",
      desc: "Explore our comprehensive range of high-performance aluminum profiles designed for the most demanding applications."
    },
    process: {
      title: "Integrated Value Chain",
      desc: "Complete in-house control from casting to finishing ensures superior quality and traceability."
    },
    expansion: {
      title: "Strategic Growth Roadmap",
      subtitle: "Phased Capacity Ramp-Up",
      desc: "Aligning with the Kingdom's industrial diversification goals, our multi-phase expansion plan scales our operations to meet the increasing global demand for high-end aluminum solutions."
    },
    techRoute: {
        title: "Integrated Technical Route",
        subtitle: "Vertical Integration",
        tabs: {
            core: "Core Process",
            die: "Die Mfg (Aux A)",
            powder: "Powder Coating (Aux B)",
            strip: "Thermal Strips (Aux C)"
        },
        core: {
            title: "Part I: Core Aluminum Profile Manufacturing",
            desc: "The central, sequential flow of production from raw ingot to final profile.",
            steps: [
                { id: "1", title: "Casting (Billet)", desc: "Melting at 690-720°C & Continuous Casting into High-Quality Billets." },
                { id: "2", title: "Extrusion (Forming)", desc: "Billet Pre-heating (450-500°C) & Precision Press Forming." },
                { id: "3", title: "Strengthening", desc: "Solution Heat Treatment & Aging (T6/T7 at 530-540°C)." },
                { id: "4", title: "Surface Treatment", desc: "Powder Coating, Anodizing, or PVDF for aesthetics & protection." },
                { id: "5", title: "Finishing & QC", desc: "Precision CNC, Thermal Break Assembly & 3D/NDT Inspection." }
            ]
        },
        auxA: {
            title: "Part II-A: In-House Die Manufacturing",
            desc: "Creates custom molds used in Step 2 (Extrusion).",
            steps: [
                "Design & Simulation (CAD)",
                "H13 Tool Steel Prep",
                "CNC Precision Machining",
                "Heat Treatment (Hardening)",
                "Polishing (EDM)"
            ],
            connection: "Supplies Dies to Extrusion"
        },
        auxB: {
            title: "Part II-B: In-House Powder Coating",
            desc: "Produces the powder used in Step 4 (Surface).",
            steps: [
                "Raw Material Prep (Resins)",
                "Hot Extrusion & Dispersion",
                "Cooling & Crushing",
                "Grinding & Sieving",
                "Quality Testing"
            ],
            connection: "Supplies Powder to Surface"
        },
        auxC: {
            title: "Part II-C: Thermal Break Strip Production",
            desc: "Produces insulating strips used in Step 5 (Finishing).",
            steps: [
                "Sourcing (PA66 + GF)",
                "Compounding & Melting",
                "Strip Extrusion",
                "Cooling & Calibration",
                "Cutting & Inspection"
            ],
            connection: "Supplies Strips to Assembly"
        }
    },
    techPage: {
      title: "Advanced Technical Route",
      subtitle: "Precision Manufacturing",
      desc: "We employ distinct technical routes optimized for Architectural, Industrial, and Automotive applications, ensuring every profile meets rigorous international standards.",
      tabs: {
        arch: "Architectural",
        ind: "Industrial",
        auto: "Automotive"
      },
      archSteps: [
        {
          title: "Raw Material Processing",
          desc: "Precision alloying and billet casting.",
          details: [
            "Melting & Casting: Raw ingots melted with precise alloying elements (Mg, Si, Zn).",
            "Billet Casting: State-of-the-art casting for uniform grain structure.",
            "Internal Alloy Control: Customization for structural strength and thermal performance."
          ]
        },
        {
          title: "In-House Die Manufacturing",
          desc: "Advanced CNC machining for custom solutions.",
          details: [
            "Faster design cycles and better cost control.",
            "Tailored solutions for complex cross-sections.",
            "High-precision fabrication ensuring tight tolerances."
          ]
        },
        {
          title: "Extrusion Process",
          desc: "High-precision forming for complex profiles.",
          details: [
            "Billet Pre-Heating: Heated to precise temperatures.",
            "High-Precision Extrusion: Optimized for window frames and curtain walls.",
            "Quenching: Immediate air/water quenching to lock in mechanical properties."
          ]
        },
        {
          title: "Surface Treatment",
          desc: "Durable finishes for harsh environments.",
          details: [
            "Powder Coating: Electrostatic spraying for weather-resistant finishes.",
            "Anodizing: Enhanced corrosion resistance and aesthetic appeal.",
            "PVDF Coating: Fluorocarbon for superior weather resistance in demanding environments."
          ]
        },
        {
          title: "Accessory & Assembly",
          desc: "Value-added integration.",
          details: [
            "Thermal Break Strips: Produced in-house for energy efficiency.",
            "Integration: Seamless compatibility with glass and door components."
          ]
        }
      ],
      indSteps: [
        {
          title: "Raw Material Selection",
          desc: "High-purity aluminum for industrial needs.",
          details: [
            "Purity > 99.7% selected.",
            "Alloys: 6061, 6063, 5052, 7075 evaluated for specific properties.",
            "Tailored compositions for industrial requirements."
          ]
        },
        {
          title: "Melting & Casting",
          desc: "Advanced refining techniques.",
          details: [
            "Temperature Control: 690-720°C range.",
            "Refining: Flux refining, vacuum degassing, electromagnetic stirring.",
            "Result: High-quality molten base with impurities removed."
          ]
        },
        {
          title: "Extrusion Forming",
          desc: "Creating complex cross-sections.",
          details: [
            "Methods: Direct, Indirect, and Hydrostatic extrusion.",
            "Control: Precise ram speed, pressure, and temperature management.",
            "Die Design: Specialized dies for intricate industrial shapes."
          ]
        },
        {
          title: "Heat Treatment",
          desc: "Enhancing mechanical properties.",
          details: [
            "Solution Heat Treatment: 530-540°C.",
            "Aging: Artificial aging to enhance strength and hardness (T6/T7).",
            "Result: Structural integrity for demanding applications."
          ]
        },
        {
          title: "Precision Machining",
          desc: "Meeting exact specifications.",
          details: [
            "CNC Techniques: Cutting, drilling, milling.",
            "Tolerance: Extremely tight controls.",
            "Surface Roughness: Achieved for specific applications."
          ]
        }
      ],
      autoSteps: [
        {
          title: "Alloy Development & Casting",
          desc: "Engineered for crashworthiness and high strength.",
          details: [
            "Custom 6xxx & 7xxx Series: Developed for optimal strength-to-weight ratios.",
            "Impurity Control: Strict control of Iron (Fe) levels to ensure ductility for crash energy absorption.",
            "Homogenization: Uniform billet structure to prevent downstream extrusion defects."
          ]
        },
        {
          title: "Precision Extrusion",
          desc: "Isothermal process for consistent properties.",
          details: [
            "Multi-Port Extrusion: Creating complex hollow profiles for battery cooling and structural rigidity.",
            "Isothermal Control: Maintains constant temperature exit speed to ensure uniform mechanical properties.",
            "Gradient Quenching: Precise water-mist cooling to manage distortion while locking in microstructure."
          ]
        },
        {
          title: "Advanced Forming",
          desc: "Shaping without compromising integrity.",
          details: [
            "3D Stretch Bending: Curving profiles for aerodynamic vehicle contours without buckling.",
            "Hydroforming: Using high-pressure fluid to shape complex geometries.",
            "Calibration: Post-extrusion stretching to achieve superior straightness tolerances."
          ]
        },
        {
          title: "CNC Machining & Fabrication",
          desc: "5-Axis precision for component integration.",
          details: [
            "5-Axis Milling: For complex mounting points and battery tray features.",
            "Automated Drilling & Tapping: High-speed robotic cells for mass production efficiency.",
            "Tight Tolerances: Maintaining +/- 0.05mm accuracy for assembly fitment."
          ]
        },
        {
          title: "Specialized Heat Treatment",
          desc: "Balancing strength and energy absorption.",
          details: [
            "Crash-Optimized Aging: Specific T6/T7 cycles to maximize energy absorption (ductility) alongside yield strength.",
            "Bake Hardening: Alloys designed to gain final strength during the paint baking process."
          ]
        },
        {
          title: "Joining & Assembly",
          desc: "Next-generation bonding for EV structures.",
          details: [
            "Friction Stir Welding (FSW): Creating leak-proof, high-strength joints for EV battery enclosures.",
            "Laser Welding: Low-heat input joining to minimize distortion.",
            "Structural Bonding: Surface preparation for advanced adhesive applications."
          ]
        }
      ]
    },
    sustainability: {
      title: "Sustainable Future",
      subtitle: "Our Core Values",
      values: {
        p1: "At NKAC, sustainability isn’t an extra feature — it’s our way of doing business. It guides who we are and how we work every day.",
        p2: "When we design and develop our products, we focus on creating solutions that benefit our customers, partners, employees, and local communities. We believe real progress happens only when sustainability drives every decision we make.",
        p3: "Our core values support this commitment, shaping our culture and inspiring us to build a responsible and sustainable future."
      },
      stats: [
        { value: "95%", label: "Energy Savings", sub: "vs Primary Aluminum" },
        { value: "90%", label: "CO₂ Reduction", sub: "Emission Cut" },
        { value: "30%", label: "Recycled Input", sub: "Target Material Mix" }
      ],
      dammam: {
        title: "Dammam Waste Aluminum Recycling Unit",
        status: "Under Construction",
        desc: "Located within Everwin Industrial Park, this facility is a dedicated mechanical pre-treatment unit designed for sorting, shredding, and compressing aluminum scrap. It operates as a completely dry, enclosed, and non-polluting system, ensuring zero chemical discharge.",
        features: [
          "10,000 Tons Annual Capacity",
          "Zero Chemical Emissions",
          "Mechanical Pre-treatment",
          "Supports 50 Local Jobs"
        ]
      },
      riyadh: {
        title: "Riyadh Aluminum Recycling Base",
        status: "Planning & Application",
        desc: "A strategic pilot base planned for the central region to handle aluminum scrap collection and logistics. Currently undergoing municipal licensing and MWAN permitting processes to establish a compliant collection network.",
        features: [
          "Scrap Collection Hub",
          "Logistics Center",
          "MWAN Licensing Phase",
          "Future Expansion Node"
        ]
      },
      process: {
        title: "The Closed-Loop System",
        steps: [
          { title: "Urban Collection", desc: "Recovering scrap from municipalities." },
          { title: "Regional Bases", desc: "Sorting, cleaning, and shredding." },
          { title: "Logistics", desc: "Efficient transport to Dammam." },
          { title: "Extrusion Plant", desc: "Melting, refining, and production." },
          { title: "New Life", desc: "High-end profiles for city & industry." }
        ]
      },
      impact: {
        title: "Strategic Impact",
        items: [
          { title: "Decarbonization", desc: "Aligning with the National Industrial Decarbonization Strategy by reducing carbon intensity." },
          { title: "Municipal Benefits", desc: "Reducing solid waste and landfill burden while creating local employment." },
          { title: "Resource Efficiency", desc: "Closing the material loop and reducing dependence on bauxite mining." }
        ]
      }
    },
    news: {
        title: "Industry Insights",
        subtitle: "Global Market Pulse",
        desc: "Stay updated with the latest trends, market shifts, and corporate developments in the global aluminum sector.",
        lastUpdated: "Last Updated",
        priceAnalysis: "Market Analysis & LME",
        corporateUpdates: "Corporate Updates",
        trends: "Industry Trends",
        additionalFactors: "Strategic Factors",
        loading: "Syncing with global market data...",
        error: "Failed to load latest news. Showing offline records."
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
      terms: "Terms of Use",
      park: "Everwin Industrial Park"
    }
  },
  ar: {
    nav: {
      about: "عن الشركة",
      products: "المنتجات",
      technology: "التقنية",
      sustainability: "الاستدامة",
      news: "الأخبار",
      contact: "اتصل بنا",
      back: "العودة للرئيسية"
    },
    hero: {
      vision: "شريك رؤية 2030",
      titleLine1: "نصيغ",
      titleLine2: "التميز",
      titleLine3: "في كل", 
      desc: "منشأة تصنيع عالمية في مجمع إيفروين الصناعي، المدينة الصناعية الثالثة بالدمام، تنتج 200,000 طن من المقاطع الراقية لقطاعات العمارة والصناعة والنقل.",
      btnProduct: "اكتشف المنتجات",
      btnTech: "تقنياتنا",
      scroll: "مرر لأسفل"
    },
    about: {
      subtitle: "نظرة استراتيجية",
      title: "أبعد من البثق. التميز الهندسي.",
      p1: "شركة نصر كبير للألمنيوم (NKAC) هي شركة رائدة في تصنيع مقاطع الألمنيوم عالية الأداء، وموقعها الاستراتيجي في المملكة العربية السعودية يخدم قطاعات الصناعة والنقل العالمية.",
      p2: "نحن متخصصون في محفظة متنوعة وراقية، تتراوح من الأنظمة المعمارية المتقدمة إلى المقاطع واسعة النطاق للتطبيقات الصناعية والنقل، مدعومة بطاقة تصميمية إجمالية تبلغ 200,000 طن سنوياً. ترتكز عملياتنا على منشأة حديثة تستخدم مكابس بثق ذات حمولة كبيرة وآلات CNC دقيقة لضمان نسب متفوقة للقوة إلى الوزن.",
      p3: "نحن نلتزم بأعلى المعايير الدولية، وحاصلون على شهادات ISO 9001 و ISO 14001 و ISO 45001. وتماشياً مع رؤية السعودية 2030، تلتزم الشركة بتعزيز القيمة المحلية ودعم تنويع الصادرات.",
      statCapacity: "طن سنوياً سعة إنتاجية",
      statExport: "مستهدف التصدير"
    },
    park: {
      subtitle: "النظام البيئي الصناعي",
      title: "مجمع إيفروين الصناعي",
      desc: "تعمل شركة نصر كبير للألمنيوم ضمن مجمع إيفروين الصناعي، وهو مركز صناعي متطور في المدينة الصناعية الثالثة بالدمام.",
      link: "زيارة موقع المجمع"
    },
    products: {
      subtitle: "محفظة المنتجات",
      title: "هندسة من أجل التميز",
      desc: "استكشف مجموعتنا الشاملة من مقاطع الألمنيوم عالية الأداء المصممة لأكثر التطبيقات تطلباً."
    },
    process: {
      title: "سلسلة القيمة المتكاملة",
      desc: "التحكم الكامل داخل الشركة من الصب إلى التشطيب يضمن جودة وتتبعاً فائقين."
    },
    expansion: {
      title: "خارطة الطريق للنمو الاستراتيجي",
      subtitle: "خطة التوسع التدريجي",
      desc: "تماشياً مع أهداف التنويع الصناعي في المملكة، تعمل خطة التوسع متعددة المراحل على نطاق عملياتنا لتلبية الطلب العالمي المتزايد على حلول الألمنيوم الراقية."
    },
    techRoute: {
        title: "المسار التقني المتكامل",
        subtitle: "التكامل الرأسي",
        tabs: {
            core: "العملية الأساسية",
            die: "تصنيع القوالب",
            powder: "طلاء البودرة",
            strip: "شرائط العزل"
        },
        core: {
            title: "الجزء الأول: تصنيع مقاطع الألمنيوم الأساسية",
            desc: "التدفق المركزي المتسلسل للإنتاج من السبائك الخام إلى المقطع النهائي.",
            steps: [
                { id: "1", title: "الصب (Billet)", desc: "الصهر عند 690-720 درجة مئوية والصب المستمر." },
                { id: "2", title: "البثق (Forming)", desc: "تسخين السبائك والتشكيل الدقيق بالمكابس." },
                { id: "3", title: "التقوية", desc: "المعالجة الحرارية والتعتيق (T6/T7)." },
                { id: "4", title: "معالجة السطح", desc: "طلاء البودرة أو الأنودة للحماية والجمال." },
                { id: "5", title: "التشطيب والجودة", desc: "آلات CNC دقيقة وفحص NDT/3D." }
            ]
        },
        auxA: {
            title: "الجزء الثاني-أ: تصنيع القوالب داخلياً",
            desc: "إنشاء القوالب المخصصة المستخدمة في مرحلة البثق.",
            steps: [
                "التصميم والمحاكاة (CAD)",
                "تحضير فولاذ H13",
                "التشكيل الدقيق بـ CNC",
                "المعالجة الحرارية (التقسية)",
                "التلميع (EDM)"
            ],
            connection: "توريد القوالب للبثق"
        },
        auxB: {
            title: "الجزء الثاني-ب: طلاء البودرة داخلياً",
            desc: "إنتاج المسحوق المستخدم في معالجة السطح.",
            steps: [
                "تحضير المواد الخام (الراتنجات)",
                "البثق الساخن والتشتيت",
                "التبريد والتحطيم",
                "الطحن والمنخل",
                "اختبار الجودة"
            ],
            connection: "توريد البودرة للسطح"
        },
        auxC: {
            title: "الجزء الثاني-ج: إنتاج شرائط العزل الحراري",
            desc: "إنتاج شرائط العزل المستخدمة في التجميع.",
            steps: [
                "تأمين المواد (PA66 + GF)",
                "المزج والصهر",
                "بثق الشرائط",
                "التبريد والمعايرة",
                "القطع والفحص"
            ],
            connection: "توريد الشرائط للتجميع"
        }
    },
    techPage: {
      title: "المسار التقني المتقدم",
      subtitle: "التصنيع الدقيق",
      desc: "نحن نستخدم مسارات تقنية متميزة محسنة للتطبيقات المعمارية والصناعية والسيارات، مما يضمن تلبية كل مقطع للمعايير الدولية الصارمة.",
      tabs: {
        arch: "معماري",
        ind: "صناعي",
        auto: "سيارات"
      },
      archSteps: [
        {
          title: "معالجة المواد الخام",
          desc: "سبائك دقيقة وصب قوالب.",
          details: [
            "الصهر والصب: صهر السبائك الخام مع عناصر دقيقة (Mg, Si, Zn).",
            "صب البيليت: صب متطور لهيكل حبيبي موحد.",
            "التحكم في السبائك: التخصيص للقوة الهيكلية والأداء الحراري."
          ]
        },
        {
          title: "تصنيع القوالب داخلياً",
          desc: "آلات CNC متقدمة للحلول المخصصة.",
          details: [
            "دورات تصميم أسرع وتحكم أفضل في التكلفة.",
            "حلول مخصصة للمقاطع العرضية المعقدة.",
            "تصنيع عالي الدقة يضمن تفاوتات ضيقة."
          ]
        },
        {
          title: "عملية البثق",
          desc: "تشكيل عالي الدقة للمقاطع المعقدة.",
          details: [
            "تسخين مسبق للبيليت: تسخين لدرجات حرارة دقيقة.",
            "بثق عالي الدقة: محسن لإطارات النوافذ والجدران الستائرية.",
            "التبريد المفاجئ: تبريد فوري بالهواء/الماء لتثبيت الخواص الميكانيكية."
          ]
        },
        {
          title: "معالجة السطح",
          desc: "تشطيبات متينة للبيئات القاسية.",
          details: [
            "طلاء البودرة: رش إلكتروستاتيكي لتشطيبات مقاومة للعوامل الجوية.",
            "الأنودة: مقاومة معززة للتآكل وجاذبية جمالية.",
            "طلاء PVDF: فلوروكربون لمقاومة فائقة للعوامل الجوية."
          ]
        },
        {
          title: "الملحقات والتجميع",
          desc: "تكامل القيمة المضافة.",
          details: [
            "شرائط العزل الحراري: يتم إنتاجها داخلياً لكفاءة الطاقة.",
            "التكامل: توافق سلس مع مكونات الزجاج والأبواب."
          ]
        }
      ],
      indSteps: [
        {
          title: "اختيار المواد الخام",
          desc: "ألمنيوم عالي النقاء للاحتياجات الصناعية.",
          details: [
            "اختيار نقاء > 99.7%.",
            "السبائك: 6061، 6063، 5052، 7075 لخصائص محددة.",
            "تركيبات مصممة للمتطلبات الصناعية."
          ]
        },
        {
          title: "الصهر والصب",
          desc: "تقنيات تكرير متقدمة.",
          details: [
            "التحكم في درجة الحرارة: نطاق 690-720 درجة مئوية.",
            "التكرير: تكرير التدفق، إزالة الغاز بالتفريغ، التحريك الكهرومغناطيسي.",
            "النتيجة: قاعدة مصهورة عالية الجودة مع إزالة الشوائب."
          ]
        },
        {
          title: "تشكيل البثق",
          desc: "إنشاء مقاطع عرضية معقدة.",
          details: [
            "الطرق: البثق المباشر وغير المباشر والهيدروستاتيكي.",
            "التحكم: إدارة دقيقة لسرعة الكباس والضغط ودرجة الحرارة.",
            "تصميم القوالب: قوالب متخصصة للأشكال الصناعية المعقدة."
          ]
        },
        {
          title: "المعالجة الحرارية",
          desc: "تعزيز الخواص الميكانيكية.",
          details: [
            "المعالجة الحرارية للمحلول: 530-540 درجة مئوية.",
            "التعتيق: تعتيق اصطناعي لزيادة القوة والصلابة (T6/T7).",
            "النتيجة: سلامة هيكلية للتطبيقات المتطلبة."
          ]
        },
        {
          title: "التشغيل الدقيق",
          desc: "تلبية المواصفات الدقيقة.",
          details: [
            "تقنيات CNC: القطع، الحفر، الطحن.",
            "التفاوت: ضوابط ضيقة للغاية.",
            "خشونة السطح: محققة لتطبيقات محددة."
          ]
        }
      ],
      autoSteps: [
        {
          title: "تطوير السبائك والصب",
          desc: "هندسة من أجل مقاومة التصادم والقوة العالية.",
          details: [
            "سلسلة 6xxx و 7xxx المخصصة: لنسب القوة إلى الوزن المثالية.",
            "التحكم في الشوائب: رقابة صارمة على مستويات الحديد لضمان الليونة.",
            "التجانس: هيكل بيليت موحد لمنع عيوب البثق."
          ]
        },
        {
          title: "البثق الدقيق",
          desc: "عملية حرارية ثابتة لخصائص متسقة.",
          details: [
            "بثق متعدد المنافذ: إنشاء مقاطع مجوفة لتبريد البطاريات.",
            "التحكم الحراري: الحفاظ على سرعة خروج ثابتة لضمان انتظام الخصائص.",
            "التبريد المتدرج: تبريد دقيق برذاذ الماء للتحكم في التشويه."
          ]
        },
        {
          title: "التشكيل المتقدم",
          desc: "التشكيل دون المساس بالسلامة.",
          details: [
            "ثني التمدد ثلاثي الأبعاد: منحنيات انسيابية دون انبعاج.",
            "التشكيل المائي: استخدام سائل عالي الضغط لتشكيل أشكال معقدة.",
            "المعايرة: تمدد ما بعد البثق لتحقيق تفاوتات استقامة فائقة."
          ]
        },
        {
          title: "التشغيل والإنتاج بـ CNC",
          desc: "دقة 5 محاور لتكامل المكونات.",
          details: [
            "طحن خماسي المحاور: لنقاط التثبيت المعقدة وميزات صواني البطاريات.",
            "الحفر واللولبة الآلية: خلايا روبوتية عالية السرعة للإنتاج الضخم.",
            "تفاوتات ضيقة: الحفاظ على دقة +/- 0.05 ملم."
          ]
        },
        {
          title: "المعالجة الحرارية المتخصصة",
          desc: "موازنة القوة وامتصاص الطاقة.",
          details: [
            "تعتيق محسن للتصادم: دورات T6/T7 لزيادة امتصاص الطاقة.",
            "صلابة الخبز: سبائك تكتسب القوة النهائية أثناء طلاء الفرن."
          ]
        },
        {
          title: "الربط والتجميع",
          desc: "ربط من الجيل التالي لهياكل السيارات الكهربائية.",
          details: [
            "لحام الاحتكاك الحركي (FSW): وصلات عالية القوة وخالية من التسرب للبطاريات.",
            "اللحام بالليزر: ربط منخفض الحرارة لتقليل التشوه.",
            "الربط الهيكلي: تحضير السطح لتطبيقات المواد اللاصقة المتقدمة."
          ]
        }
      ]
    },
    sustainability: {
      title: "مستقبل مستدام",
      subtitle: "قيمنا الجوهرية",
      values: {
        p1: "في NKAC، الاستدامة ليست مجرد ميزة إضافية - بل هي طريقتنا في ممارسة الأعمال.",
        p2: "عندما نصمم ونطور منتجاتنا، نركز على إنشاء حلول تفيد عملائنا وشركائنا ومجتمعاتنا المحلية.",
        p3: "تدعم قيمنا الجوهرية هذا الالتزام، مما يشكل ثقافتنا لبناء مستقبل مسؤول."
      },
      stats: [
        { value: "95%", label: "توفير الطاقة", sub: "مقارنة بالألمنيوم الأولي" },
        { value: "90%", label: "تقليل الكربون", sub: "خفض الانبعاثات" },
        { value: "30%", label: "مواد معاد تدويرها", sub: "مزيج المواد المستهدف" }
      ],
      dammam: {
        title: "وحدة تدوير نفايات الألمنيوم بالدمام",
        status: "قيد الإنشاء",
        desc: "تقع داخل مجمع إيفروين الصناعي، وهي وحدة معالجة ميكانيكية مخصصة لفرز وتقطيع وضغط خردة الألمنيوم.",
        features: [
          "سعة سنوية 10,000 طن",
          "صفر انبعاثات كيميائية",
          "معالجة ميكانيكية جافة",
          "دعم 50 وظيفة محلية"
        ]
      },
      riyadh: {
        title: "قاعدة تدوير الألمنيوم بالرياض",
        status: "مرحلة التخطيط",
        desc: "قاعدة تجريبية استراتيجية مخططة للمنطقة الوسطى للتعامل مع جمع لوجستيات خردة الألمنيوم.",
        features: [
          "مركز جمع الخردة",
          "مركز لوجستي",
          "مرحلة ترخيص موان",
          "نقطة توسع مستقبلية"
        ]
      },
      process: {
        title: "نظام الحلقة المغلقة",
        steps: [
          { title: "الجمع الحضري", desc: "استعادة الخردة من البلديات." },
          { title: "القواعد الإقليمية", desc: "الفرز والتنظيف والتقطيع." },
          { title: "اللوجستيات", desc: "نقل فعال إلى الدمام." },
          { title: "مصنع البثق", desc: "الصهر والتكرير والإنتاج." },
          { title: "حياة جديدة", desc: "مقاطع راقية للمدينة والصناعة." }
        ]
      },
      impact: {
        title: "الأثر الاستراتيجي",
        items: [
          { title: "إزالة الكربون", desc: "التوافق مع الاستراتيجية الوطنية للصناعة بتقليل كثافة الكربون." },
          { title: "فوائد بلدية", desc: "تقليل النفايات الصلبة وأعباء المرادم مع خلق فرص عمل." },
          { title: "كفاءة الموارد", desc: "إغلاق حلقة المواد وتقليل الاعتماد على تعدين البوكسيت." }
        ]
      }
    },
    news: {
        title: "رؤى الصناعة",
        subtitle: "نبض السوق العالمي",
        desc: "ابق على اطلاع بآخر التوجهات، تقلبات السوق، والتطورات المؤسسية في قطاع الألمنيوم العالمي.",
        lastUpdated: "آخر تحديث",
        priceAnalysis: "تحليل السوق وبورصة لندن (LME)",
        corporateUpdates: "تحديثات الشركات",
        trends: "توجهات الصناعة",
        additionalFactors: "عوامل استراتيجية",
        loading: "جاري المزامنة مع بيانات السوق العالمية...",
        error: "فشل في تحميل آخر الأخبار. يتم عرض السجلات المخزنة."
    },
    footer: {
      desc: "نصيغ مستقبل القطاع الصناعي في المملكة العربية السعودية بمحاليل ألمنيوم دقيقة. تقع في قلب المركز الصناعي بالدمام.",
      navTitle: "الملاحة",
      contactTitle: "اتصل بنا",
      brochure: "كتيب الشركة",
      cr: "سجل تجاري رقم",
      unified: "الرقم الموحد",
      rights: "© 2025 نصر كبير للألمنيوم",
      privacy: "سياسة الخصوصية",
      terms: "شروط الاستخدام",
      park: "مجمع إيفروين الصناعي"
    }
  }
};

// --- DEFAULT NEWS DATA (Fallback) ---
const defaultNewsData: NewsData = {
    date: "2025-12-20",
    lme: [
        "Aluminum rose to $2,958.90 USD/T on December 19, 2025 (+1.47%).",
        "The price has risen 5.20% over the past month and 16.35% year-over-year.",
        "Expected to trade at $3,019.99 in 12 months.",
        "Supply deficit of 108,700 mt in October 2025."
    ],
    corporate: [
        "Tomago Aluminium: Australia's largest smelter securing renewable energy beyond 2028 with $1B investment planned.",
        "Emirates Global Aluminium (EGA): $4B grant for US primary smelter (Oklahoma), first in 45 years.",
        "Rio Tinto: Ongoing talks for low-cost energy solutions for Australian operations.",
        "Norsk Hydro: Strategic alignment in joint venture smelters for decarbonization."
    ],
    trends: [
        "Global primary aluminum market supply deficit reached 955,500 mt (Jan-Oct 2025).",
        "Europe's smelting capacity fell to 2.9 million tonnes annually due to structural decline.",
        "Extrusion usage expected to reach 35.25 million tonnes, with China accounting for 65% of global usage.",
        "Construction aluminum market projected to reach $120B by 2032 with 6.17% CAGR."
    ],
    factors: [
        "China's influence: Consumption expansion at 3.16% annual growth through 2032.",
        "Supply Disruption: Potline suspension at Iceland's Grundartangi smelter.",
        "Government Intervention: Prioritizing access to low-cost, firmed renewables globally."
    ]
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
  <div className="mb-4 max-w-3xl">
    <MotionDiv 
      initial={{ opacity: 0, x: lang === 'en' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className={`inline-block mb-4 px-3 py-1 border ${dark ? 'border-nasr-accent text-nasr-accent' : 'border-nasr-blue text-nasr-blue'} text-xs font-bold tracking-[0.2em] uppercase rounded-sm`}
    >
      {subtitle || "Section"}
    </MotionDiv>
    <MotionH2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`font-serif font-medium leading-tight ${dark ? 'text-white' : 'text-nasr-dark'} ${lang === 'ar' ? 'font-arabic text-5xl md:text-6xl lg:text-7xl' : 'text-4xl md:text-5xl lg:text-6xl'}`}
    >
      {title}
    </MotionH2>
  </div>
);

// --- News Page Component ---
const NewsPage: React.FC<{ lang: Language, goBack: () => void }> = ({ lang, goBack }) => {
  const isRTL = lang === 'ar';
  const t = content[lang].news;
  const [news, setNews] = useState<NewsData>(defaultNewsData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true);
        // 1. Fetch the raw markdown file
        const response = await fetch('./aluminum_industry_news.md');
        if (!response.ok) throw new Error("Failed to fetch news file");
        const markdown = await response.text();

        // 2. Use Gemini to parse the Markdown into the required JSON structure
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Parse the following Aluminum Industry News Markdown into a JSON object matching this schema:
          {
            "date": "string (last updated date)",
            "lme": ["list of price related points"],
            "corporate": ["list of company related updates"],
            "trends": ["list of industry trends"],
            "factors": ["list of additional factors"]
          }

          Markdown Content:
          ${markdown}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                lme: { type: Type.ARRAY, items: { type: Type.STRING } },
                corporate: { type: Type.ARRAY, items: { type: Type.STRING } },
                trends: { type: Type.ARRAY, items: { type: Type.STRING } },
                factors: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["date", "lme", "corporate", "trends", "factors"]
            }
          }
        });

        const parsedData = JSON.parse(result.text || "{}");
        setNews(parsedData);
      } catch (err) {
        console.error("News sync error:", err);
        setError(true);
        // Fallback already set via useState default
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  const categories = [
    { title: t.priceAnalysis, icon: BarChart3, items: news.lme, color: 'text-nasr-blue', bg: 'bg-blue-50' },
    { title: t.corporateUpdates, icon: Building2, items: news.corporate, color: 'text-nasr-red', bg: 'bg-red-50' },
    { title: t.trends, icon: TrendingUp, items: news.trends, color: 'text-nasr-accent', bg: 'bg-emerald-50' },
    { title: t.additionalFactors, icon: Zap, items: news.factors, color: 'text-nasr-dark', bg: 'bg-gray-100' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
         <Loader2 className="w-12 h-12 text-nasr-blue animate-spin mb-4" />
         <p className="text-gray-500 font-serif uppercase tracking-widest text-sm">{t.loading}</p>
      </div>
    );
  }

  return (
    <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className={`min-h-screen bg-white ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}>
      <div className="container mx-auto px-6 mb-12 flex items-center justify-between">
         <button onClick={goBack} className="flex items-center gap-2 text-nasr-blue hover:text-nasr-dark transition-colors font-bold uppercase text-sm tracking-wider">
            <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
            {content[lang].nav.back}
         </button>
         <div className="hidden md:block h-[1px] flex-1 bg-gray-200 mx-8"></div>
         <AlxLogo />
      </div>

      <div className="container mx-auto px-6">
        {error && (
            <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 text-sm font-medium flex items-center gap-3">
                <ShieldCheck size={18} /> {t.error}
            </div>
        )}
        <div className="flex flex-col lg:flex-row gap-12 items-end mb-20">
            <div className="flex-1">
                <SectionHeading title={t.title} subtitle={t.subtitle} lang={lang} />
                <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">{t.desc}</p>
            </div>
            <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border border-gray-100 rounded-sm">
                <Clock className="text-nasr-blue" size={20} />
                <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{t.lastUpdated}</div>
                    <div className="text-sm font-bold text-nasr-dark">{news.date}</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((cat, i) => (
                <MotionDiv 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-white p-8 rounded-sm border border-gray-100 shadow-sm hover:shadow-xl hover:border-nasr-blue/30 transition-all duration-300"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`p-4 ${cat.bg} ${cat.color} rounded-sm group-hover:bg-nasr-blue group-hover:text-white transition-colors duration-300`}>
                            <cat.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-nasr-dark">{cat.title}</h3>
                    </div>
                    <ul className="space-y-6">
                        {cat.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-4">
                                <div className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${cat.color}`}></div>
                                <span className="text-gray-600 leading-relaxed text-sm md:text-base font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </MotionDiv>
            ))}
        </div>

        {/* LME Featured Stat (Driven by dynamic data if possible) */}
        <div className="mt-20 p-10 bg-nasr-dark text-white rounded-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-nasr-blue/20 blur-[100px] -z-10"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                 <div className="max-w-xl">
                    <div className="flex items-center gap-3 text-nasr-blue font-bold uppercase tracking-[0.3em] text-xs mb-4">
                        <BarChart3 size={16} /> LME Live Analysis
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif mb-4">Market settling near a multi-year high by the end of 2025</h2>
                    <p className="text-gray-400 leading-relaxed">The LME primary aluminum cash price is closing in on USD 2,800, with expectations of further increases in the coming year.</p>
                 </div>
                 <div className="flex items-center gap-6">
                     <div className="text-center">
                         <div className="text-4xl md:text-6xl font-serif font-bold text-white mb-1">~$3k</div>
                         <div className="text-[10px] text-nasr-accent font-bold uppercase tracking-widest">12-Mo Forecast</div>
                     </div>
                     <div className="h-20 w-[1px] bg-gray-700 hidden md:block"></div>
                     <div className="text-center">
                         <div className="text-4xl md:text-6xl font-serif font-bold text-white mb-1">+16.3%</div>
                         <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Year-to-Date</div>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </MotionDiv>
  );
};

// --- Integrated Route Diagram Component ---
const IntegratedRouteDiagram: React.FC<{ lang: Language }> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'core' | 'die' | 'powder' | 'strip'>('core');
  const t = content[lang].techRoute;
  const isRTL = lang === 'ar';

  return (
    <div className="bg-white rounded-sm shadow-xl border border-gray-200 overflow-hidden mb-20">
      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b border-gray-200">
        {(['core', 'die', 'powder', 'strip'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 px-4 md:px-6 text-sm md:text-base font-serif font-bold uppercase tracking-wider transition-all duration-300 relative ${activeTab === tab ? 'text-nasr-blue bg-gray-50' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {t.tabs[tab]}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-nasr-blue"></div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[650px]">
        {/* Visual Flowchart Area */}
        <div className="lg:col-span-8 bg-gray-50 p-4 md:p-8 relative overflow-hidden h-full min-h-[400px]">
             <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none"></div>
             
             <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6 md:gap-8 py-8">
                <div className={`relative flex flex-col gap-6 w-full max-w-md transition-opacity duration-500 ${activeTab !== 'core' ? 'opacity-40' : 'opacity-100'}`}>
                    <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-300 -z-10 -translate-x-1/2"></div>
                    
                    {t.core.steps.map((step, i) => (
                        <div key={i} className="relative bg-white border border-gray-200 p-4 rounded-sm shadow-sm flex items-center gap-4 group hover:border-nasr-blue transition-colors">
                            <div className="w-8 h-8 rounded-full bg-nasr-dark text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {step.id}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-nasr-dark text-sm">{step.title}</h4>
                                {i === 1 && (
                                   <button onClick={(e) => { e.stopPropagation(); setActiveTab('die'); }} className="mt-2 text-xs font-bold text-nasr-red uppercase flex items-center gap-1 lg:hidden">
                                      <PenTool size={12} /> View Die Mfg
                                   </button>
                                )}
                                {i === 3 && (
                                   <button onClick={(e) => { e.stopPropagation(); setActiveTab('powder'); }} className="mt-2 text-xs font-bold text-nasr-blue uppercase flex items-center gap-1 lg:hidden">
                                      <PaintBucket size={12} /> View Powder
                                   </button>
                                )}
                                {i === 4 && (
                                   <button onClick={(e) => { e.stopPropagation(); setActiveTab('strip'); }} className="mt-2 text-xs font-bold text-nasr-accent uppercase flex items-center gap-1 lg:hidden">
                                      <Layers size={12} /> View Strips
                                   </button>
                                )}
                            </div>
                            
                            {i === 1 && ( 
                                <div className={`hidden lg:block absolute ${isRTL ? 'right-full mr-8' : 'left-full ml-8'} top-1/2 -translate-y-1/2 transition-all duration-300 z-20 cursor-pointer ${activeTab === 'die' ? 'scale-110 opacity-100' : 'scale-100 opacity-60 hover:opacity-100'}`} onClick={(e) => { e.stopPropagation(); setActiveTab('die'); }}>
                                    <div className="flex items-center">
                                        <div className={`absolute ${isRTL ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 w-8 h-0.5 bg-nasr-red`}></div>
                                        <div className={`w-40 p-3 bg-white border-l-4 border-nasr-red shadow-lg rounded-sm ${activeTab === 'die' ? 'ring-2 ring-nasr-red/30' : ''}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <PenTool size={16} className="text-nasr-red" />
                                                <span className="text-xs font-bold text-nasr-red uppercase">Aux A</span>
                                            </div>
                                            <div className="text-xs font-bold text-gray-800 leading-tight">{t.auxA.title.split(':')[0]}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {i === 3 && (
                                <div className={`hidden lg:block absolute ${isRTL ? 'left-full ml-8' : 'right-full mr-8'} top-1/2 -translate-y-1/2 transition-all duration-300 z-20 cursor-pointer ${activeTab === 'powder' ? 'scale-110 opacity-100' : 'scale-100 opacity-60 hover:opacity-100'}`} onClick={(e) => { e.stopPropagation(); setActiveTab('powder'); }}>
                                    <div className="flex items-center">
                                        <div className={`absolute ${isRTL ? '-right-8' : '-left-8'} top-1/2 -translate-y-1/2 w-8 h-0.5 bg-nasr-blue`}></div>
                                        <div className={`w-40 p-3 bg-white border-r-4 border-nasr-blue shadow-lg rounded-sm ${activeTab === 'powder' ? 'ring-2 ring-nasr-blue/30' : ''}`}>
                                            <div className="flex items-center gap-2 mb-1 justify-end">
                                                <span className="text-xs font-bold text-nasr-blue uppercase">Aux B</span>
                                                <PaintBucket size={16} className="text-nasr-blue" />
                                            </div>
                                            <div className="text-xs font-bold text-gray-800 leading-tight text-right">{t.auxB.title.split(':')[0]}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {i === 4 && (
                                <div className={`hidden lg:block absolute ${isRTL ? 'left-full ml-8' : 'right-full mr-8'} top-1/2 -translate-y-1/2 transition-all duration-300 z-20 cursor-pointer ${activeTab === 'strip' ? 'scale-110 opacity-100' : 'scale-100 opacity-60 hover:opacity-100'}`} onClick={(e) => { e.stopPropagation(); setActiveTab('strip'); }}>
                                    <div className="flex items-center">
                                        <div className={`absolute ${isRTL ? '-right-8' : '-left-8'} top-1/2 -translate-y-1/2 w-8 h-0.5 bg-nasr-accent`}></div>
                                        <div className={`w-40 p-3 bg-white border-r-4 border-nasr-accent shadow-lg rounded-sm ${activeTab === 'strip' ? 'ring-2 ring-nasr-accent/30' : ''}`}>
                                            <div className="flex items-center gap-2 mb-1 justify-end">
                                                <span className="text-xs font-bold text-nasr-accent uppercase">Aux C</span>
                                                <Layers size={16} className="text-nasr-accent" />
                                            </div>
                                            <div className="text-xs font-bold text-gray-800 leading-tight text-right">{t.auxC.title.split(':')[0]}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
             </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-4 bg-white p-8 border-l border-gray-100 flex flex-col justify-center h-full relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
            <AnimatePresence mode="popLayout">
                <MotionDiv key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="relative z-10">
                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-6 text-white ${
                        activeTab === 'core' ? 'bg-nasr-dark' : 
                        activeTab === 'die' ? 'bg-nasr-red' : 
                        activeTab === 'powder' ? 'bg-nasr-blue' : 'bg-nasr-accent'
                    }`}>
                        {activeTab === 'core' ? <Factory size={24} /> : 
                         activeTab === 'die' ? <PenTool size={24} /> : 
                         activeTab === 'powder' ? <Beaker size={24} /> : <Box size={24} />}
                    </div>
                    <h3 className={`text-2xl font-serif font-bold text-gray-900 mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                        {activeTab === 'core' ? t.core.title : 
                         activeTab === 'die' ? t.auxA.title : 
                         activeTab === 'powder' ? t.auxB.title : t.auxC.title}
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed min-h-[60px]">
                        {activeTab === 'core' ? t.core.desc : 
                         activeTab === 'die' ? t.auxA.desc : 
                         activeTab === 'powder' ? t.auxB.desc : t.auxC.desc}
                    </p>
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b pb-2 mb-4">Process Steps</h4>
                        {(activeTab === 'core' ? t.core.steps : 
                          activeTab === 'die' ? t.auxA.steps : 
                          activeTab === 'powder' ? t.auxB.steps : t.auxC.steps).map((step, idx) => (
                            <div key={idx} className="flex items-start gap-3 group">
                                <ArrowRight size={16} className={`mt-1 shrink-0 ${isRTL ? 'rotate-180' : ''} ${
                                    activeTab === 'core' ? 'text-nasr-dark' : 
                                    activeTab === 'die' ? 'text-nasr-red' : 
                                    activeTab === 'powder' ? 'text-nasr-blue' : 'text-nasr-accent'
                                }`} />
                                <div>
                                    {typeof step === 'string' ? (
                                        <span className="text-gray-800 font-medium text-sm">{step}</span>
                                    ) : (
                                        <>
                                            <div className="text-gray-900 font-bold text-sm">{step.title}</div>
                                            <div className="text-gray-500 text-xs mt-0.5">{step.desc}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </MotionDiv>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Products Page Component ---
const ProductsPage: React.FC<{ lang: Language, goBack: () => void }> = ({ lang, goBack }) => {
  const isRTL = lang === 'ar';
  
  const productData = {
    en: [
      {
        id: 'arch',
        title: "Architectural Profiles",
        subtitle: "Construction & Infrastructure",
        desc: "Meeting the demands of Saudi Arabia's mega-projects with high-performance profiles for skyscrapers and smart cities.",
        items: ["Curtain Wall Systems", "Thermal Break Windows", "Structural Glazing", "Decorative Facades", "Sun Control Louvers"],
        img: "https://i.postimg.cc/DymyPGYz/437a075a-1478-4f12-a23b-363e73d7e325.png",
        icon: Building2
      },
      {
        id: 'ind',
        title: "Industrial Profiles",
        subtitle: "Automation & Energy",
        desc: "Precision engineering for the renewable energy sector and automated manufacturing lines.",
        items: ["Solar Mounting Structures", "Heat Sinks & Cooling", "Automation Framing", "Modular Conveyors", "Electronic Enclosures"],
        img: "https://i.postimg.cc/jj6sS4Ld/978bc791-0832-41fe-a3ad-485c0400b0ba.png",
        icon: Factory
      },
      {
        id: 'trans',
        title: "Transportation Profiles",
        subtitle: "Mobility & Aerospace",
        desc: "Lightweight, high-strength alloys driving the future of EVs and rail transit in the Kingdom.",
        items: ["EV Battery Trays", "Rail Transit Car Bodies", "Chassis Components", "Aerospace Interiors", "Marine Structures"],
        img: "https://i.postimg.cc/MpTPT6Hq/2714a0ad-43e3-4ff6-8299-3fa50fa81462.png",
        icon: Car
      }
    ],
    ar: [
      {
        id: 'arch',
        title: "المقاطع المعمارية",
        subtitle: "البناء والبنية التحتية",
        desc: "تلبية متطلبات المشاريع الضخمة في المملكة العربية السعودية بمقاطع عالية الأداء لناطحات السحاب والمدن الذكية.",
        items: ["أنظمة الجدران الستائرية", "نوافذ العزل الحراري", "التزجيج الهيكلي", "الواجهات الزخرفية", "كاسرات الشمس"],
        img: "https://i.postimg.cc/DymyPGYz/437a075a-1478-4f12-a23b-363e73d7e325.png",
        icon: Building2
      },
      {
        id: 'ind',
        title: "المقاطع الصناعية",
        subtitle: "الأتمتة والطاقة",
        desc: "هندسة دقيقة لقطاع الطاقة المتجددة وخطوط التصنيع الآلي.",
        items: ["هياكل تثبيت الطاقة الشمسية", "المشتتات الحرارية والتبريد", "إطارات الأتمتة", "السيور الناقلة المعيارية", "حاويات الإلكترونيات"],
        img: "https://i.postimg.cc/jj6sS4Ld/978bc791-0832-41fe-a3ad-485c0400b0ba.png",
        icon: Factory
      },
      {
        id: 'trans',
        title: "مقاطع النقل",
        subtitle: "التنقل والطيران",
        desc: "سبائك خفيفة الوزن وعالية القوة تقود مستقبل المركبات الكهربائية والسكك الحديدية في المملكة.",
        items: ["صواني بطاريات المركبات الكهربائية", "هياكل عربات السكك الحديدية", "مكونات الشاسيه", "التصميم الداخلي للطائرات", "الهياكل البحرية"],
        img: "https://i.postimg.cc/MpTPT6Hq/2714a0ad-43e3-4ff6-8299-3fa50fa81462.png",
        icon: Car
      }
    ]
  };

  const currentData = productData[lang];
  const t = content[lang].products;

  return (
    <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}>
      <div className="container mx-auto px-6 mb-12 flex items-center justify-between">
         <button onClick={goBack} className="flex items-center gap-2 text-nasr-blue hover:text-nasr-dark transition-colors font-bold uppercase text-sm tracking-wider">
            <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
            {content[lang].nav.back}
         </button>
         <div className="hidden md:block h-[1px] flex-1 bg-gray-200 mx-8"></div>
         <AlxLogo />
      </div>
      <div className="container mx-auto px-6">
        <div className="mb-20">
           <SectionHeading title={t.title} subtitle={t.subtitle} lang={lang} />
           <p className={`text-gray-600 text-lg leading-relaxed max-w-3xl ${isRTL ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-nasr-blue`}>
             {t.desc}
           </p>
        </div>
        <div className="space-y-32">
          {currentData.map((category, index) => (
            <MotionDiv key={category.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}>
               <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-2xl group">
                     <div className="absolute inset-0 bg-nasr-blue/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                     <img src={category.img} alt={category.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
                         <div className="flex items-center gap-2 text-white/90 font-mono text-xs uppercase tracking-widest">
                            <category.icon size={16} />
                            {category.subtitle}
                         </div>
                     </div>
                  </div>
               </div>
               <div className="w-full lg:w-1/2">
                   <h3 className={`text-3xl lg:text-4xl font-serif font-bold text-nasr-dark mb-6 ${isRTL ? 'font-arabic' : ''}`}>{category.title}</h3>
                   <p className="text-gray-600 text-lg leading-relaxed mb-8">{category.desc}</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item, i) => (
                         <div key={i} className="flex items-center gap-3 p-3 rounded-sm bg-white border border-gray-100 hover:border-nasr-blue hover:shadow-md transition-all duration-300">
                             <div className="w-2 h-2 rounded-full bg-nasr-blue"></div>
                             <span className="text-gray-800 font-medium text-sm">{item}</span>
                         </div>
                      ))}
                   </div>
               </div>
            </MotionDiv>
          ))}
        </div>
        <div className="mt-32 text-center pb-12">
            <button onClick={() => { goBack(); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="inline-flex items-center gap-3 px-8 py-4 bg-nasr-blue text-white font-bold uppercase tracking-wider hover:bg-nasr-dark transition-colors rounded-sm shadow-lg hover:shadow-xl">
              {content[lang].nav.contact}
              <ArrowRight size={20} />
            </button>
        </div>
      </div>
    </MotionDiv>
  );
};

// --- Technology Page Component ---
const TechnologyPage: React.FC<{ lang: Language, goBack: () => void }> = ({ lang, goBack }) => {
  const t = content[lang].techPage;
  const routeT = content[lang].techRoute;
  const isRTL = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'arch' | 'ind' | 'auto'>('arch');

  const getSteps = (): ProcessStep[] => {
    switch(activeTab) {
      case 'arch': return t.archSteps.map((s, i) => ({ ...s, icon: [Factory, Settings, Layers, PaintBucket, CheckCircle2][i] || Settings }));
      case 'ind': return t.indSteps.map((s, i) => ({ ...s, icon: [Cpu, Thermometer, Zap, Factory, Settings][i] || Settings }));
      case 'auto': return t.autoSteps.map((s, i) => ({ ...s, icon: [Factory, Zap, Layers, Cpu, Thermometer, ShieldCheck][i] || Settings }));
      default: return [];
    }
  };

  return (
    <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}>
      <div className="container mx-auto px-6 mb-8 flex items-center justify-between">
         <button onClick={goBack} className="flex items-center gap-2 text-nasr-blue hover:text-nasr-dark transition-colors font-bold uppercase text-sm tracking-wider">
            <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
            {content[lang].nav.back}
         </button>
         <div className="hidden md:block h-[1px] flex-1 bg-gray-200 mx-8"></div>
         <AlxLogo />
      </div>
      <div className="relative mb-16 min-h-[500px] h-auto overflow-hidden flex items-center py-12">
        <div className="absolute inset-0">
             <img src="https://i.postimg.cc/BZSsGmLj/c2b9d738-c3fd-4b64-a35e-c018629e21c0.png" alt="Advanced Aluminum Manufacturing" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/20"></div>
        </div>
        <div className="container mx-auto px-6 h-full flex flex-col justify-center relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                <div><SectionHeading title={t.title} subtitle={t.subtitle} dark lang={lang} /></div>
                <div className="pb-4">
                   <p className={`text-lg text-gray-200 leading-relaxed ${isRTL ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-nasr-blue bg-black/30 p-4 backdrop-blur-sm rounded-sm`}>
                      {t.desc}
                   </p>
                </div>
            </div>
        </div>
      </div>
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap gap-4 mb-16 border-b border-gray-200 pb-1">
          {(['arch', 'ind', 'auto'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 px-4 text-lg font-serif transition-all relative ${activeTab === tab ? 'text-nasr-blue font-bold' : 'text-gray-400 hover:text-gray-600'}`}>
              {t.tabs[tab]}
              {activeTab === tab && <MotionDiv layoutId="techTab" className="absolute bottom-0 left-0 right-0 h-1 bg-nasr-blue" />}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-4">
            <div className="sticky top-32 bg-white p-8 rounded-sm shadow-lg border border-gray-100">
               <h3 className="text-xl font-serif mb-8 text-nasr-dark border-b pb-4">Processing Flow</h3>
               <div className="relative">
                  <div className={`absolute top-4 bottom-4 ${isRTL ? 'right-4' : 'left-4'} w-1 bg-gray-100`}></div>
                  {getSteps().map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 mb-8 last:mb-0">
                       <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md shrink-0 ${idx % 2 === 0 ? 'bg-nasr-blue' : 'bg-nasr-dark'}`}>{idx + 1}</div>
                       <div className="pt-1"><h4 className="font-bold text-sm text-gray-800">{step.title}</h4></div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
          <div className="lg:col-span-8">
             <AnimatePresence mode="wait">
               <MotionDiv key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                 {getSteps().map((step, idx) => {
                   const StepIcon = step.icon;
                   return (
                    <div key={idx} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group">
                       <div className="flex items-start gap-6">
                          <div className="p-4 bg-gray-50 text-nasr-blue rounded-sm group-hover:bg-nasr-blue group-hover:text-white transition-colors duration-300"><StepIcon size={32} /></div>
                          <div>
                             <h3 className="text-2xl font-serif text-nasr-dark mb-2">{step.title}</h3>
                             <p className="text-nasr-blue font-medium text-sm uppercase tracking-wider mb-4">{step.desc}</p>
                             <ul className="space-y-3">
                               {step.details.map((detail, dIdx) => (
                                 <li key={dIdx} className="flex items-start gap-3 text-gray-600">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-nasr-accent shrink-0"></div>
                                    <span>{detail}</span>
                                 </li>
                               ))}
                             </ul>
                          </div>
                       </div>
                    </div>
                 )})}
               </MotionDiv>
             </AnimatePresence>
          </div>
        </div>
        <div className="mt-24 pt-12 border-t border-gray-200">
            <SectionHeading title={routeT.title} subtitle={routeT.subtitle} lang={lang} />
            <IntegratedRouteDiagram lang={lang} />
        </div>
      </div>
    </MotionDiv>
  );
};

// --- Sustainability Page Component ---
const SustainabilityPage: React.FC<{ lang: Language, goBack: () => void }> = ({ lang, goBack }) => {
  const t = content[lang].sustainability;
  const isRTL = lang === 'ar';

  return (
    <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className={`min-h-screen bg-white ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}>
      <div className="container mx-auto px-6 mb-12 flex items-center justify-between">
         <button onClick={goBack} className="flex items-center gap-2 text-nasr-blue hover:text-nasr-dark transition-colors font-bold uppercase text-sm tracking-wider">
            <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
            {content[lang].nav.back}
         </button>
         <div className="hidden md:block h-[1px] flex-1 bg-gray-200 mx-8"></div>
         <AlxLogo />
      </div>
      <section className="relative h-[80vh] min-h-[600px] bg-nasr-dark overflow-hidden mb-20 flex items-center">
         <div className="absolute inset-0">
             <img src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop" alt="Green Forest" className="w-full h-full object-cover opacity-80" />
             <div className="absolute inset-0 bg-gradient-to-t from-nasr-dark via-nasr-dark/40 to-transparent"></div>
         </div>
         <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
               <div className="flex items-center justify-center gap-3 mb-6 text-nasr-accent"><Leaf size={32} /><span className="font-bold uppercase tracking-widest text-sm">{t.subtitle}</span></div>
               <h1 className={`text-white font-serif font-bold mb-10 leading-none ${isRTL ? 'font-arabic text-5xl lg:text-7xl' : 'text-5xl lg:text-7xl'}`}>{t.title}</h1>
               <div className="bg-black/30 backdrop-blur-md p-8 md:p-10 rounded-sm border-l-4 border-nasr-accent text-left">
                  <p className="text-white text-lg md:text-xl leading-relaxed mb-6 font-medium">{t.values.p1}</p>
                  <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-6">{t.values.p2}</p>
                  <p className="text-nasr-accent text-base md:text-lg font-bold uppercase tracking-wide">{t.values.p3}</p>
               </div>
            </div>
         </div>
      </section>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-32 relative z-20 mb-24">
           {t.stats.map((stat, i) => (
             <MotionDiv key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-8 shadow-xl border-t-4 border-nasr-accent">
                <div className="text-5xl font-bold text-nasr-dark mb-2">{stat.value}</div>
                <div className="text-nasr-accent font-bold uppercase text-sm tracking-wider mb-1">{stat.label}</div>
                <div className="text-gray-500 text-sm">{stat.sub}</div>
             </MotionDiv>
           ))}
        </div>
        <div className="mb-32">
           <SectionHeading title="Recycling Infrastructure" subtitle="Strategic Network" lang={lang} />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white border border-gray-100 shadow-lg overflow-hidden group hover:border-nasr-accent transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                     <img src="https://images.pexels.com/photos/6591436/pexels-photo-6591436.jpeg" alt="Dammam Recycling" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute top-4 right-4 bg-nasr-accent text-white px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <Zap size={14} /> {t.dammam.status}
                     </div>
                  </div>
                  <div className="p-8">
                     <h3 className={`text-2xl font-serif font-bold text-nasr-dark mb-4 ${isRTL ? 'font-arabic' : ''}`}>{t.dammam.title}</h3>
                     <p className="text-gray-600 mb-6 leading-relaxed text-sm min-h-[80px]">{t.dammam.desc}</p>
                     <ul className="space-y-3">
                        {t.dammam.features.map((feat, i) => (
                           <li key={i} className="flex items-center gap-3 text-gray-700 text-sm font-medium"><CheckCircle2 size={16} className="text-nasr-accent" /> {feat}</li>
                        ))}
                     </ul>
                  </div>
              </div>
              <MotionDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-gray-100 shadow-lg overflow-hidden group hover:border-nasr-blue transition-all duration-300 opacity-90">
                  <div className="relative h-64 overflow-hidden">
                     <img src="https://images.pexels.com/photos/14953330/pexels-photo-14953330.jpeg" alt="Riyadh Logistics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute top-4 right-4 bg-nasr-blue text-white px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <Box size={14} /> {t.riyadh.status}
                     </div>
                  </div>
                  <div className="p-8">
                     <h3 className={`text-2xl font-serif font-bold text-nasr-dark mb-4 ${isRTL ? 'font-arabic' : ''}`}>{t.riyadh.title}</h3>
                     <p className="text-gray-600 mb-6 leading-relaxed text-sm min-h-[80px]">{t.riyadh.desc}</p>
                     <ul className="space-y-3">
                        {t.riyadh.features.map((feat, i) => (
                           <li key={i} className="flex items-center gap-3 text-gray-700 text-sm font-medium"><div className="w-4 h-4 rounded-full border border-nasr-blue flex items-center justify-center"><div className="w-2 h-2 bg-nasr-blue rounded-full"></div></div>{feat}</li>
                        ))}
                     </ul>
                  </div>
              </MotionDiv>
           </div>
        </div>
        <div className="bg-gray-50 p-12 lg:p-20 rounded-sm mb-32">
           <div className="text-center max-w-3xl mx-auto mb-16"><h2 className={`text-3xl lg:text-4xl font-serif font-bold mb-4 ${isRTL ? 'font-arabic' : ''}`}>{t.process.title}</h2><div className="h-1 w-20 bg-nasr-accent mx-auto"></div></div>
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gray-300 -z-10"></div>
              {t.process.steps.map((step, i) => (
                 <div key={i} className="flex flex-col items-center text-center group">
                    <div className={`w-16 h-16 rounded-full border-4 bg-white flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 z-10 relative ${i === 0 || i === 4 ? 'border-nasr-dark text-nasr-dark' : 'border-nasr-accent text-nasr-accent'}`}>
                       {i === 0 ? <Recycle size={24} /> : i === 1 ? <Settings size={24} /> : i === 2 ? <Box size={24} /> : i === 3 ? <Factory size={24} /> : <Leaf size={24} />}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-500 px-2">{step.desc}</p>
                 </div>
              ))}
           </div>
        </div>
        <div className="mb-12">
          <SectionHeading title={t.impact.title} subtitle="Vision 2030" lang={lang} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {t.impact.items.map((item, i) => (
                <div key={i} className="p-8 border border-gray-100 hover:border-nasr-blue hover:shadow-lg transition-all duration-300 group">
                   <div className="mb-6 p-4 bg-blue-50 text-nasr-blue w-fit rounded-sm group-hover:bg-nasr-blue group-hover:text-white transition-colors">{i === 0 ? <Wind size={24}/> : i === 1 ? <Box size={24}/> : <Droplets size={24}/>}</div>
                   <h3 className="text-xl font-serif font-bold text-nasr-dark mb-4">{item.title}</h3>
                   <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState<Page>('home');

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

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
  };

  const goToTechnology = (e: React.MouseEvent) => { e.preventDefault(); setCurrentPage('technology'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goToSustainability = (e: React.MouseEvent) => { e.preventDefault(); setCurrentPage('sustainability'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goToProducts = (e: React.MouseEvent) => { e.preventDefault(); setCurrentPage('products'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goToNews = (e: React.MouseEvent) => { e.preventDefault(); setCurrentPage('news'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-nasr-dark selection:bg-nasr-blue selection:text-white ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || currentPage !== 'home' ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a href="#" onClick={scrollToTop} className={`flex items-center gap-4 group ${isRTL ? 'ml-8 lg:ml-12' : 'mr-8 lg:mr-12'}`}>
            <AlxLogo />
            <div className={`hidden md:flex flex-col ${isRTL ? 'border-r pr-5 mr-1' : 'border-l pl-5 ml-1'} border-gray-400/50 h-10 justify-center`}>
              <span className={`font-serif font-bold text-xl leading-none tracking-tight uppercase ${scrolled || currentPage !== 'home' ? 'text-nasr-dark' : 'text-white'} ${isRTL ? 'font-arabic' : ''}`}>{isRTL ? 'نصر كبير' : 'Nasr Kabeer'}</span>
              <span className={`text-[10px] tracking-[0.35em] uppercase font-medium ${scrolled || currentPage !== 'home' ? 'text-gray-500' : 'text-gray-300'} ${isRTL ? 'font-arabic tracking-wider' : ''} ml-px`}>{isRTL ? 'للألمنيوم' : 'Aluminum'}</span>
            </div>
          </a>
          <div className={`hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-bold tracking-widest uppercase ${scrolled || currentPage !== 'home' ? 'text-gray-800' : 'text-white'}`}>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-nasr-blue transition-colors relative group">{t.nav.about}<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-nasr-blue transition-all duration-300 group-hover:w-full"></span></a>
            <a href="#products" onClick={goToProducts} className={`hover:text-nasr-blue transition-colors relative group ${currentPage === 'products' ? 'text-nasr-blue' : ''}`}>{t.nav.products}<span className={`absolute -bottom-1 left-0 h-[2px] bg-nasr-blue transition-all duration-300 ${currentPage === 'products' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span></a>
            <a href="#technology" onClick={goToTechnology} className={`hover:text-nasr-blue transition-colors relative group ${currentPage === 'technology' ? 'text-nasr-blue' : ''}`}>{t.nav.technology}<span className={`absolute -bottom-1 left-0 h-[2px] bg-nasr-blue transition-all duration-300 ${currentPage === 'technology' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span></a>
            <a href="#sustainability" onClick={goToSustainability} className={`hover:text-nasr-blue transition-colors relative group ${currentPage === 'sustainability' ? 'text-nasr-blue' : ''}`}>{t.nav.sustainability}<span className={`absolute -bottom-1 left-0 h-[2px] bg-nasr-blue transition-all duration-300 ${currentPage === 'sustainability' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span></a>
            <a href="#news" onClick={goToNews} className={`hover:text-nasr-blue transition-colors relative group flex items-center gap-1.5 ${currentPage === 'news' ? 'text-nasr-blue' : ''}`}><Newspaper size={14} />{t.nav.news}<span className={`absolute -bottom-1 left-0 h-[2px] bg-nasr-blue transition-all duration-300 ${currentPage === 'news' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span></a>
            <div className="flex items-center gap-4">
              <button onClick={toggleLang} className="flex items-center gap-1 hover:text-nasr-blue transition-colors"><Globe size={16} /><span>{lang === 'en' ? 'AR' : 'EN'}</span></button>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className={`px-5 py-2.5 border ${scrolled || currentPage !== 'home' ? 'border-nasr-dark text-nasr-dark hover:bg-nasr-dark hover:text-white' : 'border-white text-white hover:bg-white hover:text-nasr-dark'} transition-all duration-300`}>{t.nav.contact}</a>
            </div>
          </div>
          <div className="flex md:hidden items-center gap-4"><button onClick={toggleLang} className={`${scrolled || currentPage !== 'home' ? 'text-nasr-dark' : 'text-white'}`}>{lang === 'en' ? 'AR' : 'EN'}</button><button className={`p-2 ${scrolled || currentPage !== 'home' ? 'text-nasr-dark' : 'text-white'}`} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={32} /> : <Menu size={32} />}</button></div>
        </div>
      </nav>
      <AnimatePresence>
        {menuOpen && (
          <MotionDiv initial={{ x: isRTL ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: isRTL ? '-100%' : '100%' }} transition={{ type: 'tween', duration: 0.4 }} className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 text-2xl font-serif text-nasr-dark">
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')}>{t.nav.about}</a>
              <a href="#products" onClick={goToProducts} className={currentPage === 'products' ? 'text-nasr-blue' : ''}>{t.nav.products}</a>
              <a href="#technology" onClick={goToTechnology} className={currentPage === 'technology' ? 'text-nasr-blue' : ''}>{t.nav.technology}</a>
              <a href="#sustainability" onClick={goToSustainability} className={currentPage === 'sustainability' ? 'text-nasr-blue' : ''}>{t.nav.sustainability}</a>
              <a href="#news" onClick={goToNews} className={currentPage === 'news' ? 'text-nasr-blue' : ''}>{t.nav.news}</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="px-8 py-3 bg-nasr-blue text-white text-lg">{t.nav.contact}</a>
          </MotionDiv>
        )}
      </AnimatePresence>
      <main>
        {currentPage === 'technology' ? (
          <TechnologyPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : currentPage === 'sustainability' ? (
          <SustainabilityPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : currentPage === 'products' ? (
          <ProductsPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : currentPage === 'news' ? (
          <NewsPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : (
          <>
            <header className="relative h-screen flex items-center overflow-hidden bg-nasr-dark">
              <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 transform scale-110 -rotate-2 origin-center"><img src="https://i.postimg.cc/fb6MLTJn/Gemini-Generated-Image-vxqzfcvxqzfcvxqz.png" alt="High-End Aluminum" className="w-full h-full object-cover opacity-90" /></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-nasr-dark via-nasr-dark/70 to-transparent/20"></div>
              </div>
              <div className="relative z-10 container mx-auto px-6 pt-20">
                <MotionDiv initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="max-w-4xl">
                  <div className="flex items-center gap-4 mb-6"><span className="h-[1px] w-12 bg-nasr-accent"></span><span className="text-nasr-accent text-sm font-bold tracking-[0.3em] uppercase">{t.hero.vision}</span></div>
                  <h1 className={`font-serif font-bold leading-none mb-8 text-white ${isRTL ? 'font-arabic text-5xl md:text-7xl' : 'text-6xl md:text-8xl'}`}>
                    {t.hero.titleLine1}<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">{t.hero.titleLine2}</span><br/>{t.hero.titleLine3} {isRTL ? <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-500 drop-shadow-sm">قطاع</span> : <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-500 drop-shadow-sm">PROFILE</span>}
                  </h1>
                  <p className={`text-lg md:text-2xl text-gray-200 font-light leading-relaxed mb-12 max-w-2xl ${isRTL ? 'border-r-2 pr-8' : 'border-l-2 pl-8'} border-gray-400/50`}>{t.hero.desc}</p>
                  <div className="flex flex-col sm:flex-row gap-6">
                     <a href="#products" onClick={goToProducts} className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-nasr-dark font-bold uppercase tracking-wider hover:bg-nasr-accent hover:text-white transition-all duration-300">{t.hero.btnProduct}<ArrowRight size={20} className={`transition-transform ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} /></a>
                     <a href="#technology" onClick={goToTechnology} className="flex items-center justify-center gap-3 px-8 py-4 border border-gray-300 text-gray-100 font-bold uppercase tracking-wider hover:border-white hover:text-white transition-colors">{t.hero.btnTech}</a>
                  </div>
                </MotionDiv>
              </div>
            </header>
            <section id="about" className="py-24 md:py-32 bg-white relative overflow-hidden">
              <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <div>
                     <SectionHeading title={t.about.title} subtitle={t.about.subtitle} lang={lang} />
                     <div className="space-y-6 text-base md:text-lg text-gray-600 leading-relaxed"><p>{t.about.p1}</p><p>{t.about.p2}</p><p>{t.about.p3}</p>
                       <div className="grid grid-cols-2 gap-8 mt-8">
                          <div className={`p-6 bg-gray-50 ${isRTL ? 'border-r-4' : 'border-l-4'} border-nasr-blue`}><div className="text-4xl font-serif font-bold text-nasr-dark mb-2">200K</div><div className="text-xs font-bold uppercase tracking-widest text-gray-500">{t.about.statCapacity}</div></div>
                          <div className={`p-6 bg-gray-50 ${isRTL ? 'border-r-4' : 'border-l-4'} border-nasr-red`}><div className="text-4xl font-serif font-bold text-nasr-dark mb-2">30%</div><div className="text-xs font-bold uppercase tracking-widest text-gray-500">{t.about.statExport}</div></div>
                       </div>
                     </div>
                  </div>
                  <div className="relative">
                     <MotionDiv initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="aspect-[4/5] bg-gray-200 overflow-hidden shadow-2xl relative z-10"><img src="https://images.pexels.com/photos/17650039/pexels-photo-17650039.jpeg" alt="Modern Skyscraper" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out" /><div className="absolute inset-0 bg-nasr-blue/20 mix-blend-multiply"></div></MotionDiv>
                     <MotionDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className={`relative mt-8 lg:mt-0 lg:absolute lg:-bottom-12 lg:${isRTL ? '-right-12' : '-left-12'} z-20 bg-white p-6 shadow-xl border-t-4 border-nasr-blue max-w-sm`}>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4"><div><div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">{t.park.subtitle}</div><h4 className={`font-serif text-xl leading-tight text-nasr-dark ${isRTL ? 'font-arabic' : ''}`}>{t.park.title}</h4></div><div className="p-2 bg-gray-50 rounded-full"><MapPin className="text-nasr-blue" size={20} /></div></div>
                            <img src="https://i.postimg.cc/Kv7bY59r/3.png" alt="Everwin" className="h-10 w-auto object-contain self-start" />
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{t.park.desc}</p>
                            <a href="https://www.everwin.sa/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase text-nasr-blue hover:text-nasr-dark flex items-center gap-2 mt-1 transition-colors group">{t.park.link} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></a>
                        </div>
                     </MotionDiv>
                  </div>
                </div>
              </div>
            </section>
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16"><h2 className={`font-serif mb-6 text-nasr-dark ${isRTL ? 'font-arabic text-4xl md:text-6xl' : 'text-4xl md:text-5xl'}`}>{t.process.title}</h2><p className="text-gray-600">{t.process.desc}</p></div>
                    <ProductionProcessFlow lang={lang} />
                    <div className="mt-12 text-center"><button onClick={goToTechnology} className="inline-flex items-center gap-2 text-nasr-blue hover:text-nasr-dark font-bold uppercase tracking-wider transition-colors">{lang === 'en' ? 'View Detailed Technical Route' : 'عرض المسار التقني التفصيلي'} <ArrowRight size={20} /></button></div>
                </div>
            </section>
            {/* Expansion Content Section - Restored on Home Page */}
            <section id="expansion" className="py-24 bg-nasr-dark relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <StructureGrid />
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5">
                            <SectionHeading 
                                title={t.expansion.title} 
                                subtitle={t.expansion.subtitle} 
                                dark 
                                lang={lang} 
                            />
                            <p className="text-gray-400 text-lg leading-relaxed mt-8 mb-10">
                                {t.expansion.desc}
                            </p>
                        </div>
                        <div className="lg:col-span-7">
                            <CapacityGrowthChart lang={lang} />
                        </div>
                    </div>
                </div>
            </section>
          </>
        )}
        <footer id="contact" className="bg-nasr-dark text-gray-400 pt-24 pb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-nasr-blue via-nasr-accent to-nasr-red"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-8"><AlxLogo /><div className={`mt-2 text-white font-serif text-xl tracking-wider uppercase ${isRTL ? 'font-arabic' : ''}`}>{isRTL ? 'نصر كبير للألمنيوم' : 'Nasr Kabeer Aluminum'}</div></div>
                        <p className="text-lg max-w-md mb-8 leading-relaxed text-gray-500">{t.footer.desc}</p>
                        <div className="flex gap-4"><a href="#" className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-nasr-blue hover:text-white transition-all duration-300"><Linkedin size={20} /></a><a href="#" className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-nasr-blue hover:text-white transition-all duration-300"><Twitter size={20} /></a></div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest mb-8 text-sm">{t.footer.navTitle}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-nasr-accent transition-colors">{t.nav.about}</a></li>
                            <li><a href="#products" onClick={goToProducts} className="hover:text-nasr-accent transition-colors">{t.nav.products}</a></li>
                            <li><a href="#technology" onClick={goToTechnology} className="hover:text-nasr-accent transition-colors">{t.nav.technology}</a></li>
                            <li><a href="#sustainability" onClick={goToSustainability} className="hover:text-nasr-accent transition-colors">{t.nav.sustainability}</a></li>
                            <li><a href="#news" onClick={goToNews} className="hover:text-nasr-accent transition-colors">{t.nav.news}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest mb-8 text-sm">{t.footer.contactTitle}</h4>
                        <ul className="space-y-6 text-sm">
                            <li className="flex items-start gap-4"><MapPin size={20} className="text-nasr-accent shrink-0" /><div className="flex flex-col"><span>{isRTL ? 'المدينة الصناعية الثالثة بالدمام،' : 'Dammam Third Industrial City,'}</span><span>{isRTL ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</span><a href="https://www.everwin.sa/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-nasr-blue hover:text-white transition-colors text-sm font-medium">{t.footer.park} <ExternalLink size={12} /></a></div></li>
                            <li className="flex items-center gap-4"><Mail size={20} className="text-nasr-accent shrink-0" /><span className="hover:text-white cursor-pointer transition-colors">Business@nkaluminum.com</span></li>
                            <li className="flex items-center gap-4"><FileText size={20} className="text-nasr-accent shrink-0" /><div className="flex flex-col"><span className="text-nasr-accent text-xs font-bold uppercase">{t.footer.cr}</span><span className="text-gray-300">2050202550</span></div></li>
                            <li className="flex items-center gap-4"><Phone size={20} className="text-nasr-accent shrink-0" /><div className="flex flex-col"><span className="text-nasr-accent text-xs font-bold uppercase">{t.footer.unified}</span><span className="text-gray-300">7043052724</span></div></li>
                            <li className="mt-6"><button onClick={() => alert(lang === 'en' ? 'Coming Soon' : 'قريباً')} className="flex items-center gap-2 text-white border border-gray-600 px-6 py-3 hover:bg-white hover:text-nasr-dark transition-colors text-xs uppercase tracking-widest font-bold"><Download size={16} /> {t.footer.brochure}</button></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 uppercase tracking-wider"><p>{t.footer.rights}</p><div className="flex gap-8 mt-4 md:mt-0"><a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a><a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a></div></div>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default App;

