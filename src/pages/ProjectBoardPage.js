
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// シンプルな仕事カードの型
const initialCards = [
	{ id: '1', title: '要件定義', description: 'クライアントと要件を整理', status: 'open' },
	{ id: '2', title: 'デザイン作成', description: 'UI/UXデザイン案を作成', status: 'open' },
	{ id: '3', title: '実装', description: 'Reactでフロント実装', status: 'open' },
];

export default function ProjectBoardPage() {
	const location = useLocation();
	// location.state から受け取る
	const [cards, setCards] = useState(location.state?.cards || initialCards);
	const [projectTitle, setProjectTitle] = useState(location.state?.projectTitle || '新規Webアプリ開発');
	const [projectDesc, setProjectDesc] = useState(location.state?.projectDesc || '');

	// location.stateが変わった場合も反映
	useEffect(() => {
		if (location.state) {
			if (location.state.cards) setCards(location.state.cards);
			if (location.state.projectTitle) setProjectTitle(location.state.projectTitle);
			if (location.state.projectDesc) setProjectDesc(location.state.projectDesc);
		}
	}, [location.state]);

	// カード追加
	const addCard = () => {
		const title = prompt('カードタイトル');
		if (!title) return;
		setCards([
			...cards,
			{ id: String(Date.now()), title, description: '', status: 'open' },
		]);
	};

	// プロジェクトとしてグループ化（モック: カード一覧をまとめて表示）
	return (
		<div style={{ padding: 32 }}>
			<h2>プロジェクト: {projectTitle}</h2>
			{projectDesc && <div style={{ marginBottom: 16, color: '#555' }}>{projectDesc}</div>}
			<button onClick={addCard}>カード追加</button>
			<div style={{ marginTop: 24 }}>
				<h3>仕事カード一覧</h3>
				<ul>
					{cards.map(card => (
						<li key={card.id} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
							<strong>{card.title}</strong>
							<div>{card.description}</div>
							<div>状態: {card.status}</div>
						</li>
					))}
				</ul>
			</div>
			<div style={{ marginTop: 32, background: '#f9f9f9', padding: 16 }}>
				<h4>このプロジェクトのカード数: {cards.length}</h4>
				<div>（今後：カードをグループ化→プロジェクト単位で依頼・進行管理）</div>
			</div>
		</div>
	);
}
