const reviewed = "2026-11-19";

export const commonSources = {
  noc: {
    label: "Nepal Ministry of Education NOC portal",
    url: "https://noc.moest.gov.np/",
  },
  remittance: {
    label: "Nepal Rastra Bank foreign exchange information",
    url: "https://www.nrb.org.np/forex/",
  },
};

const sources = {
  australia: {
    visa: { label: "Australian student visa (Home Affairs)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500" },
    fees: { label: "Australian visa pricing estimator (Home Affairs)", url: "https://immi.homeaffairs.gov.au/visas/visa-pricing-estimator" },
    money: { label: "Student visa financial capacity (Home Affairs)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500#Eligibility" },
    study: { label: "Study Australia", url: "https://www.studyaustralia.gov.au/" },
  },
  uk: {
    visa: { label: "UK Student visa (GOV.UK)", url: "https://www.gov.uk/student-visa" },
    money: { label: "UK Student visa money requirements (GOV.UK)", url: "https://www.gov.uk/student-visa/money" },
    fees: { label: "UK visa application fee (GOV.UK)", url: "https://www.gov.uk/student-visa" },
    health: { label: "UK immigration health surcharge (GOV.UK)", url: "https://www.gov.uk/healthcare-immigration-application/how-much-pay" },
    study: { label: "Study UK (British Council)", url: "https://study-uk.britishcouncil.org/" },
  },
  usa: {
    visa: { label: "Student visa (U.S. Department of State)", url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html" },
    visaFees: { label: "U.S. visa application fees (Department of State)", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html" },
    fees: { label: "I-901 SEVIS fee (U.S. ICE)", url: "https://www.ice.gov/sevis/i901" },
    study: { label: "Study in the States (DHS)", url: "https://studyinthestates.dhs.gov/students" },
  },
  canada: {
    visa: { label: "Apply for a Canadian study permit (IRCC)", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/apply.html" },
    money: { label: "Study permit proof of financial support (IRCC)", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html" },
    fees: { label: "IRCC application fees", url: "https://ircc.canada.ca/english/information/fees/fees.asp" },
    study: { label: "EduCanada", url: "https://www.educanada.ca/index.aspx?lang=eng" },
  },
  japan: {
    visa: { label: "Japan student visa and COE procedures", url: "https://www.studyinjapan.go.jp/en/planning/immigration-procedures/" },
    fees: { label: "Japan visa information (MOFA)", url: "https://www.mofa.go.jp/j_info/visit/visa/index.html" },
    study: { label: "Study in Japan", url: "https://www.studyinjapan.go.jp/en/" },
  },
  "south-korea": {
    visa: { label: "Korea Visa Portal", url: "https://www.visa.go.kr/" },
    fees: { label: "Korea Visa Portal application guidance", url: "https://www.visa.go.kr/openPage.do?MENU_ID=10101" },
    study: { label: "Study in Korea (NIIED)", url: "https://www.studyinkorea.go.kr/en" },
  },
  germany: {
    visa: { label: "Studying in Germany: visa and residence", url: "https://www.make-it-in-germany.com/en/visa-residence/types/studying" },
    money: { label: "DAAD: costs and financing", url: "https://www.daad.de/en/studying-in-germany/living-in-germany/finances/" },
    study: { label: "Study in Germany (DAAD)", url: "https://www.study-in-germany.de/en/" },
  },
  "new-zealand": {
    visa: { label: "Fee Paying Student Visa (Immigration New Zealand)", url: "https://www.immigration.govt.nz/visas/fee-paying-student-visa/" },
    money: { label: "Student visa funds and evidence (Immigration NZ)", url: "https://www.immigration.govt.nz/visas/fee-paying-student-visa/" },
    study: { label: "Study with New Zealand", url: "https://www.studywithnewzealand.govt.nz/" },
  },
  ireland: {
    visa: { label: "Coming to study in Ireland (Immigration Service Delivery)", url: "https://www.irishimmigration.ie/coming-to-study-in-ireland/" },
    money: { label: "Study visa finances (Immigration Service Delivery)", url: "https://www.irishimmigration.ie/coming-to-study-in-ireland/" },
    fees: { label: "Irish visa fees (Immigration Service Delivery)", url: "https://www.irishimmigration.ie/coming-to-study-in-ireland/" },
    study: { label: "Education in Ireland", url: "https://www.educationinireland.com/" },
  },
  india: {
    visa: { label: "India–Nepal travel arrangements (Embassy of India, Kathmandu)", url: "https://www.indembkathmandu.gov.in/" },
    study: { label: "Study in India (Ministry of Education)", url: "https://studyinindia.gov.in/" },
    rules: { label: "India Ministry of External Affairs", url: "https://www.mea.gov.in/" },
  },
};

const profile = (config) => {
  const country = {
    ...config,
    source: sources[config.id],
    lastVerified: reviewed,
    intro: `Use this guide to organize your ${config.name} study plan. Admission, visa, funds, and insurance requirements depend on your course and personal circumstances.`,
  };
  country.fees = country.fees.map((fee) => ({
    ...fee,
    lastVerified: reviewed,
    basis: fee.label.includes("Nepal payment")
      ? "Nepal process"
      : fee.label.includes("Tuition")
        ? "Institution-dependent planning range"
        : fee.label.includes("Health cover")
          ? "Policy / institution dependent"
          : fee.label.includes("Living-funds")
            ? "Funds benchmark — verify case and current amount"
            : /visa|permit|biometrics|sevis/i.test(fee.label)
              ? "Official charge — verify before payment"
              : "Planning guidance",
  }));
  country.sections = makeSections(country);
  return country;
};

function makeSections(country) {
  const { id, name, source } = country;
  const relevantVisa = source.visa;
  const studySource = source.study ?? relevantVisa;
  const feesSource = source.fees ?? relevantVisa;
  const moneySource = source.money ?? relevantVisa;
  const remittanceSource = commonSources.remittance;
  const nocSource = commonSources.noc;
  const nocEligibility = id === "japan"
    ? "Standalone language-study NOC rules may differ for Japan; check Japan-specific eligibility and documents directly in the current portal."
    : "Standalone language courses may require a linked academic program for NOC eligibility; verify the current rule and any destination-specific exception in the portal.";
  const entries = (items) => items.map(([itemId, title, description, itemSource]) => ({
    id: itemId,
    title,
    description,
    source: itemSource,
    lastVerified: reviewed,
  }));
  return [
    {
      id: "academics",
      title: "Academics & Admissions",
      icon: "✳",
      items: entries([
        ["course-shortlist", `Shortlist recognized ${name} institutions and courses`, "Compare course entry criteria, accreditation, location, intake dates, and full tuition directly with each institution.", studySource],
        ["academic-records", "Prepare academic records and equivalence documents", "Gather transcripts and certificates. Ask whether foreign-board or non-NEB qualifications need an equivalence certificate, and arrange translations if required.", studySource],
        ["language-requirements", "Confirm language and admission requirements", "Ask the institution which language tests, scores, portfolio, or prerequisite subjects it accepts.", studySource],
        ["identity-consistency", "Check name and date of birth across all records", "Compare citizenship, passport, transcripts, test scores, offer, and bank records. Resolve spelling/order/date mismatches before submitting applications.", relevantVisa],
        ["offer", "Review your offer, refund policy, and cancellation terms", "Before paying a deposit, visa fee, or tuition, read the institution's written refund and cancellation rules and save a copy.", studySource],
      ]),
    },
    {
      id: "finances",
      title: "Finances & Remittance",
      icon: "↗",
      items: entries([
        ["tuition-plan", "Confirm tuition and first-year payment schedule", "Use your offer and official institution fee schedule; course, campus, and fee status affect the total.", studySource],
        ["funds-evidence", "Prepare funds evidence for your destination", "Check the linked official source for current maintenance amounts, acceptable evidence, and any holding period.", moneySource],
        ["nepal-remittance", "Confirm NOC-linked remittance documents with your bank", "Ask an authorized bank for its current checklist; it may request NOC, offer/admission letter, invoice, passport, sponsor/source-of-funds evidence, and receipts. Requirements vary.", remittanceSource],
        ["payment-receipts", "Keep payment, sponsor, and bank records", "Retain fee receipts, bank transfer evidence, sponsor documents, and correspondence for applications and later checks.", remittanceSource],
      ]),
    },
    {
      id: "noc-visa",
      title: "Nepal NOC & Visa Steps",
      icon: "◎",
      items: entries([
        ["noc-apply", "Check Nepal NOC eligibility, documents, and fee", `Use the Ministry portal for current eligibility, documents, and any fee; do not rely on an old fee estimate. ${nocEligibility}`, nocSource],
        ["visa-application", `Submit the ${country.visaName} application`, "Follow the official application channel and your institution's instructions; keep copies of submitted evidence.", relevantVisa],
        ["biometrics-interview", "Complete biometrics, medical, or interview steps if requested", "Requirements depend on nationality, location, and individual case. Follow official appointment instructions.", feesSource],
        ["decision", "Wait for the decision before booking non-refundable travel", "Monitor official messages and respond within the stated deadline to any further-document request.", relevantVisa],
      ]),
    },
    {
      id: "pre-departure",
      title: "Pre-Departure Items",
      icon: "✈",
      items: entries([
        ["travel-documents", "Prepare travel and enrolment documents", "Keep your passport, visa or entry approval, admission/enrolment records, NOC, and payment evidence accessible.", relevantVisa],
        ["insurance-arrival", "Confirm health cover, accommodation, and arrival plan", "Check country-specific insurance or registration requirements, housing, airport transfer, and institution arrival guidance.", country.insuranceSource ?? studySource],
        ["local-arrangements", "Plan funds access and first-week essentials", "Confirm how to access funds, local registration, phone service, and who to contact at your institution.", studySource],
      ]),
    },
  ];
}

export const countries = {
  australia: profile({
    id: "australia", name: "Australia", flag: "🇦🇺", region: "Oceania", studyTypes: ["University", "Vocational", "English"],
    currency: "AUD", visaName: "Student visa (subclass 500)", insuranceSource: sources.australia.visa,
    tuitionRange: "AUD 20,000–45,000 / year*",
    defaults: { tuition: 2400000, living: 1900000, visa: 350000, travel: 400000 },
    fees: [
      { label: "Student visa", amount: "AUD 2,500 (primary applicant)*", note: "Base charge listed for 1 July 2026. Other applicants or services may add charges; use the official estimator for your passport, application date, and applicant count before paying.", source: sources.australia.fees },
      { label: "Health cover", amount: "OSHC — provider quote", note: "Overseas Student Health Cover is generally required for the visa period; premium depends on provider and cover length.", source: sources.australia.visa },
      { label: "Living-funds benchmark", amount: "AUD 29,710 / 12 months*", note: "Guide benchmark for living costs only; it does not include tuition or travel. Verify the current financial-capacity amount and evidence rules.", source: sources.australia.money },
      { label: "Tuition range", amount: "AUD 20,000–45,000 / year*", note: "Indicative planning range; actual fees vary substantially by qualification, provider, and location.", source: sources.australia.study },
      { label: "Nepal payment / remittance", amount: "NOC + bank documentation", note: "Get the NOC when required; ask an authorized bank for current education-remittance documents, limits, and payment routing.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Choose an eligible provider and course, meet entry requirements, accept the offer, and obtain your Confirmation of Enrolment (CoE)." },
      { title: "NOC & remittance", text: "Check Nepal's NOC process. Coordinate tuition/deposit transfers and keep bank, sponsor, and payment records." },
      { title: "Visa & biometrics", text: "Apply online for subclass 500 with CoE and required evidence. Complete health, biometrics, or other requests if instructed." },
      { title: "Pre-departure", text: "Arrange OSHC, accommodation, travel, and copies of visa, CoE, NOC, and payment documents." },
    ],
    countrySource: sources.australia.visa,
  }),
  uk: profile({
    id: "uk", name: "United Kingdom", flag: "🇬🇧", region: "Europe", studyTypes: ["University", "Vocational", "English"],
    currency: "GBP", visaName: "Student visa", insuranceSource: sources.uk.health,
    tuitionRange: "GBP 11,000–38,000 / year*",
    defaults: { tuition: 2600000, living: 1800000, visa: 500000, travel: 350000 },
    fees: [
      { label: "Student visa", amount: "GBP 558", note: "GOV.UK application fee for applications from outside the UK; recheck before applying.", source: sources.uk.fees },
      { label: "Health cover", amount: "GBP 776 / year", note: "Student Immigration Health Surcharge rate. Total depends on visa duration and is paid with the application.", source: sources.uk.health },
      { label: "Living-funds benchmark", amount: "GBP 1,529/month London; GBP 1,171/month elsewhere (up to 9 months)", note: "Current GOV.UK maintenance amounts; course fees are additional and funds generally need to meet the 28-day rule.", source: sources.uk.money },
      { label: "Tuition range", amount: "GBP 11,000–38,000 / year*", note: "Indicative planning range; exact amount is on your CAS and varies by course and institution.", source: sources.uk.study },
      { label: "Nepal payment / remittance", amount: "NOC + bank documentation", note: "Check NOC eligibility and your bank's current education remittance procedure before making payments.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Apply to a licensed student sponsor, meet academic/English conditions, accept your place, and receive a CAS." },
      { title: "NOC & remittance", text: "Check Nepal NOC steps and pay deposits/tuition using the institution's approved route; retain transfer receipts." },
      { title: "Visa & biometrics", text: "Apply for a Student visa using your CAS and financial evidence, pay the visa fee and IHS, then attend biometrics as directed." },
      { title: "Pre-departure", text: "Wait for the decision, confirm accommodation and travel dates, and carry your passport, visa details, CAS, and NOC." },
    ],
    countrySource: sources.uk.visa,
  }),
  usa: profile({
    id: "usa", name: "United States", flag: "🇺🇸", region: "North America", studyTypes: ["University", "Vocational", "English", "Research"],
    currency: "USD", visaName: "F-1 student visa", tuitionRange: "USD 10,000–45,000 / year*",
    defaults: { tuition: 3000000, living: 2200000, visa: 350000, travel: 450000 },
    fees: [
      { label: "Visa application (MRV)", amount: "USD 185*", note: "Baseline non-petition visa application fee. Check the current F/M schedule for any integrity, reciprocity, or issuance charge and Nepal payment instructions.", source: sources.usa.visaFees },
      { label: "SEVIS I-901 fee", amount: "USD 350 (F/M)", note: "Separate from the visa application fee; pay using the official SEVIS fee channel after receiving your I-20.", source: sources.usa.fees },
      { label: "Health cover", amount: "School-specific", note: "No single federal student insurance premium; school requirements and policy costs vary.", source: sources.usa.study },
      { label: "Living-funds benchmark", amount: "Amount shown on Form I-20", note: "No single federal annual minimum: demonstrate the school-certified cost of attendance and funding for the required period.", source: sources.usa.study },
      { label: "Tuition range", amount: "USD 10,000–45,000 / year*", note: "Indicative planning range; use the I-20 and institution's current cost-of-attendance estimate.", source: sources.usa.study },
      { label: "Nepal payment / remittance", amount: "NOC + bank documentation", note: "Check Nepal's NOC and current authorized remittance requirements; keep sponsor and transfer evidence.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Apply to an SEVP-certified school. After acceptance and required deposit, the school issues Form I-20." },
      { title: "NOC & remittance", text: "Check NOC requirements and arrange fee/fund transfers through an authorized bank, retaining all evidence." },
      { title: "Visa & interview", text: "Pay the I-901 SEVIS fee and current visa application fee, check for any additional charges, complete DS-160, schedule the interview, and bring required documents." },
      { title: "Pre-departure", text: "Travel only within the permitted arrival window and carry your passport, visa, I-20, SEVIS receipt, and school contacts." },
    ],
    countrySource: sources.usa.visa,
  }),
  canada: profile({
    id: "canada", name: "Canada", flag: "🇨🇦", region: "North America", studyTypes: ["University", "Vocational", "English", "Research"],
    currency: "CAD", visaName: "Study permit", tuitionRange: "CAD 15,000–40,000 / year*",
    defaults: { tuition: 2300000, living: 2450000, visa: 250000, travel: 400000 },
    fees: [
      { label: "Study permit", amount: "CAD 150", note: "Standard study permit processing fee; confirm current IRCC fees and whether other applications are needed.", source: sources.canada.visa },
      { label: "Biometrics", amount: "CAD 85 (if required)", note: "Individual biometrics fee; family maximums and exemptions may apply.", source: sources.canada.fees },
      { label: "Health cover", amount: "Province / school specific", note: "Coverage and waiting periods vary by province and institution; budget for private cover where needed.", source: sources.canada.study },
      { label: "Living-funds benchmark", amount: "CAD 23,448 / year outside Quebec*", note: "One-applicant benchmark shown for 2026; tuition, travel, family size, Quebec, and application date affect the required total. Verify the current IRCC figure.", source: sources.canada.money },
      { label: "Tuition range", amount: "CAD 15,000–40,000 / year*", note: "Indicative range; confirm exact international tuition with your designated learning institution.", source: sources.canada.study },
      { label: "Nepal payment / remittance", amount: "NOC + bank documentation", note: "Check NOC and authorized bank requirements for tuition transfers and proof-of-funds records.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Get an offer from a designated learning institution and check whether your application needs a provincial/territorial attestation letter." },
      { title: "NOC & remittance", text: "Apply for Nepal NOC as required; arrange tuition and evidence of funds with an authorized bank." },
      { title: "Permit & biometrics", text: "Apply online for a study permit with required documents and fees. Give biometrics when IRCC sends instructions." },
      { title: "Pre-departure", text: "Travel after approval with your letter of introduction, passport, school documents, and evidence requested at the border." },
    ],
    countrySource: sources.canada.visa,
  }),
  japan: profile({
    id: "japan", name: "Japan", flag: "🇯🇵", region: "East Asia", studyTypes: ["University", "Vocational", "Language", "Research"],
    currency: "JPY", visaName: "Student status of residence", tuitionRange: "JPY 500,000–1,500,000 / year*",
    defaults: { tuition: 1100000, living: 1600000, visa: 80000, travel: 300000 },
    fees: [
      { label: "Student visa", amount: "Check Embassy of Japan in Nepal", note: "Visa fee depends on nationality, entry type, and local instructions; confirm with the Embassy before applying.", source: sources.japan.fees },
      { label: "Health cover", amount: "National Health Insurance after residence registration", note: "Premium depends on location and income; students should confirm enrollment and any school insurance.", source: sources.japan.study },
      { label: "Living-funds benchmark", amount: "No single published visa minimum", note: "Show credible ability to meet expenses; the school/COE process may request sponsor savings and income evidence.", source: sources.japan.visa },
      { label: "Tuition range", amount: "JPY 500,000–1,500,000 / year*", note: "Indicative range across institution types; enrollment, admission, and other first-year fees can be extra.", source: sources.japan.study },
      { label: "Nepal payment / remittance", amount: "NOC + bank documentation", note: "Confirm NOC and bank requirements for tuition and living-fund transfers; keep sponsor/source-of-funds records.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Apply to a Japanese school or institution and meet its academic, language, and financial documentation requirements." },
      { title: "NOC & remittance", text: "Check Nepal NOC and authorized remittance requirements; coordinate the institution's tuition and sponsor-document schedule." },
      { title: "COE & visa", text: "The school commonly applies for your Certificate of Eligibility (COE) as proxy. After issue, apply for a student visa at the Embassy." },
      { title: "Pre-departure", text: "Travel with passport, visa and COE. Arrange housing; register your address and enroll in National Health Insurance after arrival as applicable." },
    ],
    countrySource: sources.japan.visa,
  }),
  "south-korea": profile({
    id: "south-korea", name: "South Korea", flag: "🇰🇷", region: "East Asia", studyTypes: ["University", "Language", "Research"],
    currency: "KRW", visaName: "D-2 (degree) or D-4 (language) visa", tuitionRange: "KRW 4,000,000–12,000,000 / year*",
    defaults: { tuition: 1000000, living: 1400000, visa: 100000, travel: 300000 },
    fees: [
      { label: "Student visa", amount: "Check Korea Visa Portal / Embassy", note: "Visa fee varies by nationality, visa type, and local processing. Confirm current Nepal instructions before paying.", source: sources["south-korea"].fees },
      { label: "Health cover", amount: "National Health Insurance; premium varies", note: "International students are generally subject to Korean National Health Insurance; verify start date, rate, and exemptions.", source: sources["south-korea"].study },
      { label: "Living-funds benchmark", amount: "School / visa office specifies evidence", note: "Required balance and acceptable financial evidence can vary by school, program, and visa review.", source: sources["south-korea"].visa },
      { label: "Tuition range", amount: "KRW 4,000,000–12,000,000 / year*", note: "Indicative range by institution and program; confirm with the university and account for regional differences.", source: sources["south-korea"].study },
      { label: "Nepal payment / remittance", amount: "NOC + bank documentation", note: "Check NOC eligibility and bank transfer documentation for tuition and sponsor funds.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Apply to a recognized university or language institute and obtain its admission and enrollment documents." },
      { title: "NOC & remittance", text: "Check Nepal NOC, university deposit instructions, and authorized bank remittance paperwork." },
      { title: "Visa & biometrics", text: "Apply for the appropriate D-2 degree or D-4 language visa through the official channel; complete additional checks if requested." },
      { title: "Pre-departure", text: "Arrange housing and insurance, and carry your passport, visa, admission documents, NOC, and proof of funds." },
    ],
    countrySource: sources["south-korea"].visa,
  }),
  germany: profile({
    id: "germany", name: "Germany", flag: "🇩🇪", region: "Europe", studyTypes: ["University", "Vocational", "Language", "Research"],
    currency: "EUR", visaName: "National visa for study", tuitionRange: "EUR 0–20,000 / year*",
    defaults: { tuition: 1000000, living: 1700000, visa: 150000, travel: 350000 },
    fees: [
      { label: "National study visa", amount: "EUR 75", note: "Standard national visa fee; check the Embassy's current local instructions and any applicable exceptions.", source: sources.germany.visa },
      { label: "Health cover", amount: "Required; premium depends on age and plan", note: "Qualifying health insurance is required. Student statutory and private options have different eligibility and premiums.", source: sources.germany.study },
      { label: "Living-funds benchmark", amount: "Blocked account / other accepted proof — check current amount", note: "The required amount is set by current rules and can change. Verify the current monthly and annual amount before funding an account.", source: sources.germany.money },
      { label: "Tuition range", amount: "EUR 0–20,000 / year*", note: "Many public programs charge no general tuition, but semester contributions, state/program fees, and private tuition vary.", source: sources.germany.study },
      { label: "Nepal payment / remittance", amount: "NOC + bank documentation", note: "Check NOC and authorized Nepal bank requirements for tuition, blocked-account funding, and transfer evidence.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Confirm qualification recognition and admission to a state-recognized institution; obtain your admission letter." },
      { title: "NOC & remittance", text: "Check NOC and bank paperwork. Set up an accepted proof-of-funds option (often a blocked account) using the current required amount." },
      { title: "Visa & appointment", text: "Apply for the national student visa with admission, funds, health cover, and other required evidence; attend the Embassy appointment." },
      { title: "Pre-departure", text: "Arrange housing and travel. After arrival, register your address, activate insurance, and complete residence-permit steps on time." },
    ],
    countrySource: sources.germany.visa,
  }),
  "new-zealand": profile({
    id: "new-zealand", name: "New Zealand", flag: "🇳🇿", region: "Oceania", studyTypes: ["University", "Vocational", "English", "Research"],
    currency: "NZD", visaName: "Fee Paying Student Visa", tuitionRange: "NZD 20,000–40,000 / year*",
    defaults: { tuition: 2200000, living: 1900000, visa: 300000, travel: 350000 },
    fees: [
      { label: "Student visa", amount: "From NZD 850*", note: "Starting online application fee/levy; amount varies by application location and fees may change. Check the live visa page.", source: sources["new-zealand"].visa },
      { label: "Health cover", amount: "Insurance required; provider quote", note: "International students must hold acceptable insurance for the required period; premiums depend on provider and duration.", source: sources["new-zealand"].visa },
      { label: "Living-funds benchmark", amount: "NZD 20,000 / year*", note: "Common tertiary student living-cost evidence benchmark; confirm current rules, course duration, and exceptions.", source: sources["new-zealand"].money },
      { label: "Tuition range", amount: "NZD 20,000–40,000 / year*", note: "Indicative range; exact international tuition is set by the provider and course.", source: sources["new-zealand"].study },
      { label: "Nepal payment / remittance", amount: "NOC + bank documentation", note: "Get NOC as required and confirm current bank process for tuition, living expenses, and proof of transfer.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Get an offer from an approved education provider and confirm course fees, dates, and insurance arrangements." },
      { title: "NOC & remittance", text: "Check Nepal NOC and authorized payment procedures; keep receipts and evidence of funds and source." },
      { title: "Visa & biometrics", text: "Apply online for the Fee Paying Student Visa with offer, funds, insurance, and other evidence; follow any identity requests." },
      { title: "Pre-departure", text: "Wait for visa approval before booking, arrange accommodation, and carry your passport, offer, insurance, and funds evidence." },
    ],
    countrySource: sources["new-zealand"].visa,
  }),
  ireland: profile({
    id: "ireland", name: "Ireland", flag: "🇮🇪", region: "Europe", studyTypes: ["University", "Vocational", "English", "Research"],
    currency: "EUR", visaName: "Long-stay study visa (D)", tuitionRange: "EUR 10,000–30,000 / year*",
    defaults: { tuition: 1800000, living: 1600000, visa: 160000, travel: 350000 },
    fees: [
      { label: "Study visa", amount: "EUR 60 (single entry); EUR 100 (multiple entry)*", note: "Standard visa fee schedule; confirm any current exceptions and the exact payment method for Nepal.", source: sources.ireland.fees },
      { label: "Health cover", amount: "Private medical insurance required", note: "Students must have acceptable private medical insurance; price depends on policy and duration.", source: sources.ireland.visa },
      { label: "Living-funds benchmark", amount: "EUR 10,000 for a one-year course*", note: "Published one-year student finance benchmark in current policy; verify the latest amount and evidence rules.", source: sources.ireland.money },
      { label: "Tuition range", amount: "EUR 10,000–30,000 / year*", note: "Indicative range for many programs; course type, institution, and fee status affect tuition.", source: sources.ireland.study },
      { label: "Nepal payment / remittance", amount: "NOC + bank documentation", note: "Check NOC requirements and authorized bank remittance steps; retain proof of tuition payments and funds.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Enroll in an eligible full-time program, receive an acceptance letter, and pay the fees required for your application." },
      { title: "NOC & remittance", text: "Check Nepal NOC and bank payment evidence requirements; retain tuition receipts and sponsor records." },
      { title: "Visa & registration", text: "Apply for the appropriate long-stay study visa with finances and insurance evidence; after arrival, register if staying over 90 days." },
      { title: "Pre-departure", text: "Arrange accommodation and insurance, and carry your passport, visa, acceptance letter, and payment evidence." },
    ],
    countrySource: sources.ireland.visa,
  }),
  india: profile({
    id: "india", name: "India", flag: "🇮🇳", region: "South Asia", studyTypes: ["University", "Vocational", "English", "Research"],
    currency: "INR", visaName: "No visa generally required for Nepali citizens under bilateral arrangements", tuitionRange: "INR 50,000–500,000 / year*",
    defaults: { tuition: 350000, living: 450000, visa: 30000, travel: 50000 },
    fees: [
      { label: "Student visa", amount: "Generally not required for Nepali citizens", note: "Nepalese citizens generally travel to India without a visa under bilateral arrangements; confirm acceptable identity/travel documents and current rules.", source: sources.india.visa },
      { label: "Health cover", amount: "Institution / policy specific", note: "Confirm the institution's health and insurance requirements; there is no single student visa insurance fee.", source: sources.india.study },
      { label: "Living-funds benchmark", amount: "No single nationwide visa minimum", note: "Budget for the city and institution; ask for documented hostel, food, and other living costs.", source: sources.india.study },
      { label: "Tuition range", amount: "INR 50,000–500,000 / year*", note: "Broad planning range only; program and institution fees vary widely. Confirm the official fee schedule.", source: sources.india.study },
      { label: "Nepal payment / remittance", amount: "Check NOC and bank requirements", note: "Confirm current NOC applicability and Nepal Rastra Bank rules for education payments to India before transfer.", source: commonSources.noc },
    ],
    process: [
      { title: "Admission", text: "Apply to a recognized Indian institution and confirm admission eligibility, fees, and any foreign-student process." },
      { title: "NOC & remittance", text: "Check whether NOC is required for your program and verify current authorized-bank documentation before sending funds." },
      { title: "Entry & local formalities", text: "Nepali citizens generally do not need an Indian visa; confirm current entry-document requirements and any institution/registration formalities." },
      { title: "Pre-departure", text: "Arrange accommodation and travel, carry valid identity documents and admission records, and keep fee/NOC evidence accessible." },
    ],
    countrySource: sources.india.visa,
  }),
};

export const countryOrder = [
  "australia",
  "uk",
  "usa",
  "canada",
  "japan",
  "south-korea",
  "germany",
  "new-zealand",
  "ireland",
  "india",
];

export const regions = ["All regions", "East Asia", "Europe", "North America", "Oceania", "South Asia"];
export const studyTypes = ["All study types", "University", "Vocational", "English", "Language", "Research"];
