import { CalculationResult } from '../types/calculator';

interface FacebookParams {
  fbclid?: string;
  fbp?: string;
  fbc?: string;
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export const getFacebookParams = (): FacebookParams => {
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid') || undefined;
  
  // Get Facebook Browser ID from cookie
  const fbp = document.cookie.split('; ')
    .find(row => row.startsWith('_fbp='))
    ?.split('=')[1];

  // Generate FBC if fbclid exists
  const fbc = fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;

  return { fbclid, fbp, fbc };
};

export const getUTMParams = (): UTMParams => {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_content: urlParams.get('utm_content') || undefined,
    utm_term: urlParams.get('utm_term') || undefined
  };
};

export const getBrowserData = () => {
  return {
    userAgent: navigator.userAgent,
    pageUrl: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };
};