export const OFFICIAL_SOURCE_REFRESH_POLICY = {
  cadence: 'Every 24 hours for common EU rules; every 6 hours for appointment/VAC checklist pages while a user has an active trip.',
  owner: 'GuidelineOps agent',
  reviewRule: 'Any material change is queued for human review before changing scoring weights.',
};

export const officialSources = [
  {
    id: 'eu-applying-schengen',
    country: 'Schengen common rules',
    title: 'European Commission — Applying for a Schengen visa',
    url: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy/applying-schengen-visa_en',
    checkedAt: '2026-05-17',
    keyFacts: [
      'Short-stay Schengen visa covers up to 90 days in any 180-day period.',
      'Apply to the consulate of the main destination, or first-entry country when stays are equal.',
      'Lodge applications at least 15 days before travel and no earlier than 6 months before travel.',
      'Core documents include valid passport, application form, ICAO photo, medical insurance, purpose/accommodation/financial means, and intention to return.',
      'Standard visa fee is EUR 90 for adults and EUR 45 for children aged 6 to 12, before service-provider fees.',
    ],
  },
  {
    id: 'eu-short-stay-calculator',
    country: 'Schengen common rules',
    title: 'European Commission — Short-stay calculator',
    url: 'https://home-affairs.ec.europa.eu/policies/schengen/border-crossing/short-stay-calculator_en',
    checkedAt: '2026-05-17',
    keyFacts: ['Used to validate the 90/180-day stay rule for frequent travellers.'],
  },
  {
    id: 'france-visas-short-stay',
    country: 'France',
    title: 'France-Visas — Short-stay visa',
    url: 'https://france-visas.gouv.fr/en/web/france-visas/short-stay-visa',
    checkedAt: '2026-05-17',
    keyFacts: ['France short-stay visas are generally used for tourism, business, family visits, training, internships, and short professional activities.'],
  },
  {
    id: 'netherlands-india-checklist',
    country: 'Netherlands',
    title: 'VFS Global Netherlands in India — tourism checklist PDF',
    url: 'https://www.vfsglobal.com/netherlands/india/pdf/checklist-visa-application-tourism.pdf',
    checkedAt: '2026-05-17',
    keyFacts: ['Checklist includes passport validity after departure from Schengen and evidence of legal residence in the application country.'],
  },
  {
    id: 'hungary-india-checklist',
    country: 'Hungary',
    title: 'VFS Global Hungary in India — tourist checklist PDF',
    url: 'https://visa.vfsglobal.com/one-pager/hungary/India/english/pdf/TOURIST-CHECKLIST-nov-2025.pdf',
    checkedAt: '2026-05-17',
    keyFacts: ['Recent India checklist examples ask for bank statements, ITR evidence, and travel medical insurance valid for all Schengen countries.'],
  },
];

export const documentRules = [
  {
    id: 'passport',
    label: 'Passport',
    weight: 18,
    required: true,
    checks: [
      'Valid for at least 3 months after planned Schengen departure.',
      'Issued within the last 10 years and has at least 2 blank pages.',
      'Clear scan of bio page plus prior visas/stamps when available.',
    ],
  },
  {
    id: 'applicationForm',
    label: 'Visa application form',
    weight: 8,
    required: true,
    checks: ['Signed, complete, consistent with passport, itinerary, employer, and hotel/host details.'],
  },
  {
    id: 'photo',
    label: 'Photograph',
    weight: 6,
    required: true,
    checks: ['Recent photograph following ICAO/mission specifications.'],
  },
  {
    id: 'insurance',
    label: 'Travel medical insurance',
    weight: 12,
    required: true,
    checks: ['Covers all Schengen states, full travel period, emergency care, hospitalisation, and repatriation.'],
  },
  {
    id: 'itinerary',
    label: 'Itinerary and transport',
    weight: 10,
    required: true,
    checks: ['Day-by-day itinerary matches flight/train reservations and main-destination country.'],
  },
  {
    id: 'accommodation',
    label: 'Accommodation proof',
    weight: 9,
    required: true,
    checks: ['Hotel bookings or host invitation cover every night and match itinerary.'],
  },
  {
    id: 'bankStatements',
    label: 'Bank statements',
    weight: 13,
    required: true,
    checks: ['Recent statements show stable inflow, sufficient balance, and no unexplained last-minute deposits.'],
  },
  {
    id: 'incomeTax',
    label: 'Income tax returns / Form 16',
    weight: 7,
    required: true,
    checks: ['Recent ITRs or tax evidence support declared employment/business income.'],
  },
  {
    id: 'employment',
    label: 'Employment or business proof',
    weight: 9,
    required: true,
    checks: ['Leave approval/NOC, salary slips, company proof, GST/registration, or student enrolment as applicable.'],
  },
  {
    id: 'tiesToIndia',
    label: 'Return ties to India',
    weight: 8,
    required: true,
    checks: ['Evidence of job, business, studies, family, property, or recurring obligations after travel.'],
  },
];

export const countryReadinessProfiles = [
  {
    country: 'France',
    notes: 'Prioritise France-Visas wizard output, appointment proof, and purpose-specific supporting documents.',
    sourceId: 'france-visas-short-stay',
  },
  {
    country: 'Netherlands',
    notes: 'Use the current VFS Netherlands India checklist and verify passport/legal residence evidence.',
    sourceId: 'netherlands-india-checklist',
  },
  {
    country: 'Hungary',
    notes: 'India checklist examples emphasise bank statements, ITRs, and all-Schengen insurance coverage.',
    sourceId: 'hungary-india-checklist',
  },
  {
    country: 'Germany',
    notes: 'Use the latest mission/VFS checklist for the relevant Indian jurisdiction before final submission.',
    sourceId: 'eu-applying-schengen',
  },
  {
    country: 'Italy',
    notes: 'Match main destination, itinerary, accommodation, and finances carefully because consular scrutiny varies by jurisdiction.',
    sourceId: 'eu-applying-schengen',
  },
  {
    country: 'Spain',
    notes: 'Use the latest BLS/mission checklist for the Indian jurisdiction and validate travel purpose evidence.',
    sourceId: 'eu-applying-schengen',
  },
];
