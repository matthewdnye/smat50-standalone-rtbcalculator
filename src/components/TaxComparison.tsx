import React from 'react';
import { YearlyProjection } from '../types/calculator';

interface TaxComparisonProps {
  projections: YearlyProjection[];
  currentValue: number;
  taxRate: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TaxComparison: React.FC<TaxComparisonProps> = ({ projections, currentValue, taxRate }) => {
  // Calculate taxes for qualified plan
  const taxesOnRMDs = projections.reduce((sum, year) => sum + year.rmdAmount * (taxRate / 100), 0);
  const taxesOnReinvestedRMDs = projections.reduce((sum, year) => {
    const reinvestmentGrowth = year.taxableAccountValue - (year.afterTaxRmd + (projections[projections.indexOf(year) - 1]?.taxableAccountValue || 0));
    return sum + (reinvestmentGrowth > 0 ? reinvestmentGrowth * (taxRate / 100) : 0);
  }, 0);
  const taxesOnRemaining = projections[projections.length - 1].remainingBalance * (taxRate / 100);
  const totalQualifiedTaxes = taxesOnRMDs + taxesOnReinvestedRMDs + taxesOnRemaining;

  // Calculate taxes for tax-free conversion
  const taxesOnReallocation = currentValue * (taxRate / 100);
  const taxesOnGrowth = 0;
  const taxesOnRemainingTaxFree = 0;
  const totalTaxFreeTaxes = taxesOnReallocation + taxesOnGrowth + taxesOnRemainingTaxFree;

  const potentialSavings = totalQualifiedTaxes - totalTaxFreeTaxes;
  
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Keep Current Plan</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr,auto] gap-4">
            <span className="text-gray-600">Total taxes paid on RMDs at time of withdrawals:</span>
            <span className="font-medium text-red-600 text-right">{formatCurrency(taxesOnRMDs)}</span>
          </div>
          <div className="grid grid-cols-[1fr,auto] gap-4">
            <span className="text-gray-600">Taxes paid on reinvested RMDs:</span>
            <span className="font-medium text-red-600 text-right">{formatCurrency(taxesOnReinvestedRMDs)}</span>
          </div>
          <div className="grid grid-cols-[1fr,auto] gap-4">
            <span className="text-gray-600">Taxes paid on remaining account value at death:</span>
            <span className="font-medium text-red-600 text-right">{formatCurrency(taxesOnRemaining)}</span>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
              <span className="text-gray-800 font-semibold">Total Taxes Paid:</span>
              <span className="text-xl font-bold text-red-600">{formatCurrency(totalQualifiedTaxes)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Convert to Tax-Free Account</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr,auto] gap-4">
            <span className="text-gray-600">Taxes paid on re-allocation to tax-free account:</span>
            <span className="font-medium text-indigo-600 text-right">{formatCurrency(taxesOnReallocation)}</span>
          </div>
          <div className="grid grid-cols-[1fr,auto] gap-4">
            <span className="text-gray-600">Taxes paid on tax-free growth account:</span>
            <span className="font-medium text-green-600 text-right">{formatCurrency(taxesOnGrowth)}</span>
          </div>
          <div className="grid grid-cols-[1fr,auto] gap-4">
            <span className="text-gray-600">Taxes paid on remaining tax-free account value at death:</span>
            <span className="font-medium text-green-600 text-right">{formatCurrency(taxesOnRemainingTaxFree)}</span>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
              <span className="text-gray-800 font-semibold">Total Taxes Paid:</span>
              <span className="text-xl font-bold text-indigo-600">{formatCurrency(totalTaxFreeTaxes)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-800">Potential Lifetime Tax Savings:</span>
          <span className="text-2xl font-bold text-green-600">{formatCurrency(potentialSavings)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {potentialSavings > 0 
            ? "Converting to a tax-free account now could significantly reduce your lifetime tax burden."
            : "In this scenario, keeping your current plan might be more beneficial."}
        </p>
      </div>
    </div>
  );
};

export default TaxComparison;