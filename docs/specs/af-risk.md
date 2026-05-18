# AFリスク（CHA₂DS₂-VASc / HAS-BLED 統合）

> このファイルは Codex が `src/data/tools.ts` に実装済みの `af-risk` ツールから**逆抽出した仕様書**です。Codex の独断実装で先生のレビューを経ていないため、本仕様書はステータス **下書き** に戻してあります。先生のレビュー後、改修必要箇所を Claude Code に依頼する想定です。

## メタ情報

- **ツールID**: `af-risk`
- **表示名**: CHA₂DS₂-VASc / HAS-BLED
- **カテゴリ**: `scores`, `medications`
- **型ファミリー**: 計算・スコア型（2スコアの同時表示）
- **ステータス**: 下書き（Cowork, 2026-05-17 に「実装済み」から差し戻し）
- **作成日**: 2026-05-17（has-bled.md として作成）
- **最終更新**: 2026-05-17（af-risk.md へ統合）

## 目的

心房細動患者の **脳梗塞リスク（CHA₂DS₂-VASc）** と **出血リスク（HAS-BLED）** を同時に整理する補助ツール。両スコアは抗凝固療法の判断で常に対で使われるため、1つの画面で同時に評価できるようにする。

HAS-BLED は単独では「抗凝固を中止する判断ツール」と誤解されやすいので、本ツールでは CHA₂DS₂-VASc と並べて表示し、**修正可能な出血リスク因子の見直し** を促す。

## 参考にする既存ツール

- `src/data/tools.ts` の `af-risk` エントリ（既存実装そのもの）
- 計算関数: `calculateCha2ds2VascScore` / `calculateHasBledScore` in `src/utils/calculations.ts`

## 入力項目（`fields[]`）

CHA₂DS₂-VASc 側と HAS-BLED 側で項目が一部重複（高血圧、脳卒中、高齢）するため、入力欄は統合してあります。

| 項目ID | ラベル | 型 | 使われるスコア | 補足（仕様書記載）| UI に表示する補足（現状欠如、要追加） |
| --- | --- | --- | --- | --- | --- |
| `heartFailure` | 心不全 | checkbox | CHA | - | - |
| `hypertension` | 高血圧 | checkbox | CHA / HAS-BLED | コントロール不良（収縮期 > 160 mmHg）で HAS-BLED 加点 | 「コントロール不良（収縮期 > 160 mmHg）」 |
| `age75` | 75歳以上 | checkbox | CHA（2点）/ HAS-BLED の E にも該当 | - | - |
| `diabetes` | 糖尿病 | checkbox | CHA | - | - |
| `strokeTia` | 脳卒中/TIA/塞栓症既往 | checkbox | CHA（2点）/ HAS-BLED の S | - | - |
| `vascularDisease` | 血管疾患 | checkbox | CHA | - | - |
| `age65to74` | 65-74歳 | checkbox | CHA / HAS-BLED の E にも該当 | - | - |
| `female` | 女性 | checkbox | CHA | - | - |
| `abnormalRenal` | 腎機能障害 | checkbox | HAS-BLED | 慢性透析、腎移植、Cr ≥ 2.26 mg/dL | 「慢性透析・腎移植・Cr ≥ 2.26 mg/dL」 |
| `abnormalLiver` | 肝機能障害 | checkbox | HAS-BLED | 慢性肝疾患、または ビリルビン > 基準上限の2倍 + AST/ALT/ALP > 基準上限の3倍 | 「慢性肝疾患、またはビリルビン > 上限×2 かつ AST/ALT/ALP > 上限×3」 |
| `bleeding` | 出血既往/素因 | checkbox | HAS-BLED | 過去の大出血、貧血、易出血性、出血素因 | 「過去の大出血、貧血、出血素因」 |
| `labileInr` | INR不安定 | checkbox | HAS-BLED | INR が不安定、または治療域内時間 < 60%。ワルファリン使用例で評価 | 「ワルファリン例で INR 不安定 or TTR < 60%」 |
| `drugs` | 出血リスク薬 | checkbox | HAS-BLED | 抗血小板薬・NSAIDs の併用 | 「抗血小板薬・NSAIDs 併用」 |
| `alcohol` | アルコール | checkbox | HAS-BLED | 過度な飲酒（≥ 8 units/週） | 「過度な飲酒（≥ 8 units/週）」 |

## 計算ロジック（`calculate()`）

### CHA₂DS₂-VASc

| 項目 | 配点 |
| --- | --- |
| 心不全 | 1 |
| 高血圧 | 1 |
| 75歳以上 | 2 |
| 糖尿病 | 1 |
| 脳卒中/TIA/塞栓症既往 | 2 |
| 血管疾患 | 1 |
| 65-74歳 | 1 |
| 女性 | 1 |

最大 9 点（年齢項目は重複しない）。

### HAS-BLED

| 略号 | 項目 | 配点 |
| --- | --- | --- |
| H | Hypertension | 1 |
| A | Abnormal renal function | 1 |
| A | Abnormal liver function | 1 |
| S | Stroke | 1 |
| B | Bleeding | 1 |
| L | Labile INR | 1 |
| E | Elderly (> 65) | 1（`age75` または `age65to74` が true なら該当） |
| D | Drugs | 1 |
| D | Alcohol | 1 |

最大 9 点。

### 解釈・推奨アクション

| 状況 | 解釈 | 推奨アクション（業務補助表現） |
| --- | --- | --- |
| HAS-BLED 0〜2 | 出血リスクは比較的低い | 標準的なフォローを継続。年1回はリスク因子を再評価 |
| HAS-BLED 3〜9 | 出血リスクが高い可能性（≥3 で大出血率が顕著に上昇すると報告） | **抗凝固の中止ではなく**、修正可能な出血リスク因子（コントロール不良の血圧、INR不安定、併用抗血小板薬/NSAIDs、過度な飲酒）の見直しを検討。CHA₂DS₂-VASc と合わせて総合的に判断 |

### 結果オブジェクト（現状実装）

```ts
{
  title: "AFリスク",
  summary: `CHA₂DS₂-VASc ${cha}点 / HAS-BLED ${hasBled}点`,
  tone: hasBled >= 3 ? "warning" : "neutral",
  details: [
    "CHA₂DS₂-VAScは脳梗塞リスク評価、HAS-BLEDは出血リスク確認の補助です。",
    hasBled >= 3 ? "出血リスク因子の是正可能項目を確認してください。" : "出血リスク因子を継続確認してください。",
  ],
  interpretation: ["抗凝固の最終判断は年齢、腎機能、出血歴、患者価値観を含めて行います。"],
  cautions: ["スコア単独で抗凝固開始・中止を決めないでください。"],
  references: ["CHA₂DS₂-VASc、HAS-BLED。"],
}
```

## 結果表示に常時入れる注記（要修正）

現状の `cautions` は短縮版になっています。仕様書としては以下の完全版に置き換えます。

> 「HAS-BLED は抗凝固を中止するためのスコアではありません。CHA₂DS₂-VASc と合わせて、リスク・ベネフィットを総合的に評価してください。修正可能なリスク因子（B/L/D：出血歴・INR不安定・併用薬/アルコール）に注目するための補助ツールです。」

## 医療安全上の注意

- 抗凝固開始・中止の最終判断は担当医が、年齢・腎機能・出血歴・患者価値観を含めて行う
- HAS-BLED が高くても CHA₂DS₂-VASc が高ければ抗凝固継続が推奨されることが多い（修正可能因子の最適化を先に検討）
- 「投与する」「中止する」「禁忌である」などの断定表現を結果に出さない

## 既存実装との差分（改修が必要な点）

Codex が実装した現状と、本仕様書の意図との差分。**Claude Code に改修を依頼する対象** です。

1. **入力欄の補足情報が不足**
   - 現状: ラベルだけ（「高血圧」「腎機能障害」など）
   - 改修: 各 `ToolField` に `help` プロパティを追加し、上記の補足（収縮期 > 160 mmHg など）を表示

2. **結果表示の注記が短縮版**
   - 現状: 「スコア単独で抗凝固開始・中止を決めないでください。」
   - 改修: 上記「結果表示に常時入れる注記」の完全版に置き換え

3. **修正可能因子のハイライト機能（未実装、追加要望）**
   - HAS-BLED の B（Bleeding）/ L（Labile INR）/ D（Drugs / Alcohol）のうち、true になっているものを `details` または `cautions` で個別に挙げる
   - 例: 「INR不安定 — ワルファリン管理を見直す機会です」「アルコール — 飲酒量の確認を検討」

4. **参考文献の引用が雑**
   - 現状: 「CHA₂DS₂-VASc、HAS-BLED。」だけ
   - 改修: 原典を引用
     - Pisters R et al. Chest. 2010;138(5):1093-1100. (HAS-BLED)
     - Lip GYH et al. Chest. 2010;137(2):263-272. (CHA₂DS₂-VASc)

5. **元の has-bled.md にあった「先生に確認していただきたい点」が未確認**
   - 閾値（収縮期 > 160 mmHg、Cr ≥ 2.26 mg/dL、年齢 > 65 歳）の現場感覚
   - 「高リスク」を 3 点で区切るかどうか
   - 推奨アクションの表現
   - DOAC 使用例での L（Labile INR）の扱い

## 受け入れ基準（改修完了とみなす条件）

- [ ] `src/data/tools.ts` の `af-risk` エントリで各 `ToolField` に `help` プロパティ追加
- [ ] `cautions` を上記の完全版注記に置き換え
- [ ] 修正可能因子のハイライト機能を追加
- [ ] `referenceInfo[]` に原典 2 本を追加
- [ ] `npm test` 成功
- [ ] `npm run build` 成功
- [ ] 先生レビュー後、本仕様書のステータスを「確定」→「実装中」→「実装済み」へ
- [ ] `docs/PROJECT_MAP.md` を更新

## 参考文献・根拠

- Pisters R, Lane DA, Nieuwlaat R, de Vos CB, Crijns HJGM, Lip GYH. **A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation: the Euro Heart Survey.** Chest. 2010 Nov;138(5):1093-1100. doi:10.1378/chest.10-0134
- Lip GYH, Nieuwlaat R, Pisters R, Lane DA, Crijns HJGM. **Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the Euro Heart Survey on atrial fibrillation.** Chest. 2010 Feb;137(2):263-272. doi:10.1378/chest.09-1584
- ESC Guidelines for the management of atrial fibrillation（先生のローカル `docs/references/af-risk/` に入れる予定）
- 日本循環器学会／日本不整脈心電学会「不整脈薬物治療ガイドライン」（最新版を確認）

## 設計判断メモ

- **CHA₂DS₂-VASc と HAS-BLED を1ツールに統合した理由**: 両者は心房細動の抗凝固判断で常に対で使うため、別ツールに分けると先生が往復することになる。Codex の判断は臨床的に合理的なので採用。
- **`age75` または `age65to74` を HAS-BLED の Elderly に流用する理由**: 入力の重複を避けるため。意味的には「年齢 > 65」と等価。
- **HAS-BLED の Drugs と Alcohol を別 checkbox にした理由**: 原典 Pisters 2010 で独立 1 点ずつカウントされるため。合計 9 点になる。
- **「高リスク」の閾値を 3 点とした理由**: 原典で ≥ 3 が高リスクと定義。要先生確認。

## ユーザー（先生）に確認していただきたい点

1. **統合の妥当性**: CHA₂DS₂-VASc と HAS-BLED を1ツールに統合したのが運用に合うか。それとも独立ツール（has-bled / cha2ds2-vasc）に戻すか
2. **入力欄の補足表現**: 上記「UI に表示する補足」の各文言が現場で使いやすいか
3. **「高リスク」閾値**: HAS-BLED ≥ 3 を高リスクとする運用でよいか
4. **L（Labile INR）の扱い**: DOAC 使用例では常に false を選ぶというロジックで明示するか、自動非表示にするか
5. **修正可能因子のハイライト**: B/L/D を個別に列挙する機能を入れるか
