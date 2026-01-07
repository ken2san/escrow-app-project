/**
 * M-Score and S-Score Calculation Engine
 *
 * Philosophy: Quantify "peace of mind" through objective metrics.
 * These scores help users make informed decisions about work relationships.
 *
 * M-Score (Moral Score): Fairness, transparency, cooperation
 * S-Score (Survival Score): Financial reliability, risk management
 */

/**
 * Calculate M-Score (Moral Score) for a project
 * Measures contract clarity, communication quality, and cooperation
 *
 * @param {Object} project - Project data with contract details
 * @returns {Object} { score: number (0-100), details: Object, warnings: Array }
 */
export function calculateMScore(project) {
  let score = 0;
  const details = {};
  const warnings = [];

  // ========================================
  // 1. CONTRACT CLARITY (0-40 points)
  // ========================================
  let contractScore = 0;

  // Deliverables detailed (0-15 points)
  if (project.deliverableDetails) {
    const length = project.deliverableDetails.length;
    if (length > 200) {
      contractScore += 15;
    } else if (length > 100) {
      contractScore += 10;
    } else if (length > 50) {
      contractScore += 5;
    } else {
      warnings.push('納品物の詳細が不十分です');
    }
  } else {
    warnings.push('納品物の詳細が未記入です');
  }

  // Acceptance criteria detailed (0-15 points)
  if (project.acceptanceCriteriaDetails) {
    const length = project.acceptanceCriteriaDetails.length;
    if (length > 150) {
      contractScore += 15;
    } else if (length > 75) {
      contractScore += 10;
    } else if (length > 30) {
      contractScore += 5;
    } else {
      warnings.push('受入基準の詳細が不十分です');
    }
  } else {
    warnings.push('受入基準の詳細が未記入です');
  }

  // Scope of work defined (0-10 points)
  const hasScopeIncluded = project.scopeOfWork_included && project.scopeOfWork_included.length > 30;
  const hasScopeExcluded = project.scopeOfWork_excluded && project.scopeOfWork_excluded.length > 20;

  if (hasScopeIncluded && hasScopeExcluded) {
    contractScore += 10;
  } else if (hasScopeIncluded) {
    contractScore += 5;
    warnings.push('作業範囲の除外項目が未定義です');
  } else {
    warnings.push('作業範囲が不明確です');
  }

  details.contractClarity = contractScore;
  score += contractScore;

  // ========================================
  // 2. MILESTONE DEFINITION (0-20 points)
  // ========================================
  let milestoneScore = 0;

  if (project.milestones && project.milestones.length > 0) {
    // Has milestones
    milestoneScore += 10;

    // Milestones are detailed
    const detailedMilestones = project.milestones.filter(m =>
      m.description && m.description.length > 30
    );
    if (detailedMilestones.length === project.milestones.length) {
      milestoneScore += 10;
    } else if (detailedMilestones.length > 0) {
      milestoneScore += 5;
      warnings.push('一部のマイルストーンの説明が不十分です');
    }
  } else {
    warnings.push('マイルストーンが未設定です');
  }

  details.milestoneDefinition = milestoneScore;
  score += milestoneScore;

  // ========================================
  // 3. COMMUNICATION QUALITY (0-20 points)
  // ========================================
  let communicationScore = 0;

  // Response time (dummy for now - would be calculated from actual messages)
  if (project.averageResponseTime !== undefined) {
    if (project.averageResponseTime < 24) {
      communicationScore += 10;
    } else if (project.averageResponseTime < 48) {
      communicationScore += 5;
    }
  } else {
    // Default: give 5 points if no data
    communicationScore += 5;
  }

  // Communication log exists
  if (project.communicationLogCount > 0) {
    communicationScore += 5;
  }

  // No dispute history
  if (!project.hasDispute) {
    communicationScore += 5;
  } else {
    warnings.push('過去に協議案件があります');
  }

  details.communicationQuality = communicationScore;
  score += communicationScore;

  // ========================================
  // 4. TRANSPARENCY (0-20 points)
  // ========================================
  let transparencyScore = 0;

  // Agreement document link provided
  if (project.agreementDocLink) {
    transparencyScore += 5;
  }

  // Change order process defined
  if (project.additionalWorkTerms && project.additionalWorkTerms.length > 20) {
    transparencyScore += 5;
  }

  // Client/Contractor has good rating history
  if (project.clientRating && project.clientRating.averageScore >= 4.5) {
    transparencyScore += 5;
  } else if (project.clientRating && project.clientRating.averageScore < 3.5) {
    warnings.push('発注者の評価が低めです');
  }

  // Low reselling risk
  if (project.contractorResellingRisk !== undefined) {
    if (project.contractorResellingRisk < 20) {
      transparencyScore += 5;
    } else if (project.contractorResellingRisk > 50) {
      warnings.push('受注者の転売リスクが高めです');
    }
  }

  details.transparency = transparencyScore;
  score += transparencyScore;

  // ========================================
  // FINAL M-SCORE
  // ========================================

  return {
    score: Math.min(100, Math.max(0, score)),
    details,
    warnings,
    recommendations: generateMScoreRecommendations(score, warnings),
  };
}

/**
 * Calculate S-Score (Survival Score) for a project
 * Measures financial reliability, payment risk, and profitability
 *
 * @param {Object} project - Project data with financial details
 * @returns {Object} { score: number (0-100), details: Object, warnings: Array }
 */
export function calculateSScore(project) {
  let score = 0;
  const details = {};
  const warnings = [];

  // ========================================
  // 1. ESCROW STATUS (0-40 points)
  // ========================================
  let escrowScore = 0;

  if (project.fundsDeposited >= project.totalAmount) {
    escrowScore = 40;
  } else if (project.fundsDeposited > 0) {
    escrowScore = 20;
    warnings.push('一部のみ入金済みです');
  } else {
    warnings.push('エスクローに未入金です（リスク高）');
  }

  details.escrowStatus = escrowScore;
  score += escrowScore;

  // ========================================
  // 2. CLIENT PAYMENT HISTORY (0-30 points)
  // ========================================
  let paymentHistoryScore = 0;

  if (project.clientRating) {
    const { averageScore, totalReviews } = project.clientRating;

    // Rating quality
    if (averageScore >= 4.5) {
      paymentHistoryScore += 15;
    } else if (averageScore >= 4.0) {
      paymentHistoryScore += 10;
    } else if (averageScore >= 3.5) {
      paymentHistoryScore += 5;
    } else {
      warnings.push('発注者の評価が低いです');
    }

    // Number of reviews (credibility)
    if (totalReviews >= 10) {
      paymentHistoryScore += 15;
    } else if (totalReviews >= 5) {
      paymentHistoryScore += 10;
    } else if (totalReviews >= 2) {
      paymentHistoryScore += 5;
    } else {
      warnings.push('発注者の実績が少ないです');
    }
  } else {
    warnings.push('発注者の評価情報がありません');
  }

  details.clientPaymentHistory = paymentHistoryScore;
  score += paymentHistoryScore;

  // ========================================
  // 3. BUDGET ADEQUACY (0-20 points)
  // ========================================
  let budgetScore = 0;

  // This would ideally compare to market rates
  // For now, we'll use simple heuristics

  if (project.totalAmount > 0) {
    // Assume adequate budget if amount is reasonable
    // (In real app, compare against job type and complexity)
    budgetScore += 10;

    // Budget matches milestone breakdown
    if (project.milestones && project.milestones.length > 0) {
      const milestoneTotal = project.milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
      const difference = Math.abs(project.totalAmount - milestoneTotal);

      if (difference === 0) {
        budgetScore += 10;
      } else if (difference < project.totalAmount * 0.1) {
        budgetScore += 5;
      } else {
        warnings.push('予算とマイルストーン金額の合計が一致しません');
      }
    }
  }

  details.budgetAdequacy = budgetScore;
  score += budgetScore;

  // ========================================
  // 4. DEADLINE REALISM (0-10 points)
  // ========================================
  let deadlineScore = 0;

  if (project.dueDate) {
    const now = new Date();
    const due = new Date(project.dueDate);
    const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    // Reasonable timeline
    if (daysUntil >= 14) {
      deadlineScore += 10;
    } else if (daysUntil >= 7) {
      deadlineScore += 7;
    } else if (daysUntil >= 3) {
      deadlineScore += 4;
      warnings.push('納期が短めです');
    } else if (daysUntil >= 0) {
      warnings.push('納期が非常に短いです');
    }
  }

  details.deadlineRealism = deadlineScore;
  score += deadlineScore;

  // ========================================
  // FINAL S-SCORE
  // ========================================

  return {
    score: Math.min(100, Math.max(0, score)),
    details,
    warnings,
    recommendations: generateSScoreRecommendations(score, warnings),
  };
}

/**
 * Generate actionable recommendations based on M-Score
 */
function generateMScoreRecommendations(score, warnings) {
  const recommendations = [];

  if (score < 40) {
    recommendations.push('契約内容の大幅な改善が必要です。納品物・受入基準・作業範囲を詳細に定義してください。');
  } else if (score < 60) {
    recommendations.push('契約内容をより明確にすることで、トラブルのリスクを減らせます。');
  } else if (score < 80) {
    recommendations.push('良好な契約内容です。マイルストーンをさらに詳細化するとより安心です。');
  } else {
    recommendations.push('非常に明確な契約内容です。安心して進められます。');
  }

  return recommendations;
}

/**
 * Generate actionable recommendations based on S-Score
 */
function generateSScoreRecommendations(score, warnings) {
  const recommendations = [];

  if (score < 40) {
    recommendations.push('支払いリスクが高いです。エスクローへの入金完了まで作業開始を控えることを強くお勧めします。');
  } else if (score < 60) {
    recommendations.push('支払いリスクがあります。契約条件を慎重に確認してください。');
  } else if (score < 80) {
    recommendations.push('概ね安全な案件です。マイルストーンごとの支払い確認を徹底しましょう。');
  } else {
    recommendations.push('非常に安全な案件です。安心して取り組めます。');
  }

  return recommendations;
}

/**
 * Calculate both M-Score and S-Score together
 *
 * @param {Object} project - Project data
 * @returns {Object} { mScore: Object, sScore: Object }
 */
export function calculateScores(project) {
  return {
    mScore: calculateMScore(project),
    sScore: calculateSScore(project),
  };
}
