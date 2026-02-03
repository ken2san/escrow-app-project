import React from 'react';

/**
 * Display project payment summary with progress bar
 * Shows total amount, deposited funds, released funds, remaining funds, and completion rate
 */
const ProjectPaymentSummary = ({ project, paymentStatus }) => {
  const { totalAmount, fundsReleased, fundsRemaining, completionRate } = paymentStatus;

  // Format number with commas
  const formatAmount = (amount) => {
    return amount.toLocaleString('ja-JP');
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-3 mb-3 shadow-sm">
      {/* Project name and total amount */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-gray-800 flex items-center">
          <span className="text-xl mr-2">📊</span>
          {project.name}
        </h3>
        <div className="text-right">
          <div className="text-xs text-gray-600">総額</div>
          <div className="text-lg font-bold text-indigo-700">{formatAmount(totalAmount)} pt</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>支払い進捗</span>
          <span className="font-semibold text-indigo-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Payment details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center">
          <span className="text-green-600 font-bold mr-1">✅</span>
          <span className="text-gray-600">支払済:</span>
          <span className="ml-1 font-semibold text-gray-800">{formatAmount(fundsReleased)} pt</span>
        </div>
        <div className="flex items-center">
          <span className="text-blue-600 font-bold mr-1">⏳</span>
          <span className="text-gray-600">残り:</span>
          <span className="ml-1 font-semibold text-gray-800">{formatAmount(fundsRemaining)} pt</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectPaymentSummary;
