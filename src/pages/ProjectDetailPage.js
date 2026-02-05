
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dashboardAllProjects } from '../utils/initialData';

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  // Get project from dashboardAllProjects
  const project = dashboardAllProjects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl text-gray-400 mb-4">🚫</div>
        <div className="text-lg font-semibold text-gray-700 mb-2">
          プロジェクトが見つかりません
        </div>
        <div className="text-gray-500 mb-6">
          指定されたプロジェクトは存在しないか、アクセス権限がありません。
        </div>
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          onClick={() => navigate('/work-management')}
        >
          Work Managementに戻る
        </button>
      </div>
    );
  }

  // Calculate progress
  const totalMilestones = project.milestones?.length || 0;
  const completedMilestones = project.milestones?.filter(m => m.status === 'completed' || m.status === 'released').length || 0;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Calculate funds
  const totalAmount = project.totalAmount || 0;
  const fundsDeposited = project.fundsDeposited || 0;
  const fundsReleased = project.fundsReleased || 0;
  const fundsRemaining = totalAmount - fundsReleased;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600">{project.clientName}</p>
          </div>
          <button
            onClick={() => navigate('/work-management')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← 戻る
          </button>
        </div>

        {/* Contract Status & Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-indigo-900">契約ステータス</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                project.contractStatus === 'active' ? 'bg-green-100 text-green-800' :
                project.contractStatus === 'agreed' ? 'bg-blue-100 text-blue-800' :
                project.contractStatus === 'under_negotiation' ? 'bg-amber-100 text-amber-800' :
                project.contractStatus === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-slate-100 text-slate-800'
              }`}>
                {project.contractStatus === 'active' ? '🚀 進行中' :
                 project.contractStatus === 'agreed' ? '✅ 合意済み' :
                 project.contractStatus === 'under_negotiation' ? '💬 交渉中' :
                 project.contractStatus === 'completed' ? '🎉 完了' :
                 '📝 下書き'}
              </span>
            </div>
            <p className="text-xs text-indigo-700">
              {project.contractStatus === 'active' && '契約は有効で、作業が進行中です'}
              {project.contractStatus === 'agreed' && '契約条件に合意し、開始を待っています'}
              {project.contractStatus === 'under_negotiation' && '条件の調整を行っています'}
              {project.contractStatus === 'completed' && 'プロジェクトは正常に完了しました'}
              {!project.contractStatus && '契約の準備段階です'}
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-green-900">進捗状況</span>
              <span className="text-lg font-bold text-green-700">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-green-700">
              {completedMilestones}/{totalMilestones} マイルストーン完了
            </p>
          </div>
        </div>
      </div>
      {/* Escrow Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">💰</span>
          エスクロー状態
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">総予算</p>
            <p className="text-xl font-bold text-blue-600">{totalAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">pt</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">預託済み</p>
            <p className="text-xl font-bold text-green-600">{fundsDeposited.toLocaleString()}</p>
            <p className="text-xs text-gray-500">pt</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">支払済み</p>
            <p className="text-xl font-bold text-purple-600">{fundsReleased.toLocaleString()}</p>
            <p className="text-xs text-gray-500">pt</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">残高</p>
            <p className="text-xl font-bold text-amber-600">{fundsRemaining.toLocaleString()}</p>
            <p className="text-xs text-gray-500">pt</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">預託率</span>
            <span className="text-sm font-bold text-gray-900">
              {totalAmount > 0 ? Math.round((fundsDeposited / totalAmount) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
              style={{ width: `${totalAmount > 0 ? (fundsDeposited / totalAmount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Contract History */}
      {project.contractHistory && project.contractHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">📜</span>
            契約履歴
          </h2>
          <div className="space-y-4">
            {project.contractHistory.map((history, index) => (
              <div key={history.id} className="flex gap-4 border-l-4 border-indigo-300 pl-4 py-2">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      {new Date(history.date).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      history.action === 'contract_created' ? 'bg-blue-100 text-blue-800' :
                      history.action === 'contract_negotiated' ? 'bg-amber-100 text-amber-800' :
                      history.action === 'contract_agreed' ? 'bg-green-100 text-green-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {history.action === 'contract_created' && '📝 契約書作成'}
                      {history.action === 'contract_negotiated' && '💬 条件交渉'}
                      {history.action === 'contract_agreed' && '✅ 契約合意'}
                      {history.action === 'contract_activated' && '🚀 契約開始'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{history.description}</p>
                  <p className="text-xs text-gray-500">実施者: {history.actorName}</p>
                  {history.changes && (
                    <div className="mt-2 p-2 bg-amber-50 rounded text-xs">
                      <span className="font-semibold">変更内容: </span>
                      <span className="text-gray-700">
                        {history.changes.field} -
                        <span className="line-through text-red-600 mx-1">{history.changes.oldValue}</span>
                        →
                        <span className="text-green-600 mx-1">{history.changes.newValue}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract Details */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">📋</span>
          契約条件
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-bold text-gray-700 mb-2">プロジェクト概要</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">{project.description}</p>
          </div>
          {project.deliverables && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center">📦 成果物</h3>
              <p className="text-sm text-gray-700 mb-1">{project.deliverables}</p>
              {project.deliverableDetails && (
                <p className="text-xs text-gray-600 mt-2">{project.deliverableDetails}</p>
              )}
            </div>
          )}
          {project.acceptanceCriteria && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm font-bold text-green-900 mb-2 flex items-center">✅ 検収基準</h3>
              <p className="text-sm text-gray-700 mb-1">{project.acceptanceCriteria}</p>
              {project.acceptanceCriteriaDetails && (
                <p className="text-xs text-gray-600 mt-2">{project.acceptanceCriteriaDetails}</p>
              )}
            </div>
          )}
          {(project.scopeOfWork_included || project.scopeOfWork_excluded) && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3">📋 作業範囲</h3>
              {project.scopeOfWork_included && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">✓ 含まれる作業:</p>
                  <p className="text-sm text-gray-700">{project.scopeOfWork_included}</p>
                </div>
              )}
              {project.scopeOfWork_excluded && (
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-1">✗ 含まれない作業:</p>
                  <p className="text-sm text-gray-700">{project.scopeOfWork_excluded}</p>
                </div>
              )}
            </div>
          )}
          {project.additionalWorkTerms && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center">💡 追加作業条件</h3>
              <p className="text-sm text-gray-700">{project.additionalWorkTerms}</p>
            </div>
          )}
        </div>
      </div>

      {/* Milestones */}
      {project.milestones && project.milestones.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            マイルストーン
          </h2>
          <div className="space-y-4">
            {project.milestones.map((milestone, index) => {
              const isCompleted = milestone.status === 'completed' || milestone.status === 'released';
              const isInProgress = milestone.status === 'in_progress';
              return (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCompleted ? 'bg-green-50 border-green-300' :
                    isInProgress ? 'bg-blue-50 border-blue-300' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{milestone.name}</h3>
                        {isCompleted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                            ✓ 完了
                          </span>
                        )}
                        {isInProgress && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                            ▶ 進行中
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        期日: {milestone.dueDate} | 金額: {Number(milestone.amount).toLocaleString()} pt
                      </p>
                    </div>
                  </div>
                  {/* Milestone Details */}
                  {(milestone.deliverables || milestone.acceptanceCriteria || milestone.additionalWorkTerms) && (
                    <div className="mt-3 space-y-2 pl-8">
                      {milestone.deliverables && (
                        <div className="text-sm">
                          <span className="font-semibold text-blue-700">📦 成果物: </span>
                          <span className="text-gray-700">{milestone.deliverables}</span>
                        </div>
                      )}
                      {milestone.acceptanceCriteria && (
                        <div className="text-sm">
                          <span className="font-semibold text-green-700">✅ 受入基準: </span>
                          <span className="text-gray-700">{milestone.acceptanceCriteria}</span>
                        </div>
                      )}
                      {milestone.additionalWorkTerms && (
                        <div className="text-sm">
                          <span className="font-semibold text-amber-700">💡 追加条件: </span>
                          <span className="text-gray-700">{milestone.additionalWorkTerms}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
