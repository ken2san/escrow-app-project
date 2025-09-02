import groupUtil from '../groupCards';

describe('groupAndSortCards util', () => {
  it('groups by project and preserves cards', () => {
    const cards = [
      { id: 1, projectId: 'p1', startDate: '2025-09-01', duration: 1, reward: 10 },
      { id: 2, projectId: 'p2', startDate: '2025-09-02', duration: 2, reward: 20 },
    ];
    const projects = [{ id: 'p1' }, { id: 'p2' }];
    const viewSettings = { groupBy: 'project', sortBy: 'startDate' };
    const grouped = groupUtil(cards, viewSettings, projects);
    expect(Object.keys(grouped)).toEqual(['p1', 'p2']);
    expect(grouped['p1'].length).toBe(1);
    expect(grouped['p2'].length).toBe(1);
  });
});
