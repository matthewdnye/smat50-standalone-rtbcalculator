// 2022+ Uniform Lifetime Table
const lifeExpectancyTable: { [key: number]: number } = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4
};

export const getRMDStartAge = (currentAge: number): number => {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - currentAge;
  if (birthYear < 1951) return 72;
  if (birthYear <= 1958) return 73;
  return 75;
};

export const getLifeExpectancyFactor = (age: number): number => {
  return lifeExpectancyTable[age] || 0;
};

export const calculateRMD = (accountValue: number, age: number): number => {
  const factor = getLifeExpectancyFactor(age);
  return factor ? accountValue / factor : 0;
};

export const calculateYearlyProjections = (
  currentAge: number,
  accountValue: number,
  growthRate: number,
  taxBracket: number
): YearlyProjection[] => {
  const projections: YearlyProjection[] = [];
  const rmdStartAge = getRMDStartAge(currentAge);
  let currentBalance = accountValue;
  let taxableAccountValue = 0;
  const currentYear = new Date().getFullYear();

  for (let age = currentAge; age <= 90; age++) {
    const year = currentYear + (age - currentAge);
    const rmdRequired = age >= rmdStartAge;
    const rmdFactor = rmdRequired ? getLifeExpectancyFactor(age) : 0;
    
    // Calculate RMD and growth
    const yearlyGrowth = currentBalance * (growthRate / 100);
    const grossBalance = currentBalance + yearlyGrowth;
    const rmdAmount = rmdRequired ? calculateRMD(grossBalance, age) : 0;
    const afterTaxRmd = rmdAmount * (1 - taxBracket / 100);
    
    // Update balances
    const remainingBalance = grossBalance - rmdAmount;
    taxableAccountValue = taxableAccountValue * (1 + growthRate / 100) + afterTaxRmd;

    projections.push({
      year,
      age,
      rmdFactor,
      rmdRequired,
      rmdAmount,
      afterTaxRmd,
      remainingBalance,
      taxableAccountValue
    });

    currentBalance = remainingBalance;
  }

  return projections;
};