export interface YearlyCalculation {
  age: number;
  startingBalance: number;
  rmdRequired: boolean;
  rmdAmount: number;
  yearlyGrowth: number;
  endingBalance: number;
}

export interface TaxDeferredScenario {
  totalRMDTaxes: number;
  totalAccountValue: number;
  totalTaxBurden: number;
}

export interface RothConversionScenario {
  oneTimeTaxPayment: number;
  projectedValue: number;
  totalTaxBurden: number;
}

export interface Analysis {
  potentialSavings: number;
  rmdStartAge: number;
  yearsUntilRMD: number;
  totalRMDYears: number;
}

export interface FacebookTracking {
  fbclid?: string;
  fbp?: string;
  fbc?: string;
}

export interface SourceInformation {
  userAgent: string;
  pageUrl: string;
  referrer: string;
  timestamp: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface WebhookPayload {
  // Lead Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Input Parameters
  birthYear: number;
  currentAge: number;
  iraValue: number;
  taxBracket: number;
  growthRate: number;
  state: string;
  
  // Calculation Results
  taxDeferredScenario: TaxDeferredScenario;
  rothConversionScenario: RothConversionScenario;
  analysis: Analysis;
  
  // Tracking Data
  facebook: FacebookTracking;
  source: SourceInformation;
}