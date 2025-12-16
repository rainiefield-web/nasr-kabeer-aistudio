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
  Gamepad2, Trophy, RefreshCw, Play, ExternalLink, Recycle, Leaf, 
  Wind, Droplets, Truck, CircleDollarSign, HardHat, ClipboardCheck,
  PenTool, Beaker, Box, MoveRight, ArrowDown, TrendingUp, TrendingDown, AlertCircle, Loader2, Wifi, WifiOff,
  Newspaper, Building2, Car, Disc, Aperture, Cog
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for Framer Motion types in strict environments
const MotionDiv = motion.div as any;
const MotionH2 = motion.h2 as any;
const MotionImg = motion.img as any;

// Add type definition for custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'rssapp-list': any;
    }
  }
}

// --- TYPES & CONTENT ---
type Language = 'en' | 'ar';
type Page = 'home' | 'technology' | 'sustainability' | 'insights' | 'products';

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
      insights: "Industry Insights",
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
      title: "Engineered for Excellence",
      desc: "Explore our comprehensive range of high-performance aluminum profiles designed for the most demanding applications."
    },
    process: {
      title: "Integrated Value Chain",
      desc: "Complete in-house control from casting to finishing ensures superior quality and traceability."
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
    insights: {
        title: "Industry Insights",
        subtitle: "Global News & Trends",
        desc: "Stay connected with the latest developments, market analysis, and technological breakthroughs in the global aluminum and industrial manufacturing sectors."
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

      {/* Main Container with MIN-HEIGHT to prevent jumping */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[650px]">
        {/* Visual Flowchart Area (Left/Top) */}
        <div className="lg:col-span-8 bg-gray-50 p-4 md:p-8 relative overflow-hidden h-full min-h-[400px]">
             <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none"></div>
             
             <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6 md:gap-8 py-8">
                
                {/* PART I: CORE PROCESS (Central Spine) */}
                <div className={`relative flex flex-col gap-6 w-full max-w-md transition-opacity duration-500 ${activeTab !== 'core' ? 'opacity-40' : 'opacity-100'}`}>
                    <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-300 -z-10 -translate-x-1/2"></div>
                    
                    {t.core.steps.map((step, i) => (
                        <div key={i} className="relative bg-white border border-gray-200 p-4 rounded-sm shadow-sm flex items-center gap-4 group hover:border-nasr-blue transition-colors">
                            <div className="w-8 h-8 rounded-full bg-nasr-dark text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {step.id}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-nasr-dark text-sm">{step.title}</h4>
                                
                                {/* Mobile Buttons to jump to related process */}
                                {i === 1 && (
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveTab('die'); }}
                                      className="mt-2 text-xs font-bold text-nasr-red uppercase flex items-center gap-1 lg:hidden"
                                   >
                                      <PenTool size={12} /> View Die Mfg
                                   </button>
                                )}
                                {i === 3 && (
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveTab('powder'); }}
                                      className="mt-2 text-xs font-bold text-nasr-blue uppercase flex items-center gap-1 lg:hidden"
                                   >
                                      <PaintBucket size={12} /> View Powder
                                   </button>
                                )}
                                {i === 4 && (
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveTab('strip'); }}
                                      className="mt-2 text-xs font-bold text-nasr-accent uppercase flex items-center gap-1 lg:hidden"
                                   >
                                      <Layers size={12} /> View Strips
                                   </button>
                                )}
                            </div>
                            
                            {/* Auxiliary Nodes anchored to specific steps - DESKTOP ONLY */}
                            {i === 1 && ( // Step 2: Extrusion connects to Die Mfg
                                <div 
                                    className={`hidden lg:block absolute ${isRTL ? 'right-full mr-8' : 'left-full ml-8'} top-1/2 -translate-y-1/2 transition-all duration-300 z-20 cursor-pointer ${activeTab === 'die' ? 'scale-110 opacity-100' : 'scale-100 opacity-60 hover:opacity-100'}`}
                                    onClick={(e) => { e.stopPropagation(); setActiveTab('die'); }}
                                >
                                    <div className="flex items-center">
                                         {/* Connector Line */}
                                        <div className={`absolute ${isRTL ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 w-8 h-0.5 bg-nasr-red`}></div>
                                        
                                        {/* Node Box */}
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

                            {i === 3 && ( // Step 4: Surface connects to Powder
                                <div 
                                    className={`hidden lg:block absolute ${isRTL ? 'left-full ml-8' : 'right-full mr-8'} top-1/2 -translate-y-1/2 transition-all duration-300 z-20 cursor-pointer ${activeTab === 'powder' ? 'scale-110 opacity-100' : 'scale-100 opacity-60 hover:opacity-100'}`}
                                    onClick={(e) => { e.stopPropagation(); setActiveTab('powder'); }}
                                >
                                    <div className="flex items-center">
                                         {/* Connector Line */}
                                        <div className={`absolute ${isRTL ? '-right-8' : '-left-8'} top-1/2 -translate-y-1/2 w-8 h-0.5 bg-nasr-blue`}></div>
                                        
                                        {/* Node Box */}
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

                            {i === 4 && ( // Step 5: Finishing connects to Strips
                                <div 
                                    className={`hidden lg:block absolute ${isRTL ? 'left-full ml-8' : 'right-full mr-8'} top-1/2 -translate-y-1/2 transition-all duration-300 z-20 cursor-pointer ${activeTab === 'strip' ? 'scale-110 opacity-100' : 'scale-100 opacity-60 hover:opacity-100'}`}
                                    onClick={(e) => { e.stopPropagation(); setActiveTab('strip'); }}
                                >
                                    <div className="flex items-center">
                                         {/* Connector Line */}
                                        <div className={`absolute ${isRTL ? '-right-8' : '-left-8'} top-1/2 -translate-y-1/2 w-8 h-0.5 bg-nasr-accent`}></div>
                                        
                                        {/* Node Box */}
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

        {/* Details Panel (Right/Bottom) */}
        <div className="lg:col-span-4 bg-white p-8 border-l border-gray-100 flex flex-col justify-center h-full relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
            <AnimatePresence mode="popLayout">
                <MotionDiv
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                >
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
                                <ArrowDown size={16} className={`mt-1 shrink-0 ${
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
        img: "https://images.pexels.com/photos/18729291/pexels-photo-18729291.jpeg",
        icon: Building2
      },
      {
        id: 'ind',
        title: "Industrial Profiles",
        subtitle: "Automation & Energy",
        desc: "Precision engineering for the renewable energy sector and automated manufacturing lines.",
        items: ["Solar Mounting Structures", "Heat Sinks & Cooling", "Automation Framing", "Modular Conveyors", "Electronic Enclosures"],
        img: "https://images.pexels.com/photos/25285744/pexels-photo-25285744.jpeg",
        icon: Factory
      },
      {
        id: 'trans',
        title: "Transportation Profiles",
        subtitle: "Mobility & Aerospace",
        desc: "Lightweight, high-strength alloys driving the future of EVs and rail transit in the Kingdom.",
        items: ["EV Battery Trays", "Rail Transit Car Bodies", "Chassis Components", "Aerospace Interiors", "Marine Structures"],
        img: "https://plus.unsplash.com/premium_photo-1661877074629-a74292667b72?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
        img: "https://images.pexels.com/photos/18729291/pexels-photo-18729291.jpeg",
        icon: Building2
      },
      {
        id: 'ind',
        title: "المقاطع الصناعية",
        subtitle: "الأتمتة والطاقة",
        desc: "هندسة دقيقة لقطاع الطاقة المتجددة وخطوط التصنيع الآلي.",
        items: ["هياكل تثبيت الطاقة الشمسية", "المشتتات الحرارية والتبريد", "إطارات الأتمتة", "السيور الناقلة المعيارية", "حاويات الإلكترونيات"],
        img: "https://images.pexels.com/photos/25285744/pexels-photo-25285744.jpeg",
        icon: Factory
      },
      {
        id: 'trans',
        title: "مقاطع النقل",
        subtitle: "التنقل والطيران",
        desc: "سبائك خفيفة الوزن وعالية القوة تقود مستقبل المركبات الكهربائية والسكك الحديدية في المملكة.",
        items: ["صواني بطاريات المركبات الكهربائية", "هياكل عربات السكك الحديدية", "مكونات الشاسيه", "التصميم الداخلي للطائرات", "الهياكل البحرية"],
        img: "https://plus.unsplash.com/premium_photo-1661877074629-a74292667b72?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        icon: Car
      }
    ]
  };

  const currentData = productData[lang];
  const t = content[lang].products;

  // Reusable Component for Heavy Industrial Bezels
  const IndustrialBezel = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
    <div className={`relative ${className}`}>
        {/* Outer Bezel */}
        <div className="p-[12px] md:p-[16px] rounded-2xl bg-gradient-to-b from-[#e8e8e8] to-[#999999] shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.3)] border-b border-gray-600">
            {/* Inner "Groove" */}
            <div className="bg-[#2a2a2a] p-[1px] rounded-xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                {/* Main Surface */}
                <div className="h-full w-full rounded-xl bg-gradient-to-br from-[#f2f2f2] via-[#dcdcdc] to-[#b3b3b3] shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] border border-gray-400/50 p-6 md:p-10 relative overflow-hidden">
                    {/* Brushed Texture Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" 
                         style={{ backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 2px, #000 2px, #000 3px)` }}>
                    </div>
                    {/* Inner Content */}
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // Reusable Rivet Component
  const Rivet = ({ className }: { className?: string }) => (
    <div className={`absolute w-4 h-4 rounded-full bg-gradient-to-br from-gray-200 via-gray-400 to-gray-500 shadow-[2px_2px_4px_rgba(0,0,0,0.4),inset_1px_1px_2px_rgba(255,255,255,0.8)] flex items-center justify-center border border-gray-400 z-20 ${className}`}>
       {/* Indent */}
       <div className="w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-gray-300 to-gray-600 shadow-inner flex items-center justify-center">
          <div className="w-full h-[1px] bg-gray-700/50 rotate-45"></div>
          <div className="absolute w-full h-[1px] bg-gray-700/50 -rotate-45"></div>
       </div>
    </div>
  );

  return (
    <MotionDiv 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`min-h-screen bg-[#E0E0E0] ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}
    >
      {/* Sticky Header with "Alumine" Style Button */}
      <div className="container mx-auto px-6 mb-12 flex items-center justify-between">
         <button 
           onClick={goBack} 
           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-gray-100 to-gray-300 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,1)] border border-gray-400 text-nasr-dark hover:brightness-105 active:scale-95 active:shadow-inner transition-all font-bold uppercase text-xs tracking-wider"
         >
            <ChevronLeft size={16} className={isRTL ? "rotate-180" : ""} />
            {content[lang].nav.back}
         </button>
         {/* Top Bar Metallic Strip */}
         <div className="hidden md:block h-12 flex-1 mx-8 rounded-lg bg-gradient-to-b from-[#e0e0e0] to-[#bdbdbd] shadow-[inset_0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(255,255,255,0.8)] border border-gray-400/50 relative overflow-hidden">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 3px)` }}></div>
         </div>
         <AlxLogo />
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <MotionH2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-serif font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-b from-[#4a4a4a] to-[#1a1a1a] drop-shadow-sm ${isRTL ? 'font-arabic text-4xl md:text-6xl' : 'text-4xl md:text-5xl'}`}
          >
            {t.title}
          </MotionH2>
          <p className="text-gray-600 text-lg font-medium">{t.desc}</p>
        </div>

        <div className="space-y-24">
          {currentData.map((category, index) => (
            <MotionDiv 
              key={category.id} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              {/* HEAVY INDUSTRIAL BEZEL */}
              <IndustrialBezel>
                  {/* Screws */}
                  <Rivet className="top-3 left-3" />
                  <Rivet className="top-3 right-3" />
                  <Rivet className="bottom-3 left-3" />
                  <Rivet className="bottom-3 right-3" />

                  <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}>
                    
                    {/* Recessed Image Container */}
                    <div className="w-full lg:w-1/2">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-[8px] border-[#d1d5db] shadow-[inset_0_10px_20px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.8)] bg-[#1a1a1a]">
                         {/* Screen Glare */}
                         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-20"></div>
                         
                         <img 
                          src={category.img} 
                          alt={category.title} 
                          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                         />
                         
                         {/* Digital Overlay */}
                         <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end justify-between">
                            <div className="text-xs font-mono text-nasr-blue uppercase tracking-widest flex items-center gap-2">
                               <div className="w-2 h-2 bg-nasr-blue rounded-full animate-pulse"></div>
                               System Active
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* Control Panel Area */}
                    <div className="w-full lg:w-1/2">
                        <div className="flex flex-col h-full justify-center">
                            {/* Metallic Label Plate */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-gray-200 to-gray-400 rounded border border-gray-500 shadow-[0_2px_4px_rgba(0,0,0,0.2)] mb-6 self-start">
                               <div className="w-1.5 h-1.5 bg-black rounded-full inset-shadow"></div>
                               <span className="text-[#333] font-bold tracking-[0.15em] uppercase text-xs">
                                  {category.subtitle}
                               </span>
                               <div className="w-1.5 h-1.5 bg-black rounded-full inset-shadow"></div>
                            </div>
                            
                            <h3 className={`font-serif text-3xl md:text-5xl font-bold text-[#222] mb-6 drop-shadow-sm ${isRTL ? 'font-arabic' : ''} tracking-tight`}>
                              {category.title}
                            </h3>
                            
                            <p className="text-lg text-[#444] mb-8 leading-relaxed font-medium">
                              {category.desc}
                            </p>
                            
                            {/* Stamped Metal Tags */}
                            <div className="flex flex-wrap gap-3">
                              {category.items.map((item, i) => (
                                <div 
                                  key={i} 
                                  className="px-5 py-3 bg-gradient-to-b from-[#f0f0f0] to-[#d0d0d0] border-t border-white border-b border-gray-500 rounded shadow-[0_4px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] text-gray-800 text-sm font-bold flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner active:bg-[#e0e0e0] transition-all cursor-default"
                                >
                                  <div className="w-2 h-2 rounded-full bg-nasr-blue shadow-[0_0_4px_rgba(0,159,227,0.6)]"></div>
                                  {item}
                                </div>
                              ))}
                            </div>
                        </div>
                    </div>

                  </div>
              </IndustrialBezel>
            </MotionDiv>
          ))}
        </div>
        
        {/* "GET A QUOTE" CTA Button - Replicating Reference */}
        <div className="mt-32 text-center pb-12 flex justify-center">
            <button 
              onClick={() => { goBack(); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} 
              className="relative group active:scale-95 transition-transform duration-150"
            >
              {/* Button Container - Thick Metallic Slab */}
              <div className="relative px-12 py-5 bg-gradient-to-b from-[#e0e0e0] via-[#cfcfcf] to-[#b0b0b0] rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.4),0_6px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] border border-gray-400 flex items-center gap-6 overflow-hidden">
                  
                  {/* Inner Border/Bezel */}
                  <div className="absolute inset-1 rounded-lg border border-gray-500/30"></div>
                  
                  {/* Text */}
                  <span className="relative z-10 text-3xl font-serif font-bold text-[#444] uppercase tracking-wider drop-shadow-sm group-hover:text-nasr-blue transition-colors">
                    {content[lang].nav.contact}
                  </span>
                  
                  {/* Gear Icon - Machined Look */}
                  <div className="relative z-10 w-12 h-12 flex items-center justify-center">
                     <Cog size={40} className="text-[#666] drop-shadow-md group-hover:rotate-90 transition-transform duration-700" />
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
              </div>
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
    <MotionDiv 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}
    >
      {/* Sticky Header for Tech Page */}
      <div className="container mx-auto px-6 mb-8 flex items-center justify-between">
         <button onClick={goBack} className="flex items-center gap-2 text-nasr-blue hover:text-nasr-dark transition-colors font-bold uppercase text-sm tracking-wider">
            <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} />
            {content[lang].nav.back}
         </button>
         <div className="hidden md:block h-[1px] flex-1 bg-gray-200 mx-8"></div>
         <AlxLogo />
      </div>

      {/* NEW: Hero Header with Background Image - OPTIMIZED FOR MOBILE */}
      <div className="relative mb-16 min-h-[500px] h-auto overflow-hidden flex items-center py-12">
        <div className="absolute inset-0">
             <img 
               src="https://i.postimg.cc/BZSsGmLj/c2b9d738-c3fd-4b64-a35e-c018629e21c0.png" 
               alt="Advanced Aluminum Manufacturing" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/20"></div>
        </div>
        <div className="container mx-auto px-6 h-full flex flex-col justify-center relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                <div>
                   <SectionHeading title={t.title} subtitle={t.subtitle} dark lang={lang} />
                </div>
                <div className="pb-4">
                   <p className={`text-lg text-gray-200 leading-relaxed ${isRTL ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-nasr-blue bg-black/30 p-4 backdrop-blur-sm rounded-sm`}>
                      {t.desc}
                   </p>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {/* Application Specific Tabs */}
        <div className="flex flex-wrap gap-4 mb-16 border-b border-gray-200 pb-1">
          {(['arch', 'ind', 'auto'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 text-lg font-serif transition-all relative ${activeTab === tab ? 'text-nasr-blue font-bold' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t.tabs[tab]}
              {activeTab === tab && (
                <MotionDiv layoutId="techTab" className="absolute bottom-0 left-0 right-0 h-1 bg-nasr-blue" />
              )}
            </button>
          ))}
        </div>

        {/* Application Content Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
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
               <MotionDiv 
                 key={activeTab}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="space-y-8"
               >
                 {getSteps().map((step, idx) => {
                   const StepIcon = step.icon;
                   return (
                    <div key={idx} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group">
                       <div className="flex items-start gap-6">
                          <div className="p-4 bg-gray-50 text-nasr-blue rounded-sm group-hover:bg-nasr-blue group-hover:text-white transition-colors duration-300">
                             <StepIcon size={32} />
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
                 )})}
               </MotionDiv>
             </AnimatePresence>
          </div>
        </div>

        {/* NEW: Integrated Technical Route Section */}
        <div className="mt-24 pt-12 border-t border-gray-200">
            <SectionHeading title={routeT.title} subtitle={routeT.subtitle} lang={lang} />
            <IntegratedRouteDiagram lang={lang} />
        </div>

      </div>
    </MotionDiv>
  );
};

// --- Industry Insights Page Component ---
const IndustryInsightsPage: React.FC<{ lang: Language, goBack: () => void }> = ({ lang, goBack }) => {
  const t = content[lang].insights;
  const isRTL = lang === 'ar';

  // Load the RSS widget script
  useEffect(() => {
    const scriptId = 'rss-app-widget-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = "https://widget.rss.app/v1/list.js";
      script.async = true;
      script.id = scriptId;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <MotionDiv 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : 'font-sans'} pt-24 pb-20`}
    >
      {/* Sticky Header for Insights Page */}
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
        <p className="max-w-3xl mb-12 text-lg text-gray-600 leading-relaxed border-l-4 border-nasr-blue pl-6">
          {t.desc}
        </p>

        {/* RSS Feeds Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
           {/* Feed 1 */}
           <div className="bg-white p-2 rounded-sm shadow-xl min-h-[600px] border border-gray-200">
               <rssapp-list id="Kg4gMYSoIKziJSUJ"></rssapp-list>
           </div>
           
           {/* Feed 2 */}
           <div className="bg-white p-2 rounded-sm shadow-xl min-h-[600px] border border-gray-200">
               <rssapp-list id="Q68OlPY9hDWlamDI"></rssapp-list>
           </div>
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
    <MotionDiv 
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
             <MotionDiv 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-8 shadow-xl border-t-4 border-nasr-accent"
             >
                <div className="text-5xl font-bold text-nasr-dark mb-2">{stat.value}</div>
                <div className="text-nasr-accent font-bold uppercase text-sm tracking-wider mb-1">{stat.label}</div>
                <div className="text-gray-500 text-sm">{stat.sub}</div>
             </MotionDiv>
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
              <MotionDiv 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border border-gray-100 shadow-lg overflow-hidden group hover:border-nasr-blue transition-all duration-300 opacity-90"
              >
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
              </MotionDiv>

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
                    <div className={`w-16 h-16 rounded-full border-4 bg-white flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 z-10 relative ${i === 0 || i === 4 ? 'border-nasr-dark text-nasr-dark' : 'border-nasr-accent text-nasr-accent'}`}>
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

  const goToInsights = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage('insights');
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage('products');
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
            <a href="#products" onClick={goToProducts} className={`hover:text-nasr-blue transition-colors relative group ${currentPage === 'products' ? 'text-nasr-blue' : ''}`}>
              {t.nav.products}
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-nasr-blue transition-all duration-300 ${currentPage === 'products' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </a>
            <a href="#phases" onClick={(e) => scrollToSection(e, 'phases')} className="hover:text-nasr-blue transition-colors relative group">
              {t.nav.expansion}
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
             <a href="#insights" onClick={goToInsights} className={`hover:text-nasr-blue transition-colors relative group ${currentPage === 'insights' ? 'text-nasr-blue' : ''}`}>
              {t.nav.insights}
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-nasr-blue transition-all duration-300 ${currentPage === 'insights' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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
          <MotionDiv 
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 text-2xl font-serif text-nasr-dark"
          >
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')}>{t.nav.about}</a>
              <a href="#products" onClick={goToProducts} className={currentPage === 'products' ? 'text-nasr-blue' : ''}>{t.nav.products}</a>
              <a href="#phases" onClick={(e) => scrollToSection(e, 'phases')}>{t.nav.expansion}</a>
              <a href="#technology" onClick={goToTechnology} className={currentPage === 'technology' ? 'text-nasr-blue' : ''}>{t.nav.technology}</a>
              <a href="#sustainability" onClick={goToSustainability} className={currentPage === 'sustainability' ? 'text-nasr-blue' : ''}>{t.nav.sustainability}</a>
              <a href="#insights" onClick={goToInsights} className={currentPage === 'insights' ? 'text-nasr-blue' : ''}>{t.nav.insights}</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="px-8 py-3 bg-nasr-blue text-white text-lg">{t.nav.contact}</a>
          </MotionDiv>
        )}
      </AnimatePresence>

      <main>
        {currentPage === 'technology' ? (
          <TechnologyPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : currentPage === 'sustainability' ? (
          <SustainabilityPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : currentPage === 'insights' ? (
          <IndustryInsightsPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : currentPage === 'products' ? (
          <ProductsPage lang={lang} goBack={() => { setCurrentPage('home'); window.scrollTo(0,0); }} />
        ) : (
          <>
            {/* Hero Section */}
            <header className="relative h-screen flex items-center overflow-hidden bg-nasr-dark">
              {/* Static Background Image */}
              <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 transform scale-110 -rotate-2 origin-center">
                      <img 
                          src="https://i.postimg.cc/fb6MLTJn/Gemini-Generated-Image-vxqzfcvxqzfcvxqz.png"
                          alt="High-End Aluminum Profiles"
                          className="w-full h-full object-cover opacity-90"
                      />
                  </div>
                  {/* Overlays for text readability - refined for better visibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-nasr-dark via-nasr-dark/70 to-transparent/20"></div>
              </div>
              
              <div className="relative z-10 container mx-auto px-6 pt-20">
                <MotionDiv 
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
                     <a href="#products" onClick={goToProducts} className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-nasr-dark font-bold uppercase tracking-wider hover:bg-nasr-accent hover:text-white transition-all duration-300">
                        {t.hero.btnProduct}
                        <ArrowRight size={20} className={`transition-transform ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                     </a>
                     <a href="#technology" onClick={goToTechnology} className="flex items-center justify-center gap-3 px-8 py-4 border border-gray-300 text-gray-100 font-bold uppercase tracking-wider hover:border-white hover:text-white transition-colors">
                        {t.hero.btnTech}
                     </a>
                  </div>
                </MotionDiv>
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
                     <MotionDiv 
                        initial={{ scale: 0.95, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="aspect-[4/5] bg-gray-200 overflow-hidden shadow-2xl relative z-10"
                     >
                        <img 
                          src="https://images.pexels.com/photos/17650039/pexels-photo-17650039.jpeg" 
                          alt="Modern Skyscraper Facade" 
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out" 
                        />
                        <div className="absolute inset-0 bg-nasr-blue/20 mix-blend-multiply"></div>
                     </MotionDiv>
                     
                     {/* Everwin Industrial Park Card - Replaces Decorative Element */}
                     <MotionDiv 
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
                     </MotionDiv>

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
                            <li><a href="#products" onClick={goToProducts} className="hover:text-nasr-accent transition-colors">{t.nav.products}</a></li>
                            <li><a href="#phases" onClick={(e) => scrollToSection(e, 'phases')} className="hover:text-nasr-accent transition-colors">{t.nav.expansion}</a></li>
                            <li><a href="#technology" onClick={goToTechnology} className="hover:text-nasr-accent transition-colors">{t.nav.technology}</a></li>
                            <li><a href="#sustainability" onClick={goToSustainability} className="hover:text-nasr-accent transition-colors">{t.nav.sustainability}</a></li>
                            <li><a href="#insights" onClick={goToInsights} className="hover:text-nasr-accent transition-colors">{t.nav.insights}</a></li>
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