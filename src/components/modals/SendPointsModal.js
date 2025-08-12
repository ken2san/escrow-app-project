import React, { useState } from 'react';

const SendPointsModal = ({ isOpen, onClose, onSend, walletAddress, t }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      const dummyHash = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(-4);
      setTxHash(dummyHash);
      setSending(false);
      if (onSend) onSend({ recipient, amount, txHash: dummyHash });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-xs border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-100 text-center">
          {t('sendPoints') || 'ポイント送信'}
        </h2>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('recipientAddress') || '宛先ウォレットアドレス'}
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="0x..."
        />
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('amount') || '金額'}
        </label>
        <input
          type="number"
          min="1"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="例: 100"
        />
        {sending ? (
          <div className="text-center text-indigo-500 my-3">{t('sendingTx') || '送信中...ブロック生成中...'}</div>
        ) : txHash ? (
          <div className="text-center text-green-500 my-3">
            {t('txSent') || '送信完了！'}<br />
            <span className="text-xs text-blue-400 font-mono">{txHash}</span>
          </div>
        ) : null}
        <div className="flex justify-end gap-2 mt-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition"
            onClick={onClose}
            disabled={sending}
          >
            {t('cancel') || 'キャンセル'}
          </button>
          <button
            className={`px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-sm transition border border-indigo-500 ${(!recipient || !amount || amount <= 0 || sending) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSend}
            disabled={!recipient || !amount || amount <= 0 || sending}
          >
            {t('send') || '送信'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendPointsModal;
