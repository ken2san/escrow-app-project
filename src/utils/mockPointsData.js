// mockPointsData.js
// Dummy points balance and transaction history data

export const mockUserPoints = {
  userId: 'user_001',
  points: 1200,
};

export const mockTransactions = [
  {
    id: 'tx_001',
    type: 'purchase',
    amount: 1000,
    date: '2025-08-01',
    txHash: '0xabc123...',
    blockNumber: 123456,
    description: 'ポイント購入',
  },
  {
    id: 'tx_002',
    type: 'payment',
    amount: -500,
    date: '2025-08-05',
    txHash: '0xdef456...',
    blockNumber: 123789,
    description: 'プロジェクト支払い',
  },
];
