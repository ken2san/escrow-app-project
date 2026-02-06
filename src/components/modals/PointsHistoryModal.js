import React from 'react';

const PointsHistoryModal = ({ isOpen, onClose, transactions, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md border border-slate-200">
        <h2 className="text-lg font-bold mb-5 text-slate-800 text-center">
          {t('pointsHistory') || 'ポイント履歴'}
        </h2>
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.length === 0 ? (
            <p className="text-center text-slate-400 py-8">{t('noHistory') || '履歴がありません'}</p>
          ) : (
            transactions.slice().reverse().map(tx => (
              <div key={tx.id} className="py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{tx.description}</div>
                  <div className="text-xs text-gray-400">{tx.date}</div>
                  {tx.txHash && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-blue-400">{tx.txHash.slice(0, 6) + '...' + tx.txHash.slice(-4)}</span>
                      <button type="button" className="text-xs text-indigo-500 underline hover:text-indigo-700" title="View on Etherscan (dummy)" tabIndex={0}>Etherscan</button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  <span className={`text-base font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount} pt</span>
                  <span className="ml-1 text-[10px] bg-indigo-700 text-white px-1 rounded">on-chain</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
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
