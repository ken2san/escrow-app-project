import React, { useState } from 'react';


const SendPointsModal = ({ isOpen, onClose, onSend, walletAddress, t }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState('idle'); // idle | sending | block | done
  const [txHash, setTxHash] = useState('');

  if (!isOpen) return null;

  const txMessages = {
    sending: t('sendingTx') || 'Sending transaction...',
    block: t('blockGenerating') || 'Block being generated...',
    done: t('onChainDone') || 'Recorded on blockchain!'
  };

  const renderTxProgress = () => {
    if (txState === 'idle') return null;
    if (txState === 'done') {
      return (
        <div className="flex flex-col items-center my-3">
          <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <div className="text-green-500 font-bold text-base">{txMessages.done}</div>
          {txHash && <span className="text-xs text-blue-400 font-mono mt-1">{txHash}</span>}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center my-3">
        <svg className="animate-spin w-8 h-8 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        <div className="text-indigo-500 font-semibold">{txMessages[txState]}</div>
      </div>
    );
  };

  const handleSend = () => {
    setTxState('sending');
    setTimeout(() => {
      setTxState('block');
      setTimeout(() => {
        setTxState('done');
        const dummyHash = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(-4);
        setTxHash(dummyHash);
        if (onSend) onSend({ recipient, amount, txHash: dummyHash });
        setTimeout(() => {
          setTxState('idle');
          setRecipient('');
          setAmount('');
          setTxHash('');
          onClose();
        }, 1200);
      }, 1400);
    }, 1200);
  };
  const isProcessing = txState !== 'idle';

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
          disabled={isProcessing}
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
          disabled={isProcessing}
        />
        {renderTxProgress()}
        <div className="flex justify-end gap-2 mt-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition"
            onClick={onClose}
            disabled={isProcessing}
          >
            {t('cancel') || 'キャンセル'}
          </button>
          <button
            className={`px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-sm transition border border-indigo-500 ${(!recipient || !amount || amount <= 0 || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSend}
            disabled={!recipient || !amount || amount <= 0 || isProcessing}
          >
            {isProcessing ? t('processing') || '処理中...' : (t('send') || '送信')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendPointsModal;
