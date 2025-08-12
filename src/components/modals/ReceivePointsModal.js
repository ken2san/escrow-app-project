import React from 'react';

const dummyWallet = '0x1234...abcd';
const dummyQR = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=0x1234...abcd';

const ReceivePointsModal = ({ isOpen, onClose, walletAddress = dummyWallet, t }) => {
  if (!isOpen) return null;
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
        <div className="flex justify-end">
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

export default ReceivePointsModal;
