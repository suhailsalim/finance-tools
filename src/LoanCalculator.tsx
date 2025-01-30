import { useEffect, useState } from 'react';

const LoanCalculator = () => {
  // State for all input fields
  const [loanDetails, setLoanDetails] = useState({
    loanAmount: 800000,
    interestRate: 12,
    loanStartDate: '2024-04-01',
    preClosureDate: '2025-04-01',
    preclosureCharge: 4,
    investmentRate: 8
  });

  // Derived state for calculations
  const [calculations, setCalculations] = useState({
    emi: 0,
    paidEMIs: 0,
    remainingEMIs: 0,
    totalInterestPaid: 0,
    totalPrincipalPaid: 0,
    preclosureAmount: 0,
    totalCostPreclose: 0,
    totalCostEMI: 0,
    futureValueOfPreclosureAmount: 0,
    futureValueOfEMIs: 0,
    totalFutureValueIfContinue: 0
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    calculateLoanDetails();
  }, [loanDetails]);

  const formatCurrency = (value: number) => {
    return (Number(value) || 0).toFixed(2);
  };

  const calculateLoanDetails = () => {
    try {
      const monthlyRate = loanDetails.interestRate / 100 / 12;
      const tenureMonths = 36; // Fixed 3-year tenure

      // Calculate EMI
      const emi = loanDetails.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) 
                  / (Math.pow(1 + monthlyRate, tenureMonths) - 1);

      // Calculate number of EMIs paid
      const startDate = new Date(loanDetails.loanStartDate);
      const preCloseDate = new Date(loanDetails.preClosureDate);
      const monthsDiff = (preCloseDate.getFullYear() - startDate.getFullYear()) * 12 
                        + preCloseDate.getMonth() - startDate.getMonth();
      const paidEMIs = Math.max(0, monthsDiff);

      // Calculate remaining EMIs
      const remainingEMIs = tenureMonths - paidEMIs;

      // Calculate paid amounts
      let remainingPrincipal = loanDetails.loanAmount;
      let totalInterestPaid = 0;
      let totalPrincipalPaid = 0;

      for (let i = 0; i < paidEMIs; i++) {
        const interestPortion = remainingPrincipal * monthlyRate;
        const principalPortion = emi - interestPortion;
        remainingPrincipal -= principalPortion;
        totalInterestPaid += interestPortion;
        totalPrincipalPaid += principalPortion;
      }

      // Calculate pre-closure scenario
      const preclosureAmount = remainingPrincipal * (1 + loanDetails.preclosureCharge / 100);
      const totalCostPreclose = totalPrincipalPaid + totalInterestPaid + preclosureAmount;

      // Calculate continue EMI scenario
      const totalCostEMI = emi * tenureMonths;

      // Calculate investment returns
      const futureValueOfPreclosureAmount = preclosureAmount * 
        Math.pow(1 + loanDetails.investmentRate/100, remainingEMIs/12);

      // Calculate future value of monthly EMI investments
      let futureValueOfEMIs = 0;
      for (let i = 0; i < remainingEMIs; i++) {
        futureValueOfEMIs += emi * Math.pow(1 + loanDetails.investmentRate/100, (remainingEMIs - i - 1)/12);
      }

      // Total future value if continuing EMIs
      const totalFutureValueIfContinue = futureValueOfEMIs;

      setCalculations({
        emi,
        paidEMIs,
        remainingEMIs,
        totalInterestPaid,
        totalPrincipalPaid,
        preclosureAmount,
        totalCostPreclose,
        totalCostEMI,
        futureValueOfPreclosureAmount,
        futureValueOfEMIs,
        totalFutureValueIfContinue
      });
    } catch (error) {
      console.error('Error in calculations:', error);
      setCalculations({
        emi: 0,
        paidEMIs: 0,
        remainingEMIs: 0,
        totalInterestPaid: 0,
        totalPrincipalPaid: 0,
        preclosureAmount: 0,
        totalCostPreclose: 0,
        totalCostEMI: 0,
        futureValueOfPreclosureAmount: 0,
        futureValueOfEMIs: 0,
        totalFutureValueIfContinue: 0
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Loan Pre-closure Analysis</h2>
      
      {/* Input Fields */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Loan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Amount (₹)
            </label>
            <input
              type="number"
              name="loanAmount"
              value={loanDetails.loanAmount}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="interestRate"
              value={loanDetails.interestRate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Start Date
            </label>
            <input
              type="date"
              name="loanStartDate"
              value={loanDetails.loanStartDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pre-closure Date
            </label>
            <input
              type="date"
              name="preClosureDate"
              value={loanDetails.preClosureDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pre-closure Charges (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="preclosureCharge"
              value={loanDetails.preclosureCharge}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Investment Return (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="investmentRate"
              value={loanDetails.investmentRate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* EMI Information */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Monthly EMI</div>
          <div className="text-xl font-bold">₹{formatCurrency(calculations.emi)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">EMIs Paid/Remaining</div>
          <div className="text-xl font-bold">{calculations.paidEMIs}/{calculations.remainingEMIs}</div>
        </div>
      </div>

      {/* Pre-closure Scenario */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Pre-closure Scenario</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Interest Paid</div>
            <div className="text-lg font-bold text-red-600">₹{formatCurrency(calculations.totalInterestPaid)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Principal Paid</div>
            <div className="text-lg font-bold">₹{formatCurrency(calculations.totalPrincipalPaid)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Pre-closure Amount</div>
            <div className="text-lg font-bold">₹{formatCurrency(calculations.preclosureAmount)}</div>
            <div className="text-xs text-gray-500">Including {loanDetails.preclosureCharge}% charges</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Cost with Pre-closure</div>
            <div className="text-lg font-bold">₹{formatCurrency(calculations.totalCostPreclose)}</div>
          </div>
        </div>
      </div>

      {/* Continue EMI Scenario */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Continue EMI Scenario</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-600">Total EMI Payments (36 months)</div>
            <div className="text-lg font-bold text-red-600">₹{formatCurrency(calculations.totalCostEMI)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Extra Cost vs Pre-closure</div>
            <div className="text-lg font-bold text-red-600">
              ₹{formatCurrency(calculations.totalCostEMI - calculations.totalCostPreclose)}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Scenario */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Investment Scenario at {loanDetails.investmentRate}% Return
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Future Value of Pre-closure Amount if Invested</div>
              <div className="text-lg font-bold">₹{formatCurrency(calculations.futureValueOfPreclosureAmount)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Future Value of Monthly EMI Investments</div>
              <div className="text-lg font-bold">₹{formatCurrency(calculations.futureValueOfEMIs)}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Future Value if Continuing EMIs</div>
            <div className="text-lg font-bold">₹{formatCurrency(calculations.totalFutureValueIfContinue)}</div>
          </div>
          <div className="pt-2 border-t">
            <div className="text-sm text-gray-600">Financial Benefit of Continuing EMIs</div>
            <div className={`text-lg font-bold ${(calculations.totalFutureValueIfContinue - calculations.futureValueOfPreclosureAmount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{formatCurrency(calculations.totalFutureValueIfContinue - calculations.futureValueOfPreclosureAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="text-lg font-bold mb-2">Recommendation:</div>
        <div className="text-2xl font-bold text-blue-600 mb-2">
          {(calculations.totalFutureValueIfContinue - calculations.futureValueOfPreclosureAmount) > 0 
            ? 'CONTINUE WITH EMI' 
            : 'PRE-CLOSE THE LOAN'
          }
        </div>
        <div className="text-sm text-gray-600">
          {(calculations.totalFutureValueIfContinue - calculations.futureValueOfPreclosureAmount) > 0 
            ? `If you continue EMIs and invest them at ${loanDetails.investmentRate}% return, 
               you'll be better off by ₹${formatCurrency(calculations.totalFutureValueIfContinue - calculations.futureValueOfPreclosureAmount)}.`
            : `Pre-closing the loan would be better as the investment returns at ${loanDetails.investmentRate}% 
               won't overcome the interest costs.`
          }
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;