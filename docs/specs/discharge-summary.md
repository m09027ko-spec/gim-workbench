# 退院サマリ下書き

> このファイルは既存実装（`src/modules/documents/DischargeSummary.tsx` + `src/utils/textTemplates.ts` の `buildDischargeSummary`）からの**逆抽出仕様書**です。元実装は既に Git に存在しますが、Codex の `tools.ts` 統合作業で対応する `ToolDefinition` が**追加されておらず**、ホーム画面から辿れない状態になっています。Claude Code に「`tools.ts` への `ToolDefinition` 追加」を依頼する想定。

## メタ情報

- **ツールID**: `discharge-summary`
- **表示名**: 退院サマリ下書き
- **カテゴリ**: `documents`, `ward`
- **型ファミリー**: 文書テンプレート型（複数行テキスト入力 → 整形済み文章を出力 → コピー）
- **ステータス**: 下書き
- **作成日**: 2026-05-17
- **最終更新**: 2026-05-17

## 目的

退院サマリの骨子を、必要な要素を埋めるだけで一気に下書きとして生成するツール。患者個人情報を入力せず、要点のみを入れてもらい、最後にカルテシステムへコピー＆ペーストする運用を想定。

## 参考にする既存ツール

- 既存実装: `src/modules/documents/DischargeSummary.tsx`（孤児化）
- 生成ロジック: `src/utils/textTemplates.ts` の `buildDischargeSummary`（孤児化）

新アーキテクチャでは、これらを `src/data/tools.ts` の `ToolDefinition` として再表現する。

## 入力項目（textarea 型 — 新規追加が必要）

| 項目ID | ラベル | 行数 | 必須 | 補足 |
| --- | --- | --- | --- | --- |
| `admissionReason` | 入院理由 | 2 | 任意 | - |
| `primaryDiagnosis` | 主診断 | 2 | 任意 | - |
| `comorbidities` | 併存疾患 | 2 | 任意 | - |
| `hospitalCourse` | 入院後経過 | 4 | 任意 | - |
| `treatments` | 実施した治療 | 3 | 任意 | - |
| `dischargeStatus` | 退院時状態 | 2 | 任意 | - |
| `dischargeMedicationPoints` | 退院時処方の要点 | 2 | 任意 | - |
| `futurePlan` | 今後の方針 | 3 | 任意 | - |
| `requests` | 外来・かかりつけ医への依頼事項 | 3 | 任意 | - |
| `explanation` | 患者・家族への説明内容 | 3 | 任意 | - |

全項目とも複数行テキスト（textarea）。プレースホルダは「個人情報を含めず、要点のみ入力」。

## 出力テンプレート

```text
【入院理由】
{admissionReason}

【診断】
主診断：{primaryDiagnosis}
併存疾患：{comorbidities}

【入院後経過】
{hospitalCourse}

【治療】
{treatments}

【退院時状態】
{dischargeStatus}

【退院時処方の要点】
{dischargeMedicationPoints}

【今後の方針】
{futurePlan}

【依頼事項】
{requests}

【患者・家族への説明内容】
{explanation}
```

空欄の項目は `（未入力）` で出力する。

## 結果オブジェクト

```ts
{
  title: "退院サマリ下書き",
  summary: "下書きを生成しました。カルテへコピーしてください。",
  tone: "neutral",
  copyText: "<生成された文章>",
  cautions: [
    "患者氏名・ID・生年月日・住所・電話番号・カルテ番号などの個人情報は入力しないでください。",
    "本ツールは下書き支援です。最終的な記載内容と医学的妥当性は担当医が確認してください。",
  ],
}
```

## 医療安全上の注意

- 入力値を localStorage に保存しない（**絶対則5**）
- 患者個人情報の入力欄ラベル（「氏名」「ID」「生年月日」など）を作らない
- 「診断する」「治療する」などの断定表現を出力テンプレートに混ぜない
- 出力は「下書き」であることを明示し、最終チェックは担当医が行う旨を結果カードに表示

## ToolField 型の拡張が必要

現状の `src/types/tool.ts` の `ToolField` は `number / select / checkbox / checkbox-group` のみで、`textarea` がありません。**この仕様書を実装するには、`ToolField` に以下を追加する必要があります**。

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

`MiniToolRenderer.tsx` の `FieldControl` にも対応分岐を追加（`<textarea>` レンダリング）。

入力値の型は `string`（既存の `ToolValue` は `string | number | boolean | string[] | ""` なのでカバー済み）。

## 受け入れ基準

- [ ] `src/types/tool.ts` の `ToolField` に `textarea` 型を追加
- [ ] `src/modules/miniTools/MiniToolRenderer.tsx` の `FieldControl` に `textarea` 分岐を追加
- [ ] `src/data/tools.ts` に `discharge-summary` の `ToolDefinition` を追加
- [ ] 計算関数 `calculate()` 内で `buildDischargeSummary` 相当のロジックを呼び出す（または `src/utils/textTemplates.ts` を残して再利用）
- [ ] 既存の `src/modules/documents/DischargeSummary.tsx`（孤児ファイル）を削除
- [ ] `npm test` 成功
- [ ] `npm run build` 成功
- [ ] ホーム → 書類・説明カテゴリ（または病棟カテゴリ）→ 退院サマリ下書き が開ける
- [ ] `docs/PROJECT_MAP.md` の件数・実装済み一覧を更新

## 参考文献・根拠

- 既存実装 `src/modules/documents/DischargeSummary.tsx`（2026-05-17 時点）の入力欄構成
- 既存実装 `src/utils/textTemplates.ts` の `buildDischargeSummary` 関数

## 設計判断メモ

- **localStorage に保存しない理由**: 自由記載欄には患者氏名・症例本文が混入しやすい。一度保存すると端末紛失や共有時に事故になるため、React state のみで保持。
- **空欄を `（未入力）` で埋める理由**: 出力テンプレートの形を保ち、医師が後から「ここを書き忘れた」と気づきやすいため。

## ユーザー（先生）に確認していただきたい点

1. **項目の順序と粒度**: 現状の 10 項目で過不足ないか
2. **カテゴリ**: 「書類・説明」だけにするか、「病棟」にも紐付けるか
3. **`textarea` 型の追加**: 共通レンダラーの拡張を許可してよいか（他の文書型ツールでも使う）
