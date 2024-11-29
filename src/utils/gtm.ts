import { CalculationResult } from '../types/calculator';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize GTM
export const initializeGTM = () => {
  const gtmId = 'GTM-T8FCNF49';

  // Create dataLayer
  window.dataLayer = window.dataLayer || [];

  // Insert GTM script
  const script = document.createElement('script');
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
  document.head.appendChild(script);

  // Track initial page view
  trackCalculatorView();
};

// Utility function to push to dataLayer
const pushToDataLayer = (event: string, data: Record<string, any>) => {
  window.dataLayer.push({
    event,
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Format number for GTM
const formatNumber = (num: number): number => {
  return Number(num.toFixed(2));
};

// Track calculator view
export const trackCalculatorView = () => {
  pushToDataLayer('calculator_view', {
    page_url: window.location.href,
    referrer: document.referrer
  });
};

// Track start calculation
export const trackStartCalculation = (data: {
  accountValue: number;
  currentAge: number;
  growthRate: number;
  state: string;
}) => {
  pushToDataLayer('start_calculation', {
    account_value: formatNumber(data.accountValue),
    current_age: data.currentAge,
    growth_rate: formatNumber(data.growthRate),
    state: data.state
  });
};

// Track complete calculation
export const trackCompleteCalculation = (result: CalculationResult) => {
  const lastProjection = result.projections[result.projections.length - 1];
  const firstRMDYear = result.projections.find(p => p.rmdRequired);
  const potentialSavings = lastProjection.remainingBalance * (result.taxRate / 100);

  pushToDataLayer('complete_calculation', {
    potential_savings: formatNumber(potentialSavings),
    tax_burden: formatNumber(result.taxRate),
    rmd_start_age: firstRMDYear?.age || 0,
    total_years_projected: result.projections.length
  });
};

// Track lead submission
export const trackLeadSubmission = (data: {
  state: string;
  potentialSavings: number;
  conversionValue: number;
  success: boolean;
}) => {
  pushToDataLayer('lead_submission', {
    state: data.state,
    potential_savings: formatNumber(data.potentialSavings),
    conversion_value: formatNumber(data.conversionValue),
    success: data.success
  });
};

// Track report download
export const trackReportDownload = (data: {
  reportType: string;
  state: string;
  savingsAmount: number;
}) => {
  pushToDataLayer('download_report', {
    report_type: data.reportType,
    state: data.state,
    savings_amount: formatNumber(data.savingsAmount)
  });
};