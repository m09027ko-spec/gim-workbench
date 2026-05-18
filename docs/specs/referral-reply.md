# 紹介元返書

> このファイルは既存実装（`src/modules/documents/ReferralReply.tsx` + `src/utils/textTemplates.ts` の `buildReferralReply`）からの**逆抽出仕様書**です。元実装は既に Git に存在しますが、Codex の `tools.ts` 統合作業で対応する `ToolDefinition` が**追加されておらず**、ホーム画面から辿れない状態になっています。Claude Code に「`tools.ts` への `ToolDefinition` 追加」を依頼する想定。

## メタ情報

- **ツールID**: `referral-reply`
- **表示名**: 紹介元返書
- **カテゴリ**: `documents`, `outpatient`
- **型ファミリー**: 文書テンプレート型（複数行テキスト入力 → 整形済み文章を出力 → コピー）
- **ステータス**: 下書き
- **作成日**: 2026-05-17
- **最終更新**: 2026-05-17

## 目的

紹介元医師への返書の骨子を、必要な要素を埋めるだけで生成するツール。患者個人情報や医療機関名の詳細は入力せず、要点のみを入れてもらい、最後にカルテシステムへコピー＆ペーストする運用を想定。

## 参考にする既存ツール

- 既存実装: `src/modules/documents/ReferralReply.tsx`（孤児化）
- 生成ロジック: `src/utils/textTemplates.ts` の `buildReferralReply`（孤児化）

新アーキテクチャでは、これらを `src/data/tools.ts` の `ToolDefinition` として再表現する。

## 入力項目（textarea 型 — `discharge-summary.md` で先に追加される前提）

| 項目ID | ラベル | 行数 | 必須 | 補足 |
| --- | --- | --- | --- | --- |
| `referralReason` | 紹介理由 | 2 | 任意 | - |
| `assessment` | 当科での評価 | 3 | 任意 | - |
| `diagnosis` | 診断 | 2 | 任意 | - |
| `treatment` | 治療・対応 | 3 | 任意 | - |
| `currentStatus` | 現在の状態 | 2 | 任意 | - |
| `futurePlan` | 今後の方針 | 3 | 任意 | - |
| `requests` | 紹介元にお願いしたいこと | 3 | 任意 | - |

全項目とも複数行テキスト（textarea）。プレースホルダは「個人情報を含めず、要点のみ入力」。

## 出力テンプレート

```text
〇〇先生

このたびはご紹介いただきありがとうございました。

【紹介理由】
{referralReason}

【当科での評価】
{assessment}

【診断・対応】
診断：{diagnosis}
治療・対応：{treatment}
現在の状態：{currentStatus}

【今後の方針】
{futurePlan}

【お願いしたい事項】
{requests}

今後とも何卒よろしくお願い申し上げます。
```

空欄の項目は `（未入力）` で出力する。冒頭の「〇〇先生」は、医療機関情報を入れない設計に基づくプレースホルダ（先生が後で実名に置き換える）。

## 結果オブジェクト

```ts
{
  title: "紹介元返書",
  summary: "返書案を生成しました。カルテへコピーしてください。",
  tone: "neutral",
  copyText: "<生成された文章>",
  cautions: [
    "医療機関名・患者個人情報は入力しないでください。冒頭の「〇〇先生」は後でカルテ側で実名に置き換えてください。",
    "本ツールは下書き支援です。最終的な記載内容と医学的妥当性は担当医が確認してください。",
  ],
}
```

## 医療安全上の注意

- 入力値を localStorage に保存しない（**絶対則5**）
- 患者氏名・医療機関名・住所などの入力欄ラベルを作らない
- 「診断する」「治療する」などの断定表現を出力テンプレートに混ぜない
- 出力は「下書き」であることを明示し、最終チェックは担当医が行う旨を結果カードに表示

## 受け入れ基準

- [ ] `src/types/tool.ts` の `ToolField` に `textarea` 型が追加済み（`discharge-summary` 実装時に追加されている前提）
- [ ] `src/modules/miniTools/MiniToolRenderer.tsx` の `FieldControl` で `textarea` 分岐が動く（同上）
- [ ] `src/data/tools.ts` に `referral-reply` の `ToolDefinition` を追加
- [ ] 計算関数 `calculate()` 内で `buildReferralReply` 相当のロジックを呼び出す（または `src/utils/textTemplates.ts` を残して再利用）
- [ ] 既存の `src/modules/documents/ReferralReply.tsx`（孤児ファイル）を削除
- [ ] `npm test` 成功
- [ ] `npm run build` 成功
- [ ] ホーム → 書類・説明カテゴリ（または外来カテゴリ）→ 紹介元返書 が開ける
- [ ] `docs/PROJECT_MAP.md` の件数・実装済み一覧を更新

## 参考文献・根拠

- 既存実装 `src/modules/documents/ReferralReply.tsx`（2026-05-17 時点）の入力欄構成
- 既存実装 `src/utils/textTemplates.ts` の `buildReferralReply` 関数

## 設計判断メモ

- **冒頭の「〇〇先生」を残す理由**: 紹介元医師の実名はカルテ側で個別に挿入する運用にすることで、ツール側に医療機関情報を持たせない。
- **末尾の挨拶を固定する理由**: 礼儀の表現を毎回考える手間を省き、入力負担を最小化。

## ユーザー（先生）に確認していただきたい点

1. **項目の順序と粒度**: 現状の 7 項目で過不足ないか
2. **冒頭・末尾の固定文**: 「〇〇先生」「ご紹介いただきありがとうございました」「今後とも何卒よろしくお願い申し上げます」の文言を維持するか、変更するか
3. **カテゴリ**: 「書類・説明」だけにするか、「外来」にも紐付けるか
