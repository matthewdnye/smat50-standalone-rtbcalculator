import React from 'react';
import { YearlyProjection } from '../types/calculator';

interface ResultsTableProps {
  projections: YearlyProjection[];
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatFactor = (factor: number): string => {
  return factor === 0 ? '-' : factor.toFixed(1);
};

const ResultsTable: React.FC<ResultsTableProps> = ({ projections }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Year</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Age</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">RMD Factor</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">RMD Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">After-Tax RMD</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Remaining Plan Balance</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Taxable Account Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projections.map((year) => (
              <tr 
                key={year.age} 
                className={`
                  ${year.rmdRequired ? 'bg-indigo-50/50' : 'bg-white/50'}
                  hover:bg-gray-50/80 transition-colors duration-150
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{year.age}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatFactor(year.rmdFactor)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(year.rmdAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(year.afterTaxRmd)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(year.remainingBalance)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(year.taxableAccountValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;