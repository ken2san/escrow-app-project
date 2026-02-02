
import React, { useState } from 'react';
// For QR code, use a placeholder image (could be replaced with a QR component later)


const paymentMethods = [
  { key: 'creditCard', label: 'Credit Card' },
  { key: 'paypal', label: 'PayPal' },
  { key: 'bankTransfer', label: 'Bank Transfer' },
  { key: 'crypto', label: 'Cryptocurrency' },
];

const dummyWallet = '0x1234...abcd';
const dummyQR = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=0x1234...abcd';

const PurchasePointsModal = ({ isOpen, onClose, onPurchase, t }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('creditCard');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [paypalEmail, setPaypalEmail] = useState('');
  const [bankInfo, setBankInfo] = useState({ name: '', ref: '' });
  const [txState, setTxState] = useState('idle'); // idle | sending | block | done
  if (!isOpen) return null;
  const isAmountValid = Number(amount) > 0;
  const isCardValid = card.number.trim() && card.expiry.trim() && card.cvc.trim();
  const isPaypalValid = paypalEmail.trim().includes('@');
  const isBankValid = bankInfo.name.trim() && bankInfo.ref.trim();
  const isMethodValid =
    (method === 'creditCard' && isCardValid) ||
    (method === 'paypal' && isPaypalValid) ||
    (method === 'bankTransfer' && isBankValid) ||
    method === 'crypto';
  // Progress messages
  const txMessages = {
    sending: t('sendingTx') || 'Sending transaction...',
    block: t('blockGenerating') || 'Block being generated...',
    done: t('onChainDone') || 'Recorded on blockchain!'
  };
  // Progress animation
  const renderTxProgress = () => {
    if (txState === 'idle') return null;
    if (txState === 'done') {
      return (
        <div className="flex flex-col items-center my-6">
          <svg className="w-12 h-12 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <div className="text-green-500 font-bold text-lg">{txMessages.done}</div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center my-6">
        <svg className="animate-spin w-10 h-10 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        <div className="text-indigo-500 font-semibold">{txMessages[txState]}</div>
      </div>
    );
  };
  // Purchase flow
  const handlePurchase = () => {
    if (!isAmountValid || !isMethodValid) return;
    setTxState('sending');
    setTimeout(() => {
      setTxState('block');
      setTimeout(() => {
        setTxState('done');
        setTimeout(() => {
          setTxState('idle');
          setAmount('');
          onPurchase(Number(amount));
          onClose();
        }, 1200);
      }, 1400);
    }, 1200);
  };
  const isProcessing = txState !== 'idle';
  const canPurchase = isAmountValid && isMethodValid && !isProcessing;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-xs border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-100 text-center">
          {t('purchasePoints') || 'ポイント購入'}
        </h2>
        {/* Payment method selection */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {paymentMethods.map((m) => (
            <button
              key={m.key}
              className={`px-2 py-1 rounded border text-xs font-medium transition ${method === m.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              onClick={() => setMethod(m.key)}
              type="button"
            >
              {t(m.key) || m.label}
            </button>
          ))}
        </div>
        {renderTxProgress()}
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('pointsToPurchase') || '購入ポイント数'}
        </label>
        <input
          type="number"
          min="1"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder={t('enterPointsAmount') || '例: 100'}
          disabled={isProcessing}
        />
        {/* Payment method-specific input fields */}
        {method === 'creditCard' && (
          <div className="mb-4 space-y-2">
            <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Card Number" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} />
            <div className="flex gap-1 min-w-0">
              <input type="text" className="flex-1 border rounded px-3 py-2 text-sm min-w-0" placeholder="MM/YY" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} />
              <input type="text" className="border rounded px-3 py-2 text-sm min-w-0 max-w-[80px]" placeholder="CVC" value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} />
            </div>
            {!isCardValid && (
              <p className="text-xs text-red-500">カード情報を入力してください</p>
            )}
          </div>
        )}
        {method === 'paypal' && (
          <div className="mb-4">
            <input type="email" className="w-full border rounded px-3 py-2 text-sm" placeholder="PayPal Email" value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} />
            <p className="text-xs text-gray-500 mt-1">{t('paypalInstruction') || 'You will be redirected to PayPal after clicking Purchase.'}</p>
            {!isPaypalValid && (
              <p className="text-xs text-red-500 mt-1">有効なメールアドレスを入力してください</p>
            )}
          </div>
        )}
        {method === 'bankTransfer' && (
          <div className="mb-4">
            <input type="text" className="w-full border rounded px-3 py-2 text-sm mb-2" placeholder="Bank Name" value={bankInfo.name} onChange={e => setBankInfo({ ...bankInfo, name: e.target.value })} />
            <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Reference Code" value={bankInfo.ref} onChange={e => setBankInfo({ ...bankInfo, ref: e.target.value })} />
            <p className="text-xs text-gray-500 mt-1">{t('bankInstruction') || 'Transfer to the designated bank account. Enter the reference code above.'}</p>
            {!isBankValid && (
              <p className="text-xs text-red-500 mt-1">銀行名と参照コードを入力してください</p>
            )}
          </div>
        )}
        {method === 'crypto' && (
          <div className="mb-4 text-center">
            <div className="mb-2">
              <span className="text-xs text-gray-400">{t('sendToWallet') || 'Send to wallet address:'}</span>
              <div className="font-mono text-green-400 text-xs mt-1">{dummyWallet}</div>
            </div>
            <img src={dummyQR} alt="QR code" className="mx-auto mb-2 rounded bg-white p-1 border border-gray-300" style={{ width: 80, height: 80 }} />
            <p className="text-xs text-gray-500">{t('cryptoInstruction') || 'Send the exact amount to the above address. Tx hash will be shown after confirmation.'}</p>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition"
            onClick={() => { setAmount(''); onClose(); }}
            disabled={isProcessing}
          >
            {t('cancel') || 'キャンセル'}
          </button>
          <button
            className={`px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-sm transition border border-indigo-500 ${(!amount || amount <= 0 || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handlePurchase}
            disabled={!canPurchase}
          >
            {isProcessing ? t('processing') || '処理中...' : (t('purchase') || '購入')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchasePointsModal;
