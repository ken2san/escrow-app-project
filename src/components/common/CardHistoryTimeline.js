import React from "react";
import { User } from 'lucide-react';

/**
 * CardHistoryTimeline - タスク/カードのアクション履歴をタイムライン形式で表示
 * @param {Object[]} history - [{ type, text, date, userName, userIcon }]
 * @param {boolean} [compact] - trueでコンパクト表示
 */
export default function CardHistoryTimeline({ history = [], compact = false }) {
  if (!history.length) return <div className="text-slate-400 text-sm">履歴はありません</div>;
  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {history.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-lg">
            {item.userIcon || <User size={16} className="text-slate-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 text-sm">{item.userName || "ユーザー"}</span>
              <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
            </div>
            <div className="text-slate-600 text-sm mt-0.5">
              {item.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}
