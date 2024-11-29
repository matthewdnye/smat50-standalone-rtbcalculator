import { CalculationResult } from '../types/calculator';
import { WebhookPayload } from '../types/submission';
import { getRMDStartAge } from './rmdCalculations';
import { getFacebookParams, getUTMParams, getBrowserData } from './tracking';

export const createSubmissionPayload = (result: CalculationResult): WebhookPayload => {
  const currentYear = new Date().getFullYear();
  const currentAge = result.projections[0].age;
  const birthYear = currentYear - currentAge;
  const rmdStartAge = getRMDStartAge(currentAge);
  
  // Calculate total RMD taxes and account values
  const totalRMDTaxes = result.projections.reduce((sum, year) => 
    sum + (year.rmdAmount * (result.taxRate / 100)), 0);
  
  const lastProjection = result.projections[result.projections.length - 1];
  const totalAccountValue = lastProjection.remainingBalance + lastProjection.taxableAccountValue;
  
  // Calculate tax-free conversion scenario
  const oneTimeTaxPayment = result.currentValue * (result.taxRate / 100);
  const projectedValue = result.projections[result.projections.length - 1].remainingBalance * 
    Math.pow(1 + (result.growthRate / 100), result.projections.length);

  // Get tracking parameters
  const facebookParams = getFacebookParams();
  const utmParams = getUTMParams();
  const browserData = getBrowserData();

  return {
    // Lead Information
    firstName: result.userInfo.firstName,
    lastName: result.userInfo.lastName,
    email: result.userInfo.email,
    phone: result.userInfo.phone,
    
    // Input Parameters
    birthYear,
    currentAge,
    iraValue: result.currentValue,
    taxBracket: result.taxRate,
    growthRate: 5,
    state: result.userInfo.state,
    
    // Calculation Results
    taxDeferredScenario: {
      totalRMDTaxes,
      totalAccountValue,
      totalTaxBurden: totalRMDTaxes + (lastProjection.remainingBalance * (result.taxRate / 100))
    },
    
    rothConversionScenario: {
      oneTimeTaxPayment,
      projectedValue,
      totalTaxBurden: oneTimeTaxPayment
    },
    
    analysis: {
      potentialSavings: (totalRMDTaxes + (lastProjection.remainingBalance * (result.taxRate / 100))) - oneTimeTaxPayment,
      rmdStartAge,
      yearsUntilRMD: rmdStartAge - currentAge,
      totalRMDYears: 90 - rmdStartAge
    },
    
    // Facebook Tracking
    facebook: {
      fbclid: facebookParams.fbclid,
      fbp: facebookParams.fbp,
      fbc: facebookParams.fbc
    },
    
    // Source Information
    source: {
      ...browserData,
      ...utmParams
    }
  };
};