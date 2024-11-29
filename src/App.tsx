import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import RetirementCalculator from './components/RetirementCalculator';
import ResultsPage from './components/ResultsPage';
import { CalculationResult } from './types/calculator';
import { initializeGTM } from './utils/gtm';

const App = () => {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    setIsEmbedded(window.top !== window.self);
    initializeGTM();
  }, []);

  const handleReset = () => {
    setCalculationResult(null);
  };

  return (
    <div className={`${!isEmbedded ? 'min-h-screen bg-gradient-radial from-white via-indigo-50/50 to-purple-50/50 p-4 md:p-8' : 'min-h-screen bg-transparent px-3 md:px-0'}`}>
      <div id="calculator-top" className={`max-w-[800px] mx-auto ${!isEmbedded ? 'bg-white/60 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8' : ''}`}>
        {!calculationResult ? (
          <>
            {!isEmbedded && (
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Retirement Tax Bill Calculator
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Your IRA or 401(k) is a tax time-bomb. Use this calculator to see how much you could save.
                  </p>
                </div>
              </div>
            )}
            <RetirementCalculator 
              onCalculate={setCalculationResult} 
              isEmbedded={isEmbedded}
            />
          </>
        ) : (
          <ResultsPage 
            result={calculationResult} 
            onReset={handleReset} 
            isEmbedded={isEmbedded}
          />
        )}
      </div>
    </div>
  );
};

export default App;