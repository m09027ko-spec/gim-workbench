# 仕様書（specs）

このフォルダは、Coworkが医学的妥当性や施設プロトコルを整理し、コーディングエージェントが読むための仕様書置き場です。

現在の実装は、30ツールを `src/data/tools.ts` に集約する方式です。

## ファイル名

- `<tool-id>.md` の形式にする。
- `<tool-id>` は `src/data/tools.ts` の `id` と一致させる。
- 例: `has-bled.md`, `doac-dose-check.md`

## 使い方

1. Coworkが `TEMPLATE.md` をコピーして `<tool-id>.md` を作る。
2. ユーザーが医学的妥当性と施設ルールを確認する。
3. コーディングエージェントが `src/data/tools.ts`、`src/utils/calculations.ts`、必要な `src/data/*.ts` を更新する。
4. `npm test` と `npm run build` を通す。

ユーザーが詳細仕様を直接提示した場合は、その依頼文を仕様として扱えます。未確認の薬剤量・点数表・施設差が大きい値はTODO表示にしてください。
