export interface FormData {
  age: string;
  accountValue: string;
  taxBracket: number;
  growthRate: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
}

export interface FormErrors {
  age: string;
  accountValue: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
}

export interface YearlyProjection {
  year: number;
  age: number;
  rmdFactor: number;
  rmdRequired: boolean;
  rmdAmount: number;
  afterTaxRmd: number;
  remainingBalance: number;
  taxableAccountValue: number;
}

export interface CalculationResult {
  projections: YearlyProjection[];
  currentValue: number;
  taxRate: number;
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    state: string;
  };
}