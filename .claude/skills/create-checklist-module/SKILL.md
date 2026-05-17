---
name: create-checklist-module
description: チェックリスト型モジュールを既存パターン通りに新規作成する。仕様書 docs/specs/<module-id>.md に「型: チェックリスト型」と書かれた依頼を受けたときに起動する。
---

# Create Checklist Module

チェックリスト型モジュールを新規作成する手順。

## 前提

- `docs/specs/<module-id>.md` が「確定」ステータスで存在すること
- 仕様書の「型」が「チェックリスト型」になっていること
- AGENTS.md の絶対則を遵守すること

満たさない場合は実装に進まずユーザーに確認。

## 入力

- `docs/specs/<module-id>.md`（必須）
  - メタ情報（id, 表示名, カテゴリ）
  - セクション分けされたチェック項目リスト
  - 参考にする既存実装の指定

## 参考にする既存実装

- `src/modules/ward/AdmissionChecklist.tsx`（最小構成）
- `src/modules/ward/DischargeChecklist.tsx`（同様）
- `src/modules/ward/AspirationPneumonia.tsx`（セクションが多い場合）

仕様書で別の参考実装が指定されていればそれを優先。

## 共通部品

- `src/components/Checklist.tsx` — チェック項目とチェック状態管理
- `src/components/SectionCard.tsx` — セクション単位の枠
- `src/utils/storage.ts` — チェック状態の localStorage 保存

## 手順

1. 仕様書を読む
   - モジュールID、カテゴリ、セクション構成、項目を把握
2. `src/data/catalog/<category>.ts` を編集
   - 既存の `status: "planned"` エントリを `status: "available"` に変更
   - エントリがなければ追加
3. `src/modules/<category>/<ComponentName>.tsx` を新規作成
   - 既存の `AdmissionChecklist.tsx` をコピーして雛形に
   - セクション配列を仕様書通りに差し替え
   - `Checklist` コンポーネントに項目を渡す
   - localStorage キーは `checklist:<module-id>` に統一
4. `src/pages/ModulePage.tsx` の `implementedModules` に登録
   - `"<module-id>": <ComponentName>` を追加
   - import 文も追加
5. `npm run build` を通す
   - 型エラー・警告を握りつぶさない
6. `docs/PROJECT_MAP.md` を更新
   - 件数（実装済み / 近日追加予定）を再計算
   - 実装済みモジュール表に1行追加
7. `docs/HANDOFF.md` を更新
   - 「直近の確認結果」に作業日と確認内容
   - 「次に進めるなら」を必要なら更新
8. 仕様書のステータスを「実装済み」に更新
9. ユーザーに完了報告
   - 何を変えたか、何を確認したかを簡潔に

## 単一HTML版の更新（任意）

ユーザーから希望があれば `npm run build:portable` を実行して `portable/gim-workbench.html` を再生成。

## チェックポイント

- [ ] 仕様書のチェック項目を漏れなく反映したか
- [ ] セクションの順序が仕様書通りか
- [ ] localStorage キーがほかのモジュールと衝突していないか
- [ ] `npm run build` が成功したか
- [ ] PROJECT_MAP.md と HANDOFF.md を更新したか

## やってはいけないこと

- 仕様書にない項目を勝手に追加する
- チェック項目に患者個人情報入力欄（氏名・ID等）を混ぜる
- 「診断する」「投与する」のような断定表現を入れる（「検討」「確認」に置き換える）
