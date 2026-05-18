# Codex 後始末・改修指示書

> **対象エージェント**: Claude Code
> **作成者**: Cowork（2026-05-17）
> **目的**: Codex の30ツール一括追加で生じた規約逸脱・機能消失・実装の仕様書未追従を是正する

このファイルはツール仕様書ではなく、**横断的な改修指示書**です（ファイル名先頭の `_` で区別）。完了後は削除しても、`docs/specs/_archive/` に移しても構いません。

---

## 前提として読むファイル

1. `AGENTS.md`（2026-05-17 更新の新アーキテクチャ規約）
2. `docs/decisions.md` の末尾4エントリ（Codex 作業の事後承認、退院サマリ復元、ステータス差し戻し、10カテゴリ化）
3. `docs/specs/af-risk.md`
4. `docs/specs/discharge-summary.md`
5. `docs/specs/referral-reply.md`

---

## 改修項目（優先順）

### ★1. 退院サマリ・紹介元返書を `tools.ts` に統合（機能復元・最優先）

仕様書通りに `ToolField` 型に `textarea` バリアントを追加してから、`tools.ts` に2ツールを追加します。

1. `src/types/tool.ts` の `ToolField` 共用体に `textarea` バリアントを追加
   ```ts
   | {
       type: "textarea";
       id: string;
       label: string;
       rows?: number;
       placeholder?: string;
       help?: string;
     }
   ```
2. `src/modules/miniTools/MiniToolRenderer.tsx` の `FieldControl` に `textarea` 分岐を追加（既存の `NumberInput` パターンを参考に、新コンポーネント `TextareaInput.tsx` を作るか、インラインで実装）
3. `src/modules/miniTools/MiniToolRenderer.tsx` の `buildInitialValues` で `textarea` の初期値を `""` に
4. `src/data/tools.ts` に `discharge-summary` と `referral-reply` の `ToolDefinition` を追加
   - 出力テンプレート関数は `src/utils/textTemplates.ts` の既存 `buildDischargeSummary` / `buildReferralReply` を**再利用**（コピペせず import）
   - `calculate()` 内で関数を呼んで `copyText` に詰める
5. 既存の `src/modules/documents/DischargeSummary.tsx` と `src/modules/documents/ReferralReply.tsx`（孤児ファイル）を削除
6. `categoryIds` は `["documents", "ward"]` / `["documents", "outpatient"]`

### ★2. カテゴリ「教育・カンファ」「学習アプリ」を復活

`src/data/catalog/categories.ts` に2カテゴリを追加（既存の8カテゴリの末尾に）。

```ts
{
  id: "education",
  title: "教育・カンファ",
  description: "症例カンファ・教育コンテンツ",
  iconLabel: "教",
  path: "/category/education",
  colorTone: "purple",  // 色は任意。既存と被らないものを
},
{
  id: "learning",
  title: "学習アプリ",
  description: "研修医向け学習・反復演習",
  iconLabel: "学",
  path: "/category/learning",
  colorTone: "teal",
},
```

このカテゴリに属する具体的なツールは別途仕様書ベースで追加するので、今は**カテゴリ定義の追加だけ**でよい。

### ★3. 既存の孤児ファイルを削除

以下7ファイルは ModulePage から呼ばれず、Codex の作業で完全に死んでいます。削除してください。

- `src/modules/calculators/Curb65.tsx`
- `src/modules/calculators/Cha2ds2Vasc.tsx`
- `src/modules/ward/AdmissionChecklist.tsx`
- `src/modules/ward/DischargeChecklist.tsx`
- `src/modules/ward/AspirationPneumonia.tsx`
- `src/modules/documents/DischargeSummary.tsx`（★1で削除済みなら不要）
- `src/modules/documents/ReferralReply.tsx`（★1で削除済みなら不要）

加えて、`src/data/catalog/calculators.ts` などの旧カテゴリ別ファイルが残っていないか確認（`src/data/catalog/index.ts` が `miniToolModules` に切り替わっているはずなので、旧ファイルは既に削除されている可能性が高い）。

### ★4. `calculations.ts` と `scoring.ts` の重複整理

`src/utils/scoring.ts` には `calculateCurb65` / `calculateCha2ds2Vasc` があり、`src/utils/calculations.ts` には `calculateCha2ds2VascScore` / `calculateChads2Score` などがあります。同じ計算が二系統で並走しています。

- `tools.ts` から呼ばれているのは `calculations.ts` の関数
- `scoring.ts` は孤児ファイルから呼ばれていただけ
- → `src/utils/scoring.ts` を**削除**して `calculations.ts` に1本化
- ただし、`scoring.ts` 側の `Curb65Result` のような「結果オブジェクト型」を持つ実装が `calculations.ts` に無い場合は、必要に応じて関数を移植する
- `Curb65` 計算は現状 `pneumonia-severity` ツール内で間接的に表現されていないので、`calculateCurb65` を `calculations.ts` に移して `tools.ts` から参照する余地があるかどうかも確認

### ★5. `af-risk` ツールを仕様書通りに改修

`docs/specs/af-risk.md` の「既存実装との差分」セクションに改修対象が列挙してあります。

1. `fields[]` の各 checkbox に `help` プロパティを追加（補足表示）
2. `cautions` を完全版に置き換え:
   > 「HAS-BLED は抗凝固を中止するためのスコアではありません。CHA₂DS₂-VASc と合わせて、リスク・ベネフィットを総合的に評価してください。修正可能なリスク因子（B/L/D：出血歴・INR不安定・併用薬/アルコール）に注目するための補助ツールです。」
3. 修正可能因子（B/L/D）のハイライト機能を追加
4. `referenceInfo[]` に原典2本（Pisters 2010 / Lip 2010）を追加

ただし、★5は**先生のレビュー後**に着手してください。`af-risk.md` のステータスが「下書き」→「確定」に変わるまで実装しないこと。

### ★6. 単体テスト追加

`scripts/test-calculations.mjs` は spot check のみ。新規追加 / 改修した計算関数があれば、テストケースを追加してください。特に：

- `discharge-summary` / `referral-reply` は計算ではなくテンプレート生成なので、必要に応じて出力文字列の検証を追加してもよい（任意）

### ★7. `dist/` を再生成

★1〜★5 完了後、`npm run build` と `npm run build:portable` を実行して `dist/` と `portable/gim-workbench.html` を最新化。

---

## 実装の順序と各段階の検証

1. **★1（退院サマリ・紹介元返書を tools.ts に追加）** → `npm test` / `npm run build` を通す
2. **★2（カテゴリ追加）** → ビルドが通ることを確認
3. **★3（孤児ファイル削除）** → ビルドが通ることを確認
4. **★4（utils 整理）** → `npm test` / `npm run build` を通す
5. **★5 は別ステップ**（仕様書「確定」待ち）
6. **★6・★7（テスト追加 / dist 再生成）**

各段階で `git add` → `git commit` を分けてください。コミットメッセージは AGENTS.md の規約に従い、`[claude-code]` ラベル付き。例:

```text
feat(discharge-summary,referral-reply): re-integrate document templates into tools.ts [claude-code]
feat(catalog): restore education and learning categories [claude-code]
chore: remove orphaned module components [claude-code]
refactor: consolidate scoring.ts into calculations.ts [claude-code]
```

---

## やってはいけないこと（再確認）

- 仕様書（`docs/specs/`）の内容を勝手に変更しない。ステータスを勝手に「実装済み」に上げない（実装中・実装済みへの遷移はユーザー確認後にだけ）
- AGENTS.md の絶対則7「大きなUI・アーキテクチャ再設計を独断で進めない」を遵守
- `af-risk` ツールの改修は仕様書ステータスが「確定」になってから着手
- `localStorage` に文書フォームの自由記載を保存しない（絶対則5）
- 「投与する」「診断する」「中止する」などの断定表現を追加しない（絶対則6）

---

## 完了報告に含めてほしい内容

1. 各 ★ 項目の完了状況（チェックリスト形式）
2. `npm test` と `npm run build` の最終結果
3. ホーム画面から `退院サマリ下書き` と `紹介元返書` が辿れることの確認方法（手動 or playwright）
4. `git log --oneline` の出力（コミットの分割を確認するため）
5. `docs/PROJECT_MAP.md` / `docs/HANDOFF.md` の更新箇所
