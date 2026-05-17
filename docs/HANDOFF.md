# 総診ワークベンチ ハンドオフ

作成日: 2026-05-17

## 現在の到達点

既存のReact/Viteアプリ「総診ワークベンチ / GIM Workbench」を、内科臨床で日常的に使える30ツール構成に拡張しました。

バックエンド、外部API、UIライブラリは使っていません。HashRouter、通常CSS、localStorage最小利用の構成です。

## 重要な安全方針

- 医療者向け補助ツールであり、最終判断は担当医が行う。
- 施設プロトコル・添付文書・最新ガイドラインを優先。
- 未確認データや薬剤量は仮実装せず、TODOとして明示。
- 患者個人情報や症例本文は入力・保存しない。
- localStorageに保存するのは `favorites`、`recentModules`、チェックリスト状態のみ。

## 実装内容

- トップページに30ツールをカード表示
- カテゴリ絞り込み
  - 計算、スコア、薬剤、救急、病棟、外来、高齢者、書類・説明
- キーワード検索
- お気に入り登録
- 最近使ったツール
- 各ツールページの共通構成
  - 用途
  - 入力欄
  - 結果表示
  - 解釈
  - 注意点
  - 参考情報・根拠欄
  - 免責表示
- 単一HTML版 `portable/gim-workbench.html` を再生成済み
- GitHub Pages更新後の白画面対策として、Service Workerをcache-firstからnetwork-firstへ変更済み

## 主要ファイル

| パス | 役割 |
| --- | --- |
| `src/data/tools.ts` | 30ツールの定義、入力項目、結果ロジック |
| `src/data/catalog/categories.ts` | 8カテゴリ定義 |
| `src/data/modules.ts` | 画面側から使う検索・取得API |
| `src/modules/miniTools/MiniToolRenderer.tsx` | 共通ツール画面 |
| `src/utils/calculations.ts` | 計算式 |
| `src/data/steroidEquivalence.ts` | ステロイド換算テーブル |
| `src/data/doacRules.ts` | DOAC確認TODO |
| `src/data/antibioticRenalDosing.ts` | 抗菌薬腎機能用量TODO |
| `src/data/checklistItems.ts` | チェックリスト項目 |
| `public/sw.js` | GitHub Pages/PWA用Service Worker。更新後の白画面を避けるためnetwork-first |
| `scripts/test-calculations.mjs` | 計算テスト |
| `docs/PROJECT_MAP.md` | 現状スナップショット |

## TODOとして残した領域

薬剤量や施設差が大きい以下は、未確認の数値を入れずTODO表示にしています。

- DOAC用量
- DIC点数表
- 抗菌薬腎機能別用量
- 抗菌薬内服スイッチ候補
- ワルファリン開始量
- インスリン補正スケール
- 3%食塩水詳細投与量

## 直近の確認結果

```bash
npm test
npm run build
npm run build:portable
```

上記3つは成功済みです。

2026-05-17追記: `dist` をローカルHTTPサーバーで開き、トップページが白画面にならず30/30ツールを表示することを確認済みです。

## 再開時の最初の確認

```bash
cd "/Users/osadakentarou/Library/Mobile Documents/com~apple~CloudDocs/Chat GPT/総合診療科WB"
git status --short
npm test
npm run build
```
