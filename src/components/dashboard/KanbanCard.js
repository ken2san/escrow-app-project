import React from 'react';
import { useSortable } from '@dnd-kit/sortable';

export default function KanbanCard({ card }) {
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
        padding: 8,
        margin: '4px 0',
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        cursor: 'grab',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{card.title || card.name}</div>
      {card.desc && <div style={{ fontSize: 12, color: '#666' }}>{card.desc}</div>}
    </div>
  );
}
