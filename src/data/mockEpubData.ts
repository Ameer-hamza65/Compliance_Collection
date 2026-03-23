// Mock EPUB data representing medical books with chapters, tags, and metadata

export interface MedicalTag {
  id: string;
  name: string;
  category: 'condition' | 'drug' | 'procedure' | 'anatomy' | 'specialty';
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
  tags: string[];
}

export interface EpubBook {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher: string;
  isbn: string;
  publishedYear: number;
  edition?: string;
  coverColor: string;
  price: number;
  description: string;
  tableOfContents: Chapter[];
  tags: string[];
  specialty: string;
  accessCount: number;
  searchCount: number;
}

export const medicalTags: MedicalTag[] = [
  // Conditions
  { id: 'diabetes', name: 'Diabetes Mellitus', category: 'condition' },
  { id: 'hypertension', name: 'Hypertension', category: 'condition' },
  { id: 'heart-failure', name: 'Heart Failure', category: 'condition' },
  { id: 'copd', name: 'COPD', category: 'condition' },
  { id: 'asthma', name: 'Asthma', category: 'condition' },
  { id: 'pneumonia', name: 'Pneumonia', category: 'condition' },
  { id: 'sepsis', name: 'Sepsis', category: 'condition' },
  { id: 'stroke', name: 'Stroke', category: 'condition' },
  { id: 'mi', name: 'Myocardial Infarction', category: 'condition' },
  { id: 'arrhythmia', name: 'Cardiac Arrhythmia', category: 'condition' },
  
  // Drugs
  { id: 'metformin', name: 'Metformin', category: 'drug' },
  { id: 'insulin', name: 'Insulin', category: 'drug' },
  { id: 'lisinopril', name: 'Lisinopril', category: 'drug' },
  { id: 'aspirin', name: 'Aspirin', category: 'drug' },
  { id: 'warfarin', name: 'Warfarin', category: 'drug' },
  { id: 'beta-blockers', name: 'Beta Blockers', category: 'drug' },
  { id: 'statins', name: 'Statins', category: 'drug' },
  { id: 'antibiotics', name: 'Antibiotics', category: 'drug' },
  
  // Procedures
  { id: 'ecg', name: 'ECG/EKG', category: 'procedure' },
  { id: 'catheterization', name: 'Cardiac Catheterization', category: 'procedure' },
  { id: 'intubation', name: 'Intubation', category: 'procedure' },
  { id: 'dialysis', name: 'Dialysis', category: 'procedure' },
  { id: 'biopsy', name: 'Biopsy', category: 'procedure' },
  
  // Anatomy
  { id: 'heart', name: 'Heart', category: 'anatomy' },
  { id: 'lungs', name: 'Lungs', category: 'anatomy' },
  { id: 'kidney', name: 'Kidney', category: 'anatomy' },
  { id: 'liver', name: 'Liver', category: 'anatomy' },
  { id: 'brain', name: 'Brain', category: 'anatomy' },
  
  // Specialties
  { id: 'cardiology', name: 'Cardiology', category: 'specialty' },
  { id: 'pulmonology', name: 'Pulmonology', category: 'specialty' },
  { id: 'endocrinology', name: 'Endocrinology', category: 'specialty' },
  { id: 'nephrology', name: 'Nephrology', category: 'specialty' },
  { id: 'neurology', name: 'Neurology', category: 'specialty' },
  { id: 'emergency', name: 'Emergency Medicine', category: 'specialty' },
];

export const epubBooks: EpubBook[] = [
  {
    id: 'harrison-internal',
    title: "Harrison's Principles of Internal Medicine",
    subtitle: "21st Edition",
    authors: ["J. Larry Jameson", "Anthony S. Fauci", "Dennis L. Kasper"],
    publisher: "McGraw-Hill Education",
    isbn: "978-1264268504",
    publishedYear: 2022,
    edition: "21st",
    coverColor: "hsl(213 50% 25%)",
    price: 189.99,
    description: "The definitive resource for internal medicine, covering pathophysiology, diagnosis, and treatment of diseases across all organ systems.",
    specialty: "Internal Medicine",
    accessCount: 15420,
    searchCount: 8934,
    tags: ['cardiology', 'pulmonology', 'endocrinology', 'nephrology', 'neurology'],
    tableOfContents: [
      {
        id: 'harrison-ch1',
        title: "Chapter 1: The Practice of Medicine",
        content: "Medicine is a profession that requires a deep understanding of science, empathy for patients, and commitment to lifelong learning. The practice of medicine involves clinical reasoning, evidence-based decision making, and the integration of patient values into treatment plans. Modern physicians must navigate complex healthcare systems while maintaining the fundamental doctor-patient relationship that has defined medicine for centuries.",
        pageNumber: 1,
        tags: ['emergency']
      },
      {
        id: 'harrison-ch254',
        title: "Chapter 254: Diabetes Mellitus: Diagnosis, Classification, and Pathophysiology",
        content: "Diabetes mellitus comprises a group of metabolic disorders characterized by hyperglycemia resulting from defects in insulin secretion, insulin action, or both. Type 2 diabetes mellitus (T2DM) accounts for approximately 90-95% of all diabetes cases and is characterized by insulin resistance and progressive beta-cell dysfunction. Initial management includes lifestyle modifications, followed by pharmacotherapy with metformin as first-line treatment. HbA1c targets should be individualized based on patient factors including age, comorbidities, and hypoglycemia risk.",
        pageNumber: 2857,
        tags: ['diabetes', 'metformin', 'insulin', 'endocrinology']
      },
      {
        id: 'harrison-ch273',
        title: "Chapter 273: Hypertensive Vascular Disease",
        content: "Hypertension affects approximately 1.3 billion adults worldwide and is a major risk factor for cardiovascular disease, stroke, and chronic kidney disease. Blood pressure classification includes normal (<120/80 mmHg), elevated (120-129/<80 mmHg), stage 1 hypertension (130-139/80-89 mmHg), and stage 2 hypertension (≥140/90 mmHg). First-line pharmacotherapy includes ACE inhibitors such as lisinopril, ARBs, calcium channel blockers, and thiazide diuretics. Treatment goals and medication selection should consider patient-specific factors including comorbidities and cardiovascular risk profile.",
        pageNumber: 3052,
        tags: ['hypertension', 'lisinopril', 'cardiology', 'heart']
      },
      {
        id: 'harrison-ch279',
        title: "Chapter 279: Heart Failure: Pathophysiology and Diagnosis",
        content: "Heart failure is a clinical syndrome characterized by the inability of the heart to provide adequate cardiac output to meet metabolic demands. The syndrome can result from structural or functional cardiac abnormalities. Classification includes heart failure with reduced ejection fraction (HFrEF, EF ≤40%), heart failure with mildly reduced EF (HFmrEF, EF 41-49%), and heart failure with preserved EF (HFpEF, EF ≥50%). Diagnosis requires integration of clinical symptoms (dyspnea, fatigue, edema), physical examination findings, biomarkers (BNP, NT-proBNP), and imaging (echocardiography). Treatment with beta-blockers, ACE inhibitors, and diuretics has shown mortality benefit in HFrEF.",
        pageNumber: 3124,
        tags: ['heart-failure', 'beta-blockers', 'cardiology', 'heart', 'ecg']
      },
      {
        id: 'harrison-ch305',
        title: "Chapter 305: Acute Myocardial Infarction",
        content: "Acute myocardial infarction (AMI) results from coronary artery occlusion leading to myocardial necrosis. ST-elevation myocardial infarction (STEMI) requires immediate reperfusion therapy, preferably primary percutaneous coronary intervention (PCI) within 90 minutes of first medical contact. Aspirin should be administered immediately along with P2Y12 inhibitors and anticoagulation. Beta-blockers reduce mortality when initiated within 24 hours in hemodynamically stable patients. Cardiac catheterization provides definitive diagnosis and enables intervention.",
        pageNumber: 3256,
        tags: ['mi', 'aspirin', 'beta-blockers', 'catheterization', 'cardiology', 'heart']
      }
    ]
  },
  {
    id: 'braunwald-cardiology',
    title: "Braunwald's Heart Disease",
    subtitle: "A Textbook of Cardiovascular Medicine",
    authors: ["Douglas P. Zipes", "Peter Libby", "Robert O. Bonow"],
    publisher: "Elsevier",
    isbn: "978-0323722193",
    publishedYear: 2022,
    edition: "12th",
    coverColor: "hsl(0 65% 35%)",
    price: 249.99,
    description: "The gold standard reference in cardiovascular medicine, providing comprehensive coverage of heart disease from basic science to clinical practice.",
    specialty: "Cardiology",
    accessCount: 12350,
    searchCount: 7821,
    tags: ['cardiology', 'heart', 'mi', 'arrhythmia', 'heart-failure'],
    tableOfContents: [
      {
        id: 'braunwald-ch13',
        title: "Chapter 13: Electrocardiography",
        content: "The electrocardiogram (ECG) remains the most widely used cardiovascular diagnostic test. A systematic approach to ECG interpretation includes assessment of rate, rhythm, axis, intervals, and waveform morphology. The 12-lead ECG provides information about myocardial ischemia, infarction, chamber enlargement, and conduction abnormalities. ST-segment elevation greater than 1mm in contiguous leads suggests acute transmural ischemia requiring immediate intervention. T-wave inversions may indicate ischemia, strain, or electrolyte abnormalities.",
        pageNumber: 156,
        tags: ['ecg', 'arrhythmia', 'cardiology', 'heart']
      },
      {
        id: 'braunwald-ch26',
        title: "Chapter 26: Cardiac Arrhythmias",
        content: "Cardiac arrhythmias result from disorders of impulse formation, impulse conduction, or both. Atrial fibrillation is the most common sustained arrhythmia, affecting 2-3% of the population. Management includes rate control with beta-blockers or calcium channel blockers, rhythm control with antiarrhythmic drugs or catheter ablation, and anticoagulation with warfarin or direct oral anticoagulants based on CHA2DS2-VASc score. Ventricular tachycardia requires immediate assessment of hemodynamic stability and consideration of implantable cardioverter-defibrillator.",
        pageNumber: 398,
        tags: ['arrhythmia', 'beta-blockers', 'warfarin', 'ecg', 'cardiology', 'heart']
      },
      {
        id: 'braunwald-ch40',
        title: "Chapter 40: Acute Heart Failure Syndromes",
        content: "Acute heart failure represents new onset or worsening of heart failure symptoms requiring urgent medical attention. Clinical presentations include acute pulmonary edema, cardiogenic shock, and acute decompensated chronic heart failure. Initial management focuses on hemodynamic stabilization with vasodilators, diuretics, and inotropes as needed. Identification and treatment of precipitating factors (ischemia, arrhythmia, infection, medication non-adherence) is essential. Patients with cardiogenic shock may require mechanical circulatory support.",
        pageNumber: 612,
        tags: ['heart-failure', 'cardiology', 'heart', 'emergency']
      },
      {
        id: 'braunwald-ch52',
        title: "Chapter 52: Cardiac Catheterization",
        content: "Cardiac catheterization provides direct hemodynamic measurements and angiographic visualization of coronary arteries and cardiac chambers. Indications include evaluation of coronary artery disease, valvular heart disease, and cardiomyopathy. Percutaneous coronary intervention (PCI) can be performed during diagnostic catheterization when significant stenosis is identified. Complications include access site bleeding, contrast nephropathy, and rarely, stroke or myocardial infarction. Radial artery access has reduced vascular complications compared to femoral approach.",
        pageNumber: 756,
        tags: ['catheterization', 'cardiology', 'heart', 'mi']
      }
    ]
  },
  {
    id: 'fishman-pulmonary',
    title: "Fishman's Pulmonary Diseases and Disorders",
    subtitle: "5th Edition",
    authors: ["Michael A. Grippi", "Jack A. Elias", "Jay A. Fishman"],
    publisher: "McGraw-Hill Education",
    isbn: "978-0071807289",
    publishedYear: 2015,
    edition: "5th",
    coverColor: "hsl(200 60% 35%)",
    price: 195.00,
    description: "Comprehensive reference covering the full spectrum of pulmonary medicine from basic science to clinical management of respiratory disorders.",
    specialty: "Pulmonology",
    accessCount: 8920,
    searchCount: 5432,
    tags: ['pulmonology', 'lungs', 'copd', 'asthma', 'pneumonia'],
    tableOfContents: [
      {
        id: 'fishman-ch41',
        title: "Chapter 41: Chronic Obstructive Pulmonary Disease",
        content: "COPD is characterized by persistent airflow limitation that is usually progressive and associated with enhanced chronic inflammatory response in the airways and lungs. The GOLD classification stratifies patients based on spirometry (FEV1), symptoms, and exacerbation history. Smoking cessation is the most effective intervention to slow disease progression. Pharmacotherapy includes inhaled bronchodilators (beta-agonists, anticholinergics) and inhaled corticosteroids for patients with frequent exacerbations. Pulmonary rehabilitation improves exercise capacity and quality of life.",
        pageNumber: 689,
        tags: ['copd', 'lungs', 'pulmonology']
      },
      {
        id: 'fishman-ch45',
        title: "Chapter 45: Asthma",
        content: "Asthma is a heterogeneous disease characterized by chronic airway inflammation, variable airflow obstruction, and bronchial hyperresponsiveness. Diagnosis requires demonstration of variable expiratory airflow limitation. Stepwise therapy begins with inhaled corticosteroids as first-line controller medication, with addition of long-acting beta-agonists for uncontrolled disease. Severe asthma may require biologic therapies targeting specific inflammatory pathways (anti-IgE, anti-IL5, anti-IL4/13). All patients should have an action plan for exacerbation management.",
        pageNumber: 752,
        tags: ['asthma', 'lungs', 'pulmonology']
      },
      {
        id: 'fishman-ch72',
        title: "Chapter 72: Community-Acquired Pneumonia",
        content: "Community-acquired pneumonia (CAP) remains a leading cause of hospitalization and mortality. Common pathogens include Streptococcus pneumoniae, Haemophilus influenzae, and atypical organisms (Mycoplasma, Legionella). Severity assessment using PSI or CURB-65 guides site-of-care decisions. Empiric antibiotics should cover typical and atypical pathogens; common regimens include respiratory fluoroquinolone monotherapy or beta-lactam plus macrolide. Duration of therapy is typically 5-7 days for uncomplicated CAP. Vaccination against pneumococcus and influenza reduces CAP risk.",
        pageNumber: 1156,
        tags: ['pneumonia', 'antibiotics', 'lungs', 'pulmonology', 'sepsis']
      },
      {
        id: 'fishman-ch89',
        title: "Chapter 89: Mechanical Ventilation",
        content: "Mechanical ventilation provides respiratory support for patients with acute respiratory failure. Indications include hypoxemic and hypercapnic respiratory failure, airway protection, and shock. Lung-protective ventilation with low tidal volumes (6 mL/kg ideal body weight) and plateau pressure limitation (<30 cmH2O) improves outcomes in ARDS. Weaning from mechanical ventilation should be attempted daily using spontaneous breathing trials. Prolonged mechanical ventilation is associated with ventilator-associated pneumonia, diaphragm weakness, and delirium.",
        pageNumber: 1423,
        tags: ['intubation', 'pulmonology', 'lungs', 'emergency', 'sepsis']
      }
    ]
  },
  {
    id: 'goldfrank-toxicology',
    title: "Goldfrank's Toxicologic Emergencies",
    subtitle: "11th Edition",
    authors: ["Lewis S. Nelson", "Mary Ann Howland", "Neal A. Lewin"],
    publisher: "McGraw-Hill Education",
    isbn: "978-1259859618",
    publishedYear: 2019,
    edition: "11th",
    coverColor: "hsl(45 80% 40%)",
    price: 165.00,
    description: "The definitive reference for medical toxicology, essential for managing poisoning and drug overdose in emergency settings.",
    specialty: "Emergency Medicine / Toxicology",
    accessCount: 6540,
    searchCount: 4123,
    tags: ['emergency', 'warfarin', 'aspirin'],
    tableOfContents: [
      {
        id: 'goldfrank-ch36',
        title: "Chapter 36: Anticoagulants",
        content: "Anticoagulant toxicity is increasingly common with widespread use of warfarin and direct oral anticoagulants. Warfarin toxicity presents with bleeding and elevated INR; management includes vitamin K and prothrombin complex concentrate for severe bleeding. DOAC reversal agents include idarucizumab for dabigatran and andexanet alfa for factor Xa inhibitors. Risk of bleeding correlates with supratherapeutic drug levels, concurrent antiplatelet therapy, and patient factors including renal function and age.",
        pageNumber: 523,
        tags: ['warfarin', 'emergency', 'aspirin']
      },
      {
        id: 'goldfrank-ch37',
        title: "Chapter 37: Salicylates",
        content: "Salicylate (aspirin) toxicity causes a characteristic clinical syndrome of tinnitus, hyperpnea, mixed acid-base disturbance, and altered mental status. Chronic toxicity is more insidious and often initially misdiagnosed. Serum salicylate levels and arterial blood gas help guide management. Treatment includes activated charcoal if recent ingestion, urinary alkalinization to enhance elimination, and hemodialysis for severe poisoning (levels >100 mg/dL, renal failure, pulmonary edema, severe acidemia). Do not give aspirin toxicity patients vitamin K as it is not beneficial.",
        pageNumber: 548,
        tags: ['aspirin', 'emergency', 'dialysis']
      },
      {
        id: 'goldfrank-ch69',
        title: "Chapter 69: Sepsis",
        content: "Sepsis is life-threatening organ dysfunction caused by dysregulated host response to infection. Early recognition and aggressive resuscitation are essential. The Surviving Sepsis Campaign guidelines emphasize the 'hour-1 bundle': measure lactate, obtain blood cultures, administer broad-spectrum antibiotics, begin fluid resuscitation for hypotension or lactate ≥4 mmol/L, and start vasopressors if hypotensive after fluids. Source control should be achieved as soon as feasible. Mortality increases with each hour of delay in antibiotic administration.",
        pageNumber: 1089,
        tags: ['sepsis', 'antibiotics', 'emergency']
      }
    ]
  },
  {
    id: 'williams-endocrinology',
    title: "Williams Textbook of Endocrinology",
    subtitle: "14th Edition",
    authors: ["Shlomo Melmed", "Kenneth S. Polonsky", "P. Reed Larsen"],
    publisher: "Elsevier",
    isbn: "978-0323555968",
    publishedYear: 2020,
    edition: "14th",
    coverColor: "hsl(280 50% 40%)",
    price: 199.00,
    description: "Authoritative reference in endocrinology covering hormone physiology, diabetes, thyroid disorders, and metabolic diseases.",
    specialty: "Endocrinology",
    accessCount: 7830,
    searchCount: 4567,
    tags: ['endocrinology', 'diabetes', 'insulin', 'metformin'],
    tableOfContents: [
      {
        id: 'williams-ch34',
        title: "Chapter 34: Type 2 Diabetes Mellitus",
        content: "Type 2 diabetes mellitus is characterized by insulin resistance and relative insulin deficiency. Pathophysiology involves decreased insulin sensitivity in muscle, liver, and adipose tissue, combined with progressive beta-cell failure. Metformin remains first-line pharmacotherapy due to efficacy, safety, low cost, and potential cardiovascular benefit. SGLT2 inhibitors and GLP-1 receptor agonists have demonstrated cardiovascular and renal protection in high-risk patients. Insulin therapy is indicated when glycemic goals are not achieved with non-insulin agents.",
        pageNumber: 1367,
        tags: ['diabetes', 'metformin', 'insulin', 'endocrinology']
      },
      {
        id: 'williams-ch35',
        title: "Chapter 35: Hypoglycemia",
        content: "Hypoglycemia in diabetic patients most commonly results from insulin or insulin secretagogue therapy. Whipple's triad (symptoms consistent with hypoglycemia, low plasma glucose, symptom resolution with glucose correction) confirms the diagnosis. Severe hypoglycemia requires assistance from another person and is a marker for increased mortality risk. Prevention strategies include patient education, glucose monitoring, and individualization of glycemic targets. For insulin-treated patients, hypoglycemia unawareness may develop with recurrent episodes.",
        pageNumber: 1412,
        tags: ['diabetes', 'insulin', 'endocrinology']
      },
      {
        id: 'williams-ch38',
        title: "Chapter 38: Diabetic Kidney Disease",
        content: "Diabetic kidney disease (DKD) affects 40% of patients with diabetes and is the leading cause of end-stage renal disease. Screening with urine albumin-to-creatinine ratio and estimated GFR should be performed annually. ACE inhibitors or ARBs are first-line therapy for albuminuric DKD. SGLT2 inhibitors provide additional renal protection independent of glycemic control. Progression to ESRD requires renal replacement therapy with dialysis or transplantation. Glycemic and blood pressure control slow DKD progression.",
        pageNumber: 1489,
        tags: ['diabetes', 'nephrology', 'kidney', 'dialysis', 'lisinopril']
      }
    ]
  },
  {
    id: 'adams-neurology',
    title: "Adams and Victor's Principles of Neurology",
    subtitle: "11th Edition",
    authors: ["Allan H. Ropper", "Martin A. Samuels", "Joshua P. Klein"],
    publisher: "McGraw-Hill Education",
    isbn: "978-0071842617",
    publishedYear: 2019,
    edition: "11th",
    coverColor: "hsl(340 50% 35%)",
    price: 175.00,
    description: "Classic neurology text covering the full spectrum of neurological disorders with emphasis on clinical reasoning and diagnosis.",
    specialty: "Neurology",
    accessCount: 9120,
    searchCount: 5678,
    tags: ['neurology', 'brain', 'stroke'],
    tableOfContents: [
      {
        id: 'adams-ch34',
        title: "Chapter 34: Cerebrovascular Diseases",
        content: "Stroke is the fifth leading cause of death and the leading cause of adult disability. Ischemic stroke accounts for 87% of cases and results from arterial occlusion by thrombosis or embolism. The NIH Stroke Scale quantifies neurological deficit severity. Time-sensitive treatment includes IV alteplase within 4.5 hours and mechanical thrombectomy within 24 hours for large vessel occlusion. Secondary prevention includes antiplatelet therapy with aspirin, blood pressure control, statin therapy, and lifestyle modifications. Hemorrhagic stroke requires blood pressure management and reversal of anticoagulation.",
        pageNumber: 778,
        tags: ['stroke', 'brain', 'neurology', 'aspirin', 'statins', 'warfarin']
      },
      {
        id: 'adams-ch35',
        title: "Chapter 35: Intracranial Hemorrhage",
        content: "Intracerebral hemorrhage (ICH) accounts for 10-15% of all strokes but carries higher mortality than ischemic stroke. Hypertension is the most common cause. Initial management includes airway protection, blood pressure reduction (targeting SBP <140 mmHg), and reversal of anticoagulation. Surgical evacuation may be considered for cerebellar hemorrhage with brainstem compression or large lobar hemorrhage with deterioration. Intraventricular extension and hydrocephalus may require external ventricular drainage. Secondary prevention focuses on blood pressure control.",
        pageNumber: 823,
        tags: ['stroke', 'brain', 'neurology', 'hypertension', 'warfarin']
      },
      {
        id: 'adams-ch38',
        title: "Chapter 38: Cranial Nerve Disorders",
        content: "Cranial nerve disorders present with characteristic clinical syndromes based on the affected nerve. Facial nerve palsy (Bell's palsy) is the most common cranial mononeuropathy, typically idiopathic and treated with corticosteroids. Trigeminal neuralgia causes severe episodic facial pain and responds to carbamazepine. Oculomotor nerve palsy may indicate posterior communicating artery aneurysm or diabetic mononeuropathy. Systematic examination of cranial nerve function helps localize lesions within the brainstem or along the peripheral nerve course.",
        pageNumber: 912,
        tags: ['neurology', 'brain', 'diabetes']
      }
    ]
  },
  {
    id: 'brenner-nephrology',
    title: "Brenner and Rector's The Kidney",
    subtitle: "11th Edition",
    authors: ["Alan S. L. Yu", "Glenn M. Chertow", "Valerie Luyckx"],
    publisher: "Elsevier",
    isbn: "978-0323532655",
    publishedYear: 2020,
    edition: "11th",
    coverColor: "hsl(150 45% 35%)",
    price: 299.00,
    description: "The definitive nephrology reference covering kidney physiology, acute and chronic kidney disease, and renal replacement therapies.",
    specialty: "Nephrology",
    accessCount: 5670,
    searchCount: 3456,
    tags: ['nephrology', 'kidney', 'dialysis', 'hypertension'],
    tableOfContents: [
      {
        id: 'brenner-ch31',
        title: "Chapter 31: Acute Kidney Injury",
        content: "Acute kidney injury (AKI) is defined by acute rise in serum creatinine or reduction in urine output. KDIGO staging classifies AKI severity. Prerenal azotemia from volume depletion is most common, followed by intrinsic renal disease and postrenal obstruction. Evaluation includes urinalysis, fractional excretion of sodium, and renal ultrasound. Management focuses on treating underlying cause, avoiding nephrotoxins, and maintaining euvolemia. Indications for dialysis include refractory volume overload, severe hyperkalemia, metabolic acidosis, and uremic symptoms.",
        pageNumber: 891,
        tags: ['kidney', 'nephrology', 'dialysis']
      },
      {
        id: 'brenner-ch32',
        title: "Chapter 32: Chronic Kidney Disease",
        content: "Chronic kidney disease (CKD) is defined as kidney damage or GFR <60 mL/min/1.73m² for ≥3 months. Diabetes and hypertension are the most common causes. CKD staging by GFR guides monitoring frequency and complications management. ACE inhibitors or ARBs slow CKD progression in proteinuric patients. Management includes blood pressure control, glycemic control in diabetic nephropathy, dietary protein restriction, and treatment of complications (anemia, mineral bone disease, metabolic acidosis). Preparation for renal replacement therapy should begin at stage 4 CKD.",
        pageNumber: 934,
        tags: ['kidney', 'nephrology', 'diabetes', 'hypertension', 'lisinopril', 'dialysis']
      },
      {
        id: 'brenner-ch58',
        title: "Chapter 58: Hemodialysis",
        content: "Hemodialysis removes uremic toxins and excess fluid through diffusion and convection across a semipermeable membrane. Vascular access options include arteriovenous fistula (preferred), arteriovenous graft, and central venous catheter. Standard in-center hemodialysis is performed three times weekly for 3-4 hours. Complications include hypotension, cramping, access dysfunction, and infection. Adequacy is assessed by Kt/V and urea reduction ratio. Home hemodialysis and more frequent dialysis schedules may improve quality of life and outcomes in selected patients.",
        pageNumber: 1567,
        tags: ['dialysis', 'kidney', 'nephrology']
      }
    ]
  },
  {
    id: 'tintinalli-emergency',
    title: "Tintinalli's Emergency Medicine",
    subtitle: "A Comprehensive Study Guide, 9th Edition",
    authors: ["Judith E. Tintinalli", "O. John Ma", "Donald M. Yealy"],
    publisher: "McGraw-Hill Education",
    isbn: "978-1260019933",
    publishedYear: 2020,
    edition: "9th",
    coverColor: "hsl(25 85% 45%)",
    price: 175.00,
    description: "Essential emergency medicine reference covering acute presentations, trauma, toxicology, and critical care in the emergency department.",
    specialty: "Emergency Medicine",
    accessCount: 11250,
    searchCount: 6789,
    tags: ['emergency', 'sepsis', 'mi', 'stroke', 'intubation'],
    tableOfContents: [
      {
        id: 'tintinalli-ch6',
        title: "Chapter 6: Airway Management",
        content: "Airway management is a core emergency medicine competency. Rapid sequence intubation (RSI) is the preferred method for emergency airway control in patients with intact airway reflexes. Preoxygenation with high-flow oxygen, patient positioning, and preparation of backup devices are essential. Common induction agents include etomidate and ketamine; succinylcholine and rocuronium are used for paralysis. Video laryngoscopy improves first-pass success rates. Supraglottic airways provide rescue airway options when intubation fails. Cricothyrotomy is the surgical airway of last resort.",
        pageNumber: 67,
        tags: ['intubation', 'emergency']
      },
      {
        id: 'tintinalli-ch52',
        title: "Chapter 52: Acute Coronary Syndromes",
        content: "Acute coronary syndromes (ACS) represent a spectrum from unstable angina to STEMI. ECG and serial troponins are essential for diagnosis and risk stratification. STEMI requires immediate reperfusion therapy with primary PCI or fibrinolytics if PCI not available. Initial treatment for all ACS includes aspirin, P2Y12 inhibitor, anticoagulation, and high-intensity statin. Beta-blockers should be initiated within 24 hours if no contraindications. Risk stratification with HEART or TIMI score guides disposition decisions for non-STEMI presentations.",
        pageNumber: 423,
        tags: ['mi', 'aspirin', 'beta-blockers', 'ecg', 'cardiology', 'emergency', 'heart']
      },
      {
        id: 'tintinalli-ch146',
        title: "Chapter 146: Sepsis Syndromes",
        content: "Sepsis is defined as life-threatening organ dysfunction due to dysregulated host response to infection, identified by increase of ≥2 SOFA points. Septic shock requires vasopressors to maintain MAP ≥65 mmHg and lactate >2 mmol/L despite adequate resuscitation. Early goal-directed therapy emphasizes rapid recognition, early antibiotics (within 1 hour), crystalloid fluid bolus (30 mL/kg), and source control. Norepinephrine is first-line vasopressor. Failure to rapidly initiate appropriate therapy significantly increases mortality.",
        pageNumber: 1023,
        tags: ['sepsis', 'antibiotics', 'emergency']
      },
      {
        id: 'tintinalli-ch155',
        title: "Chapter 155: Stroke and Transient Ischemic Attack",
        content: "Acute ischemic stroke is a time-sensitive emergency where 'time is brain.' The initial evaluation includes rapid neurological assessment (NIHSS), blood glucose, and non-contrast CT to exclude hemorrhage. IV alteplase is indicated within 4.5 hours of symptom onset in eligible patients. Mechanical thrombectomy extends treatment window up to 24 hours for large vessel occlusion with salvageable tissue. Blood pressure management varies based on thrombolytic eligibility. TIA requires urgent evaluation due to high early stroke risk.",
        pageNumber: 1134,
        tags: ['stroke', 'brain', 'neurology', 'emergency']
      }
    ]
  },
  // Additional books for enterprise compliance collections
  {
    id: 'morgan-anesthesia',
    title: "Morgan & Mikhail's Clinical Anesthesiology",
    subtitle: "7th Edition",
    authors: ["John F. Butterworth", "David C. Mackey", "John D. Wasnick"],
    publisher: "McGraw-Hill Education",
    isbn: "978-1260473797",
    publishedYear: 2022,
    edition: "7th",
    coverColor: "hsl(220 55% 40%)",
    price: 145.00,
    description: "The definitive guide to anesthesia practice, covering preoperative evaluation, anesthetic techniques, pain management, and critical care.",
    specialty: "Anesthesiology",
    accessCount: 8450,
    searchCount: 5123,
    tags: ['anesthesia', 'intubation', 'emergency'],
    tableOfContents: [
      {
        id: 'morgan-ch5',
        title: "Chapter 5: Airway Management",
        content: "Successful airway management is the cornerstone of safe anesthetic practice. The anesthesiologist must be skilled in mask ventilation, laryngoscopy, intubation, and surgical airway techniques. Preoxygenation maximizes oxygen reserves before induction. Difficult airway algorithms guide management when initial techniques fail. Video laryngoscopy has improved success rates for difficult intubations. Supraglottic airways provide alternatives when intubation is not possible or not necessary.",
        pageNumber: 87,
        tags: ['intubation', 'emergency', 'anesthesia']
      },
      {
        id: 'morgan-ch8',
        title: "Chapter 8: Intravenous Anesthetics",
        content: "Intravenous anesthetics provide rapid induction and can be used for maintenance of anesthesia. Propofol is the most commonly used induction agent due to its rapid onset and recovery profile. Etomidate provides hemodynamic stability for high-risk patients. Ketamine produces dissociative anesthesia with preserved airway reflexes and is useful for procedural sedation. Understanding pharmacokinetics and drug interactions is essential for safe administration.",
        pageNumber: 145,
        tags: ['anesthesia']
      },
      {
        id: 'morgan-ch44',
        title: "Chapter 44: Malignant Hyperthermia Protocol",
        content: "Malignant hyperthermia (MH) is a life-threatening pharmacogenetic disorder triggered by volatile anesthetics and succinylcholine. Early signs include unexplained tachycardia, rising end-tidal CO2, and muscle rigidity. Immediate treatment includes discontinuing triggering agents, hyperventilation with 100% oxygen, and dantrolene administration. Cooling measures and treatment of hyperkalemia, acidosis, and arrhythmias are critical. MH-susceptible patients require trigger-free anesthesia and extended postoperative monitoring.",
        pageNumber: 823,
        tags: ['emergency', 'anesthesia']
      },
      {
        id: 'morgan-ch47',
        title: "Chapter 47: Anesthesia for Cardiac Surgery",
        content: "Cardiac anesthesia requires thorough understanding of cardiovascular physiology and hemodynamic monitoring. Preoperative assessment focuses on ventricular function, coronary anatomy, and valvular pathology. Transesophageal echocardiography guides intraoperative management. Cardiopulmonary bypass requires anticoagulation with heparin and careful temperature management. Separation from bypass may require inotropic support or mechanical circulatory assistance. Postoperative care emphasizes hemodynamic stability and early extubation protocols.",
        pageNumber: 912,
        tags: ['cardiology', 'heart', 'anesthesia']
      }
    ]
  },
  {
    id: 'sabiston-surgery',
    title: "Sabiston Textbook of Surgery",
    subtitle: "The Biological Basis of Modern Surgical Practice, 21st Edition",
    authors: ["Courtney M. Townsend Jr.", "R. Daniel Beauchamp", "B. Mark Evers"],
    publisher: "Elsevier",
    isbn: "978-0323640626",
    publishedYear: 2022,
    edition: "21st",
    coverColor: "hsl(160 50% 35%)",
    price: 229.00,
    description: "The gold standard surgical reference covering principles, techniques, and evidence-based management of surgical diseases across all specialties.",
    specialty: "Surgery",
    accessCount: 9870,
    searchCount: 6234,
    tags: ['surgery', 'emergency'],
    tableOfContents: [
      {
        id: 'sabiston-ch4',
        title: "Chapter 4: Surgical Hemostasis and Blood Transfusion",
        content: "Surgical hemostasis requires understanding of the coagulation cascade and perioperative bleeding management. Preoperative assessment identifies patients at risk for bleeding complications. Intraoperative techniques include electrocautery, suture ligation, hemostatic agents, and damage control surgery for life-threatening hemorrhage. Massive transfusion protocols guide balanced blood product administration. Point-of-care coagulation testing allows targeted replacement therapy. Perioperative anticoagulation management requires coordination between surgical and medical teams.",
        pageNumber: 89,
        tags: ['surgery', 'warfarin', 'emergency']
      },
      {
        id: 'sabiston-ch12',
        title: "Chapter 12: Surgical Site Infection Prevention",
        content: "Surgical site infections (SSI) are preventable complications with significant morbidity and cost. Risk factors include patient factors (diabetes, obesity, immunosuppression) and procedural factors (contamination class, operative time). Prevention bundles include appropriate antibiotic prophylaxis, normothermia, glycemic control, and proper skin preparation. Treatment of established infection may require drainage, debridement, and targeted antimicrobial therapy. Antimicrobial stewardship programs optimize antibiotic use and reduce resistance.",
        pageNumber: 234,
        tags: ['sepsis', 'antibiotics', 'surgery']
      },
      {
        id: 'sabiston-ch15',
        title: "Chapter 15: Patient Positioning in Surgery",
        content: "Proper patient positioning is essential for surgical access while minimizing risk of positioning injuries. Common positions include supine, lateral decubitus, prone, and lithotomy. Pressure points must be padded to prevent nerve injury and skin breakdown. Brachial plexus injury can result from arm abduction beyond 90 degrees. Perioperative vision loss is rare but devastating and associated with prolonged prone positioning. Regular assessment during long procedures and coordination between surgical and anesthesia teams are essential for patient safety.",
        pageNumber: 312,
        tags: ['surgery']
      },
      {
        id: 'sabiston-ch20',
        title: "Chapter 20: Acute Appendicitis",
        content: "Acute appendicitis is the most common surgical emergency. Classic presentation includes periumbilical pain migrating to right lower quadrant, anorexia, and leukocytosis. CT imaging has high sensitivity and specificity. Laparoscopic appendectomy is the preferred approach in most patients. Nonoperative management with antibiotics may be appropriate for uncomplicated appendicitis in selected patients. Perforation increases morbidity and requires broader antibiotic coverage and potential interval appendectomy.",
        pageNumber: 456,
        tags: ['surgery', 'emergency', 'antibiotics']
      }
    ]
  },
  {
    id: 'periop-nursing',
    title: "Alexander's Care of the Patient in Surgery",
    subtitle: "16th Edition",
    authors: ["Jane C. Rothrock"],
    publisher: "Elsevier",
    isbn: "978-0323479141",
    publishedYear: 2019,
    edition: "16th",
    coverColor: "hsl(300 40% 40%)",
    price: 125.00,
    description: "The essential perioperative nursing reference covering surgical procedures, patient safety, and evidence-based nursing practices in the OR.",
    specialty: "Perioperative Nursing",
    accessCount: 6780,
    searchCount: 4012,
    tags: ['surgery', 'perioperative'],
    tableOfContents: [
      {
        id: 'periop-ch2',
        title: "Chapter 2: Patient Safety and Risk Management",
        content: "Patient safety in the perioperative environment requires systematic approaches to prevent adverse events. The surgical safety checklist has demonstrated significant reductions in complications and mortality. Time-out procedures verify correct patient, site, and procedure. Retained surgical items are preventable never events requiring count protocols and imaging when counts are incorrect. Handoff communication between perioperative team members must include critical patient information. A culture of safety encourages reporting of near misses and adverse events.",
        pageNumber: 34,
        tags: ['surgery', 'perioperative']
      },
      {
        id: 'periop-ch5',
        title: "Chapter 5: Infection Prevention and Control",
        content: "Infection prevention in surgery requires adherence to aseptic technique and environmental controls. Surgical hand antisepsis significantly reduces microbial load. Sterile gowning and gloving techniques maintain surgical field sterility. Environmental factors include HEPA filtration, positive pressure ventilation, and limiting traffic. Surgical site preparation with chlorhexidine-alcohol is preferred. Antimicrobial prophylaxis timing within 60 minutes of incision optimizes tissue levels. Postoperative surveillance identifies SSIs requiring intervention.",
        pageNumber: 89,
        tags: ['sepsis', 'surgery', 'antibiotics', 'perioperative']
      },
      {
        id: 'periop-ch8',
        title: "Chapter 8: Patient Positioning Protocols",
        content: "Safe patient positioning requires understanding of anatomy, physiology, and equipment. Positioning devices must be properly maintained and applied. Documentation includes patient assessment before and after positioning. High-risk patients include elderly, malnourished, and those with peripheral vascular disease. Pressure injury prevention includes padding bony prominences and limiting procedure duration when possible. Team communication ensures awareness of positioning changes during the procedure.",
        pageNumber: 167,
        tags: ['surgery', 'perioperative']
      },
      {
        id: 'periop-ch22',
        title: "Chapter 22: Gastrointestinal Surgery",
        content: "Gastrointestinal surgical procedures require specialized instrumentation and nursing knowledge. Bowel preparation protocols vary by procedure and surgeon preference. Enhanced recovery protocols (ERAS) improve outcomes through multimodal interventions. Ostomy care education begins preoperatively with stoma site marking. Anastomotic leak is a serious complication requiring early recognition and intervention. Postoperative ileus management includes early ambulation and restricted opioid use.",
        pageNumber: 456,
        tags: ['surgery', 'perioperative']
      }
    ]
  },
  {
    id: 'acsm-guidelines',
    title: "ACSM's Guidelines for Exercise Testing and Prescription",
    subtitle: "11th Edition",
    authors: ["American College of Sports Medicine", "Gary Liguori"],
    publisher: "Wolters Kluwer",
    isbn: "978-1975150181",
    publishedYear: 2022,
    edition: "11th",
    coverColor: "hsl(38 85% 45%)",
    price: 79.00,
    description: "Evidence-based guidelines for clinical exercise testing, prescription, and program implementation for health and fitness professionals.",
    specialty: "Sports Medicine / Preventive Medicine",
    accessCount: 4560,
    searchCount: 2890,
    tags: ['cardiology', 'pulmonology'],
    tableOfContents: [
      {
        id: 'acsm-ch3',
        title: "Chapter 3: Pre-Exercise Evaluation",
        content: "Pre-exercise evaluation identifies individuals who may benefit from medical clearance before initiating or progressing exercise programs. The ACSM pre-participation screening algorithm uses current physical activity level, signs/symptoms, and desired exercise intensity to guide recommendations. Cardiovascular disease risk assessment uses traditional risk factors. Exercise testing may be indicated for higher-risk individuals. Contraindications to exercise testing include unstable angina, uncontrolled arrhythmias, and acute systemic illness.",
        pageNumber: 56,
        tags: ['cardiology', 'heart']
      },
      {
        id: 'acsm-ch5',
        title: "Chapter 5: Clinical Exercise Testing",
        content: "Clinical exercise testing provides diagnostic and prognostic information for cardiovascular and pulmonary diseases. Treadmill protocols (Bruce, modified Bruce, Naughton) are most commonly used. ECG monitoring detects ischemic changes and arrhythmias. Blood pressure response provides information about cardiovascular function. Cardiopulmonary exercise testing with metabolic measurements provides objective assessment of functional capacity. Interpretation requires integration of hemodynamic, ECG, and symptom data.",
        pageNumber: 98,
        tags: ['ecg', 'cardiology', 'heart', 'pulmonology']
      },
      {
        id: 'acsm-ch7',
        title: "Chapter 7: Exercise Prescription",
        content: "Exercise prescription follows the FITT-VP framework: Frequency, Intensity, Time, Type, Volume, and Progression. Aerobic exercise recommendations include 150 minutes per week of moderate intensity or 75 minutes of vigorous intensity. Resistance training should target major muscle groups 2-3 days per week. Flexibility and neuromotor exercises complete a comprehensive program. Individualization considers health status, fitness level, and goals. Progression should be gradual to minimize injury risk and optimize adherence.",
        pageNumber: 145,
        tags: ['cardiology']
      }
    ]
  }
];

// Trending topics based on search frequency
export const trendingTopics = [
  { topic: 'Diabetes Management', count: 1234, growth: '+12%' },
  { topic: 'Heart Failure Treatment', count: 987, growth: '+8%' },
  { topic: 'Sepsis Protocols', count: 876, growth: '+15%' },
  { topic: 'Anticoagulation Therapy', count: 743, growth: '+5%' },
  { topic: 'COPD Exacerbations', count: 654, growth: '+3%' },
  { topic: 'Acute Stroke Care', count: 612, growth: '+18%' },
  { topic: 'Insulin Therapy', count: 589, growth: '+7%' },
  { topic: 'Cardiac Arrhythmias', count: 523, growth: '+4%' },
];

// Function to search across all books
export function searchBooks(query: string): Array<{
  book: EpubBook;
  chapter: Chapter;
  snippet: string;
  relevanceScore: number;
}> {
  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/);
  const results: Array<{
    book: EpubBook;
    chapter: Chapter;
    snippet: string;
    relevanceScore: number;
  }> = [];

  for (const book of epubBooks) {
    for (const chapter of book.tableOfContents) {
      let relevanceScore = 0;
      const contentLower = chapter.content.toLowerCase();
      const titleLower = chapter.title.toLowerCase();
      
      // Check for query matches
      for (const term of queryTerms) {
        // Title match (highest weight)
        if (titleLower.includes(term)) {
          relevanceScore += 30;
        }
        
        // Content match
        const contentMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
        relevanceScore += contentMatches * 5;
        
        // Tag match (high weight)
        const tagMatches = chapter.tags.filter(tag => 
          tag.toLowerCase().includes(term) || 
          medicalTags.find(t => t.id === tag)?.name.toLowerCase().includes(term)
        ).length;
        relevanceScore += tagMatches * 20;
        
        // Book specialty match
        if (book.specialty.toLowerCase().includes(term)) {
          relevanceScore += 15;
        }
      }

      if (relevanceScore > 0) {
        // Extract relevant snippet
        let snippetStart = 0;
        for (const term of queryTerms) {
          const idx = contentLower.indexOf(term);
          if (idx > -1) {
            snippetStart = Math.max(0, idx - 50);
            break;
          }
        }
        const snippet = chapter.content.slice(snippetStart, snippetStart + 200) + '...';

        results.push({
          book,
          chapter,
          snippet,
          relevanceScore
        });
      }
    }
  }

  // Sort by relevance score
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Get related chapters based on tags
export function getRelatedChapters(chapterId: string, limit = 5): Array<{
  book: EpubBook;
  chapter: Chapter;
}> {
  let sourceChapter: Chapter | null = null;
  
  for (const book of epubBooks) {
    for (const chapter of book.tableOfContents) {
      if (chapter.id === chapterId) {
        sourceChapter = chapter;
        break;
      }
    }
    if (sourceChapter) break;
  }

  if (!sourceChapter) return [];

  const related: Array<{ book: EpubBook; chapter: Chapter; score: number }> = [];
  
  for (const book of epubBooks) {
    for (const chapter of book.tableOfContents) {
      if (chapter.id === chapterId) continue;
      
      const sharedTags = chapter.tags.filter(tag => sourceChapter!.tags.includes(tag));
      if (sharedTags.length > 0) {
        related.push({ book, chapter, score: sharedTags.length });
      }
    }
  }

  return related
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ book, chapter }) => ({ book, chapter }));
}
