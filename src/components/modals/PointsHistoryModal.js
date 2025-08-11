import React from 'react';

const PointsHistoryModal = ({ isOpen, onClose, transactions, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-5 text-gray-800 dark:text-gray-100 text-center">
          {t('pointsHistory') || 'ポイント履歴'}
        </h2>
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">{t('noHistory') || '履歴がありません'}</p>
          ) : (
            transactions.slice().reverse().map(tx => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{tx.description}</div>
                  <div className="text-xs text-gray-400">{tx.date}</div>
                </div>
                <div className={`text-base font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} pt
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition"
            onClick={onClose}
          >
            {t('close') || '閉じる'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointsHistoryModal;
