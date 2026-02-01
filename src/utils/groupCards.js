// Utility to group and sort cards based on viewSettings and projects
export function groupAndSortCards(cards, viewSettings, projects) {
  const groups = {};
  const filteredCards = cards;

  function getDueDateCategory(dueDateStr) {
    if (!dueDateStr) return '期日未設定';
    const today = new Date(); today.setHours(0,0,0,0);
    const dueDate = new Date(dueDateStr);
    if (dueDate < today) return '期限切れ';
    if (dueDate.getTime() === today.getTime()) return '今日が期日';
    return '今後';
  }

  function getCardWithDueDate(card) {
    if (!card.startDate || !card.duration) return { ...card, dueDate: null };
    const date = new Date(card.startDate);
    if (isNaN(date.getTime())) return { ...card, dueDate: null };
    date.setDate(date.getDate() + Number(card.duration));
    if (isNaN(date.getTime())) return { ...card, dueDate: null };
    return { ...card, dueDate: date.toISOString().split('T')[0] };
  }

  if (viewSettings.groupBy === 'project') {
    projects.forEach((project) => {
      groups[project.id] = filteredCards.filter(card => String(card.projectId) === String(project.id));
    });
  } else if (viewSettings.groupBy === 'status') {
    const statusOrder = [
      { key: 'unsent', label: '未編集' },
      { key: 'edited', label: '編集済' },
      { key: 'awaiting_approval', label: '承認待ち' },
      { key: 'revision_needed', label: '要修正' },
      { key: 'approved', label: '承認済' },
    ];
    statusOrder.forEach(({ key }) => {
      groups[key] = filteredCards.filter(card => card.status === key);
    });
  } else if (viewSettings.groupBy === 'dueDate') {
    const dueDateCategories = ['期限切れ', '今日が期日', '今後', '期日未設定'];
    const tempGroups = { '期限切れ': [], '今日が期日': [], '今後': [], '期日未設定': [] };
    filteredCards.forEach(card => {
      const cardWithDue = getCardWithDueDate(card);
      const key = getDueDateCategory(cardWithDue.dueDate);
      tempGroups[key].push(cardWithDue);
    });
    dueDateCategories.forEach(cat => {
      groups[cat] = tempGroups[cat];
    });
  }

  // Sorting
  Object.keys(groups).forEach(key => {
    if (viewSettings.sortBy === 'startDate') {
      groups[key].sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate) - new Date(b.startDate);
      });
    } else if (viewSettings.sortBy === 'reward') {
      groups[key].sort((a, b) => b.reward - a.reward);
    }
    // Do not sort when sortBy === null (preserve original card order)
  });

  return groups;
}

export default groupAndSortCards;
