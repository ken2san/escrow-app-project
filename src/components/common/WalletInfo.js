import React from 'react';

import { useTranslation } from 'react-i18next';

export default function WalletInfo({ walletAddress = '0x1234...abcd', onChainBalance = '1,234.56', unit = 'PT', onSync, onCopy, syncing = false }) {
  const { t } = useTranslation();
  return (
    <div className="mt-2 text-left bg-gray-900 rounded-lg p-2 border border-gray-700">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{t('walletAddress') || 'ウォレットアドレス'}</span>
        <button
          className="text-xs text-indigo-400 hover:underline focus:outline-none"
          title={t('copy') || 'コピー'}
          onClick={() => onCopy ? onCopy(walletAddress) : navigator.clipboard.writeText(walletAddress)}
        >
          {t('copy') || 'コピー'}
        </button>
      </div>
      <div className="text-xs font-mono text-green-300 truncate">{walletAddress}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">{t('onChainBalance') || 'オンチェーン残高'}</span>
        <button
          className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none ml-2"
          style={{ fontSize: '0.75rem' }}
          onClick={onSync}
          disabled={syncing}
        >
          {syncing ? t('syncing') || '同期中...' : t('sync') || '同期'}
        </button>
      </div>
      <div className="text-xs font-mono text-blue-200">{onChainBalance} {unit} <span className="ml-1 text-[10px] bg-indigo-700 text-white px-1 rounded">on-chain</span></div>
    </div>
  );
}
