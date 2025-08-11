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
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {t('submitProposalFor')}「{project.name}」
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="proposalText"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('proposalMessage')} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="proposalText"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              rows="6"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="proposedAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('proposedAmount')} ({t('optional')})
              </label>
              <input
                type="number"
                id="proposedAmount"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder={`${lang === 'ja' ? '例: ' : 'e.g., '}${
                  project.totalAmount || '75000'
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="estimatedTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('estimatedDeliveryTime')} ({t('optional')})
              </label>
              <input
                type="text"
                id="estimatedTime"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder={lang === 'ja' ? '例: 2週間' : 'e.g., 2 weeks'}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('attachPortfolio')} ({t('optional')})
            </label>
            <input
              type="file"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center shadow-sm"
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
