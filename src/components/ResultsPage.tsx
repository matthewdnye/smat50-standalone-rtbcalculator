import React, { useEffect } from 'react';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import { CalculationResult } from '../types/calculator';
import TaxComparison from './TaxComparison';
import ResultsTable from './ResultsTable';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFReport from './PDFReport/PDFReport';
import { trackReportDownload } from '../utils/gtm';

interface ResultsPageProps {
  result: CalculationResult;
  onReset: () => void;
  isEmbedded?: boolean;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, onReset, isEmbedded = false }) => {
  useEffect(() => {
    // Scroll to top when results are shown
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // For embedded version, notify parent to scroll
    if (isEmbedded) {
      window.parent.postMessage({
        type: 'rtb-show-results',
        scrollTop: true
      }, '*');
    }
  }, [isEmbedded]);

  const handleDownload = () => {
    const lastProjection = result.projections[result.projections.length - 1];
    const potentialSavings = lastProjection.remainingBalance * (result.taxRate / 100);
    
    trackReportDownload({
      reportType: 'tax-analysis',
      state: result.userInfo.state,
      savingsAmount: potentialSavings
    });
  };

  // Standalone version (full featured)
  if (!isEmbedded) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Calculator</span>
          </button>
          <div className="flex items-center gap-4">
            <PDFDownloadLink
              document={<PDFReport result={result} />}
              fileName={`retirement-tax-bill-${result.userInfo.lastName.toLowerCase()}.pdf`}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={handleDownload}
            >
              {({ loading }) => (
                <>
                  <Download className="w-5 h-5" />
                  <span>{loading ? 'Generating PDF...' : 'Download Report'}</span>
                </>
              )}
            </PDFDownloadLink>
            <div className="text-right">
              <p className="text-sm text-gray-600">Results for</p>
              <p className="font-semibold text-gray-800">
                {result.userInfo.firstName} {result.userInfo.lastName}
              </p>
            </div>
          </div>
        </div>

        <TaxComparison
          projections={result.projections}
          currentValue={result.currentValue}
          taxRate={result.taxRate}
        />

        <div className="flex justify-center">
          <a
            href="https://retirementtaxbill.smarttaxfreeretirement.com/schedule"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
          >
            <Calendar className="w-6 h-6" />
            <span>SCHEDULE YOUR S.M.A.R.T. STRATEGY SESSION NOW</span>
          </a>
        </div>
        
        <ResultsTable projections={result.projections} />
      </div>
    );
  }

  // Desktop embed version
  if (isEmbedded && window.innerWidth >= 768) {
    return (
      <div className="space-y-6">
        <TaxComparison
          projections={result.projections}
          currentValue={result.currentValue}
          taxRate={result.taxRate}
        />
        
        <div className="mt-6">
          <a
            href="https://retirementtaxbill.smarttaxfreeretirement.com/schedule"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#38B001] hover:bg-[#2d8c01] text-white px-8 py-4 rounded-xl transition-colors font-bold text-lg shadow-lg hover:shadow-xl w-full"
          >
            <Calendar className="w-6 h-6" />
            <span>SCHEDULE YOUR S.M.A.R.T. STRATEGY SESSION NOW</span>
          </a>
        </div>
      </div>
    );
  }

  // Mobile embed version
  return (
    <div className="space-y-6 pb-20">
      <TaxComparison
        projections={result.projections}
        currentValue={result.currentValue}
        taxRate={result.taxRate}
      />
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <a
          href="https://retirementtaxbill.smarttaxfreeretirement.com/schedule"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#38B001] hover:bg-[#2d8c01] text-white px-8 py-4 rounded-xl transition-colors font-bold text-lg shadow-lg hover:shadow-xl w-full"
        >
          <Calendar className="w-6 h-6" />
          <span>SCHEDULE YOUR S.M.A.R.T. STRATEGY SESSION NOW</span>
        </a>
      </div>
    </div>
  );
};

export default ResultsPage;