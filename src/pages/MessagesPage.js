import React from 'react';
import { useTranslation } from 'react-i18next';

const MessagesPage = () => {
  const { t } = useTranslation();
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">{t('messages')}</h1>
      <p className="text-gray-600">{t('messagesDummyDetail')}</p>
    </div>
  );
};

export default MessagesPage;
