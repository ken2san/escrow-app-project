import { useDroppable } from '@dnd-kit/core';

export default function CardDropZone({ colId, idx }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${colId}:${idx}` });
  return (
    <div
      ref={setNodeRef}
      style={{
        height: 8,
        margin: '2px 0',
        background: isOver ? '#aee' : 'transparent',
        borderRadius: 4,
        transition: 'background 0.2s',
      }}
    />
  );
}
