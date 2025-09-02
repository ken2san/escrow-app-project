import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Dummy card generation function
const getDummyCards = () => [
  { id: 'd1', title: '要件ヒアリング', description: 'クライアントと要件を確認', status: 'open' },
  { id: 'd2', title: '設計・準備', description: '仕様・設計・準備作業', status: 'open' },
  { id: 'd3', title: '実装', description: 'コーディング・テスト', status: 'open' },
];

// Simple text to project JSON conversion (rule-based example)
function simpleTextToProjectJson(input) {
  // Example: "I want to create XX. Requirements are XX, XX, XX" → title, description, card array
  const lines = input.split(/\n|。/).map(l => l.trim()).filter(Boolean);
  const title = lines[0] || 'Untitled Project';
  const description = lines.slice(1).join(' ');
  // Convert lines after the first into cards (simple split)
  const cards = lines.slice(1).map((l, i) => ({ id: `auto${i+1}`, title: l.slice(0, 16) || `Task ${i+1}`, description: l, status: 'open' }));
  return { title, description, cards: cards.length ? cards : getDummyCards() };
}

export default function NewContractProjectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [cards, setCards] = useState([]);
  const [cardTitle, setCardTitle] = useState('');
  const [cardDesc, setCardDesc] = useState('');

  // Receive title and description from state on page transition
  useEffect(() => {
    if (location.state && (location.state.projectTitle || location.state.projectDesc)) {
      if (location.state.projectTitle) setProjectTitle(location.state.projectTitle);
      if (location.state.projectDesc) setProjectDesc(location.state.projectDesc);
    }
  }, [location.state]);

  // Generate project automatically from project description
  const generateProjectFromDesc = () => {
    if (!projectDesc) return alert('プロジェクト説明を入力してください');
  const { title, /* description, */ cards: generatedCards } = simpleTextToProjectJson(projectDesc);
  setProjectTitle(title);
  // setProjectDesc(description); // Do not overwrite description
  // Use a fresh copy to avoid accidental shared references
  setCards(() => generatedCards.map(c => ({ ...c })));
  };

  // Register project (mock)
  const registerProject = () => {
    if (!projectTitle) return alert('プロジェクト名を入力してください');
    if (cards.length === 0) return alert('最低1つの仕事カードを追加してください');
  // Normally, send to API, etc.
    // TODO: integrate with API
    alert('プロジェクト登録（モック）: コンソールを確認');
  };

  // Navigate to project board (mock)
  const goToBoard = () => {
    if (!projectTitle || cards.length === 0) {
      alert('プロジェクト名と仕事カードが必要です');
      return;
    }
  navigate('/project-board', {
      state: {
        projectTitle,
        projectDesc,
        cards
      }
    });
  };

  // Add card
  const addCard = () => {
    if (!cardTitle) return;
    setCards(prev => [
      ...prev,
      { id: String(Date.now()), title: cardTitle, description: cardDesc, status: 'open' },
    ]);
    setCardTitle('');
    setCardDesc('');
  };

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">新規案件登録（プロフェッショナルUI）</h2>
      <div className="mb-4">
        <label className="block">
          <div className="text-sm mb-1">プロジェクト名：</div>
          <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
        </label>
      </div>
      <div className="mb-4">
        <label className="block">
          <div className="text-sm mb-1">プロジェクト説明：</div>
          <textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} className="w-full border rounded px-3 py-2" placeholder={"例: 新しいWebアプリを作りたい。要件はUI設計、API開発、テスト。"} />
        </label>
        <button onClick={generateProjectFromDesc} className="mt-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded font-semibold">
          プロジェクト自動生成
        </button>
        <div className="text-xs text-gray-500 mt-1">説明を編集→何度でも自動生成を試せます</div>
      </div>
      <div className="mb-4 border border-gray-200 p-3 rounded">
        <h4 className="font-medium mb-2">仕事カード追加</h4>
        <div className="flex gap-2 items-center mb-2">
          <input
            placeholder="カードタイトル"
            value={cardTitle}
            onChange={e => setCardTitle(e.target.value)}
            className="w-2/5 border rounded px-2 py-1"
          />
          <input
            placeholder="カード説明"
            value={cardDesc}
            onChange={e => setCardDesc(e.target.value)}
            className="w-2/5 border rounded px-2 py-1"
          />
          <button onClick={addCard} className="bg-gray-100 px-3 py-1 rounded">追加</button>
        </div>
        <ul className="mt-3 space-y-2">
          {cards.map(card => (
            <li key={card.id} className="border border-gray-200 p-2 rounded">
              <strong>{card.title}</strong> - {card.description}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center">
        <button onClick={registerProject} className="font-semibold mr-4 px-4 py-2 rounded border">プロジェクト登録</button>
        <button onClick={goToBoard} className="font-semibold px-4 py-2 rounded bg-indigo-100 text-indigo-800">案件ボードで確認する</button>
      </div>
    </div>
  );
}
