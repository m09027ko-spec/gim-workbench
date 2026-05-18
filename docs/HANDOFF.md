# 総診ワークベンチ ハンドオフ

> このファイルの役割: **セッション間の引き継ぎ**。直近に行った作業、決まった方針、次に進める候補を残します。新しいセッションを始める Claude（Cowork または Code）/ Codex は、まず `/AGENTS.md` を読み、その後このファイルで「前回どこまで進んだか」を把握してください。
> 関連ファイル: 常設ルールは `/AGENTS.md` と `/CLAUDE.md`、現状スナップショットは `docs/PROJECT_MAP.md`、設計判断は `docs/decisions.md`、仕様書は `docs/specs/`。

最終更新: 2026-05-17

## 現在の到達点

既存のReact/Viteアプリ「総診ワークベンチ / GIM Workbench」が、内科臨床で日常的に使える**30ツール構成**になっています。

- バックエンド・外部API・UIライブラリなし
- HashRouter、通常CSS、`localStorage` 最小利用
- 公開URL: https://m09027ko-spec.github.io/gim-workbench/
- GitHub Pages 自動デプロイ稼働中

## アーキテクチャ

ツールは `src/data/tools.ts` に `ToolDefinition` として集約され、`src/modules/miniTools/MiniToolRenderer.tsx` が共通描画します。詳細は `AGENTS.md` を参照。

## 重要な安全方針（絶対則の要約）

- 医療者向け補助ツール。臨床判断は担当医が行う
- 施設プロトコル・添付文書・最新ガイドラインを優先
- 未確認データや薬剤量はハードコードせず TODO 表示
- 患者個人情報や症例本文は入力・保存しない
- `localStorage` に保存するのは `favorites`、`recentModules`、`mini-tool:<toolId>` のみ
- 「投与する」「診断する」「中止する」などの断定表現を使わない

## TODO（仕様未確定）

| ツール | 残TODO |
| --- | --- |
| `doac-dose-check` | DOAC用量 |
| `dic-score` | DIC点数表 |
| `antibiotic-renal-dose` | 抗菌薬腎機能別用量 |
| `oral-switch` | 抗菌薬内服スイッチ候補 |
| `warfarin` | ワルファリン開始量 |
| `insulin-scale` | インスリン補正スケール |
| `sodium-correction` | 3%食塩水詳細投与量 |

## 整備の経緯（時系列）

### 2026-05-17 午前: 最低限の足場

- `/CLAUDE.md` を新規作成
- `docs/specs/` ディレクトリと `TEMPLATE.md` / `README.md` を新規作成
- 既存3ファイルの役割明記、`CLAUDE_CODE_HANDOFF.md` をリダイレクト化

### 2026-05-17 午後（前半）: 参考資料の運用とエージェント対応

- `docs/references/` を新設、`.gitignore` で Git 管理外に
- `AGENTS.md` を新規作成（全エージェント共通ルール集約）
- `/CLAUDE.md` を「AGENTS.md を読んでから Claude 固有メモを読む」構成に再編
- `docs/decisions.md` を新規作成（7項目の設計判断）
- `README.md` に「リポジトリの読み方」表を追加
- `.claude/skills/` に 3 型ぶんの作業手順スキルを作成
- `docs/specs/has-bled.md` を仕様書ドラフトとして作成（ステータス: 下書き）

### 2026-05-17 午後（後半）: Codex の30ツール一括追加

Codex が30個の内科ミニツールを `src/data/tools.ts` に追加。検証の結果、ビルド・テストは通過し、絶対則の主要部分は守られていましたが、以下の規約違反・機能消失がありました。

**Codex の主な変更**

- アーキテクチャを「3型固定・個別コンポーネント」→「`ToolDefinition` 駆動・共通レンダラー」へ変更
- 30ツールを `src/data/tools.ts` に集約、`MiniToolRenderer.tsx` で共通描画
- カテゴリ体系を 7 → 8 カテゴリに再編（「教育・カンファ」「学習アプリ」が消滅）
- 共通UI（DisclaimerBox / NumberInput / ResultCard / SelectInput）と型 (`ToolDefinition` 等)を新規追加
- `calculations.ts` / `antibioticRenalDosing.ts` / `checklistItems.ts` / `doacRules.ts` / `steroidEquivalence.ts` を新規追加
- HAS-BLED 仕様書のステータスを「下書き」→「実装済み」へ独断変更
- `TEMPLATE.md` / `WORKFLOW.md` / `specs/README.md` を新方式に独断書き換え

**検出された問題**

1. 退院サマリ・紹介元返書を `tools.ts` に統合し忘れ、機能から消失
2. 既存7モジュールの個別コンポーネントが孤児ファイル化
3. HAS-BLED 仕様書のステータス改ざん（先生レビュー前に「実装済み」へ）
4. モジュールID横串原則の違反（仕様書 `has-bled` ↔ 実装 `af-risk`）
5. アーキテクチャの独断変更（絶対則7違反の疑い）
6. カテゴリ「教育」「学習」の消滅
7. `calculations.ts` と `scoring.ts` の重複並走

### 2026-05-17 午後（さらに後）: Cowork による事後整備

- `AGENTS.md` を新アーキテクチャ用に再編。「3型」→「型ファミリー（計算・スコア / チェックリスト / 安全なTODO雛形）」、絶対則7を強化（「大きなアーキテクチャ再設計を独断で進めない」）
- `docs/specs/TEMPLATE.md` / `docs/specs/README.md` を整理（受け入れ基準・参考文献欄・設計判断メモ欄を復元）
- `docs/specs/has-bled.md` を削除し、`docs/specs/af-risk.md` を逆抽出仕様書として作成。ステータスを「下書き」に差し戻し
- `docs/specs/discharge-summary.md` と `docs/specs/referral-reply.md` を逆抽出仕様書として作成
- `docs/decisions.md` に4エントリ追加
- `docs/specs/_cleanup-codex.md` を改修指示書として作成
- `docs/PROJECT_MAP.md` を新状態に更新

## 次に進めるなら

### 短期（先生）

1. `docs/specs/af-risk.md` をレビューし、ステータスを「下書き」→「確定」へ進める判断
   - 統合の妥当性、入力欄補足の表現、修正可能因子ハイライト機能の要否などを確認
2. `docs/specs/discharge-summary.md` と `docs/specs/referral-reply.md` を確認

### 中期（Claude Code に依頼）

`docs/specs/_cleanup-codex.md` の改修項目を順に。優先順:

1. ★1 退院サマリ・紹介元返書を `tools.ts` に統合
2. ★2 カテゴリ「教育・カンファ」「学習アプリ」を `categories.ts` に追加
3. ★3 孤児ファイル削除
4. ★4 `scoring.ts` を `calculations.ts` に1本化
5. ★5 `af-risk` の改修（**先生レビュー後**）
6. ★6 テスト追加
7. ★7 `dist/` 再生成

### 長期（Cowork ↔ 先生）

- 残TODOツール（DOAC用量、抗菌薬腎機能別用量など）の仕様確定
- 「教育・カンファ」「学習アプリ」カテゴリ用の新ツール仕様書を作成

## 検証コマンド

```bash
cd "/Users/osadakentarou/Library/Mobile Documents/com~apple~CloudDocs/Chat GPT/総合診療科WB"
git status --short
npm test
npm run build
```

ビルド成功 + テスト成功を維持したまま改修を進めてください。
