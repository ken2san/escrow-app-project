import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ダミーカード生成関数
const getDummyCards = () => [
  { id: 'd1', title: '要件ヒアリング', description: 'クライアントと要件を確認', status: 'open' },
  { id: 'd2', title: '設計・準備', description: '仕様・設計・準備作業', status: 'open' },
  { id: 'd3', title: '実装', description: 'コーディング・テスト', status: 'open' },
];

// シンプルなテキスト→プロジェクトJSON変換（ルールベース例）
function simpleTextToProjectJson(input) {
  // 例: 「◯◯を作りたい。要件は◯◯、◯◯、◯◯」→タイトル・説明・カード配列
  const lines = input.split(/\n|。/).map(l => l.trim()).filter(Boolean);
  const title = lines[0] || 'Untitled Project';
  const description = lines.slice(1).join(' ');
  // 2行目以降の「要件」や「作業」などをカード化（単純分割）
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

  // 画面遷移時にstateからタイトル・説明を受け取る
  useEffect(() => {
    if (location.state && (location.state.projectTitle || location.state.projectDesc)) {
      if (location.state.projectTitle) setProjectTitle(location.state.projectTitle);
      if (location.state.projectDesc) setProjectDesc(location.state.projectDesc);
    }
  }, [location.state]);

  // プロジェクト説明→プロジェクト自動生成
  const generateProjectFromDesc = () => {
    if (!projectDesc) return alert('プロジェクト説明を入力してください');
    const { title, /* description, */ cards } = simpleTextToProjectJson(projectDesc);
    setProjectTitle(title);
    // setProjectDesc(description); // 説明は上書きしない
    setCards(cards);
  };

  // プロジェクト登録（モック: ログ出力のみ）
  const registerProject = () => {
    if (!projectTitle) return alert('プロジェクト名を入力してください');
    if (cards.length === 0) return alert('最低1つの仕事カードを追加してください');
    // 本来はAPI送信等
    console.log({ projectTitle, projectDesc, cards });
    alert('プロジェクト登録（モック）: コンソールを確認');
  };

  // 案件ボード（モック）へ遷移
  const goToBoard = () => {
    if (!projectTitle || cards.length === 0) {
      alert('プロジェクト名と仕事カードが必要です');
      return;
    }
    navigate('/contract-board-mock', {
      state: {
        projectTitle,
        projectDesc,
        cards
      }
    });
  };

  // カード追加
  const addCard = () => {
    if (!cardTitle) return;
    setCards([
      ...cards,
      { id: String(Date.now()), title: cardTitle, description: cardDesc, status: 'open' },
    ]);
    setCardTitle('');
    setCardDesc('');
  };

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <h2>新規案件登録（プロフェッショナルUI）</h2>
      <div style={{ marginBottom: 16 }}>
        <label>
          プロジェクト名：<br />
          <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>
          プロジェクト説明：<br />
          <textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} style={{ width: '100%' }} placeholder={"例: 新しいWebアプリを作りたい。要件はUI設計、API開発、テスト。"} />
        </label>
        <button onClick={generateProjectFromDesc} style={{ marginTop: 8, marginLeft: 0, background: '#e0e7ff', color: '#3730a3', border: 'none', padding: '6px 14px', borderRadius: 4, fontWeight: 'bold' }}>
          プロジェクト自動生成
        </button>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>説明を編集→何度でも自動生成を試せます</div>
      </div>
      <div style={{ marginBottom: 16, border: '1px solid #eee', padding: 12 }}>
        <h4>仕事カード追加</h4>
        <input
          placeholder="カードタイトル"
          value={cardTitle}
          onChange={e => setCardTitle(e.target.value)}
          style={{ width: '40%', marginRight: 8 }}
        />
        <input
          placeholder="カード説明"
          value={cardDesc}
          onChange={e => setCardDesc(e.target.value)}
          style={{ width: '40%', marginRight: 8 }}
        />
        <button onClick={addCard}>追加</button>
        <ul style={{ marginTop: 12 }}>
          {cards.map(card => (
            <li key={card.id} style={{ border: '1px solid #ccc', margin: 4, padding: 4 }}>
              <strong>{card.title}</strong> - {card.description}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={registerProject} style={{ marginTop: 24, fontWeight: 'bold', marginRight: 16 }}>
        プロジェクト登録
      </button>
      <button onClick={goToBoard} style={{ marginTop: 24, fontWeight: 'bold', background: '#e0e7ff', color: '#3730a3', border: 'none', padding: '8px 16px', borderRadius: 4 }}>
        案件ボードで確認する
      </button>
    </div>
  );
}
