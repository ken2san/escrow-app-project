import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { getUrgencyColor, getUrgencyEmoji } from '../../utils/priorityLogic';

/**
 * PriorityTaskCard - Displays today's top priority task
 *
 * Philosophy: Tell users exactly what to do next with minimal cognitive load.
 * Shows the single most important action they should take today.
 */
const PriorityTaskCard = ({ project, userRole, onActionClick }) => {
  const { t } = useTranslation();

  if (!project) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 shadow-sm border border-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('noPriorityTask', '今日やるべきことはありません')}
          </h3>
          <p className="text-gray-500">
            {t('noPriorityTaskDesc', 'すべてのタスクが完了しているか、新しい案件を探してみましょう')}
          </p>
        </div>
      </div>
    );
  }

  const { priority } = project;
  const urgencyColor = getUrgencyColor(priority.urgencyLevel);
  const urgencyEmoji = getUrgencyEmoji(priority.urgencyLevel);

  // Determine action button text based on status
  const getActionText = () => {
    if (userRole === 'contractor') {
      switch (project.status) {
        case 'workReady':
          return '作業を開始する';
        case 'inProgress':
          return '作業を続ける';
        case 'pendingAcceptance':
          return '検収状況を確認';
        case 'openForProposals':
          return '提案を作成する';
        default:
          return '詳細を見る';
      }
    } else { // client
      switch (project.status) {
        case 'openForProposals':
          return project.proposals?.length > 0 ? '提案を確認する' : '提案を待つ';
        case 'agreementPending':
          return '契約内容を確認';
        case 'inProgress':
          return '進捗を確認';
        case 'pendingAcceptance':
          return '納品物を検収する';
        case 'completed':
          return '評価を入力する';
        default:
          return '詳細を見る';
      }
    }
  };

  // Format due date display
  const formatDueDate = () => {
    if (!project.dueDate) return null;

    const dueDate = new Date(project.dueDate);
    const now = new Date();
    const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return (
        <div className="flex items-center gap-2 text-red-700 font-semibold">
          <AlertCircle className="h-4 w-4" />
          <span>{Math.abs(daysUntil)}日遅れています</span>
        </div>
      );
    } else if (daysUntil === 0) {
      return (
        <div className="flex items-center gap-2 text-orange-700 font-semibold">
          <Clock className="h-4 w-4" />
          <span>今日が締切です</span>
        </div>
      );
    } else if (daysUntil <= 3) {
      return (
        <div className="flex items-center gap-2 text-orange-700 font-semibold">
          <Clock className="h-4 w-4" />
          <span>あと{daysUntil}日</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>締切：{dueDate.toLocaleDateString('ja-JP')}</span>
        </div>
      );
    }
  };

  return (
    <div className={`rounded-2xl p-6 shadow-lg border-l-4 ${urgencyColor} transition-all hover:shadow-xl`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{urgencyEmoji}</span>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              今日の最優先タスク
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                priority.urgencyLevel === 'critical' ? 'bg-red-200 text-red-800' :
                priority.urgencyLevel === 'high' ? 'bg-orange-200 text-orange-800' :
                priority.urgencyLevel === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-blue-200 text-blue-800'
              }`}>
                {priority.urgencyLevel === 'critical' ? '緊急' :
                 priority.urgencyLevel === 'high' ? '重要' :
                 priority.urgencyLevel === 'medium' ? '中' : '低'}
              </span>
              <span className="text-xs text-gray-500">
                優先度スコア: {priority.score}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
        {project.title || t('noTitle', 'タイトル未設定')}
      </h2>

      {/* Priority Reasons */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {priority.reasons.map((reason, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-sm bg-white bg-opacity-70 px-3 py-1 rounded-full text-gray-700 font-medium"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">予算：</span>
          <span className="font-semibold text-gray-800">
            ¥{(project.budget || 0).toLocaleString()}
          </span>
        </div>
        <div>
          {formatDueDate()}
        </div>
        {project.unreadMessages > 0 && (
          <div className="col-span-2">
            <span className="text-orange-600 font-semibold">
              💬 未読メッセージ {project.unreadMessages}件
            </span>
          </div>
        )}
      </div>

      {/* M-Score / S-Score Display (if available) */}
      {(project.mScore !== undefined || project.sScore !== undefined) && (
        <div className="flex gap-4 mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
          {project.mScore !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">M-Score</span>
              <div className="flex items-center gap-1">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      project.mScore >= 80 ? 'bg-green-500' :
                      project.mScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${project.mScore}%` }}
                  />
                </div>
                <span className="text-xs font-semibold">{project.mScore}</span>
              </div>
            </div>
          )}
          {project.sScore !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">S-Score</span>
              <div className="flex items-center gap-1">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      project.sScore >= 80 ? 'bg-green-500' :
                      project.sScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${project.sScore}%` }}
                  />
                </div>
                <span className="text-xs font-semibold">{project.sScore}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onActionClick && onActionClick(project)}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      >
        <span>{getActionText()}</span>
        <ArrowRight className="h-5 w-5" />
      </button>

      {/* AI Suggestion (if low M-Score) */}
      {project.mScore !== undefined && project.mScore < 60 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <TrendingUp className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <span className="font-semibold">AIからの提案：</span>
            <span className="ml-1">
              契約内容の明確化により、トラブルのリスクを減らせます。
              納品物・受入基準・作業範囲をより詳細に定義することをお勧めします。
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityTaskCard;
