import { calculateScores, calculateRecommendationScore } from './scoreCalculation';
import { calculateAmbiguityScore, detectSafetyWarnings, generateClarityChecklist } from './scoreCalculation';

// Function to get user's projects (mine)
export function getProjectsForUser(userId) {
  return dashboardAllProjects
    .filter(p => p.clientId === userId || p.contractorId === userId)
    .map(p => {
      const unreadMessages = 0; // TODO: get from messaging service
      // Calculate M-Score and S-Score using the calculation engine
      const scores = calculateScores(p);
      const mScore = scores.mScore.score;
      const sScore = scores.sScore.score;
      const scoreDetails = {
        mScore: scores.mScore,
        sScore: scores.sScore,
      };

      // Map status to standard format
      let status = 'inProgress';
      if (p.status === '完了' || p.status === 'Completed') {
        status = 'completed';
      } else if (p.status === '募集中' || p.status === 'openForProposals') {
        status = 'openForProposals';
      } else if (p.status === '作業開始待ち') {
        status = 'workReady';
      } else if (p.status === '検収待ち') {
        status = 'pendingAcceptance';
      } else if (p.status === '協議中') {
        status = 'agreementPending';
      }

      // Get due date from milestones or use project deadline
      let dueDate = null;
      if (p.milestones && p.milestones.length > 0) {
        // Find next incomplete milestone
        const nextMilestone = p.milestones.find(m => m.status !== 'paid');
        if (nextMilestone && nextMilestone.dueDate) {
          dueDate = nextMilestone.dueDate;
        }
      }

      // Demo: Make some projects urgent by setting near deadlines
      if (p.id === 'job101') {
        // LP design - demo job for Jobs Search page
        const twoDaysLater = new Date();
        twoDaysLater.setDate(twoDaysLater.getDate() + 2);
        dueDate = twoDaysLater.toISOString().split('T')[0];
        // Keep status as open for demo purposes (shown in Jobs Search)
      } else if (p.id === 'job1') {
        // Completed logo project - needs evaluation
        status = 'completed';
      }

      // Check if needs evaluation
      const needsEvaluation = status === 'completed' &&
        !p.contractorRating &&
        p.clientId === userId;

      return {
        id: p.id,
        title: p.name,
        by: p.clientId === userId ? p.clientName : p.contractorName,
        value: p.totalAmount,
        budget: p.totalAmount,
        nature: p.aiRecommendationScore || 0.7,
        reward: p.totalAmount,
        popularity: p.clientRating?.averageScore || 5,
        description: p.description,
        workImage: p.imageUrl || '',
        type: p.clientId === userId ? 'request' : 'offer',
        isMyProject: true,
        // Priority calculation fields
        status,
        dueDate,
        unreadMessages,
        mScore,
        sScore,
        scoreDetails,
        needsEvaluation,
        proposals: p.proposals || [],
        postedAt: p.postedAt || new Date().toISOString(),
      };
    });
}

// Job Discovery: return all open jobs (no user restrictions)
export function getAvailableJobsForDiscovery() {
  const seenIds = new Set();
  return dashboardAllProjects
    .filter(p => p.status === '募集中' && (!seenIds.has(p.id) && seenIds.add(p.id))) // dedupe by id
    .map(p => {
      // Calculate M-Score and S-Score using the calculation engine
      const scores = calculateScores(p);
      const mScore = scores.mScore.score;
      const sScore = scores.sScore.score;
      const scoreDetails = {
        mScore: scores.mScore,
        sScore: scores.sScore,
      };

      // Calculate Trust Indicators
      const ambiguity = calculateAmbiguityScore(p);
      const safetyWarnings = detectSafetyWarnings(p);
      const clarityChecklist = generateClarityChecklist(p);

      // Calculate AI Recommendation Score
      const recommendation = calculateRecommendationScore(p);

      // Get due date from milestones or use project deadline
      let dueDate = p.dueDate || null;
      if (p.milestones && p.milestones.length > 0) {
        const nextMilestone = p.milestones.find(m => m.status !== 'paid');
        if (nextMilestone && nextMilestone.dueDate) {
          dueDate = nextMilestone.dueDate;
        }
      }

      // Check escrow status
      const escrowStatus = {
        isFullyDeposited: p.fundsDeposited === p.totalAmount,
        depositedAmount: p.fundsDeposited || 0,
        totalAmount: p.totalAmount,
      };

      return {
        id: p.id,
        title: p.name,
        by: p.clientName,
        client: p.clientName,
        category: p.category || 'IT',
        workType: p.workType || 'project', // project | hourly
        locationType: p.locationType || 'remote', // remote | onsite | hybrid
        value: p.totalAmount,
        budget: p.totalAmount,
        description: p.description,
        workImage: p.imageUrl || '',
        status: 'openForProposals',
        dueDate,
        mScore,
        sScore,
        scoreDetails,
        clientRating: p.clientRating || { averageScore: 0, totalReviews: 0 },
        popularity: p.clientRating?.averageScore || 0,
        requiredSkills: p.requiredSkills || [],
        deliverables: p.deliverables || '',
        deliverableDetails: p.deliverableDetails || '',
        acceptanceCriteria: p.acceptanceCriteria || '',
        acceptanceCriteriaDetails: p.acceptanceCriteriaDetails || '',
        scopeOfWork_included: p.scopeOfWork_included || '',
        scopeOfWork_excluded: p.scopeOfWork_excluded || '',
        additionalWorkTerms: p.additionalWorkTerms || '',
        milestones: p.milestones || [],
        aiRecommendationScore: p.aiRecommendationScore || 0,
        proposals: p.proposals || [],
        // AI Recommendation & Trust & Safety Indicators
        recommendationScore: recommendation.score,
        recommendationReason: recommendation.reason,
        recommendationFlag: recommendation.flag, // 'green' | 'yellow' | 'red'
        ambiguityScore: ambiguity.score,
        claritychecklist: clarityChecklist,
        safetyWarnings,
        escrowStatus,
        postedAt: p.postedAt || new Date().toISOString(),
      };
    });
}

// Get user's own project cards (my projects) for MarketCommandUI
export function getMyProjectCards(userId) {
  return getProjectsForUser(userId).map(p => ({
    id: p.id,
    title: p.title,
    by: p.by,
    value: p.value,
    nature: p.nature,
    reward: p.reward,
    popularity: p.popularity,
    description: p.description,
    workImage: p.workImage,
    type: p.type,
    isMyProject: p.isMyProject,
    status: p.status,
    dueDate: p.dueDate,
    unreadMessages: p.unreadMessages || 0,
  }));
}

// In-memory proposals/drafts/pending applications store (demo only)
const _proposedProjectsByUser = {};
const _draftProjectsByUser = {};
// { [userId]: [{ jobId, status: 'pending'|'offered'|'accepted'|'rejected', appliedAt, responseDeadline, acceptedMilestones: [] }] }
const _pendingApplicationJobsByUser = {
  'user555': [
    { jobId: 'job1', status: 'pending', appliedAt: '2026-01-26T10:30:00Z', responseDeadline: '2026-02-02T10:30:00Z', _pendingStatus: 'pending', acceptedMilestones: [] },
    { jobId: 'job2', status: 'offered', appliedAt: '2026-01-20T14:15:00Z', responseDeadline: '2026-02-03T14:15:00Z', _pendingStatus: 'pending', acceptedMilestones: [] },
    { jobId: 'job3', status: 'accepted', appliedAt: '2026-01-15T09:00:00Z', responseDeadline: '2026-01-22T09:00:00Z', _pendingStatus: 'accepted', acceptedMilestones: ['job3-m1', 'job3-m2', 'job3-m3'] },
  ]
};

// Received applications: { [projectId]: [{ applicantId, applicantName, appliedAt, status: 'pending'|'offered'|'accepted'|'rejected' }] }
const _receivedApplicationsByProjectId = {
  'job2': [
    { applicantId: 'user001', applicantName: '山田太郎', appliedAt: '2026-01-28T14:00:00Z', status: 'pending' },
    { applicantId: 'user002', applicantName: '鈴木花子', appliedAt: '2026-01-29T10:15:00Z', status: 'pending' },
    { applicantId: 'user003', applicantName: '佐藤次郎', appliedAt: '2026-01-30T09:30:00Z', status: 'pending' },
  ],
};
// Update application status
// Status flow for contractor:
// - pending: 応募中
// - offered: クライアントから採用提示を受けている
// - accepted: 採用を受け入れた → 進行中へ移動
// - rejected: 不採用
export function updateApplicationJobStatus(jobId, newStatus, userId = loggedInUserDataGlobal.id) {
  if (!_pendingApplicationJobsByUser[userId]) return;
  const job = _pendingApplicationJobsByUser[userId].find(j => j.jobId === jobId);
  if (job) {
    const oldStatus = job.status;
    job.status = newStatus;

    // Append history only when status changes
    if (oldStatus !== newStatus) {
      if (!job.history) job.history = [];
      const statusLabels = {
        'pending': '応募中',
        'offered': '採用提示中',
        'accepted': '採用',
        'rejected': '不採用',
      };
      job.history.push(`${new Date().toLocaleString()} ステータスが「${statusLabels[newStatus] || newStatus}」になりました`);
    }
  }
}

// Accept a specific milestone (move only that card to inprogress)
export function acceptOfferedMilestone(jobId, milestoneId, userId = loggedInUserDataGlobal.id) {
  if (!_pendingApplicationJobsByUser[userId]) return;
  const job = _pendingApplicationJobsByUser[userId].find(j => j.jobId === jobId);
  if (job && job.status === 'offered') {
    if (!job.acceptedMilestones) job.acceptedMilestones = [];
    if (!job.acceptedMilestones.includes(milestoneId)) {
      job.acceptedMilestones.push(milestoneId);
    }
    if (!job.history) job.history = [];
    job.history.push(`${new Date().toLocaleString()} マイルストーン「${milestoneId}」を採用受諾しました`);
  }
}

// Complete a milestone (mark as completed and release payment)
export function completeMilestone(jobId, milestoneId, userId = loggedInUserDataGlobal.id) {
  // Update pending application job history
  if (_pendingApplicationJobsByUser[userId]) {
    const job = _pendingApplicationJobsByUser[userId].find(j => j.jobId === jobId);
    if (job) {
      if (!job.completedMilestones) job.completedMilestones = [];
      if (!job.completedMilestones.includes(milestoneId)) {
        job.completedMilestones.push(milestoneId);
      }
      if (!job.history) job.history = [];
      job.history.push(`${new Date().toLocaleString()} マイルストーン「${milestoneId}」が完了し、支払いが処理されました`);
    }
  }

  // Update milestone status in dashboardAllProjects (single source of truth)
  const project = dashboardAllProjects.find(p => p.id === jobId);
  if (project && project.milestones) {
    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.status = 'completed';

      // Release payment from escrow (mock implementation)
      // In production, this would trigger actual payment processing
      console.log(`Payment released for milestone ${milestoneId} (${milestone.amount} pt) in job ${jobId}`);

      // Trigger payment status update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('paymentStatusUpdated', {
          detail: { jobId, milestoneId, amount: milestone.amount }
        }));
      }
    }
  }
}

// Get completed milestones for a job
export function getCompletedMilestonesForJob(jobId, userId = loggedInUserDataGlobal.id) {
  if (!_pendingApplicationJobsByUser[userId]) return [];
  const job = _pendingApplicationJobsByUser[userId].find(j => j.jobId === jobId);
  return job && job.completedMilestones ? [...job.completedMilestones] : [];
}
// ...existing code...
// Add a job to the pending application list for a user
// Stage 2: Add support for custom responseDeadline
export function addPendingApplicationJob(jobId, userId = loggedInUserDataGlobal.id, appliedAt = null, customDeadline = null, selectedMilestones = []) {
  if (!_pendingApplicationJobsByUser[userId]) _pendingApplicationJobsByUser[userId] = [];
  // Add only if it does not already exist
  if (!_pendingApplicationJobsByUser[userId].some(j => j.jobId === jobId)) {
    const now = new Date();
    const deadline = customDeadline ? new Date(customDeadline) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    _pendingApplicationJobsByUser[userId].push({
      jobId,
      status: 'pending',
      appliedAt: appliedAt || now.toISOString(),
      responseDeadline: deadline.toISOString(),
      selectedMilestones: Array.isArray(selectedMilestones) ? selectedMilestones : [],
      acceptedMilestones: [],
    });
  }
}


// Get all application jobs for a user (with status)
export function getPendingApplicationJobsForUser(userId = loggedInUserDataGlobal.id) {
  return _pendingApplicationJobsByUser[userId] ? [..._pendingApplicationJobsByUser[userId]] : [];
}

// Normalize a dashboard project into WorkManagement-like project shape
// Get applications received for a project
export function getReceivedApplicationsForProject(projectId) {
  // Convert projectId to string to match keys in _receivedApplicationsByProjectId
  const key = String(projectId);
  return _receivedApplicationsByProjectId[key] ? [..._receivedApplicationsByProjectId[key]] : [];
}

// Add an application to received applications
export function addReceivedApplication(projectId, applicantId, applicantName) {
  const key = String(projectId);
  if (!_receivedApplicationsByProjectId[key]) _receivedApplicationsByProjectId[key] = [];

  // Check if already applied
  if (!_receivedApplicationsByProjectId[key].some(app => app.applicantId === applicantId)) {
    _receivedApplicationsByProjectId[key].push({
      applicantId,
      applicantName,
      appliedAt: new Date().toISOString(),
      status: 'pending',
    });
  }
}

// Update received application status
// Status flow: pending -> offered (client accepts) | rejected
//              offered -> accepted (contractor accepts) | rejected
export function updateReceivedApplicationStatus(projectId, applicantId, status) {
  const key = String(projectId);
  if (!_receivedApplicationsByProjectId[key]) return;
  const app = _receivedApplicationsByProjectId[key].find(a => a.applicantId === applicantId);
  if (app) {
    const oldStatus = app.status;
    app.status = status;

    // Record status change history
    if (!app.statusHistory) app.statusHistory = [];
    app.statusHistory.push({
      timestamp: new Date().toISOString(),
      fromStatus: oldStatus,
      toStatus: status,
      note: getStatusChangeNote(oldStatus, status),
    });
  }
}

// Helper to get status change note
function getStatusChangeNote(fromStatus, toStatus) {
  if (toStatus === 'offered') return 'クライアントが採用を提示しました';
  if (toStatus === 'accepted' && fromStatus === 'offered') return 'Contractorが採用を受け入れました';
  if (toStatus === 'rejected') return '不採用になりました';
  return `ステータスが${fromStatus}から${toStatus}に変更されました`;
}


// Milestone progress management: { [cardId]: { status: 'notStarted'|'inProgress'|'completed', history: [...] } }
const _milestoneProgressMap = {};

// Get milestone progress
export function getMilestoneProgress(cardId) {
  if (!_milestoneProgressMap[cardId]) {
    _milestoneProgressMap[cardId] = {
      status: 'notStarted',
      history: [{
        type: 'created',
        timestamp: new Date().toISOString(),
        status: 'notStarted',
        note: 'マイルストーン作成',
      }],
    };
  }
  return _milestoneProgressMap[cardId];
}

// Update milestone status and record history
export function updateMilestoneStatus(cardId, newStatus, note = '') {
  const progress = getMilestoneProgress(cardId);
  const oldStatus = progress.status;

  if (oldStatus !== newStatus) {
    progress.status = newStatus;
    progress.history.push({
      type: 'statusChanged',
      timestamp: new Date().toISOString(),
      fromStatus: oldStatus,
      toStatus: newStatus,
      note,
    });
  }
}

// Get milestone history
export function getMilestoneHistory(cardId) {
  const progress = getMilestoneProgress(cardId);
  return progress.history || [];
}

function _toWorkManagementProject(p) {
  const projectId = p.id || `job-${Date.now()}`;
  const cards = (p.milestones && Array.isArray(p.milestones) && p.milestones.length > 0)
    ? p.milestones.map((m, idx) => ({
        id: m.id || `${projectId}-m${idx + 1}`,
        projectId: projectId,
        title: m.name || m.title || `マイルストーン ${idx + 1}`,
        status: 'unsent',
        reward: m.amount || 0,
        startDate: m.dueDate || '',
        duration: '',
        order: idx + 1,
      }))
    : [{ id: `${projectId}-m1`, projectId, title: p.name || '作業', status: 'unsent', reward: p.totalAmount || 0, startDate: p.dueDate || '', duration: '', order: 1 }];

  return {
    id: projectId,
    name: p.name || p.title || '新規案件',
    client: p.clientName || p.client || 'クライアント',
    totalBudget: p.totalAmount || p.budget || 0,
    deadline: p.dueDate || '',
    duration: '',
    description: p.description || '',
    cards,
  };
}

// Add proposals and materialize them as projects for Work Management view
export function addProposals(proposals, userId = loggedInUserDataGlobal.id) {
  if (!proposals || proposals.length === 0) return;
  if (!_proposedProjectsByUser[userId]) _proposedProjectsByUser[userId] = [];

  proposals.forEach((prop) => {
    const job = dashboardAllProjects.find(j => j.id === prop.jobId);
    if (job) {
      const project = _toWorkManagementProject(job);
      // Attach minimal proposal meta for reference
      project._proposal = {
        message: prop.message || '',
        estimatedDays: prop.estimatedDays || '',
        timestamp: prop.timestamp || new Date().toISOString(),
      };
      // If a draft exists, replace/upgrade it
      if (_draftProjectsByUser[userId]) {
        _draftProjectsByUser[userId] = _draftProjectsByUser[userId].filter(p => p.id !== project.id);
      }
      // Avoid duplicates by id
      const exists = _proposedProjectsByUser[userId].some(p => p.id === project.id);
      if (!exists) _proposedProjectsByUser[userId].push(project);
    }
  });
}

export function getProposedProjectsForUser(userId = loggedInUserDataGlobal.id) {
  return _proposedProjectsByUser[userId] ? [..._proposedProjectsByUser[userId]] : [];
}

// Drafts API: cart selection → create draft work items immediately
export function addDraftJobs(jobIds = [], userId = loggedInUserDataGlobal.id) {
  if (!jobIds || jobIds.length === 0) return;
  if (!_draftProjectsByUser[userId]) _draftProjectsByUser[userId] = [];
  jobIds.forEach((jid) => {
    const job = dashboardAllProjects.find(j => j.id === jid);
    if (!job) return;
    const project = _toWorkManagementProject(job);
    project._draft = true;
    project._status = '未編集';
    // Avoid duplicates by id
    const existsDraft = _draftProjectsByUser[userId].some(p => p.id === project.id);
    const existsProposed = _proposedProjectsByUser[userId]?.some(p => p.id === project.id);
    if (!existsDraft && !existsProposed) _draftProjectsByUser[userId].push(project);
  });
}

export function removeDraftJob(jobId, userId = loggedInUserDataGlobal.id) {
  if (!_draftProjectsByUser[userId]) return;
  _draftProjectsByUser[userId] = _draftProjectsByUser[userId].filter(p => p.id !== jobId);
}

export function getDraftProjectsForUser(userId = loggedInUserDataGlobal.id) {
  return _draftProjectsByUser[userId] ? [..._draftProjectsByUser[userId]] : [];
}
// Dummy data for MarketCommandUIPage
export const marketCommandItems = [
  { type: 'request', id: 1, title: 'バックエンド開発', by: 'NextGen Mart', byIcon: '🛒', value: 400000, nature: 0.9, reward: 400000, popularity: 8, description: 'Eコマースサイトのバックエンド開発をお願いします。Node.jsとGraphQLの経験者を募集しています。', workImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80', date: '2025-08-10T10:30:00', userComments: [
    { text: 'この値段で受ける人いる？', date: '2025-08-10T11:00:00', userName: 'Sato', userIcon: '👨‍💻' },
    { text: '要件もう少し詳しく！', date: '2025-08-10T11:05:00', userName: 'Miki', userIcon: '👩‍🎨' },
    { text: '面白そうな案件ですね。', date: '2025-08-10T11:10:00', userName: 'Suzuki', userIcon: '👨‍🌾' },
    { text: 'この案件は要件が曖昧すぎて、もう少し詳細な仕様や納期、報酬の支払い条件などを明記してもらえると応募しやすいです。', date: '2025-08-10T11:15:00', userName: 'Tanaka', userIcon: '🧑‍💼' },
    { text: 'Node.jsとGraphQLの経験者限定とのことですが、具体的なバージョンや開発環境についても教えてください。', date: '2025-08-10T11:20:00', userName: 'Yamada', userIcon: '🎬' },
    { text: '短納期で高額案件、興味あります！', date: '2025-08-10T11:25:00', userName: 'Sato', userIcon: '👨‍💻' }
  ] },
  { type: 'offer', id: 2, title: '高品質なロゴを3案作成します', by: 'Sato Design', byIcon: '🎨', value: 50000, nature: 0.2, reward: 50000, popularity: 9, description: 'あなたのビジネスの顔となるロゴを、ヒアリングに基づき3つの異なる方向性で提案します。', workImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', date: '2025-08-12T09:00:00', userComments: [
    { text: 'もう少し安くなりませんか？', date: '2025-08-12T09:10:00', userName: 'Tanaka', userIcon: '🧑‍💼' },
    { text: 'サンプル見せてほしい', date: '2025-08-12T09:12:00', userName: 'Suzuki', userIcon: '👨‍🌾' },
    { text: 'デザインの方向性は？', date: '2025-08-12T09:15:00', userName: 'Yamada', userIcon: '🎬' },
    { text: 'ロゴの納品形式（AI, PNG, SVGなど）や修正回数についても事前に知りたいです。', date: '2025-08-12T09:18:00', userName: 'Miki', userIcon: '👩‍🎨' },
    { text: 'ヒアリングの方法や納期の目安も教えてください。', date: '2025-08-12T09:20:00', userName: 'Sato', userIcon: '👨‍💻' },
    { text: '実績や過去の制作例があれば見たいです！', date: '2025-08-12T09:22:00', userName: 'Tanaka', userIcon: '🧑‍💼' }
  ] },
  { type: 'request', id: 3, title: 'SNSキャンペーン企画', by: 'Growth Hackers', value: 100000, nature: 0.6, reward: 100000, popularity: 5, description: '秋のセールスプロモーションに向けたSNSキャンペーンの企画と運用をお願いします。', workImage: '', date: '2025-08-13T14:00:00', userComments: [
    { text: 'ターゲット層は？', date: '2025-08-13T14:10:00', userName: 'Tanaka', userIcon: '🧑‍💼' },
    { text: 'SNSの種類は？', date: '2025-08-13T14:12:00', userName: 'Suzuki', userIcon: '👨‍🌾' },
    { text: '実績が知りたい', date: '2025-08-13T14:15:00', userName: 'Yamada', userIcon: '🎬' },
    { text: 'キャンペーンのKPIやゴール設定についても明記してほしいです。', date: '2025-08-13T14:18:00', userName: 'Miki', userIcon: '👩‍🎨' },
    { text: '過去の成功事例や失敗事例があれば参考にしたいです。', date: '2025-08-13T14:20:00', userName: 'Sato', userIcon: '👨‍💻' },
    { text: '広告予算や運用体制についても教えてください。', date: '2025-08-13T14:22:00', userName: 'Tanaka', userIcon: '🧑‍💼' }
  ] },
  { type: 'offer', id: 4, title: '朝採れ有機野菜セット (M)', by: 'Suzuki Farms', value: 3500, nature: 0.1, reward: 3500, popularity: 10, description: '旬の有機野菜を8〜10種類詰め合わせたセットです。新鮮な味をお楽しみください。', workImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', date: '2025-08-14T08:00:00', userComments: [] },
  { type: 'request', id: 5, title: 'Webサイト翻訳（英→日）', by: 'Global Bridge', value: 80000, nature: 0.7, reward: 80000, popularity: 7, description: '企業Webサイトの英語から日本語への翻訳。IT用語に強い方歓迎。', workImage: '', date: '2025-08-15T16:00:00', userComments: [] },
  { type: 'offer', id: 6, title: 'プロカメラマンによる商品撮影', by: 'PhotoPro', value: 30000, nature: 0.5, reward: 30000, popularity: 6, description: 'ECサイト用の商品写真をプロが撮影・レタッチまで対応します。', workImage: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', date: '2025-08-16T13:00:00', userComments: [] },
  { type: 'request', id: 7, title: 'YouTube動画編集', by: 'Yamada Channel', value: 20000, nature: 0.8, reward: 20000, popularity: 8, description: 'YouTube用の動画編集。カット・テロップ・BGM挿入など。', workImage: '', date: '2025-08-17T17:00:00', userComments: [] },
  { type: 'offer', id: 8, title: 'SEO記事執筆（1本）', by: 'Content Works', value: 12000, nature: 0.3, reward: 12000, popularity: 5, description: 'SEOを意識したWeb記事を1本執筆します。ジャンル相談可。', workImage: '', date: '2025-08-18T10:00:00', userComments: [] },
  { type: 'request', id: 9, title: 'アプリUIデザイン', by: 'AppStart', value: 60000, nature: 0.85, reward: 60000, popularity: 9, description: '新規スマホアプリのUIデザイン案を3パターン提案してほしい。', workImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', date: '2025-08-18T15:00:00', userComments: [] },
  { type: 'offer', id: 10, title: 'オンライン英会話レッスン', by: 'English Now', value: 2500, nature: 0.4, reward: 2500, popularity: 7, description: 'ネイティブ講師によるマンツーマン英会話レッスン（1回25分）。', workImage: '', date: '2025-08-19T19:00:00', userComments: [] },
  { type: 'request', id: 11, title: 'クラウド会計導入サポート', by: 'SmartBiz', value: 40000, nature: 0.65, reward: 40000, popularity: 6, description: 'freeeやマネーフォワードなどクラウド会計ソフトの導入支援。', workImage: '', date: '2025-08-20T11:00:00', userComments: [] },
  { type: 'offer', id: 12, title: 'イラストアイコン作成', by: 'Miki Art', value: 5000, nature: 0.2, reward: 5000, popularity: 8, description: 'SNSやブログ用のオリジナルイラストアイコンを作成します。', workImage: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80', date: '2025-08-21T09:00:00', userComments: [] }
];
export const loggedInUserDataGlobal = {
  id: 'user555',
  name: '田中 さとし',
  name_en: 'Satoshi Tanaka',
  role: 'contractor', // 'client' or 'contractor'
};

// --- Data transformation functions (Phase 1: View layer separation) ---
/**
 * Convert dashboardAllProjects to WorkManagement view format
 * @param {string} userId - Contractor user ID
 * @returns {Array} Projects in workManagementProjects format
 */
export function getWorkManagementProjectsView(userId = loggedInUserDataGlobal.id) {
  // Get projects where user is the contractor
  const userProjects = dashboardAllProjects.filter(
    project => project.contractorId === userId && project.status !== '完了' && project.status !== 'Completed'
  );

  // Transform to workManagement format
  return userProjects.map(project => {
    // Convert milestones to cards format
    const cards = (project.milestones || []).map((milestone, index) => {
      // Map dashboard milestone status to workManagement card status
      let cardStatus = 'unsent';
      if (milestone.status === 'completed' || milestone.status === 'released') {
        cardStatus = 'approved';
      } else if (milestone.status === 'in_progress') {
        cardStatus = 'awaiting_approval';
      } else if (milestone.status === 'pending') {
        cardStatus = 'unsent';
      }

      return {
        id: milestone.id,
        projectId: project.id,
        title: milestone.name,
        status: cardStatus,
        reward: milestone.amount,
        startDate: milestone.dueDate || '',
        duration: 0, // Not stored in dashboard data
        order: index + 1,
      };
    });

    return {
      id: project.id,
      name: project.name,
      client: project.clientName,
      totalBudget: project.totalAmount,
      deadline: project.milestones?.[project.milestones.length - 1]?.dueDate || '',
      duration: 0,
      description: project.description,
      _pendingStatus: 'accepted',
      status: '',
      cards,
    };
  });
}

/**
 * Calculate payment status for a project
 * @param {Object} project - Project from dashboardAllProjects
 * @returns {Object} Payment summary with totalAmount, fundsDeposited, fundsReleased, fundsRemaining, completionRate
 */
export function getProjectPaymentStatus(project) {
  const totalAmount = project.totalAmount || 0;
  const fundsDeposited = project.fundsDeposited || 0;

  // Calculate fundsReleased from completed/released milestones
  let fundsReleased = 0;
  if (project.milestones && project.milestones.length > 0) {
    fundsReleased = project.milestones
      .filter(m => m.status === 'completed' || m.status === 'released')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
  }

  const fundsRemaining = totalAmount - fundsReleased;
  const completionRate = totalAmount > 0 ? Math.round((fundsReleased / totalAmount) * 100) : 0;

  return {
    totalAmount,
    fundsDeposited,
    fundsReleased,
    fundsRemaining,
    completionRate,
  };
}

// --- Dummy data ---
// Note: workManagementProjects has been removed. Use getWorkManagementProjectsView() instead.
// All project data is now stored in dashboardAllProjects (single source of truth)

export const dashboardAllProjects = [
  // job101
  // id: job1 (completed logo renewal project)
  {
    id: 'job1',
    name: '企業ロゴリニューアルプロジェクト',
    name_en: 'Corporate Logo Renewal Project',
    clientName: '山田ベーカリー',
    clientName_en: 'Yamada Bakery',
    clientId: 'user123',
    contractorName: '田中 さとし',
    contractorName_en: 'Satoshi Tanaka',
    contractorId: 'user555',
    contractorResellingRisk: 5,
    clientResellingRisk: 0,
    totalAmount: 180000,
    fundsDeposited: 180000,
    fundsReleased: 180000,
    status: '完了',
    status_en: 'Completed',
    description: '創業50年を迎える老舗ベーカリー「山田ベーカリー」のブランドイメージを一新するためのロゴマーク、タグライン、および基本的なブランドガイドラインの制作。',
    description_en: 'Create a new logo, tagline, and basic brand guidelines for Yamada Bakery, a long-established bakery celebrating its 50th anniversary.',
    deliverables: 'ロゴデータ（AI, PNG, JPG）、ブランドガイドライン（PDF）',
    deliverables_en: 'Logo data (AI, PNG, JPG), brand guidelines (PDF)',
    deliverableDetails: 'ロゴマーク（カラー、モノクロ、反転）、タグライン、基本デザインシステム（カラースキーム、指定フォント）、ブランドガイドライン（使用禁止例含む）',
    deliverableDetails_en: 'Logo mark (color, monochrome, reversed), tagline, basic design system (color scheme, specified fonts), brand guidelines including prohibited usage examples.',
    acceptanceCriteria: '最終承認されたデザイン案通りの納品',
    acceptanceCriteria_en: 'Delivery matches the final approved design proposal.',
    acceptanceCriteriaDetails: '依頼者による最終確認後、承認をもって検収完了とする。',
    acceptanceCriteriaDetails_en: 'Inspection is complete upon final confirmation and approval by the client.',
    scopeOfWork_included: 'ロゴデザイン3案提案、選定案のブラッシュアップ、ブランドガイドライン作成（10ページ程度）',
    scopeOfWork_included_en: 'Propose 3 logo designs, refine the selected design, create brand guidelines (approx. 10 pages).',
    scopeOfWork_excluded: 'ロゴを使用した販促物デザイン（名刺、チラシ等）、ウェブサイトへのロゴ組み込み',
    scopeOfWork_excluded_en: 'Designing promotional materials (business cards, flyers, etc.), incorporating the logo into the website.',
    additionalWorkTerms: '販促物デザインは別途お見積もり。ガイドラインの大幅なページ数増加は追加費用発生の可能性あり。',
    additionalWorkTerms_en: 'Promotional material design will be quoted separately. Significant increase in guideline pages may incur additional costs.',
    agreementDocLink: 'yamada_bakery_agreement_v1.pdf',
    changeOrders: [
      {
        id: 'co1-1',
        date: '2024-07-20',
        description: 'エコバッグ用デザインパターンの追加',
        description_en: 'Additional design pattern for eco-bag',
        agreed: true,
        additionalCost: 20000,
      },
    ],
    communicationLogCount: 42,
    lastUpdate: '2024-08-19 11:00',
    hasDispute: false,
    milestones: [
      { id: 'job1-m1', name: '要件定義', amount: 60000, status: 'completed', dueDate: '2024-07-10' },
      { id: 'job1-m2', name: 'デザイン承認', amount: 60000, status: 'completed', dueDate: '2024-07-20' },
      { id: 'job1-m3', name: '納品', amount: 60000, status: 'released', dueDate: '2024-08-01' },
    ],
    contractorRating: {
      averageScore: 5,
      totalReviews: 1,
      reviews: [
        {
          reviewId: 'r1-yamada',
          projectId: 1,
          clientId: 'user123',
          clientName: '山田ベーカリー',
          clientName_en: 'Yamada Bakery',
          rating: 5,
          comment: '素晴らしいロゴをありがとうございました。',
          comment_en: 'Thank you for the wonderful logo.',
          contractorResponse: 'ありがとうございます！',
          contractorResponse_en: 'Thank you very much!',
          date: '2024-08-19',
          disputeContext: null,
          disputeContext_en: null,
          isFlagged: false,
        },
      ],
    },
    needsClientRating: false,
    imageUrl:
      'https://placehold.co/600x400/10B981/FFFFFF?text=%E3%83%AD%E3%82%B4%E3%83%AA%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%A2%E3%83%AB',
    allowSubcontracting: false,
  },
  {
    id: 'job3',
    name: 'モバイルアプリUI設計',
    name_en: 'Mobile App UI Design',
    clientName: 'テックスタートアップ株式会社',
    clientName_en: 'Tech Startup Inc.',
    clientId: 'client789',
    contractorName: '田中 さとし',
    contractorName_en: 'Satoshi Tanaka',
    contractorId: 'user555',
    contractorResellingRisk: 0,
    clientResellingRisk: 0,
    totalAmount: 450000,
    fundsDeposited: 450000,
    fundsReleased: 0,
    status: '作業中',
    status_en: 'In Progress',
    description: 'スタートアップ向けモバイルアプリのUI/UX設計プロジェクト。ユーザー体験を最優先に、直感的で使いやすいインターフェースを設計します。',
    description_en: 'Mobile app UI/UX design project for a startup. Design an intuitive and user-friendly interface with a focus on user experience.',
    deliverables: 'UIデザインデータ（Figma）、デザインガイドライン',
    deliverables_en: 'UI design files (Figma), design guidelines',
    deliverableDetails: 'Figma形式での納品。主要画面デザイン、コンポーネントライブラリ、デザインガイドライン（カラー、タイポグラフィ、スペーシング）',
    deliverableDetails_en: 'Deliver in Figma format. Main screen designs, component library, design guidelines (colors, typography, spacing)',
    acceptanceCriteria: 'デザイン仕様書通りの実装、ユーザビリティテスト合格',
    acceptanceCriteria_en: 'Implementation matches design specs and passes usability testing',
    acceptanceCriteriaDetails: '各マイルストーンごとに検収を実施。最終納品後7営業日以内に検収完了。',
    acceptanceCriteriaDetails_en: 'Inspection at each milestone. Final inspection within 7 business days after delivery.',
    scopeOfWork_included: 'UI/UXデザイン、プロトタイプ作成、デザインガイドライン作成',
    scopeOfWork_included_en: 'UI/UX design, prototype creation, design guidelines',
    scopeOfWork_excluded: 'アプリ開発、バックエンド開発、ストア申請',
    scopeOfWork_excluded_en: 'App development, backend development, store submission',
    additionalWorkTerms: 'デザイン変更は各マイルストーンごとに2回まで対応。',
    additionalWorkTerms_en: 'Up to 2 design revisions per milestone.',
    agreementDocLink: 'tech_startup_agreement_v1.pdf',
    changeOrders: [],
    communicationLogCount: 28,
    lastUpdate: '2026-02-01 14:30',
    hasDispute: false,
    milestones: [
      { id: 'job3-m1', name: 'ワイヤーフレーム作成', amount: 150000, status: 'completed', dueDate: '2026-01-25' },
      { id: 'job3-m2', name: 'UIデザイン初稿', amount: 150000, status: 'in_progress', dueDate: '2026-02-10' },
      { id: 'job3-m3', name: '最終デザイン納品', amount: 150000, status: 'pending', dueDate: '2026-02-25' },
    ],
    contractorRating: null,
    clientRating: { averageScore: 4.8, totalReviews: 5 },
    needsClientRating: false,
    imageUrl: 'https://placehold.co/600x400/3B82F6/FFFFFF?text=%E3%83%A2%E3%83%90%E3%82%A4%E3%83%ABAPP',
    allowSubcontracting: false,
  },
  {
    id: 'job2',
    name: 'WebアプリUI改善プロジェクト',
    name_en: 'Web App UI Improvement Project',
    clientName: '株式会社サンプル',
    clientName_en: 'Sample Inc.',
    clientId: 'client456',
    contractorName: '田中 さとし',
    contractorName_en: 'Satoshi Tanaka',
    contractorId: 'user555',
    contractorResellingRisk: 0,
    clientResellingRisk: 0,
    totalAmount: 500000,
    fundsDeposited: 500000,
    fundsReleased: 100000,
    status: '作業中',
    status_en: 'In Progress',
    description: '既存WebアプリのUI/UXを全面刷新し、ユーザー体験を向上させるプロジェクト。モダンなデザインと使いやすさを両立させます。',
    description_en: 'A project to completely renovate the UI/UX of an existing web app to improve user experience. Combines modern design with ease of use.',
    deliverables: 'UIデザインデータ（Figma）、デザインシステム、実装支援',
    deliverables_en: 'UI design files (Figma), design system, implementation support',
    deliverableDetails: 'Figma形式での納品。主要画面デザイン、デザインシステム（コンポーネント、カラー、タイポグラフィ）、実装ガイドライン',
    deliverableDetails_en: 'Deliver in Figma format. Main screen designs, design system (components, colors, typography), implementation guidelines',
    acceptanceCriteria: 'デザイン仕様書通りの実装、ユーザビリティ向上の確認',
    acceptanceCriteria_en: 'Implementation matches design specs and confirms improved usability',
    acceptanceCriteriaDetails: '各マイルストーンごとに検収を実施。最終納品後5営業日以内に検収完了。',
    acceptanceCriteriaDetails_en: 'Inspection at each milestone. Final inspection within 5 business days after delivery.',
    scopeOfWork_included: 'UI/UXデザイン、デザインシステム構築、実装支援',
    scopeOfWork_included_en: 'UI/UX design, design system construction, implementation support',
    scopeOfWork_excluded: 'フロントエンド実装、バックエンド開発、テスト',
    scopeOfWork_excluded_en: 'Frontend implementation, backend development, testing',
    additionalWorkTerms: 'デザイン変更は各マイルストーンごとに2回まで対応。',
    additionalWorkTerms_en: 'Up to 2 design revisions per milestone.',
    agreementDocLink: 'sample_inc_agreement_v1.pdf',
    changeOrders: [],
    communicationLogCount: 35,
    lastUpdate: '2026-02-02 10:00',
    hasDispute: false,
    milestones: [
      { id: 'job2-m1', name: '要件定義', amount: 100000, status: 'completed', dueDate: '2026-02-05' },
      { id: 'job2-m2', name: 'UIデザイン', amount: 200000, status: 'in_progress', dueDate: '2026-02-15' },
      { id: 'job2-m3', name: '実装・テスト', amount: 200000, status: 'pending', dueDate: '2026-02-28' },
    ],
    contractorRating: null,
    clientRating: { averageScore: 4.9, totalReviews: 8 },
    needsClientRating: false,
    imageUrl: 'https://placehold.co/600x400/10B981/FFFFFF?text=Web%E3%82%A2%E3%83%97%E3%83%AA',
    allowSubcontracting: false,
    proposals: [
      {
        id: 'prop_user001_for_job2',
        contractorId: 'user001',
        contractorName: '山田太郎',
        contractorName_en: 'Taro Yamada',
        contractorReputation: {
          totalReviews: 32,
          skillsCertified: ['UI/UXデザイン', 'Figma'],
        },
        contractorPortfolio: {
          totalProjects: 67,
          completionRate: 96,
          repeatClientRate: 58,
          portfolioUrl: 'https://portfolio.example.com/yamada',
          featuredProjects: [
            { name: 'ECサイトUI改善', category: 'Webデザイン', year: 2025 },
            { name: '金融アプリデザイン', category: 'UI/UX', year: 2024 },
            { name: 'SaaSダッシュボード', category: 'Webデザイン', year: 2024 }
          ],
          specialties: ['UI/UX', 'Figma', 'デザインシステム', 'レスポンシブ']
        },
        proposalText: 'UI/UX改善の実績が豊富です。ユーザー体験を重視したデザインを提供します。',
        proposalText_en: 'I have extensive UI/UX improvement experience. I provide user-experience-focused designs.',
        proposalDetails: {
          approach: 'ユーザーリサーチとヒートマップ分析から課題を特定し、データドリブンなデザイン改善を実施します。A/Bテストを活用して効果測定も行います。',
          techStack: ['Figma', 'Adobe XD', 'Sketch', 'InVision'],
          riskMitigation: 'デザインレビューを週次で実施し、方向性のズレを早期発見。プロトタイプで操作感を事前確認し、手戻りを防ぎます。',
          qualityAssurance: 'WCAGアクセシビリティ基準準拠。主要ブラウザ・デバイスでの表示確認を実施。デザインシステムで一貫性を担保します。'
        },
        proposedAmount: 500000,
        estimatedDeliveryTime: '3ヶ月',
        estimatedDeliveryTime_en: '3 months',
        submissionDate: '2026-01-28',
        status: 'pending_review',
      },
      {
        id: 'prop_user002_for_job2',
        contractorId: 'user002',
        contractorName: '鈴木花子',
        contractorName_en: 'Hanako Suzuki',
        contractorReputation: {
          totalReviews: 28,
          skillsCertified: ['Webデザイン'],
        },
        contractorPortfolio: {
          totalProjects: 45,
          completionRate: 100,
          repeatClientRate: 72,
          portfolioUrl: 'https://portfolio.example.com/suzuki',
          featuredProjects: [
            { name: 'コーポレートサイトリニューアル', category: 'Webデザイン', year: 2025 },
            { name: 'モバイルアプリUI', category: 'UI/UX', year: 2024 }
          ],
          specialties: ['Webデザイン', 'Figma', 'ユーザビリティ']
        },
        proposalText: 'モダンで使いやすいUIデザインが得意です。レスポンシブ対応も万全です。',
        proposalText_en: 'I specialize in modern and user-friendly UI design. Fully responsive.',
        proposalDetails: {
          approach: 'ペルソナ設定から始め、ユーザージャーニーマップを作成。各タッチポイントで最適なUIを設計します。',
          techStack: ['Figma', 'Photoshop', 'Illustrator'],
          riskMitigation: 'デザイン着手前にムードボードで方向性を確認。修正は各フェーズで2回まで無料対応します。',
          qualityAssurance: 'デザインガイドラインを作成し、実装時の品質を担保。ユーザビリティテストで検証します。'
        },
        proposedAmount: 480000,
        estimatedDeliveryTime: '2.5ヶ月',
        estimatedDeliveryTime_en: '2.5 months',
        submissionDate: '2026-01-29',
        status: 'pending_review',
      },
      {
        id: 'prop_user003_for_job2',
        contractorId: 'user003',
        contractorName: '佐藤次郎',
        contractorName_en: 'Jiro Sato',
        contractorReputation: {
          totalReviews: 19,
          skillsCertified: ['UI/UX'],
        },
        contractorPortfolio: {
          totalProjects: 38,
          completionRate: 97,
          repeatClientRate: 63,
          portfolioUrl: 'https://portfolio.example.com/sato',
          featuredProjects: [
            { name: 'SaaSプロダクトUI', category: 'UI/UX', year: 2025 },
            { name: 'EC管理画面改善', category: 'Webデザイン', year: 2024 }
          ],
          specialties: ['UI/UX', 'デザインシステム', 'プロトタイピング']
        },
        proposalText: 'SaaS製品のUI改善経験が豊富です。使いやすさと美しさを両立させます。',
        proposalText_en: 'Extensive experience in SaaS product UI improvements. Balance usability and aesthetics.',
        proposalDetails: {
          approach: '競合分析とユーザーインタビューで課題を洗い出し、段階的な改善プランを提案。成果を可視化します。',
          techStack: ['Figma', 'Framer', 'Principle'],
          riskMitigation: 'スプリント形式で進行し、2週間ごとにレビュー。フィードバックを即座に反映してリスクを最小化します。',
          qualityAssurance: 'デザインシステムで統一感を確保。アクセシビリティチェックとクロスブラウザテストを実施します。'
        },
        proposedAmount: 520000,
        estimatedDeliveryTime: '3ヶ月',
        estimatedDeliveryTime_en: '3 months',
        submissionDate: '2026-01-30',
        status: 'pending_review',
      },
    ],
  },
  {
    id: 'job101',
    name: '新サービス紹介LPデザイン',
    name_en: 'Landing Page Design for New Service',
    clientName: '株式会社スタートアップ支援',
    clientName_en: 'Startup Support Inc.',
    clientId: 'client101',
    contractorName: null,
    contractorName_en: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 65,
    totalAmount: 80000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    status_en: 'Open for Applications',
    dueDate: '2025-07-15',
    completionDate: null,
    description: '7月にリリース予定の新サービスの魅力を伝えるランディングページのデザインをお願いします。ターゲットは20代後半～30代の男女。ワイヤーフレームはこちらで用意します。イラスト制作も可能であれば尚可。',
    description_en: 'Design a landing page to highlight our new service launching in July. Target audience: men and women in their late 20s to 30s. Wireframes will be provided. Illustration skills are a bonus.',
    deliverables: 'LPデザインデータ一式（Figma）',
    deliverables_en: 'All LP design files (Figma)',
    deliverableDetails: 'Figma形式での納品。主要画面（トップ、サービス紹介、料金、会社概要、問い合わせ）のデザイン。スマートフォン表示にも対応。',
    deliverableDetails_en: 'Deliver in Figma format. Includes designs for main screens (Home, Service Introduction, Pricing, About Us, Contact). Must be mobile responsive.',
    acceptanceCriteria: 'デザインカンプ通りの実装、主要ブラウザでの表示確認',
    acceptanceCriteria_en: 'Implementation matches design comp and displays correctly on major browsers',
    acceptanceCriteriaDetails: '納品後5営業日以内に検収。修正は2回までとし、大幅な変更は別途協議。',
    acceptanceCriteriaDetails_en: 'Client will inspect within 5 business days after delivery. Up to 2 rounds of revisions allowed; major changes require separate discussion.',
    scopeOfWork_included: 'LPデザイン制作、レスポンシブデザイン対応、画像素材選定（フリー素材）',
    scopeOfWork_included_en: 'LP design, responsive layout, selection of free image resources',
    scopeOfWork_excluded: 'サーバー設定、ドメイン取得、有料画像素材の購入、テキストライティング',
    scopeOfWork_excluded_en: 'Server setup, domain registration, purchase of paid images, copywriting',
    additionalWorkTerms: '大幅なデザイン変更やページ追加が発生する場合は、別途お見積もりとなります。',
    additionalWorkTerms_en: 'Major design changes or adding pages will require a separate quote.',
    agreementDocLink: null,
    changeOrders: [],
    communicationLogCount: 0,
    lastUpdate: '2025-06-01 10:00',
    hasDispute: false,
    milestones: [
      {
        id: 'job101-m1',
        name: 'デザインカンプ初稿提出',
        name_en: 'Initial Design Draft Submission',
        amount: 40000,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-06-20',
        startDate: '2025-06-10',
        duration: 10,
        description: 'PC・スマホ両対応のデザインカンプを提出。',
        description_en: 'Submit design comp for both PC and smartphone.',
      },
      {
        id: 'job101-m2',
        name: '最終デザインデータ納品',
        name_en: 'Final Design Data Delivery',
        amount: 40000,
        status: 'pending',
        status_en: 'Approved',
        dueDate: '2025-07-10',
        startDate: '2025-06-21',
        duration: 19,
        description: '修正対応後、デザインデータ一式を納品。',
        description_en: 'Deliver all design files after revisions.',
      },
    ],
    requiredSkills: [
      'Webデザイン',
      'LP制作',
      'Figma',
      'レスポンシブデザイン',
    ],
    requiredSkills_en: [
      'Web Design',
      'LP Creation',
      'Figma',
      'Responsive Design',
    ],
    clientRating: { averageScore: 4.5, totalReviews: 12 },
    imageUrl:
      'https://placehold.co/600x400/7C3AED/FFFFFF?text=LP%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3',
    allowSubcontracting: false,
    aiRecommendationScore: 0.9,
    aiRecommendationReason: 'あなたのスキルはこの案件に最適です。',
    aiRecommendationReason_en: 'Your skills are a great fit for this project.',
    proposals: [
      {
        id: 'prop_user555_for_job101',
        contractorId: 'user555',
        contractorName: '田中 さとし',
        contractorName_en: 'Satoshi Tanaka',
        contractorReputation: {
          totalReviews: 15,
          skillsCertified: ['Webデザイン'], // 現行表記に統一
        },
        contractorPortfolio: {
          totalProjects: 42,
          completionRate: 98,
          repeatClientRate: 65,
          portfolioUrl: 'https://portfolio.example.com/tanaka',
          featuredProjects: [
            { name: 'ヘルスケアサービスLP', category: 'Webデザイン', year: 2025 },
            { name: 'ECサイトリニューアル', category: 'Webデザイン', year: 2024 }
          ],
          specialties: ['Figma', 'レスポンシブデザイン', 'UI/UX']
        },
        proposalText: 'LPデザインの経験豊富です。Figmaでの作成、レスポンシブ対応可能です。ぜひ担当させてください。',
        proposalText_en: 'I have extensive experience in LP design. I can create in Figma and support responsive design. I would love to take on this project.',
        proposalDetails: {
          approach: 'ターゲット層の行動分析を基に、CVR向上を重視したデザインを提案します。ファーストビューでの訴求力を最大化し、スムーズな導線設計で離脱率を最小限に抑えます。',
          techStack: ['Figma', 'Adobe XD', 'Photoshop', 'HTML/CSS'],
          riskMitigation: 'デザイン初稿提出前にワイヤーフレームで方向性を確認。修正は2回まで無料対応。納期遅延のリスクは事前スケジュール共有で回避します。',
          qualityAssurance: '複数デバイス・ブラウザでの表示確認を実施。アクセシビリティガイドライン（WCAG 2.1 AA）準拠を保証します。'
        },
        proposedAmount: 78000,
        estimatedDeliveryTime: '2週間',
        estimatedDeliveryTime_en: '2 weeks',
        submissionDate: '2025-06-06',
        status: 'pending_review',
      },
    ],
  },
  // job103
  {
    id: 'job103',
    name: 'PR記事作成依頼（月5本）',
    name_en: 'PR Article Writing Request (5 per month)',
    clientName: '田中 さとし',
    clientName_en: 'Satoshi Tanaka',
    clientId: 'user555',
    contractorName: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 20,
    totalAmount: 50000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    status_en: 'Open for Applications',
    dueDate: '2025-08-01',
    description: '弊社サービスの認知度向上のため、指定キーワードに基づいたPR記事を月5本作成・納品していただけるライター様を募集します。1記事あたり2000字程度。SEOライティング経験者歓迎。継続依頼の可能性あり。',
    description_en: 'We are seeking a writer to create and deliver 5 PR articles per month based on specified keywords to increase awareness of our service. Each article should be around 2,000 characters. SEO writing experience is welcome. Possible ongoing work.',
    deliverables: 'PR記事5本（Word形式）、各記事のキーワードリスト',
    deliverables_en: '5 PR articles (Word format), keyword list for each article',
    deliverableDetails: '各記事2000字以上。指定キーワードを適切に含み、読者の検索意図に合致する内容であること。コピ―コンテンツでないこと。',
    deliverableDetails_en: 'Each article must be at least 2,000 characters, include specified keywords appropriately, and match the reader’s search intent. No duplicate content.',
    acceptanceCriteria: '指定キーワードでの検索順位目標達成、誤字脱字なし',
    acceptanceCriteria_en: 'Achieve target search ranking for specified keywords, no typos or errors',
    acceptanceCriteriaDetails: '納品後3営業日以内に検収。修正は各記事1回まで。文法・表現の誤りがないこと。',
    acceptanceCriteriaDetails_en: 'Inspection within 3 business days after delivery. Each article may be revised once. No grammatical or expression errors.',
    scopeOfWork_included: '記事執筆、キーワードリサーチ、SEO観点での構成案作成',
    scopeOfWork_included_en: 'Article writing, keyword research, creating structure proposals from an SEO perspective',
    scopeOfWork_excluded: '画像選定、CMSへの入稿作業、SNSでの拡散',
    scopeOfWork_excluded_en: 'Image selection, CMS posting, social media sharing',
    additionalWorkTerms: '追加記事は1本あたり10,000円（税別）とします。',
    additionalWorkTerms_en: 'Additional articles will be charged at ¥10,000 (excluding tax) per article.',
    agreementDocLink: null,
    changeOrders: [],
    communicationLogCount: 0,
    lastUpdate: '2025-06-02 12:00',
    hasDispute: false,
    milestones: [
      {
        id: 'job103-m1',
        name: '初回記事5本納品',
        name_en: 'First Delivery of 5 Articles',
        amount: 50000,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-06-30',
        startDate: '2025-06-20',
        duration: 10,
        description: '指定キーワードに基づく記事5本',
        description_en: '5 articles based on specified keywords',
      },
    ],
    requiredSkills: ['SEOライティング', 'コンテンツ作成', 'キーワードリサーチ'],
    requiredSkills_en: ['SEO Writing', 'Content Creation', 'Keyword Research'],
    clientRating: { averageScore: null, totalReviews: 0 },
    imageUrl: 'https://placehold.co/600x400/DB2777/FFFFFF?text=PR%E8%A8%98%E4%BA%8B%E4%BD%9C%E6%88%90',
    allowSubcontracting: true,
    aiRecommendationScore: 0.75,
    aiRecommendationReason: 'あなたの「コンテンツ作成」スキルと過去の類似案件実績に合致しています。',
    aiRecommendationReason_en: 'Your content creation skills and past experience with similar projects are a great match.',
    proposals: [
      {
        id: 'prop001',
        projectId: 'job103',
        contractorId: 'user888',
        contractorName: '鈴木 一郎',
        contractorName_en: 'Ichiro Suzuki',
        contractorReputation: {
          averageScore: 4.9,
          totalReviews: 25,
          identityVerified: true,
          skillsCertified: ['SEO Master'],
        },
        contractorPortfolio: {
          totalProjects: 87,
          completionRate: 100,
          repeatClientRate: 78,
          portfolioUrl: 'https://portfolio.example.com/suzuki',
          featuredProjects: [
            { name: 'IT企業ブログ記事50本', category: 'SEOライティング', year: 2025 },
            { name: 'EC業界PR記事シリーズ', category: 'コンテンツマーケティング', year: 2024 },
            { name: '金融サービス記事30本', category: 'SEOライティング', year: 2024 }
          ],
          specialties: ['SEOライティング', 'キーワードリサーチ', 'コンテンツ戦略']
        },
        contractorResellingRisk: 15,
        proposalText: 'SEOライティング歴5年の鈴木と申します。貴社サービスに貢献できる質の高い記事を迅速に作成いたします。過去実績はポートフォリオをご覧ください。月5本、2000字/記事でご提案の予算内で対応可能です。納期も柔軟に対応できます。',
        proposalText_en: 'My name is Ichiro Suzuki and I have 5 years of experience in SEO writing. I will quickly create high-quality articles to contribute to your service. Please see my portfolio for past work. I can deliver 5 articles per month, 2,000 characters each, within your proposed budget. I am flexible with deadlines.',
        proposalDetails: {
          approach: 'キーワード選定から記事構成、執筆、最終チェックまで一貫したワークフローで品質を担保。検索意図の徹底分析により上位表示を実現します。',
          techStack: ['Googleキーワードプランナー', 'Ahrefs', 'WordPress', 'Grammarly'],
          riskMitigation: '納品遅延防止のため、各記事の進捗を週次で報告。コピーチェックツールで独自性100%を保証します。',
          qualityAssurance: '専任校正者による二重チェック体制。SEO観点でのタイトル・見出し最適化を実施。修正は初回無料で対応します。'
        },
        proposedAmount: 50000,
        estimatedDeliveryTime: '各記事3営業日以内',
        estimatedDeliveryTime_en: 'Within 3 business days per article',
        submissionDate: '2025-06-03',
        status: 'pending_review',
      },
      {
        id: 'prop002',
        projectId: 'job103',
        contractorId: 'user999',
        contractorName: '高橋 文子',
        contractorName_en: 'Ayako Takahashi',
        contractorReputation: {
          averageScore: 4.7,
          totalReviews: 18,
          identityVerified: false,
          skillsCertified: [],
        },
        contractorPortfolio: {
          totalProjects: 34,
          completionRate: 94,
          repeatClientRate: 52,
          portfolioUrl: 'https://portfolio.example.com/takahashi',
          featuredProjects: [
            { name: 'テック系メディア記事', category: 'コンテンツ作成', year: 2025 },
            { name: 'スタートアップPR記事', category: 'ライティング', year: 2024 }
          ],
          specialties: ['IT・テクノロジー', 'PR記事', 'コンテンツ作成']
        },
        contractorResellingRisk: 5,
        proposalText: 'ライターの高橋です。特にIT・テクノロジー分野のPR記事を得意としております。キーワードリサーチから構成案作成、執筆まで一貫して対応可能です。ご提示の条件でぜひお受けしたく存じます。',
        proposalText_en: 'I am Ayako Takahashi, a writer specializing in PR articles for IT and technology fields. I can handle everything from keyword research and structure proposals to writing. I would be happy to accept your offer under the stated conditions.',
        proposedAmount: 48000,
        estimatedDeliveryTime: '月5本を月末までに納品',
        estimatedDeliveryTime_en: 'Deliver 5 articles by the end of the month',
        submissionDate: '2025-06-04',
        status: 'pending_review',
      },
    ],
    comment_en: null,
    contractorResponse_en: null,
  },
  // job_dispute_01
  {
    id: 'job_dispute_01',
    name: 'ウェブサイトリニューアル（協議中サンプル）',
    name_en: 'Website Renewal (Sample in Discussion)',
    clientName: '株式会社ABCテック',
    clientName_en: 'ABC Tech Inc.',
    clientId: 'clientABC',
    contractorName: '田中 さとし',
    contractorName_en: 'Satoshi Tanaka',
    contractorId: 'user555',
    contractorResellingRisk: 80,
    clientResellingRisk: 50,
    totalAmount: 150000,
    fundsDeposited: 100000,
    fundsReleased: 20000,
    status: '協議中',
    status_en: 'In Discussion',
    dueDate: '2025-05-01',
    completionDate: null,
    description: '既存コーポレートサイトのフルリニューアル。デザインとコーディングを含む。現在、仕様変更の範囲について依頼者と意見の相違が発生し、協議中です。',
    description_en: 'Complete renewal of the existing corporate website, including design and coding. Currently in discussion due to differences in the scope of changes with the client.',
    deliverables: 'ウェブサイト一式（HTML, CSS, JS, 画像素材）、デザインカンプ（Photoshop）',
    deliverables_en: 'Full website (HTML, CSS, JS, image assets), design comps (Photoshop)',
    deliverableDetails: '全10ページ構成。お問い合わせフォーム機能を含む。',
    deliverableDetails_en: 'Consists of 10 pages in total. Includes contact form functionality.',
    acceptanceCriteria: '全ページのデザインと機能が仕様書通りであること',
    acceptanceCriteria_en: 'All pages match the design and functionality specifications.',
    acceptanceCriteriaDetails: 'テスト環境での動作確認後、依頼者による承認。',
    acceptanceCriteriaDetails_en: 'Operation confirmed in the test environment, then client approval.',
    scopeOfWork_included: 'デザイン制作（トップページ＋下層9ページ）、HTML/CSS/JSコーディング、レスポンシブ対応、基本的なSEO設定',
    scopeOfWork_included_en: 'Design (top page + 9 subpages), HTML/CSS/JS coding, responsive support, basic SEO settings.',
    scopeOfWork_excluded: 'サーバー移管作業、公開後の保守運用、コンテンツ作成（テキスト・画像素材は依頼者支給）',
    scopeOfWork_excluded_en: 'Server migration, post-launch maintenance, content creation (text/images provided by client).',
    additionalWorkTerms: '仕様変更や追加ページ作成は、都度協議の上、追加費用を決定する。',
    additionalWorkTerms_en: 'Scope changes or additional pages: cost will be determined through discussion each time.',
    agreementDocLink: 'agreement_dispute_01.pdf',
    changeOrders: [
      {
        id: 'co_d1',
        date: '2025-04-15',
        description: '追加ページ作成依頼（未合意）',
        description_en: 'Request for additional page creation (not yet agreed)',
      },
    ],
    communicationLogCount: 35,
    lastUpdate: '2025-06-01 15:00',
    hasDispute: true,
  proposals: [],
    disputeDetails: '仕様変更の範囲と追加費用について合意に至らず、作業が中断しています。',
    disputeDetails_en: 'Work is suspended due to lack of agreement on the scope changes and additional costs.',
    milestones: [
      {
        id: 'job_d01-m1',
        name: 'デザインカンプ承認',
        name_en: 'Design Comp Approval',
        amount: 50000,
        status: 'approved',
        dueDate: '2025-04-10',
        description: 'トップページと主要下層ページのデザイン承認済み。',
        description_en: 'Designs for the top page and main subpages have been approved.',
      },
      {
        id: 'job_d01-m2',
        name: 'コーディング中間提出',
        name_en: 'Coding Interim Submission',
        amount: 50000,
        status: 'submitted',
        dueDate: '2025-04-25',
        description: '主要機能実装済み。追加仕様について協議中。',
        description_en: 'Main features have been implemented. Additional specifications are under discussion.',
      },
      {
        id: 'job_d01-m3',
        name: '最終納品と検収',
        name_en: 'Final Delivery & Inspection',
        amount: 50000,
        status: 'pending',
        dueDate: '2025-05-10',
        description: '全機能の結合テスト完了後、最終確認。',
        description_en: 'Final confirmation after all features have been implemented.',
      },
    ],
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    requiredSkills_en: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    clientRating: { averageScore: 4.0, totalReviews: 3 },
    allowSubcontracting: false,
  },
  // job104 - New high-budget development project
  {
    id: 'job104',
    name: 'スマートホームアプリ開発',
    name_en: 'Smart Home App Development',
    clientName: '株式会社スマートデバイス',
    clientName_en: 'Smart Device Inc.',
    clientId: 'clientSD',
    contractorName: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 35,
    totalAmount: 250000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    status_en: 'Open for Applications',
    dueDate: '2025-09-15',
    completionDate: null,
    description: 'IoTデバイスを制御するiOS/Androidアプリの開発。Bluetooth通信、クラウドAPI連携、プッシュ通知機能が必須。大手メーカーのプロジェクトのため、高品質と確実な納期が重要です。',
    description_en: 'Develop iOS/Android apps to control IoT devices. Bluetooth communication, cloud API integration, and push notification features are essential. High quality and reliable delivery are important due to partnership with a major manufacturer.',
    deliverables: 'iOS/Androidアプリ一式、ソースコード、API仕様書',
    deliverables_en: 'Complete iOS/Android apps, source code, API specifications',
    deliverableDetails: 'フルネイティブアプリ対応。デバイスペアリング、リモート操作、使用履歴表示、デバイス管理画面を実装。',
    deliverableDetails_en: 'Full native app support. Implement device pairing, remote control, usage history display, and device management screens.',
    acceptanceCriteria: '両OSでの動作確認済み、デバイス50台以上での負荷テスト合格',
    acceptanceCriteria_en: 'Verified to work on both iOS and Android, passed load testing with 50+ devices',
    acceptanceCriteriaDetails: '提出後、クライアントの QA チームによる検証。全機能が仕様通りに動作し、パフォーマンス基準を満たす必要がある。',
    acceptanceCriteriaDetails_en: 'Client QA team will verify after submission. All features must work as specified and meet performance requirements.',
    scopeOfWork_included: 'iOS/Androidネイティブアプリ開発、UI/UXデザイン、Bluetooth実装、API連携、プッシュ通知機能',
    scopeOfWork_included_en: 'iOS/Android native app development, UI/UX design, Bluetooth implementation, API integration, push notification features',
    scopeOfWork_excluded: 'バックエンドサーバー開発、デバイスハードウェア、App Store/Google Playへのリリース手続き',
    scopeOfWork_excluded_en: 'Backend server development, hardware, App Store/Google Play release procedures',
    additionalWorkTerms: '仕様変更や追加機能は1機能あたり50,000円から。プラットフォーム対応の追加（例：Wear OS）は別途お見積もり。',
    additionalWorkTerms_en: 'Scope changes or additional features start at ¥50,000 per feature. Additional platforms (e.g., Wear OS) will be quoted separately.',
    agreementDocLink: null,
    changeOrders: [],
    communicationLogCount: 0,
    lastUpdate: '2025-06-05 09:00',
    hasDispute: false,
    milestones: [
      {
        id: 'job104-m1',
        name: '設計とプロトタイプ',
        name_en: 'Design & Prototype',
        amount: 80000,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-07-15',
        startDate: '2025-06-15',
        duration: 30,
        description: 'アプリ設計、ワイヤーフレーム、インタラクティブプロトタイプの作成。',
        description_en: 'App design, wireframes, and interactive prototype creation.',
      },
      {
        id: 'job104-m2',
        name: 'iOS開発完了',
        name_en: 'iOS Development Complete',
        amount: 85000,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-08-15',
        startDate: '2025-07-16',
        duration: 30,
        description: 'iOSアプリの全機能実装とテスト完了。',
        description_en: 'Complete iOS implementation and testing.',
      },
      {
        id: 'job104-m3',
        name: 'Android開発と統合テスト',
        name_en: 'Android Development & Integration Testing',
        amount: 85000,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-09-15',
        startDate: '2025-08-16',
        duration: 30,
        description: 'Androidアプリの実装、両OSの統合テスト、最終納品。',
        description_en: 'Android implementation, cross-platform integration testing, final delivery.',
      },
    ],
    requiredSkills: ['iOS開発', 'Android開発', 'Bluetooth', 'API設計', 'Swift', 'Kotlin'],
    requiredSkills_en: ['iOS Development', 'Android Development', 'Bluetooth', 'API Design', 'Swift', 'Kotlin'],
    clientRating: { averageScore: 4.8, totalReviews: 15 },
    imageUrl: 'https://placehold.co/600x400/3B82F6/FFFFFF?text=%E3%82%B9%E3%83%9E%E3%83%BC%E3%83%88%E3%83%9B%E3%83%BC%E3%83%A0',
    allowSubcontracting: false,
    aiRecommendationScore: 0.88,
    aiRecommendationReason: 'あなたのiOS/Android開発スキルと大型プロジェクト実績に最適です。',
    aiRecommendationReason_en: 'Your iOS/Android development skills and large project experience are a perfect fit.',
    proposals: [],
  },
  // job105
  {
    id: 'job105',
    name: '簡単なデータ入力作業',
    name_en: 'Simple Data Entry Task',
    clientName: '株式会社データサービス',
    clientName_en: 'Data Service Inc.',
    clientId: 'clientXYZ',
    contractorName: null,
    contractorId: null,
    totalAmount: 20000,
    status: '募集中',
    dueDate: '2025-07-20',
    description: '指定されたフォーマットへのデータ入力作業です。正確性が求められます。週に10時間程度の作業を想定しています。',
    description_en: 'Enter data into a specified format. Accuracy is required. Expected workload: about 10 hours per week.',
    requiredSkills: ['データ入力', 'Excel', '注意力'],
    requiredSkills_en: ['Data Entry', 'Excel', 'Attention to Detail'],
    clientRating: { averageScore: 4.0, totalReviews: 3 },
    allowSubcontracting: false,
    aiRecommendationScore: 0.2,
    proposals: [],
    milestones: [
      {
        id: 'job105-m1',
        name: 'データ入力完了',
        name_en: 'Data Entry Completion',
        amount: 20000,
        status: 'pending',
        dueDate: '2025-07-20',
        description: '全データ入力完了',
        description_en: 'All data entry completed.',
      },
    ],
  },
  // id: job4
  {
    id: 'job4',
    name: 'アプリUI改善提案',
    name_en: 'App UI Improvement Proposal',
    clientName: 'スタートアップY',
    clientName_en: 'Startup Y',
    clientId: 'clientY',
    contractorName: '田中 さとし',
    contractorName_en: 'Satoshi Tanaka',
    contractorId: 'user555',
    contractorResellingRisk: 0,
    clientResellingRisk: 0,
    totalAmount: 120000,
    fundsDeposited: 120000,
    fundsReleased: 0,
    status: '作業中',
    status_en: 'In Progress',
    dueDate: '2025-07-05',
    description: '既存モバイルアプリのUI改善提案とモック作成。週1回の定例ミーティング必須。',
    description_en: 'Propose UI improvements and create mockups for an existing mobile app. Weekly meetings are required.',
    deliverables: 'UI改善提案資料（PDF）、主要画面モックアップ（Figma）',
    deliverables_en: 'UI improvement proposal document (PDF), main screen mockups (Figma)',
    deliverableDetails: '現状分析レポート、UI改善案（3パターン）、主要5画面のインタラクティブモックアップ。',
    deliverableDetails_en: 'Report on current state analysis, 3 UI improvement ideas, and interactive mockups for 5 main screens.',
    acceptanceCriteria: '提案内容がユーザビリティテストで高評価を得ること',
    acceptanceCriteria_en: 'Proposal receives high marks in usability testing.',
    acceptanceCriteriaDetails: 'ユーザビリティテストは依頼者側で実施。テスト結果に基づき、致命的な問題がないことを確認。',
    acceptanceCriteriaDetails_en: 'Usability testing will be conducted by the client. No critical issues should be found based on the test results.',
    scopeOfWork_included: '現状分析、ユーザーインタビュー（3名まで）、競合調査、改善提案、ワイヤーフレーム作成、モックアップ作成',
    scopeOfWork_included_en: 'Current state analysis, user interviews (up to 3 people), competitor research, improvement proposals, wireframe creation, mockup creation.',
    scopeOfWork_excluded: '実装、A/Bテストの実施、ユーザーインタビュー対象者のリクルーティング',
    scopeOfWork_excluded_en: 'Implementation, A/B testing, recruiting interview subjects.',
    additionalWorkTerms: '追加画面のモック作成は1画面あたり20,000円。ユーザビリティテストの設計・実施サポートは別途お見積もり。',
    additionalWorkTerms_en: 'Additional mockups: ¥20,000 per screen. Usability test design/support will be quoted separately.',
    agreementDocLink: 'agreement_project4.pdf',
    changeOrders: [],
    communicationLogCount: 12,
    lastUpdate: '2025-05-30 11:00',
    hasDispute: false,
    milestones: [
      {
        id: 'm4-1',
        name: '現状分析と課題整理',
        name_en: 'Current State Analysis & Issue Identification',
        // ...other milestone properties as needed...
      },
    ],
  },
  // job106 - E-Commerce Site Development
  {
    id: 'job106',
    name: 'ECサイト新機能開発',
    name_en: 'New Feature Development for EC Site',
    clientName: '株式会社EコマースX',
    clientName_en: 'E-Commerce X Inc.',
    clientId: 'clientECX',
    contractorName: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 15,
    totalAmount: 300000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    dueDate: '2025-08-30',
    description: '既存ECサイトに決済機能とユーザーレビュー機能を追加開発。React, Node.jsの経験必須。複数の決済ゲートウェイ対応が必要。',
    description_en: 'Develop and add payment and user review features to an existing EC site. Experience with React and Node.js required. Must support multiple payment gateways.',
    deliverables: 'フロントエンドコンポーネント、バックエンドAPI、決済統合',
    deliverables_en: 'Frontend components, backend APIs, payment integration',
    deliverableDetails: 'Stripe/PayPal/Square対応の決済画面、レビュー投稿・管理機能、決済履歴管理画面。',
    deliverableDetails_en: 'Payment screens supporting Stripe/PayPal/Square, review submission/management features, payment history management screen.',
    acceptanceCriteria: '複数決済ゲートウェイの動作確認、セキュリティ監査クリア',
    acceptanceCriteria_en: 'Verified functionality across multiple payment gateways, passed security audit',
    acceptanceCriteriaDetails: 'PCI DSS準拠の確認、本番環境での2週間の負荷テスト、セキュリティペネトレーションテスト合格。',
    acceptanceCriteriaDetails_en: 'PCI DSS compliance verification, 2-week production load testing, passed security penetration testing.',
    scopeOfWork_included: 'React UI開発（決済・レビュー機能）、Node.js/Express API開発、決済ゲートウェイ連携、テスト（単体・統合）',
    scopeOfWork_included_en: 'React UI development (payment and review features), Node.js/Express API development, payment gateway integration, testing (unit and integration)',
    scopeOfWork_excluded: 'インフラストラクチャ構築、SSL証明書取得、データベース移行',
    scopeOfWork_excluded_en: 'Infrastructure setup, SSL certificate acquisition, database migration',
    additionalWorkTerms: '追加決済ゲートウェイ対応は1ゲートウェイあたり40,000円。国際化対応は別途お見積もり。',
    additionalWorkTerms_en: 'Additional payment gateway support: ¥40,000 per gateway. Internationalization will be quoted separately.',
    agreementDocLink: null,
    changeOrders: [],
    communicationLogCount: 0,
    lastUpdate: '2025-06-06 14:00',
    hasDispute: false,
    milestones: [
      {
        id: 'job106-m1',
        name: '要件定義と設計',
        name_en: 'Requirements Definition & Design',
        amount: 100000,
        status: 'pending',
        dueDate: '2025-07-15',
        description: '新機能の要件定義とシステム設計を完了。',
        description_en: 'Complete requirements definition and system design for new features.'
      },
      {
        id: 'job106-m2',
        name: '開発とテスト',
        name_en: 'Development & Testing',
        amount: 150000,
        status: 'pending',
        dueDate: '2025-08-15',
        description: '決済機能とレビュー機能のフロントエンド・バックエンド開発および単体テスト。',
        description_en: 'Develop and unit test payment and review features for both frontend and backend.'
      },
      {
        id: 'job106-m3',
        name: '最終納品と結合テスト',
        name_en: 'Final Delivery & Integration Testing',
        amount: 50000,
        status: 'pending',
        dueDate: '2025-08-30',
        description: '全機能の結合テスト完了後、本番環境へのデプロイ支援と最終納品。',
        description_en: 'Complete integration testing for all features, assist with production deployment, and deliver final assets.'
      }
    ],
    requiredSkills: ['React', 'Node.js', 'API連携', 'Express.js', 'PaymentGateway'],
    requiredSkills_en: ['React', 'Node.js', 'API Integration', 'Express.js', 'Payment Gateway'],
    clientRating: { averageScore: 4.7, totalReviews: 8 },
    imageUrl: 'https://placehold.co/600x400/10B981/FFFFFF?text=EC%E3%82%B5%E3%82%A4%E3%83%88',
    allowSubcontracting: false,
    aiRecommendationScore: 0.92,
    aiRecommendationReason: 'Reactとバックエンド開発の経験が豊富。高報酬案件です。',
    aiRecommendationReason_en: 'Your React and backend development experience is a strong match. High-paying project.',
    proposals: [],
  },
  // job107 - Graphic Design Project
  {
    id: 'job107',
    name: 'ブランドアイデンティティデザイン',
    name_en: 'Brand Identity Design Package',
    clientName: 'ベンチャー企業Z',
    clientName_en: 'Venture Company Z',
    clientId: 'clientZ',
    contractorName: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 40,
    totalAmount: 180000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    dueDate: '2025-07-25',
    description: 'ロゴ、カラーパレット、タイポグラフィ、ガイドラインを含むブランドアイデンティティの完全なパッケージ設計。業界は SaaS スタートアップです。',
    description_en: 'Design a complete brand identity package including logo, color palette, typography, and guidelines. The client is a SaaS startup.',
    deliverables: 'ロゴ（複数バリエーション）、ブランドガイドライン、カラーパレット定義、フォント選定',
    deliverables_en: 'Logo (multiple variations), brand guidelines, color palette definitions, font selections',
    deliverableDetails: '3種類のロゴバリエーション（フル/シンボル/テキスト）、40ページ以上のブランドガイドライン、カラーコード指定（RGB/HEX/CMYK）。',
    deliverableDetails_en: '3 logo variations (full/symbol/text), 40+ page brand guidelines, color codes specified (RGB/HEX/CMYK).',
    acceptanceCriteria: 'ロゴデザインが業界内で差別化され、ガイドラインが完全であること',
    acceptanceCriteria_en: 'Logo design differentiates in the industry, and guidelines are complete',
    acceptanceCriteriaDetails: 'クライアントによる最終承認。修正は2ラウンドまで。',
    acceptanceCriteriaDetails_en: 'Client final approval. Up to 2 rounds of revisions.',
    scopeOfWork_included: 'ロゴデザイン、ブランドガイドライン作成、カラー研究、タイポグラフィ選定、スタイルフレーム作成',
    scopeOfWork_included_en: 'Logo design, brand guidelines creation, color research, typography selection, style frame creation',
    scopeOfWork_excluded: 'ウェブサイト実装、印刷物の実製造、商標登録サポート',
    scopeOfWork_excluded_en: 'Website implementation, physical print production, trademark registration support',
    additionalWorkTerms: '追加のロゴバリエーション提案は1提案あたり30,000円。アニメーション ロゴはMotion Designとして別途見積もり。',
    additionalWorkTerms_en: 'Additional logo variations: ¥30,000 per proposal. Animated logos will be quoted as Motion Design separately.',
    agreementDocLink: null,
    changeOrders: [],
    communicationLogCount: 0,
    lastUpdate: '2025-06-07 10:30',
    hasDispute: false,
    milestones: [
      {
        id: 'job107-m1',
        name: 'ロゴコンセプト提案',
        name_en: 'Logo Concept Proposals',
        amount: 60000,
        status: 'pending',
        dueDate: '2025-07-05',
        description: 'ブランドコンセプトに基づいた5つのロゴコンセプト提案',
        description_en: 'Propose 5 logo concepts based on brand concept'
      },
      {
        id: 'job107-m2',
        name: 'ガイドライン制作',
        name_en: 'Guidelines Creation',
        amount: 80000,
        status: 'pending',
        dueDate: '2025-07-20',
        description: 'ロゴ承認後、完全なブランドガイドラインを作成',
        description_en: 'Create comprehensive brand guidelines after logo approval'
      },
      {
        id: 'job107-m3',
        name: '最終納品',
        name_en: 'Final Delivery',
        amount: 40000,
        status: 'pending',
        dueDate: '2025-07-25',
        description: '納品ファイル一式（EPS, AI, PNG, PDF）',
        description_en: 'Final delivery files (EPS, AI, PNG, PDF)'
      }
    ],
    requiredSkills: ['グラフィックデザイン', 'Illustrator', 'ブランディング', 'Adobe Creative Suite'],
    requiredSkills_en: ['Graphic Design', 'Illustrator', 'Branding', 'Adobe Creative Suite'],
    clientRating: { averageScore: 4.6, totalReviews: 11 },
    imageUrl: 'https://placehold.co/600x400/EC4899/FFFFFF?text=%E3%83%96%E3%83%A9%E3%83%B3%E3%83%89%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3',
    allowSubcontracting: false,
    aiRecommendationScore: 0.80,
    aiRecommendationReason: 'デザインスキルとブランディング経験が豊富。SaaS企業向けデザイン実績があります。',
    aiRecommendationReason_en: 'Strong design and branding experience. You have experience designing for SaaS companies.',
    proposals: [],
  },
  // job108 - SEO Audit & Optimization
  {
    id: 'job108',
    name: 'ウェブサイトSEO監査と最適化提案',
    name_en: 'Website SEO Audit & Optimization Plan',
    clientName: '中堅企業W',
    clientName_en: 'Mid-Size Company W',
    clientId: 'clientW',
    contractorName: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 25,
    totalAmount: 120000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    dueDate: '2025-08-15',
    description: '既存ウェブサイトの包括的なSEO監査を実施し、改善提案を作成。キーワード調査、テクニカルSEO、コンテンツ分析を含みます。',
    description_en: 'Conduct comprehensive SEO audit of existing website and create improvement recommendations. Includes keyword research, technical SEO, and content analysis.',
    deliverables: 'SEO監査レポート、改善提案書、キーワード戦略ドキュメント',
    deliverables_en: 'SEO audit report, improvement recommendations, keyword strategy document',
    deliverableDetails: '現状分析（50項目以上）、競合分析、キーワード提案（100以上）、改善優先度ランク付け。',
    deliverableDetails_en: 'Current state analysis (50+ items), competitive analysis, keyword proposals (100+), improvement prioritization.',
    acceptanceCriteria: 'レポートが実装可能で、3～6ヶ月で効果測定できる提案であること',
    acceptanceCriteria_en: 'Report is implementable and measurable within 3-6 months',
    acceptanceCriteriaDetails: 'クライアント承認後、3ヶ月のフォローアップコンサルティング無料提供。',
    acceptanceCriteriaDetails_en: 'Free 3-month follow-up consulting provided after client approval.',
    scopeOfWork_included: 'キーワード調査、オンページSEO分析、テクニカルSEO監査、バックリンク分析、競合分析',
    scopeOfWork_included_en: 'Keyword research, on-page SEO analysis, technical SEO audit, backlink analysis, competitive analysis',
    scopeOfWork_excluded: '実装サポート、広告運用、コンテンツ作成（別サービス）',
    scopeOfWork_excluded_en: 'Implementation support, ad management, content creation (separate service)',
    additionalWorkTerms: '実装サポートは時給15,000円。マンスリー SEO コンサルはパッケージ化して別途提案可。',
    additionalWorkTerms_en: 'Implementation support: ¥15,000/hour. Monthly SEO consulting can be packaged separately.',
    agreementDocLink: null,
    changeOrders: [],
    communicationLogCount: 0,
    lastUpdate: '2025-06-08 15:00',
    hasDispute: false,
    milestones: [
      {
        id: 'job108-m1',
        name: 'キーワードリサーチと分析',
        name_en: 'Keyword Research & Analysis',
        amount: 40000,
        status: 'pending',
        dueDate: '2025-07-20',
        description: 'ターゲットキーワード100以上を特定し、検索意図分析を完了',
        description_en: 'Identify 100+ target keywords and complete search intent analysis'
      },
      {
        id: 'job108-m2',
        name: 'テクニカル＆オンページ分析',
        name_en: 'Technical & On-Page Analysis',
        amount: 50000,
        status: 'pending',
        dueDate: '2025-08-05',
        description: 'サイト全体のテクニカルSEO監査とオンページ最適化分析',
        description_en: 'Complete technical SEO audit and on-page optimization analysis for entire site'
      },
      {
        id: 'job108-m3',
        name: 'レポート作成と提案',
        name_en: 'Report Creation & Recommendations',
        amount: 30000,
        status: 'pending',
        dueDate: '2025-08-15',
        description: '統合レポート、改善提案、実装ロードマップを納品',
        description_en: 'Deliver integrated report, improvement recommendations, and implementation roadmap'
      }
    ],
    requiredSkills: ['SEO', 'キーワード調査', 'Google Analytics', 'Search Console', 'テクニカルSEO'],
    requiredSkills_en: ['SEO', 'Keyword Research', 'Google Analytics', 'Search Console', 'Technical SEO'],
    clientRating: { averageScore: 4.5, totalReviews: 7 },
    imageUrl: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=SEO%E7%9B%A3%E6%9F%BB',
    allowSubcontracting: false,
    aiRecommendationScore: 0.78,
    aiRecommendationReason: 'SEO分析とレポート作成スキルが最適。中堅企業向けの実績多数。',
    aiRecommendationReason_en: 'Your SEO analysis and reporting skills are ideal. Extensive experience with mid-size companies.',
    proposals: [],
  },
  // job201 - Food service part-time (cafe)
  {
    id: 'job201',
    name: 'カフェスタッフ（レジ・ドリンク作成）',
    clientName: 'Cafe Latte Tokyo',
    clientId: 'clientCafe',
    contractorName: null,
    contractorId: null,
    category: '飲食',
    workType: 'hourly',
    locationType: 'onsite',
    hourlyRate: 1200,
    totalAmount: 1200 * 6 * 3, // 時給×6h×3日分目安
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    dueDate: '2025-08-10',
    description: '週3日、1日6時間程度。レジ対応とドリンク作成。初心者歓迎。',
    deliverables: 'シフト勤務、接客・ドリンク提供',
    acceptanceCriteria: '時間厳守と接客品質を守ること',
    scopeOfWork_included: 'レジ、ドリンク作成、簡単な片付け',
    scopeOfWork_excluded: '調理メニュー開発',
    additionalWorkTerms: '交通費1日上限1,000円支給',
    milestones: [
      { id: 'job201-m1', name: '初日シフト', amount: 0, status: 'pending', dueDate: '2025-08-05' },
      { id: 'job201-m2', name: '2日目シフト', amount: 0, status: 'pending', dueDate: '2025-08-07' },
      { id: 'job201-m3', name: '3日目シフト', amount: 0, status: 'pending', dueDate: '2025-08-10' },
    ],
    requiredSkills: ['接客', 'ドリンク作成'],
    clientRating: { averageScore: 4.2, totalReviews: 18 },
    imageUrl: 'https://placehold.co/600x400/10B981/FFFFFF?text=Cafe',
    aiRecommendationScore: 0.65,
    proposals: [],
  },
  // job202 - Logistics part-time (warehouse picking)
  {
    id: 'job202',
    name: '倉庫内ピッキング・梱包スタッフ',
    clientName: 'LogiX Warehouse',
    clientId: 'clientLogi',
    contractorName: null,
    contractorId: null,
    category: '物流',
    workType: 'hourly',
    locationType: 'onsite',
    hourlyRate: 1150,
    totalAmount: 1150 * 7 * 4, // 時給×7h×4日分
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    dueDate: '2025-08-12',
    description: 'EC倉庫での商品ピッキング・梱包作業。未経験可、軽作業中心。',
    deliverables: 'シフト勤務でのピッキング・梱包',
    acceptanceCriteria: '指定シフトを守り、誤出荷ゼロを目指すこと',
    scopeOfWork_included: '商品ピッキング、梱包、ラベル貼付',
    scopeOfWork_excluded: 'フォークリフト作業',
    additionalWorkTerms: '交通費全額支給、作業靴支給',
    milestones: [
      { id: 'job202-m1', name: '初日シフト', amount: 0, status: 'pending', dueDate: '2025-08-06' },
      { id: 'job202-m2', name: '2日目シフト', amount: 0, status: 'pending', dueDate: '2025-08-08' },
      { id: 'job202-m3', name: '3日目シフト', amount: 0, status: 'pending', dueDate: '2025-08-10' },
      { id: 'job202-m4', name: '4日目シフト', amount: 0, status: 'pending', dueDate: '2025-08-12' },
    ],
    requiredSkills: ['体力', '丁寧さ'],
    clientRating: { averageScore: 4.0, totalReviews: 9 },
    imageUrl: 'https://placehold.co/600x400/6366F1/FFFFFF?text=Logistics',
    aiRecommendationScore: 0.6,
    proposals: [],
  },
  // job203 - Retail (apparel sales)
  {
    id: 'job203',
    name: 'アパレル販売スタッフ（週末のみ）',
    clientName: 'Urban Wear Shibuya',
    clientId: 'clientRetail',
    contractorName: null,
    contractorId: null,
    category: '小売',
    workType: 'hourly',
    locationType: 'onsite',
    hourlyRate: 1300,
    totalAmount: 1300 * 6 * 2, // 時給×6h×2日
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    dueDate: '2025-08-09',
    description: '週末限定の販売スタッフ。レジ、フィッティング対応、商品整理。',
    deliverables: 'シフト勤務での接客販売',
    acceptanceCriteria: '接客品質とレジ誤差ゼロ',
    scopeOfWork_included: 'レジ、フィッティング、商品陳列',
    scopeOfWork_excluded: '仕入れ・発注業務',
    additionalWorkTerms: '交通費1日上限800円、社員割引あり',
    milestones: [
      { id: 'job203-m1', name: '初日シフト', amount: 0, status: 'pending', dueDate: '2025-08-03' },
      { id: 'job203-m2', name: '2日目シフト', amount: 0, status: 'pending', dueDate: '2025-08-09' },
    ],
    requiredSkills: ['接客', 'レジ操作'],
    clientRating: { averageScore: 4.3, totalReviews: 12 },
    imageUrl: 'https://placehold.co/600x400/F97316/FFFFFF?text=Retail',
    aiRecommendationScore: 0.62,
    proposals: [],
  },
  // Safe Job Sample - High S-Score and M-Score (Trusted, Well-Established Client)
  {
    id: 'job_safe_001',
    name: '既存Webサイトの定期メンテナンス（3ヶ月間）',
    name_en: 'Existing Website Regular Maintenance (3 months)',
    clientName: '東京都市銀行株式会社',
    clientName_en: 'Tokyo City Bank Inc.',
    clientId: 'client_bank_001',
    contractorName: null,
    contractorName_en: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 5, // Very low risk - established corporation
    totalAmount: 180000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    status_en: 'Open for Applications',
    dueDate: '2025-09-30',
    completionDate: null,
    description: '東京都市銀行のWebサイト定期メンテナンス業務です。既存のシステムのバグ修正、セキュリティアップデート、軽微な改善を月1回の定期レビュー会で対応していただきます。長期安定的な業務のため、信頼できるパートナーを探しています。',
    description_en: 'Regular maintenance for Tokyo City Bank website. Bug fixes, security updates, and minor improvements will be addressed through monthly review meetings. We are looking for a reliable partner for long-term stable work.',
    deliverables: '月次メンテナンスレポート、バグ修正実装、セキュリティパッチ適用',
    deliverables_en: 'Monthly maintenance reports, bug fixes, security patch applications',
    deliverableDetails: '月1回（第2水曜日）の定期レビュー会への参加、発見されたバグの修正、セキュリティパッチの適用。詳細は要件定義会で決定します。',
    deliverableDetails_en: 'Participation in monthly review meetings (2nd Wednesday), bug fixes, security patch applications. Details will be determined in the requirements definition meeting.',
    acceptanceCriteria: '検収基準に従い、月末までに実装完了',
    acceptanceCriteria_en: 'Implementation completed by month-end in accordance with acceptance criteria',
    acceptanceCriteriaDetails: '各月のメンテナンス内容について、完了時点で品質保証チームによる確認を実施します。',
    acceptanceCriteriaDetails_en: 'Quality assurance team will verify each month\'s maintenance upon completion.',
    scopeOfWork_included: '既存機能のバグ修正、セキュリティアップデート、軽微なUI改善、月次レポート作成',
    scopeOfWork_included_en: 'Bug fixes, security updates, minor UI improvements, monthly report creation',
    scopeOfWork_excluded: '新機能開発、システムリプレースメント、緊急対応（別途契約）',
    scopeOfWork_excluded_en: 'New feature development, system replacement, emergency support (separate contract)',
    additionalWorkTerms: '緊急対応が発生した場合は別途見積もり。継続契約の場合、3ヶ月以上は割引適用。',
    additionalWorkTerms_en: 'Emergency support will be quoted separately. Volume discounts apply for 3+ month contracts.',
    agreementDocLink: 'tokyo_bank_agreement_v1.pdf',
    changeOrders: [],
    communicationLogCount: 5,
    lastUpdate: '2025-06-08 14:30',
    hasDispute: false,
    milestones: [
      {
        id: 'job_safe_001-m1',
        name: '6月度メンテナンス',
        name_en: 'June Maintenance',
        amount: 60000,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-06-30',
        startDate: '2025-06-01',
        duration: 30,
        description: '初月のメンテナンス対応',
        description_en: 'First month maintenance',
      },
      {
        id: 'job_safe_001-m2',
        name: '7月度メンテナンス',
        name_en: 'July Maintenance',
        amount: 60000,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-07-31',
        startDate: '2025-07-01',
        duration: 31,
        description: '2ヶ月目のメンテナンス対応',
        description_en: 'Second month maintenance',
      },
      {
        id: 'job_safe_001-m3',
        name: '8月度メンテナンス',
        name_en: 'August Maintenance',
        amount: 60000,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-08-31',
        startDate: '2025-08-01',
        duration: 31,
        description: '3ヶ月目のメンテナンス対応',
        description_en: 'Third month maintenance',
      },
    ],
    requiredSkills: [
      'Webエンジニアリング',
      'PHP',
      'MySQL',
      'セキュリティ',
      'バグ修正',
    ],
    requiredSkills_en: [
      'Web Engineering',
      'PHP',
      'MySQL',
      'Security',
      'Debugging',
    ],
    clientRating: { averageScore: 4.8, totalReviews: 47 }, // Highly trusted client
    imageUrl: 'https://placehold.co/600x400/1E40AF/FFFFFF?text=Bank%20Website',
    allowSubcontracting: false,
    aiRecommendationScore: 0.95, // High recommendation score
    aiRecommendationReason: 'これは信頼できるクライアントからの安定案件です。継続的な収入源になります。',
    aiRecommendationReason_en: 'This is a stable project from a trusted client. It can become a reliable source of income.',
    proposals: [],
  },
  // Safe & Trusted Job Sample - High M-Score and S-Score (Fully Deposited + Trusted Client)
  {
    id: 'job_trusted_001',
    name: 'React コンポーネントライブラリ保守・拡張',
    name_en: 'React Component Library Maintenance & Enhancement',
    clientName: '株式会社デジタルプラットフォーム',
    clientName_en: 'Digital Platform Inc.',
    clientId: 'client_platform_001',
    contractorName: null,
    contractorName_en: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 3, // Very low risk - established tech company
    totalAmount: 250000,
    fundsDeposited: 250000, // FULLY DEPOSITED - High Safety Score!
    fundsReleased: 0,
    status: '募集中',
    status_en: 'Open for Applications',
    dueDate: '2025-08-31',
    completionDate: null,
    description: '弊社のプロダクトで使用しているReactコンポーネントライブラリの保守・改善業務。新しいコンポーネント追加、既存コンポーネントのバグ修正、パフォーマンス最適化、ドキュメント更新を行います。長期的なパートナーシップを想定しており、信頼できるエンジニアをお探しです。',
    description_en: 'Maintenance and improvement of our React component library. Add new components, fix bugs in existing components, optimize performance, and update documentation. We are looking for a reliable engineer for long-term partnership.',
    deliverables: 'React コンポーネント（TypeScript）、Storybook ドキュメント、ユニットテスト',
    deliverables_en: 'React components (TypeScript), Storybook documentation, unit tests',
    deliverableDetails: '毎月、新規コンポーネント2～3個の追加、既存コンポーネントの改善3～5件、テストカバレッジ80%以上の維持、Storybook による詳細なドキュメント作成。全て Git にコミット、コードレビュー合格後にリリース。',
    deliverableDetails_en: 'Monthly: Add 2-3 new components, improve 3-5 existing components, maintain 80%+ test coverage, create detailed Storybook documentation. All committed to Git, released after code review approval.',
    acceptanceCriteria: '月ごとの成果物がタスク定義通りに完成し、コードレビューで承認される',
    acceptanceCriteria_en: 'Monthly deliverables are completed as per task definition and pass code review',
    acceptanceCriteriaDetails: '各月末までに GitHub にプッシュ。コードレビューは3営業日以内に完了し、指摘事項があれば修正。修正から再レビューまで2営業日以内。コードレビュー合格時点で支払い実行。',
    acceptanceCriteriaDetails_en: 'Push to GitHub by month-end. Code review completed within 3 business days. If feedback given, fixes within 2 business days. Payment executed upon code review approval.',
    scopeOfWork_included: 'React コンポーネント開発、TypeScript での型定義、ユニットテスト（Jest）、Storybook ドキュメント、パフォーマンス監視',
    scopeOfWork_included_en: 'React component development, TypeScript type definitions, unit tests (Jest), Storybook documentation, performance monitoring',
    scopeOfWork_excluded: 'バックエンド開発、インフラ構築、デザイン作成（UI/UX）、ドキュメンテーション以外のサービス業務',
    scopeOfWork_excluded_en: 'Backend development, infrastructure setup, design creation (UI/UX), non-documentation service tasks',
    additionalWorkTerms: '緊急対応やスコープ外作業は別途見積もり。長期契約（3ヶ月以上）で月額10%割引。',
    additionalWorkTerms_en: 'Emergency support or out-of-scope work quoted separately. 10% monthly discount for long-term contracts (3+ months).',
    agreementDocLink: 'platform_component_lib_agreement_v1.pdf',
    changeOrders: [],
    communicationLogCount: 8,
    lastUpdate: '2025-06-10 10:00',
    hasDispute: false,
    milestones: [
      {
        id: 'job_trusted_001-m1',
        name: '6月度開発（新コンポーネント・改善）',
        name_en: 'June Development (New & Improvements)',
        amount: 83333,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-06-30',
        startDate: '2025-06-01',
        duration: 30,
        description: '新規コンポーネント2個、既存改善4件、テスト追加、ドキュメント更新',
        description_en: 'Add 2 new components, improve 4 existing, add tests, update documentation',
      },
      {
        id: 'job_trusted_001-m2',
        name: '7月度開発（新コンポーネント・改善）',
        name_en: 'July Development (New & Improvements)',
        amount: 83333,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-07-31',
        startDate: '2025-07-01',
        duration: 31,
        description: '新規コンポーネント2個、既存改善4件、テスト追加、ドキュメント更新',
        description_en: 'Add 2 new components, improve 4 existing, add tests, update documentation',
      },
      {
        id: 'job_trusted_001-m3',
        name: '8月度開発（新コンポーネント・改善）',
        name_en: 'August Development (New & Improvements)',
        amount: 83334,
        status: 'pending',
        status_en: 'Pending',
        dueDate: '2025-08-31',
        startDate: '2025-08-01',
        duration: 31,
        description: '新規コンポーネント2個、既存改善4件、テスト追加、ドキュメント更新',
        description_en: 'Add 2 new components, improve 4 existing, add tests, update documentation',
      },
    ],
    requiredSkills: [
      'React',
      'TypeScript',
      'Jest',
      'Storybook',
      'Git',
    ],
    requiredSkills_en: [
      'React',
      'TypeScript',
      'Jest',
      'Storybook',
      'Git',
    ],
    clientRating: { averageScore: 4.9, totalReviews: 63 }, // Very high trust
    imageUrl: 'https://placehold.co/600x400/3B82F6/FFFFFF?text=Component%20Library',
    allowSubcontracting: false,
    aiRecommendationScore: 0.98, // Highest recommendation
    aiRecommendationReason: 'これは最も安心できる案件です。全額デポジット済み、信頼できるクライアント、要件が非常に明確です。',
    aiRecommendationReason_en: 'This is the safest project. Fully deposited, trusted client, requirements crystal clear.',
    proposals: [],
  },
];


// --- Review/Rating System Functions ---

// Submit review from client to contractor or vice versa
export function submitReview(projectId, reviewData) {
  const { reviewerId, reviewerRole, rating, categories, comment } = reviewData;

  const project = dashboardAllProjects.find(p => p.id === projectId);
  if (!project) return false;

  const newReview = {
    reviewId: `r-${projectId}-${Date.now()}`,
    projectId,
    reviewerId,
    reviewerRole, // 'client' or 'contractor'
    rating, // Overall rating 1-5
    categories: categories || {}, // { communication: 5, quality: 5, timeliness: 5 }
    comment: comment || '',
    date: new Date().toISOString().split('T')[0],
    isFlagged: false,
  };

  if (reviewerRole === 'client') {
    // Client reviewing contractor
    if (!project.contractorRating) {
      project.contractorRating = {
        averageScore: rating,
        totalReviews: 1,
        reviews: [newReview],
      };
    } else {
      project.contractorRating.reviews.push(newReview);
      project.contractorRating.totalReviews = project.contractorRating.reviews.length;
      const totalScore = project.contractorRating.reviews.reduce((sum, r) => sum + r.rating, 0);
      project.contractorRating.averageScore = totalScore / project.contractorRating.totalReviews;
    }
  } else if (reviewerRole === 'contractor') {
    // Contractor reviewing client
    if (!project.clientRating) {
      project.clientRating = {
        averageScore: rating,
        totalReviews: 1,
        reviews: [newReview],
      };
    } else {
      project.clientRating.reviews = project.clientRating.reviews || [];
      project.clientRating.reviews.push(newReview);
      project.clientRating.totalReviews = project.clientRating.reviews.length;
      const totalScore = project.clientRating.reviews.reduce((sum, r) => sum + r.rating, 0);
      project.clientRating.averageScore = totalScore / project.clientRating.totalReviews;
    }
  }

  return true;
}

// Check if user needs to submit review for a project
export function needsReview(projectId, userId) {
  const project = dashboardAllProjects.find(p => p.id === projectId);
  if (!project || project.status !== '完了') return false;

  const isClient = project.clientId === userId;
  const isContractor = project.contractorId === userId;

  if (!isClient && !isContractor) return false;

  if (isClient) {
    // Check if client has reviewed contractor
    return !project.contractorRating || !project.contractorRating.reviews?.some(r => r.reviewerId === userId);
  } else {
    // Check if contractor has reviewed client
    return !project.clientRating || !project.clientRating.reviews?.some(r => r.reviewerId === userId);
  }
}

// Get review submitted by specific user for a project
export function getUserReview(projectId, userId) {
  const project = dashboardAllProjects.find(p => p.id === projectId);
  if (!project) return null;

  const isClient = project.clientId === userId;

  if (isClient && project.contractorRating?.reviews) {
    return project.contractorRating.reviews.find(r => r.reviewerId === userId);
  } else if (!isClient && project.clientRating?.reviews) {
    return project.clientRating.reviews.find(r => r.reviewerId === userId);
  }

  return null;
}

// Get all completed projects that need review by user
export function getProjectsNeedingReview(userId) {
  return dashboardAllProjects.filter(p => needsReview(p.id, userId));
}

// --- Milestone Individual Approval System ---

// Update milestone approval status
export function updateMilestoneApproval(projectId, milestoneId, status, negotiationData = null) {
  const project = dashboardAllProjects.find(p => p.id === projectId);
  if (!project || !project.milestones) return false;

  const milestone = project.milestones.find(m => m.id === milestoneId);
  if (!milestone) return false;

  // Add approvalStatus field if not exists
  if (!milestone.approvalStatus) {
    milestone.approvalStatus = 'pending';
  }

  // Update status
  milestone.approvalStatus = status; // 'pending', 'approved', 'negotiating', 'rejected'

  // Store negotiation data if provided
  if (negotiationData && status === 'negotiating') {
    if (!milestone.negotiations) {
      milestone.negotiations = [];
    }
    milestone.negotiations.push({
      id: `neg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      proposedAmount: negotiationData.amount,
      proposedDueDate: negotiationData.dueDate,
      reason: negotiationData.reason,
      status: 'pending', // 'pending', 'accepted', 'rejected'
    });
  }

  return true;
}

// Check if all milestones are approved
export function areAllMilestonesApproved(projectId) {
  const project = dashboardAllProjects.find(p => p.id === projectId);
  if (!project || !project.milestones) return false;

  return project.milestones.every(m => m.approvalStatus === 'approved');
}

// Get approved milestones total amount
export function getApprovedMilestonesTotal(projectId) {
  const project = dashboardAllProjects.find(p => p.id === projectId);
  if (!project || !project.milestones) return 0;

  return project.milestones
    .filter(m => m.approvalStatus === 'approved')
    .reduce((sum, m) => sum + (m.amount || 0), 0);
}

// Get milestone approval summary
export function getMilestoneApprovalSummary(projectId) {
  const project = dashboardAllProjects.find(p => p.id === projectId);
  if (!project || !project.milestones) return null;

  const total = project.milestones.length;
  const approved = project.milestones.filter(m => m.approvalStatus === 'approved').length;
  const pending = project.milestones.filter(m => !m.approvalStatus || m.approvalStatus === 'pending').length;
  const negotiating = project.milestones.filter(m => m.approvalStatus === 'negotiating').length;
  const rejected = project.milestones.filter(m => m.approvalStatus === 'rejected').length;
  const approvedAmount = getApprovedMilestonesTotal(projectId);
  const totalAmount = project.totalAmount || 0;

  return {
    total,
    approved,
    pending,
    negotiating,
    rejected,
    approvedAmount,
    totalAmount,
    allApproved: approved === total,
  };
}

// --- Exports for each app section (after dashboardAllProjects definition) ---
// Dashboard: for project list and progress display
export const dashboardProjects = dashboardAllProjects.filter(p => [
  'job101', 'job103', 'job1', 'job4', 'job_dispute_01'
].includes(p.id));



// // Command UI: projects for Command UI
// export const commandUIProjects = dashboardAllProjects.filter(p => [
//   'job106'
// ].includes(p.id));