# 総診ワークベンチ プロジェクトマップ

> このファイルの役割: **現状スナップショット**。カテゴリ・ツール件数・実装方針・主要ファイルを「今どうなっているか」の視点でまとめます。ツールを追加・改修したときは、このファイルを更新してください。
> 関連ファイル: 常設ルールは `/AGENTS.md` と `/CLAUDE.md`、設計判断は `docs/decisions.md`、引き継ぎは `docs/HANDOFF.md`、仕様書は `docs/specs/`。

## 目的

総合診療医のための業務補助 Web アプリ。計算・スコア・チェックリスト・薬剤確認・文書テンプレートを病棟・外来・救急で素早く使うことを想定。臨床判断を自動化しません。医療者向け補助・教育ツールです。

- 公開URL: https://m09027ko-spec.github.io/gim-workbench/
- リポジトリ: https://github.com/m09027ko-spec/gim-workbench

## 現在の内容

- アプリ名: 総診ワークベンチ / GIM Workbench
- カテゴリ: 10件（計算、スコア、薬剤、救急、病棟、外来、高齢者、書類・説明、教育・カンファ、学習アプリ）※`education` / `learning` は改修後復活予定
- 登録ツール: 30件（`src/data/tools.ts` 集約）
- バックエンド: なし
- 外部API: なし

## 改修中の項目（2026-05-17 時点）

仕様書ベースで Claude Code に依頼する改修が `docs/specs/_cleanup-codex.md` にまとまっています。

- 退院サマリ（`discharge-summary`）・紹介元返書（`referral-reply`）を `tools.ts` に統合し、機能を復元
- カテゴリ「教育・カンファ」「学習アプリ」を `categories.ts` に追加
- 既存の孤児ファイル（`src/modules/{ward,calculators,documents}/*.tsx`）7件を削除
- `src/utils/scoring.ts` と `src/utils/calculations.ts` の重複を `calculations.ts` に1本化
- `af-risk` ツールを仕様書（`docs/specs/af-risk.md`）通りに改修（先生レビュー後）

## 実装方針

- 全ツールを `src/data/tools.ts` に `ToolDefinition` として登録（**定義駆動アーキテクチャ**）
- 入力欄、結果表示、解釈、注意点、参考情報、免責表示は `MiniToolRenderer` で共通化
- 計算式は `src/utils/calculations.ts` に純粋関数として分離
- データ表（薬剤量・換算表など）は `src/data/<name>.ts` に分離
- 薬剤量や施設差が大きい項目は、未確認値をハードコードせず `todos[]` で TODO 表示
- `localStorage` に保存してよいのは `favorites` / `recentModules` / `mini-tool:<toolId>`（チェックリスト状態）のみ

## 主要ファイル

| パス | 役割 |
| --- | --- |
| `src/data/tools.ts` | 30ツールの `ToolDefinition` 定義 |
| `src/data/catalog/categories.ts` | カテゴリ定義（現状8、改修で10） |
| `src/data/catalog/index.ts` | `moduleDefinitions = miniToolModules` ブリッジ |
| `src/data/modules.ts` | 画面側が読む検索・取得API |
| `src/data/antibioticRenalDosing.ts` | 抗菌薬腎機能用量データ |
| `src/data/checklistItems.ts` | チェックリスト項目データ |
| `src/data/doacRules.ts` | DOAC ルール |
| `src/data/steroidEquivalence.ts` | ステロイド換算表 |
| `src/types/tool.ts` | `ToolDefinition` の型 |
| `src/types/module.ts` | `AppModule` / `AppCategory` の型 |
| `src/modules/miniTools/MiniToolRenderer.tsx` | 共通レンダラー |
| `src/pages/ModulePage.tsx` | `MiniToolRenderer` への薄いラッパ |
| `src/components/` | 共通UI（NumberInput, SelectInput, ResultCard, DisclaimerBox 等） |
| `src/utils/calculations.ts` | 計算ロジック（純粋関数） |
| `scripts/test-calculations.mjs` | 計算ロジックの spot check |
| `portable/gim-workbench.html` | 単一HTML配布物 |
| `docs/specs/` | ツール仕様書 |
| `docs/references/` | 参考資料置き場（Git管理外） |

## 実装済みツール一覧（30件）

| # | ツールID | 表示名 | 主カテゴリ |
| --- | --- | --- | --- |
| 1 | `steroid-converter` | ステロイド換算ツール | 薬剤 |
| 2 | `doac-dose-check` | 腎機能別DOAC用量チェック | 薬剤・計算 |
| 3 | `renal-function` | CCr / eGFR / Cockcroft-Gault計算 | 計算 |
| 4 | `sodium-correction` | Na補正式ツール | 計算・救急 |
| 5 | `blood-gas` | 血液ガス簡易解釈ツール | 計算・救急 |
| 6 | `anion-gap` | アニオンギャップ計算ツール | 計算 |
| 7 | `pneumonia-severity` | 肺炎重症度スコア | スコア・救急 |
| 8 | `centor-mcisaac` | Centor / McIsaacスコア | スコア・外来 |
| 9 | `pe-wells-perc` | Wells / PERC / D-dimer判断ツール | スコア・救急 |
| 10 | `heart-score` | HEARTスコア | スコア・救急 |
| 11 | `af-risk` | CHA₂DS₂-VASc / HAS-BLED | スコア・薬剤 |
| 12 | `chads-comparison` | CHADS₂ / CHA₂DS₂-VASc比較表示 | スコア |
| 13 | `child-pugh` | Child-Pugh分類 | スコア |
| 14 | `fib4` | FIB-4 index | 計算 |
| 15 | `meld-na` | MELD-Na計算 | 計算 |
| 16 | `sepsis-scores` | qSOFA / SIRS / NEWS2 | スコア・救急 |
| 17 | `dic-score` | DICスコア雛形 | スコア |
| 18 | `constipation` | 便秘薬・下剤選択支援 | 薬剤 |
| 19 | `delirium-risk-meds` | 不眠薬・せん妄リスク薬チェック | 高齢者・薬剤 |
| 20 | `antibiotic-renal-dose` | 抗菌薬腎機能用量チェック | 薬剤・計算 |
| 21 | `oral-switch` | 抗菌薬内服スイッチ候補 | 薬剤 |
| 22 | `warfarin` | ワルファリン開始・調整メモ | 薬剤 |
| 23 | `insulin-scale` | インスリン補正スケール作成 | 薬剤 |
| 24 | `admission-orders` | 入院時オーダーチェックリスト | 病棟 |
| 25 | `discharge-checklist` | 退院前チェックリスト | 病棟・書類 |
| 26 | `delirium-causes` | せん妄原因検索チェックリスト | 高齢者・病棟 |
| 27 | `aspiration-pneumonia` | 誤嚥性肺炎包括管理チェックリスト | 病棟 |
| 28 | `urinary-retention` | 尿閉対応チェックリスト | 病棟・救急 |
| 29 | `anemia-fit` | 便潜血陽性・貧血外来の初期整理 | 外来 |
| 30 | `transfusion` | 輸血適応チェックツール | 病棟 |

## 改修で追加予定のツール

| ツールID | 表示名 | 主カテゴリ | 状況 |
| --- | --- | --- | --- |
| `discharge-summary` | 退院サマリ下書き | 書類・説明・病棟 | 仕様書あり、`tools.ts` 統合待ち |
| `referral-reply` | 紹介元返書 | 書類・説明・外来 | 仕様書あり、`tools.ts` 統合待ち |

## TODOを残している領域（仕様未確定・施設依存）

- DOAC用量
- 抗菌薬腎機能別用量
- 抗菌薬内服スイッチ候補薬
- DIC点数表
- ワルファリン開始量
- インスリン補正スケール
- 3%食塩水の詳細投与量

## 検証コマンド

```bash
npm install
npm test          # 計算ロジックの spot check
npm run build     # 型チェック + ビルド
npm run build:portable  # 単一HTML版の再生成
```
