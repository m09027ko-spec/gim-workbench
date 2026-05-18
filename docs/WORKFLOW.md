# WORKFLOW: Cowork ↔ コーディングエージェント の協働

このファイルは、総診ワークベンチを更新するときの役割分担を定義します。実装ルールは `AGENTS.md`、現状確認は `docs/PROJECT_MAP.md`、直近作業は `docs/HANDOFF.md` を参照してください。

## 役割分担

| 担当 | 主な責務 |
| --- | --- |
| Cowork | 医学的妥当性の整理、施設プロトコル・参考資料の要約、仕様書作成 |
| コーディングエージェント | `src/data/tools.ts`、`src/utils/calculations.ts`、関連データファイルの実装、テスト、ビルド確認 |
| ユーザー | 医学的妥当性、施設運用、公開・コミットの最終判断 |

## 標準フロー

1. ユーザーがツール追加・修正内容を指定する。
2. 仕様が曖昧な場合はCoworkで `docs/specs/<tool-id>.md` を作る。
3. ユーザーが詳細仕様を直接提示した場合は、その依頼文を仕様として扱える。
4. コーディングエージェントは `AGENTS.md` の安全則に従って実装する。
5. 計算式は `src/utils/calculations.ts`、薬剤データは `src/data/*.ts`、画面定義は `src/data/tools.ts` に置く。
6. 未確認の薬剤量・点数表・施設依存データはTODOとして表示する。
7. `npm test` と `npm run build` を通す。
8. 必要なら `npm run build:portable` で単一HTML版を更新する。
9. `docs/PROJECT_MAP.md` と `docs/HANDOFF.md` を更新する。

## 1モジュールずつの運用とエージェント振り分け

モジュールは**1つずつ**追加する。エラーを減らす「封筒」はエージェントにも作業場所にも依存しない共通ルール:

1. **コードを書く前に確定 spec**。`docs/specs/<tool-id>.md` を数値・出典入りで「確定」にする。会話ベースの依頼で spec が無いときは `deep-research-intake` スキルに従い、必要数値の調査ブリーフを出してユーザーが ChatGPT Deep Research(Pro) で集めたレポートを経由する（Cowork での spec 作成は任意。ユーザーが自分で Deep Research する運用が既定）。
2. **1モジュール = 1ブランチ = 小さな差分**、`npm test` / `npm run build` 緑で**1コミット**。複数モジュールを1バッチにまとめない。
3. **アーキテクチャ変更は禁止**（必要ならユーザー確認＋ `docs/decisions.md` 記録）。

### 担当の振り分け

| 作業場所 | 既定エージェント | 注意 |
| --- | --- | --- |
| 自宅 | Claude Code 直 | 上記封筒に従う |
| 外出先 | Codex リモート（クラウド） | 上記封筒に従う。プロンプトでスコープを明示的に縛る |

2026-05-17 の Codex 30ツール一括追加の事故（機能消失・孤児ファイル・重複・仕様書改ざん）は「Codex だから」ではなく「**確定仕様なしの大バッチ＋アーキ裁量**」が原因。封筒さえ守ればエージェント/場所に依存せず事故率は下がる。

### Codex に渡すときのプロンプト必須項目

外出先で Codex（特にリモート）に作業を渡すときは、以下を必ずプロンプトに明記する:

- 対象は **この仕様書1本のみ**（`docs/specs/<tool-id>.md` を指定）
- **アーキテクチャ変更禁止**（既存の `ToolDefinition` / 共通レンダラーパターンに従う）
- **1コミット**、`AGENTS.md` のコミット規約・`[codex]` ラベル
- `npm test` と `npm run build` を通すこと
- 仕様書ステータスを勝手に「実装済み」へ上げない（ユーザー確定後のみ）

## どこに何を書くか

| 情報 | 置き場所 |
| --- | --- |
| 30ツールの定義 | `src/data/tools.ts` |
| 計算式 | `src/utils/calculations.ts` |
| ステロイド換算表 | `src/data/steroidEquivalence.ts` |
| DOAC確認TODO | `src/data/doacRules.ts` |
| 抗菌薬腎機能用量TODO | `src/data/antibioticRenalDosing.ts` |
| チェックリスト項目 | `src/data/checklistItems.ts` |
| 共通ツール画面 | `src/modules/miniTools/MiniToolRenderer.tsx` |
| 現状スナップショット | `docs/PROJECT_MAP.md` |
| 直近作業履歴 | `docs/HANDOFF.md` |

## 判断基準

| 状況 | 対応 |
| --- | --- |
| 薬剤量や施設ルールが未確認 | 数値を入れずTODO表示 |
| 医療判断を自動決定する表現になりそう | 「確認」「検討」「補助」に言い換える |
| 患者個人情報を保存しそう | 実装しない |
| 外部APIやUIライブラリが必要そう | 実装前にユーザー確認 |
| `npm test` または `npm run build` が通らない | 完了扱いにしない |
