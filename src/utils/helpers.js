import React from 'react';
import { Clock, FileUp, DollarSign, CheckCircle, ShieldCheck, AlertTriangle, Target, HelpCircle, AlertOctagon, FileSignature, ListChecks, Briefcase } from 'lucide-react';

export const getStatusPillStyle = (status) => {
  switch (status) {
    case '作業中':
    case 'in_progress':
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'レビュー中':
    case 'submitted':
    case 'In Review':
    case '承認待ち':
      return 'bg-yellow-100 text-yellow-700';
    case '支払い待ち':
    case 'Payment Waiting':
      return 'bg-orange-100 text-orange-700';
    case '完了':
    case 'paid':
    case 'approved':
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case '協議中':
    case 'In Dispute':
    case 'Under Discussion':
      return 'bg-red-100 text-red-700';
    case '募集中':
    case 'Open for Proposals':
      return 'bg-cyan-100 text-cyan-700';
    case 'pending':
    case 'Pending':
      return 'bg-gray-100 text-gray-600';
    case 'rejected':
    case 'Rejected':
      return 'bg-pink-100 text-pink-700';
    case '契約準備中':
    case 'Agreement Pending':
      return 'bg-purple-100 text-purple-700';
    case '作業準備完了':
    case 'Ready for Work':
      return 'bg-sky-100 text-sky-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case '作業中':
    case 'in_progress':
    case 'In Progress':
      return <Clock className="mr-1 h-4 w-4" />;
    case 'レビュー中':
    case 'submitted':
    case 'In Review':
    case '承認待ち':
      return <FileUp className="mr-1 h-4 w-4" />;
    case '支払い待ち':
    case 'Payment Waiting':
      return <DollarSign className="mr-1 h-4 w-4" />;
    case '完了':
    case 'paid':
    case 'Completed':
      return <CheckCircle className="mr-1 h-4 w-4" />;
    case 'approved':
    case 'Approved':
      return <ShieldCheck className="mr-1 h-4 w-4" />;
    case '協議中':
    case 'In Dispute':
    case 'Under Discussion':
      return <AlertTriangle className="mr-1 h-4 w-4" />;
    case '募集中':
    case 'Open for Proposals':
      return <Target className="mr-1 h-4 w-4" />;
    case 'pending':
    case 'Pending':
      return <HelpCircle className="mr-1 h-4 w-4" />;
    case 'rejected':
    case 'Rejected':
      return <AlertOctagon className="mr-1 h-4 w-4" />;
    case '契約準備中':
    case 'Agreement Pending':
      return <FileSignature className="mr-1 h-4 w-4" />;
    case '作業準備完了':
    case 'Ready for Work':
      return <ListChecks className="mr-1 h-4 w-4" />;
    default:
      return <Briefcase className="mr-1 h-4 w-4" />;
  }
};