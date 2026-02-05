import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ProjectDetailPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">プロジェクト詳細ページ</h1>
      <p className="text-lg">Project ID: {projectId}</p>
      {/* TODO: Add more project/job detail info here */}
    </div>
  );
}
