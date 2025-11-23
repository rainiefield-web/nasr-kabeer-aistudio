
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StructureGrid } from './components/IndustrialScene';
import { ProductCategoryGrid, ProductionProcessFlow, CapacityGrowthChart } from './components/Diagrams';
import { 
  Menu, X, Download, MapPin, Mail, Linkedin, Twitter, ArrowRight, 
  CheckCircle2, Globe, FileText, Phone, ChevronLeft, Factory, 
  Thermometer, Settings, Layers, ShieldCheck, Zap, Cpu, PaintBucket,
  Gamepad2, Trophy, RefreshCw, Play, ExternalLink, Recycle, Leaf, 
  Wind, Droplets, Truck, CircleDollarSign, HardHat, ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES & CONTENT ---
type Language = 'en' | 'ar';
type Page = 'home' | 'technology' | 'game' | 'sustainability';

// Process Step Type
interface ProcessStep {
  title: string;
  desc: string;
  details: string[];
  icon: React.ElementType;
}

const content = {
  en: {
    nav: {
      about: "About",
      products: "Products",
      expansion: "Expansion",
      technology: "Technology",
      sustainability: "Sustainability",
      game: "Interactive",
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
      btnProfile: "Corporate Profile",
      btnTech: "Our Technology",
      scroll: "Scroll"
    },
    about: {
      subtitle: "Strategic Overview",
      title: "The Foundation of Modern Industry",
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
    game: {
        title: "Interactive Zone",
        subtitle: "Precision Stacker",
        desc: "Experience the precision required in aluminum manufacturing. Stack the billets perfectly to build the highest structure possible.",
        start: "Start Production",
        score: "Current Height",
        highScore: "Best Record",
        gameOver: "Production Halted",
        restart: "Restart Process",
        instruction: "Click or Tap to place the block"
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
      expansion: "التوسع",
      technology: "التقنية",
      sustainability: "الاستدامة",
      game: "المنطقة التفاعلية",
      contact: "تواصل معنا",
      back: "العودة للرئيسية"
    },
    hero: {
      vision: "شريك رؤية 2030",
      titleLine1: "صياغة",
      titleLine2: "التميز",
      titleLine3: "في كل",
      desc: "منشأة تصنيع عالمية المستوى في مجمع إيفروين الصناعي بالمدينة الصناعية الثالثة بالدمام، تنتج 200,000 طن من المقاطع عالية الجودة للقطاعات المعمارية والصناعية وقطاع النقل.",
      btnProduct: "اكتشف منتجاتنا",
      btnProfile: "الملف التعريفي",
      btnTech: "تقنياتنا",
      scroll: "تمرير"
    },
    about: {
      subtitle: "نظرة استراتيجية",
      title: "أساس الصناعة الحديثة",
      p1: "شركة نصر كبير للألمنيوم المحدودة (NKAC) هي شركة رائدة في تصنيع مقاطع الألمنيوم عالية الأداء، وتتمتع بموقع استراتيجي في المملكة العربية السعودية لخدمة القطاعات الصناعية وقطاع النقل عالمياً.",
      p2: "نحن متخصصون في محفظة متنوعة وعالية الجودة، تتراوح من الأنظمة المعمارية المتقدمة إلى المقاطع واسعة النطاق للتطبيقات الصناعية والنقل، مدعومة بطاقة تصميمية إجمالية تبلغ 200,000 طن سنوياً. ترتكز عملياتنا على منشأة حديثة تستخدم مكابس بثق ذات حمولة كبيرة وآلات تشغيل دقيقة CNC لضمان نسب قوة إلى وزن فائقة وهندسة مقاطع معقدة.",
      p3: "نحن نلتزم بأعلى المعايير الدولية، وحاصلون على شهادات ISO 9001 و ISO 14001 و ISO 45001، مما يعكس التزامنا الراسخ بالجودة والاستدامة والسلامة. تماشياً مع رؤية السعودية 2030، تكرس NKAC جهودها لدفع عجلة خلق القيمة المحلية ودعم تنويع الصادرات لكل من الأسواق المحلية والدولية.",
      statCapacity: "طن/سنة طاقة إنتاجية",
      statExport: "هدف التصدير"
    },
    park: {
      subtitle: "نظام بيئي صناعي",
      title: "مجمع إيفروين الصناعي",
      desc: "تعمل شركة نصر كبير للألمنيوم داخل مجمع إيفروين الصناعي، وهو مركز صناعي متطور في المدينة الصناعية الثالثة بالدمام، يوفر بنية تحتية عالمية المستوى للتصنيع المتقدم.",
      link: "زيارة موقع المجمع"
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
    techPage: {
      title: "المسار التقني المتقدم",
      subtitle: "التصنيع الدقيق",
      desc: "نحن نوظف مسارات تقنية متميزة ومحسنة للتطبيقات المعمارية والصناعية والسيارات، مما يضمن تلبية كل مقطع للمعايير الدولية الصارمة.",
      tabs: {
        arch: "معماري",
        ind: "صناعي",
        auto: "سيارات"
      },
      archSteps: [
        {
          title: "معالجة المواد الخام",
          desc: "سبائك دقيقة وصب كتل.",
          details: [
            "الصهروالصب: صهر سبائك خام مع عناصر دقيقة (مغنيسيوم، سيليكون).",
            "صب الكتل: تقنيات صب حديثة لهيكل حبيبي موحد.",
            "تحكم داخلي في السبائك: تخصيص للقوة الهيكلية."
          ]
        },
        {
          title: "تصنيع القوالب داخلياً",
          desc: "تشغيل CNC متقدم للحلول المخصصة.",
          details: [
            "دورات تصميم أسرع وتحكم أفضل في التكلفة.",
            "حلول مخصصة للمقاطع المعقدة.",
            "تصنيع عالي الدقة يضمن تفاوتات ضيقة."
          ]
        },
        {
          title: "عملية البثق",
          desc: "تشكيل عالي الدقة للمقاطع المعقدة.",
          details: [
            "تسخين الكتل: تسخين لدرجات حرارة دقيقة.",
            "بثق عالي الدقة: محسن لإطارات النوافذ والجدران الستائرية.",
            "التبريد: تبريد فوري بالهواء/الماء لتثبيت الخواص الميكانيكية."
          ]
        },
        {
          title: "المعالجة السطحية",
          desc: "تشطيبات متينة للبيئات القاسية.",
          details: [
            "طلاء البودرة: رش الكهروستاتيكي لتشطيبات مقاومة للطقس.",
            "الأنودة: تعزيز مقاومة التآكل والجاذبية الجمالية.",
            "طلاء PVDF: فلوروكربون لمقاومة فائقة في البيئات الصعبة."
          ]
        },
        {
          title: "التجميع والملحقات",
          desc: "تكامل ذو قيمة مضافة.",
          details: [
            "شرائط العزل الحراري: تنتج داخلياً لكفاءة الطاقة.",
            "التكامل: توافق سلس مع مكونات الزجاج والأبواب."
          ]
        }
      ],
      indSteps: [
        {
          title: "اختيار المواد الخام",
          desc: "ألمنيوم عالي النقاء للاحتياجات الصناعية.",
          details: [
            "نقاء > 99.7٪.",
            "سبائك: 6061، 6063، 5052، 7075.",
            "تركيبات مخصصة للمتطلبات الصناعية."
          ]
        },
        {
          title: "الصهروالصب",
          desc: "تقنيات تكرير متقدمة.",
          details: [
            "التحكم في الحرارة: 690-720 درجة مئوية.",
            "التكرير: تكرير التدفق، تفريغ الغاز، التحريك الكهرومغناطيسي.",
            "النتيجة: قاعدة منصهرة عالية الجودة."
          ]
        },
        {
          title: "تشكيل البثق",
          desc: "إنشاء مقاطع عرضية معقدة.",
          details: [
            "الطرق: بثق مباشر، غير مباشر، وهيدروستاتيكي.",
            "التحكم: إدارة دقيقة لسرعة المكبس والضغط.",
            "تصميم القوالب: قوالب متخصصة للأشكال الصناعية."
          ]
        },
        {
          title: "المعالجة الحرارية",
          desc: "تعزيز الخواص الميكانيكية.",
          details: [
            "معالجة حرارية للمحلول: 530-540 درجة مئوية.",
            "التقادم: تقادم اصطناعي لتعزيز القوة (T6/T7).",
            "النتيجة: سلامة هيكلية للتطبيقات الصعبة."
          ]
        },
        {
          title: "التشغيل الدقيق",
          desc: "تلبية المواصفات الدقيقة.",
          details: [
            "تقنيات CNC: القطع، الحفر، الطحن.",
            "التفاوت: ضوابط ضيقة للغاية.",
            "خشونة السطح: تتحقق لتطبيقات محددة."
          ]
        }
      ],
      autoSteps: [
        {
          title: "تطوير السبائك والصب",
          desc: "مصممة لمقاومة التصادم والقوة العالية.",
          details: [
            "سلسلة 6xxx و 7xxx المخصصة: مطورة لتحقيق أفضل نسب قوة إلى وزن.",
            "التحكم في الشوائب: رقابة صارمة على مستويات الحديد (Fe) لضمان الليونة لامتصاص طاقة التصادم.",
            "التجانس: هيكل موحد للكتل لمنع عيوب البثق اللاحقة."
          ]
        },
        {
          title: "البثق الدقيق",
          desc: "عملية متساوية الحرارة لخواص متسقة.",
          details: [
            "بثق متعدد الفتحات: إنشاء مقاطع مجوفة معقدة لتبريد البطاريات والصلابة الهيكلية.",
            "التحكم المتساوي الحرارة: الحفاظ على سرعة خروج ودرجة حرارة ثابتة لضمان تجانس الخواص الميكانيكية.",
            "التبريد المتدرج: تبريد دقيق برذاذ الماء للتحكم في التشوه مع تثبيت البنية المجهرية."
          ]
        },
        {
          title: "التشكيل المتقدم",
          desc: "تشكيل بدون المساس بالسلامة الهيكلية.",
          details: [
            "الثني بالتمدد ثلاثي الأبعاد: ثني المقاطع لتناسب انحناءات المركبة الديناميكية دون التواء.",
            "التشكيل الهيدروليكي: استخدام سائل عالي الضغط لتشكيل هندسة معقدة.",
            "المعايرة: تمدد ما بعد البثق لتحقيق تفاوتات استقامة فائقة."
          ]
        },
        {
          title: "تشغيل CNC والتصنيع",
          desc: "دقة خماسية المحاور لتكامل المكونات.",
          details: [
            "طحن خماسي المحاور (5-Axis): لنقاط التثبيت المعقدة وميزات صينية البطارية.",
            "الحفر والتثقيب الآلي: خلايا روبوتية عالية السرعة لكفاءة الإنتاج الضخم.",
            "تفاوتات ضيقة: الحفاظ على دقة +/- 0.05 مم لملاءمة التجميع."
          ]
        },
        {
          title: "معالجة حرارية متخصصة",
          desc: "موازنة القوة وامتصاص الطاقة.",
          details: [
            "تقادم محسن للتصادم: دورات T6/T7 محددة لتعظيم امتصاص الطاقة (الليونة) جنباً إلى جنب مع قوة الخضوع.",
            "تصلب الخبز: سبائك مصممة لاكتساب قوتها النهائية أثناء عملية خبز الطلاء."
          ]
        },
        {
          title: "الربط والتجميع",
          desc: "الجيل القادم من تقنيات الربط لهياكل المركبات الكهربائية.",
          details: [
            "لحام الاحتكاك (FSW): إنشاء وصلات مانعة للتسرب وعالية القوة لحاويات بطاريات السيارات الكهربائية.",
            "اللحام بالليزر: مدخلات حرارة منخفضة لتقليل التشوه.",
            "الربط الهيكلي: تحضير السطح لتطبيقات المواد اللاصقة المتقدمة."
          ]
        }
      ]
    },
    sustainability: {
      title: "مستقبل مستدام",
      subtitle: "قيمنا الجوهرية",
      values: {
        p1: "في شركة نصر كبير، الاستدامة ليست مجرد ميزة إضافية — بل هي جوهر أسلوبنا في العمل. إنها توجه هويتنا وكيفية عملنا كل يوم.",
        p2: "عندما نصمم ونطور منتجاتنا، نركز على ابتكار حلول تعود بالنفع على عملائنا وشركائنا وموظفينا ومجتمعاتنا المحلية. نحن نؤمن بأن التقدم الحقيقي يتحقق فقط عندما تكون الاستدامة هي المحرك لكل قرار نتخذه.",
        p3: "تدعم قيمنا الجوهرية هذا الالتزام، وتشكل ثقافتنا وتلهمنا لبناء مستقبل مسؤول ومستدام."
      },
      stats: [
        { value: "95%", label: "توفير الطاقة", sub: "مقارنة بالألمنيوم الأولي" },
        { value: "90%", label: "خفض الكربون", sub: "تقليل الانبعاثات" },
        { value: "30%", label: "محتوى معاد تدويره", sub: "مزيج المواد المستهدف" }
      ],
      dammam: {
        title: "وحدة إعادة تدوير نفايات الألمنيوم بالدمام",
        status: "قيد الإنشاء",
        desc: "تقع داخل مجمع إيفروين الصناعي، وهي وحدة معالجة أولية ميكانيكية مخصصة لفرز وتقطيع وضغط خردة الألمنيوم. تعمل بنظام جاف ومغلق بالكامل وغير ملوث، مما يضمن عدم وجود أي تصريف كيميائي.",
        features: [
          "طاقة سنوية 10,000 طن",
          "انبعاثات كيميائية صفرية",
          "معالجة أولية ميكانيكية",
          "دعم 50 وظيفة محلية"
        ]
      },
      riyadh: {
        title: "قاعدة الرياض لإعادة تدوير الألمنيوم",
        status: "مرحلة التخطيط والترخيص",
        desc: "قاعدة استراتيجية مخطط لها في المنطقة الوسطى للتعامل مع جمع خردة الألمنيوم والخدمات اللوجستية. تخضع حالياً لعمليات الترخيص البلدي وتصاريح المركز الوطني لإدارة النفايات (MWAN).",
        features: [
          "مركز جمع الخردة",
          "مركز لوجستي",
          "مرحلة ترخيص MWAN",
          "نقطة توسع مستقبلية"
        ]
      },
      process: {
        title: "نظام الحلقة المغلقة",
        steps: [
          { title: "الجمع الحضري", desc: "استعادة الخردة من البلديات." },
          { title: "القواعد الإقليمية", desc: "الفرز، التنظيف، والتقطيع." },
          { title: "اللوجستيات", desc: "نقل فعال إلى الدمام." },
          { title: "مصنع البثق", desc: "الصهر، التكرير، والإنتاج." },
          { title: "حياة جديدة", desc: "مقاطع عالية الجودة للمدن والصناعة." }
        ]
      },
      impact: {
        title: "الأثر الاستراتيجي",
        items: [
          { title: "إزالة الكربون", desc: "التوافق مع الاستراتيجية الوطنية لإزالة الكربون الصناعي عن طريق خفض كثافة الكربون." },
          { title: "الفوائد البلدية", desc: "تقليل النفايات الصلبة وأعباء المكبات مع خلق فرص عمل محلية." },
          { title: "كفاءة الموارد", desc: "إغلاق حلقة المواد وتقليل الاعتماد على تعدين البوكسيت." }
        ]
      }
    },
    game: {
        title: "المنطقة التفاعلية",
        subtitle: "مكدس الدقة",
        desc: "جرب الدقة المطلوبة في تصنيع الألمنيوم. قم بتكديس الكتل بشكل مثالي لبناء أعلى هيكل ممكن.",
        start: "ابدأ الإنتاج",
        score: "الارتفاع الحالي",
        highScore: "أفضل سجل",
        gameOver: "توقف الإنتاج",
        restart: "إعادة العملية",
        instruction: "انقر أو اضغط لوضع الكتلة"
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
      terms: "شروط الاستخدام",
      park: "مجمع إيفروين الصناعي"
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

// --- Technology Page Component ---
const TechnologyPage: React.FC<{ lang: Language, goBack: () => void }> = ({ lang, goBack }) => {
  const t = content[lang].techPage;
  const isRTL = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'arch' | 'ind' | 'auto'>('arch');

  const getSteps = (): ProcessStep[] => {
    switch(activeTab) {
      case 'arch': 
        return t.archSteps.map((s, i) => ({ ...s, icon: [Factory, Settings, Layers, PaintBucket, CheckCircle2][i] || Settings }));
      case 'ind': 
        return t.indSteps.map((s, i) => ({ ...s, icon: [Cpu, Thermometer, Zap, Factory, Settings][i] || Settings }));
      case 'auto': 
        return t.autoSteps.map((s, i) => ({ ...s, icon: [Factory, Zap, Layers, Cpu, Thermometer, ShieldCheck][i] || Settings }));
      default: return [];
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}
    >
      {/* Sticky Header for Tech Page */}
      <div className="container mx-auto px-6 mb-12 flex items-center justify-between">
         <button onClick={goBack} className="flex items-center gap-2 text-nasr-blue hover:text-nasr-dark transition-colors font-bold uppercase text-sm tracking-wider">
            <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
            {content[lang].nav.back}
         </button>
         <div className="hidden md:block h-[1px] flex-1 bg-gray-200 mx-8"></div>
         <AlxLogo />
      </div>

      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} lang={lang} />
        <p className="max-w-3xl text-lg text-gray-600 mb-12 leading-relaxed">
          {t.desc}
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-16 border-b border-gray-200 pb-1">
          {(['arch', 'ind', 'auto'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 text-lg font-serif transition-all relative ${activeTab === tab ? 'text-nasr-blue font-bold' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t.tabs[tab]}
              {activeTab === tab && (
                <motion.div layoutId="techTab" className="absolute bottom-0 left-0 right-0 h-1 bg-nasr-blue" />
              )}
            </button>
          ))}
        </div>

        {/* Content Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Visual Diagram Side (30%) */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 bg-white p-8 rounded-sm shadow-lg border border-gray-100">
               <h3 className="text-xl font-serif mb-8 text-nasr-dark border-b pb-4">Processing Flow</h3>
               <div className="relative">
                  <div className={`absolute top-4 bottom-4 ${isRTL ? 'right-4' : 'left-4'} w-1 bg-gray-100`}></div>
                  {getSteps().map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 mb-8 last:mb-0">
                       <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md shrink-0 ${idx % 2 === 0 ? 'bg-nasr-blue' : 'bg-nasr-dark'}`}>
                          {idx + 1}
                       </div>
                       <div className="pt-1">
                          <h4 className="font-bold text-sm text-gray-800">{step.title}</h4>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Detailed Steps Side (70%) */}
          <div className="lg:col-span-8">
             <AnimatePresence mode="wait">
               <motion.div 
                 key={activeTab}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="space-y-8"
               >
                 {getSteps().map((step, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group">
                       <div className="flex items-start gap-6">
                          <div className="p-4 bg-gray-50 text-nasr-blue rounded-sm group-hover:bg-nasr-blue group-hover:text-white transition-colors duration-300">
                             <step.icon size={32} />
                          </div>
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
                 ))}
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Sustainability Page Component ---
const SustainabilityPage: React.FC<{ lang: Language, goBack: () => void }> = ({ lang, goBack }) => {
  const t = content[lang].sustainability;
  const isRTL = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`min-h-screen bg-white ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}
    >
      {/* Header */}
      <div className="container mx-auto px-6 mb-12 flex items-center justify-between">
         <button onClick={goBack} className="flex items-center gap-2 text-nasr-blue hover:text-nasr-dark transition-colors font-bold uppercase text-sm tracking-wider">
            <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
            {content[lang].nav.back}
         </button>
         <div className="hidden md:block h-[1px] flex-1 bg-gray-200 mx-8"></div>
         <AlxLogo />
      </div>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] bg-nasr-dark overflow-hidden mb-20 flex items-center">
         <div className="absolute inset-0">
             <img 
               src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop" 
               alt="Green Forest" 
               className="w-full h-full object-cover opacity-80"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-nasr-dark via-nasr-dark/40 to-transparent"></div>
         </div>
         <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
               <div className="flex items-center justify-center gap-3 mb-6 text-nasr-accent">
                  <Leaf size={32} />
                  <span className="font-bold uppercase tracking-widest text-sm">{t.subtitle}</span>
               </div>
               <h1 className={`text-white font-serif font-bold mb-10 leading-none ${isRTL ? 'font-arabic text-5xl lg:text-7xl' : 'text-5xl lg:text-7xl'}`}>
                 {t.title}
               </h1>
               
               {/* Core Values Text */}
               <div className="bg-black/30 backdrop-blur-md p-8 md:p-10 rounded-sm border-l-4 border-nasr-accent text-left">
                  <p className="text-white text-lg md:text-xl leading-relaxed mb-6 font-medium">
                     {t.values.p1}
                  </p>
                  <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-6">
                     {t.values.p2}
                  </p>
                  <p className="text-nasr-accent text-base md:text-lg font-bold uppercase tracking-wide">
                     {t.values.p3}
                  </p>
               </div>
            </div>
         </div>
      </section>

      <div className="container mx-auto px-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-32 relative z-20 mb-24">
           {t.stats.map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-8 shadow-xl border-t-4 border-nasr-accent"
             >
                <div className="text-5xl font-bold text-nasr-dark mb-2">{stat.value}</div>
                <div className="text-nasr-accent font-bold uppercase text-sm tracking-wider mb-1">{stat.label}</div>
                <div className="text-gray-500 text-sm">{stat.sub}</div>
             </motion.div>
           ))}
        </div>

        {/* Dual Facility Hubs */}
        <div className="mb-32">
           <SectionHeading title="Recycling Infrastructure" subtitle="Strategic Network" lang={lang} />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Dammam Hub (Construction) */}
              <div className="bg-white border border-gray-100 shadow-lg overflow-hidden group hover:border-nasr-accent transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                     <img 
                        src="https://images.pexels.com/photos/6591436/pexels-photo-6591436.jpeg" 
                        alt="Dammam Recycling Unit - Aluminum Scrap Bales" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                     />
                     <div className="absolute top-4 right-4 bg-nasr-accent text-white px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <HardHat size={14} /> {t.dammam.status}
                     </div>
                  </div>
                  <div className="p-8">
                     <h3 className={`text-2xl font-serif font-bold text-nasr-dark mb-4 ${isRTL ? 'font-arabic' : ''}`}>{t.dammam.title}</h3>
                     <p className="text-gray-600 mb-6 leading-relaxed text-sm min-h-[80px]">
                        {t.dammam.desc}
                     </p>
                     <ul className="space-y-3">
                        {t.dammam.features.map((feat, i) => (
                           <li key={i} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                              <CheckCircle2 size={16} className="text-nasr-accent" /> {feat}
                           </li>
                        ))}
                     </ul>
                  </div>
              </div>

              {/* Riyadh Hub (Planning) */}
              <div className="bg-white border border-gray-100 shadow-lg overflow-hidden group hover:border-nasr-blue transition-all duration-300 opacity-90">
                  <div className="relative h-64 overflow-hidden">
                     <img 
                        src="https://images.pexels.com/photos/14953330/pexels-photo-14953330.jpeg" 
                        alt="Riyadh Logistics Base - Sorting and Processing" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                     />
                     <div className="absolute top-4 right-4 bg-nasr-blue text-white px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <ClipboardCheck size={14} /> {t.riyadh.status}
                     </div>
                  </div>
                  <div className="p-8">
                     <h3 className={`text-2xl font-serif font-bold text-nasr-dark mb-4 ${isRTL ? 'font-arabic' : ''}`}>{t.riyadh.title}</h3>
                     <p className="text-gray-600 mb-6 leading-relaxed text-sm min-h-[80px]">
                        {t.riyadh.desc}
                     </p>
                     <ul className="space-y-3">
                        {t.riyadh.features.map((feat, i) => (
                           <li key={i} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                              <div className="w-4 h-4 rounded-full border border-nasr-blue flex items-center justify-center">
                                 <div className="w-2 h-2 bg-nasr-blue rounded-full"></div>
                              </div>
                              {feat}
                           </li>
                        ))}
                     </ul>
                  </div>
              </div>

           </div>
        </div>

        {/* The System Flow */}
        <div className="bg-gray-50 p-12 lg:p-20 rounded-sm mb-32">
           <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className={`text-3xl lg:text-4xl font-serif font-bold mb-4 ${isRTL ? 'font-arabic' : ''}`}>{t.process.title}</h2>
              <div className="h-1 w-20 bg-nasr-accent mx-auto"></div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Connector Line Desktop */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gray-300 -z-10"></div>
              
              {t.process.steps.map((step, i) => (
                 <div key={i} className="flex flex-col items-center text-center group">
                    <div className={`w-16 h-16 rounded-full border-4 bg-white flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 z-10 ${i === 0 || i === 4 ? 'border-nasr-dark text-nasr-dark' : 'border-nasr-accent text-nasr-accent'}`}>
                       {i === 0 ? <Recycle size={24} /> : 
                        i === 1 ? <Settings size={24} /> : 
                        i === 2 ? <Truck size={24} /> : 
                        i === 3 ? <Factory size={24} /> : 
                        <Leaf size={24} />}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-500 px-2">{step.desc}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Strategic Impact Cards */}
        <div className="mb-12">
          <SectionHeading title={t.impact.title} subtitle="Vision 2030" lang={lang} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {t.impact.items.map((item, i) => (
                <div key={i} className="p-8 border border-gray-100 hover:border-nasr-blue hover:shadow-lg transition-all duration-300 group">
                   <div className="mb-6 p-4 bg-blue-50 text-nasr-blue w-fit rounded-sm group-hover:bg-nasr-blue group-hover:text-white transition-colors">
                      {i === 0 ? <Wind size={24}/> : i === 1 ? <CircleDollarSign size={24}/> : <Droplets size={24}/>}
                   </div>
                   <h3 className="text-xl font-serif font-bold text-nasr-dark mb-4">{item.title}</h3>
                   <p className="text-gray-600 leading-relaxed text-sm">
                     {item.desc}
                   </p>
                </div>
             ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

// --- Game Component: Aluminum Stacker ---
const AluminumStackerGame: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = content[lang].game;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Game constants
    const BLOCK_HEIGHT = 30;
    const INITIAL_WIDTH = 200;
    const MOVE_SPEED_BASE = 3;

    // Game state refs to avoid re-renders in loop
    const gameState = useRef({
        stack: [] as {x: number, width: number}[], // existing blocks
        currentBlock: { x: 0, width: INITIAL_WIDTH, movingRight: true },
        level: 1,
        offset: 0, // to scroll camera up
        speed: MOVE_SPEED_BASE
    });

    const requestRef = useRef<number>(0);

    const resetGame = () => {
        gameState.current = {
            stack: [{ x: 100, width: INITIAL_WIDTH }], // Base block centered (assuming canvas width 400)
            currentBlock: { x: 0, width: INITIAL_WIDTH, movingRight: true },
            level: 1,
            offset: 0,
            speed: MOVE_SPEED_BASE
        };
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
    };

    const gameLoop = useCallback(() => {
        if (!isPlaying || gameOver) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const state = gameState.current;

        // Update Position
        if (state.currentBlock.movingRight) {
            state.currentBlock.x += state.speed;
            if (state.currentBlock.x + state.currentBlock.width > width) {
                state.currentBlock.movingRight = false;
            }
        } else {
            state.currentBlock.x -= state.speed;
            if (state.currentBlock.x < 0) {
                state.currentBlock.movingRight = true;
            }
        }

        // Draw
        ctx.clearRect(0, 0, width, height);

        // Draw Background Grid
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < width; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
        for (let i = 0; i < height; i += 40) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
        ctx.stroke();

        // Scroll offset
        const stackHeight = state.stack.length * BLOCK_HEIGHT;
        const targetOffset = Math.max(0, stackHeight - height / 2);
        // Simple lerp for smooth camera
        state.offset += (targetOffset - state.offset) * 0.1;

        ctx.save();
        ctx.translate(0, state.offset);

        // Draw Stack
        state.stack.forEach((block, index) => {
            const y = height - (index + 1) * BLOCK_HEIGHT;
            // Metallic Gradient
            const grad = ctx.createLinearGradient(block.x, 0, block.x + block.width, 0);
            grad.addColorStop(0, '#9ca3af');
            grad.addColorStop(0.5, '#e5e7eb');
            grad.addColorStop(1, '#9ca3af');
            
            ctx.fillStyle = grad;
            ctx.fillRect(block.x, y, block.width, BLOCK_HEIGHT);
            ctx.strokeStyle = '#4b5563';
            ctx.strokeRect(block.x, y, block.width, BLOCK_HEIGHT);
        });

        // Draw Current Block
        const currentY = height - (state.stack.length + 1) * BLOCK_HEIGHT;
        
        // Active block color (Nasr Blue tint)
        const activeGrad = ctx.createLinearGradient(state.currentBlock.x, 0, state.currentBlock.x + state.currentBlock.width, 0);
        activeGrad.addColorStop(0, '#0077be'); // Darker blue
        activeGrad.addColorStop(0.5, '#60a5fa'); // Lighter blue
        activeGrad.addColorStop(1, '#0077be');

        ctx.fillStyle = activeGrad;
        ctx.fillRect(state.currentBlock.x, currentY, state.currentBlock.width, BLOCK_HEIGHT);
        ctx.strokeStyle = '#1e3a8a';
        ctx.strokeRect(state.currentBlock.x, currentY, state.currentBlock.width, BLOCK_HEIGHT);

        ctx.restore();

        requestRef.current = requestAnimationFrame(gameLoop);
    }, [isPlaying, gameOver]);

    useEffect(() => {
        if (isPlaying && !gameOver) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, gameOver, gameLoop]);

    const handleAction = () => {
        if (gameOver) {
            resetGame();
            return;
        }
        if (!isPlaying) {
            setIsPlaying(true);
            resetGame();
            return;
        }

        const state = gameState.current;
        const prevBlock = state.stack[state.stack.length - 1];
        const curr = state.currentBlock;

        // Calculate overlap
        const overlapLeft = Math.max(prevBlock.x, curr.x);
        const overlapRight = Math.min(prevBlock.x + prevBlock.width, curr.x + curr.width);
        const overlapWidth = overlapRight - overlapLeft;

        if (overlapWidth <= 0) {
            // Missed completely
            setGameOver(true);
            setIsPlaying(false);
            if (score > highScore) setHighScore(score);
        } else {
            // Success
            // Trim the block
            state.stack.push({ x: overlapLeft, width: overlapWidth });
            state.currentBlock = { 
                x: 0, 
                width: overlapWidth, 
                movingRight: true 
            };
            state.level++;
            // Increase speed slightly
            state.speed = Math.min(15, MOVE_SPEED_BASE + (state.level * 0.2));
            setScore(prev => prev + 1);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
            <div className="flex justify-between w-full mb-4 px-4 font-serif text-nasr-dark">
                <div className="flex flex-col items-center bg-white p-4 rounded shadow-sm border border-gray-200 w-32">
                    <span className="text-xs uppercase tracking-widest text-gray-500">{t.score}</span>
                    <span className="text-3xl font-bold text-nasr-blue">{score}</span>
                </div>
                <div className="flex flex-col items-center bg-white p-4 rounded shadow-sm border border-gray-200 w-32">
                    <span className="text-xs uppercase tracking-widest text-gray-500">{t.highScore}</span>
                    <span className="text-3xl font-bold text-gray-700">{highScore}</span>
                </div>
            </div>

            <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800 bg-gray-900 w-full aspect-[3/4] max-w-md cursor-pointer" onClick={handleAction}>
                <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={600} 
                    className="w-full h-full bg-gray-100"
                />
                
                {/* Overlays */}
                {!isPlaying && !gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white p-6 text-center">
                        <Gamepad2 size={48} className="text-nasr-accent mb-4" />
                        <h3 className="text-2xl font-serif mb-2">{t.title}</h3>
                        <p className="mb-6 text-gray-300">{t.instruction}</p>
                        <button className="px-8 py-3 bg-nasr-blue hover:bg-nasr-dark text-white font-bold uppercase tracking-wider transition-colors rounded flex items-center gap-2">
                           <Play size={20} /> {t.start}
                        </button>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm text-white p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 animate-bounce">
                            <Trophy size={32} className="text-nasr-dark" />
                        </div>
                        <h3 className="text-3xl font-serif mb-2">{t.gameOver}</h3>
                        <p className="mb-6 text-gray-200 text-lg">{t.score}: {score}</p>
                        <button className="px-8 py-3 bg-white text-nasr-red font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors rounded flex items-center gap-2">
                           <RefreshCw size={20} /> {t.restart}
                        </button>
                    </div>
                )}
            </div>
             <p className="mt-4 text-gray-500 text-sm italic">{lang === 'en' ? "* Tap screen to drop block" : "* اضغط على الشاشة لإسقاط الكتلة"}</p>
        </div>
    )
};

// --- Game Page Component ---
const GamePage: React.FC<{ lang: Language, goBack: () => void }> = ({ lang, goBack }) => {
    const t = content[lang].game;
    const isRTL = lang === 'ar';

    return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}
        >
             {/* Sticky Header for Game Page */}
            <div className="container mx-auto px-6 mb-8 flex items-center justify-between">
                <button onClick={goBack} className="flex items-center gap-2 text-nasr-blue hover:text-nasr-dark transition-colors font-bold uppercase text-sm tracking-wider">
                    <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
                    {content[lang].nav.back}
                </button>
                <div className="hidden md:block h-[1px] flex-1 bg-gray-200 mx-8"></div>
                <AlxLogo />
            </div>

            <div className="container mx-auto px-6 text-center">
                <SectionHeading title={t.title} subtitle={t.subtitle} lang={lang} />
                <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-12">
                  {t.desc}
                </p>
                
                <AluminumStackerGame lang={lang} />
            </div>
        </motion.div>
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

  // Navigation Handlers
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (currentPage !== 'home') {
      setCurrentPage('home');
      // Wait for state update then scroll
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

  const goToTechnology = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage('technology');
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToSustainability = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage('sustainability');
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToGame = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage('game');
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrochureClick = () => {
    alert(lang === 'en' ? 'Coming Soon' : 'قريباً');
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-nasr-dark selection:bg-nasr-blue selection:text-white ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || currentPage !== 'home' ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a href="#" onClick={scrollToTop} className={`flex items-center gap-4 group ${isRTL ? 'ml-8 lg:ml-12' : 'mr-8 lg:mr-12'}`}>
            <AlxLogo />
            <div className={`hidden md:flex flex-col ${isRTL ? 'border-r pr-5 mr-1' : 'border-l pl-5 ml-1'} border-gray-400/50 h-10 justify-center`}>
              <span className={`font-serif font-bold text-xl leading-none tracking-tight uppercase ${scrolled || currentPage !== 'home' ? 'text-nasr-dark' : 'text-white'} ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'نصر كبير' : 'Nasr Kabeer'}
              </span>
              <span className={`text-[10px] tracking-[0.35em] uppercase font-medium ${scrolled || currentPage !== 'home' ? 'text-gray-500' : 'text-gray-300'} ${isRTL ? 'font-arabic tracking-wider' : ''} ml-px`}>
                {isRTL ? 'للألمنيوم' : 'Aluminum'}
              </span>
            </div>
          </a>
          
          <div className={`hidden md:flex items-center gap-6 lg:gap-10 text-sm font-medium tracking-widest uppercase ${scrolled || currentPage !== 'home' ? 'text-gray-800' : 'text-white'}`}>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-nasr-blue transition-colors relative group">
              {t.nav.about}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-nasr-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#products" onClick={(e) => scrollToSection(e, 'products')} className="hover:text-nasr-blue transition-colors relative group">
              {t.nav.products}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-nasr-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#technology" onClick={goToTechnology} className={`hover:text-nasr-blue transition-colors relative group ${currentPage === 'technology' ? 'text-nasr-blue' : ''}`}>
              {t.nav.technology}
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-nasr-blue transition-all duration-300 ${currentPage === 'technology' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </a>
            <a href="#sustainability" onClick={goToSustainability} className={`hover:text-nasr-blue transition-colors relative group ${currentPage === 'sustainability' ? 'text-nasr-blue' : ''}`}>
              {t.nav.sustainability}
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-nasr-blue transition-all duration-300 ${currentPage === 'sustainability' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </a>
            
            <a href="#game" onClick={goToGame} className={`hover:text-nasr-blue transition-colors relative group flex items-center gap-2 ${currentPage === 'game' ? 'text-nasr-blue' : ''}`}>
               <Gamepad2 size={16} />
               {t.nav.game}
               <span className={`absolute -bottom-1 left-0 h-[2px] bg-nasr-blue transition-all duration-300 ${currentPage === 'game' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </a>
            
            <div className="flex items-center gap-4">
              <button onClick={toggleLang} className="flex items-center gap-1 hover:text-nasr-blue transition-colors">
                <Globe size={16} />
                <span>{lang === 'en' ? 'AR' : 'EN'}</span>
              </button>
              
              <a 
                href="#contact" 
                onClick={(e) => scrollToSection(e, 'contact')}
                className={`px-6 py-3 border ${scrolled || currentPage !== 'home' ? 'border-nasr-dark text-nasr-dark hover:bg-nasr-dark hover:text-white' : 'border-white text-white hover:bg-white hover:text-nasr-dark'} transition-all duration-300`}
              >
                {t.nav.contact}
              </a>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-4">
             <button onClick={toggleLang} className={`${scrolled || currentPage !== 'home' ? 'text-nasr-dark' : 'text-white'}`}>
                {lang === 'en' ? 'AR' : 'EN'}
             </button>
             <button className={`p-2 ${scrolled || currentPage !== 'home' ? 'text-nasr-dark' : 'text-white'}`} onClick={() => setMenuOpen(!menuOpen)}>
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
              <a href="#technology" onClick={goToTechnology} className={currentPage === 'technology' ? 'text-nasr-blue' : ''}>{t.nav.technology}</a>
              <a href="#sustainability" onClick={goToSustainability} className={currentPage === 'sustainability' ? 'text-nasr-blue' : ''}>{t.nav.sustainability}</a>
              <a href="#game" onClick={goToGame} className={currentPage === 'game' ? 'text-nasr-blue' : ''}>{t.nav.game}</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="px-8 py-3 bg-nasr-blue text-white text-lg">{t.nav.contact}</a>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {currentPage === 'technology' ? (
          <TechnologyPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : currentPage === 'sustainability' ? (
          <SustainabilityPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : currentPage === 'game' ? (
          <GamePage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : (
          <>
            {/* Hero Section */}
            <header className="relative h-screen flex items-center overflow-hidden bg-nasr-dark">
              {/* Static Background Image */}
              <div className="absolute inset-0 z-0">
                  <img 
                      src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop"
                      alt="High-End Aluminum Profiles"
                      className="w-full h-full object-cover opacity-90"
                  />
                  {/* Overlays for text readability - refined for better visibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-nasr-dark via-nasr-dark/70 to-transparent/20"></div>
              </div>
              
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
                  <h1 className={`font-serif font-bold leading-none mb-8 text-white ${isRTL ? 'font-arabic text-5xl md:text-7xl' : 'text-6xl md:text-8xl'}`}>
                    {t.hero.titleLine1}<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">{t.hero.titleLine2}</span><br/>
                    {t.hero.titleLine3} {isRTL ? (
                      <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-500 drop-shadow-sm">قطاع</span>
                    ) : (
                      <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-500 drop-shadow-sm">PROFILE</span>
                    )}
                  </h1>
                  <p className={`text-lg md:text-2xl text-gray-200 font-light leading-relaxed mb-12 max-w-2xl ${isRTL ? 'border-r-2 pr-8' : 'border-l-2 pl-8'} border-gray-400/50`}>
                    {t.hero.desc}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6">
                     <a href="#products" onClick={(e) => scrollToSection(e, 'products')} className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-nasr-dark font-bold uppercase tracking-wider hover:bg-nasr-accent hover:text-white transition-all duration-300">
                        {t.hero.btnProduct}
                        <ArrowRight size={20} className={`transition-transform ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                     </a>
                     <a href="#technology" onClick={goToTechnology} className="flex items-center justify-center gap-3 px-8 py-4 border border-gray-300 text-gray-100 font-bold uppercase tracking-wider hover:border-white hover:text-white transition-colors">
                        {t.hero.btnTech}
                     </a>
                  </div>
                </motion.div>
              </div>
            </header>

            {/* Strategic Overview */}
            <section id="about" className="py-24 md:py-32 bg-white relative overflow-hidden">
              <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <div>
                     <SectionHeading title={t.about.title} subtitle={t.about.subtitle} lang={lang} />
                     <div className="space-y-6 text-base md:text-lg text-gray-600 leading-relaxed">
                       <p>{t.about.p1}</p>
                       <p>{t.about.p2}</p>
                       <p>{t.about.p3}</p>
                       
                       <div className="grid grid-cols-2 gap-8 mt-8">
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
                     
                     {/* Everwin Industrial Park Card - Replaces Decorative Element */}
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className={`relative mt-8 lg:mt-0 lg:absolute lg:-bottom-12 lg:${isRTL ? '-right-12' : '-left-12'} z-20 bg-white p-6 shadow-xl border-t-4 border-nasr-blue max-w-sm`}
                     >
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">{t.park.subtitle}</div>
                                    <h4 className={`font-serif text-xl leading-tight text-nasr-dark ${isRTL ? 'font-arabic' : ''}`}>{t.park.title}</h4>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-full">
                                   <MapPin className="text-nasr-blue" size={20} />
                                </div>
                            </div>
                            
                            <img src="https://i.postimg.cc/Kv7bY59r/3.png" alt="Everwin Industrial Park" className="h-10 w-auto object-contain self-start" />
                            
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                {t.park.desc}
                            </p>

                            <a href="https://www.everwin.sa/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase text-nasr-blue hover:text-nasr-dark flex items-center gap-2 mt-1 transition-colors group">
                                {t.park.link} <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                     </motion.div>

                     {/* Decorative Elements */}
                     <div className={`absolute -top-10 ${isRTL ? '-left-10' : '-right-10'} w-64 h-64 bg-gray-100 -z-10 pattern-dots`}></div>
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
                    <div className="mt-12 lg:h-[600px]">
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
                    <div className="mt-12 text-center">
                      <button onClick={goToTechnology} className="inline-flex items-center gap-2 text-nasr-blue hover:text-nasr-dark font-bold uppercase tracking-wider transition-colors">
                         {lang === 'en' ? 'View Detailed Technical Route' : 'عرض المسار التقني التفصيلي'} <ArrowRight size={20} />
                      </button>
                    </div>
                </div>
            </section>
          </>
        )}

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
                            <li><a href="#technology" onClick={goToTechnology} className="hover:text-nasr-accent transition-colors">{t.nav.technology}</a></li>
                            <li><a href="#sustainability" onClick={goToSustainability} className="hover:text-nasr-accent transition-colors">{t.nav.sustainability}</a></li>
                            <li><a href="#game" onClick={goToGame} className="hover:text-nasr-accent transition-colors">{t.nav.game}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest mb-8 text-sm">{t.footer.contactTitle}</h4>
                        <ul className="space-y-6 text-sm">
                            <li className="flex items-start gap-4">
                                <MapPin size={20} className="text-nasr-accent shrink-0" />
                                <div className="flex flex-col">
                                    <span>{isRTL ? 'المدينة الصناعية الثالثة بالدمام،' : 'Dammam Third Industrial City,'}</span>
                                    <span>{isRTL ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</span>
                                    <a href="https://www.everwin.sa/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-nasr-blue hover:text-white transition-colors text-sm font-medium">
                                       {(t.footer as any).park} <ExternalLink size={12} />
                                    </a>
                                </div>
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
      </main>
    </div>
  );
};

export default App;
