import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, onSubmit, project, reviewerRole, t }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categories, setCategories] = useState({
    communication: 0,
    quality: 0,
    timeliness: 0,
  });
  const [comment, setComment] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen || !project) return null;

  const reviewTarget = reviewerRole === 'client' ? project.contractorName : project.clientName;

  const categoryLabels = {
    communication: 'コミュニケーション',
    quality: '品質',
    timeliness: '納期遵守',
  };

  const handleCategoryChange = (category, value) => {
    setCategories(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmitClick = () => {
    if (rating === 0) {
      alert('総合評価を選択してください');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    onSubmit({
      rating,
      categories,
      comment,
    });
    setShowConfirm(false);
    handleClose();
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setCategories({ communication: 0, quality: 0, timeliness: 0 });
    setComment('');
    setShowConfirm(false);
    onClose();
  };

  const renderStars = (value, onChange, size = 24) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => size === 32 && setHoverRating(star)}
            onMouseLeave={() => size === 32 && setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={size}
              className={`${
                star <= (size === 32 ? (hoverRating || rating) : value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">評価を投稿</h3>
              <p className="text-sm text-gray-600 mt-1">
                {reviewTarget} さんへの評価
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Project Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-1">{project.name}</h4>
                <p className="text-sm text-gray-600">
                  総額: {project.totalAmount.toLocaleString('ja-JP')} pt
                </p>
              </div>

              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  総合評価 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  {renderStars(rating, setRating, 32)}
                  {rating > 0 && (
                    <span className="text-lg font-semibold text-gray-700">
                      {rating}.0
                    </span>
                  )}
                </div>
              </div>

              {/* Category Ratings */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  項目別評価
                </label>
                <div className="space-y-3">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 w-32">{label}</span>
                      {renderStars(categories[key], (value) => handleCategoryChange(key, value), 20)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  コメント
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="具体的なフィードバックをお願いします（任意）"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {comment.length}/500文字
                </p>
              </div>

              {/* Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  ⚠️ 評価は投稿後に編集・削除できません。慎重にご記入ください。
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmitClick}
              disabled={rating === 0}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                rating === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              評価を投稿
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              評価を投稿しますか？
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              この操作は取り消せません。評価は公開され、{reviewTarget} さんに通知されます。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                投稿する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
