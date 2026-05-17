---
name: create-document-module
description: 文書型モジュール（退院サマリ・返書・診療情報提供書など）を既存パターン通りに新規作成する。仕様書 docs/specs/<module-id>.md に「型: 文書型」と書かれた依頼を受けたときに起動する。
---

# Create Document Module

文書型モジュール（退院サマリ下書き、紹介元返書 など）を新規作成する手順。

## 前提

- `docs/specs/<module-id>.md` が「確定」ステータスで存在すること
- 仕様書の「型」が「文書型」になっていること
- 仕様書に「テンプレート設計」（入力欄一覧と出力テンプレート）が記載されていること
- AGENTS.md の絶対則を遵守すること

満たさない場合は実装に進まずユーザーに確認。

## 入力

- `docs/specs/<module-id>.md`（必須）
  - メタ情報（id, 表示名, カテゴリ）
  - 入力欄一覧（ラベル・入力形式・必須/任意）
  - 出力テンプレート（プレースホルダ付き）

## 参考にする既存実装

- `src/modules/documents/DischargeSummary.tsx`
- `src/modules/documents/ReferralReply.tsx`

仕様書で別の参考実装が指定されていればそれを優先。

## 共通部品

- `src/utils/textTemplates.ts` — テンプレート生成関数を集約
- `src/components/CopyButton.tsx` — 生成結果をクリップボードへコピー
- `src/components/SectionCard.tsx` — 入力欄の枠

## 手順

1. 仕様書を読む
   - 入力欄の項目・形式（1行 / 複数行）
   - 出力テンプレートとプレースホルダ
2. `src/utils/textTemplates.ts` にテンプレート関数を追加
   - `generate<DocName>(input): string` の形式
   - 入力型を export
   - 空欄時はその行を出力から省くか、空のまま残すかを仕様書に従う
3. `src/data/catalog/documents.ts` を編集
   - 既存の `status: "planned"` エントリを `status: "available"` に変更
   - エントリがなければ追加
4. `src/modules/documents/<ComponentName>.tsx` を新規作成
   - 既存の `DischargeSummary.tsx` をコピーして雛形に
   - 入力欄を仕様書通りに配置（React state で保持）
   - **入力値を localStorage に保存しない**（絶対則）
   - `generate<DocName>` を呼び出して結果を表示
   - `CopyButton` で結果をコピー可能に
5. `src/pages/ModulePage.tsx` の `implementedModules` に登録
6. `npm run build` を通す
7. `docs/PROJECT_MAP.md` を更新
8. `docs/HANDOFF.md` を更新
9. 仕様書のステータスを「実装済み」に更新
10. ユーザーに完了報告

## 単一HTML版の更新（任意）

ユーザーから希望があれば `npm run build:portable` を実行。

## チェックポイント

- [ ] 入力欄の項目・順序が仕様書通りか
- [ ] 出力テンプレートのプレースホルダがすべて埋まる経路があるか
- [ ] 入力値が localStorage に保存されていないことを確認したか（絶対則）
- [ ] コピー機能（CopyButton）が動くか
- [ ] 「診断する」「投与する」など断定表現が混ざっていないか
- [ ] `npm run build` が成功したか
- [ ] PROJECT_MAP.md と HANDOFF.md を更新したか

## やってはいけないこと

- 入力値を localStorage / IndexedDB / Cookie に保存する（絶対則）
- 入力欄に「患者氏名」「患者ID」「生年月日」「住所」「電話番号」「カルテ番号」のラベルを置く
- 自由記載欄を「下書き保存」する機能を付ける
- 出力テンプレートに「診断する」「投与する」などの断定表現を入れる
