import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MessageSquare,
  Bell,
  PlusCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Settings,
  UserCircle,
  LogOut,
  Home,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ShieldCheck,
  Edit3,
  Send,
  Banknote,
  AlertOctagon,
  HelpCircle,
  FileUp,
  Sparkles,
  Loader2,
  Star,
  ThumbsDown,
  MessageCircle,
  FileTextIcon,
  History,
  Paperclip,
  Edit,
  ListChecks,
  FileSignature,
  Award,
  Globe,
  Target,
  Eye,
  SendHorizonal,
  Info,
  Trash2,
  Plus,
  Repeat,
  X,
  UsersIcon,
  Undo2,
  MoreVertical,
  CreditCard,
  Landmark,
  AlertCircle,
  Heart,
  Bookmark,
  CalendarDays,
  Tag,
  Zap,
} from 'lucide-react';

// --- ユーザー情報のダミーデータ ---
const loggedInUserDataGlobal = {
  id: 'user555',
  name: '田中 さとし',
};

// --- ダミーデータ ---
const initialProjects = [
  {
    id: 'job101',
    name: '新サービス紹介LPデザイン',
    clientName: '株式会社スタートアップ支援',
    clientId: 'client101',
    contractorName: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 65,
    totalAmount: 80000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    dueDate: '2025-07-15',
    completionDate: null,
    description:
      '7月にリリース予定の新サービスの魅力を伝えるランディングページのデザインをお願いします。ターゲットは20代後半～30代の男女。ワイヤーフレームはこちらで用意します。イラスト制作も可能であれば尚可。',
    deliverables: 'LPデザインデータ一式（Figma）',
    deliverableDetails:
      'Figma形式での納品。主要画面（トップ、サービス紹介、料金、会社概要、問い合わせ）のデザイン。スマートフォン表示にも対応。',
    acceptanceCriteria: 'デザインカンプ通りの実装、主要ブラウザでの表示確認',
    acceptanceCriteriaDetails:
      '納品後5営業日以内に検収。修正は2回までとし、大幅な変更は別途協議。',
    scopeOfWork_included:
      'LPデザイン制作、レスポンシブデザイン対応、画像素材選定（フリー素材）',
    scopeOfWork_excluded:
      'サーバー設定、ドメイン取得、有料画像素材の購入、テキストライティング',
    additionalWorkTerms:
      '大幅なデザイン変更やページ追加が発生する場合は、別途お見積もりとなります。',
    agreementDocLink: null,
    changeOrders: [],
    communicationLogCount: 0,
    lastUpdate: '2025-06-01 10:00',
    hasDispute: false,
    milestones: [
      {
        id: 'job101-m1',
        name: 'デザインカンプ初稿提出',
        amount: 40000,
        status: 'pending',
        dueDate: '2025-06-20',
        description: 'PC・スマホ両対応のデザインカンプを提出。',
      },
      {
        id: 'job101-m2',
        name: '最終デザインデータ納品',
        amount: 40000,
        status: 'pending',
        dueDate: '2025-07-10',
        description: '修正対応後、デザインデータ一式を納品。',
      },
    ],
    requiredSkills: [
      'ウェブデザイン',
      'LP制作',
      'Figma',
      'レスポンシブデザイン',
    ],
    clientRating: { averageScore: 4.5, totalReviews: 12 },
    imageUrl:
      'https://placehold.co/600x400/7C3AED/FFFFFF?text=LP%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3',
    allowSubcontracting: false,
    aiRecommendationScore: 0.9,
    aiRecommendationReason:
      'あなたのスキル「Figma」「ウェブデザイン」に強く合致しています！',
    proposals: [
      {
        id: 'prop_user555_for_job101',
        projectId: 'job101',
        contractorId: loggedInUserDataGlobal.id,
        contractorName: loggedInUserDataGlobal.name,
        contractorReputation: {
          averageScore: 4.8,
          totalReviews: 15,
          identityVerified: true,
          skillsCertified: ['ウェブデザイン'],
        },
        contractorResellingRisk: 5,
        proposalText:
          'LPデザインの経験豊富です。Figmaでの作成、レスポンシブ対応可能です。ぜひ担当させてください。',
        proposedAmount: 78000,
        estimatedDeliveryTime: '2週間',
        submissionDate: '2025-06-06',
        status: 'pending_review',
      },
    ],
  },
  {
    id: 'job103',
    name: 'PR記事作成依頼（月5本）',
    clientName: '田中 さとし',
    clientId: 'user555',
    contractorName: null,
    contractorId: null,
    contractorResellingRisk: 0,
    clientResellingRisk: 20,
    totalAmount: 50000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    dueDate: '2025-06-30',
    description:
      '弊社サービスの認知度向上のため、指定キーワードに基づいたPR記事を月5本作成・納品していただけるライター様を募集します。1記事あたり2000字程度。SEOライティング経験者歓迎。継続依頼の可能性あり。',
    deliverables: 'PR記事5本（Word形式）、各記事のキーワードリスト',
    deliverableDetails:
      '各記事2000字以上。指定キーワードを適切に含み、読者の検索意図に合致する内容であること。コピーコンテンツでないこと。',
    acceptanceCriteria: '指定キーワードでの検索順位目標達成、誤字脱字なし',
    acceptanceCriteriaDetails:
      '納品後3営業日以内に検収。修正は各記事1回まで。文法・表現の誤りがないこと。',
    scopeOfWork_included: '記事執筆、キーワードリサーチ、SEO観点での構成案作成',
    scopeOfWork_excluded: '画像選定、CMSへの入稿作業、SNSでの拡散',
    additionalWorkTerms: '追加記事は1本あたり10,000円（税別）とします。',
    agreementDocLink: null,
    changeOrders: [],
    communicationLogCount: 0,
    lastUpdate: '2025-06-02 12:00',
    hasDispute: false,
    milestones: [
      {
        id: 'job103-m1',
        name: '初回記事5本納品',
        amount: 50000,
        status: 'pending',
        dueDate: '2025-06-30',
        description: '指定キーワードに基づく記事5本',
      },
    ],
    requiredSkills: ['SEOライティング', 'コンテンツ作成', 'キーワードリサーチ'],
    clientRating: { averageScore: null, totalReviews: 0 },
    imageUrl:
      'https://placehold.co/600x400/DB2777/FFFFFF?text=PR%E8%A8%98%E4%BA%8B%E4%BD%9C%E6%88%90',
    allowSubcontracting: true,
    aiRecommendationScore: 0.75,
    aiRecommendationReason:
      'あなたの「コンテンツ作成」スキルと過去の類似案件実績に合致しています。',
    proposals: [
      {
        id: 'prop001',
        projectId: 'job103',
        contractorId: 'user888',
        contractorName: '鈴木 一郎',
        contractorReputation: {
          averageScore: 4.9,
          totalReviews: 25,
          identityVerified: true,
          skillsCertified: ['SEO Master'],
        },
        contractorResellingRisk: 15,
        proposalText:
          'SEOライティング歴5年の鈴木と申します。貴社サービスに貢献できる質の高い記事を迅速に作成いたします。過去実績はポートフォリオをご覧ください。月5本、2000字/記事でご提案の予算内で対応可能です。納期も柔軟に対応できます。',
        proposedAmount: 50000,
        estimatedDeliveryTime: '各記事3営業日以内',
        submissionDate: '2025-06-03',
        status: 'pending_review',
      },
      {
        id: 'prop002',
        projectId: 'job103',
        contractorId: 'user999',
        contractorName: '高橋 文子',
        contractorReputation: {
          averageScore: 4.7,
          totalReviews: 18,
          identityVerified: false,
          skillsCertified: [],
        },
        contractorResellingRisk: 5,
        proposalText:
          'ライターの高橋です。特にIT・テクノロジー分野のPR記事を得意としております。キーワードリサーチから構成案作成、執筆まで一貫して対応可能です。ご提示の条件でぜひお受けしたく存じます。',
        proposedAmount: 48000,
        estimatedDeliveryTime: '月5本を月末までに納品',
        submissionDate: '2025-06-04',
        status: 'pending_review',
      },
    ],
  },
  {
    id: 1,
    name: '企業ロゴリニューアルプロジェクト',
    clientName: '山田ベーカリー',
    clientId: 'user123',
    contractorName: loggedInUserDataGlobal.name,
    contractorId: loggedInUserDataGlobal.id,
    contractorResellingRisk: 5,
    clientResellingRisk: 0,
    totalAmount: 180000,
    fundsDeposited: 180000,
    fundsReleased: 180000,
    status: '完了',
    description:
      '創業50年を迎える老舗ベーカリー「山田ベーカリー」のブランドイメージを一新するためのロゴマーク、タグライン、および基本的なブランドガイドラインの制作。',
    deliverables: 'ロゴデータ（AI, PNG, JPG）、ブランドガイドライン（PDF）',
    deliverableDetails:
      'ロゴマーク（カラー、モノクロ、反転）、タグライン、基本デザインシステム（カラースキーム、指定フォント）、使用禁止例などを記載したブランドガイドライン。',
    acceptanceCriteria: '最終承認されたデザイン案通りの納品',
    acceptanceCriteriaDetails:
      '依頼者による最終確認後、承認をもって検収完了とする。',
    scopeOfWork_included:
      'ロゴデザイン3案提案、選定案のブラッシュアップ、ブランドガイドライン作成（10ページ程度）',
    scopeOfWork_excluded:
      'ロゴを使用した販促物デザイン（名刺、チラシ等）、ウェブサイトへのロゴ組み込み',
    additionalWorkTerms:
      '販促物デザインは別途お見積もり。ガイドラインの大幅なページ数増加は追加費用発生の可能性あり。',
    agreementDocLink: 'yamada_bakery_agreement_v1.pdf',
    changeOrders: [
      {
        id: 'co1-1',
        date: '2024-07-20',
        description: 'エコバッグ用デザインパターンの追加',
        agreed: true,
        additionalCost: 20000,
      },
    ],
    communicationLogCount: 42,
    lastUpdate: '2024-08-19 11:00',
    hasDispute: false,
    milestones: [
      {
        id: 'm1-1',
        name: 'ヒアリングと方向性提案',
        amount: 30000,
        status: 'paid',
        dueDate: '2024-07-05',
        paidDate: '2024-07-06',
        description: '詳細ヒアリング。3つのデザイン方向性を提案。',
        submittedFiles: [
          { name: 'direction_proposal.pdf', date: '2024-07-04' },
        ],
        feedbackHistory: [
          {
            type: 'approval',
            date: '2024-07-05',
            comment: 'B案でお願いします。',
          },
        ],
      },
      {
        id: 'm1-2',
        name: 'ロゴデザイン案（3種）提出と選定',
        amount: 70000,
        status: 'paid',
        dueDate: '2024-07-25',
        paidDate: '2024-07-28',
        description: 'ロゴデザイン案3種作成。展開例も提示。',
        submittedFiles: [{ name: 'logo_drafts.zip', date: '2024-07-24' }],
        feedbackHistory: [
          {
            type: 'feedback',
            date: '2024-07-25',
            comment: '案2が良いがフォント調整希望。',
          },
          { type: 'submission', date: '2024-07-26', comment: '修正案提出。' },
          {
            type: 'approval',
            date: '2024-07-27',
            comment: 'フォントBで決定。',
          },
        ],
      },
      {
        id: 'm1-3',
        name: '最終納品',
        amount: 60000,
        status: 'paid',
        dueDate: '2024-08-18',
        paidDate: '2024-08-18',
        description: 'ロゴデータ、ブランドガイドライン、各種デザイン案データ。',
        submittedFiles: [{ name: 'FINAL_ASSETS.zip', date: '2024-08-17' }],
        feedbackHistory: [
          {
            type: 'approval',
            date: '2024-08-18',
            comment: '完璧です。ありがとうございました。',
          },
        ],
      },
    ],
    contractorRating: {
      averageScore: 5,
      totalReviews: 1,
      reviews: [
        {
          reviewId: 'r1-yamada',
          projectId: 1,
          clientId: 'user123',
          clientName: '山田ベーカリー',
          rating: 5,
          comment: '素晴らしいロゴをありがとうございました。',
          contractorResponse: 'ありがとうございます！',
          date: '2024-08-19',
          disputeContext: null,
          isFlagged: false,
        },
      ],
    },
    needsClientRating: false,
    imageUrl:
      'https://placehold.co/600x400/10B981/FFFFFF?text=%E3%83%AD%E3%82%B4%E3%83%AA%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%A2%E3%83%AB',
    allowSubcontracting: false,
  },
  {
    id: 4,
    name: 'アプリUI改善提案',
    clientName: 'スタートアップY',
    clientId: 'clientY',
    contractorName: '田中 さとし',
    contractorId: 'user555',
    contractorResellingRisk: 0, // Logged in user is contractor
    clientResellingRisk: 0,
    totalAmount: 120000,
    fundsDeposited: 120000,
    fundsReleased: 0,
    status: '作業中',
    dueDate: '2025-07-05',
    description:
      '既存モバイルアプリのUI改善提案とモック作成。週1回の定例ミーティング必須。',
    deliverables: 'UI改善提案資料（PDF）、主要画面モックアップ（Figma）',
    deliverableDetails:
      '現状分析レポート、UI改善案（3パターン）、主要5画面のインタラクティブモックアップ。',
    acceptanceCriteria: '提案内容がユーザビリティテストで高評価を得ること',
    acceptanceCriteriaDetails:
      'ユーザビリティテストは依頼者側で実施。テスト結果に基づき、致命的な問題がないことを確認。',
    scopeOfWork_included:
      '現状分析、ユーザーインタビュー（3名まで）、競合調査、改善提案、ワイヤーフレーム作成、モックアップ作成',
    scopeOfWork_excluded:
      '実装、A/Bテストの実施、ユーザーインタビュー対象者のリクルーティング',
    additionalWorkTerms:
      '追加画面のモック作成は1画面あたり20,000円。ユーザビリティテストの設計・実施サポートは別途お見積もり。',
    agreementDocLink: 'agreement_project4.pdf',
    changeOrders: [],
    communicationLogCount: 12,
    lastUpdate: '2025-05-30 11:00',
    hasDispute: false,
    milestones: [
      {
        id: 'm4-1',
        name: '現状分析と課題整理',
        amount: 30000,
        status: 'approved',
        dueDate: '2025-06-10',
        description: 'ユーザーインタビューと競合分析。',
        submittedFiles: [
          { name: 'analysis_report_v1.pdf', date: '2025-06-09' },
        ],
        feedbackHistory: [
          {
            type: 'approval',
            date: '2025-06-10',
            comment: '分析内容、課題認識ともに的確です。次へ進んでください。',
          },
        ],
      },
      {
        id: 'm4-2',
        name: '改善提案とワイヤーフレーム作成',
        amount: 40000,
        status: 'in_progress',
        dueDate: '2025-06-25',
        description:
          '具体的な改善UI案（3パターン）と主要画面のワイヤーフレームを作成。',
        submittedFiles: [],
        feedbackHistory: [],
      },
      {
        id: 'm4-3',
        name: '最終モックアップ納品',
        amount: 50000,
        status: 'pending',
        dueDate: '2025-07-05',
        description: 'インタラクティブなモックアップを作成し納品。',
        submittedFiles: [],
        feedbackHistory: [],
      },
    ],
    imageUrl:
      'https://placehold.co/600x400/3B82F6/FFFFFF?text=UI%E6%94%B9%E5%96%84%E6%8F%90%E6%A1%88',
    allowSubcontracting: true,
  },
  {
    id: 'job_dispute_01',
    name: 'ウェブサイトリニューアル（協議中サンプル）',
    clientName: '株式会社ABCテック',
    clientId: 'clientABC',
    contractorName: '田中 さとし',
    contractorId: 'user555', // Logged in user is contractor
    contractorResellingRisk: 80,
    clientResellingRisk: 50,
    totalAmount: 150000,
    fundsDeposited: 100000,
    fundsReleased: 20000,
    status: '協議中',
    dueDate: '2025-05-01',
    completionDate: null,
    description:
      '既存コーポレートサイトのフルリニューアル。デザインとコーディングを含む。現在、仕様変更の範囲について依頼者と意見の相違が発生し、協議中です。',
    deliverables:
      'ウェブサイト一式（HTML, CSS, JS, 画像素材）、デザインカンプ（Photoshop）',
    deliverableDetails: '全10ページ構成。お問い合わせフォーム機能を含む。',
    acceptanceCriteria: '全ページのデザインと機能が仕様書通りであること',
    acceptanceCriteriaDetails: 'テスト環境での動作確認後、依頼者による承認。',
    scopeOfWork_included:
      'デザイン制作（トップページ＋下層9ページ）、HTML/CSS/JSコーディング、レスポンシブ対応、基本的なSEO設定',
    scopeOfWork_excluded:
      'サーバー移管作業、公開後の保守運用、コンテンツ作成（テキスト・画像素材は依頼者支給）',
    additionalWorkTerms:
      '仕様変更や追加ページ作成は、都度協議の上、追加費用を決定する。',
    agreementDocLink: 'agreement_dispute_01.pdf',
    changeOrders: [
      {
        id: 'co_d1',
        date: '2025-04-15',
        description: '追加ページ作成依頼（未合意）',
      },
    ],
    communicationLogCount: 35,
    lastUpdate: '2025-06-01 15:00',
    hasDispute: true,
    disputeDetails:
      '仕様変更の範囲と追加費用について合意に至らず、作業が中断しています。',
    milestones: [
      {
        id: 'job_d01-m1',
        name: 'デザインカンプ承認',
        amount: 50000,
        status: 'approved',
        dueDate: '2025-04-10',
        description: 'トップページと主要下層ページのデザイン承認済み。',
      },
      {
        id: 'job_d01-m2',
        name: 'コーディング中間提出',
        amount: 50000,
        status: 'submitted',
        dueDate: '2025-04-25',
        description: '主要機能実装済み。追加仕様について協議中。',
      },
      {
        id: 'job_d01-m3',
        name: '最終納品と検収',
        amount: 50000,
        status: 'pending',
        dueDate: '2025-05-10',
        description: '全機能実装後、最終確認。',
      },
    ],
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    clientRating: { averageScore: 4.0, totalReviews: 3 },
    allowSubcontracting: false,
  },
  {
    id: 'job105',
    name: '簡単なデータ入力作業',
    clientName: '株式会社データサービス',
    clientId: 'clientXYZ',
    contractorName: null,
    contractorId: null,
    totalAmount: 20000,
    status: '募集中',
    dueDate: '2025-07-20',
    description:
      '指定されたフォーマットへのデータ入力作業です。正確性が求められます。週に10時間程度の作業を想定しています。',
    requiredSkills: ['データ入力', 'Excel', '注意力'],
    clientRating: { averageScore: 4.0, totalReviews: 3 },
    allowSubcontracting: false,
    aiRecommendationScore: 0.2, // Low score
    proposals: [], // Added for clarity
    milestones: [
      {
        id: 'job105-m1',
        name: 'データ入力完了',
        amount: 20000,
        status: 'pending',
        dueDate: '2025-07-20',
        description: '全データ入力完了',
      },
    ],
  },
  {
    id: 'job106', // New project for AI recommendation
    name: 'ECサイト新機能開発',
    clientName: '株式会社EコマースX',
    clientId: 'clientECX',
    contractorName: null,
    contractorId: null,
    totalAmount: 300000,
    fundsDeposited: 0,
    fundsReleased: 0,
    status: '募集中',
    dueDate: '2025-08-30',
    description: '既存ECサイトに決済機能とユーザーレビュー機能を追加開発。React, Node.jsの経験必須。',
    requiredSkills: ['React', 'Node.js', 'API連携'],
    clientRating: { averageScore: 4.7, totalReviews: 8 },
    allowSubcontracting: false,
    aiRecommendationScore: 0.85, // High score
    aiRecommendationReason: 'あなたのスキル「React」「Node.js」に強く合致しています！',
    proposals: [], // No proposals from user555 yet
    milestones: [
      {
        id: 'job106-m1',
        name: '要件定義と設計',
        amount: 100000,
        status: 'pending',
        dueDate: '2025-07-15',
        description: '新機能の要件定義とシステム設計を完了。',
      },
      {
        id: 'job106-m2',
        name: '開発とテスト',
        amount: 150000,
        status: 'pending',
        dueDate: '2025-08-15',
        description: '決済機能とレビュー機能のフロントエンド・バックエンド開発および単体テスト。',
      },
      {
        id: 'job106-m3',
        name: '最終納品と結合テスト',
        amount: 50000,
        status: 'pending',
        dueDate: '2025-08-30',
        description: '全機能の結合テスト完了後、本番環境へのデプロイ支援と最終納品。',
      },
    ],
  },
];

// --- 多言語対応のための辞書 ---
const translations = {
  ja: {
    appName: 'エスクローアプリ',
    userRoleClient: '依頼者',
    userRoleContractor: '受注者',
    dashboard: 'あなたの案件',
    newProject: '新規案件登録',
    messages: 'メッセージ',
    disputes: '協議中の案件',
    settings: '設定',
    logout: 'ログアウト',
    searchPlaceholder: '案件名、依頼者名などで検索...',
    filter: 'フィルター',
    registerNewProject: '新規案件を登録',
    noProjectsFound: '該当する案件は見つかりませんでした。',
    client: '依頼者',
    contractor: '受注者',
    totalAmount: '総額',
    dueDate: '期日',
    deposited: 'デポジット済',
    released: '支払い済 (受注者へ)',
    progressCompleted: '% 完了',
    milestonesCompleted: 'マイルストーン',
    depositFunds: '資金をデポジット',
    sendMessage: 'メッセージ',
    reportProblem: '問題を報告',
    disputeSupport: '問題解決サポート ✨',
    agreementDetails: '契約内容',
    communicationHistory: '交信履歴',
    agreementShort: '契約',
    historyShort: '履歴',
    milestoneList: 'マイルストーン一覧',
    agreementAndHistory: '契約・履歴',
    evaluation: '評価',
    disputeInfo: '協議情報',
    milestonesNotSet: 'マイルストーン未設定',
    initialAgreement: '初期契約書:',
    changeOrders: '変更・追加合意',
    communicationLog: 'コミュニケーションログ:',
    confirmRecords: '件の記録を確認',
    recordsAsEvidence:
      '全ての契約内容・変更履歴・コミュニケーションは安全に保管され、問題発生時の証拠となります。',
    projectEvaluation: 'プロジェクトの評価',
    noEvaluationForThisProject: 'この案件に対する評価はまだありません。',
    evaluateThisProject: 'この案件を評価する',
    aiDisputeAnalysis: 'AIによる状況分析とサポート',
    aiAnalyzingDispute: 'AIが状況を分析中です...',
    rerunAiAnalysis: 'AI分析を再実行',
    relatedEvidence: '関連証拠（システム記録）',
    agreementFullText: '契約・合意内容 全文',
    communicationLogFullText: 'コミュニケーションログ 全文',
    deliverablesHistory: '成果物・フィードバック履歴',
    newProjectRegistration: '新しい案件を登録',
    projectName: '案件名',
    clientNameLabel: '依頼者名',
    contractorNameLabel: '受注者名',
    totalContractAmount: '総契約金額(円)',
    finalDueDate: '最終希望納期',
    projectOverviewDetails: '案件概要・詳細',
    generateMilestoneSuggestions: 'マイルストーン提案を生成 ✨',
    aiSuggestingMilestones: 'AIがマイルストーンを提案中です...',
    aiMilestoneSuggestions: 'AIによるマイルストーン提案',
    cancel: 'キャンセル',
    registerProject: '案件を登録する',
    pageUnderConstruction: 'このページは現在準備中です。',
    pageUnderConstructionDetail:
      '将来的にはここで{placeholder}に関する詳細な情報や操作が可能になります。',
    statusInProgress: '作業中',
    statusInReview: '承認待ち',
    statusPaymentWaiting: '支払い待ち',
    statusCompleted: '完了',
    statusInDispute: '協議中',
    statusPending: '未着手',
    statusRejected: '差戻し',
    statusPaid: '支払い済',
    statusApproved: '承認済',
    statusSubmitted: '承認待ち',
    statusOpenForProposals: '募集中',
    statusWorkReady: '作業準備完了',
    projectTitle: '案件タイトル',
    projectCategory: '案件カテゴリ',
    detailedDescription: '依頼内容の詳細',
    deliverablesDefinition: '成果物の定義',
    acceptanceCriteria: '検収条件',
    totalBudget: '総予算 (円)',
    paymentTerms: '支払い条件',
    paymentTermsOptions: ['一括払い', 'マイルストーン払い'],
    milestoneName: 'マイルストーン名',
    milestoneAmount: '金額 (円)',
    milestoneDueDate: '期日',
    addMilestone: 'マイルストーンを追加',
    removeMilestone: '削除',
    attachFiles: '関連ファイルを添付',
    importantNoticeOnRegistration:
      '登録された内容は、受注者との合意形成の基礎となり、問題発生時の重要な証拠となります。正確かつ詳細な情報をご入力ください。登録後の主要な契約条件の変更には、双方の合意と記録が必要となります。',
    confirmAndRegister: '内容を確認して登録する',
    aiContractCheck: 'AI契約内容チェック支援 ✨',
    aiCheckingContract: 'AIが契約内容をチェック中です...',
    aiContractSuggestions: 'AIによる契約内容の提案',
    openProjectsDashboard: 'お仕事を探す',
    viewDetailsAndApply: '詳細を見て応募する',
    applyForThisProject: 'この案件に応募する',
    requiredSkills: '必須スキル',
    clientRatingLabel: '依頼者の評価',
    proposal: '提案内容',
    submitProposal: '提案を送信する',
    applicationSubmitted: '応募が完了しました',
    projectDetails: '案件詳細',
    budget: '予算',
    clientProposed: '依頼者提示',
    fullDescription: '詳細説明',
    myActiveProjects: 'あなたの参画案件',
    roleSwitchButton: '表示モード切替',
    viewAsClient: '依頼者モードへ',
    viewAsContractor: '受注者モードへ',
    currentRoleIs: '現在の表示モード:',
    submitProposalFor: 'への提案送信',
    proposalMessage: '提案メッセージ',
    proposedAmount: '希望金額',
    estimatedDeliveryTime: '納期目安',
    attachPortfolio: 'ポートフォリオ/関連ファイル添付',
    optional: '任意',
    proposals: '提案一覧',
    proposalsReceived: '件の提案あり',
    reviewProposals: '提案を確認する',
    contractorReputation: '受注者の評価',
    viewProposalDetails: '提案詳細を見る',
    selectThisProposal: 'この提案を選択する',
    proposalSelectedMsg:
      '{contractorName}さんの提案を選択しました。契約内容の最終確認に進みます。',
    noProposalsYet: 'まだ提案はありません。',
    proposalDetails: '提案詳細',
    agreementPending: '契約準備中',
    clientMode: '依頼者モード',
    contractorMode: '受注者モード',
    confirmFinalAgreementAndProceed: '契約内容を確認し最終合意へ',
    contractReviewTitle: '契約内容の最終確認',
    agreeAndFinalizeContract: '上記内容に同意し、契約を締結する',
    cancelAndReturnToProposals: 'キャンセルして提案選択に戻る',
    cancelSelection: '選択をキャンセル',
    proposalStatusSelected: '選択中',
    proposalStatusArchived: 'アーカイブ済',
    moreOptions: 'その他の操作',
    contractFinalizedMessage:
      '契約が締結されました。作業開始の準備ができました。',
    depositFundsTitle: '資金をデポジット',
    amountToDeposit: 'デポジット金額',
    paymentMethod: '支払い方法',
    creditCard: 'クレジットカード',
    bankTransfer: '銀行振込',
    executeDeposit: 'デポジットを実行する',
    depositCompletedMessage: '資金がデポジットされました。作業を開始できます。',
    resellingAlertTitle: '警告：',
    resellingAlertMessage:
      '{contractorName}さんは過去の取引において、担当業務を転売（または丸投げ）する傾向が {percentage}% 確認されています。業務の品質やコミュニケーションに影響が出る可能性があります。',
    clientResellingRiskLabel: '依頼者の転売傾向',
    clientResellingRiskDisplay: '依頼者転売リスク: {percentage}%',
    projectTitlePlaceholder: '例：新商品の紹介ランディングページ制作',
    projectCategoryPlaceholder: '例：ウェブデザイン、ライティング',
    detailedDescriptionPlaceholder:
      '依頼したい業務内容、目的、ターゲット層、期待する成果などを具体的に記載してください。',
    deliverablesDefinitionPlaceholder:
      '例：Figmaデザインデータ一式、記事3本（各2000字程度）、HTML/CSS/JSファイル',
    acceptanceCriteriaPlaceholder:
      '例：デザインカンプ通りにコーディングされていること、全ての機能が正常に動作すること、誤字脱字がないこと',
    totalBudgetPlaceholder: '例：100000',
    milestoneNamePlaceholder: '例：初回デザイン案提出',
    milestoneAmountPlaceholder: '例：30000',
    nextActionRequired: '次のアクションが必要です:',
    nextAction_client_approveMilestone: '承認待ちのマイルストーンあり',
    nextAction_client_payMilestone: '支払い可能なマイルストーンあり',
    nextAction_client_depositFunds: '資金のデポジットが必要です',
    nextAction_contractor_startWork: '作業開始待ちのマイルストーンあり',
    nextAction_contractor_submitDeliverables:
      '成果物提出待ちのマイルストーンあり',
    deliverableDetailsLabel: '成果物の詳細定義',
    deliverableDetailsPlaceholder:
      '例：ロゴデザイン3案（PNG, AI形式）、各案のコンセプト説明資料（PDF）、納品ファイル構成など',
    acceptanceCriteriaDetailsLabel: '検収条件の詳細',
    acceptanceCriteriaDetailsPlaceholder:
      '例：納品されたロゴがブランドガイドラインに準拠していること。修正は2回までとし、3回目以降は別途協議。検収期間は納品後5営業日以内。',
    scopeOfWorkIncludedLabel: '契約に含まれる作業範囲',
    scopeOfWorkIncludedPlaceholder:
      '例：ロゴデザイン制作、タグライン提案、名刺デザイン1案',
    scopeOfWorkExcludedLabel: '契約に含まれない作業範囲',
    scopeOfWorkExcludedPlaceholder:
      '例：ウェブサイトへのロゴ組み込み、印刷費用、無制限の修正',
    additionalWorkTermsLabel: '追加作業発生時の条件・料金',
    additionalWorkTermsPlaceholder:
      '例：上記範囲外の作業は、1時間あたり8,000円の追加料金が発生します。',
    applySuggestion: 'この提案を適用する',
    registerProjectSuccess: '案件が登録されました。',
    fillRequiredFieldsError:
      '必須項目（案件名、詳細、総予算）を入力してください。',
    fillAllMilestoneInfoError: '全てのマイルストーン情報を入力してください。',
    milestoneBudgetMismatchError:
      'マイルストーンの合計金額が総予算と一致しません。',
    aiAnalyzingError: '結果を取得できませんでした。',
    errorPrefix: 'エラー',
    proposalDetailsModalTitle: '提案内容の詳細',
    interestedAction: 'お気に入りに追加', // Changed from "興味あり"
    evaluateContractor: '受注者を評価する',
    evaluateClient: '依頼者を評価する',
    viewReputationAnd実績: '評価と実績を見る',
    identityVerified: '本人確認済',
    skillsCertified: 'スキル認証済',
    allowSubcontracting: '再委託を許可する',
    subcontractingAllowed: '再委託: 許可',
    subcontractingNotAllowed: '再委託: 不許可',
    identityStatus: '本人確認',
    skillCertificationStatus: 'スキル認証',
    contractorResponseLabel: '受注者の返信:',
    contractorActiveProjects: '進行中の案件',
    contractorMyPendingProposals: '提案中の案件',
    contractorCompletedProjects: '完了した案件',
    contractorOpenForProposals: '提案可能な案件',
    aiRecommendedProjectsTitle: 'AIおすすめ案件 ✨',
    aiRecommendationReasonPrefix: '推薦理由: ',
    tabRecommended: 'おすすめ',
    tabMyTasks: 'マイタスク',
    tabCompletedHistory: '完了・履歴',
  },
  en: {
    appName: 'Escrow App',
    userRoleClient: 'Client',
    userRoleContractor: 'Contractor',
    dashboard: 'Your Projects',
    newProject: 'New Project',
    messages: 'Messages',
    disputes: 'Ongoing Discussions',
    settings: 'Settings',
    logout: 'Logout',
    searchPlaceholder: 'Search by project name, client...',
    filter: 'Filter',
    registerNewProject: 'Register New Project',
    noProjectsFound: 'No projects found.',
    client: 'Client',
    contractor: 'Contractor',
    totalAmount: 'Total Amount',
    dueDate: 'Due Date',
    deposited: 'Deposited',
    released: 'Released (to Contractor)',
    progressCompleted: '% Completed',
    milestonesCompleted: 'Milestones',
    depositFunds: 'Deposit Funds',
    sendMessage: 'Send Message',
    reportProblem: 'Report Problem',
    disputeSupport: 'Problem Resolution Support ✨',
    agreementDetails: 'Agreement Details',
    communicationHistory: 'Communication History',
    agreementShort: 'Agreement',
    historyShort: 'History',
    milestoneList: 'Milestone List',
    agreementAndHistory: 'Agreement & History',
    evaluation: 'Evaluation',
    disputeInfo: 'Discussion Info',
    milestonesNotSet: 'Milestones not set',
    initialAgreement: 'Initial Agreement:',
    changeOrders: 'Change Orders',
    communicationLog: 'Communication Log:',
    confirmRecords: 'records confirmed',
    recordsAsEvidence:
      'All agreements, changes, and communications are securely stored and serve as evidence in case of issues.',
    projectEvaluation: 'Project Evaluation',
    noEvaluationForThisProject: 'No evaluation for this project yet.',
    evaluateThisProject: 'Evaluate this Project',
    aiDisputeAnalysis: 'AI Analysis & Support',
    aiAnalyzingDispute: 'AI is analyzing the situation...',
    rerunAiAnalysis: 'Rerun AI Analysis',
    relatedEvidence: 'Related Evidence (System Records)',
    agreementFullText: 'Full Agreement Text',
    communicationLogFullText: 'Full Communication Log',
    deliverablesHistory: 'Deliverables & Feedback History',
    newProjectRegistration: 'Register New Project',
    projectName: 'Project Name',
    clientNameLabel: 'Client Name',
    contractorNameLabel: 'Contractor Name',
    totalContractAmount: 'Total Contract Amount (JPY)',
    finalDueDate: 'Final Due Date',
    projectOverviewDetails: 'Project Overview/Details',
    generateMilestoneSuggestions: 'Generate Milestone Suggestions ✨',
    aiSuggestingMilestones: 'AI is suggesting milestones...',
    aiMilestoneSuggestions: 'AI Milestone Suggestions',
    cancel: 'Cancel',
    registerProject: 'Register Project',
    pageUnderConstruction: 'This page is currently under construction.',
    pageUnderConstructionDetail:
      'In the future, detailed information and operations regarding {placeholder} will be available here.',
    statusInProgress: 'In Progress',
    statusInReview: 'Awaiting Approval',
    statusPaymentWaiting: 'Payment Waiting',
    statusCompleted: 'Completed',
    statusInDispute: 'Under Discussion',
    statusPending: 'Pending',
    statusRejected: 'Rejected',
    statusPaid: 'Paid',
    statusApproved: 'Approved',
    statusSubmitted: 'Awaiting Approval',
    statusOpenForProposals: 'Open for Proposals',
    statusWorkReady: 'Ready for Work',
    projectTitle: 'Project Title',
    projectCategory: 'Project Category',
    detailedDescription: 'Detailed Description of Request',
    deliverablesDefinition: 'Definition of Deliverables',
    acceptanceCriteria: 'Acceptance Criteria',
    totalBudget: 'Total Budget (JPY)',
    paymentTerms: 'Payment Terms',
    paymentTermsOptions: ['Lump Sum', 'Milestone Payment'],
    milestoneName: 'Milestone Name',
    milestoneAmount: 'Amount (JPY)',
    milestoneDueDate: 'Due Date',
    addMilestone: 'Add Milestone',
    removeMilestone: 'Remove',
    attachFiles: 'Attach Related Files',
    importantNoticeOnRegistration:
      'The registered content forms the basis of agreement with the contractor and serves as important evidence in case of issues. Please enter accurate and detailed information. Changes to major contract terms after registration require mutual consent and recording.',
    confirmAndRegister: 'Confirm and Register',
    aiContractCheck: 'AI Contract Check Support ✨',
    aiCheckingContract: 'AI is checking the contract content...',
    aiContractSuggestions: 'AI Suggestions for Contract',
    openProjectsDashboard: 'Find Work',
    viewDetailsAndApply: 'View Details & Apply',
    applyForThisProject: 'Apply for this Project',
    requiredSkills: 'Required Skills',
    clientRatingLabel: "Client's Rating",
    proposal: 'Proposal',
    submitProposal: 'Submit Proposal',
    applicationSubmitted: 'Application submitted',
    projectDetails: 'Project Details',
    budget: 'Budget',
    clientProposed: 'Client Proposed',
    fullDescription: 'Full Description',
    myActiveProjects: 'Your Active Projects',
    roleSwitchButton: 'Switch View Mode',
    viewAsClient: 'To Client Mode',
    viewAsContractor: 'To Contractor Mode',
    currentRoleIs: 'Current View Mode:',
    submitProposalFor: 'Submit Proposal for ',
    proposalMessage: 'Proposal Message',
    proposedAmount: 'Proposed Amount',
    estimatedDeliveryTime: 'Est. Delivery Time',
    attachPortfolio: 'Attach Portfolio/Files',
    optional: 'Optional',
    proposals: 'Proposals',
    proposalsReceived: ' proposals received',
    reviewProposals: 'Review Proposals',
    contractorReputation: "Contractor's Reputation",
    viewProposalDetails: 'View Proposal Details',
    selectThisProposal: 'Select This Proposal',
    proposalSelectedMsg:
      "{contractorName}'s proposal selected. Proceed to final contract review.",
    noProposalsYet: 'No proposals yet.',
    proposalDetails: 'Proposal Details',
    agreementPending: 'Agreement Pending',
    clientMode: 'Client Mode',
    contractorMode: 'Contractor Mode',
    confirmFinalAgreementAndProceed: 'Review Contract & Finalize Agreement',
    contractReviewTitle: 'Final Contract Review',
    agreeAndFinalizeContract: 'Agree to the above terms and finalize contract',
    cancelAndReturnToProposals: 'Cancel and return to proposal selection',
    cancelSelection: 'Cancel Selection',
    proposalStatusSelected: 'Selected',
    proposalStatusArchived: 'Archived',
    moreOptions: 'More Options',
    contractFinalizedMessage: 'Contract finalized. Ready for work to begin.',
    depositFundsTitle: 'Deposit Funds',
    amountToDeposit: 'Deposit Amount',
    paymentMethod: 'Payment Method',
    creditCard: 'Credit Card',
    bankTransfer: 'Bank Transfer',
    executeDeposit: 'Execute Deposit',
    depositCompletedMessage: 'Funds have been deposited. Work can now begin.',
    resellingAlertTitle: 'Warning:',
    resellingAlertMessage:
      '{contractorName} has shown a tendency of {percentage}% to resell (or subcontract) assigned tasks in past transactions. This may affect work quality or communication.',
    clientResellingRiskLabel: "Client's Reselling Tendency",
    clientResellingRiskDisplay: 'Client Reselling Risk: {percentage}%',
    projectTitlePlaceholder: 'e.g., New Product Landing Page Design',
    projectCategoryPlaceholder: 'e.g., Web Design, Writing',
    detailedDescriptionPlaceholder:
      'Describe the work, purpose, target audience, expected outcomes, etc., in detail.',
    deliverablesDefinitionPlaceholder:
      'e.g., Figma design files, 3 articles (approx. 2000 words each), HTML/CSS/JS files',
    acceptanceCriteriaPlaceholder:
      'e.g., Coding matches design comp, all functions work correctly, no typos',
    totalBudgetPlaceholder: 'e.g., 100000',
    milestoneNamePlaceholder: 'e.g., Initial Design Draft Submission',
    milestoneAmountPlaceholder: 'e.g., 30000',
    nextActionRequired: '次のアクションが必要です:',
    nextAction_client_approveMilestone: '承認待ちのマイルストーンあり',
    nextAction_client_payMilestone: '支払い可能なマイルストーンあり',
    nextAction_client_depositFunds: '資金のデポジットが必要です',
    nextAction_contractor_startWork: '作業開始待ちのマイルストーンあり',
    nextAction_contractor_submitDeliverables:
      '成果物提出待ちのマイルストーンあり',
    deliverableDetailsLabel: '成果物の詳細定義',
    deliverableDetailsPlaceholder:
      '例：ロゴデザイン3案（PNG, AI形式）、各案のコンセプト説明資料（PDF）、納品ファイル構成など',
    acceptanceCriteriaDetailsLabel: '検収条件の詳細',
    acceptanceCriteriaDetailsPlaceholder:
      '例：納品されたロゴがブランドガイドラインに準拠していること。修正は2回までとし、3回目以降は別途協議。検収期間は納品後5営業日以内。',
    scopeOfWorkIncludedLabel: '契約に含まれる作業範囲',
    scopeOfWorkIncludedPlaceholder:
      '例：ロゴデザイン制作、タグライン提案、名刺デザイン1案',
    scopeOfWorkExcludedLabel: '契約に含まれない作業範囲',
    scopeOfWorkExcludedPlaceholder:
      '例：ウェブサイトへのロゴ組み込み、印刷費用、無制限の修正',
    additionalWorkTermsLabel: '追加作業発生時の条件・料金',
    additionalWorkTermsPlaceholder:
      '例：上記範囲外の作業は、1時間あたり8,000円の追加料金が発生します。',
    applySuggestion: 'この提案を適用する',
    registerProjectSuccess: '案件が登録されました。',
    fillRequiredFieldsError:
      '必須項目（案件名、詳細、総予算）を入力してください。',
    fillAllMilestoneInfoError: '全てのマイルストーン情報を入力してください。',
    milestoneBudgetMismatchError:
      'マイルストーンの合計金額が総予算と一致しません。',
    aiAnalyzingError: '結果を取得できませんでした。',
    errorPrefix: 'エラー',
    proposalDetailsModalTitle: '提案内容の詳細',
    interestedAction: 'お気に入りに追加', // Changed from "興味あり"
    evaluateContractor: '受注者を評価する',
    evaluateClient: '依頼者を評価する',
    viewReputationAnd実績: '評価と実績を見る',
    identityVerified: '本人確認済',
    skillsCertified: 'スキル認証済',
    allowSubcontracting: '再委託を許可する',
    subcontractingAllowed: '再委託: 許可',
    subcontractingNotAllowed: '再委託: 不許可',
    identityStatus: '本人確認',
    skillCertificationStatus: 'スキル認証',
    contractorResponseLabel: '受注者の返信:',
    contractorActiveProjects: '進行中の案件',
    contractorMyPendingProposals: '提案中の案件',
    contractorCompletedProjects: '完了した案件',
    contractorOpenForProposals: '提案可能な案件',
    aiRecommendedProjectsTitle: 'AIおすすめ案件 ✨',
    aiRecommendationReasonPrefix: '推薦理由: ',
    tabRecommended: 'おすすめ',
    tabMyTasks: 'マイタスク',
    tabCompletedHistory: '完了・履歴',
  },
};

// --- Helper Components (Defined before App) ---
const StarRatingDisplay = ({ score, totalReviews, size = 'sm', lang }) => {
  const t = translations[lang];
  if (score === null || score === undefined)
    return (
      <span
        className={`text-xs ${
          size === 'sm' ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        {lang === 'ja' ? '評価なし' : 'No Rating'}
      </span>
    );
  const fullStars = Math.floor(score);
  const halfStar = score % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  const starSizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const reviewText =
    lang === 'ja'
      ? totalReviews === 1
        ? '件のレビュー'
        : '件のレビュー'
      : totalReviews === 1
      ? ' review'
      : ' reviews';

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${starSizeClass} text-yellow-400 fill-yellow-400`}
        />
      ))}
      {halfStar && (
        <Star
          key="half"
          className={`${starSizeClass} text-yellow-400 fill-yellow-200`}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${starSizeClass} text-gray-300`} />
      ))}
      {totalReviews !== undefined && totalReviews > 0 && (
        <span
          className={`ml-1.5 text-xs ${
            size === 'sm' ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          ({score.toFixed(1)} / {totalReviews}
          {reviewText})
        </span>
      )}
      {totalReviews === 0 && (
        <span
          className={`ml-1.5 text-xs ${
            size === 'sm' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {lang === 'ja' ? '(まだレビューがありません)' : '(No reviews yet)'}
        </span>
      )}
    </div>
  );
};

const ReviewItem = ({ review, lang, t }) => {
  return (
    <div className="py-3 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-700">
          {review.clientName ||
            (lang === 'ja' ? '匿名ユーザー' : 'Anonymous User')}
        </span>
        <span className="text-xs text-gray-500">{review.date}</span>
      </div>
      <StarRatingDisplay
        score={review.rating}
        size="sm"
        lang={lang}
        totalReviews={undefined}
      />
      <p className="text-xs text-gray-600 mt-1.5">{review.comment}</p>
      {review.contractorResponse && (
        <div className="mt-2 ml-4 pl-3 border-l-2 border-gray-200">
          <p className="text-xs text-gray-500 font-semibold mb-0.5">
            {t.contractorResponseLabel ||
              (lang === 'ja' ? '受注者の返信:' : 'Contractor Response:')}
          </p>
          <p className="text-xs text-gray-600">{review.contractorResponse}</p>
        </div>
      )}
      {review.disputeContext && (
        <div className="mt-1.5 p-1.5 bg-orange-50 rounded text-xs text-orange-700 inline-flex items-center">
          <AlertOctagon size={14} className="mr-1.5" />
          {review.disputeContext === 'dispute_raised_resolved_mutual' &&
            (lang === 'ja'
              ? 'この案件では紛争が報告され、双方合意の上で解決済みです。'
              : 'A dispute was reported for this project and resolved by mutual agreement.')}
          {review.disputeContext === 'admin_reviewed_action_taken' &&
            (lang === 'ja'
              ? '運営によりレビュー内容が確認され、対応が行われました。'
              : 'The review content was checked by the admin and action was taken.')}
        </div>
      )}
      {review.isFlagged && (
        <div className="mt-1.5 p-1.5 bg-yellow-50 rounded text-xs text-yellow-700 inline-flex items-center">
          <HelpCircle size={14} className="mr-1.5" />
          {lang === 'ja'
            ? '運営によりレビュー内容を確認中です。'
            : 'Review content is being checked by the admin.'}
        </div>
      )}
    </div>
  );
};

const callGeminiAPI = async (prompt, currentLang = 'ja') => {
  const apiKey = '';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error Response:', errorBody);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }
    const result = await response.json();
    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      return result.candidates[0].content.parts[0].text;
    }
    console.error('Gemini API Response unexpected:', result);
    return (
      translations[currentLang]?.aiAnalyzingError ||
      'Could not retrieve results.'
    );
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return `${translations[currentLang]?.errorPrefix || 'Error'}: ${
      error.message
    }`;
  }
};

const getStatusPillStyle = (status) => {
  switch (status) {
    case '作業中':
    case 'in_progress':
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'レビュー中':
    case 'submitted':
    case 'In Review':
    case '承認待ち':
      return 'bg-yellow-100 text-yellow-700';
    case '支払い待ち':
    case 'Payment Waiting':
      return 'bg-orange-100 text-orange-700';
    case '完了':
    case 'paid':
    case 'approved':
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case '協議中':
    case 'In Dispute':
    case 'Under Discussion':
      return 'bg-red-100 text-red-700';
    case '募集中':
    case 'Open for Proposals':
      return 'bg-cyan-100 text-cyan-700';
    case 'pending':
    case 'Pending':
      return 'bg-gray-100 text-gray-600';
    case 'rejected':
    case 'Rejected':
      return 'bg-pink-100 text-pink-700';
    case '契約準備中':
    case 'Agreement Pending':
      return 'bg-purple-100 text-purple-700';
    case '作業準備完了':
    case 'Ready for Work':
      return 'bg-sky-100 text-sky-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case '作業中':
    case 'in_progress':
    case 'In Progress':
      return <Clock className="mr-1 h-4 w-4" />;
    case 'レビュー中':
    case 'submitted':
    case 'In Review':
    case '承認待ち':
      return <FileUp className="mr-1 h-4 w-4" />;
    case '支払い待ち':
    case 'Payment Waiting':
      return <DollarSign className="mr-1 h-4 w-4" />;
    case '完了':
    case 'paid':
    case 'Completed':
      return <CheckCircle className="mr-1 h-4 w-4" />;
    case 'approved':
    case 'Approved':
      return <ShieldCheck className="mr-1 h-4 w-4" />;
    case '協議中':
    case 'In Dispute':
    case 'Under Discussion':
      return <AlertTriangle className="mr-1 h-4 w-4" />;
    case '募集中':
    case 'Open for Proposals':
      return <Target className="mr-1 h-4 w-4" />;
    case 'pending':
    case 'Pending':
      return <HelpCircle className="mr-1 h-4 w-4" />;
    case 'rejected':
    case 'Rejected':
      return <AlertOctagon className="mr-1 h-4 w-4" />;
    case '契約準備中':
    case 'Agreement Pending':
      return <FileSignature className="mr-1 h-4 w-4" />;
    case '作業準備完了':
    case 'Ready for Work':
      return <ListChecks className="mr-1 h-4 w-4" />;
    default:
      return <Briefcase className="mr-1 h-4 w-4" />;
  }
};

const MilestoneItem = ({
  milestone,
  project,
  userRole,
  lang,
  t,
  onUpdateMilestoneStatus,
}) => {
  const getMilestoneStatusText = (status) => {
    switch (status) {
      case 'paid':
        return t.statusPaid;
      case 'approved':
        return t.statusApproved;
      case 'submitted':
        return t.statusSubmitted;
      case 'rejected':
        return t.statusRejected;
      case 'in_progress':
        return t.statusInProgress;
      case 'pending':
        return t.statusPending;
      default:
        return status;
    }
  };
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const handleStartWork = () =>
    onUpdateMilestoneStatus(project.id, milestone.id, 'in_progress');
  const handleSubmitDeliverables = () =>
    onUpdateMilestoneStatus(project.id, milestone.id, 'submitted', {
      submittedFile: `deliverable_${milestone.id}.zip`,
    });
  const handleApproveMilestone = () =>
    onUpdateMilestoneStatus(project.id, milestone.id, 'approved');
  const handleRejectMilestone = () => {
    if (!rejectionReasonInput.trim()) {
      // Do not use alert() as per instructions, use a message box instead if possible
      // For now, retaining alert() as a temporary fallback for existing uses
      alert(
        lang === 'ja'
          ? '差戻し理由を入力してください。'
          : 'Please enter a rejection reason.'
      );
      return;
    }
    onUpdateMilestoneStatus(project.id, milestone.id, 'rejected', {
      rejectionReason: rejectionReasonInput,
    });
    setShowRejectionInput(false);
    setRejectionReasonInput('');
  };
  const handleExecutePayment = () =>
    onUpdateMilestoneStatus(project.id, milestone.id, 'paid');

  return (
    <div className="border-t border-gray-200 py-3 px-1 first:border-t-0">
      <div className="flex justify-between items-center">
        <h5 className="font-semibold text-sm text-gray-700">
          {milestone.name}
        </h5>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center ${getStatusPillStyle(
            milestone.status
          )}`}
        >
          {getStatusIcon(milestone.status)}{' '}
          {getMilestoneStatusText(milestone.status)}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">
        {t.dueDate}: {milestone.dueDate} | {t.totalAmount}: ¥
        {milestone.amount.toLocaleString()}
      </p>
      {milestone.description && (
        <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-1.5 rounded">
          {milestone.description}
        </p>
      )}
      {milestone.submittedFiles && milestone.submittedFiles.length > 0 && (
        <div className="mt-1.5 text-xs">
          <span className="font-medium text-gray-600">
            {lang === 'ja' ? '提出物:' : 'Deliverables:'}{' '}
          </span>
          {milestone.submittedFiles.map((file, index) => (
            <a
              key={index}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-indigo-600 hover:underline ml-1"
            >
              <Paperclip size={12} className="inline mr-0.5" />
              {file.name} ({file.date})
            </a>
          ))}
        </div>
      )}
      {milestone.feedbackHistory &&
        milestone.feedbackHistory.length > 0 &&
        milestone.feedbackHistory.some((fb) => fb.comment) && (
          <div className="mt-1 text-xs">
            <span className="font-medium text-gray-600">
              {lang === 'ja' ? 'フィードバック概要:' : 'Feedback Summary:'}{' '}
            </span>
            {milestone.feedbackHistory.find(
              (fb) => fb.type === 'rejection' && fb.comment
            )?.comment ||
              milestone.feedbackHistory.find(
                (fb) => fb.type === 'approval' && fb.comment
              )?.comment ||
              (lang === 'ja' ? 'コメントあり' : 'Comment available')}
          </div>
        )}
      {milestone.rejectionReason &&
        !milestone.feedbackHistory?.some(
          (fb) =>
            fb.type === 'rejection' && fb.comment === milestone.rejectionReason
        ) && (
          <p className="text-xs text-pink-600 mt-1 bg-pink-50 p-1.5 rounded">
            {lang === 'ja' ? '差戻し理由:' : 'Rejection Reason:'}{' '}
            {milestone.rejectionReason}
          </p>
        )}
      <div className="mt-2 flex space-x-2">
        {userRole === 'contractor' &&
          milestone.status === 'pending' &&
          project.status === t.statusInProgress && (
            <button
              onClick={handleStartWork}
              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
            >
              {lang === 'ja' ? '作業開始' : 'Start Work'}
            </button>
          )}
        {userRole === 'contractor' &&
          (milestone.status === 'in_progress' ||
            milestone.status === 'rejected') &&
          project.status === t.statusInProgress && (
            <button
              onClick={handleSubmitDeliverables}
              className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded inline-flex items-center"
            >
              <FileUp size={12} className="mr-1" />
              {lang === 'ja' ? '成果物を提出' : 'Submit Deliverables'}
            </button>
          )}
        {userRole === 'client' &&
          milestone.status === 'submitted' &&
          project.status === t.statusInProgress && (
            <>
              <button
                onClick={handleApproveMilestone}
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded inline-flex items-center"
              >
                <CheckCircle size={12} className="mr-1" />
                {lang === 'ja' ? '承認' : 'Approve'}
              </button>
              <button
                onClick={() => setShowRejectionInput(true)}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded inline-flex items-center"
              >
                <AlertOctagon size={12} className="mr-1" />
                {lang === 'ja' ? '差戻す' : 'Reject'}
              </button>
            </>
          )}
        {userRole === 'client' &&
          milestone.status === 'approved' &&
          project.fundsDeposited >= milestone.amount &&
          project.fundsReleased < project.totalAmount &&
          project.status === t.statusInProgress && (
            <button
              onClick={handleExecutePayment}
              className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 rounded inline-flex items-center"
            >
              <Banknote size={12} className="mr-1" />
              {lang === 'ja' ? '支払実行' : 'Execute Payment'}
            </button>
          )}
      </div>
      {showRejectionInput &&
        milestone.status === 'submitted' &&
        userRole === 'client' && (
          <div className="mt-2">
            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder={
                lang === 'ja'
                  ? '差戻し理由を具体的に入力してください'
                  : 'Enter rejection reason specifically'
              }
              className="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              rows={2}
            ></textarea>
            <button
              onClick={handleRejectMilestone}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded mt-1"
            >
              {lang === 'ja'
                ? '理由を送信して差戻す'
                : 'Submit Reason and Reject'}
            </button>
          </div>
        )}
    </div>
  );
};

const TabButton = ({ title, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2.5 text-sm font-medium border-b-2 ${
      isActive
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {React.cloneElement(icon, { size: 16, className: 'mr-2' })}
    {title}
  </button>
);

const ProposalModal = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  lang,
  t,
  currentUser,
}) => {
  const [proposalText, setProposalText] = useState('');
  const [proposedAmount, setProposedAmount] = useState(
    project?.totalAmount || ''
  );
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    if (project) {
      setProposalText('');
      setProposedAmount(project.totalAmount ? String(project.totalAmount) : '');
      setEstimatedTime('');
    } else {
      setProposalText('');
      setProposedAmount('');
      setEstimatedTime('');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      projectId: project.id,
      proposalText,
      proposedAmount: Number(proposedAmount) || project.totalAmount,
      estimatedDeliveryTime: estimatedTime,
      contractorId: currentUser.id,
      contractorName: currentUser.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {t.submitProposalFor}「{project.name}」
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="proposalText"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.proposalMessage} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="proposalText"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              rows="6"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="proposedAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.proposedAmount} ({t.optional})
              </label>
              <input
                type="number"
                id="proposedAmount"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder={`${lang === 'ja' ? '例: ' : 'e.g., '}${
                  project.totalAmount || '75000'
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="estimatedTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.estimatedDeliveryTime} ({t.optional})
              </label>
              <input
                type="text"
                id="estimatedTime"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder={lang === 'ja' ? '例: 2週間' : 'e.g., 2 weeks'}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.attachPortfolio} ({t.optional})
            </label>
            <input
              type="file"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center shadow-sm"
            >
              <SendHorizonal size={16} className="mr-2" />
              {t.submitProposal}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProposalItem = ({
  proposal,
  lang,
  t,
  isAnyProposalSelectedOnProject,
  onViewDetails,
}) => (
  <div
    className={`bg-white p-4 rounded-md shadow hover:shadow-lg transition-shadow border ${
      proposal.status === 'accepted'
        ? 'border-green-500 ring-2 ring-green-300'
        : 'border-gray-200'
    } ${proposal.status === 'archived' ? 'opacity-60 bg-gray-50' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <h5 className="text-md font-semibold text-indigo-700">
          {proposal.contractorName}
        </h5>
        {proposal.contractorReputation && (
          <div className="mt-0.5 mb-1">
            <StarRatingDisplay
              score={proposal.contractorReputation.averageScore}
              totalReviews={proposal.contractorReputation.totalReviews}
              size="xs"
              lang={lang}
            />
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500">{proposal.submissionDate}</span>
    </div>
    <p
      className="text-xs text-gray-700 mt-1 h-12 overflow-hidden text-ellipsis"
      title={proposal.proposalText}
    >
      {proposal.proposalText.substring(0, 120)}
      {proposal.proposalText.length > 120 ? '...' : ''}
    </p>
    <div className="text-xs text-gray-600 mt-2">
      {proposal.proposedAmount && (
        <span>
          {t.proposedAmount}: ¥
          {Number(proposal.proposedAmount).toLocaleString()}
        </span>
      )}
      {proposal.estimatedDeliveryTime && (
        <span className="ml-2">
          | {t.estimatedDeliveryTime}: {proposal.estimatedDeliveryTime}
        </span>
      )}
    </div>
    <div className="mt-3 flex justify-end space-x-2">
      {proposal.status === 'pending_review' &&
        !isAnyProposalSelectedOnProject && (
          <button
            onClick={() => onViewDetails(proposal)}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center"
          >
            <Eye size={14} className="mr-1" />
            {t.viewProposalDetails}
          </button>
        )}
      {proposal.status === 'accepted' && (
        <span className="text-xs text-green-600 font-semibold flex items-center">
          <CheckCircle size={14} className="mr-1" />
          {t.proposalStatusSelected}
        </span>
      )}
      {proposal.status === 'archived' && (
        <span className="text-xs text-gray-500 font-semibold">
          {t.proposalStatusArchived}
        </span>
      )}
    </div>
  </div>
);

const ProposalDetailsModal = ({
  isOpen,
  onClose,
  proposal,
  lang,
  t,
  onSelectProposal,
}) => {
  if (!isOpen || !proposal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {t.proposalDetailsModalTitle || 'Proposal Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700">
              {proposal.contractorName}
            </h4>
            {proposal.contractorReputation && (
              <div className="my-1">
                <StarRatingDisplay
                  score={proposal.contractorReputation.averageScore}
                  totalReviews={proposal.contractorReputation.totalReviews}
                  size="sm"
                  lang={lang}
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              {t.submissionDate}: {proposal.submissionDate}
            </p>
          </div>
          <div className="space-y-1">
            {proposal.contractorReputation?.identityVerified && (
              <div className="flex items-center text-xs text-green-600">
                <ShieldCheck size={14} className="mr-1.5" />{' '}
                {t.identityVerified}
              </div>
            )}
            {proposal.contractorReputation?.skillsCertified &&
              proposal.contractorReputation.skillsCertified.length > 0 && (
                <div className="flex items-center text-xs text-blue-600">
                  <Award size={14} className="mr-1.5" /> {t.skillsCertified}:{' '}
                  {proposal.contractorReputation.skillsCertified.join(', ')}
                </div>
              )}
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="font-semibold text-gray-700 mb-1">
              {t.proposalMessage}:
            </p>
            <p className="text-gray-600 whitespace-pre-wrap text-xs">
              {proposal.proposalText}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-700">{t.proposedAmount}:</p>
              <p className="text-gray-600">
                ¥{Number(proposal.proposedAmount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {t.estimatedDeliveryTime}:
              </p>
              <p className="text-gray-600">
                {proposal.estimatedDeliveryTime || 'N/A'}
              </p>
            </div>
          </div>
          {proposal.contractorResellingRisk > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-md text-xs">
              <p className="font-semibold text-yellow-800">
                {t.resellingAlertTitle}
              </p>
              <p className="text-yellow-700">
                {t.resellingAlertMessage
                  .replace('{contractorName}', proposal.contractorName)
                  .replace('{percentage}', proposal.contractorResellingRisk)}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectProposal(proposal);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center shadow-sm"
          >
            <CheckCircle size={16} className="mr-2" />
            {t.selectThisProposal}
          </button>
        </div>
      </div>
    </div>
  );
};

const DepositFundsModal = ({
  isOpen,
  onClose,
  project,
  lang,
  t,
  onSubmitDeposit,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState('creditCard'); // ← ここに移動する

  if (!isOpen || !project) return null; // ← これで問題なくなります

  const handleDeposit = () => {
    onSubmitDeposit(project.id, project.totalAmount);
  };

  const showResellingAlert =
    project.contractorResellingRisk && project.contractorResellingRisk > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {t.depositFundsTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <p>
            {t.projectName}:{' '}
            <span className="font-semibold">{project.name}</span>
          </p>
          <p>
            {t.contractor}:{' '}
            <span className="font-semibold">
              {project.contractorName || 'N/A'}
            </span>
          </p>
          <p>
            {t.amountToDeposit}:{' '}
            <span className="font-semibold text-green-600">
              ¥{project.totalAmount.toLocaleString()}
            </span>
          </p>
          {showResellingAlert && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md my-3">
              <div className="flex items-start">
                <div className="text-yellow-500 mr-2 shrink-0 mt-0.5">
                  <AlertTriangle size={20} />
                </div>
                <div className="text-xs text-yellow-700">
                  <p className="font-semibold text-yellow-800">
                    {t.resellingAlertTitle}
                  </p>
                  <p>
                    {t.resellingAlertMessage
                      .replace(
                        '{contractorName}',
                        project.contractorName ||
                          (lang === 'ja' ? 'この受注者' : 'This contractor')
                      )
                      .replace('{percentage}', project.contractorResellingRisk)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.paymentMethod}
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="creditCard"
                  checked={selectedPaymentMethod === 'creditCard'}
                  onChange={() => setSelectedPaymentMethod('creditCard')}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <CreditCard size={16} className="mr-1 text-gray-600" />{' '}
                {t.creditCard}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bankTransfer"
                  checked={selectedPaymentMethod === 'bankTransfer'}
                  onChange={() => setSelectedPaymentMethod('bankTransfer')}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <Landmark size={16} className="mr-1 text-gray-600" />{' '}
                {t.bankTransfer}
              </label>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            （
            {lang === 'ja'
              ? '実際の決済処理は実装されていません。このモーダルはUIのデモンストレーションです。'
              : 'Actual payment processing is not implemented. This modal is for UI demonstration.'}
            ）
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleDeposit}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center shadow-sm"
          >
            <Banknote size={16} className="mr-2" />
            {t.executeDeposit}
          </button>
        </div>
      </div>
    </div>
  );
};

const NextActionIndicator = ({ project, currentUserRole, t }) => {
  let actionText = null;
  let actionColor = 'text-gray-600';

  if (currentUserRole === 'client') {
    if (
      project.status === t.statusWorkReady &&
      project.fundsDeposited < project.totalAmount
    ) {
      actionText = t.nextAction_client_depositFunds;
      actionColor = 'text-yellow-600';
    } else if (project.status === t.statusInProgress) {
      const submittedMilestone = project.milestones.find(
        (m) => m.status === 'submitted'
      );
      if (submittedMilestone) {
        actionText = t.nextAction_client_approveMilestone;
        actionColor = 'text-orange-600';
      } else {
        const payableMilestone = project.milestones.find(
          (m) =>
            m.status === 'approved' &&
            project.fundsDeposited >= m.amount &&
            (!m.paidDate || m.status !== 'paid')
        );
        if (payableMilestone) {
          actionText = t.nextAction_client_payMilestone;
          actionColor = 'text-teal-600';
        }
      }
    }
  } else if (currentUserRole === 'contractor') {
    if (project.status === t.statusInProgress) {
      const pendingMilestone = project.milestones.find(
        (m) => m.status === 'pending'
      );
      if (pendingMilestone && project.fundsDeposited > 0) {
        actionText = t.nextAction_contractor_startWork;
        actionColor = 'text-blue-600';
      } else {
        const workInProgressMilestone = project.milestones.find(
          (m) => m.status === 'in_progress' || m.status === 'rejected'
        );
        if (workInProgressMilestone) {
          actionText = t.nextAction_contractor_submitDeliverables;
          actionColor = 'text-green-600';
        }
      }
    }
  }

  if (!actionText) {
    return null;
  }

  return (
    <div
      className={`mt-2 text-xs font-medium flex items-center ${actionColor}`}
    >
      <AlertCircle size={14} className="mr-1.5" />
      <span>
        {t.nextActionRequired} {actionText}
      </span>
    </div>
  );
};

const ProjectCard = ({
  project,
  onSelect,
  isSelected,
  currentUser,
  openProposalModalFunc,
  openDepositModalFunc,
  t,
  currentLanguage,
  currentViewMode,
  setActivePage,
  setActiveProjectDetailTab,
  activeProjectDetailTab,
  handleGenerateDisputeSummary,
  isLoadingGemini,
  disputeSummary,
  handleUpdateMilestoneStatus,
  handleSelectProposal,
  handleCancelProposalSelection,
  selectedProjectId,
  openProposalDetailsModal,
  isRecommendedCard,
}) => {
  const progress =
    project.milestones?.length > 0
      ? (project.milestones.filter(
          (m) => m.status === 'paid' || m.status === 'approved'
        ).length /
          project.milestones.length) *
        100
      : 0;
  const isUserClient = project.clientId === currentUser.id;
  const isUserContractorInvolved = project.contractorId === currentUser.id;
  const isAnyProposalSelectedOnThisProject = project.proposals?.some(
    (p) => p.status === 'accepted'
  );
  const hasUserProposed = project.proposals?.some(
    (prop) => prop.contractorId === currentUser.id && prop.status !== 'archived'
  );

  const handleTabChange = (tabName) => {
    if (isSelected) {
      setActiveProjectDetailTab(tabName);
    }
  };

  const getProjectStatusText = (status) => {
    switch (status) {
      case '作業中':
        return t.statusInProgress;
      case t.statusInReview:
        return t.statusInReview;
      case '支払い待ち':
        return t.statusPaymentWaiting;
      case '完了':
        return t.statusCompleted;
      case t.statusInDispute:
        return t.statusInDispute;
      case '募集中':
        return t.statusOpenForProposals;
      case t.agreementPending:
        return t.agreementPending;
      case t.statusWorkReady:
        return t.statusWorkReady;
      default:
        return status;
    }
  };

  const handleApplyForProject = (e) => {
    e.stopPropagation();
    openProposalModalFunc(project);
  };
  const handleViewAgreement = (e) => {
    e.stopPropagation();
    alert(
      `${t.initialAgreement}「${
        project.agreementDocLink || 'N/A'
      }」(仮) を表示します。\n${t.changeOrders}: ${
        project.changeOrders?.length || 0
      }件`
    );
  };
  const handleViewCommunicationLog = (e) => {
    e.stopPropagation();
    alert(
      `${t.communicationLog} 全 ${project.communicationLogCount} ${t.confirmRecords}。(仮)\n全てのやり取りは日時と共に記録されています。`
    );
  };
  const handleReportProblem = (e) => {
    e.stopPropagation();
    alert(
      currentLanguage === 'ja'
        ? '問題報告フォームへ進みます。(仮)\n契約内容、メッセージ履歴、成果物などが証拠として参照されます。'
        : 'Proceed to problem report form (mock).\nContract, messages, deliverables will be referenced as evidence.'
    );
  };
  const handleSendMessage = (e) => {
    e.stopPropagation();
    alert(t.sendMessage + ' (mock)');
  };
  const handleDisputeSupportFromCard = (e) => {
    e.stopPropagation();
    handleGenerateDisputeSummary(project);
  };

  const navigateToContractReviewPage = (e) => {
    e.stopPropagation();
    onSelect(project, true);
    setActivePage('contractReview');
  };

  // Client's view of their own projects (open for proposals, agreement pending, or work ready)
  if (
    currentViewMode === 'client' &&
    isUserClient &&
    (project.status === '募集中' ||
      project.status === t.agreementPending ||
      project.status === t.statusWorkReady)
  ) {
    return (
      <div
        className={`bg-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isSelected
            ? 'shadow-2xl ring-2 ring-blue-500'
            : 'shadow-lg hover:shadow-xl'
        }`}
      >
        {/* Image removed for client's own project list view */}
        <div className="p-5 cursor-pointer" onClick={() => onSelect(project)}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-blue-700">
              {project.name}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusPillStyle(
                project.status
              )}`}
            >
              {getStatusIcon(project.status)}{' '}
              {getProjectStatusText(project.status)}
            </span>
          </div>
          <p
            className="text-sm text-gray-600 mb-1 h-10 overflow-y-hidden text-ellipsis"
            title={project.description}
          >
            {project.description.substring(0, 100)}...
          </p>
          <div className="text-xs text-gray-500 mb-3">
            {t.budget}: ¥{project.totalAmount.toLocaleString()} | {t.dueDate}:{' '}
            {project.dueDate}
          </div>
          {project.status === '募集中' &&
            project.proposals &&
            project.proposals.length > 0 &&
            !isAnyProposalSelectedOnThisProject && (
              <p className="text-sm font-semibold text-green-600 mb-2">
                {
                  project.proposals.filter((p) => p.status === 'pending_review')
                    .length
                }{' '}
                {t.proposalsReceived}
              </p>
            )}
          {project.status === '募集中' &&
            (!project.proposals ||
              project.proposals.filter((p) => p.status === 'pending_review')
                .length === 0) && (
              <p className="text-sm text-gray-500 mb-2">{t.noProposalsYet}</p>
            )}
          {project.status === '募集中' &&
            !isAnyProposalSelectedOnThisProject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(project);
                  setActiveProjectDetailTab('proposals');
                }}
                className="w-full mt-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
                disabled={
                  !project.proposals ||
                  project.proposals.filter((p) => p.status === 'pending_review')
                    .length === 0
                }
              >
                <Users size={16} className="mr-2" />
                {t.reviewProposals}
              </button>
            )}
          {project.status === t.agreementPending && project.contractorName && (
            <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-200">
              <p className="text-sm font-semibold text-purple-700">
                {t.proposalStatusSelected}: {project.contractorName}
              </p>
              <div className="mt-2 space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelProposalSelection(project);
                  }}
                  className="w-full sm:w-auto text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md inline-flex items-center justify-center"
                >
                  <Undo2 size={14} className="mr-1.5" />
                  {t.cancelSelection}
                </button>
                <button
                  onClick={navigateToContractReviewPage}
                  className="w-full sm:w-auto text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md inline-flex items-center justify-center"
                >
                  <FileSignature size={14} className="mr-1.5" />
                  {t.confirmFinalAgreementAndProceed}
                </button>
              </div>
            </div>
          )}
          {project.status === t.statusWorkReady && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDepositModalFunc(project);
              }}
              className="w-full mt-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
            >
              <Banknote size={16} className="mr-2" />
              {t.depositFunds}
            </button>
          )}
        </div>
        {isSelected && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex border-b border-gray-300 -mx-4 px-2">
              {(project.status === '募集中' ||
                project.status === t.agreementPending) && (
                <TabButton
                  title={t.proposals}
                  icon={<Users />}
                  isActive={activeProjectDetailTab === 'proposals'}
                  onClick={() => handleTabChange('proposals')}
                />
              )}
              <TabButton
                title={t.milestoneList}
                icon={<ListChecks />}
                isActive={activeProjectDetailTab === 'milestones'}
                onClick={() => handleTabChange('milestones')}
              />
              {(project.status === t.agreementPending ||
                project.status === '作業中' ||
                project.status === '完了' ||
                project.status === t.statusWorkReady) && (
                <TabButton
                  title={t.agreementAndHistory}
                  icon={<FileSignature />}
                  isActive={activeProjectDetailTab === 'agreement'}
                  onClick={() => handleTabChange('agreement')}
                />
              )}
            </div>
            <div className="pt-4 min-h-[150px]">
              {activeProjectDetailTab === 'proposals' && (
                <div>
                  {' '}
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    {t.proposals} (
                    {project.proposals?.filter((p) => p.status !== 'archived')
                      .length || 0}
                    )
                  </h4>{' '}
                  {project.proposals &&
                  project.proposals.some((p) => p.status !== 'archived') ? (
                    <div className="space-y-3">
                      {project.proposals.map((prop) => (
                        <ProposalItem
                          key={prop.id}
                          proposal={prop}
                          onViewDetails={openProposalDetailsModal}
                          lang={currentLanguage}
                          t={t}
                          isAnyProposalSelectedOnProject={
                            isAnyProposalSelectedOnThisProject
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">{t.noProposalsYet}</p>
                  )}
                </div>
              )}
              {activeProjectDetailTab === 'milestones' && (
                <div>
                  {' '}
                  <h4 className="text-md font-semibold text-indigo-800 mb-3">
                    {t.milestoneList}
                  </h4>{' '}
                  {project.milestones?.length > 0 ? (
                    <div className="space-y-2">
                      {' '}
                      {project.milestones.map((milestone) => (
                        <MilestoneItem
                          key={milestone.id}
                          milestone={milestone}
                          project={project}
                          userRole={currentViewMode}
                          lang={currentLanguage}
                          t={t}
                          onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
                        />
                      ))}{' '}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t.milestonesNotSet}
                    </p>
                  )}{' '}
                </div>
              )}
              {activeProjectDetailTab === 'agreement' && (
                <div className="text-xs space-y-3">
                  <h4 className="text-md font-semibold text-indigo-800 mb-2">
                    {t.agreementDetails}
                  </h4>
                  <p>
                    <span className="font-semibold">
                      {t.allowSubcontracting}:
                    </span>{' '}
                    {project.allowSubcontracting
                      ? t.subcontractingAllowed.split(': ')[1]
                      : t.subcontractingNotAllowed.split(': ')[1]}
                  </p>
                  {project.deliverableDetails && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.deliverableDetailsLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.deliverableDetails}
                      </p>
                    </div>
                  )}
                  {project.acceptanceCriteriaDetails && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.acceptanceCriteriaDetailsLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.acceptanceCriteriaDetails}
                      </p>
                    </div>
                  )}
                  {project.scopeOfWork_included && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.scopeOfWorkIncludedLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.scopeOfWork_included}
                      </p>
                    </div>
                  )}
                  {project.scopeOfWork_excluded && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.scopeOfWorkExcludedLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.scopeOfWork_excluded}
                      </p>
                    </div>
                  )}
                  {project.additionalWorkTerms && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.additionalWorkTermsLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.additionalWorkTerms}
                      </p>
                    </div>
                  )}
                  {!project.deliverableDetails &&
                    !project.acceptanceCriteriaDetails &&
                    !project.scopeOfWork_included &&
                    !project.scopeOfWork_excluded &&
                    !project.additionalWorkTerms && (
                      <p className="text-gray-500">
                        {t.pageUnderConstructionDetail.replace(
                          '{placeholder}',
                          t.agreementDetails.toLowerCase()
                        )}
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Contractor's view of projects (Open for proposals, My pending proposals)
  if (currentViewMode === 'contractor' && project.status === '募集中') {
    return (
      <div
        className={`bg-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isSelected
            ? 'shadow-2xl ring-2 ring-teal-500'
            : 'shadow-lg hover:shadow-xl'
        } ${isRecommendedCard ? 'border-2 border-yellow-400' : ''}`}
      >
        {isRecommendedCard && project.aiRecommendationReason && (
          <div className="p-2 bg-yellow-100 border-b border-yellow-300 text-xs text-yellow-700 flex items-center">
            <Zap size={14} className="mr-1.5 text-yellow-500" />
            <strong>{t.aiRecommendationReasonPrefix}</strong>
            {project.aiRecommendationReason}
          </div>
        )}
        <div className="p-5 cursor-pointer" onClick={() => onSelect(project)}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-teal-700 hover:text-teal-800">
              {project.name}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusPillStyle(
                project.status
              )}`}
            >
              {getStatusIcon(project.status)}{' '}
              {getProjectStatusText(project.status)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <span>
              {t.client}: {project.clientName}
            </span>
          </div>
          {project.clientRating && (
            <div className="mb-2">
              <StarRatingDisplay
                score={project.clientRating.averageScore}
                totalReviews={project.clientRating.totalReviews}
                lang={currentLanguage}
                size="xs"
              />
            </div>
          )}
          <p
            className="text-sm text-gray-700 mb-3 h-10 overflow-hidden text-ellipsis"
            title={project.description}
          >
            {project.description.substring(0, 100)}
            {project.description.length > 100 ? '...' : ''}
          </p>
          <div className="flex justify-between items-center text-sm mb-3">
            <p className="font-bold text-gray-800">
              {t.budget}: ¥{project.totalAmount.toLocaleString()}
            </p>
            <p className="text-gray-500">
              {t.dueDate}: {project.dueDate}
            </p>
          </div>
          {project.requiredSkills && project.requiredSkills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                {t.requiredSkills}:
              </p>
              <div className="flex flex-wrap gap-1">
                {project.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Conditional rendering for action buttons */}
          {project.clientId !== currentUser.id && !hasUserProposed && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(t.interestedAction + ' (mock)');
                  }}
                  className="p-1.5 rounded-full hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                  title={t.interestedAction}
                >
                  <Heart size={18} />
                </button>
                {/* Bookmark icon removed as per user request */}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(project);
                  setActiveProjectDetailTab('details');
                }}
                className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg inline-flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Eye size={14} className="mr-1.5" />
                {t.viewDetailsAndApply}
              </button>
            </div>
          )}
          {hasUserProposed &&
            project.clientId !== currentUser.id && ( // Show "Proposal Submitted" if user has proposed
              <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-green-600 font-semibold p-2 bg-green-50 rounded-md text-center">
                {t.applicationSubmitted.split('（')[0]}{' '}
                {/* Show only "応募が完了しました" */}
              </div>
            )}
        </div>
        {isSelected &&
          activeProjectDetailTab === 'details' &&
          project.clientId !== currentUser.id && ( // Only show details if not client's own project
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                {t.projectDetails}
              </h4>
              <div className="space-y-2 text-sm mb-4">
                <p>
                  <span className="font-semibold">{t.client}:</span>{' '}
                  {project.clientName}
                </p>
                {project.clientRating && (
                  <div className="mb-1">
                    <StarRatingDisplay
                      score={project.clientRating.averageScore}
                      totalReviews={project.clientRating.totalReviews}
                      lang={currentLanguage}
                    />
                  </div>
                )}
                <p>
                  <span className="font-semibold">{t.budget}:</span> ¥
                  {project.totalAmount.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">{t.dueDate}:</span>{' '}
                  {project.dueDate}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">{t.fullDescription}:</span>
                </p>
                <p className="text-gray-700 whitespace-pre-line bg-white p-2 rounded border text-xs max-h-40 overflow-y-auto">
                  {project.description}
                </p>
                {project.deliverableDetails && (
                  <div className="mt-2 pt-2 border-t text-xs">
                    <p className="font-semibold text-gray-700">
                      {t.deliverableDetailsLabel}:
                    </p>
                    <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                      {project.deliverableDetails}
                    </p>
                  </div>
                )}
                {project.acceptanceCriteriaDetails && (
                  <div className="mt-2 pt-2 border-t text-xs">
                    <p className="font-semibold">
                      {t.acceptanceCriteriaDetailsLabel}:
                    </p>
                    <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                      {project.acceptanceCriteriaDetails}
                    </p>
                  </div>
                )}
                {project.scopeOfWork_included && (
                  <div className="mt-2 pt-2 border-t text-xs">
                    <p className="font-semibold">{t.scopeOfWorkIncludedLabel}:</p>
                    <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                      {project.scopeOfWork_included}
                    </p>
                  </div>
                )}
                {project.scopeOfWork_excluded && (
                  <div className="mt-2 pt-2 border-t text-xs">
                    <p className="font-semibold">{t.scopeOfWorkExcludedLabel}:</p>
                    <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                      {project.scopeOfWork_excluded}
                    </p>
                  </div>
                )}
                {project.additionalWorkTerms && (
                  <div className="mt-2 pt-2 border-t text-xs">
                    <p className="font-semibold">{t.additionalWorkTermsLabel}:</p>
                    <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                      {project.additionalWorkTerms}
                    </p>
                  </div>
                )}
                {project.requiredSkills &&
                  project.requiredSkills.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">{t.requiredSkills}:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
              {project.milestones && project.milestones.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">
                    {t.milestoneList} ({t.clientProposed})
                  </h5>
                  <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                    {project.milestones.map((ms) => (
                      <div key={ms.id} className="p-2 bg-white border rounded">
                        <p className="font-semibold">{ms.name}</p>
                        <p>
                          {t.totalAmount}: ¥{ms.amount.toLocaleString()} |{' '}
                          {t.dueDate}: {ms.dueDate}
                        </p>
                        {ms.description && (
                          <p className="text-gray-600 mt-1">{ms.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!hasUserProposed && (
                <button
                  onClick={handleApplyForProject}
                  className="w-full mt-3 text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
                >
                  <SendHorizonal size={16} className="mr-2" />
                  {t.applyForThisProject}
                </button>
              )}
            </div>
          )}
      </div>
    );
  }

  // Default card for other statuses (client's non-open projects, contractor's active/completed projects)
  if (isUserClient || isUserContractorInvolved) {
    return (
      <div
        className={`bg-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isSelected
            ? 'shadow-2xl ring-2 ring-indigo-500'
            : 'shadow-lg hover:shadow-xl'
        }`}
      >
        <div className="p-5 cursor-pointer" onClick={() => onSelect(project)}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-indigo-700 hover:text-indigo-800">
              {project.name}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusPillStyle(
                project.status
              )} ${project.hasDispute ? 'ring-2 ring-red-400' : ''}`}
            >
              {' '}
              {project.hasDispute && (
                <AlertTriangle className="mr-1 h-3 w-3 text-red-600" />
              )}{' '}
              {getStatusIcon(project.status)}{' '}
              {getProjectStatusText(project.status)}{' '}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <span>
              {t.client}: {project.clientName}
            </span>
            {project.contractorName && (
              <>
                {' '}
                |{' '}
                <span>
                  {t.contractor}: {project.contractorName}
                </span>
              </>
            )}
          </div>
          <div className="flex justify-between items-center text-sm mb-3">
            <p className="font-bold text-gray-800">
              {t.totalAmount}: ¥{project.totalAmount.toLocaleString()}
            </p>
            <p className="text-gray-500">
              {t.dueDate}: {project.dueDate || project.completionDate || 'N/A'}
            </p>
          </div>
          {project.status !== '募集中' &&
            project.status !== t.agreementPending &&
            project.status !== t.statusWorkReady && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  {' '}
                  <div
                    className="bg-indigo-500 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>{' '}
                </div>
                <p className="text-xs text-gray-500 text-right mb-3">
                  {Math.round(progress)}
                  {t.progressCompleted}
                </p>
              </>
            )}
          {(project.status === t.statusInProgress ||
            project.status === t.statusWorkReady) &&
            !project.hasDispute && (
              <NextActionIndicator
                project={project}
                currentUserRole={currentViewMode}
                t={t}
              />
            )}
          <div className="mt-3 flex flex-wrap gap-2 justify-end">
            {project.status !== t.statusWorkReady &&
              project.status !== '募集中' &&
              project.status !== t.agreementPending && (
                <>
                  <button
                    onClick={handleViewAgreement}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md inline-flex items-center"
                  >
                    <FileTextIcon size={14} className="mr-1.5" />
                    {t.agreementShort}
                  </button>
                  <button
                    onClick={handleViewCommunicationLog}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md inline-flex items-center"
                  >
                    <History size={14} className="mr-1.5" />
                    {t.historyShort} ({project.communicationLogCount})
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md inline-flex items-center"
                  >
                    <MessageSquare size={14} className="mr-1" />
                    {t.sendMessage}
                  </button>
                </>
              )}
            {isUserClient && project.status === '完了' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(t.evaluateContractor + ' (mock)');
                }}
                className="text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-800 px-3 py-1.5 rounded-md inline-flex items-center"
              >
                <Star size={14} className="mr-1.5" />
                {t.evaluateContractor}
              </button>
            )}
            {isUserContractorInvolved && project.status === '完了' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(t.evaluateClient + ' (mock)');
                }}
                className="text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-800 px-3 py-1.5 rounded-md inline-flex items-center"
              >
                <Star size={14} className="mr-1.5" />
                {t.evaluateClient}
              </button>
            )}
            {isUserClient && project.status === t.statusWorkReady && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDepositModalFunc(project);
                }}
                className="w-full text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
              >
                <Banknote size={16} className="mr-2" />
                {t.depositFunds}
              </button>
            )}
            {isUserClient &&
              project.fundsDeposited < project.totalAmount &&
              project.status === '作業中' &&
              !project.hasDispute && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDepositModalFunc(project);
                  }}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md inline-flex items-center"
                >
                  <Banknote size={14} className="mr-1" />
                  {t.depositFunds}
                </button>
              )}
            {!project.hasDispute &&
              project.status !== '完了' &&
              project.status !== '募集中' &&
              project.status !== t.agreementPending &&
              project.status !== t.statusWorkReady && (
                <button
                  onClick={handleReportProblem}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md inline-flex items-center"
                >
                  <AlertTriangle size={14} className="mr-1" />
                  {t.reportProblem}
                </button>
              )}
            {project.hasDispute && (
              <button
                onClick={handleDisputeSupportFromCard}
                disabled={isLoadingGemini && selectedProjectId === project.id}
                className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-md inline-flex items-center"
              >
                <Sparkles size={14} className="mr-1.5" />
                {isLoadingGemini && selectedProjectId === project.id ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-1" />
                ) : null}
                {t.disputeSupport}
              </button>
            )}
          </div>
        </div>
        {isSelected && (isUserClient || isUserContractorInvolved) && (
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex border-b border-gray-300 -mx-4 px-2">
              <TabButton
                title={t.milestoneList}
                icon={<ListChecks />}
                isActive={activeProjectDetailTab === 'milestones'}
                onClick={() => handleTabChange('milestones')}
              />
              <TabButton
                title={t.agreementAndHistory}
                icon={<FileSignature />}
                isActive={activeProjectDetailTab === 'agreement'}
                onClick={() => handleTabChange('agreement')}
              />
              {project.status === '完了' && (
                <TabButton
                  title={t.evaluation}
                  icon={<Award />}
                  isActive={activeProjectDetailTab === 'reviews'}
                  onClick={() => handleTabChange('reviews')}
                />
              )}
              {project.status === t.statusInDispute && (
                <TabButton
                  title={t.disputeInfo}
                  icon={<AlertOctagon />}
                  isActive={activeProjectDetailTab === 'dispute'}
                  onClick={() => handleTabChange('dispute')}
                />
              )}
            </div>
            <div className="pt-4 min-h-[150px]">
              {activeProjectDetailTab === 'milestones' && (
                <div>
                  {' '}
                  <h4 className="text-md font-semibold text-indigo-800 mb-3">
                    {t.milestoneList}
                  </h4>{' '}
                  {project.milestones?.length > 0 ? (
                    <div className="space-y-2">
                      {' '}
                      {project.milestones.map((milestone) => (
                        <MilestoneItem
                          key={milestone.id}
                          milestone={milestone}
                          project={project}
                          userRole={currentViewMode}
                          lang={currentLanguage}
                          t={t}
                          onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
                        />
                      ))}{' '}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t.milestonesNotSet}
                    </p>
                  )}{' '}
                </div>
              )}
              {activeProjectDetailTab === 'agreement' && (
                <div className="text-xs space-y-3">
                  <h4 className="text-md font-semibold text-indigo-800 mb-2">
                    {t.agreementDetails}
                  </h4>
                  <p>
                    <span className="font-semibold">
                      {t.allowSubcontracting}:
                    </span>{' '}
                    {project.allowSubcontracting
                      ? t.subcontractingAllowed.split(': ')[1]
                      : t.subcontractingNotAllowed.split(': ')[1]}
                  </p>
                  {project.deliverableDetails && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.deliverableDetailsLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.deliverableDetails}
                      </p>
                    </div>
                  )}
                  {project.acceptanceCriteriaDetails && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.acceptanceCriteriaDetailsLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.acceptanceCriteriaDetails}
                      </p>
                    </div>
                  )}
                  {project.scopeOfWork_included && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.scopeOfWorkIncludedLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.scopeOfWork_included}
                      </p>
                    </div>
                  )}
                  {project.scopeOfWork_excluded && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.scopeOfWorkExcludedLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.scopeOfWork_excluded}
                      </p>
                    </div>
                  )}
                  {project.additionalWorkTerms && (
                    <div>
                      <p className="font-semibold text-gray-700">
                        {t.additionalWorkTermsLabel}:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-2 rounded border">
                        {project.additionalWorkTerms}
                      </p>
                    </div>
                  )}
                  {!project.deliverableDetails &&
                    !project.acceptanceCriteriaDetails &&
                    !project.scopeOfWork_included &&
                    !project.scopeOfWork_excluded &&
                    !project.additionalWorkTerms && (
                      <p className="text-gray-500">
                        {t.pageUnderConstructionDetail.replace(
                          '{placeholder}',
                          t.agreementDetails.toLowerCase()
                        )}
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// --- Page Components (Defined before App) ---
const DashboardPage = ({
  projectsToDisplay,
  handleProjectClick,
  selectedProjectId,
  loggedInUser,
  openProposalModalFunc,
  openDepositModalFunc,
  t,
  currentLanguage,
  currentViewMode,
  setActivePage,
  setActiveProjectDetailTab,
  activeProjectDetailTab,
  handleGenerateDisputeSummary,
  isLoadingGemini,
  disputeSummary,
  handleUpdateMilestoneStatus,
  handleSelectProposal,
  handleCancelProposalSelection,
  searchTerm,
  setSearchTerm,
  activePage,
  onNavigateToContractReview,
  openProposalDetailsModal,
}) => {
  const [activeDashboardTab, setActiveDashboardTab] = useState(
    currentViewMode === 'contractor' ? 'recommended' : 'my_tasks'
  ); // Default to recommended for contractor, my_tasks for client

  useEffect(() => {
    // Reset tab when view mode changes
    setActiveDashboardTab(
      currentViewMode === 'contractor' ? 'recommended' : 'my_tasks'
    );
  }, [currentViewMode]);

  useEffect(() => {
    // Log project arrays for debugging
    if (currentViewMode === 'contractor') {
      console.log('--- Contractor Dashboard Projects ---');
      console.log('AI Recommended Projects:', projectsToDisplay.aiRecommendedProjects.map(p => p.name));
      console.log('Open for Proposals:', projectsToDisplay.openForProposals.map(p => p.name));
      console.log('My Pending Proposals:', projectsToDisplay.myPendingProposals.map(p => p.name));
      console.log('Active Contracts:', projectsToDisplay.activeContracts.map(p => p.name));
      console.log('Completed Contracts:', projectsToDisplay.completedContracts.map(p => p.name));
      console.log('------------------------------------');
    }
  }, [projectsToDisplay, currentViewMode]);


  const renderProjectList = (list, title, isRecommended = false) => (
    <>
      {title && (
        <h3 className="text-xl font-semibold text-gray-700 mb-4 mt-6 first:mt-0 flex items-center">
          {isRecommended && <Zap size={20} className="mr-2 text-yellow-500" />}
          {title}
        </h3>
      )}
      {list && list.length > 0 ? (
        <div
          className={`grid grid-cols-1 ${
            currentViewMode === 'contractor'
              ? 'md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2'
              : 'md:grid-cols-2 xl:grid-cols-3'
          } gap-6 items-start`}
        >
          {list.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={handleProjectClick}
              isSelected={selectedProjectId === project.id}
              currentUser={loggedInUser}
              openProposalModalFunc={openProposalModalFunc}
              openDepositModalFunc={openDepositModalFunc}
              t={t}
              currentLanguage={currentLanguage}
              currentViewMode={currentViewMode}
              setActivePage={setActivePage}
              setActiveProjectDetailTab={setActiveProjectDetailTab}
              activeProjectDetailTab={activeProjectDetailTab}
              handleGenerateDisputeSummary={handleGenerateDisputeSummary}
              isLoadingGemini={isLoadingGemini}
              disputeSummary={disputeSummary}
              handleUpdateMilestoneStatus={handleUpdateMilestoneStatus}
              handleSelectProposal={handleSelectProposal}
              handleCancelProposalSelection={handleCancelProposalSelection}
              onNavigateToContractReview={onNavigateToContractReview}
              selectedProjectId={selectedProjectId}
              openProposalDetailsModal={openProposalDetailsModal}
              isRecommendedCard={isRecommended}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Briefcase size={36} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">{t.noProjectsFound}</p>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm shadow-sm">
            <Filter size={16} className="mr-2" />
            {t.filter}
          </button>
          {currentViewMode === 'client' && (
            <button
              onClick={() => setActivePage('newProject')}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm shadow-md"
            >
              <PlusCircle size={16} className="mr-2" />
              {t.registerNewProject}
            </button>
          )}
        </div>
      </div>

      {currentViewMode === 'contractor' ? (
        // Contractor view with tabs
        <>
          <div className="flex border-b border-gray-300 mb-6">
            <TabButton
              title={t.tabRecommended}
              icon={<Zap />}
              isActive={activeDashboardTab === 'recommended'}
              onClick={() => setActiveDashboardTab('recommended')}
            />
            <TabButton
              title={t.tabMyTasks}
              icon={<ListChecks />}
              isActive={activeDashboardTab === 'my_tasks'}
              onClick={() => setActiveDashboardTab('my_tasks')}
            />
            <TabButton
              title={t.tabCompletedHistory}
              icon={<History />}
              isActive={activeDashboardTab === 'completed_history'}
              onClick={() => setActiveDashboardTab('completed_history')}
            />
          </div>

          {activeDashboardTab === 'recommended' && (
            <>
              {renderProjectList(
                projectsToDisplay.aiRecommendedProjects,
                t.aiRecommendedProjectsTitle,
                true
              )}
              {renderProjectList(
                projectsToDisplay.openForProposals,
                t.contractorOpenForProposals
              )}
            </>
          )}

          {activeDashboardTab === 'my_tasks' && (
            <>
              {renderProjectList(
                projectsToDisplay.activeContracts,
                t.contractorActiveProjects
              )}
              {renderProjectList(
                projectsToDisplay.myPendingProposals,
                t.contractorMyPendingProposals
              )}
            </>
          )}

          {activeDashboardTab === 'completed_history' && (
            <>
              {renderProjectList(
                projectsToDisplay.completedContracts,
                t.contractorCompletedProjects
              )}
            </>
          )}
        </>
      ) : (
        // Client view (no tabs needed for now, existing logic is fine)
        renderProjectList(projectsToDisplay, null)
      )}
    </>
  );
};

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
  onCancelProject,
}) => {
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

  const addMilestoneField = () => {
    setNewProjectData((prevData) => ({
      ...prevData,
      milestones: [
        ...prevData.milestones,
        { id: Date.now(), name: '', amount: '', dueDate: '' },
      ],
    }));
  };

  const removeMilestoneField = (index) => {
    setNewProjectData((prevData) => ({
      ...prevData,
      milestones: prevData.milestones.filter((_, i) => i !== index),
    }));
  };

  const localHandleSubmit = (e) => {
    e.preventDefault();
    onSubmitProject(newProjectData);
  };

  const handleApplySuggestion = (suggestion) => {
    const parts = suggestion.split(':');
    if (parts.length < 2) {
      console.warn('Invalid suggestion format:', suggestion);
      return;
    }

    const fieldLabelFromSuggestion = parts[0].trim();
    const suggestionText = parts.slice(1).join(':').trim();

    const fieldMap = {
      [t.deliverableDetailsLabel]: 'deliverableDetails',
      [t.acceptanceCriteriaDetailsLabel]: 'acceptanceCriteriaDetails',
      [t.scopeOfWorkIncludedLabel]: 'scopeOfWork_included',
      [t.scopeOfWorkExcludedLabel]: 'scopeOfWork_excluded',
      [t.additionalWorkTermsLabel]: 'additionalWorkTerms',
      [t.deliverablesDefinition]: 'deliverables',
      [t.acceptanceCriteria]: 'acceptanceCriteria',
    };

    const fieldKey = fieldMap[fieldLabelFromSuggestion];

    if (fieldKey) {
      setNewProjectData((prevData) => ({
        ...prevData,
        [fieldKey]: prevData[fieldKey]
          ? `${prevData[fieldKey]}\n${suggestionText}`
          : suggestionText,
      }));
    } else {
      console.warn(
        'Could not map suggestion to a form field based on label:',
        fieldLabelFromSuggestion
      );
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {t.newProjectRegistration}
      </h2>
      <form onSubmit={localHandleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t.projectTitle} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={newProjectData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t.projectTitlePlaceholder}
            required
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t.projectCategory}
          </label>
          <input
            type="text"
            name="category"
            id="category"
            value={newProjectData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t.projectCategoryPlaceholder}
          />
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-6">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.detailedDescription} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              id="description"
              value={newProjectData.description}
              onChange={handleInputChange}
              rows="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t.detailedDescriptionPlaceholder}
              required
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="deliverables"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.deliverablesDefinition}
            </label>
            <textarea
              name="deliverables"
              id="deliverables"
              value={newProjectData.deliverables}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t.deliverablesDefinitionPlaceholder}
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="deliverableDetails"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.deliverableDetailsLabel}
            </label>
            <textarea
              name="deliverableDetails"
              id="deliverableDetails"
              value={newProjectData.deliverableDetails}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t.deliverableDetailsPlaceholder}
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="acceptanceCriteria"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.acceptanceCriteria}
            </label>
            <textarea
              name="acceptanceCriteria"
              id="acceptanceCriteria"
              value={newProjectData.acceptanceCriteria}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t.acceptanceCriteriaPlaceholder}
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="acceptanceCriteriaDetails"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.acceptanceCriteriaDetailsLabel}
            </label>
            <textarea
              name="acceptanceCriteriaDetails"
              id="acceptanceCriteriaDetails"
              value={newProjectData.acceptanceCriteriaDetails}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t.acceptanceCriteriaDetailsPlaceholder}
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="scopeOfWork_included"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.scopeOfWorkIncludedLabel}
            </label>
            <textarea
              name="scopeOfWork_included"
              id="scopeOfWork_included"
              value={newProjectData.scopeOfWork_included}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t.scopeOfWorkIncludedPlaceholder}
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="scopeOfWork_excluded"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.scopeOfWorkExcludedLabel}
            </label>
            <textarea
              name="scopeOfWork_excluded"
              id="scopeOfWork_excluded"
              value={newProjectData.scopeOfWork_excluded}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t.scopeOfWorkExcludedPlaceholder}
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="additionalWorkTerms"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.additionalWorkTermsLabel}
            </label>
            <textarea
              name="additionalWorkTerms"
              id="additionalWorkTerms"
              value={newProjectData.additionalWorkTerms}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t.additionalWorkTermsPlaceholder}
            ></textarea>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="allowSubcontracting"
              id="allowSubcontracting"
              checked={newProjectData.allowSubcontracting || false}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label
              htmlFor="allowSubcontracting"
              className="ml-2 block text-sm text-gray-900"
            >
              {t.allowSubcontracting}
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-6">
          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.totalBudget} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="budget"
              id="budget"
              value={newProjectData.budget}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t.totalBudgetPlaceholder}
              required
            />
          </div>
          <div>
            <label
              htmlFor="paymentType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.paymentTerms}
            </label>
            <select
              name="paymentType"
              id="paymentType"
              value={newProjectData.paymentType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="milestone">{t.paymentTermsOptions[1]}</option>
              <option value="lump">{t.paymentTermsOptions[0]}</option>
            </select>
          </div>
          {newProjectData.paymentType === 'milestone' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-700">
                {t.milestonesCompleted}
              </h4>
              {newProjectData.milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="p-3 border border-gray-200 rounded-lg space-y-3 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-600">
                      {t.milestonesCompleted} {index + 1}
                    </p>
                    {newProjectData.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestoneField(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`milestoneName-${index}`}
                      className="block text-xs font-medium text-gray-600 mb-0.5"
                    >
                      {t.milestoneName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id={`milestoneName-${index}`}
                      value={milestone.name}
                      onChange={(e) =>
                        handleInputChange(e, index, 'milestones')
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder={t.milestoneNamePlaceholder}
                      required={newProjectData.paymentType === 'milestone'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor={`milestoneAmount-${index}`}
                        className="block text-xs font-medium text-gray-600 mb-0.5"
                      >
                        {t.milestoneAmount}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        id={`milestoneAmount-${index}`}
                        value={milestone.amount}
                        onChange={(e) =>
                          handleInputChange(e, index, 'milestones')
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder={t.milestoneAmountPlaceholder}
                        required={newProjectData.paymentType === 'milestone'}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`milestoneDueDate-${index}`}
                        className="block text-xs font-medium text-gray-600 mb-0.5"
                      >
                        {t.milestoneDueDate}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        id={`milestoneDueDate-${index}`}
                        value={milestone.dueDate}
                        onChange={(e) =>
                          handleInputChange(e, index, 'milestones')
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required={newProjectData.paymentType === 'milestone'}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMilestoneField}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Plus size={16} className="mr-1" />
                {t.addMilestone}
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={onGenerateMilestones}
              disabled={isLoadingGemini}
              className="w-full sm:w-auto flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Sparkles size={16} className="mr-2" />
              {isLoadingGemini &&
              !milestoneSuggestions &&
              !contractCheckSuggestions ? (
                <Loader2 className="animate-spin h-4 w-4 mr-1" />
              ) : null}
              {t.generateMilestoneSuggestions}
            </button>
            <button
              type="button"
              onClick={onContractCheck}
              disabled={isLoadingGemini}
              className="w-full sm:w-auto flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <ShieldCheck size={16} className="mr-2" />
              {isLoadingGemini &&
              !contractCheckSuggestions &&
              !milestoneSuggestions ? (
                <Loader2 className="animate-spin h-4 w-4 mr-1" />
              ) : null}
              {t.aiContractCheck}
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
                {t.aiMilestoneSuggestions}
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
                {t.aiContractSuggestions}
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
                          {t.applySuggestion}
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
            {t.attachFiles}
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
              {' '}
              <Info
                size={20}
                className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
              />{' '}
              <p className="text-xs text-yellow-700">
                {t.importantNoticeOnRegistration}
              </p>{' '}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancelProject}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {t.confirmAndRegister}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const PlaceholderPage = ({ t, title, icon }) => (
  <div className="flex flex-col items-center justify-center h-full bg-white p-8 rounded-xl shadow-xl">
    <div className="text-indigo-300 mb-6">
      {React.cloneElement(icon, { size: 72, strokeWidth: 1.5 })}
    </div>
    <h2 className="text-3xl font-semibold text-gray-700 mb-3">{title}</h2>
    <p className="text-gray-500 max-w-md text-center">
      {t.pageUnderConstructionDetail.replace(
        '{placeholder}',
        title.toLowerCase()
      )}
    </p>
  </div>
);

const ContractReviewPage = ({
  selectedProjectForReview,
  t,
  setActivePage,
  handleFinalizeContract,
  currentLanguage,
  handleCancelProposalSelection,
  setActiveProjectDetailTab,
}) => {
  useEffect(() => {
    if (!selectedProjectForReview) {
      setActivePage('dashboard');
    }
  }, [selectedProjectForReview, setActivePage]);

  if (!selectedProjectForReview) {
    return (
      <div className="p-6 text-center text-gray-500">
        {t.pageUnderConstructionDetail?.replace(
          '{placeholder}',
          'contract review (project not found)'
        ) ||
          (currentLanguage === 'ja'
            ? '案件情報が見つかりません。ダッシュボードに戻ります...'
            : 'Project information not found. Returning to dashboard...')}
      </div>
    );
  }
  const selectedProposal = selectedProjectForReview.proposals?.find(
    (p) => p.status === 'accepted'
  );

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <FileSignature size={28} className="mr-3 text-indigo-600" />
        {t.contractReviewTitle}
      </h2>
      <div className="space-y-6 text-sm">
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">
            {selectedProjectForReview.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <p>
              <span className="font-semibold">{t.client}:</span>{' '}
              {selectedProjectForReview.clientName}
            </p>
            {selectedProjectForReview.contractorName && (
              <p>
                <span className="font-semibold">{t.contractor}:</span>{' '}
                {selectedProjectForReview.contractorName}
              </p>
            )}
            <p>
              <span className="font-semibold">{t.totalAmount}:</span> ¥
              {(
                selectedProposal?.proposedAmount ||
                selectedProjectForReview.totalAmount
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">{t.dueDate}:</span>{' '}
              {selectedProjectForReview.dueDate}
            </p>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-2">
            {t.projectOverviewDetails}
          </h4>
          <p className="text-gray-600 whitespace-pre-line text-xs">
            {selectedProjectForReview.description}
          </p>
          {selectedProjectForReview.deliverableDetails && (
            <div className="mt-2 pt-2 border-t text-xs">
              <p className="font-semibold">{t.deliverableDetailsLabel}:</p>
              <p className="text-gray-600 whitespace-pre-line">
                {selectedProjectForReview.deliverableDetails}
              </p>
            </div>
          )}
          {selectedProjectForReview.acceptanceCriteriaDetails && (
            <div className="mt-2 pt-2 border-t text-xs">
              <p className="font-semibold">
                {t.acceptanceCriteriaDetailsLabel}:
              </p>
              <p className="text-gray-600 whitespace-pre-line">
                {selectedProjectForReview.acceptanceCriteriaDetails}
              </p>
            </div>
          )}
          {selectedProjectForReview.scopeOfWork_included && (
            <div className="mt-2 pt-2 border-t text-xs">
              <p className="font-semibold">{t.scopeOfWorkIncludedLabel}:</p>
              <p className="text-gray-600 whitespace-pre-line">
                {selectedProjectForReview.scopeOfWork_included}
              </p>
            </div>
          )}
          {selectedProjectForReview.scopeOfWork_excluded && (
            <div className="mt-2 pt-2 border-t text-xs">
              <p className="font-semibold">{t.scopeOfWorkExcludedLabel}:</p>
              <p className="text-gray-600 whitespace-pre-line">
                {selectedProjectForReview.scopeOfWork_excluded}
              </p>
            </div>
          )}
          {selectedProjectForReview.additionalWorkTerms && (
            <div className="mt-2 pt-2 border-t text-xs">
              <p className="font-semibold">{t.additionalWorkTermsLabel}:</p>
              <p className="text-gray-600 whitespace-pre-line">
                {selectedProjectForReview.additionalWorkTerms}
              </p>
            </div>
          )}
          <div className="mt-2 pt-2 border-t text-xs">
            <p className="font-semibold">{t.allowSubcontracting}:</p>
            <p className="text-gray-600">
              {selectedProjectForReview.allowSubcontracting
                ? t.subcontractingAllowed.split(': ')[1]
                : t.subcontractingNotAllowed.split(': ')[1]}
            </p>
          </div>
          {selectedProposal && (
            <div className="mt-3 pt-3 border-t">
              <h5 className="text-sm font-semibold text-gray-700 mb-1">
                {t.proposal} ({selectedProposal.contractorName})
              </h5>
              <p className="text-gray-600 whitespace-pre-line text-xs bg-indigo-50 p-2 rounded">
                {selectedProposal.proposalText}
              </p>
              {selectedProposal.estimatedDeliveryTime && (
                <p className="text-xs text-gray-500 mt-1">
                  {t.estimatedDeliveryTime}:{' '}
                  {selectedProposal.estimatedDeliveryTime}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-2">
            {t.milestoneList}
          </h4>
          {selectedProjectForReview.milestones?.length > 0 ? (
            <ul className="space-y-2">
              {selectedProjectForReview.milestones.map((ms) => (
                <li
                  key={ms.id}
                  className="p-2 border-b last:border-b-0 text-xs"
                >
                  <p className="font-semibold">
                    {ms.name}{' '}
                    <span className="text-gray-500 font-normal">
                      ({t.dueDate}: {ms.dueDate})
                    </span>
                  </p>
                  {ms.description && (
                    <p className="text-gray-600">{ms.description}</p>
                  )}
                  <p className="text-indigo-600 font-semibold">
                    ¥{Number(ms.amount).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-xs">{t.milestonesNotSet}</p>
          )}
        </div>
        <div className="p-4 border rounded-lg text-xs text-gray-500">
          <p>
            {currentLanguage === 'ja'
              ? '上記内容およびプラットフォーム利用規約（別途提示）に同意の上、契約を締結します。'
              : 'By agreeing to the above terms and the platform terms of service (provided separately), you finalize this contract.'}
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => {
              if (selectedProjectForReview) {
                handleCancelProposalSelection(selectedProjectForReview);
                setActiveProjectDetailTab('proposals');
              }
              setActivePage('dashboard');
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t.cancelAndReturnToProposals}
          </button>
          <button
            onClick={() => handleFinalizeContract(selectedProjectForReview.id)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <CheckCircle size={18} className="mr-2" />
            {t.agreeAndFinalizeContract}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- メインのアプリケーションコンポーネント ---
export default function App() {
  const loggedInUserData = {
    id: loggedInUserDataGlobal.id,
    name: loggedInUserDataGlobal.name,
  };

  const [projects, setProjects] = useState(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [activeProjectDetailTab, setActiveProjectDetailTab] =
    useState('details');
  const [currentLanguage, setCurrentLanguage] = useState('ja');
  const [loggedInUser] = useState(loggedInUserData);
  const [currentViewMode, setCurrentViewMode] = useState('client');
  const [disputeSummary, setDisputeSummary] = useState('');
  const [milestoneSuggestions, setMilestoneSuggestions] = useState('');
  const [contractCheckSuggestions, setContractCheckSuggestions] = useState('');
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    category: '',
    description: '',
    deliverables: '',
    acceptanceCriteria: '',
    deliverableDetails: '',
    acceptanceCriteriaDetails: '',
    scopeOfWork_included: '',
    scopeOfWork_excluded: '',
    additionalWorkTerms: '',
    budget: '',
    paymentType: 'milestone',
    milestones: [{ id: Date.now(), name: '', amount: '', dueDate: '' }],
    attachments: [],
    allowSubcontracting: false,
  });
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [projectForProposal, setProjectForProposal] = useState(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [projectForDeposit, setProjectForDeposit] = useState(null);
  const [isProposalDetailsModalOpen, setIsProposalDetailsModalOpen] =
    useState(false);
  const [proposalForDetails, setProposalForDetails] = useState(null);

  const t = translations[currentLanguage];
  const selectedProjectForReview = projects.find(
    (p) => p.id === selectedProjectId
  );

  const projectsToDisplay = (() => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    if (currentViewMode === 'client') {
      const clientProjects = projects.filter(
        (project) => project.clientId === loggedInUser.id
      );
      if (!normalizedSearchTerm) {
        return clientProjects;
      }
      return clientProjects.filter(
        (project) =>
          project.name?.toLowerCase().includes(normalizedSearchTerm) ||
          project.contractorName
            ?.toLowerCase()
            .includes(normalizedSearchTerm) ||
          project.description?.toLowerCase().includes(normalizedSearchTerm)
      );
    } else {
      // contractor view
      const allProjects = projects;

      const filterBySearch = (list) => {
        if (!normalizedSearchTerm) return list;
        return list.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(normalizedSearchTerm)) ||
            (p.description &&
              p.description.toLowerCase().includes(normalizedSearchTerm)) ||
            (p.clientName &&
              p.clientName.toLowerCase().includes(normalizedSearchTerm))
        );
      };

      let aiRecommendedProjects = filterBySearch(
        allProjects
          .filter(
            (p) =>
              p.aiRecommendationScore &&
              p.aiRecommendationScore > 0.7 &&
              p.status === '募集中' &&
              p.clientId !== loggedInUser.id
          )
          .sort((a, b) => b.aiRecommendationScore - a.aiRecommendationScore)
      );

      let openForProposals = filterBySearch(
        allProjects.filter(
          (p) =>
            p.status === '募集中' &&
            p.clientId !== loggedInUser.id &&
            !p.proposals?.some(
              (prop) =>
                prop.contractorId === loggedInUser.id &&
                prop.status !== 'archived'
            )
        )
      );

      let myPendingProposals = filterBySearch(
        allProjects.filter(
          (p) =>
            p.status === '募集中' &&
            p.proposals?.some(
              (prop) =>
                prop.contractorId === loggedInUser.id &&
                prop.status === 'pending_review'
            )
        )
      );

      let activeContracts = filterBySearch(
        allProjects.filter(
          (p) =>
            p.contractorId === loggedInUser.id &&
            (p.status === t.statusInProgress ||
              p.status === t.statusWorkReady ||
              p.status === t.agreementPending ||
              p.status === t.statusInDispute)
        )
      ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      let completedContracts = filterBySearch(
        allProjects.filter(
          (p) => p.contractorId === loggedInUser.id && p.status === '完了'
        )
      );
      return {
        aiRecommendedProjects,
        openForProposals,
        myPendingProposals,
        activeContracts,
        completedContracts,
      };
    }
  })();

  const handleProjectClick = (project, forceSelect = false) => {
    if (forceSelect) {
      setSelectedProjectId(project.id);
    } else {
      setSelectedProjectId((prevId) =>
        project.id === prevId ? null : project.id
      );
    }
    setDisputeSummary('');
    if (project.id === selectedProjectId && !forceSelect) {
      // Optionally reset tab or do nothing if deselecting
    } else {
      setActiveProjectDetailTab(
        currentViewMode === 'contractor' && project.status === '募集中'
          ? 'details'
          : project.status === '募集中' &&
            project.proposals?.length > 0 &&
            currentViewMode === 'client' &&
            project.clientId === loggedInUser.id
          ? 'proposals'
          : project.status === t.agreementPending &&
            currentViewMode === 'client' &&
            project.clientId === loggedInUser.id
          ? 'proposals'
          : 'milestones'
      );
    }
  };

  const navigateToContractReview = (project) => {
    if (project && project.id) {
      if (selectedProjectId !== project.id) {
        setSelectedProjectId(project.id);
      }
      setActivePage('contractReview');
    } else {
      console.error(
        'navigateToContractReview called with invalid project:',
        project
      );
      setActivePage('dashboard');
    }
  };

  const handleGenerateDisputeSummary = async (project) => {
    if (!project) return;
    setIsLoadingGemini(true);
    setDisputeSummary('');
    const milestoneDetails = project.milestones
      .map(
        (m) =>
          `- ${m.name} (${t.dueDate}: ${m.dueDate}, ${t.totalAmount}: ${
            m.amount
          }円, ${t.status}: ${m.status}${
            m.description ? ', 説明: ' + m.description : ''
          }${m.rejectionReason ? ', 差戻し理由: ' + m.rejectionReason : ''})`
      )
      .join('\n');
    const prompt = `以下のエスクロー案件で問題が発生しています。状況を客観的に要約し、双方にとって建設的な解決策や次のステップを3点提案してください。\n\n案件名: ${
      project.name
    }\n依頼者: ${project.clientName}\n受注者: ${
      project.contractorName
    }\n総額: ${project.totalAmount}円\nデポジット済資金: ${
      project.fundsDeposited
    }円\n支払い済資金: ${project.fundsReleased}円\n案件の期日: ${
      project.dueDate
    }\n案件の概要: ${project.description}\n現在の案件ステータス: ${
      project.status
    }\n問題の詳細: ${
      project.disputeDetails || '特記事項なし'
    }\n\nマイルストーンの詳細:\n${milestoneDetails}\n\n要約と提案:`;
    const summary = await callGeminiAPI(prompt, currentLanguage);
    setDisputeSummary(summary);
    setIsLoadingGemini(false);
  };

  const handleGenerateMilestonesForNewProject = async () => {
    if (!newProjectData.description.trim()) {
      alert(t.detailedDescriptionPlaceholder);
      return;
    }
    setIsLoadingGemini(true);
    setMilestoneSuggestions('');
    const prompt = `${t.aiSuggestingMilestones} - ${t.projectOverviewDetails}:\n${newProjectData.description}\n\n${t.aiMilestoneSuggestions}:`;
    const suggestions = await callGeminiAPI(prompt, currentLanguage);
    setMilestoneSuggestions(suggestions);
    setIsLoadingGemini(false);
  };

  const handleContractCheck = async () => {
    const contractText = `
      ${t.projectTitle}: ${newProjectData.title}
      ${t.projectCategory}: ${newProjectData.category}
      ${t.detailedDescription}: ${newProjectData.description}
      ${t.deliverablesDefinition}: ${newProjectData.deliverables}
      ${t.deliverableDetailsLabel}: ${newProjectData.deliverableDetails}
      ${t.acceptanceCriteria}: ${newProjectData.acceptanceCriteria}
      ${t.acceptanceCriteriaDetailsLabel}: ${
      newProjectData.acceptanceCriteriaDetails
    }
      ${t.scopeOfWorkIncludedLabel}: ${newProjectData.scopeOfWork_included}
      ${t.scopeOfWorkExcludedLabel}: ${newProjectData.scopeOfWork_excluded}
      ${t.additionalWorkTermsLabel}: ${newProjectData.additionalWorkTerms}
      ${t.totalBudget}: ${newProjectData.budget}円
      ${t.paymentTerms}: ${
      newProjectData.paymentType === 'milestone'
        ? t.paymentTermsOptions[1]
        : t.paymentTermsOptions[0]
    }
      ${
        newProjectData.paymentType === 'milestone'
          ? t.milestonesCompleted +
            ':\n' +
            newProjectData.milestones
              .map(
                (m) =>
                  `  - ${m.name}: ${m.amount}円 (${t.dueDate}: ${m.dueDate})`
              )
              .join('\n')
          : ''
      }
      ${t.allowSubcontracting}: ${
      newProjectData.allowSubcontracting
        ? t.subcontractingAllowed.split(': ')[1]
        : t.subcontractingNotAllowed.split(': ')[1]
    }
    `.trim();

    if (contractText.length < 50) {
      alert(
        currentLanguage === 'ja'
          ? '契約内容が十分に記載されていません。詳細を入力してください。'
          : 'Contract details are insufficient. Please provide more details.'
      );
      return;
    }
    setIsLoadingGemini(true);
    setContractCheckSuggestions('');
    const prompt = `
      以下の案件情報について、契約条件の明確性、網羅性、公平性の観点からレビューしてください。
      特に以下の項目に注目し、曖昧な点、不足している情報、依頼者または受注者にとって潜在的なリスクとなり得る点を具体的に指摘し、それぞれの指摘に対して改善案も提示してください。
      各指摘と改善提案は、必ず項目名（例：「${t.deliverableDetailsLabel}:」）から始めてください。
      箇条書きで、指摘点と改善案を明確に分けて記述してください。

      注目すべき項目：
      1. 成果物の詳細定義（${t.deliverableDetailsLabel}）: 具体性（例：ファイル形式、数量、バージョン）、品質基準（例：解像度、動作環境）は明確か？
      2. 検収条件の詳細（${t.acceptanceCriteriaDetailsLabel}）: 検収期間、合格基準（例：具体的なテスト項目）、修正対応の範囲と回数、検収プロセスは明確か？一方的に不利な条件はないか？
      3. 契約に含まれる作業範囲（${t.scopeOfWorkIncludedLabel}）: 作業範囲は具体的で網羅的か？誤解の余地はないか？
      4. 契約に含まれない作業範囲（${t.scopeOfWorkExcludedLabel}）: 「含まれないこと」が明確に記載されているか？暗黙の了解に頼っていないか？
      5. 追加作業発生時の条件・料金（${t.additionalWorkTermsLabel}）: 追加作業の定義、料金設定の根拠、合意プロセスは明確か？
      6. 再委託の許可（${t.allowSubcontracting}）: この設定は適切か？リスクはないか？

      案件情報:
      ${contractText}

      AIによるチェック結果と改善提案:
    `.trim();
    const suggestions = await callGeminiAPI(prompt, currentLanguage);
    setContractCheckSuggestions(suggestions);
    setIsLoadingGemini(false);
  };

  const toggleLanguage = () => {
    setCurrentLanguage((prevLang) => (prevLang === 'ja' ? 'en' : 'ja'));
  };

  const resetNewProjectForm = () => {
    setNewProjectData({
      title: '',
      category: '',
      description: '',
      deliverables: '',
      acceptanceCriteria: '',
      deliverableDetails: '',
      acceptanceCriteriaDetails: '',
      scopeOfWork_included: '',
      scopeOfWork_excluded: '',
      additionalWorkTerms: '',
      budget: '',
      paymentType: 'milestone',
      milestones: [{ id: Date.now(), name: '', amount: '', dueDate: '' }],
      attachments: [],
      allowSubcontracting: false,
    });
    setMilestoneSuggestions('');
    setContractCheckSuggestions('');
  };

  const toggleViewMode = () => {
    setCurrentViewMode((prevMode) => {
      const newMode = prevMode === 'client' ? 'contractor' : 'client';
      setActivePage('dashboard');
      setSelectedProjectId(null);
      setSearchTerm('');
      setDisputeSummary('');
      resetNewProjectForm();
      return newMode;
    });
  };

  const openProposalModal = (project) => {
    setProjectForProposal(project);
    setIsProposalModalOpen(true);
  };
  const closeProposalModal = () => {
    setIsProposalModalOpen(false);
    setProjectForProposal(null);
  };
  const handleProposalSubmit = (proposalData) => {
    console.log('Proposal Submitted:', proposalData);
    alert(
      t.applicationSubmitted.replace(
        '{projectName}',
        projectForProposal?.name || ''
      ) + ` (案件ID: ${proposalData.projectId})`
    );
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === proposalData.projectId) {
          const newProposal = {
            id: `prop${Date.now()}`,
            ...proposalData,
            contractorId: loggedInUser.id,
            contractorName: loggedInUser.name,
            contractorReputation: {
              averageScore: 4.2,
              totalReviews: 8,
              identityVerified: Math.random() > 0.5,
              skillsCertified: Math.random() > 0.7 ? ['Sample Skill'] : [],
            },
            contractorResellingRisk: Math.floor(Math.random() * 30),
            submissionDate: new Date().toISOString().split('T')[0],
            status: 'pending_review',
          };
          return { ...p, proposals: [...(p.proposals || []), newProposal] };
        }
        return p;
      })
    );
    closeProposalModal();
  };

  const openProposalDetailsModal = (proposal) => {
    setProposalForDetails(proposal);
    setIsProposalDetailsModalOpen(true);
  };
  const closeProposalDetailsModal = () => {
    setIsProposalDetailsModalOpen(false);
    setProposalForDetails(null);
  };

  const handleSelectProposal = (proposalToSelect) => {
    alert(
      t.proposalSelectedMsg.replace(
        '{contractorName}',
        proposalToSelect.contractorName
      )
    );
    let projectToNavigate;
    setProjects((prevProjects) => {
      const updatedProjects = prevProjects.map((p) => {
        if (p.id === proposalToSelect.projectId) {
          const updatedProject = {
            ...p,
            status: t.agreementPending,
            contractorId: proposalToSelect.contractorId,
            contractorName: proposalToSelect.contractorName,
            contractorResellingRisk:
              proposalToSelect.contractorResellingRisk || 0,
            totalAmount: proposalToSelect.proposedAmount || p.totalAmount,
            proposals: p.proposals.map((prop) =>
              prop.id === proposalToSelect.id
                ? { ...prop, status: 'accepted' }
                : { ...prop, status: 'archived' }
            ),
          };
          projectToNavigate = updatedProject;
          return updatedProject;
        }
        return p;
      });
      return updatedProjects;
    });

    if (projectToNavigate) {
      navigateToContractReview(projectToNavigate);
    } else {
      const foundProject = projects.find(
        (p) => p.id === proposalToSelect.projectId
      );
      if (foundProject) {
        navigateToContractReview(foundProject);
      }
    }
    closeProposalDetailsModal();
  };

  const handleCancelProposalSelection = (projectToReset) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (
          p.id === projectToReset.id &&
          (p.status === t.agreementPending || p.status === t.statusWorkReady)
        ) {
          return {
            ...p,
            status: '募集中',
            contractorId: null,
            contractorName: null,
            contractorResellingRisk: 0,
            proposals: p.proposals.map((prop) => ({
              ...prop,
              status: 'pending_review',
            })),
          };
        }
        return p;
      })
    );
    setActiveProjectDetailTab('proposals');
  };

  const handleFinalizeContract = (projectId) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId && p.status === t.agreementPending) {
          return { ...p, status: t.statusWorkReady };
        }
        return p;
      })
    );
    alert(t.contractFinalizedMessage);
    setActivePage('dashboard');
    setSelectedProjectId(null);
  };

  const openDepositModal = (project) => {
    setProjectForDeposit(project);
    setIsDepositModalOpen(true);
  };
  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setProjectForDeposit(null);
  };
  const handleExecuteDeposit = (projectId, amount) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId && p.status === t.statusWorkReady) {
          return {
            ...p,
            status: t.statusInProgress,
            fundsDeposited: p.fundsDeposited + amount,
          };
        }
        return p;
      })
    );
    alert(t.depositCompletedMessage);
    closeDepositModal();
  };

  const handleUpdateMilestoneStatus = (
    projectId,
    milestoneId,
    newStatus,
    details = {}
  ) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          let updatedFundsReleased = p.fundsReleased;
          const updatedMilestones = p.milestones.map((m) => {
            if (m.id === milestoneId) {
              const newMilestone = { ...m, status: newStatus };
              if (details.submittedFile) {
                newMilestone.submittedFiles = [
                  ...(m.submittedFiles || []),
                  {
                    name: details.submittedFile,
                    date: new Date().toISOString().split('T')[0],
                  },
                ];
                newMilestone.feedbackHistory = [
                  ...(m.feedbackHistory || []),
                  {
                    type: 'submission',
                    date: new Date().toISOString().split('T')[0],
                    comment: `${loggedInUser.name} submitted deliverables.`,
                  },
                ];
              }
              if (details.rejectionReason) {
                newMilestone.rejectionReason = details.rejectionReason;
                newMilestone.feedbackHistory = [
                  ...(m.feedbackHistory || []),
                  {
                    type: 'rejection',
                    date: new Date().toISOString().split('T')[0],
                    comment: details.rejectionReason,
                  },
                ];
              }
              if (newStatus === 'approved') {
                newMilestone.feedbackHistory = [
                  ...(m.feedbackHistory || []),
                  {
                    type: 'approval',
                    date: new Date().toISOString().split('T')[0],
                    comment: `${loggedInUser.name} approved this milestone.`,
                  },
                ];
              }
              if (newStatus === 'paid') {
                updatedFundsReleased += m.amount;
                newMilestone.paidDate = new Date().toISOString().split('T')[0];
              }
              return newMilestone;
            }
            return m;
          });
          const allMilestonesPaid = updatedMilestones.every(
            (m) => m.status === 'paid'
          );
          const newProjectStatus = allMilestonesPaid ? '完了' : p.status;
          return {
            ...p,
            milestones: updatedMilestones,
            fundsReleased: updatedFundsReleased,
            status: newProjectStatus,
          };
        }
        return p;
      })
    );
  };

  const handleSubmitNewProjectInApp = (submittedData) => {
    if (
      !submittedData.title ||
      !submittedData.description ||
      !submittedData.budget
    ) {
      alert(t.fillRequiredFieldsError);
      return;
    }
    if (submittedData.paymentType === 'milestone') {
      for (const ms of submittedData.milestones) {
        if (!ms.name || !ms.amount || !ms.dueDate) {
          alert(t.fillAllMilestoneInfoError);
          return;
        }
      }
      const totalMilestoneAmount = submittedData.milestones.reduce(
        (sum, ms) => sum + Number(ms.amount || 0),
        0
      );
      if (totalMilestoneAmount !== Number(submittedData.budget)) {
        alert(t.milestoneBudgetMismatchError);
        return;
      }
    }

    console.log('Submitting new project from App:', submittedData);
    const newProjectEntry = {
      id: `job${Date.now()}`,
      name: submittedData.title,
      clientName: loggedInUser.name,
      clientId: loggedInUser.id,
      contractorName: null,
      contractorId: null,
      contractorResellingRisk: 0,
      clientResellingRisk: Math.floor(Math.random() * 25),
      totalAmount: Number(submittedData.budget),
      fundsDeposited: 0,
      fundsReleased: 0,
      status: '募集中',
      dueDate:
        submittedData.milestones[submittedData.milestones.length - 1]
          ?.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      description: submittedData.description,
      deliverables: submittedData.deliverables,
      deliverableDetails: submittedData.deliverableDetails,
      acceptanceCriteria: submittedData.acceptanceCriteria,
      acceptanceCriteriaDetails: submittedData.acceptanceCriteriaDetails,
      scopeOfWork_included: submittedData.scopeOfWork_included,
      scopeOfWork_excluded: submittedData.scopeOfWork_excluded,
      additionalWorkTerms: submittedData.additionalWorkTerms,
      allowSubcontracting: submittedData.allowSubcontracting || false,
      agreementDocLink: null,
      changeOrders: [],
      communicationLogCount: 0,
      lastUpdate: new Date().toISOString(),
      hasDispute: false,
      milestones:
        submittedData.paymentType === 'milestone'
          ? submittedData.milestones.map((ms) => ({
              ...ms,
              amount: Number(ms.amount),
              status: 'pending',
            }))
          : [],
      requiredSkills: submittedData.category ? [submittedData.category] : [],
      clientRating: { averageScore: null, totalReviews: 0 },
      proposals: [],
    };
    setProjects((prevProjects) => [newProjectEntry, ...prevProjects]);
    alert(t.registerProjectSuccess);
    resetNewProjectForm();
    setActivePage('dashboard');
  };

  const handleCancelNewProjectInApp = () => {
    resetNewProjectForm();
    setActivePage('dashboard');
  };

  // --- Sidebar ---
  const Sidebar = ({
    t,
    isSidebarOpen,
    setIsSidebarOpen,
    loggedInUser,
    currentViewMode,
    setActivePage,
    activePage,
  }) => (
    <div
      className={`bg-gray-800 text-white ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } p-4 space-y-4 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-30`}
    >
      <div className="flex items-center justify-between mb-2">
        {isSidebarOpen && (
          <div className="flex items-center">
            <Briefcase className="h-7 w-7 mr-2 text-indigo-400" />
            <h1 className="text-xl font-semibold">{t.appName}</h1>
          </div>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded-md hover:bg-gray-700"
        >
          {isSidebarOpen ? <ChevronDown /> : <ChevronUp />}
        </button>
      </div>
      <div className="border-t border-gray-700 pt-4 mb-4">
        {isSidebarOpen && (
          <div className="text-center mb-2">
            {' '}
            <UserCircle
              size={isSidebarOpen ? 48 : 28}
              className="mx-auto mb-1 text-gray-400"
            />{' '}
            <p className="text-sm font-medium">{loggedInUser.name}</p>{' '}
            <p className="text-xs text-gray-400">
              {t.currentRoleIs}{' '}
              {currentViewMode === 'client'
                ? t.userRoleClient
                : t.userRoleContractor}
            </p>{' '}
          </div>
        )}
        {!isSidebarOpen && (
          <UserCircle
            size={28}
            className="mx-auto text-gray-400 mb-2"
            title={`${loggedInUser.name} (${t.currentRoleIs} ${
              currentViewMode === 'client'
                ? t.userRoleClient
                : t.userRoleContractor
            })`}
          />
        )}
      </div>
      <nav className="flex-grow">
        <ul>
          {[
            {
              nameKey: 'dashboard',
              icon: <Home className="h-5 w-5" />,
              page: 'dashboard',
            },
            currentViewMode === 'client'
              ? {
                  nameKey: 'newProject',
                  icon: <PlusCircle className="h-5 w-5" />,
                  page: 'newProject',
                }
              : null,
            {
              nameKey: 'messages',
              icon: <MessageSquare className="h-5 w-5" />,
              page: 'messages',
            },
            {
              nameKey: 'disputes',
              icon: <AlertTriangle className="h-5 w-5" />,
              page: 'disputes',
            },
            {
              nameKey: 'settings',
              icon: <Settings className="h-5 w-5" />,
              page: 'settings',
            },
          ]
            .filter(Boolean)
            .map((item) => (
              <li key={item.nameKey} className="mb-1.5">
                {' '}
                <button
                  onClick={() => setActivePage(item.page)}
                  className={`w-full flex items-center p-2.5 rounded-md hover:bg-gray-700 ${
                    activePage === item.page
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  } ${!isSidebarOpen ? 'justify-center' : ''}`}
                  title={isSidebarOpen ? '' : t[item.nameKey]}
                >
                  {' '}
                  {item.icon}{' '}
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm">{t[item.nameKey]}</span>
                  )}{' '}
                </button>{' '}
              </li>
            ))}
        </ul>
      </nav>
      <div className="mt-auto border-t border-gray-700 pt-3">
        <button
          className={`w-full flex items-center p-2.5 rounded-md hover:bg-gray-700 text-gray-300 hover:text-white ${
            !isSidebarOpen ? 'justify-center' : ''
          }`}
          title={isSidebarOpen ? '' : t.logout}
        >
          {' '}
          <LogOut className="h-5 w-5" />{' '}
          {isSidebarOpen && <span className="ml-3 text-sm">{t.logout}</span>}{' '}
        </button>
      </div>
    </div>
  );

  // --- Header ---
  const Header = ({
    t,
    isSidebarOpen,
    activePage,
    currentViewMode,
    toggleViewMode,
    toggleLanguage,
  }) => {
    let pageTitle = '';
    if (activePage === 'dashboard') {
      pageTitle =
        currentViewMode === 'client' ? t.dashboard : t.openProjectsDashboard;
    } else if (activePage === 'newProject' && currentViewMode === 'client') {
      pageTitle = t.newProject;
    } else if (activePage === 'contractReview') {
      pageTitle = t.contractReviewTitle;
    } else if (activePage === 'messages') {
      pageTitle = t.messages;
    } else if (activePage === 'disputes') {
      pageTitle = t.disputes;
    } else if (activePage === 'settings') {
      pageTitle = t.settings;
    }
    const roleSwitchButtonText =
      currentViewMode === 'client' ? t.viewAsContractor : t.viewAsClient;

    return (
      <header
        className="bg-white shadow-sm p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-20 h-16"
        style={{
          paddingLeft: isSidebarOpen
            ? 'calc(16rem + 1rem)'
            : 'calc(5rem + 1rem)',
          transition: 'padding-left 0.3s ease-in-out',
        }}
      >
        <div>
          {' '}
          <h2 className="text-xl font-semibold text-gray-700">
            {pageTitle}
          </h2>{' '}
        </div>
        <div className="flex items-center space-x-2 md:space-x-3">
          <button
            onClick={toggleViewMode}
            className="text-gray-600 hover:text-indigo-600 p-2 rounded-md hover:bg-gray-100 flex items-center text-xs sm:text-sm whitespace-nowrap"
            title={t.roleSwitchButton}
          >
            <Repeat size={16} className="mr-1 sm:mr-1.5 flex-shrink-0" />{' '}
            {roleSwitchButtonText}
          </button>
          <button
            onClick={toggleLanguage}
            className="text-gray-600 hover:text-indigo-600 p-2 rounded-md hover:bg-gray-100 flex items-center text-xs sm:text-sm"
          >
            <Globe size={16} className="mr-1 sm:mr-1.5 flex-shrink-0" />{' '}
            {currentLanguage === 'ja' ? 'English' : '日本語'}
          </button>
          <button className="text-gray-500 hover:text-gray-700 relative p-1">
            <Bell size={22} />
            <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </div>
      </header>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar
        t={t}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        loggedInUser={loggedInUser}
        currentViewMode={currentViewMode}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300`}
        style={{ marginLeft: isSidebarOpen ? '16rem' : '5rem' }}
      >
        <Header
          t={t}
          isSidebarOpen={isSidebarOpen}
          activePage={activePage}
          currentViewMode={currentViewMode}
          toggleViewMode={toggleViewMode}
          toggleLanguage={toggleLanguage}
        />
        <main className="flex-1 p-6 pt-20 overflow-y-auto">
          {activePage === 'dashboard' && (
            <DashboardPage
              projectsToDisplay={projectsToDisplay}
              handleProjectClick={handleProjectClick}
              selectedProjectId={selectedProjectId}
              loggedInUser={loggedInUser}
              openProposalModalFunc={openProposalModal}
              openDepositModalFunc={openDepositModal}
              t={t}
              currentLanguage={currentLanguage}
              currentViewMode={currentViewMode}
              setActivePage={setActivePage}
              setActiveProjectDetailTab={setActiveProjectDetailTab}
              activeProjectDetailTab={activeProjectDetailTab}
              handleGenerateDisputeSummary={handleGenerateDisputeSummary}
              isLoadingGemini={isLoadingGemini}
              disputeSummary={disputeSummary}
              handleUpdateMilestoneStatus={handleUpdateMilestoneStatus}
              handleSelectProposal={handleSelectProposal}
              handleCancelProposalSelection={handleCancelProposalSelection}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activePage={activePage}
              onNavigateToContractReview={navigateToContractReview}
              openProposalDetailsModal={openProposalDetailsModal}
            />
          )}
          {activePage === 'newProject' && (
            <NewProjectPage
              newProjectData={newProjectData}
              setNewProjectData={setNewProjectData}
              t={t}
              currentLanguage={currentLanguage}
              isLoadingGemini={isLoadingGemini}
              milestoneSuggestions={milestoneSuggestions}
              contractCheckSuggestions={contractCheckSuggestions}
              onGenerateMilestones={handleGenerateMilestonesForNewProject}
              onContractCheck={handleContractCheck}
              onSubmitProject={handleSubmitNewProjectInApp}
              onCancelProject={handleCancelNewProjectInApp}
            />
          )}
          {activePage === 'contractReview' && (
            <ContractReviewPage
              selectedProjectForReview={selectedProjectForReview}
              t={t}
              setActivePage={setActivePage}
              handleFinalizeContract={handleFinalizeContract}
              currentLanguage={currentLanguage}
              handleCancelProposalSelection={handleCancelProposalSelection}
              setActiveProjectDetailTab={setActiveProjectDetailTab}
            />
          )}
          {activePage === 'messages' && (
            <PlaceholderPage
              t={t}
              title={t.messages}
              icon={<MessageSquare />}
            />
          )}
          {activePage === 'disputes' && (
            <PlaceholderPage
              t={t}
              title={t.disputes}
              icon={<AlertTriangle />}
            />
          )}
          {activePage === 'settings' && (
            <PlaceholderPage t={t} title={t.settings} icon={<Settings />} />
          )}
        </main>
        <ProposalModal
          isOpen={isProposalModalOpen}
          onClose={closeProposalModal}
          onSubmit={handleProposalSubmit}
          project={projectForProposal}
          lang={currentLanguage}
          t={t}
          currentUser={loggedInUser}
        />
        <ProposalDetailsModal
          isOpen={isProposalDetailsModalOpen}
          onClose={closeProposalDetailsModal}
          proposal={proposalForDetails}
          lang={currentLanguage}
          t={t}
          onSelectProposal={handleSelectProposal}
        />
        <DepositFundsModal
          isOpen={isDepositModalOpen}
          onClose={closeDepositModal}
          project={projectForDeposit}
          lang={currentLanguage}
          t={t}
          onSubmitDeposit={handleExecuteDeposit}
        />
      </div>
    </div>
  );
}
