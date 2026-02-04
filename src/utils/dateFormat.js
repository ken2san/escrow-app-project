// 共通日付フォーマット関数
export function formatDateForDisplay(isoString) {
  if (!isoString) return '未設定';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  } catch {
    return isoString;
  }
}