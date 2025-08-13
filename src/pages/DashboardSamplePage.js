




import React, { useState } from 'react';

import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';

// Trello風カンバンの初期データ
const initialColumns = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'card-1', title: 'Sample Project 1', desc: 'This is a sample project card for demonstration.' },
      { id: 'card-2', title: 'Sample Project 2', desc: 'Another example of a dashboard card.' },
    ],
  },
  {
    id: 'doing',
    title: 'Doing',
    cards: [
      { id: 'card-3', title: 'Sample Project 3', desc: 'You can add more sample cards as needed.' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [],
  },
];


let cardIdCounter = 4;
let columnIdCounter = 4;


export default function DashboardSamplePage() {

  const [columns, setColumns] = useState(initialColumns);
  const [addingCol, setAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [activeCard, setActiveCard] = useState(null); // ドラッグ中のカード
  const [activeColumnId, setActiveColumnId] = useState(null); // ドラッグ中のカラムID
  const sensors = useSensors(useSensor(PointerSensor));

  function findCard(cardId) {
    for (const col of columns) {
      const idx = col.cards.findIndex(card => card.id === cardId);
      if (idx !== -1) return { colId: col.id, idx, card: col.cards[idx] };
    }
    return null;
  }

  function handleDragStart(event) {
    const { active } = event;
    const found = findCard(active.id);
    setActiveCard(found ? found.card : null);
    // カラムのドラッグ開始
    if (typeof active.id === 'string' && columns.some(col => col.id === active.id)) {
      setActiveColumnId(active.id);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumnId(null);
    if (!over) return;
    if (active.id === over.id) return;

    // カラムの並び替え
    if (typeof active.id === 'string' && columns.some(col => col.id === active.id) && columns.some(col => col.id === over.id)) {
      const oldIndex = columns.findIndex(col => col.id === active.id);
      const newIndex = columns.findIndex(col => col.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setColumns(prevCols => {
          const newCols = [...prevCols];
          const [moved] = newCols.splice(oldIndex, 1);
          newCols.splice(newIndex, 0, moved);
          return newCols;
        });
        return;
      }
    }

    // 空リストのダミーにドロップされた場合
    if (typeof over.id === 'string' && over.id.startsWith('__empty__-')) {
      const from = findCard(active.id);
      if (!from) return;
      // over.idからカラムIDを抽出
      const toColId = over.id.replace('__empty__-', '');
      const toCol = columns.find(col => col.id === toColId);
      if (!toCol) return;
      setColumns(prevCols => {
        const cols = prevCols.map(col => ({ ...col, cards: [...col.cards] }));
        const fromCol = cols.find(col => col.id === from.colId);
        const toCol2 = cols.find(col => col.id === toCol.id);
        if (!fromCol || !toCol2) return cols;
        const [moved] = fromCol.cards.splice(from.idx, 1);
        toCol2.cards.push(moved);
        return cols;
      });
      return;
    }

    // カードの移動・並び替え
    const from = findCard(active.id);
    const to = findCard(over.id);
    if (!from || !to) return;

    // 同じ位置なら何もしない
    if (from.colId === to.colId && from.idx === to.idx) return;

    setColumns(prevCols => {
      const cols = prevCols.map(col => ({ ...col, cards: [...col.cards] }));
      const fromCol = cols.find(col => col.id === from.colId);
      const toCol = cols.find(col => col.id === to.colId);
      if (!fromCol || !toCol) return cols;
      const [moved] = fromCol.cards.splice(from.idx, 1);
      let insertIdx = to.idx;
      // 同じカラム内で下方向に移動する場合はto.idxを1つ減らす
      if (from.colId === to.colId && from.idx < to.idx) insertIdx--;
      toCol.cards.splice(insertIdx, 0, moved);
      return cols;
    });
  }

  function handleAddColumn() {
    if (!newColTitle.trim()) return;
    setColumns(cols => [
      ...cols,
      { id: `col${columnIdCounter++}`, title: newColTitle.trim(), cards: [] }
    ]);
    setNewColTitle('');
    setAddingCol(false);
  }

  function handleAddCard(colId, title, desc) {
    setColumns(cols => {
      const newCols = cols.map(col =>
        col.id === colId
          ? { ...col, cards: [...col.cards, { id: `card-${cardIdCounter++}`, title, desc }] }
          : col
      );
      console.log('handleAddCard', { colId, title, desc, newCols });
      return newCols;
    });
  }

  return (
    <div className="p-4" style={{ background: '#0079bf', minHeight: '100vh' }}>
  <h1 className="text-2xl font-bold mb-6 text-white drop-shadow">Kanban Board Sample</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map(col => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 24 }}>
            {columns.map(col => (
              <SortableKanbanColumn
                key={col.id}
                column={col}
                onAddCard={handleAddCard}
                isOverlay={false}
                isDragging={activeColumnId === col.id}
              >
                <KanbanColumn key={col.id} column={col} onAddCard={handleAddCard} />
              </SortableKanbanColumn>
            ))}
            <div style={{ minWidth: 280 }}>
              {addingCol ? (
                <div style={{ background: '#ebecf0', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <input
                    className="w-full border rounded px-2 py-1 mb-2"
                    placeholder="リスト名を入力"
                    value={newColTitle}
                    onChange={e => setNewColTitle(e.target.value)}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleAddColumn}>追加</button>
                    <button className="text-gray-500 px-2" onClick={() => setAddingCol(false)}>キャンセル</button>
                  </div>
                </div>
              ) : (
                <button
                  className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded shadow border border-gray-200"
                  onClick={() => setAddingCol(true)}
                >+ リストを追加</button>
              )}
            </div>
          </div>
        </SortableContext>
        <DragOverlay>
          {activeCard && (
            <div
              style={{
                background: 'white',
                borderRadius: 6,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                padding: 12,
                fontSize: 15,
                minWidth: 220,
                maxWidth: 320,
                pointerEvents: 'none',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: '#172b4d' }}>{activeCard.title}</div>
              {activeCard.desc && <div className="text-gray-600 text-xs mb-1">{activeCard.desc}</div>}
            </div>
          )}
          {activeColumnId && (
            <SortableKanbanColumn
              column={columns.find(col => col.id === activeColumnId)}
              onAddCard={handleAddCard}
              isOverlay={true}
              isDragging={false}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );

// カラム自体をSortableにする
function SortableKanbanColumn({ column, onAddCard, isOverlay, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id: column.id });
  let style = {
    background: isDragging || isOverlay ? '#d2e4f7' : '#ebecf0',
    borderRadius: 8,
    minWidth: 280,
    padding: 12,
    boxShadow: (isDragging || isOverlay)
      ? '0 8px 32px rgba(0,0,0,0.22)'
      : '0 1px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    maxHeight: 600,
    overflowY: 'auto',
    minHeight: 200,
    position: 'relative',
    transition: 'background 0.2s, box-shadow 0.2s, opacity 0.2s, transform 0.2s',
    transform: (isDragging || isOverlay)
      ? 'scale(1.04) rotate(-1deg)'
      : undefined,
    zIndex: isDragging || isOverlay ? 100 : 1,
    opacity: isDragging ? 0.3 : 1,
    pointerEvents: isOverlay ? 'none' : undefined,
  };
  if (!isOverlay && transform) {
    style = { ...style, transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.04) rotate(-1deg)` };
  }
  return (
    <div ref={setNodeRef} style={style}>
      {/* カラムタイトルだけドラッグ可能にする */}
      <div
        className="text-base font-bold mb-1 flex items-center cursor-grab select-none"
        style={{ color: '#172b4d', userSelect: 'none', marginBottom: 8 }}
        {...attributes}
        {...listeners}
      >
        {column.title}
      </div>
      <KanbanColumn key={column.id} column={column} onAddCard={onAddCard} hideTitle={true} />
    </div>
  );
}
}

function KanbanColumn({ column, onAddCard, hideTitle }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  // 空リスト用のダミーSortable
  const emptyId = `__empty__-${column.id}`;
  const emptySortable = useSortable({ id: emptyId });
  return (
    <div
      style={{
        background: '#ebecf0',
        borderRadius: 8,
        minWidth: 280,
        padding: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        maxHeight: 600,
        overflowY: 'auto',
        minHeight: 200,
        position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      {!hideTitle && (
        <h2 className="text-base font-bold mb-1" style={{ color: '#172b4d' }}>{column.title}</h2>
      )}
      {column.cards.length === 0 ? (
        <div
          ref={emptySortable.setNodeRef}
          {...emptySortable.attributes}
          {...emptySortable.listeners}
          style={{
            minHeight: 48,
            border: emptySortable.isOver ? '2px dashed #4f8ef7' : '2px dashed #ccc',
            borderRadius: 6,
            margin: '8px 0',
            background: emptySortable.isOver ? '#e3f0ff' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#aaa',
            fontSize: 14,
            ...(emptySortable.transform ? {
              transform: `translate3d(${emptySortable.transform.x}px, ${emptySortable.transform.y}px, 0)`
            } : {})
          }}
        >
          ここにカードをドロップ
        </div>
      ) : (
        column.cards.map(card => <KanbanCard key={card.id} card={card} />)
      )}

      {adding ? (
        <div style={{ background: '#fff', borderRadius: 6, padding: 8, marginTop: 4 }}>
          <input
            className="w-full border rounded px-2 py-1 mb-1"
            placeholder="タイトル"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="w-full border rounded px-2 py-1 mb-1"
            placeholder="説明 (任意)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={2}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => {
                if (title.trim()) {
                  onAddCard(column.id, title.trim(), desc.trim());
                  setTitle(''); setDesc(''); setAdding(false);
                }
              }}
            >追加</button>
            <button className="text-gray-500 px-2" onClick={() => setAdding(false)}>キャンセル</button>
          </div>
        </div>
      ) : (
        <button
          className="bg-white/80 hover:bg-white text-gray-700 px-2 py-1 rounded text-sm border border-gray-200"
          style={{ zIndex: 1, position: 'relative' }}
          onClick={() => setAdding(true)}
        >+ カードを追加</button>
      )}
    </div>
  );
}
function KanbanCard({ card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  if (!card) return null;
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        background: '#fff',
        borderRadius: 6,
        boxShadow: isDragging ? '0 4px 16px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.08)',
        padding: 12,
        margin: '4px 0',
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        cursor: 'grab',
        fontSize: 15,
      }}
    >
      <div className="font-semibold mb-1" style={{ color: '#172b4d' }}>{card.title}</div>
      {card.desc && <div className="text-gray-600 text-xs mb-1">{card.desc}</div>}
    </div>
  );
}
