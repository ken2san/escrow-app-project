import React, { useState, useEffect } from 'react';
import { X, SendHorizonal } from 'lucide-react';

const ProposalModal = ({ isOpen, onClose, onSubmit, project, lang, t, currentUser }) => {
  const [proposalText, setProposalText] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    if (project) {
      setProposalText('');
      setProposedAmount(project.totalAmount ? String(project.totalAmount) : '');
      setEstimatedTime('');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      projectId: project.id,
      proposalText,
      proposedAmount: Number(proposedAmount) || project.totalAmount,
      estimatedDeliveryTime: estimatedTime,
      contractorId: currentUser.id,
      contractorName: currentUser.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">
            {t('submitProposalFor')}「{project.name}」
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="proposalText"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {t('proposalMessage')} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="proposalText"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              rows="6"
              className="w-full p-2 border border-slate-200 rounded-md shadow-sm focus:ring-indigo-400 focus:border-indigo-400 text-sm bg-slate-50"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="proposedAmount"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {t('proposedAmount')} ({t('optional')})
              </label>
              <input
                type="number"
                id="proposedAmount"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-md shadow-sm focus:ring-indigo-400 focus:border-indigo-400 text-sm bg-slate-50"
                placeholder={`${lang === 'ja' ? '例: ' : 'e.g., '}${
                  project.totalAmount || '75000'
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="estimatedTime"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {t('estimatedDeliveryTime')} ({t('optional')})
              </label>
              <input
                type="text"
                id="estimatedTime"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-md shadow-sm focus:ring-indigo-400 focus:border-indigo-400 text-sm bg-slate-50"
                placeholder={lang === 'ja' ? '例: 2週間' : 'e.g., 2 weeks'}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('attachPortfolio')} ({t('optional')})
            </label>
            <input
              type="file"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center shadow-sm transition"
            >
              <SendHorizonal size={16} className="mr-2" />
              {t('submitProposal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default ProposalModal;
