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
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 mb-4 shadow-sm">
      {/* Project name and total amount */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          {project.name}
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">総額</div>
          <div className="text-xl font-bold text-indigo-700">{formatAmount(totalAmount)} pt</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>支払い進捗</span>
          <span className="font-semibold text-indigo-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Payment details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
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
