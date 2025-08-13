import React from 'react';
import { Sparkles, Loader2, ShieldCheck, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NewProjectPage = ({
  newProjectData,
  setNewProjectData,
  t,
  currentLanguage,
  isLoadingGemini,
  milestoneSuggestions,
  contractCheckSuggestions,
  onGenerateMilestones,
  onContractCheck,
  onSubmitProject,
  onCancelProject
}) => {
  const navigate = useNavigate();

  const handleInputChange = (e, index, field) => {
    const { name, value, type, checked } = e.target;
    if (field === 'milestones') {
      setNewProjectData((prevData) => {
        const updatedMilestones = prevData.milestones.map((ms, i) =>
          i === index ? { ...ms, [name]: value } : ms
        );
        return { ...prevData, milestones: updatedMilestones };
      });
    } else if (type === 'checkbox') {
      setNewProjectData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setNewProjectData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };


  // 必須項目チェック
  const isRequiredFieldsFilled = () => {
    return newProjectData.title && newProjectData.description;
  };

  // マイルストーン案生成→仕事カード自動生成デモへ遷移
  const handleGenerateMilestonesAndGo = async (e) => {
    // ブラウザのバリデーションを発火
    const form = e?.target?.form;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    await onGenerateMilestones();
    // 案件タイトル・詳細説明をstateで渡して遷移
    navigate('/new-contract-project', {
      state: {
        projectTitle: newProjectData.title,
        projectDesc: newProjectData.description
      }
    });
  };


  const localHandleSubmit = (e) => {
    e.preventDefault();
    if (!isRequiredFieldsFilled()) {
      alert('案件タイトルと詳細説明は必須です');
      return;
    }
    onSubmitProject(newProjectData);
  };

  const handleApplySuggestion = (suggestion) => {
    const parts = suggestion.split(':');
    if (parts.length < 2) return;
    const fieldLabelFromSuggestion = parts[0].trim();
    const suggestionText = parts.slice(1).join(':').trim();
    const fieldMap = {
  [t('deliverableDetailsLabel')]: 'deliverableDetails',
  [t('acceptanceCriteriaDetailsLabel')]: 'acceptanceCriteriaDetails',
  [t('scopeOfWorkIncludedLabel')]: 'scopeOfWork_included',
  [t('scopeOfWorkExcludedLabel')]: 'scopeOfWork_excluded',
    };
    const fieldKey = fieldMap[fieldLabelFromSuggestion];
    if (fieldKey) {
      setNewProjectData((prev) => ({ ...prev, [fieldKey]: prev[fieldKey] ? `${prev[fieldKey]}\n${suggestionText}` : suggestionText }));
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
  {t('newProjectRegistration')}
      </h2>
      {/* フロー用ナビゲーションリンク */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <Link to="/new-contract-project" className="text-blue-600 underline hover:text-blue-800">仕事カード自動生成デモへ</Link>
  <Link to="/contract-board-mock" className="text-blue-600 underline hover:text-blue-800">案件ボードで確認する</Link>
      </div>
      <form onSubmit={localHandleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('projectTitle')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={newProjectData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t('projectTitlePlaceholder')}
            required
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('projectCategory')}
          </label>
          <input
            type="text"
            name="category"
            id="category"
            value={newProjectData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t('projectCategoryPlaceholder')}
          />
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-6">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('detailedDescription')} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              id="description"
              value={newProjectData.description}
              onChange={handleInputChange}
              rows="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('detailedDescriptionPlaceholder')}
              required
            ></textarea>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={handleGenerateMilestonesAndGo}
              disabled={isLoadingGemini}
              className="w-full sm:w-auto flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
              formNoValidate={false}
            >
              <Sparkles size={16} className="mr-2" />
              {isLoadingGemini &&
              !milestoneSuggestions &&
              !contractCheckSuggestions ? (
                <Loader2 className="animate-spin h-4 w-4 mr-1" />
              ) : null}
              {t('generateMilestoneSuggestions')}
            </button>
            <button
              type="button"
              onClick={e => {
                const form = e.target.form;
                if (form && !form.checkValidity()) {
                  form.reportValidity();
                  return;
                }
                onContractCheck();
              }}
              disabled={isLoadingGemini}
              className="w-full sm:w-auto flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
              formNoValidate={false}
            >
              <ShieldCheck size={16} className="mr-2" />
              {isLoadingGemini &&
              !contractCheckSuggestions &&
              !milestoneSuggestions ? (
                <Loader2 className="animate-spin h-4 w-4 mr-1" />
              ) : null}
              {t('aiContractCheck')}
            </button>
          </div>
          {isLoadingGemini &&
            !milestoneSuggestions &&
            !contractCheckSuggestions && (
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                {currentLanguage === 'ja'
                  ? 'AIが処理中です...'
                  : 'AI is processing...'}
              </div>
            )}
          {milestoneSuggestions && (
            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
              <h4 className="text-md font-semibold text-teal-700 mb-2 flex items-center">
                <Sparkles size={16} className="mr-2 text-teal-500" />{' '}
                {t('aiMilestoneSuggestions')}
              </h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {milestoneSuggestions}
              </div>
            </div>
          )}
          {contractCheckSuggestions && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="text-md font-semibold text-purple-700 mb-2 flex items-center">
                <ShieldCheck size={16} className="mr-2 text-purple-500" />{' '}
                {t('aiContractSuggestions')}
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {contractCheckSuggestions.split('\n').map(
                  (suggestion, index) =>
                    suggestion.trim() && (
                      <li
                        key={index}
                        className="flex justify-between items-start"
                      >
                        <span className="flex-1">{suggestion}</span>
                        <button
                          type="button"
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="ml-4 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded-md whitespace-nowrap"
                        >
                          {t('applySuggestion')}
                        </button>
                      </li>
                    )
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 pt-6">
          <label
            htmlFor="attachments"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('attachFiles')}
          </label>
          <input
            type="file"
            name="attachments"
            id="attachments"
            multiple
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
          />
        </div>
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <Info
                size={20}
                className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
              />
              <p className="text-xs text-yellow-700">
                {t('newProjectRegistrationNotice')}
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancelProject}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('clear')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {t('confirmAndRegister')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewProjectPage;
