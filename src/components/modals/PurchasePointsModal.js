
import React, { useState } from 'react';

const PurchasePointsModal = ({ isOpen, onClose, onPurchase, t }) => {
  const [amount, setAmount] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-xs border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-100 text-center">
          {t('purchasePoints') || 'ポイント購入'}
        </h2>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('pointsToPurchase') || '購入ポイント数'}
        </label>
        <input
          type="number"
          min="1"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder={t('enterPointsAmount') || '例: 100'}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition"
            onClick={() => { setAmount(''); onClose(); }}
          >
            {t('cancel') || 'キャンセル'}
          </button>
          <button
            className={`px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-sm transition border border-indigo-500 ${(!amount || amount <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => { if (amount > 0) { onPurchase(Number(amount)); setAmount(''); } }}
            disabled={!amount || amount <= 0}
          >
            {t('purchase') || '購入'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchasePointsModal;
