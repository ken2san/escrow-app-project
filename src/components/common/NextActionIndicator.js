import React from 'react';
import { AlertCircle } from 'lucide-react';

const NextActionIndicator = ({ project, currentUserRole, t }) => {
  let actionText = null;
  let actionColor = 'text-gray-600';

  if (currentUserRole === 'client') {
    if (
      project.status === t.statusWorkReady &&
      project.fundsDeposited < project.totalAmount
    ) {
      actionText = t.nextAction_client_depositFunds;
      actionColor = 'text-yellow-600';
    } else if (project.status === t.statusInProgress) {
      const submittedMilestone = project.milestones.find(
        (m) => m.status === 'submitted'
      );
      if (submittedMilestone) {
        actionText = t.nextAction_client_approveMilestone;
        actionColor = 'text-orange-600';
      } else {
        const payableMilestone = project.milestones.find(
          (m) =>
            m.status === 'approved' &&
            project.fundsDeposited >= m.amount &&
            (!m.paidDate || m.status !== 'paid')
        );
        if (payableMilestone) {
          actionText = t.nextAction_client_payMilestone;
          actionColor = 'text-teal-600';
        }
      }
    }
  } else if (currentUserRole === 'contractor') {
    if (project.status === t.statusInProgress) {
      const pendingMilestone = project.milestones.find(
        (m) => m.status === 'pending'
      );
      if (pendingMilestone && project.fundsDeposited > 0) {
        actionText = t.nextAction_contractor_startWork;
        actionColor = 'text-blue-600';
      } else {
        const workInProgressMilestone = project.milestones.find(
          (m) => m.status === 'in_progress' || m.status === 'rejected'
        );
        if (workInProgressMilestone) {
          actionText = t.nextAction_contractor_submitDeliverables;
          actionColor = 'text-green-600';
        }
      }
    }
  }

  if (!actionText) {
    return null;
  }

  return (
    <div
      className={`mt-2 text-xs font-medium flex items-center ${actionColor}`}
    >
      <AlertCircle size={14} className="mr-1.5" />
      <span>
        {t.nextActionRequired} {actionText}
      </span>
    </div>
  );
};

export default NextActionIndicator;
