import React, { useState } from 'react';
import { states } from '../data/states';
import { FormData, FormErrors, CalculationResult } from '../types/calculator';
import { calculateYearlyProjections } from '../utils/rmdCalculations';
import { storeCalculatorData } from '../services/firebase';
import { trackStartCalculation, trackCompleteCalculation, trackLeadSubmission } from '../utils/gtm';

interface RetirementCalculatorProps {
  onCalculate: (result: CalculationResult) => void;
  isEmbedded?: boolean;
}

const RetirementCalculator: React.FC<RetirementCalculatorProps> = ({ onCalculate, isEmbedded = false }) => {
  const [formData, setFormData] = useState<FormData>({
    age: '',
    accountValue: '',
    taxBracket: 24,
    growthRate: 5,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    state: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    age: '',
    accountValue: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    state: ''
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      age: '',
      accountValue: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      state: ''
    };

    let isValid = true;

    if (!formData.age) {
      newErrors.age = 'Age is required';
      isValid = false;
    } else if (parseInt(formData.age) < 50 || parseInt(formData.age) > 100) {
      newErrors.age = 'Age must be between 50 and 100';
      isValid = false;
    }

    if (!formData.accountValue) {
      newErrors.accountValue = 'Account value is required';
      isValid = false;
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    if (!formData.state) {
      newErrors.state = 'Please select your state';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    trackStartCalculation({
      accountValue: parseInt(formData.accountValue.replace(/\D/g, '')),
      currentAge: parseInt(formData.age),
      growthRate: formData.growthRate,
      state: formData.state
    });

    const numericAccountValue = parseInt(formData.accountValue.replace(/\D/g, ''));
    const projections = calculateYearlyProjections(
      parseInt(formData.age),
      numericAccountValue,
      formData.growthRate,
      formData.taxBracket
    );

    const result: CalculationResult = {
      projections,
      currentValue: numericAccountValue,
      taxRate: formData.taxBracket,
      userInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        state: formData.state
      }
    };

    try {
      await storeCalculatorData(result);
      trackCompleteCalculation(result);
      trackLeadSubmission({
        state: formData.state,
        potentialSavings: projections[projections.length - 1].remainingBalance * (formData.taxBracket / 100),
        conversionValue: numericAccountValue,
        success: true
      });
      
      // Scroll to top before showing results
      if (isEmbedded) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Send message to parent for mobile
        window.parent.postMessage({
          type: 'rtb-show-results',
          scrollTop: true
        }, '*');
      }
      
      onCalculate(result);
    } catch (error) {
      console.error('Error storing calculator data:', error);
      trackLeadSubmission({
        state: formData.state,
        potentialSavings: projections[projections.length - 1].remainingBalance * (formData.taxBracket / 100),
        conversionValue: numericAccountValue,
        success: false
      });
      onCalculate(result);
    }
  };

  const formatAccountValue = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'accountValue') {
      setFormData(prev => ({
        ...prev,
        [name]: formatAccountValue(value)
      }));
    } else if (name === 'phone') {
      const formatted = value.replace(/\D/g, '')
        .replace(/^(\d{3})/, '($1) ')
        .replace(/(\d{3})(\d{4})$/, '$1-$2');
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className={`${isEmbedded ? 'py-4' : ''}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-semibold text-gray-700">
              Your Current Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-200"
              placeholder="Enter your age"
              min="50"
              max="100"
              style={{ height: '46px' }}
            />
            {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="accountValue" className="block text-sm font-semibold text-gray-700">
              IRA/401(k) Value
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                id="accountValue"
                name="accountValue"
                value={formData.accountValue}
                onChange={handleInputChange}
                className="w-full pl-8 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-200"
                placeholder="Enter account value"
                style={{ height: '46px' }}
              />
            </div>
            {errors.accountValue && <p className="text-sm text-red-500">{errors.accountValue}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="growthRate" className="block text-sm font-semibold text-gray-700">
              Growth Rate: {formData.growthRate}%
            </label>
            <input
              type="range"
              id="growthRate"
              name="growthRate"
              value={formData.growthRate}
              onChange={handleInputChange}
              min="1"
              max="20"
              step="1"
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${isEmbedded ? 'accent-[#38B001]' : 'accent-indigo-600'}`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="taxBracket" className="block text-sm font-semibold text-gray-700">
              Tax Bracket: {formData.taxBracket}%
            </label>
            <input
              type="range"
              id="taxBracket"
              name="taxBracket"
              value={formData.taxBracket}
              onChange={handleInputChange}
              min="10"
              max="37"
              step="1"
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${isEmbedded ? 'accent-[#38B001]' : 'accent-indigo-600'}`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>10%</span>
              <span>37%</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-200"
              placeholder="Enter your first name"
              style={{ height: '46px' }}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-200"
              placeholder="Enter your last name"
              style={{ height: '46px' }}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-200"
              placeholder="Enter your email"
              style={{ height: '46px' }}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-200"
              placeholder="(555) 555-5555"
              style={{ height: '46px' }}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="state" className="block text-sm font-semibold text-gray-700">
            State
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-200"
            style={{ height: '46px' }}
          >
            <option value="">Select your state</option>
            {states.map(state => (
              <option key={state.abbreviation} value={state.abbreviation}>
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
        </div>

        <button
          type="submit"
          className={`w-full ${isEmbedded ? 'bg-[#38B001] hover:bg-[#2d8c01]' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-4 px-6 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl uppercase`}
        >
          Show Me My Retirement Tax Bill Now
        </button>
      </form>
    </div>
  );
};

export default RetirementCalculator;