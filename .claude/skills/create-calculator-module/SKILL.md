---
name: create-calculator-module
description: 計算型モジュール（スコアリング）を既存パターン通りに新規作成する。仕様書 docs/specs/<module-id>.md に「型: 計算型」と書かれた依頼を受けたときに起動する。
---

# Create Calculator Module

計算型モジュール（CURB-65、HAS-BLED など臨床スコア）を新規作成する手順。

## 前提

- `docs/specs/<module-id>.md` が「確定」ステータスで存在すること
- 仕様書の「型」が「計算型」になっていること
- 仕様書に「スコア定義」（入力項目・配点・合計範囲・解釈表）が記載されていること
- AGENTS.md の絶対則を遵守すること

満たさない場合は実装に進まずユーザーに確認。

## 入力

- `docs/specs/<module-id>.md`（必須）
  - メタ情報（id, 表示名, カテゴリ）
  - スコア定義（入力項目一覧と配点）
  - スコア合計と解釈表（〇点→低リスク、など）
  - 推奨アクション（業務補助表現で）

## 参考にする既存実装

- `src/modules/calculators/Curb65.tsx`（シンプルな bool 入力のみ）
- `src/modules/calculators/Cha2ds2Vasc.tsx`（多項目）

仕様書で別の参考実装が指定されていればそれを優先。

## 共通部品

- `src/utils/scoring.ts` — スコア計算関数を集約
- `src/components/CopyButton.tsx` — 結果のコピー（必要なら）
- `src/components/SectionCard.tsx` — 入力欄の枠

## 手順

1. 仕様書を読む
   - 入力項目（bool / 数値 / 選択）と配点
   - 合計範囲と解釈の閾値
   - 推奨アクション表現
2. `src/utils/scoring.ts` に計算関数を追加
   - `calculate<ScoreName>(input): { score: number, risk: "low" | "moderate" | "high" }` の形式
   - 入力型と返却型を export
3. `src/data/catalog/calculators.ts` を編集
   - 既存の `status: "planned"` エントリを `status: "available"` に変更
   - エントリがなければ追加
4. `src/modules/calculators/<ComponentName>.tsx` を新規作成
   - 既存の `Curb65.tsx` をコピーして雛形に
   - 入力欄（チェックボックス・ラジオ等）を仕様書通りに配置
   - `calculate<ScoreName>` を呼び出して結果表示
   - 結果には「スコア」「解釈」「推奨アクション（業務補助表現）」を出す
5. `src/pages/ModulePage.tsx` の `implementedModules` に登録
6. `npm run build` を通す
7. `docs/PROJECT_MAP.md` を更新
8. `docs/HANDOFF.md` を更新
9. 仕様書のステータスを「実装済み」に更新
10. ユーザーに完了報告

## 単一HTML版の更新（任意）

ユーザーから希望があれば `npm run build:portable` を実行。

## チェックポイント

- [ ] スコア計算が仕様書通りか（境界値・上限・下限）
- [ ] 解釈の閾値が仕様書通りか
- [ ] 推奨アクションが業務補助表現になっているか（断定表現禁止）
- [ ] 参考文献の引用（コメントで原典）を残したか
- [ ] `npm run build` が成功したか
- [ ] PROJECT_MAP.md と HANDOFF.md を更新したか

## やってはいけないこと

- 仕様書にない閾値を勝手に追加する
- 入力欄に患者個人情報を求める（氏名・ID・生年月日 等）
- 「投与する」「禁忌である」などの断定表現を結果に出す
- 計算ロジックをコンポーネント内に直書きする（`src/utils/scoring.ts` に分離する）
