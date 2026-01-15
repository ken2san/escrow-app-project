import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { getUrgencyColor, getUrgencyEmoji } from '../../utils/priorityLogic';

/**
 * PriorityTaskList - Displays all tasks sorted by priority
 *
 * Philosophy: Show users their entire task list with AI-calculated priority.
 * Clear urgency indicators help users make informed decisions.
 */
const PriorityTaskList = ({ projects, userRole, onTaskClick }) => {
  const { t } = useTranslation();

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-12 shadow-sm border border-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('noTasks', 'タスクがありません')}
          </h3>
          <p className="text-gray-500">
            {t('noTasksDesc', 'すべてのタスクが完了しているか、新しい案件を探してみましょう')}
          </p>
        </div>
      </div>
    );
  }

  // Format due date display
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;

    const due = new Date(dueDate);
    const now = new Date();
    const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return {
        text: `${Math.abs(daysUntil)}日遅れ`,
        color: 'text-red-700',
        icon: <AlertCircle className="h-4 w-4" />,
      };
    } else if (daysUntil === 0) {
      return {
        text: '今日が締切',
        color: 'text-orange-700',
        icon: <Clock className="h-4 w-4" />,
      };
    } else if (daysUntil <= 3) {
      return {
        text: `あと${daysUntil}日`,
        color: 'text-orange-700',
        icon: <Clock className="h-4 w-4" />,
      };
    } else if (daysUntil <= 7) {
      return {
        text: `あと${daysUntil}日`,
        color: 'text-yellow-700',
        icon: <Clock className="h-4 w-4" />,
      };
    } else {
      return {
        text: due.toLocaleDateString('ja-JP'),
        color: 'text-gray-600',
        icon: <Clock className="h-4 w-4" />,
      };
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'workReady':
        return '作業開始待ち';
      case 'inProgress':
        return '作業中';
      case 'pendingAcceptance':
        return '検収待ち';
      case 'openForProposals':
        return '募集中';
      case 'agreementPending':
        return '契約確認待ち';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📋 タスク一覧（優先度順）
        </h2>
        <p className="text-gray-600">
          AIが計算した優先度順に並んでいます。上から順に取り組むことをお勧めします。
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {projects.map((project, index) => {
          const { priority } = project;
          const urgencyColor = getUrgencyColor(priority.urgencyLevel);
          const urgencyEmoji = getUrgencyEmoji(priority.urgencyLevel);
          const dueDateInfo = formatDueDate(project.dueDate);

          return (
            <div
              key={project.id}
              onClick={() => onTaskClick && onTaskClick(project)}
              className={`${urgencyColor} rounded-xl p-4 border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Priority Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Rank & Emoji */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                    <span className="text-2xl">{urgencyEmoji}</span>
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate group-hover:text-indigo-700 transition">
                      {project.title || t('noTitle', 'タイトル未設定')}
                    </h3>

                    {/* Status & Budget */}
                    <div className="flex flex-wrap items-center gap-3 mb-2 text-sm">
                      <span className="px-2 py-1 bg-white bg-opacity-70 rounded font-medium text-gray-700">
                        {getStatusText(project.status)}
                      </span>
                      <span className="text-gray-600">
                        ¥{(project.budget || 0).toLocaleString()}
                      </span>
                      {dueDateInfo && (
                        <div className={`flex items-center gap-1 ${dueDateInfo.color} font-semibold`}>
                          {dueDateInfo.icon}
                          <span>{dueDateInfo.text}</span>
                        </div>
                      )}
                      {project.unreadMessages > 0 && (
                        <span className="text-orange-600 font-semibold">
                          💬 {project.unreadMessages}件
                        </span>
                      )}
                    </div>

                    {/* Priority Reasons */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {priority.reasons.slice(0, 3).map((reason, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center bg-white bg-opacity-50 px-2 py-1 rounded-full text-gray-700"
                        >
                          {reason}
                        </span>
                      ))}
                      {priority.reasons.length > 3 && (
                        <span className="text-gray-500">
                          +{priority.reasons.length - 3}
                        </span>
                      )}
                    </div>

                    {/* M-Score / S-Score (compact) */}
                    {(project.mScore !== undefined || project.sScore !== undefined) && (
                      <div className="flex gap-3 mt-2">
                        {project.mScore !== undefined && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-gray-500">M</span>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  project.mScore >= 80 ? 'bg-green-500' :
                                  project.mScore >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${project.mScore}%` }}
                              />
                            </div>
                            <span className="text-gray-600 font-medium">{project.mScore}</span>
                          </div>
                        )}
                        {project.sScore !== undefined && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-gray-500">S</span>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  project.sScore >= 80 ? 'bg-green-500' :
                                  project.sScore >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${project.sScore}%` }}
                              />
                            </div>
                            <span className="text-gray-600 font-medium">{project.sScore}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Priority Score & Arrow */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">優先度</div>
                    <div className="text-lg font-bold text-gray-700">{priority.score}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Tip */}
      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
        <p className="text-sm text-indigo-800">
          <span className="font-semibold">💡 ヒント：</span>
          上位のタスクから順に取り組むことで、締切遅延や支払い遅延のリスクを最小化できます。
        </p>
      </div>
    </div>
  );
};

export default PriorityTaskList;
