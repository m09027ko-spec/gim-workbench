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
