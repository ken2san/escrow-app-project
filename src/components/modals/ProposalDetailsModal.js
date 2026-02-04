import React from 'react';
import { X, CheckCircle, ShieldCheck, Award, Briefcase, TrendingUp, ExternalLink, Lightbulb, Code, Shield, Target } from 'lucide-react';
import StarRatingDisplay from '../common/StarRatingDisplay';

const ProposalDetailsModal = ({ isOpen, onClose, proposal, lang, t, onSelectProposal }) => {
  if (!isOpen || !proposal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {t('proposalDetailsModalTitle') || 'Proposal Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700">
              {proposal.contractorName}
            </h4>
            {proposal.contractorReputation && (
              <div className="my-1">
                <StarRatingDisplay
                  score={proposal.contractorReputation.averageScore}
                  totalReviews={proposal.contractorReputation.totalReviews}
                  size="sm"
                  lang={lang}
                  t={t}
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              {t('submissionDate')}: {proposal.submissionDate}
            </p>
          </div>
          <div className="space-y-1">
            {proposal.contractorReputation?.identityVerified && (
              <div className="flex items-center text-xs text-green-600">
                <ShieldCheck size={14} className="mr-1.5" />{' '}
                {t('identityVerified')}
              </div>
            )}
            {proposal.contractorReputation?.skillsCertified &&
              proposal.contractorReputation.skillsCertified.length > 0 && (
                <div className="flex items-center text-xs text-blue-600">
                  <Award size={14} className="mr-1.5" /> {t('skillsCertified')}:
                  {proposal.contractorReputation.skillsCertified.join(', ')}
                </div>
              )}
          </div>

          {/* Portfolio & Track Record Section */}
          {proposal.contractorPortfolio && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md">
              <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
                <Briefcase size={16} className="mr-2" />
                実績・ポートフォリオ
              </h4>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-white rounded">
                  <div className="text-xs text-gray-600 mb-1">完了プロジェクト</div>
                  <div className="text-lg font-bold text-indigo-600">
                    {proposal.contractorPortfolio.totalProjects}
                  </div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="text-xs text-gray-600 mb-1">完了率</div>
                  <div className="text-lg font-bold text-green-600">
                    {proposal.contractorPortfolio.completionRate}%
                  </div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="text-xs text-gray-600 mb-1">リピート率</div>
                  <div className="text-lg font-bold text-blue-600">
                    {proposal.contractorPortfolio.repeatClientRate}%
                  </div>
                </div>
              </div>

              {/* Featured Projects */}
              {proposal.contractorPortfolio.featuredProjects && proposal.contractorPortfolio.featuredProjects.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">代表実績</p>
                  <div className="space-y-1">
                    {proposal.contractorPortfolio.featuredProjects.map((project, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-700 bg-white p-2 rounded">
                        <TrendingUp size={12} className="mr-2 text-indigo-500" />
                        <span className="font-medium">{project.name}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-gray-500">{project.category}</span>
                        <span className="ml-auto text-gray-400">({project.year})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialties */}
              {proposal.contractorPortfolio.specialties && proposal.contractorPortfolio.specialties.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">得意分野</p>
                  <div className="flex flex-wrap gap-1">
                    {proposal.contractorPortfolio.specialties.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Link */}
              {proposal.contractorPortfolio.portfolioUrl && (
                <a
                  href={proposal.contractorPortfolio.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <ExternalLink size={12} className="mr-1" />
                  ポートフォリオを見る
                </a>
              )}
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded-md">
            <p className="font-semibold text-gray-700 mb-1">
              {t('proposalMessage')}:
            </p>
            <p className="text-gray-600 whitespace-pre-wrap text-xs">
              {proposal.proposalText}
            </p>
          </div>

          {/* Proposal Details Section */}
          {proposal.proposalDetails && (
            <div className="space-y-3">
              {/* Approach */}
              {proposal.proposalDetails.approach && (
                <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
                  <h5 className="font-semibold text-blue-900 mb-2 flex items-center text-sm">
                    <Lightbulb size={14} className="mr-2" />
                    アプローチ・提案内容
                  </h5>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {proposal.proposalDetails.approach}
                  </p>
                </div>
              )}

              {/* Tech Stack */}
              {proposal.proposalDetails.techStack && proposal.proposalDetails.techStack.length > 0 && (
                <div className="p-3 border border-purple-200 rounded-md bg-purple-50">
                  <h5 className="font-semibold text-purple-900 mb-2 flex items-center text-sm">
                    <Code size={14} className="mr-2" />
                    使用技術・ツール
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {proposal.proposalDetails.techStack.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Mitigation */}
              {proposal.proposalDetails.riskMitigation && (
                <div className="p-3 border border-orange-200 rounded-md bg-orange-50">
                  <h5 className="font-semibold text-orange-900 mb-2 flex items-center text-sm">
                    <Shield size={14} className="mr-2" />
                    リスク対策
                  </h5>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {proposal.proposalDetails.riskMitigation}
                  </p>
                </div>
              )}

              {/* Quality Assurance */}
              {proposal.proposalDetails.qualityAssurance && (
                <div className="p-3 border border-green-200 rounded-md bg-green-50">
                  <h5 className="font-semibold text-green-900 mb-2 flex items-center text-sm">
                    <Target size={14} className="mr-2" />
                    品質保証方針
                  </h5>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {proposal.proposalDetails.qualityAssurance}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-700">{t('proposedAmount')}:</p>
              <p className="text-gray-600">
                ¥{Number(proposal.proposedAmount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {t('estimatedDeliveryTime')}:
              </p>
              <p className="text-gray-600">
                {proposal.estimatedDeliveryTime || 'N/A'}
              </p>
            </div>
          </div>
          {proposal.contractorResellingRisk > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-md text-xs">
              <p className="font-semibold text-yellow-800">
                {t('resellingAlertTitle')}
              </p>
              <p className="text-yellow-700">
                {(t('resellingAlertMessage') || '')
                  .replace('{contractorName}', proposal.contractorName || '')
                  .replace('{percentage}', proposal.contractorResellingRisk || '')}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
          >
            {proposal.applicationStatus && proposal.applicationStatus !== 'pending' ? '閉じる' : t('cancel')}
          </button>
          {(!proposal.applicationStatus || proposal.applicationStatus === 'pending') && (
            <button
              type="button"
              onClick={() => {
                onSelectProposal(proposal);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center shadow-sm"
            >
              <CheckCircle size={16} className="mr-2" />
              {t('selectThisProposal')}
            </button>
          )}
          {proposal.applicationStatus === 'offered' && (
            <div className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md border border-blue-300">
              ✓ 採用提示済み
            </div>
          )}
          {proposal.applicationStatus === 'rejected' && (
            <div className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md border border-red-300">
              × 選考終了
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailsModal;