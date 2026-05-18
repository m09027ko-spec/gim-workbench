# AGENTS.md

このファイルは Claude Code / Codex / Cursor など、**すべてのコーディングエージェントが従う共通ルール**です。Claude Code は加えて `CLAUDE.md` を読んでください（Claude固有の補足）。

---

## このプロジェクト

`総診ワークベンチ / GIM Workbench`。総合診療医のための業務補助Webアプリ。**臨床判断を自動化しません**。チェックリスト・スコア計算・文書テンプレートで業務を補助します。

- 公開URL: https://m09027ko-spec.github.io/gim-workbench/
- リポジトリ: https://github.com/m09027ko-spec/gim-workbench
- 技術: React 19 / TypeScript / Vite / HashRouter / 通常CSS / GitHub Pages / 最小限のPWA

---

## 絶対則（変更禁止）

これらは依頼されても変更しません。例外を作る前に必ずユーザーに確認します。

1. **患者個人情報を扱う実装を追加しない。** 患者名、患者ID、生年月日、住所、電話番号、カルテ番号、症例本文を入力欄や localStorage に保存する設計は禁止。
2. **外部APIや外部サーバー通信を追加しない。** AI API、医療API、解析サーバー、ログ送信、CDN からのライブラリ読み込みも含めて使わない。
3. **UIライブラリを導入しない。** 通常CSSと自作コンポーネントで作る（MUI、Chakra、Tailwind などを追加しない）。
4. **ルーティングは HashRouter のまま。** GitHub Pages でリロードに強くするための選択。
5. **文書作成フォームの自由記載は localStorage に保存しない。** 患者情報の流出経路になるため。
6. **医療判断を自動決定する表現を使わない。** 「〜と診断する」「〜を投与する」ではなく「〜を検討」「〜を確認」などの業務補助表現に寄せる。
7. **大きなUI・アーキテクチャ再設計を独断で進めない。** 既存パターンを尊重する。設計変更は明示的依頼があったときだけ、かつ `docs/decisions.md` に判断記録を残す。
8. **localStorage に保存してよいのは以下のみ**: `favorites`（お気に入りツールID）/ `recentModules`（最近使ったツールID）/ `mini-tool:<toolId>`（チェックリスト状態）。

絶対則の根拠は `docs/decisions.md` に記録されています。

---

## アーキテクチャ：定義駆動の共通レンダラー

総診ワークベンチのツール（モジュール）は、すべて **`ToolDefinition` 型のオブジェクトとして `src/data/tools.ts` に集約**され、**`src/modules/miniTools/MiniToolRenderer.tsx` で共通描画**します。

これにより、ツール追加は「コンポーネントを書く」ではなく「定義オブジェクトを書く」ことになり、UI の一貫性とコード重複の最小化を両立します。

### ツールの型（`ToolDefinition`）

ツールは以下3つの型ファミリーに当てはまります。1つのツールで複数を併用してもよい（例：入力欄＋チェックリスト＋計算結果）。

| 型ファミリー | 使うフィールド | 例 |
| --- | --- | --- |
| **計算・スコア型** | `fields[]`（number / select / checkbox）+ `calculate()` | CHA₂DS₂-VASc、CURB-65、Child-Pugh |
| **チェックリスト型** | `checklistGroups[]` | 入院オーダー、退院前チェック |
| **安全なTODO雛形型** | `fields[]` または `checklistGroups[]` + `calculate()` の `todos[]` | 抗菌薬腎機能用量、ステロイド換算 |

新しい型ファミリーを増やす前にユーザーに確認します。

### ToolDefinition の核心

`src/types/tool.ts` 参照。最低限以下を持ちます：

- `id`: 一意のツールID（ハイフン区切り英小文字、例: `has-bled`）
- `title`: 表示名
- `purpose`: 用途の説明
- `categoryIds`: 所属カテゴリの配列（複数所属可）
- `tags`: 検索用タグ
- `fields[]` または `checklistGroups[]`: 入力UI
- `calculate(values)`: 入力から `ToolResult` を返す関数
- `referenceInfo[]`: 参考文献
- `safetyNotes[]`: 安全上の注意

---

## ツールIDが横串

1ツール = 3点セット。すべて同じ `<tool-id>` で揃えてください。

- 仕様書: `docs/specs/<tool-id>.md`
- 実装: `src/data/tools.ts` の `id: "<tool-id>"` エントリ
- （必要なら）計算ロジック: `src/utils/calculations.ts` の `calculate<ToolName>` 関数

`af-risk` のように複数スコアを統合したツールでも、仕様書は1ファイルにまとめ、そのファイル名 = ツールID にします。仕様書 ID と tools.ts の ID は**必ず一致**させてください（例: 仕様書 `af-risk.md` ↔ tools.ts `id: "af-risk"`）。

仕様書がない状態で新規ツール実装を始めないでください。「Cowork で仕様書を作ってください」とユーザーに案内します。

---

## カテゴリ体系

カテゴリは `src/data/catalog/categories.ts` で定義。現状10カテゴリ：

| ID | 表示名 | 用途 |
| --- | --- | --- |
| `calculations` | 計算 | 式が明確な計算ツール |
| `scores` | スコア | 臨床スコア・リスク層別化 |
| `medications` | 薬剤 | 薬剤確認・安全なTODO雛形 |
| `emergency` | 救急 | 救急・急変時の初期整理 |
| `ward` | 病棟 | 入院・退院・病棟管理 |
| `outpatient` | 外来 | 外来初期整理・フォロー |
| `geriatric` | 高齢者 | 高齢者診療・せん妄・CGA |
| `documents` | 書類・説明 | 書類、説明、コピー用サマリー |
| `education` | 教育・カンファ | 症例カンファ・教育コンテンツ |
| `learning` | 学習アプリ | 研修医向け学習・反復演習 |

ツールは複数カテゴリに所属可（`categoryIds: ["scores", "emergency"]` のように）。

---

## ファイル配置

| パス | 役割 |
| --- | --- |
| `src/data/tools.ts` | ツール定義の集約（30ツール以上） |
| `src/data/catalog/categories.ts` | カテゴリ定義 |
| `src/data/catalog/index.ts` | `moduleDefinitions = miniToolModules` のブリッジ |
| `src/data/modules.ts` | 画面側が読む検索・取得API |
| `src/data/antibioticRenalDosing.ts` | 抗菌薬腎機能用量データ |
| `src/data/checklistItems.ts` | チェックリスト項目データ |
| `src/data/doacRules.ts` | DOAC ルール |
| `src/data/steroidEquivalence.ts` | ステロイド換算表 |
| `src/utils/calculations.ts` | 計算ロジック（純粋関数。テスト可能） |
| `src/types/tool.ts` | `ToolDefinition` などの型 |
| `src/types/module.ts` | `AppModule` / `AppCategory` の型 |
| `src/modules/miniTools/MiniToolRenderer.tsx` | 共通レンダラー |
| `src/components/` | 共通UI（NumberInput, SelectInput, ResultCard 等） |
| `src/pages/ModulePage.tsx` | `MiniToolRenderer` への薄いラッパ |
| `docs/specs/` | ツール仕様書（実装の入力） |
| `docs/references/` | 参考資料置き場（Git管理外、README のみ Git） |
| `docs/decisions.md` | 設計判断ログ |
| `docs/PROJECT_MAP.md` | 現状スナップショット |
| `docs/HANDOFF.md` | セッション間の引き継ぎ |
| `scripts/test-calculations.mjs` | 計算ロジックの spot check |
| `portable/gim-workbench.html` | 単一HTML配布版（Git管理する生成物） |

---

## 新規ツール追加の標準手順

1. `docs/specs/<tool-id>.md` を読む（仕様書がない場合はユーザーに確認）。
2. 計算ロジックがある場合は `src/utils/calculations.ts` に純粋関数として追加し、エクスポート。
3. データ表（薬剤量・換算表など）がある場合は `src/data/<name>.ts` に分離。
4. `src/data/tools.ts` に `ToolDefinition` を追加（`id` は仕様書ファイル名と一致させる）。
5. `scripts/test-calculations.mjs` に新しい計算関数のテストを追加。
6. `npm test` を通す。
7. `npm run build` を通す。
8. ユーザーが希望すれば `npm run build:portable` で単一HTML版も更新。
9. `docs/PROJECT_MAP.md` の件数・実装済み一覧を更新。
10. `docs/HANDOFF.md` の「直近の確認結果」と「次に進めるなら」を更新。
11. 仕様書のステータスを「実装済み（<エージェント識別子>, YYYY-MM-DD）」に更新。

**ステータス変更はユーザーが「確定」した後にだけ「実装中」「実装済み」へ進めてください。Cowork が「下書き」のまま置いている仕様書を勝手に「実装済み」に書き換えない。**

---

## Cowork ↔ コーディングエージェント のワークフロー

- **Cowork（Claude Desktop の Cowork mode）の役割**: 仕様書作成、医学的妥当性の検討、項目設計、参考文献整理、ユーザーへの確認。
- **コーディングエージェント（Claude Code / Codex 等）の役割**: 仕様書 `docs/specs/<tool-id>.md` を読み、上記の標準手順に従って実装、ビルド・テスト検証、ファイル更新、Git操作。

仕様書のフォーマットは `docs/specs/TEMPLATE.md` を参照。

---

## エージェント別の初回読み順

### Claude Code の場合

1. このファイル（`AGENTS.md`）
2. `CLAUDE.md`（Claude Code 固有の運用メモ）
3. `docs/HANDOFF.md`（前回どこまで進んだか）
4. `docs/PROJECT_MAP.md`（今のツール件数・実装済み一覧）
5. `docs/decisions.md`（過去の設計判断と根拠）
6. 着手するツールの `docs/specs/<tool-id>.md`

### Codex / Cursor / その他コーディングエージェントの場合

1. このファイル（`AGENTS.md`）— ここに共通ルール全部
2. `docs/HANDOFF.md`（前回どこまで進んだか）
3. `docs/PROJECT_MAP.md`（今のツール件数・実装済み一覧）
4. `docs/decisions.md`（過去の設計判断と根拠）
5. 着手するツールの `docs/specs/<tool-id>.md`

`CLAUDE.md` は Claude Code 固有のメモなので、Codex / Cursor は読まなくてよい。

### Cowork（Claude Desktop の Cowork mode）の場合

1. このファイル（`AGENTS.md`）— 絶対則と型ファミリーを把握
2. `docs/WORKFLOW.md`（協働フローと役割分担）
3. `docs/specs/TEMPLATE.md`（仕様書の雛形）
4. `docs/references/<tool-id>/`（先生が放り込んだ参考資料）
5. `docs/HANDOFF.md`（前回の経緯）

---

## コミットメッセージとログの規約

複数のエージェントが同じリポジトリで作業するため、「いつ誰が何をしたか」を git log から追えるようにします。

### コミットメッセージのフォーマット

```text
<種別>(<tool-id>): <一行説明> [<エージェント識別子>]
```

- **種別**: `feat`（新機能）/ `fix`（修正）/ `docs`（ドキュメント）/ `refactor`（リファクタ）/ `chore`（雑務）
- **tool-id**: 対象ツールID。複数ツールに跨る場合や全体作業の場合は省略してよい
- **エージェント識別子**: `[claude-code]` / `[codex]` / `[cursor]` / `[cowork]` / `[human]` のいずれか

### 例

```text
feat(af-risk): add HAS-BLED + CHA2DS2-VASc combined tool [codex]
docs(has-bled): add spec draft [cowork]
fix(curb65): correct threshold for severe group [codex]
docs: restructure references folder [cowork]
chore: clean up dist and output [human]
```

**1コミットに複数の独立した変更を詰め込まない**。後から特定ツールの履歴を追えなくなるため、ツール単位でコミットを分けるのが望ましい。

### 効果

- `git log --oneline | grep af-risk` で `af-risk` の歴史を抽出
- `git log --oneline | grep '\[codex\]'` で Codex の仕事だけ抽出

### 仕様書ステータスにも誰がやったかを記録

`docs/specs/<tool-id>.md` の冒頭メタ情報の「ステータス」を変更するとき、誰がいつ変えたかも書きます。

例:

```markdown
- **ステータス**: 実装済み（Claude Code, 2026-05-17）
```

---

## 検証コマンド

```bash
npm install            # 初回のみ
npm run dev            # ローカル開発
npm test               # 計算ロジックの spot check
npm run build          # ビルド（実装変更後は必ず通す）
npm run build:portable # 単一HTML版の再生成（必要時のみ）
```

公開状態の確認:

```bash
gh run list --repo m09027ko-spec/gim-workbench --limit 5
curl -L -I https://m09027ko-spec.github.io/gim-workbench/
```

---

## 触らないもの

- `dist/`、`node_modules/`、`.playwright-cli/`、`output/`、`.tmp-tests/` は生成物・一時ファイル。
- `portable/gim-workbench.html` は生成物だが Git管理する配布物。手で編集せず `npm run build:portable` で再生成する。

---

## 参考資料の扱い（docs/references/）

`docs/references/` はユーザーが集めた参考資料の置き場で、`.gitignore` により Git管理外です（`README.md` だけ Git に上がる）。

- **Cowork は読む**: 仕様書を書くとき、ここの資料を読み、要約・引用元・該当ページを `docs/specs/<tool-id>.md` の「参考文献・根拠」に反映する。
- **コーディングエージェントは通常読まない**: 実装に必要な根拠は仕様書側に既に書かれている前提。疑問が出たらユーザーに確認してから参照する。
- **資料そのものを Git にコミットしない**: 著作権・個人情報リスクのため。要約と引用情報だけが仕様書経由で Git に残る。

「成果物だけ Git に上げる」が原則。`docs/references/` は素材置き場でコミット対象ではありません。

---

## ユーザーについて

ユーザーは中核病院の総合診療科医師で、プログラミング初心者です。説明は専門用語を避けるか、避けられないときは一行で意味を添えてください。「何を変えたか」「なぜそうしたか」を簡潔に伝えるのが大事です。長い後語りや diff の再要約は不要です。

---

## 困ったとき

- 仕様書（`docs/specs/`）に矛盾がある、または不足している → 実装に進まずユーザーに確認。
- 絶対則に抵触しそうな依頼があった → 実装に進まずユーザーに確認。
- 既存型ファミリーで対応できない要件 → ユーザーに確認したうえで、最小の追加だけで済む設計を提案。
- 既存ツールと機能が重複しそうな新規依頼 → 統合するか別ツールにするかをユーザーに確認。
- 仕様書のステータスが「下書き」のまま → 実装着手前にユーザーに「確定」へ進めてもらう。
- 薬剤量や閾値が未確認 → 数値を仮実装せず、`todos[]` に TODO 表示して安全に止める。
