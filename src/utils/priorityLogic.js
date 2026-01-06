/**
 * Priority Logic for "Today's Priority Task"
 *
 * This module calculates task priority based on:
 * - User role (client vs contractor)
 * - Project status
 * - Deadlines
 * - Response requirements
 * - M-Score and S-Score (when available)
 *
 * Philosophy: AI should tell users "what to do next" with minimal cognitive load.
 */

/**
 * Calculate priority score for a project/task
 * Higher score = higher priority
 *
 * @param {Object} project - Project data
 * @param {string} userRole - 'client' or 'contractor'
 * @param {string} userId - Current user ID
 * @returns {Object} { score: number, reason: string, urgencyLevel: string }
 */
export function calculatePriority(project, userRole, userId) {
  let score = 0;
  let reasons = [];

  // Base priority factors
  const now = new Date();
  const dueDate = project.dueDate ? new Date(project.dueDate) : null;
  const daysUntilDue = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null;

  // ========================================
  // CRITICAL URGENCY (1000+ points)
  // ========================================

  // Overdue deadline
  if (daysUntilDue !== null && daysUntilDue < 0) {
    score += 2000;
    reasons.push('締切を過ぎています！');
  }

  // Deadline within 3 days
  if (daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3) {
    score += 1500;
    reasons.push(`締切まであと${daysUntilDue}日`);
  }

  // Escrow deposited, waiting to start work (contractor side)
  if (userRole === 'contractor' && project.status === 'workReady') {
    score += 1800;
    reasons.push('入金済み・作業開始待ち');
  }

  // Waiting for client acceptance (contractor side)
  if (userRole === 'contractor' && project.status === 'pendingAcceptance') {
    score += 1600;
    reasons.push('検収待ち（支払い保留中）');
  }

  // ========================================
  // HIGH URGENCY (500-999 points)
  // ========================================

  // Deadline within 7 days
  if (daysUntilDue !== null && daysUntilDue > 3 && daysUntilDue <= 7) {
    score += 800;
    reasons.push(`締切まで${daysUntilDue}日`);
  }

  // Proposal received (client side)
  if (userRole === 'client' && project.status === 'openForProposals' && project.proposals?.length > 0) {
    score += 700;
    reasons.push(`${project.proposals.length}件の提案あり`);
  }

  // Active work in progress
  if (project.status === 'inProgress') {
    score += 600;
    reasons.push('作業進行中');
  }

  // Message response required
  if (project.unreadMessages > 0) {
    score += 500 + (project.unreadMessages * 50);
    reasons.push(`未読メッセージ${project.unreadMessages}件`);
  }

  // Agreement pending (both sides)
  if (project.status === 'agreementPending') {
    score += 900;
    reasons.push('契約内容の確認待ち');
  }

  // ========================================
  // MEDIUM URGENCY (100-499 points)
  // ========================================

  // Deadline within 14 days
  if (daysUntilDue !== null && daysUntilDue > 7 && daysUntilDue <= 14) {
    score += 400;
    reasons.push(`締切まで${daysUntilDue}日`);
  }

  // Budget consideration
  if (project.budget >= 100000) {
    score += 300;
    reasons.push('高額案件');
  } else if (project.budget >= 50000) {
    score += 150;
  }

  // M-Score consideration (contract clarity, fairness)
  if (project.mScore !== undefined) {
    if (project.mScore < 40) {
      score += 250;
      reasons.push('契約内容の明確化が必要');
    } else if (project.mScore >= 80) {
      score += 100;
      reasons.push('信頼性の高い案件');
    }
  }

  // S-Score consideration (survival risk, payment reliability)
  if (project.sScore !== undefined) {
    if (project.sScore < 40) {
      score -= 200;
      reasons.push('リスク高：支払い遅延の可能性');
    } else if (project.sScore >= 80) {
      score += 100;
      reasons.push('安定した案件');
    }
  }

  // ========================================
  // LOW URGENCY (< 100 points)
  // ========================================

  // New project posted (for contractor browsing)
  if (userRole === 'contractor' && project.status === 'openForProposals') {
    const hoursSincePosted = project.postedAt
      ? (now - new Date(project.postedAt)) / (1000 * 60 * 60)
      : 999;

    if (hoursSincePosted < 24) {
      score += 80;
      reasons.push('新着案件');
    }
  }

  // Completed projects (archive priority)
  if (project.status === 'completed') {
    score += 10;
  }

  // Determine urgency level
  let urgencyLevel = 'low';
  if (score >= 1000) {
    urgencyLevel = 'critical';
  } else if (score >= 500) {
    urgencyLevel = 'high';
  } else if (score >= 100) {
    urgencyLevel = 'medium';
  }

  return {
    score,
    reason: reasons.join(' / '),
    urgencyLevel,
    reasons: reasons, // Array for detailed display
  };
}

/**
 * Get today's top priority task for a user
 *
 * @param {Array} projects - All projects/tasks
 * @param {string} userRole - 'client' or 'contractor'
 * @param {string} userId - Current user ID
 * @returns {Object|null} Top priority project with priority metadata
 */
export function getTodaysPriorityTask(projects, userRole, userId) {
  if (!projects || projects.length === 0) {
    return null;
  }

  // Filter out completed projects unless they need evaluation
  const activeProjects = projects.filter(p => {
    if (p.status === 'completed' && p.needsEvaluation) return true;
    if (p.status === 'completed') return false;
    return true;
  });

  // Calculate priority for each project
  const projectsWithPriority = activeProjects.map(project => ({
    ...project,
    priority: calculatePriority(project, userRole, userId),
  }));

  // Sort by priority score (descending)
  projectsWithPriority.sort((a, b) => b.priority.score - a.priority.score);

  // Return the top priority task
  return projectsWithPriority.length > 0 ? projectsWithPriority[0] : null;
}

/**
 * Get all tasks sorted by priority
 *
 * @param {Array} projects - All projects/tasks
 * @param {string} userRole - 'client' or 'contractor'
 * @param {string} userId - Current user ID
 * @returns {Array} All projects sorted by priority
 */
export function getAllTasksByPriority(projects, userRole, userId) {
  if (!projects || projects.length === 0) {
    return [];
  }

  // Calculate priority for each project
  const projectsWithPriority = projects.map(project => ({
    ...project,
    priority: calculatePriority(project, userRole, userId),
  }));

  // Sort by priority score (descending)
  projectsWithPriority.sort((a, b) => b.priority.score - a.priority.score);

  return projectsWithPriority;
}

/**
 * Get urgency color for UI display
 *
 * @param {string} urgencyLevel - 'critical', 'high', 'medium', 'low'
 * @returns {string} Tailwind color class
 */
export function getUrgencyColor(urgencyLevel) {
  switch (urgencyLevel) {
    case 'critical':
      return 'bg-red-100 border-red-500 text-red-800';
    case 'high':
      return 'bg-orange-100 border-orange-500 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    case 'low':
    default:
      return 'bg-blue-100 border-blue-500 text-blue-800';
  }
}

/**
 * Get urgency emoji for UI display
 *
 * @param {string} urgencyLevel - 'critical', 'high', 'medium', 'low'
 * @returns {string} Emoji
 */
export function getUrgencyEmoji(urgencyLevel) {
  switch (urgencyLevel) {
    case 'critical':
      return '🚨';
    case 'high':
      return '⚠️';
    case 'medium':
      return '📌';
    case 'low':
    default:
      return '📋';
  }
}
