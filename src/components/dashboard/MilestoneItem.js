import React, { useState } from 'react';
import { Paperclip, CheckCircle, AlertOctagon, FileUp, Banknote } from 'lucide-react';
import { getStatusPillStyle, getStatusIcon } from '../../utils/helpers';

const MilestoneItem = ({ milestone, project, userRole, lang, t, onUpdateMilestoneStatus }) => {
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const getMilestoneStatusText = (status) => {
    switch (status) {
      case 'paid': return t.statusPaid;
      case 'approved': return t.statusApproved;
      case 'submitted': return t.statusSubmitted;
      case 'rejected': return t.statusRejected;
      case 'in_progress': return t.statusInProgress;
      case 'pending': return t.statusPending;
      default: return status;
    }
  };

  const handleStartWork = () =>
    onUpdateMilestoneStatus(project.id, milestone.id, 'in_progress');
  const handleSubmitDeliverables = () =>
    onUpdateMilestoneStatus(project.id, milestone.id, 'submitted', {
      submittedFile: `deliverable_${milestone.id}.zip`,
    });
  const handleApproveMilestone = () =>
    onUpdateMilestoneStatus(project.id, milestone.id, 'approved');
  const handleRejectMilestone = () => {
    if (!rejectionReasonInput.trim()) {
      alert(lang === 'ja' ? '差戻し理由を入力してください。' : 'Please enter a rejection reason.');
      return;
    }
    onUpdateMilestoneStatus(project.id, milestone.id, 'rejected', {
      rejectionReason: rejectionReasonInput,
    });
    setShowRejectionInput(false);
    setRejectionReasonInput('');
  };
  const handleExecutePayment = () =>
    onUpdateMilestoneStatus(project.id, milestone.id, 'paid');

  return (
    <div className="border-t border-gray-200 py-3 px-1 first:border-t-0">
      <div className="flex justify-between items-center">
        <h5 className="font-semibold text-sm text-gray-700">
          {milestone.name}
        </h5>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center ${getStatusPillStyle(
            milestone.status
          )}`}
        >
          {getStatusIcon(milestone.status)}{' '}
          {getMilestoneStatusText(milestone.status)}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">
        {t.dueDate}: {milestone.dueDate} | {t.totalAmount}: ¥
        {milestone.amount.toLocaleString()}
      </p>
      {milestone.description && (
        <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-1.5 rounded">
          {milestone.description}
        </p>
      )}
    </div>
  );
};

export default MilestoneItem;