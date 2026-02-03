import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { loggedInUserDataGlobal } from '../utils/initialData';

// Mock message data store (in production, this would be in a database)
const messageStore = typeof window !== 'undefined'
  ? (window.__messageStore = window.__messageStore || {})
  : {};

// Get messages for a project
function getProjectMessages(projectId) {
  if (!messageStore[projectId]) {
    messageStore[projectId] = [];
  }
  return messageStore[projectId];
}

// Add a message to a project
function addMessage(projectId, message) {
  if (!messageStore[projectId]) {
    messageStore[projectId] = [];
  }
  messageStore[projectId].push({
    ...message,
    id: `msg-${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
  });
}

const MessagesPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectId = searchParams.get('project');

  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Load projects (same as WorkManagementPage)
  useEffect(() => {
    const { getPendingApplicationJobsForUser, dashboardAllProjects, workManagementProjects } = require('../utils/initialData');
    const pendingApplications = getPendingApplicationJobsForUser(loggedInUserDataGlobal.id);

    // Get all projects from workManagementProjects and dashboardAllProjects
    const allProjects = [...workManagementProjects];

    // Add projects from pending applications
    pendingApplications.forEach(app => {
      const existingProject = allProjects.find(p => String(p.id) === String(app.jobId));
      if (!existingProject) {
        const job = dashboardAllProjects.find(j => String(j.id) === String(app.jobId));
        if (job) {
          allProjects.push({
            id: job.id,
            name: job.name || job.title || '新規案件',
            client: job.clientName || job.client || 'クライアント',
          });
        }
      }
    });

    setProjects(allProjects);
  }, []);

  // Load messages when project selected
  useEffect(() => {
    if (selectedProjectId) {
      setMessages(getProjectMessages(selectedProjectId));
    }
  }, [selectedProjectId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedProjectId) return;

    addMessage(selectedProjectId, {
      text: newMessage,
      senderId: loggedInUserDataGlobal.id,
      senderName: loggedInUserDataGlobal.name,
    });

    setMessages(getProjectMessages(selectedProjectId));
    setNewMessage('');
  };

  const selectedProject = projects.find(p => String(p.id) === String(selectedProjectId));

  return (
    <div className="flex h-screen">
      {/* Project List Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">メッセージ</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {projects.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">プロジェクトがありません</div>
          ) : (
            projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSearchParams({ project: project.id })}
                className={`w-full p-4 text-left hover:bg-slate-50 transition ${
                  String(selectedProjectId) === String(project.id) ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="font-semibold text-slate-800 truncate">{project.name}</div>
                <div className="text-xs text-slate-500 truncate">{project.client}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-slate-800">{selectedProject.name}</h3>
              <p className="text-sm text-slate-500">{selectedProject.client}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <p>メッセージはまだありません</p>
                  <p className="text-sm mt-2">最初のメッセージを送信しましょう</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => {
                    const isMe = msg.senderId === loggedInUserDataGlobal.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md px-4 py-2 rounded-lg ${
                          isMe ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border border-slate-200'
                        }`}>
                          <div className="text-xs opacity-75 mb-1">{msg.senderName}</div>
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {new Date(msg.timestamp).toLocaleString('ja-JP', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                >
                  送信
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center text-slate-500">
              <p className="text-lg mb-2">プロジェクトを選択してください</p>
              <p className="text-sm">左のリストからプロジェクトを選んでメッセージを開始します</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
