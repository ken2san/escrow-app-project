import React from "react";
import { useDroppable } from '@dnd-kit/core';

export default function EmptyDropzone({ id, className = "", style = {} }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={
                `drop-placeholder border-2 border-dashed border-indigo-300 bg-indigo-50 min-h-[48px] flex items-center justify-center rounded-lg transition-all duration-150 ${isOver ? 'ring-2 ring-indigo-400' : ''} ${className}`
            }
            style={style}
        >
            <span className="text-indigo-400 text-sm select-none">ここにカードをドロップ</span>
        </div>
    );
}
