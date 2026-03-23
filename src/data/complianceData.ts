// Compliance Collections AI - Core Data Definitions
// Week 1: Collections, Tiers, and Multi-Location Architecture

// ============================================================================
// LICENSING TIERS
// ============================================================================

export type LicensingTier = 'basic' | 'pro' | 'enterprise';

export interface TierDefinition {
  id: LicensingTier;
  name: string;
  description: string;
  maxSeats: number; // -1 = custom/unlimited
  collectionsAccess: 'limited' | 'all';
  maxCollections: number; // -1 = all
  features: TierFeatures;
  pricing: TierPricing;
}

export interface TierFeatures {
  // Reporting
  reportingLevel: 'standard' | 'enhanced' | 'advanced';
  csvExport: boolean;
  usageAnalytics: boolean;
  complianceScoring: boolean;
  departmentBreakdown: boolean;
  individualUserTracking: boolean;
  customReports: boolean;
  scheduledReports: boolean;
  
  // AI
  aiSummaries: boolean;
  aiComplianceExtraction: boolean;
  aiChapterQA: boolean;
  aiUsageMonthly: number; // -1 = unlimited
  
  // Administration
  multiLocation: boolean;
  aggregatedReporting: boolean;
  customBranding: boolean;
  ssoIntegration: boolean;
  apiAccess: boolean;
  dedicatedSupport: boolean;
  
  // Content
  addOnTitles: boolean;
  customCollections: boolean;
}

export interface TierPricing {
  type: 'fixed' | 'custom';
  annualPrice?: number;
  monthlyEquivalent?: number;
  perSeatPrice?: number;
  label: string;
}

export const licensingTiers: TierDefinition[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Essential compliance content for small teams and departments',
    maxSeats: 10,
    collectionsAccess: 'limited',
    maxCollections: 2,
    features: {
      reportingLevel: 'standard',
      csvExport: false,
      usageAnalytics: true,
      complianceScoring: false,
      departmentBreakdown: false,
      individualUserTracking: false,
      customReports: false,
      scheduledReports: false,
      aiSummaries: true,
      aiComplianceExtraction: false,
      aiChapterQA: true,
      aiUsageMonthly: 100,
      multiLocation: false,
      aggregatedReporting: false,
      customBranding: false,
      ssoIntegration: false,
      apiAccess: false,
      dedicatedSupport: false,
      addOnTitles: false,
      customCollections: false,
    },
    pricing: {
      type: 'fixed',
      annualPrice: 12000,
      monthlyEquivalent: 1000,
      perSeatPrice: 100,
      label: '$1,000/mo',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Complete compliance platform with advanced analytics and AI',
    maxSeats: 25,
    collectionsAccess: 'all',
    maxCollections: -1,
    features: {
      reportingLevel: 'enhanced',
      csvExport: true,
      usageAnalytics: true,
      complianceScoring: true,
      departmentBreakdown: true,
      individualUserTracking: true,
      customReports: false,
      scheduledReports: false,
      aiSummaries: true,
      aiComplianceExtraction: true,
      aiChapterQA: true,
      aiUsageMonthly: 500,
      multiLocation: false,
      aggregatedReporting: false,
      customBranding: false,
      ssoIntegration: false,
      apiAccess: false,
      dedicatedSupport: false,
      addOnTitles: true,
      customCollections: false,
    },
    pricing: {
      type: 'fixed',
      annualPrice: 30000,
      monthlyEquivalent: 2500,
      perSeatPrice: 100,
      label: '$2,500/mo',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Multi-location deployment with full customization and support',
    maxSeats: -1,
    collectionsAccess: 'all',
    maxCollections: -1,
    features: {
      reportingLevel: 'advanced',
      csvExport: true,
      usageAnalytics: true,
      complianceScoring: true,
      departmentBreakdown: true,
      individualUserTracking: true,
      customReports: true,
      scheduledReports: true,
      aiSummaries: true,
      aiComplianceExtraction: true,
      aiChapterQA: true,
      aiUsageMonthly: -1,
      multiLocation: true,
      aggregatedReporting: true,
      customBranding: true,
      ssoIntegration: true,
      apiAccess: true,
      dedicatedSupport: true,
      addOnTitles: true,
      customCollections: true,
    },
    pricing: {
      type: 'custom',
      label: 'Custom Pricing',
    },
  },
];

// ============================================================================
// MULTI-LOCATION / FACILITY SUPPORT
// ============================================================================

export interface Facility {
  id: string;
  enterpriseId: string;
  name: string;
  type: 'hospital' | 'surgery_center' | 'clinic' | 'training_center';
  address: string;
  city: string;
  state: string;
  isActive: boolean;
  seatAllocation: number;
  usedSeats: number;
  departmentIds: string[];
}

export interface FacilityUsageStats {
  facilityId: string;
  facilityName: string;
  totalViews: number;
  totalSearches: number;
  aiQueries: number;
  activeUsers: number;
  complianceScore: number;
}

// Demo facilities for multi-location enterprise
export const mockFacilities: Facility[] = [
  {
    id: 'fac-metro-main',
    enterpriseId: 'ent-metro-general',
    name: 'Metro General Hospital - Main Campus',
    type: 'hospital',
    address: '100 Medical Center Dr',
    city: 'San Francisco',
    state: 'CA',
    isActive: true,
    seatAllocation: 150,
    usedSeats: 124,
    departmentIds: ['dept-or', 'dept-anesthesia', 'dept-icu', 'dept-ed', 'dept-cardiology', 'dept-compliance'],
  },
  {
    id: 'fac-metro-north',
    enterpriseId: 'ent-metro-general',
    name: 'Metro North Surgery Center',
    type: 'surgery_center',
    address: '2500 Bay St',
    city: 'San Francisco',
    state: 'CA',
    isActive: true,
    seatAllocation: 60,
    usedSeats: 42,
    departmentIds: ['dept-or', 'dept-anesthesia'],
  },
  {
    id: 'fac-metro-south',
    enterpriseId: 'ent-metro-general',
    name: 'Metro South Ambulatory Center',
    type: 'clinic',
    address: '800 Mission St',
    city: 'Daly City',
    state: 'CA',
    isActive: true,
    seatAllocation: 40,
    usedSeats: 21,
    departmentIds: ['dept-cardiology'],
  },
];

export const mockFacilityUsageStats: FacilityUsageStats[] = [
  {
    facilityId: 'fac-metro-main',
    facilityName: 'Metro General Hospital - Main Campus',
    totalViews: 10240,
    totalSearches: 5890,
    aiQueries: 1234,
    activeUsers: 124,
    complianceScore: 89,
  },
  {
    facilityId: 'fac-metro-north',
    facilityName: 'Metro North Surgery Center',
    totalViews: 3450,
    totalSearches: 2100,
    aiQueries: 456,
    activeUsers: 42,
    complianceScore: 92,
  },
  {
    facilityId: 'fac-metro-south',
    facilityName: 'Metro South Ambulatory Center',
    totalViews: 1730,
    totalSearches: 944,
    aiQueries: 189,
    activeUsers: 21,
    complianceScore: 78,
  },
];

// ============================================================================
// 5 COMPLIANCE COLLECTIONS - 10 TITLES EACH (50 TOTAL)
// ============================================================================

export interface ComplianceCollectionDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  regulatoryRelevance: string[];
  bookIds: string[];
}

export const complianceCollections: ComplianceCollectionDefinition[] = [
  {
    id: 'coll-periop-safety',
    name: 'Perioperative Safety & Compliance',
    description: 'Comprehensive guidelines for OR procedures, patient positioning, surgical safety checklists, and perioperative nursing standards. Aligned with JCAHO National Patient Safety Goals.',
    category: 'perioperative',
    icon: 'Scissors',
    regulatoryRelevance: ['JCAHO', 'CMS CoP', 'AORN Standards'],
    bookIds: [
      'periop-nursing',
      'sabiston-surgery',
      'aorn-periop-standards',
      'who-surgical-checklist',
      'aami-sterilization',
      'ecri-or-safety',
      'cms-cop-surgical',
      'patient-positioning-atlas',
      'surgical-counts-protocol',
      'periop-quality-measures',
    ],
  },
  {
    id: 'coll-anesthesia-protocols',
    name: 'Anesthesia & Sedation Protocols',
    description: 'Anesthesia administration guidelines, monitoring standards, malignant hyperthermia protocols, and moderate sedation policies. CMS and ASA compliant.',
    category: 'anesthesia',
    icon: 'Syringe',
    regulatoryRelevance: ['ASA Standards', 'CMS CoP', 'JCAHO PC Standards'],
    bookIds: [
      'morgan-anesthesia',
      'goldfrank-toxicology',
      'asa-monitoring-standards',
      'asa-difficult-airway',
      'mh-protocol-guide',
      'moderate-sedation-policy',
      'regional-anesthesia-atlas',
      'pediatric-anesthesia-guide',
      'obstetric-anesthesia-manual',
      'post-anesthesia-care',
    ],
  },
  {
    id: 'coll-infection-prevention',
    name: 'Infection Prevention & Control',
    description: 'SSI prevention bundles, sterilization standards, antimicrobial stewardship, and outbreak response. OSHA and CDC guidelines integrated.',
    category: 'patient_safety',
    icon: 'ShieldCheck',
    regulatoryRelevance: ['OSHA BBP', 'CDC Guidelines', 'CMS CoP', 'APIC'],
    bookIds: [
      'harrison-internal',
      'apic-infection-control',
      'cdc-ssi-prevention',
      'osha-bloodborne-pathogens',
      'antimicrobial-stewardship',
      'hand-hygiene-compliance',
      'isolation-precautions-manual',
      'surgical-prep-protocols',
      'endoscope-reprocessing',
      'environmental-services-guide',
    ],
  },
  {
    id: 'coll-patient-safety-risk',
    name: 'Patient Safety & Risk Management',
    description: 'Fall prevention, medication safety, sentinel event response, informed consent, and risk mitigation. JCAHO and CMS core measures alignment.',
    category: 'patient_safety',
    icon: 'Heart',
    regulatoryRelevance: ['JCAHO NPSG', 'CMS Core Measures', 'TJC Sentinel Event Policy'],
    bookIds: [
      'acsm-guidelines',
      'braunwald-cardiology',
      'fall-prevention-toolkit',
      'medication-safety-manual',
      'sentinel-event-response',
      'informed-consent-guide',
      'patient-identification-protocol',
      'clinical-alarm-management',
      'restraint-seclusion-policy',
      'adverse-event-reporting',
    ],
  },
  {
    id: 'coll-emergency-critical',
    name: 'Emergency & Critical Care Protocols',
    description: 'Code management, sepsis bundles, rapid response, trauma protocols, and critical care guidelines. CMS SEP-1 and stroke measures compliance.',
    category: 'surgical',
    icon: 'Stethoscope',
    regulatoryRelevance: ['CMS SEP-1', 'CMS Stroke Measures', 'AHA ACLS', 'ATLS'],
    bookIds: [
      'tintinalli-emergency',
      'fishman-pulmonary',
      'acls-provider-manual',
      'sepsis-bundle-guide',
      'rapid-response-protocol',
      'trauma-resuscitation-manual',
      'stroke-protocol-guide',
      'code-blue-management',
      'critical-care-drug-manual',
      'mass-casualty-plan',
    ],
  },
];

// ============================================================================
// ADDITIONAL COMPLIANCE TITLES (39 new titles to reach 50 total)
// ============================================================================

export interface ComplianceTitle {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher: string;
  isbn: string;
  publishedYear: number;
  edition?: string;
  coverColor: string;
  description: string;
  specialty: string;
  tags: string[];
  regulatoryFramework?: string[];
  chapters: {
    id: string;
    title: string;
    content: string;
    pageNumber: number;
    tags: string[];
  }[];
}

export const additionalComplianceTitles: ComplianceTitle[] = [
  // === PERIOPERATIVE SAFETY COLLECTION ===
  {
    id: 'aorn-periop-standards',
    title: 'AORN Guidelines for Perioperative Practice',
    subtitle: '2024 Edition',
    authors: ['Association of periOperative Registered Nurses'],
    publisher: 'AORN Publishing',
    isbn: '978-1-93216-901-2',
    publishedYear: 2024,
    coverColor: 'hsl(166 60% 35%)',
    description: 'Evidence-based guidelines for perioperative nursing practice covering surgical environment, patient care, and professional standards.',
    specialty: 'Perioperative Nursing',
    tags: ['perioperative', 'surgery', 'nursing'],
    regulatoryFramework: ['JCAHO', 'AORN'],
    chapters: [
      { id: 'aorn-ch1', title: 'Guideline: Sterile Technique', content: 'Sterile technique is foundational to surgical safety. This guideline addresses establishing and maintaining the sterile field, surgical hand antisepsis, gowning and gloving procedures, and strategies for maintaining sterility throughout the operative period. Environmental monitoring and corrective actions for sterility breaks are outlined.', pageNumber: 1, tags: ['perioperative', 'surgery'] },
      { id: 'aorn-ch2', title: 'Guideline: Surgical Counting Procedures', content: 'Counting protocols for sponges, sharps, and instruments are critical to preventing retained surgical items. This guideline details standardized count procedures, documentation requirements, reconciliation procedures when counts are incorrect, and the use of adjunct technologies including radiofrequency detection and barcode systems.', pageNumber: 45, tags: ['perioperative', 'surgery'] },
    ],
  },
  {
    id: 'who-surgical-checklist',
    title: 'WHO Surgical Safety Checklist Implementation Guide',
    authors: ['World Health Organization'],
    publisher: 'WHO Press',
    isbn: '978-9-24159-884-3',
    publishedYear: 2023,
    coverColor: 'hsl(200 55% 40%)',
    description: 'Implementation manual for the WHO Surgical Safety Checklist, including adaptation guidance, training materials, and compliance measurement.',
    specialty: 'Patient Safety',
    tags: ['perioperative', 'surgery'],
    regulatoryFramework: ['WHO', 'JCAHO'],
    chapters: [
      { id: 'who-ch1', title: 'Sign In: Before Induction', content: 'The Sign In phase occurs before induction of anesthesia. The coordinator confirms patient identity, surgical site marking, anesthesia safety check, pulse oximetry placement, known allergies, and anticipated blood loss assessment. This phase prevents wrong-patient and wrong-site surgery.', pageNumber: 1, tags: ['perioperative'] },
      { id: 'who-ch2', title: 'Time Out: Before Skin Incision', content: 'The Time Out phase involves the entire surgical team pausing before incision to confirm patient name and procedure, antibiotic prophylaxis timing, essential imaging displayed, and anticipated critical events. This team-based verification is the final safety barrier.', pageNumber: 28, tags: ['perioperative', 'surgery'] },
    ],
  },
  {
    id: 'aami-sterilization',
    title: 'AAMI Standards for Sterilization and Disinfection',
    authors: ['Association for the Advancement of Medical Instrumentation'],
    publisher: 'AAMI',
    isbn: '978-1-57020-601-3',
    publishedYear: 2023,
    coverColor: 'hsl(180 40% 38%)',
    description: 'Standards for medical device sterilization including steam, EtO, and low-temperature methods, plus quality management systems for central sterile processing.',
    specialty: 'Sterile Processing',
    tags: ['perioperative', 'infection-control'],
    chapters: [
      { id: 'aami-ch1', title: 'Steam Sterilization Parameters', content: 'Steam sterilization (autoclaving) remains the most widely used sterilization method. This chapter covers cycle parameters, load configuration, biological and chemical indicator testing, documentation requirements, and troubleshooting common sterilization failures.', pageNumber: 1, tags: ['perioperative'] },
    ],
  },
  {
    id: 'ecri-or-safety',
    title: 'ECRI Operating Room Risk Analysis',
    authors: ['ECRI Institute'],
    publisher: 'ECRI',
    isbn: '978-0-97983-812-5',
    publishedYear: 2024,
    coverColor: 'hsl(30 50% 45%)',
    description: 'Comprehensive risk analysis for operating room hazards including equipment failures, fire prevention, and technology-related safety events.',
    specialty: 'Risk Management',
    tags: ['perioperative', 'surgery'],
    chapters: [
      { id: 'ecri-ch1', title: 'Surgical Fire Prevention', content: 'Surgical fires are preventable events requiring awareness of the fire triangle in the OR: oxidizers (supplemental oxygen, nitrous oxide), ignition sources (electrosurgical units, lasers, fiber optic cables), and fuels (alcohol-based preps, drapes, airway devices). The fire risk assessment protocol guides team communication and prevention strategies.', pageNumber: 1, tags: ['perioperative', 'surgery'] },
    ],
  },
  {
    id: 'cms-cop-surgical',
    title: 'CMS Conditions of Participation: Surgical Services',
    authors: ['Centers for Medicare & Medicaid Services'],
    publisher: 'CMS',
    isbn: '978-0-16-095421-8',
    publishedYear: 2024,
    coverColor: 'hsl(215 45% 35%)',
    description: 'Complete regulatory requirements for surgical services participation in Medicare/Medicaid programs including credentialing, privileging, and quality assessment.',
    specialty: 'Regulatory Compliance',
    tags: ['perioperative', 'compliance'],
    chapters: [
      { id: 'cms-cop-ch1', title: '§482.51 Surgical Services Requirements', content: 'Hospitals providing surgical services must meet Conditions of Participation including organized surgical services with adequate personnel, proper supervision, maintained surgical privilege lists, completion of H&P within 24 hours prior to surgery, properly executed informed consent, and operative reports dictated immediately following surgery.', pageNumber: 1, tags: ['compliance', 'perioperative'] },
    ],
  },
  {
    id: 'patient-positioning-atlas',
    title: 'Atlas of Surgical Patient Positioning',
    subtitle: '4th Edition',
    authors: ['Frederick Hatfield', 'Karen McConnell'],
    publisher: 'Elsevier',
    isbn: '978-0-323-56788-4',
    publishedYear: 2023,
    coverColor: 'hsl(260 40% 42%)',
    description: 'Visual atlas covering all standard and specialty surgical positions with emphasis on injury prevention, pressure point management, and documentation.',
    specialty: 'Perioperative Nursing',
    tags: ['perioperative', 'surgery'],
    chapters: [
      { id: 'posn-ch1', title: 'Supine Position: Standard Setup', content: 'The supine position is the most common surgical position. Key considerations include arm positioning (abduction limited to <90° to prevent brachial plexus injury), padding of occiput, scapulae, elbows, sacrum, and heels. Safety strap placement is 2 inches above the knees. Documentation must include pre and post positioning neurovascular assessment.', pageNumber: 1, tags: ['perioperative'] },
    ],
  },
  {
    id: 'surgical-counts-protocol',
    title: 'Surgical Counts and Retained Item Prevention',
    authors: ['NoThing Left Behind Consortium'],
    publisher: 'Patient Safety Authority',
    isbn: '978-1-88876-534-1',
    publishedYear: 2023,
    coverColor: 'hsl(350 45% 40%)',
    description: 'Evidence-based protocols for surgical counting procedures, adjunct technology use, and institutional policies to prevent retained surgical items.',
    specialty: 'Patient Safety',
    tags: ['perioperative', 'surgery'],
    chapters: [
      { id: 'counts-ch1', title: 'Standardized Count Procedures', content: 'Surgical counts must be performed at defined intervals: before the procedure begins, when new items are added, before closure of a cavity within a cavity, during final wound closure, and at skin closure. Counts are performed concurrently by the scrub person and circulating nurse. All count discrepancies require immediate reconciliation including wound exploration and intraoperative imaging.', pageNumber: 1, tags: ['perioperative'] },
    ],
  },
  {
    id: 'periop-quality-measures',
    title: 'Perioperative Quality Measures & Benchmarking',
    authors: ['American College of Surgeons'],
    publisher: 'ACS Quality Programs',
    isbn: '978-0-96721-456-2',
    publishedYear: 2024,
    coverColor: 'hsl(140 45% 38%)',
    description: 'Quality measure definitions, data collection methodology, and benchmarking standards for perioperative outcomes including NSQIP participation guidance.',
    specialty: 'Quality Improvement',
    tags: ['perioperative', 'compliance'],
    chapters: [
      { id: 'pqm-ch1', title: 'ACS NSQIP Quality Measures', content: 'The National Surgical Quality Improvement Program (NSQIP) tracks risk-adjusted surgical outcomes across participating hospitals. Key measures include 30-day mortality, surgical site infection rates, unplanned return to OR, prolonged ventilator dependence, and readmission rates. Data collection requires trained Surgical Clinical Reviewers and standardized variable definitions.', pageNumber: 1, tags: ['perioperative', 'compliance'] },
    ],
  },

  // === ANESTHESIA & SEDATION COLLECTION ===
  {
    id: 'asa-monitoring-standards',
    title: 'ASA Standards for Basic Anesthetic Monitoring',
    authors: ['American Society of Anesthesiologists'],
    publisher: 'ASA Publications',
    isbn: '978-0-97812-345-6',
    publishedYear: 2024,
    coverColor: 'hsl(220 50% 38%)',
    description: 'Official ASA monitoring standards including oxygenation, ventilation, circulation, and temperature monitoring requirements for all anesthetics.',
    specialty: 'Anesthesiology',
    tags: ['anesthesia'],
    chapters: [
      { id: 'asa-mon-ch1', title: 'Standard I: Qualified Anesthesia Personnel', content: 'Qualified anesthesia personnel shall be present in the room throughout the conduct of all general anesthetics, regional anesthetics, and monitored anesthesia care. This standard requires continuous presence and vigilance from induction through emergence and transport to post-anesthesia care.', pageNumber: 1, tags: ['anesthesia'] },
    ],
  },
  {
    id: 'asa-difficult-airway',
    title: 'ASA Practice Guidelines for Difficult Airway Management',
    authors: ['ASA Task Force on Difficult Airway Management'],
    publisher: 'ASA Publications',
    isbn: '978-0-97812-567-8',
    publishedYear: 2023,
    coverColor: 'hsl(225 55% 42%)',
    description: 'Updated practice guidelines for management of the difficult airway including prediction, preparation, and algorithmic approaches to failed intubation.',
    specialty: 'Anesthesiology',
    tags: ['anesthesia', 'emergency', 'intubation'],
    chapters: [
      { id: 'asa-da-ch1', title: 'Difficult Airway Algorithm', content: 'The ASA difficult airway algorithm provides a systematic approach to airway management. The algorithm begins with airway assessment and preparation of alternative strategies. Key decision points include ability to ventilate, ability to intubate, and patient cooperation for awake intubation. Emergency pathways include supraglottic airways, cricothyrotomy, and rigid bronchoscopy.', pageNumber: 1, tags: ['anesthesia', 'intubation'] },
    ],
  },
  {
    id: 'mh-protocol-guide',
    title: 'Malignant Hyperthermia Emergency Protocol Guide',
    authors: ['Malignant Hyperthermia Association of the United States'],
    publisher: 'MHAUS',
    isbn: '978-0-98765-432-1',
    publishedYear: 2024,
    coverColor: 'hsl(0 60% 45%)',
    description: 'Emergency protocol for malignant hyperthermia recognition, treatment, and prevention including dantrolene administration guidelines and post-crisis management.',
    specialty: 'Anesthesiology',
    tags: ['anesthesia', 'emergency'],
    chapters: [
      { id: 'mh-ch1', title: 'MH Crisis Protocol', content: 'Upon recognition of malignant hyperthermia: STOP all triggering agents immediately, hyperventilate with 100% O2 at 10L/min, administer dantrolene 2.5mg/kg IV rapidly (reconstitute with sterile water), cool the patient aggressively, treat hyperkalemia with calcium, insulin/glucose, and bicarbonate, monitor core temperature, send labs (ABG, CK, myoglobin, coagulation), and notify the MH Hotline (1-800-644-9737).', pageNumber: 1, tags: ['anesthesia', 'emergency'] },
    ],
  },
  {
    id: 'moderate-sedation-policy',
    title: 'Moderate Sedation: Institutional Policy & Practice Guide',
    authors: ['Institute for Safe Medication Practices'],
    publisher: 'ISMP',
    isbn: '978-1-55648-901-3',
    publishedYear: 2023,
    coverColor: 'hsl(190 45% 40%)',
    description: 'Comprehensive guide for institutional moderate sedation policies including credentialing, monitoring, rescue procedures, and CMS compliance requirements.',
    specialty: 'Sedation',
    tags: ['anesthesia', 'compliance'],
    chapters: [
      { id: 'sed-ch1', title: 'Moderate Sedation Standards', content: 'Moderate sedation (conscious sedation) requires a physician or qualified practitioner credentialed by the institution. Pre-sedation assessment includes ASA classification, airway evaluation, NPO status, and informed consent. Monitoring during sedation includes continuous pulse oximetry, ETCO2 for moderate-to-deep sedation, ECG, blood pressure every 5 minutes, and level of consciousness assessment.', pageNumber: 1, tags: ['anesthesia'] },
    ],
  },
  {
    id: 'regional-anesthesia-atlas',
    title: 'Atlas of Regional Anesthesia Techniques',
    subtitle: '5th Edition',
    authors: ['David L. Brown', 'Ehab Farag'],
    publisher: 'Elsevier',
    isbn: '978-0-323-65409-2',
    publishedYear: 2022,
    coverColor: 'hsl(245 40% 45%)',
    description: 'Visual atlas of nerve block techniques with ultrasound guidance, anatomical correlations, and complication management for regional anesthesia procedures.',
    specialty: 'Anesthesiology',
    tags: ['anesthesia'],
    chapters: [
      { id: 'reg-ch1', title: 'Ultrasound-Guided Nerve Blocks', content: 'Ultrasound guidance has revolutionized regional anesthesia by providing real-time visualization of neural structures, surrounding anatomy, and needle trajectory. Key advantages include improved success rates, reduced local anesthetic volumes, and decreased complication rates. This chapter covers transducer selection, image optimization, needle visualization techniques, and common artifacts.', pageNumber: 1, tags: ['anesthesia'] },
    ],
  },
  {
    id: 'pediatric-anesthesia-guide',
    title: 'Pediatric Anesthesia: Safety Protocols',
    authors: ['Society for Pediatric Anesthesia'],
    publisher: 'SPA Publications',
    isbn: '978-0-88167-234-5',
    publishedYear: 2023,
    coverColor: 'hsl(280 45% 42%)',
    description: 'Pediatric-specific anesthesia protocols covering dosing calculations, airway sizing, emergence delirium management, and age-specific monitoring requirements.',
    specialty: 'Pediatric Anesthesiology',
    tags: ['anesthesia', 'pediatric'],
    chapters: [
      { id: 'ped-ch1', title: 'Weight-Based Dosing Calculations', content: 'All pediatric anesthetic agents must be dosed by weight (mg/kg). Drug calculation errors are a leading cause of pediatric anesthesia morbidity. Standard protocols require independent double-checking of all drug calculations, use of standardized concentration infusions, and color-coded syringes by drug class. Weight must be obtained in kilograms; estimated weights are used only in emergencies.', pageNumber: 1, tags: ['anesthesia'] },
    ],
  },
  {
    id: 'obstetric-anesthesia-manual',
    title: 'Obstetric Anesthesia: Protocols and Guidelines',
    authors: ['Society for Obstetric Anesthesia and Perinatology'],
    publisher: 'SOAP Publications',
    isbn: '978-0-99321-567-8',
    publishedYear: 2024,
    coverColor: 'hsl(330 45% 42%)',
    description: 'Clinical protocols for labor analgesia, cesarean anesthesia, high-risk obstetric patients, and maternal hemorrhage management.',
    specialty: 'Obstetric Anesthesiology',
    tags: ['anesthesia', 'obstetric'],
    chapters: [
      { id: 'obs-ch1', title: 'Labor Epidural Protocol', content: 'Neuraxial labor analgesia is initiated upon patient request when labor is established. Standard protocol includes IV access, fluid preload, sterile technique for epidural catheter placement, test dose administration, and incremental dosing. Continuous monitoring includes maternal vital signs, fetal heart rate, and motor block assessment. Breakthrough pain management and epidural top-up protocols for emergent cesarean delivery are included.', pageNumber: 1, tags: ['anesthesia'] },
    ],
  },
  {
    id: 'post-anesthesia-care',
    title: 'ASPAN Standards for Post-Anesthesia Care',
    authors: ['American Society of PeriAnesthesia Nurses'],
    publisher: 'ASPAN',
    isbn: '978-0-96523-890-1',
    publishedYear: 2024,
    coverColor: 'hsl(170 50% 38%)',
    description: 'Standards of practice for Phase I and Phase II post-anesthesia care including discharge criteria, pain management protocols, and PONV prevention.',
    specialty: 'Post-Anesthesia Care',
    tags: ['anesthesia', 'perioperative'],
    chapters: [
      { id: 'pacu-ch1', title: 'Phase I PACU Standards', content: 'Phase I post-anesthesia care focuses on immediate recovery from anesthesia. Assessment includes airway patency, respiratory adequacy, cardiovascular stability, level of consciousness, pain level, and surgical site integrity. Modified Aldrete scoring guides readiness for Phase II transfer. Minimum monitoring includes continuous pulse oximetry, ECG, and blood pressure every 5 minutes initially. Nurse-to-patient ratio in Phase I is 1:1 for unstable patients and 1:2 for stable patients.', pageNumber: 1, tags: ['anesthesia', 'perioperative'] },
    ],
  },

  // === INFECTION PREVENTION COLLECTION ===
  {
    id: 'apic-infection-control',
    title: 'APIC Text of Infection Control and Epidemiology',
    subtitle: '5th Edition',
    authors: ['Association for Professionals in Infection Control'],
    publisher: 'APIC',
    isbn: '978-1-93364-522-3',
    publishedYear: 2024,
    coverColor: 'hsl(120 40% 38%)',
    description: 'Comprehensive infection prevention and control reference covering surveillance, outbreak investigation, environmental hygiene, and antimicrobial stewardship.',
    specialty: 'Infection Prevention',
    tags: ['infection-control'],
    chapters: [
      { id: 'apic-ch1', title: 'Healthcare-Associated Infection Surveillance', content: 'HAI surveillance uses standardized NHSN definitions for case identification. Active surveillance cultures, laboratory-based event detection, and targeted assessments identify infections. Rates are calculated using device-days or procedure-specific denominators. Benchmarking with national data through SIR (Standardized Infection Ratio) enables meaningful comparison. Surveillance data drives quality improvement initiatives and regulatory reporting.', pageNumber: 1, tags: ['infection-control'] },
    ],
  },
  {
    id: 'cdc-ssi-prevention',
    title: 'CDC Guideline for Prevention of Surgical Site Infection',
    authors: ['Centers for Disease Control and Prevention'],
    publisher: 'CDC/HICPAC',
    isbn: '978-0-16-093567-5',
    publishedYear: 2023,
    coverColor: 'hsl(145 50% 35%)',
    description: 'Evidence-based recommendations for SSI prevention including preoperative, intraoperative, and postoperative measures categorized by strength of evidence.',
    specialty: 'Infection Prevention',
    tags: ['infection-control', 'surgery'],
    chapters: [
      { id: 'cdc-ssi-ch1', title: 'SSI Prevention Bundle Elements', content: 'The SSI prevention bundle includes: appropriate antimicrobial prophylaxis within 60 minutes of incision (2 hours for vancomycin/fluoroquinolones), skin preparation with alcohol-based chlorhexidine, maintenance of perioperative normothermia (>35.5°C), maintenance of perioperative normoglycemia (<200 mg/dL), and appropriate hair removal (clipping, not shaving). Bundle compliance is measured and reported as an all-or-none composite.', pageNumber: 1, tags: ['infection-control', 'surgery'] },
    ],
  },
  {
    id: 'osha-bloodborne-pathogens',
    title: 'OSHA Bloodborne Pathogens Standard: Compliance Guide',
    authors: ['Occupational Safety and Health Administration'],
    publisher: 'OSHA Publications',
    isbn: '978-0-16-095890-2',
    publishedYear: 2023,
    coverColor: 'hsl(25 60% 45%)',
    description: 'Complete compliance guide for OSHA 29 CFR 1910.1030 including exposure control plan development, training requirements, and recordkeeping obligations.',
    specialty: 'Occupational Health',
    tags: ['infection-control', 'compliance'],
    chapters: [
      { id: 'osha-bbp-ch1', title: 'Exposure Control Plan Requirements', content: 'Every employer with employees who have reasonably anticipated occupational exposure to blood or OPIM must establish a written Exposure Control Plan. The plan must include: exposure determination by job classification and tasks, implementation schedule for methods of compliance, hepatitis B vaccination program, post-exposure evaluation procedures, training schedule, and annual plan review with updated exposure determinations and engineering controls.', pageNumber: 1, tags: ['infection-control', 'compliance'] },
    ],
  },
  {
    id: 'antimicrobial-stewardship',
    title: 'Antimicrobial Stewardship: Program Implementation Guide',
    authors: ['Infectious Diseases Society of America', 'Society for Healthcare Epidemiology'],
    publisher: 'IDSA/SHEA',
    isbn: '978-0-19-935678-9',
    publishedYear: 2024,
    coverColor: 'hsl(50 55% 42%)',
    description: 'Implementation guide for antimicrobial stewardship programs including team structure, core interventions, metrics, and regulatory requirements.',
    specialty: 'Infectious Disease',
    tags: ['infection-control', 'antibiotics'],
    chapters: [
      { id: 'ams-ch1', title: 'Core Stewardship Interventions', content: 'Core antimicrobial stewardship interventions include prospective audit and feedback, formulary restriction and preauthorization, antibiotic time-outs at 48-72 hours, IV-to-oral conversion protocols, dose optimization based on PK/PD principles, and de-escalation based on culture results. Programs require physician and pharmacist co-leadership, information technology support, and microbiology laboratory collaboration.', pageNumber: 1, tags: ['infection-control', 'antibiotics'] },
    ],
  },
  {
    id: 'hand-hygiene-compliance',
    title: 'Hand Hygiene Compliance: Strategies and Monitoring',
    authors: ['WHO Clean Care is Safer Care'],
    publisher: 'WHO/Patient Safety',
    isbn: '978-9-24159-934-5',
    publishedYear: 2023,
    coverColor: 'hsl(185 50% 40%)',
    description: 'Implementation toolkit for improving hand hygiene compliance using the WHO multimodal strategy, direct observation monitoring, and electronic compliance systems.',
    specialty: 'Infection Prevention',
    tags: ['infection-control'],
    chapters: [
      { id: 'hh-ch1', title: 'WHO 5 Moments for Hand Hygiene', content: 'The WHO 5 Moments framework identifies critical points for hand hygiene: (1) before patient contact, (2) before an aseptic task, (3) after body fluid exposure risk, (4) after patient contact, and (5) after contact with patient surroundings. Compliance monitoring uses trained observers with standardized observation tools. Feedback to units should be timely, specific, and include trend data.', pageNumber: 1, tags: ['infection-control'] },
    ],
  },
  {
    id: 'isolation-precautions-manual',
    title: 'Isolation Precautions: Implementation Manual',
    authors: ['CDC Healthcare Infection Control Practices Advisory Committee'],
    publisher: 'CDC/HICPAC',
    isbn: '978-0-16-093890-4',
    publishedYear: 2023,
    coverColor: 'hsl(155 45% 38%)',
    description: 'Standard and transmission-based precautions manual including PPE selection, patient placement, transport protocols, and environmental cleaning requirements.',
    specialty: 'Infection Prevention',
    tags: ['infection-control'],
    chapters: [
      { id: 'iso-ch1', title: 'Transmission-Based Precautions', content: 'Transmission-based precautions are used in addition to standard precautions for patients with known or suspected infections. Contact precautions (gown and gloves) apply to MDRO colonization/infection. Droplet precautions (surgical mask within 6 feet) apply to influenza and pertussis. Airborne precautions (N95 respirator, negative pressure room) apply to tuberculosis, measles, and varicella. Combinations may be required for some pathogens.', pageNumber: 1, tags: ['infection-control'] },
    ],
  },
  {
    id: 'surgical-prep-protocols',
    title: 'Surgical Site Preparation: Evidence-Based Protocols',
    authors: ['Association for periOperative Practice'],
    publisher: 'AfPP Publications',
    isbn: '978-1-90408-234-5',
    publishedYear: 2023,
    coverColor: 'hsl(100 40% 40%)',
    description: 'Protocols for preoperative patient skin preparation, hair removal, antiseptic selection, and application techniques to minimize surgical site infection risk.',
    specialty: 'Perioperative Nursing',
    tags: ['infection-control', 'perioperative'],
    chapters: [
      { id: 'sprep-ch1', title: 'Skin Antisepsis Protocols', content: 'Chlorhexidine-alcohol (CHG-alcohol) is the preferred antiseptic for surgical site preparation. Application requires friction scrubbing for 30 seconds followed by 30 seconds of drying time for CHG-based products. Allow 3 minutes of drying for alcohol-based products to reduce fire risk. Iodine-based products are alternatives for CHG-allergic patients. Document product used, application technique, and skin condition.', pageNumber: 1, tags: ['infection-control', 'perioperative'] },
    ],
  },
  {
    id: 'endoscope-reprocessing',
    title: 'Endoscope Reprocessing: Standards and Best Practices',
    authors: ['Society of Gastroenterology Nurses and Associates'],
    publisher: 'SGNA',
    isbn: '978-0-93521-789-0',
    publishedYear: 2024,
    coverColor: 'hsl(270 40% 42%)',
    description: 'Comprehensive guide for flexible endoscope reprocessing including precleaning, manual cleaning, high-level disinfection, storage, and quality monitoring.',
    specialty: 'Sterile Processing',
    tags: ['infection-control'],
    chapters: [
      { id: 'endo-ch1', title: 'HLD Reprocessing Steps', content: 'Flexible endoscope reprocessing follows a standardized sequence: (1) bedside precleaning with enzymatic detergent, (2) leak testing, (3) manual cleaning of all channels, (4) high-level disinfection or liquid chemical sterilization, (5) rinsing with sterile or filtered water, (6) drying with forced air, and (7) proper storage in ventilated cabinets. Each step requires documentation. Automated endoscope reprocessors (AERs) standardize the HLD step but do not replace manual cleaning.', pageNumber: 1, tags: ['infection-control'] },
    ],
  },
  {
    id: 'environmental-services-guide',
    title: 'Healthcare Environmental Services: Cleaning & Disinfection',
    authors: ['Association for the Healthcare Environment'],
    publisher: 'AHE/AHA',
    isbn: '978-0-87258-901-2',
    publishedYear: 2023,
    coverColor: 'hsl(80 40% 40%)',
    description: 'Best practices for healthcare facility cleaning and disinfection including operating room terminal cleaning, isolation room procedures, and UV-C adjunct technology.',
    specialty: 'Environmental Services',
    tags: ['infection-control'],
    chapters: [
      { id: 'evs-ch1', title: 'OR Terminal Cleaning Protocol', content: 'Operating room terminal cleaning occurs at the end of the daily schedule or after contaminated cases. Protocol includes: donning appropriate PPE, removing all trash and linen, cleaning all horizontal surfaces top to bottom, cleaning all equipment and fixtures, mopping the floor with EPA-registered disinfectant, appropriate dwell time for disinfectant, and fluorescent marker or ATP bioluminescence verification of cleaning adequacy.', pageNumber: 1, tags: ['infection-control', 'perioperative'] },
    ],
  },

  // === PATIENT SAFETY & RISK MANAGEMENT COLLECTION ===
  {
    id: 'fall-prevention-toolkit',
    title: 'Fall Prevention Toolkit: Evidence-Based Strategies',
    authors: ['Agency for Healthcare Research and Quality'],
    publisher: 'AHRQ',
    isbn: '978-1-58763-456-7',
    publishedYear: 2024,
    coverColor: 'hsl(35 55% 45%)',
    description: 'Implementation toolkit for hospital fall prevention programs including risk assessment, universal precautions, post-fall protocols, and outcome measurement.',
    specialty: 'Patient Safety',
    tags: ['patient-safety'],
    chapters: [
      { id: 'fall-ch1', title: 'Fall Risk Assessment and Universal Precautions', content: 'Fall prevention begins with standardized risk assessment using validated tools (Morse Fall Scale, Hendrich II). Universal fall precautions apply to all patients: non-slip footwear, bed in lowest position, call light within reach, clutter-free environment, adequate lighting, and toileting schedule. High-risk patients receive additional interventions including bed alarms, 1:1 observation, physical therapy consultation, and medication review for fall-risk medications.', pageNumber: 1, tags: ['patient-safety'] },
    ],
  },
  {
    id: 'medication-safety-manual',
    title: 'Medication Safety: Institutional Best Practices',
    authors: ['Institute for Safe Medication Practices'],
    publisher: 'ISMP',
    isbn: '978-1-55648-789-0',
    publishedYear: 2024,
    coverColor: 'hsl(10 55% 45%)',
    description: 'Comprehensive medication safety guide covering high-alert medications, look-alike/sound-alike drug management, smart pump programming, and barcode verification.',
    specialty: 'Pharmacy/Patient Safety',
    tags: ['patient-safety', 'medication'],
    chapters: [
      { id: 'med-ch1', title: 'High-Alert Medication Management', content: 'High-alert medications bear a heightened risk of causing significant patient harm when used in error. ISMP high-alert categories include anticoagulants, insulin, opioids, neuromuscular blocking agents, and concentrated electrolytes. Risk reduction strategies include limiting access, using auxiliary labels, requiring independent double-checks, standardizing concentrations, and implementing maximum dose alerts in clinical decision support systems.', pageNumber: 1, tags: ['patient-safety', 'medication'] },
    ],
  },
  {
    id: 'sentinel-event-response',
    title: 'Sentinel Event Response: Investigation & Action Planning',
    authors: ['The Joint Commission'],
    publisher: 'Joint Commission Resources',
    isbn: '978-1-63585-234-5',
    publishedYear: 2024,
    coverColor: 'hsl(0 50% 40%)',
    description: 'Framework for sentinel event identification, root cause analysis, corrective action planning, and sustained improvement monitoring per Joint Commission standards.',
    specialty: 'Risk Management',
    tags: ['patient-safety', 'compliance'],
    chapters: [
      { id: 'sent-ch1', title: 'Root Cause Analysis Process', content: 'Root cause analysis (RCA) for sentinel events follows a structured methodology: (1) organize the team with subject matter experts, (2) define the problem and timeline, (3) study and analyze the event using cause-and-effect diagrams, (4) identify root causes focusing on system and process failures rather than individual blame, (5) develop corrective actions that address root causes, and (6) measure effectiveness of actions. The Joint Commission requires completion within 45 business days of event awareness.', pageNumber: 1, tags: ['patient-safety', 'compliance'] },
    ],
  },
  {
    id: 'informed-consent-guide',
    title: 'Informed Consent: Legal & Clinical Practice Guide',
    authors: ['American Health Law Association'],
    publisher: 'AHLA',
    isbn: '978-0-76981-234-5',
    publishedYear: 2023,
    coverColor: 'hsl(205 45% 40%)',
    description: 'Legal and clinical requirements for valid informed consent including capacity assessment, disclosure elements, documentation, and special circumstances.',
    specialty: 'Risk Management',
    tags: ['patient-safety', 'compliance'],
    chapters: [
      { id: 'consent-ch1', title: 'Elements of Valid Informed Consent', content: 'Valid informed consent requires: (1) disclosure of diagnosis, proposed treatment, alternatives, risks, and benefits in language the patient understands, (2) patient capacity to understand and make decisions, (3) voluntariness without coercion, and (4) documentation of the consent discussion. The physician performing the procedure is responsible for the consent discussion; nursing staff may witness the signature. Emergency exceptions, therapeutic privilege, and waiver by patient are recognized legal exceptions.', pageNumber: 1, tags: ['patient-safety', 'compliance'] },
    ],
  },
  {
    id: 'patient-identification-protocol',
    title: 'Patient Identification: Two-Identifier Protocol',
    authors: ['Joint Commission Center for Transforming Healthcare'],
    publisher: 'Joint Commission Resources',
    isbn: '978-1-63585-567-8',
    publishedYear: 2023,
    coverColor: 'hsl(195 50% 38%)',
    description: 'Implementation guide for JCAHO NPSG.01.01.01 requiring two patient identifiers for medication administration, blood transfusion, specimen collection, and treatment.',
    specialty: 'Patient Safety',
    tags: ['patient-safety', 'compliance'],
    chapters: [
      { id: 'pid-ch1', title: 'Two-Identifier Verification Protocol', content: 'Patient identification requires two person-specific identifiers before any procedure, medication administration, blood product transfusion, or specimen collection. Acceptable identifiers include patient name, date of birth, medical record number, or Social Security number. Room number is NEVER an acceptable identifier. Barcode scanning technology automates verification but staff must verify the correct patient is scanned. Unresponsive or unnamed patients require alternative identification procedures.', pageNumber: 1, tags: ['patient-safety'] },
    ],
  },
  {
    id: 'clinical-alarm-management',
    title: 'Clinical Alarm Management: JCAHO NPSG Compliance',
    authors: ['ECRI Institute', 'AAMI Foundation'],
    publisher: 'ECRI/AAMI',
    isbn: '978-0-97983-456-1',
    publishedYear: 2024,
    coverColor: 'hsl(40 50% 42%)',
    description: 'Framework for clinical alarm management addressing alarm fatigue, priority setting, parameter customization, and escalation policies per NPSG.06.01.01.',
    specialty: 'Patient Safety',
    tags: ['patient-safety'],
    chapters: [
      { id: 'alarm-ch1', title: 'Alarm Management Framework', content: 'Clinical alarm management addresses the top health technology hazard identified by ECRI. The framework includes: alarm inventory across all clinical areas, establishment of alarm governance committee, customization of alarm parameters to patient population, implementation of tiered alarm notification systems, staff education on alarm response, and ongoing monitoring of alarm data to identify nuisance alarms. Default alarm settings on medical devices are often inappropriate and contribute to alarm fatigue.', pageNumber: 1, tags: ['patient-safety'] },
    ],
  },
  {
    id: 'restraint-seclusion-policy',
    title: 'Restraint & Seclusion: Policy and Compliance Guide',
    authors: ['CMS Interpretive Guidelines Task Force'],
    publisher: 'CMS',
    isbn: '978-0-16-095678-6',
    publishedYear: 2023,
    coverColor: 'hsl(315 40% 42%)',
    description: 'CMS and Joint Commission requirements for use of physical restraints and seclusion including ordering requirements, monitoring intervals, and alternatives.',
    specialty: 'Patient Safety',
    tags: ['patient-safety', 'compliance'],
    chapters: [
      { id: 'rest-ch1', title: 'Restraint Use Requirements', content: 'Restraint use requires a face-to-face physician assessment within 1 hour of application for behavioral health restraints. Non-violent restraints (medical/surgical) require an order that must be renewed every 24 hours. Patient assessment during restraint includes circulation, sensation, movement, skin integrity, and ongoing need every 2 hours for non-violent and every 15 minutes for violent/self-destructive behavior restraints. Least restrictive alternatives must be attempted and documented before restraint application.', pageNumber: 1, tags: ['patient-safety', 'compliance'] },
    ],
  },
  {
    id: 'adverse-event-reporting',
    title: 'Adverse Event Reporting: Framework and Requirements',
    authors: ['National Quality Forum'],
    publisher: 'NQF',
    isbn: '978-1-93363-901-2',
    publishedYear: 2024,
    coverColor: 'hsl(355 45% 42%)',
    description: 'Reporting framework for serious reportable events (NQF Never Events), near misses, and safety concerns including regulatory reporting obligations and just culture principles.',
    specialty: 'Risk Management',
    tags: ['patient-safety', 'compliance'],
    chapters: [
      { id: 'aer-ch1', title: 'NQF Serious Reportable Events', content: 'The NQF Serious Reportable Events (Never Events) list includes 29 events across surgical/invasive procedure events, product/device events, patient protection events, care management events, environmental events, radiologic events, and criminal events. Mandatory state reporting requirements vary by jurisdiction. Internal reporting systems must capture events, near misses, and unsafe conditions. Just culture principles distinguish between human error (console), at-risk behavior (coach), and reckless behavior (punish).', pageNumber: 1, tags: ['patient-safety', 'compliance'] },
    ],
  },

  // === EMERGENCY & CRITICAL CARE COLLECTION ===
  {
    id: 'acls-provider-manual',
    title: 'ACLS Provider Manual',
    subtitle: '2024 Edition',
    authors: ['American Heart Association'],
    publisher: 'AHA',
    isbn: '978-1-61669-801-2',
    publishedYear: 2024,
    coverColor: 'hsl(0 70% 42%)',
    description: 'Advanced Cardiovascular Life Support provider course manual including cardiac arrest algorithms, post-cardiac arrest care, and acute coronary syndrome management.',
    specialty: 'Emergency Medicine',
    tags: ['emergency', 'cardiology'],
    chapters: [
      { id: 'acls-ch1', title: 'Adult Cardiac Arrest Algorithm', content: 'The ACLS cardiac arrest algorithm differentiates shockable rhythms (VF/pVT) from non-shockable rhythms (PEA/asystole). For VF/pVT: defibrillation, CPR 2 minutes, epinephrine every 3-5 minutes, amiodarone 300mg first dose then 150mg. For PEA/asystole: CPR, epinephrine every 3-5 minutes, identify and treat reversible causes (Hs and Ts). High-quality CPR parameters: rate 100-120/min, depth ≥2 inches, full chest recoil, minimize interruptions (<10 seconds).', pageNumber: 1, tags: ['emergency', 'cardiology'] },
    ],
  },
  {
    id: 'sepsis-bundle-guide',
    title: 'Sepsis Management: Bundle Implementation Guide',
    authors: ['Surviving Sepsis Campaign'],
    publisher: 'SCCM/ESICM',
    isbn: '978-0-93614-567-8',
    publishedYear: 2024,
    coverColor: 'hsl(20 60% 42%)',
    description: 'Implementation guide for Surviving Sepsis Campaign hour-1 and hour-3 bundles including screening tools, order sets, and compliance measurement.',
    specialty: 'Critical Care',
    tags: ['emergency', 'sepsis'],
    chapters: [
      { id: 'sep-ch1', title: 'Hour-1 Sepsis Bundle', content: 'The Hour-1 Sepsis Bundle must be initiated within 1 hour of sepsis recognition: (1) measure serum lactate and remeasure if initial lactate >2 mmol/L, (2) obtain blood cultures before antibiotics, (3) administer broad-spectrum antibiotics, (4) begin rapid administration of 30 mL/kg crystalloid for hypotension or lactate ≥4 mmol/L, and (5) apply vasopressors if hypotensive during or after fluid resuscitation to maintain MAP ≥65 mmHg. CMS SEP-1 measure tracks compliance with these elements.', pageNumber: 1, tags: ['emergency', 'sepsis'] },
    ],
  },
  {
    id: 'rapid-response-protocol',
    title: 'Rapid Response System: Implementation and Management',
    authors: ['Institute for Healthcare Improvement'],
    publisher: 'IHI',
    isbn: '978-0-86688-901-3',
    publishedYear: 2023,
    coverColor: 'hsl(45 55% 42%)',
    description: 'Framework for rapid response team implementation including activation criteria, team composition, response protocols, and outcome tracking.',
    specialty: 'Patient Safety',
    tags: ['emergency'],
    chapters: [
      { id: 'rrt-ch1', title: 'RRT Activation Criteria', content: 'Rapid Response Team activation criteria are based on objective physiological parameters that any healthcare worker can identify: acute change in heart rate (<40 or >130), respiratory rate (<8 or >28), systolic blood pressure (<90), SpO2 <90% despite supplemental oxygen, acute change in mental status, acute change in urine output (<50mL in 4 hours), or staff member concern about patient condition. The "worried" criterion empowers nurses to activate the team based on clinical judgment without meeting objective criteria.', pageNumber: 1, tags: ['emergency'] },
    ],
  },
  {
    id: 'trauma-resuscitation-manual',
    title: 'Trauma Resuscitation: ATLS-Based Protocols',
    authors: ['American College of Surgeons Committee on Trauma'],
    publisher: 'ACS',
    isbn: '978-0-99651-234-5',
    publishedYear: 2024,
    coverColor: 'hsl(5 55% 42%)',
    description: 'Trauma resuscitation protocols based on ATLS principles including primary survey, hemorrhage control, massive transfusion protocols, and damage control surgery.',
    specialty: 'Trauma Surgery',
    tags: ['emergency', 'surgery'],
    chapters: [
      { id: 'trauma-ch1', title: 'Primary Survey: ABCDE', content: 'The ATLS primary survey follows the ABCDE sequence: (A) Airway with cervical spine protection - assess patency, protect with intubation if needed; (B) Breathing - assess for tension pneumothorax, open pneumothorax, flail chest; (C) Circulation with hemorrhage control - identify and control bleeding, establish IV access, begin fluid resuscitation; (D) Disability - assess neurological status with GCS; (E) Exposure - completely undress and prevent hypothermia. Life-threatening conditions identified in the primary survey are treated immediately before proceeding.', pageNumber: 1, tags: ['emergency', 'surgery'] },
    ],
  },
  {
    id: 'stroke-protocol-guide',
    title: 'Acute Stroke Protocol: Code Stroke Management',
    authors: ['American Stroke Association'],
    publisher: 'ASA/AHA',
    isbn: '978-1-61669-567-7',
    publishedYear: 2024,
    coverColor: 'hsl(240 45% 42%)',
    description: 'Time-critical stroke protocols including code stroke activation, rapid neuroimaging, IV alteplase administration, and thrombectomy decision-making algorithms.',
    specialty: 'Neurology',
    tags: ['emergency', 'stroke'],
    chapters: [
      { id: 'stroke-ch1', title: 'Code Stroke Protocol', content: 'Code Stroke activation triggers a time-critical response: door-to-CT <25 minutes, door-to-needle (IV alteplase) <60 minutes, door-to-groin puncture (thrombectomy) <90 minutes. The protocol includes: immediate triage assessment, NIHSS scoring, stat non-contrast head CT, point-of-care glucose, IV access and blood draw, pharmacy notification for alteplase preparation, and neurology/neurointerventional notification. CTA/CTP imaging guides thrombectomy candidacy assessment for large vessel occlusion.', pageNumber: 1, tags: ['emergency', 'stroke'] },
    ],
  },
  {
    id: 'code-blue-management',
    title: 'Code Blue Management: Team-Based Resuscitation',
    authors: ['Society of Critical Care Medicine'],
    publisher: 'SCCM',
    isbn: '978-0-93614-890-1',
    publishedYear: 2024,
    coverColor: 'hsl(350 55% 40%)',
    description: 'Institutional code blue response protocols including team roles, communication frameworks, equipment standardization, and post-event debriefing.',
    specialty: 'Critical Care',
    tags: ['emergency', 'cardiology'],
    chapters: [
      { id: 'code-ch1', title: 'Code Blue Team Roles and Communication', content: 'Effective code management requires defined team roles: team leader (directs resuscitation, makes clinical decisions), airway manager (intubation, ventilation), compressor (high-quality CPR with rotation every 2 minutes), medication nurse (drug preparation and administration), recorder/timekeeper (documentation, time announcements), and defibrillator operator. Closed-loop communication is mandatory: orders are directed to specific team members by name, repeated back, and confirmed when completed.', pageNumber: 1, tags: ['emergency', 'cardiology'] },
    ],
  },
  {
    id: 'critical-care-drug-manual',
    title: 'Critical Care Drug Manual: Infusions and Protocols',
    authors: ['American Association of Critical-Care Nurses'],
    publisher: 'AACN',
    isbn: '978-0-32365-234-5',
    publishedYear: 2024,
    coverColor: 'hsl(275 45% 40%)',
    description: 'Standardized critical care drug infusion protocols including vasopressor titration, sedation scales, insulin drip management, and high-alert medication safeguards.',
    specialty: 'Critical Care',
    tags: ['emergency', 'medication'],
    chapters: [
      { id: 'ccdm-ch1', title: 'Vasopressor Titration Protocols', content: 'Vasopressor therapy requires standardized titration protocols. Norepinephrine is first-line for septic shock: initial dose 0.1-0.5 mcg/kg/min, titrate every 5-10 minutes to target MAP ≥65 mmHg. Vasopressin 0.03 units/min as adjunct if norepinephrine >0.25 mcg/kg/min. Epinephrine for cardiogenic shock or as second-line. Phenylephrine for pure vasodilatory shock without cardiac dysfunction. All vasopressors require central venous access for sustained infusion (peripheral access acceptable for initial resuscitation <2 hours).', pageNumber: 1, tags: ['emergency', 'medication'] },
    ],
  },
  {
    id: 'mass-casualty-plan',
    title: 'Mass Casualty Incident: Hospital Emergency Operations Plan',
    authors: ['Federal Emergency Management Agency', 'HHS ASPR'],
    publisher: 'FEMA/HHS',
    isbn: '978-0-16-095234-7',
    publishedYear: 2023,
    coverColor: 'hsl(210 50% 35%)',
    description: 'Hospital emergency operations planning for mass casualty incidents including incident command structure, surge capacity, triage protocols, and communication plans.',
    specialty: 'Emergency Management',
    tags: ['emergency'],
    chapters: [
      { id: 'mci-ch1', title: 'Hospital Incident Command System', content: 'The Hospital Incident Command System (HICS) provides an organizational framework for managing emergencies. The incident commander activates the appropriate level of response and assigns section chiefs for operations, planning, logistics, and finance/administration. Key actions include: activation of the Emergency Operations Plan, establishment of the Hospital Command Center, assessment of available resources, implementation of surge capacity protocols, and coordination with external agencies through the Emergency Operations Center.', pageNumber: 1, tags: ['emergency'] },
    ],
  },
];

// ============================================================================
// TIER ENFORCEMENT LOGIC HELPERS
// ============================================================================

export function getTierDefinition(tier: LicensingTier): TierDefinition | undefined {
  return licensingTiers.find(t => t.id === tier);
}

export function canAccessCollection(tier: LicensingTier, collectionId: string): boolean {
  const tierDef = getTierDefinition(tier);
  if (tierDef.collectionsAccess === 'all') return true;
  // Basic tier gets first 2 collections only
  const basicCollectionIds = complianceCollections.slice(0, 2).map(c => c.id);
  return basicCollectionIds.includes(collectionId);
}

export function getAccessibleCollections(tier: LicensingTier): ComplianceCollectionDefinition[] {
  const tierDef = getTierDefinition(tier);
  if (tierDef.collectionsAccess === 'all') return complianceCollections;
  return complianceCollections.slice(0, tierDef.maxCollections);
}

export function isWithinSeatLimit(tier: LicensingTier, currentSeats: number): boolean {
  const tierDef = getTierDefinition(tier);
  if (tierDef.maxSeats === -1) return true;
  return currentSeats <= tierDef.maxSeats;
}

export function getRemainingAIQueries(tier: LicensingTier, usedQueries: number): number {
  const tierDef = getTierDefinition(tier);
  if (tierDef.features.aiUsageMonthly === -1) return Infinity;
  return Math.max(0, tierDef.features.aiUsageMonthly - usedQueries);
}

// Feature comparison matrix for pricing page
export interface FeatureComparison {
  category: string;
  features: {
    name: string;
    basic: string | boolean;
    pro: string | boolean;
    enterprise: string | boolean;
  }[];
}

export const featureComparisonMatrix: FeatureComparison[] = [
  {
    category: 'Content Access',
    features: [
      { name: 'Compliance Collections', basic: '2 collections', pro: 'All 5 collections', enterprise: 'All 5 + custom' },
      { name: 'Total Titles', basic: '20 titles', pro: '50 titles', enterprise: '50+ titles' },
      { name: 'Add-on Titles', basic: false, pro: true, enterprise: true },
      { name: 'Custom Collections', basic: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'AI Capabilities',
    features: [
      { name: 'Chapter Summaries', basic: true, pro: true, enterprise: true },
      { name: 'Compliance Point Extraction', basic: false, pro: true, enterprise: true },
      { name: 'Chapter Q&A', basic: true, pro: true, enterprise: true },
      { name: 'Monthly AI Queries', basic: '100', pro: '500', enterprise: 'Unlimited' },
    ],
  },
  {
    category: 'Reporting & Analytics',
    features: [
      { name: 'Usage Analytics', basic: true, pro: true, enterprise: true },
      { name: 'Compliance Scoring', basic: false, pro: true, enterprise: true },
      { name: 'Department Breakdown', basic: false, pro: true, enterprise: true },
      { name: 'Individual User Tracking', basic: false, pro: true, enterprise: true },
      { name: 'CSV Export', basic: false, pro: true, enterprise: true },
      { name: 'Custom Reports', basic: false, pro: false, enterprise: true },
      { name: 'Scheduled Reports', basic: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Administration',
    features: [
      { name: 'User Seats', basic: 'Up to 10', pro: 'Up to 25', enterprise: 'Custom' },
      { name: 'Multi-Location Support', basic: false, pro: false, enterprise: true },
      { name: 'Aggregated Reporting', basic: false, pro: false, enterprise: true },
      { name: 'Custom Branding', basic: false, pro: false, enterprise: true },
      { name: 'SSO Integration', basic: false, pro: false, enterprise: true },
      { name: 'API Access', basic: false, pro: false, enterprise: true },
      { name: 'Dedicated Support', basic: false, pro: false, enterprise: true },
    ],
  },
];
