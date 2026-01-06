/**
 * Tests for Priority Logic
 */

import {
  calculatePriority,
  getTodaysPriorityTask,
  getAllTasksByPriority,
  getUrgencyColor,
  getUrgencyEmoji,
} from '../priorityLogic';

describe('calculatePriority', () => {
  const baseProject = {
    id: '1',
    title: 'Test Project',
    status: 'inProgress',
    budget: 50000,
  };

  test('overdue project gets highest priority', () => {
    const project = {
      ...baseProject,
      dueDate: '2026-01-01', // Past date
    };
    
    const result = calculatePriority(project, 'contractor', 'user1');
    
    expect(result.score).toBeGreaterThan(1500);
    expect(result.urgencyLevel).toBe('critical');
    expect(result.reason).toContain('締切を過ぎています');
  });

  test('deadline within 3 days gets critical priority', () => {
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 2);
    
    const project = {
      ...baseProject,
      dueDate: threeDaysLater.toISOString(),
    };
    
    const result = calculatePriority(project, 'contractor', 'user1');
    
    expect(result.score).toBeGreaterThan(1000);
    expect(result.urgencyLevel).toBe('critical');
  });

  test('work ready status for contractor gets high priority', () => {
    const project = {
      ...baseProject,
      status: 'workReady',
    };
    
    const result = calculatePriority(project, 'contractor', 'user1');
    
    expect(result.score).toBeGreaterThan(1500);
    expect(result.reason).toContain('入金済み・作業開始待ち');
  });

  test('unread messages increase priority', () => {
    const projectWithoutMessages = { ...baseProject };
    const projectWithMessages = {
      ...baseProject,
      unreadMessages: 3,
    };
    
    const resultWithout = calculatePriority(projectWithoutMessages, 'client', 'user1');
    const resultWith = calculatePriority(projectWithMessages, 'client', 'user1');
    
    expect(resultWith.score).toBeGreaterThan(resultWithout.score);
    expect(resultWith.reason).toContain('未読メッセージ3件');
  });

  test('low M-Score indicates contract needs clarification', () => {
    const project = {
      ...baseProject,
      mScore: 30,
    };
    
    const result = calculatePriority(project, 'client', 'user1');
    
    expect(result.reason).toContain('契約内容の明確化が必要');
  });

  test('low S-Score reduces priority due to risk', () => {
    const highRiskProject = {
      ...baseProject,
      sScore: 30,
    };
    const lowRiskProject = {
      ...baseProject,
      sScore: 85,
    };
    
    const highRiskResult = calculatePriority(highRiskProject, 'contractor', 'user1');
    const lowRiskResult = calculatePriority(lowRiskProject, 'contractor', 'user1');
    
    expect(lowRiskResult.score).toBeGreaterThan(highRiskResult.score);
    expect(highRiskResult.reason).toContain('リスク高');
  });

  test('high budget projects get bonus priority', () => {
    const lowBudget = { ...baseProject, budget: 30000 };
    const highBudget = { ...baseProject, budget: 150000 };
    
    const lowResult = calculatePriority(lowBudget, 'contractor', 'user1');
    const highResult = calculatePriority(highBudget, 'contractor', 'user1');
    
    expect(highResult.score).toBeGreaterThan(lowResult.score);
  });
});

describe('getTodaysPriorityTask', () => {
  test('returns highest priority project', () => {
    const projects = [
      {
        id: '1',
        title: 'Low Priority',
        status: 'inProgress',
        budget: 10000,
      },
      {
        id: '2',
        title: 'High Priority',
        status: 'workReady',
        budget: 100000,
      },
      {
        id: '3',
        title: 'Medium Priority',
        status: 'inProgress',
        budget: 50000,
        unreadMessages: 2,
      },
    ];
    
    const result = getTodaysPriorityTask(projects, 'contractor', 'user1');
    
    expect(result).not.toBeNull();
    expect(result.id).toBe('2'); // workReady status
  });

  test('filters out completed projects without evaluation', () => {
    const projects = [
      {
        id: '1',
        title: 'Completed',
        status: 'completed',
        budget: 100000,
      },
      {
        id: '2',
        title: 'Active',
        status: 'inProgress',
        budget: 50000,
      },
    ];
    
    const result = getTodaysPriorityTask(projects, 'contractor', 'user1');
    
    expect(result.id).toBe('2');
  });

  test('includes completed projects that need evaluation', () => {
    const projects = [
      {
        id: '1',
        title: 'Needs Review',
        status: 'completed',
        needsEvaluation: true,
        budget: 100000,
      },
    ];
    
    const result = getTodaysPriorityTask(projects, 'client', 'user1');
    
    expect(result).not.toBeNull();
    expect(result.id).toBe('1');
  });

  test('returns null for empty project list', () => {
    const result = getTodaysPriorityTask([], 'contractor', 'user1');
    expect(result).toBeNull();
  });
});

describe('getAllTasksByPriority', () => {
  test('returns all projects sorted by priority', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const projects = [
      {
        id: '1',
        title: 'Low',
        status: 'inProgress',
        budget: 10000,
        dueDate: nextWeek.toISOString(),
      },
      {
        id: '2',
        title: 'High',
        status: 'inProgress',
        budget: 10000,
        dueDate: tomorrow.toISOString(),
      },
      {
        id: '3',
        title: 'Medium',
        status: 'inProgress',
        budget: 100000,
        dueDate: nextWeek.toISOString(),
      },
    ];
    
    const result = getAllTasksByPriority(projects, 'contractor', 'user1');
    
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('2'); // Due tomorrow (highest)
    expect(result[2].id).toBe('1'); // Due next week, low budget (lowest)
  });
});

describe('getUrgencyColor', () => {
  test('returns correct color for each urgency level', () => {
    expect(getUrgencyColor('critical')).toContain('red');
    expect(getUrgencyColor('high')).toContain('orange');
    expect(getUrgencyColor('medium')).toContain('yellow');
    expect(getUrgencyColor('low')).toContain('blue');
  });
});

describe('getUrgencyEmoji', () => {
  test('returns correct emoji for each urgency level', () => {
    expect(getUrgencyEmoji('critical')).toBe('🚨');
    expect(getUrgencyEmoji('high')).toBe('⚠️');
    expect(getUrgencyEmoji('medium')).toBe('📌');
    expect(getUrgencyEmoji('low')).toBe('📋');
  });
});
