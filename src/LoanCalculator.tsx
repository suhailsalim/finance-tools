import { useCallback, useEffect, useState } from "react";

type AmortizationSchedule = {
  month: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  remainingPrincipal: number;
  totalPaid: number;
}

export default function LoanCalculator() {
  const [loanDetails, setLoanDetails] = useState({
    loanAmount: 800000,
    interestRate: 12,
    loanStartDate: "2024-04-01",
    preClosureDate: "2025-04-01",
    preclosureCharge: 4,
    investmentRate: 8,
    tenureMonths: 36,
  });

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
    totalFutureValueIfContinue: 0,
    amortizationSchedule: [] as AmortizationSchedule[],
  });

  const [showAmortization, setShowAmortization] = useState(false);

  const formatCurrency = (value: number) => {
    return (Number(value) || 0).toFixed(2);
  };

  const calculateAmortizationSchedule = (
    emi: number,
    principal: number,
    monthlyRate: number,
    totalMonths: number
  ) => {
    let remainingPrincipal = principal;
    const schedule = [];

    for (let month = 1; month <= totalMonths; month++) {
      const interestForMonth = remainingPrincipal * monthlyRate;
      const principalForMonth = emi - interestForMonth;
      remainingPrincipal = Math.max(0, remainingPrincipal - principalForMonth);

      schedule.push({
        month,
        emi,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        remainingPrincipal,
        totalPaid: emi * month,
      });
    }

    return schedule;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "loanStartDate" || name === "preClosureDate") {
      setLoanDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setLoanDetails((prev) => ({
        ...prev,
        [name]: Number(value) || 0,
      }));
    }
  };

  const calculateLoanDetails = useCallback(() => {
    try {
      const monthlyRate = loanDetails.interestRate / 100 / 12;
      const tenureMonths = parseInt(String(loanDetails.tenureMonths)) || 0;

      if (tenureMonths <= 0 || loanDetails.loanAmount <= 0) {
        return;
      }

      const emi =
        (loanDetails.loanAmount *
          monthlyRate *
          Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

      const startDate = new Date(loanDetails.loanStartDate);
      const preCloseDate = new Date(loanDetails.preClosureDate);
      const monthsDiff =
        (preCloseDate.getFullYear() - startDate.getFullYear()) * 12 +
        preCloseDate.getMonth() -
        startDate.getMonth();
      const paidEMIs = Math.max(0, monthsDiff);
      const remainingEMIs = tenureMonths - paidEMIs;

      const amortizationSchedule = calculateAmortizationSchedule(
        emi,
        loanDetails.loanAmount,
        monthlyRate,
        tenureMonths
      );

      const valuesAtPreClosure = amortizationSchedule[paidEMIs - 1] || {
        remainingPrincipal: loanDetails.loanAmount,
        totalPaid: 0,
      };

      const preclosureAmount =
        valuesAtPreClosure.remainingPrincipal *
        (1 + loanDetails.preclosureCharge / 100);
      const totalCostPreclose = valuesAtPreClosure.totalPaid + preclosureAmount;

      const totalCostEMI = emi * tenureMonths;

      const futureValueOfPreclosureAmount =
        preclosureAmount *
        Math.pow(1 + loanDetails.investmentRate / 100, remainingEMIs / 12);

      let futureValueOfEMIs = 0;
      for (let i = 0; i < remainingEMIs; i++) {
        futureValueOfEMIs +=
          emi *
          Math.pow(
            1 + loanDetails.investmentRate / 100,
            (remainingEMIs - i - 1) / 12
          );
      }

      setCalculations({
        emi,
        paidEMIs,
        remainingEMIs,
        totalInterestPaid:
          valuesAtPreClosure.totalPaid -
          (loanDetails.loanAmount - valuesAtPreClosure.remainingPrincipal),
        totalPrincipalPaid:
          loanDetails.loanAmount - valuesAtPreClosure.remainingPrincipal,
        preclosureAmount,
        totalCostPreclose,
        totalCostEMI,
        futureValueOfPreclosureAmount,
        futureValueOfEMIs,
        totalFutureValueIfContinue: futureValueOfEMIs,
        amortizationSchedule,
      });
    } catch (error) {
      console.error("Error in calculations:", error);
    }
  }, [loanDetails]);

  useEffect(() => {
    calculateLoanDetails();
  }, [calculateLoanDetails]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg text-black">
      <h2 className="text-2xl font-bold text-center mb-6">
        Loan Pre-closure Analysis
      </h2>

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
              Loan Tenure (months)
            </label>
            <input
              type="number"
              name="tenureMonths"
              value={loanDetails.tenureMonths}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Monthly EMI</div>
          <div className="text-xl font-bold">
            ₹{formatCurrency(calculations.emi)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">EMIs Paid/Remaining</div>
          <div className="text-xl font-bold">
            {calculations.paidEMIs}/{calculations.remainingEMIs}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Pre-closure Scenario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Interest Paid</div>
            <div className="text-lg font-bold text-red-600">
              ₹{formatCurrency(calculations.totalInterestPaid)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Principal Paid</div>
            <div className="text-lg font-bold">
              ₹{formatCurrency(calculations.totalPrincipalPaid)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Pre-closure Amount</div>
            <div className="text-lg font-bold">
              ₹{formatCurrency(calculations.preclosureAmount)}
            </div>
            <div className="text-xs text-gray-500">
              Including {loanDetails.preclosureCharge}% charges
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">
              Total Cost with Pre-closure
            </div>
            <div className="text-lg font-bold">
              ₹{formatCurrency(calculations.totalCostPreclose)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Investment Scenario at {loanDetails.investmentRate}% Return
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">
                Future Value of Pre-closure Amount if Invested
              </div>
              <div className="text-lg font-bold">
                ₹{formatCurrency(calculations.futureValueOfPreclosureAmount)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">
                Future Value of Monthly EMI Investments
              </div>
              <div className="text-lg font-bold">
                ₹{formatCurrency(calculations.futureValueOfEMIs)}
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">
              Total Future Value if Continuing EMIs
            </div>
            <div className="text-lg font-bold">
              ₹{formatCurrency(calculations.totalFutureValueIfContinue)}
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="text-sm text-gray-600">
              Financial Benefit of Continuing EMIs
            </div>
            <div
              className={`text-lg font-bold ${
                calculations.totalFutureValueIfContinue -
                  calculations.futureValueOfPreclosureAmount >
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹
              {formatCurrency(
                calculations.totalFutureValueIfContinue -
                  calculations.futureValueOfPreclosureAmount
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Amortization Schedule</h3>
          <button
            onClick={() => setShowAmortization(!showAmortization)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAmortization ? "Hide" : "Show"} Schedule
          </button>
        </div>

        {showAmortization && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-right">EMI</th>
                  <th className="px-4 py-2 text-right">Principal</th>
                  <th className="px-4 py-2 text-right">Interest</th>
                  <th className="px-4 py-2 text-right">Balance</th>
                  <th className="px-4 py-2 text-right">Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {calculations.amortizationSchedule.map((row) => (
                  <tr key={row.month} className="border-t">
                    <td className="px-4 py-2">{row.month}</td>
                    <td className="px-4 py-2 text-right">
                      ₹{formatCurrency(row.emi)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ₹{formatCurrency(row.principalPaid)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ₹{formatCurrency(row.interestPaid)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ₹{formatCurrency(row.remainingPrincipal)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ₹{formatCurrency(row.totalPaid)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
