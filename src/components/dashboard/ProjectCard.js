import React from 'react';
import MilestoneItem from './MilestoneItem';
import ProposalItem from './ProposalItem';
import StarRatingDisplay from '../common/StarRatingDisplay';
import TabButton from '../common/TabButton';
import NextActionIndicator from '../common/NextActionIndicator';
import { getStatusPillStyle, getStatusIcon } from '../../utils/helpers';
import { Users, ListChecks, FileSignature, Award, AlertOctagon, Zap, Eye, Heart, Banknote, Undo2, Star, SendHorizonal, AlertTriangle } from 'lucide-react';

const ProjectCard = ({
    project,
    onSelect,
    isSelected,
    currentUser,
    openProposalModalFunc,
    openDepositModalFunc,
    t,
    currentLanguage,
    currentViewMode,
    setActivePage,
    setActiveProjectDetailTab,
    activeProjectDetailTab,
    handleGenerateDisputeSummary,
    isLoadingGemini,
    selectedProjectId,
    handleUpdateMilestoneStatus,
    handleSelectProposal,
    handleCancelProposalSelection,
    openProposalDetailsModal,
    isRecommendedCard
}) => {
  const progress =
    project.milestones?.length > 0
      ? (project.milestones.filter(
          (m) => m.status === 'paid' || m.status === 'approved'
        ).length /
          project.milestones.length) *
        100
      : 0;
  const isUserClient = project.clientId === currentUser.id;
  const isUserContractorInvolved = project.contractorId === currentUser.id;
  const isAnyProposalSelectedOnThisProject = project.proposals?.some(
    (p) => p.status === 'accepted'
  );
  const hasUserProposed = project.proposals?.some(
    (prop) => prop.contractorId === currentUser.id && prop.status !== 'archived'
  );

  // 英語対応: 表示フィールドを言語で切り替え
  const getField = (obj, key) => {
    if (currentLanguage === 'en' && obj[key + '_en']) return obj[key + '_en'];
    return obj[key];
  };


  const handleTabChange = (tabName) => {
    if (isSelected) {
      setActiveProjectDetailTab(tabName);
    }
  };

  const getProjectStatusText = (status) => {
    switch (status) {
      case '作業中': return t('statusInProgress');
      case '承認待ち': return t('statusInReview');
      case '支払い待ち': return t('statusPaymentWaiting');
      case '完了': return t('statusCompleted');
      case '協議中': return t('statusInDispute');
      case '募集中': return t('statusOpenForProposals');
      case '契約準備中': return t('agreementPending');
      case '作業準備完了': return t('statusWorkReady');
      default: return status;
    }
  };

  const handleApplyForProject = (e) => {
    e.stopPropagation();
    openProposalModalFunc(project);
  };



  const navigateToContractReviewPage = (e) => {
    e.stopPropagation();
    onSelect(project, true);
    setActivePage('contractReview');
  };

  // Client's view of their own projects (open for proposals, agreement pending, or work ready)
  if (
    currentViewMode === 'client' &&
    isUserClient &&
    (project.status === '募集中' ||
      project.status === t.agreementPending ||
      project.status === t.statusWorkReady)
  ) {
    return (
      <div
        className={`bg-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isSelected
            ? 'shadow-2xl ring-2 ring-blue-500'
            : 'shadow-lg hover:shadow-xl'
        }`}
      >
        <div className="p-5 cursor-pointer" onClick={() => onSelect(project)}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-blue-700">
              {getField(project, 'name')}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusPillStyle(
                project.status
              )}`}
            >
              {getStatusIcon(project.status)}{' '}
              {typeof getProjectStatusText(project.status) === 'string' && getProjectStatusText(project.status).includes('\n') ? (
                getProjectStatusText(project.status).split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx !== getProjectStatusText(project.status).split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))
              ) : (
                getProjectStatusText(project.status)
              )}
            </span>
          </div>
          <p
            className="text-sm text-gray-600 mb-1 h-10 overflow-y-hidden text-ellipsis"
            title={getField(project, 'description')}
          >
            {getField(project, 'description').substring(0, 100)}...
          </p>
          <div className="text-xs text-gray-500 mb-3">
            {t('budget')}: ¥{project.totalAmount.toLocaleString()} | {t('dueDate')}:
            {project.dueDate}
          </div>
          {project.status === '募集中' &&
            project.proposals &&
            project.proposals.length > 0 &&
            !isAnyProposalSelectedOnThisProject && (
              <p className="text-sm font-semibold text-green-600 mb-2">
                {
                  project.proposals.filter((p) => p.status === 'pending_review')
                    .length
                }{' '}
                {t.proposalsReceived}
              </p>
            )}
          {project.status === '募集中' &&
            (!project.proposals ||
              project.proposals.filter((p) => p.status === 'pending_review')
                .length === 0) && (
              <p className="text-sm text-gray-500 mb-2">{t.noProposalsYet}</p>
            )}
          {project.status === '募集中' &&
            !isAnyProposalSelectedOnThisProject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(project);
                  setActiveProjectDetailTab('proposals');
                }}
                className="w-full mt-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
                disabled={
                  !project.proposals ||
                  project.proposals.filter((p) => p.status === 'pending_review')
                    .length === 0
                }
              >
                <Users size={16} className="mr-2" />
                {t('reviewProposals')}
              </button>
            )}
          {project.status === t.agreementPending && project.contractorName && (
            <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-200">
              <p className="text-sm font-semibold text-purple-700">
                {t('proposalStatusSelected')}: {project.contractorName}
              </p>
              <div className="mt-2 space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelProposalSelection(project);
                  }}
                  className="w-full sm:w-auto text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md inline-flex items-center justify-center"
                >
                  <Undo2 size={14} className="mr-1.5" />
                  {t('cancelSelection')}
                </button>
                <button
                  onClick={navigateToContractReviewPage}
                  className="w-full sm:w-auto text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md inline-flex items-center justify-center"
                >
                  <FileSignature size={14} className="mr-1.5" />
                  {t('confirmFinalAgreementAndProceed')}
                </button>
              </div>
            </div>
          )}
          {project.status === t.statusWorkReady && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDepositModalFunc(project);
              }}
              className="w-full mt-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
            >
              <Banknote size={16} className="mr-2" />
              {t('depositFunds')}
            </button>
          )}
        </div>
        {isSelected && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex border-b border-gray-300 -mx-4 px-2">
              {(project.status === '募集中' ||
                project.status === t.agreementPending) && (
                <TabButton
                  title={t.proposals}
                  icon={<Users />}
                  isActive={activeProjectDetailTab === 'proposals'}
                  onClick={() => handleTabChange('proposals')}
                />
              )}
              <TabButton
                title={t.milestoneList}
                icon={<ListChecks />}
                isActive={activeProjectDetailTab === 'milestones'}
                onClick={() => handleTabChange('milestones')}
              />
              {(project.status === t.agreementPending ||
                project.status === '作業中' ||
                project.status === '完了' ||
                project.status === t.statusWorkReady) && (
                <TabButton
                  title={t.agreementAndHistory}
                  icon={<FileSignature />}
                  isActive={activeProjectDetailTab === 'agreement'}
                  onClick={() => handleTabChange('agreement')}
                />
              )}
            </div>
            <div className="pt-4 min-h-[150px]">
              {activeProjectDetailTab === 'proposals' && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    {t.proposals} (
                    {project.proposals?.filter((p) => p.status !== 'archived')
                      .length || 0}
                    )
                  </h4>
                  {project.proposals &&
                  project.proposals.some((p) => p.status !== 'archived') ? (
                    <div className="space-y-3">
                      {project.proposals.map((prop) => (
                        <ProposalItem
                          key={prop.id}
                          proposal={prop}
                          onViewDetails={openProposalDetailsModal}
                          lang={currentLanguage}
                          t={t}
                          isAnyProposalSelectedOnProject={
                            isAnyProposalSelectedOnThisProject
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">{t.noProposalsYet}</p>
                  )}
                </div>
              )}
              {activeProjectDetailTab === 'milestones' && (
                <div>
                  <h4 className="text-md font-semibold text-indigo-800 mb-3">
                    {t.milestoneList}
                  </h4>
                  {project.milestones?.length > 0 ? (
                    <div className="space-y-2">
                      {project.milestones.map((milestone) => (
                        <MilestoneItem
                          key={milestone.id}
                          milestone={milestone}
                          project={project}
                          userRole={currentViewMode}
                          lang={currentLanguage}
                          t={t}
                          onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t.milestonesNotSet}
                    </p>
                  )}
                </div>
              )}
              {activeProjectDetailTab === 'agreement' && (
                <div className="text-xs space-y-3">
                  <h4 className="text-md font-semibold text-indigo-800 mb-2">
                    {t.agreementDetails}
                  </h4>
                  <p>
                    <span className="font-semibold">
                      {t.allowSubcontracting}:
                    </span>{' '}
                    {project.allowSubcontracting
                      ? (t.subcontractingAllowed ? t.subcontractingAllowed.split(': ')[1] : '')
                      : (t.subcontractingNotAllowed ? t.subcontractingNotAllowed.split(': ')[1] : '')}
                  </p>
                  {project.deliverableDetails && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.deliverableDetailsLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.deliverableDetails}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Contractor's view of projects (Open for proposals, My pending proposals)
  if (currentViewMode === 'contractor' && project.status === '募集中') {
    return (
      <div
        className={`bg-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isSelected
            ? 'shadow-2xl ring-2 ring-teal-500'
            : 'shadow-lg hover:shadow-xl'
        } ${isRecommendedCard ? 'border-2 border-yellow-400' : ''}`}
      >
        {isRecommendedCard && project.aiRecommendationReason && (
          <div className="p-2 bg-yellow-100 border-b border-yellow-300 text-xs text-yellow-700 flex items-center">
            <Zap size={14} className="mr-1.5 text-yellow-500" />
            <strong>{t.aiRecommendationReasonPrefix}</strong>
            {project.aiRecommendationReason}
          </div>
        )}
        <div className="p-5 cursor-pointer" onClick={() => onSelect(project)}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-teal-700 hover:text-teal-800">
              {getField(project, 'name')}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusPillStyle(
                project.status
              )}`}
            >
              {getStatusIcon(project.status)}{' '}
              {getProjectStatusText(project.status)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <span>
              {t.client}: {getField(project, 'clientName')}
            </span>
          </div>
          {project.clientRating && (
            <div className="mb-2">
              <StarRatingDisplay
                score={project.clientRating.averageScore}
                totalReviews={project.clientRating.totalReviews}
                lang={currentLanguage}
                size="xs"
                t={t}
              />
            </div>
          )}
          <p
            className="text-sm text-gray-700 mb-3 h-10 overflow-hidden text-ellipsis"
            title={getField(project, 'description')}
          >
            {getField(project, 'description').substring(0, 100)}
            {getField(project, 'description').length > 100 ? '...' : ''}
          </p>
          <div className="flex justify-between items-center text-sm mb-3">
            <p className="font-bold text-gray-800">
              {t.budget}: ¥{project.totalAmount.toLocaleString()}
            </p>
            <p className="text-gray-500">
              {t.dueDate}: {project.dueDate}
            </p>
          </div>
          {project.requiredSkills && project.requiredSkills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                {t.requiredSkills}:
              </p>
              <div className="flex flex-wrap gap-1">
                {project.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {project.clientId !== currentUser.id && !hasUserProposed && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(t('interestedAction') + ' (mock)');
                  }}
                  className="p-1.5 rounded-full hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                  title={t('interestedAction')}
                >
                  <Heart size={18} />
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(project);
                  setActiveProjectDetailTab('details');
                }}
                className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg inline-flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Eye size={14} className="mr-1.5" />
                {t('viewDetailsAndApply')}
              </button>
            </div>
          )}
          {hasUserProposed &&
            project.clientId !== currentUser.id && (
              <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-green-600 font-semibold p-2 bg-green-50 rounded-md text-center">
                {(t('applicationSubmitted') && t('applicationSubmitted').split('（')[0]) || ''}
              </div>
            )}
        </div>
        {isSelected &&
          activeProjectDetailTab === 'details' &&
          project.clientId !== currentUser.id && (
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                {t('projectDetails')}
              </h4>
              <div className="space-y-2 text-sm mb-4">
                <p>
                  <span className="font-semibold">{t('client')}:</span>{' '}
                  {project.clientName}
                </p>
                {project.clientRating && (
                  <div className="mb-1">
                    <StarRatingDisplay
                      score={project.clientRating.averageScore}
                      totalReviews={project.clientRating.totalReviews}
                      lang={currentLanguage}
                      t={t}
                    />
                  </div>
                )}
                <p>
                  <span className="font-semibold">{t.budget}:</span> ¥
                  {project.totalAmount.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">{t.dueDate}:</span>{' '}
                  {project.dueDate}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">{t.fullDescription}:</span>
                </p>
                <p className="text-gray-700 whitespace-pre-line bg-white p-2 rounded border text-xs max-h-40 overflow-y-auto">
                  {project.description}
                </p>
              </div>
              {!hasUserProposed && (
                <button
                  onClick={handleApplyForProject}
                  className="w-full mt-3 text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
                >
                  <SendHorizonal size={16} className="mr-2" />
                  {t('applyForThisProject')}
                </button>
              )}
            </div>
          )}
      </div>
    );
  }

  // Default card for other statuses (client's non-open projects, contractor's active/completed projects)
  if (isUserClient || isUserContractorInvolved) {
    return (
      <div
        className={`bg-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isSelected
            ? 'shadow-2xl ring-2 ring-indigo-500'
            : 'shadow-lg hover:shadow-xl'
        }`}
      >
        <div className="p-5 cursor-pointer" onClick={() => onSelect(project)}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-indigo-700 hover:text-indigo-800">
              {getField(project, 'name')}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusPillStyle(
                project.status
              )} ${project.hasDispute ? 'ring-2 ring-red-400' : ''}`}
            >
              {project.hasDispute && (
                <AlertTriangle className="mr-1 h-3 w-3 text-red-600" />
              )}
              {getStatusIcon(project.status)}
              {getProjectStatusText(project.status)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <span>
              {t.client}: {getField(project, 'clientName')}
            </span>
            {project.contractorName && (
              <>
                {' | '}
                <span>
                  {t('contractor')}: {getField(project, 'contractorName')}
                </span>
              </>
            )}
          </div>
          <div className="flex justify-between items-center text-sm mb-3">
            <p className="font-bold text-gray-800">
              {t('totalAmount')}: ¥{project.totalAmount.toLocaleString()}
            </p>
            <p className="text-gray-500">
              {t('dueDate')}: {project.dueDate || project.completionDate || 'N/A'}
            </p>
          </div>
          {project.status !== '募集中' &&
            project.status !== t.agreementPending &&
            project.status !== t.statusWorkReady && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className="bg-indigo-500 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right mb-3">
                  {Math.round(progress)}
                  {t('progressCompleted')}
                </p>
              </>
            )}
          {(project.status === t.statusInProgress ||
            project.status === t.statusWorkReady) &&
            !project.hasDispute && (
              <NextActionIndicator
                project={project}
                currentUserRole={currentViewMode}
                t={t}
              />
            )}
          <div className="mt-3 flex flex-wrap gap-2 justify-end">
            {isUserClient && project.status === '完了' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(t('evaluateContractor') + ' (mock)');
                }}
                className="text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-800 px-3 py-1.5 rounded-md inline-flex items-center"
              >
                <Star size={14} className="mr-1.5" />
                {t('evaluateContractor')}
              </button>
            )}
          </div>
        </div>
        {isSelected && (isUserClient || isUserContractorInvolved) && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex border-b border-gray-300 -mx-4 px-2">
              <TabButton
                title={t.milestoneList}
                icon={<ListChecks />}
                isActive={activeProjectDetailTab === 'milestones'}
                onClick={() => handleTabChange('milestones')}
              />
              <TabButton
                title={t.agreementAndHistory}
                icon={<FileSignature />}
                isActive={activeProjectDetailTab === 'agreement'}
                onClick={() => handleTabChange('agreement')}
              />
              {project.status === '完了' && (
                <TabButton
                  title={t.evaluation}
                  icon={<Award />}
                  isActive={activeProjectDetailTab === 'reviews'}
                  onClick={() => handleTabChange('reviews')}
                />
              )}
              {project.status === t.statusInDispute && (
                <TabButton
                  title={t.disputeInfo}
                  icon={<AlertOctagon />}
                  isActive={activeProjectDetailTab === 'dispute'}
                  onClick={() => handleTabChange('dispute')}
                />
              )}
            </div>
            <div className="pt-4 min-h-[150px]">
              {activeProjectDetailTab === 'milestones' && (
                <div>
                  <h4 className="text-md font-semibold text-indigo-800 mb-3">
                    {t.milestoneList}
                  </h4>
                  {project.milestones?.length > 0 ? (
                    <div className="space-y-2">
                      {project.milestones.map((milestone) => (
                        <MilestoneItem
                          key={milestone.id}
                          milestone={milestone}
                          project={project}
                          userRole={currentViewMode}
                          lang={currentLanguage}
                          t={t}
                          onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t.milestonesNotSet}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default ProjectCard;