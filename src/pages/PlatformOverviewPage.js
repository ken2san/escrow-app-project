import React from 'react';
import { useTranslation } from 'react-i18next';

const GITHUB_URL = 'https://github.com/ken2san/escrow-app-project';

const overviewEn = `
This project aims to build a trustless platform that provides fairness, transparency, and peace of mind for all users. By leveraging blockchain and AI technologies, it guarantees trust through design—not operator discretion.

- Eliminate information asymmetry and reduce uncertainty in digital transactions
- Enforce fair payment and refund rules automatically via smart contracts
- Record all agreements and disputes in an auditable form
- Minimize operational intervention and maximize user autonomy
`;

const overviewJa = `
このプロジェクトは、すべてのユーザーに公正・透明・安心を提供する「信頼不要型プラットフォーム」の構築を目指しています。ブロックチェーンとAI技術を活用し、運営者の裁量に頼らず設計で信頼を担保します。

- 情報の非対称性を解消し、取引の不確実性を低減
- スマートコントラクトで自動的に公正な支払・返金ルールを実現
- すべての合意・紛争を監査可能な形で記録
- 運営の介入を最小限にし、ユーザーの自律性を最大化
`;

export default function ProjectOverviewPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">{isEn ? 'Project Overview' : 'プロジェクト概要'}</h2>
      <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-100 mb-4 text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        {isEn ? overviewEn : overviewJa}
      </pre>
      <div className="mt-4">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          {isEn ? 'View on GitHub' : 'GitHubで見る'}
        </a>
      </div>
    </div>
  );
}
