import React, { useState } from 'react';

const dummyWallet = '0x1234...abcd';
const dummyQR = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=0x1234...abcd';

const ReceivePointsModal = ({ isOpen, onClose, walletAddress = dummyWallet, t }) => {
  const [txState, setTxState] = useState('idle'); // idle | sending | block | done
  if (!isOpen) return null;
  const txMessages = {
    sending: t('sendingTx') || 'Sending receive request...',
    block: t('blockGenerating') || 'Block being generated...',
    done: t('onChainDone') || 'Recorded on blockchain!'
  };
  const renderTxProgress = () => {
    if (txState === 'idle') return null;
    if (txState === 'done') {
      return (
        <div className="flex flex-col items-center my-6">
          <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <div className="text-green-500 font-bold text-base">{txMessages.done}</div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center my-6">
        <svg className="animate-spin w-8 h-8 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        <div className="text-indigo-500 font-semibold">{txMessages[txState]}</div>
      </div>
    );
  };
  const isProcessing = txState !== 'idle';
  const handleReceive = () => {
    setTxState('sending');
    setTimeout(() => {
      setTxState('block');
      setTimeout(() => {
        setTxState('done');
        setTimeout(() => {
          setTxState('idle');
          onClose();
        }, 1200);
      }, 1400);
    }, 1200);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-xs border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-100 text-center">
          {t('receivePoints') || 'ポイント受取'}
        </h2>
        <div className="mb-4 text-center">
          <span className="text-xs text-gray-400">{t('yourWalletAddress') || 'あなたのウォレットアドレス'}</span>
          <div className="font-mono text-green-400 text-xs mt-1 mb-2">{walletAddress}</div>
          <img src={dummyQR} alt="QR code" className="mx-auto mb-2 rounded bg-white p-1 border border-gray-300" style={{ width: 80, height: 80 }} />
        </div>
        {renderTxProgress()}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-sm transition border border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleReceive}
            disabled={isProcessing}
          >
            {isProcessing ? t('processing') || '処理中...' : (t('receivePoints') || 'ポイント受取')}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition"
            onClick={onClose}
            disabled={isProcessing}
          >
            {t('close') || '閉じる'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceivePointsModal;
