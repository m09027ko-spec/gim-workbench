# AGENTS.md

このファイルは Claude Code / Codex / Cursor など、**すべてのコーディングエージェントが従う共通ルール**です。Claude Code は加えて `CLAUDE.md` を読んでください（Claude固有の補足）。

---

## このプロジェクト

`総診ワークベンチ / GIM Workbench`。内科臨床で日常的に使う計算式・スコア・チェックリスト・薬剤確認をまとめた総合診療向け補助Webアプリ。**臨床判断を自動化しません**。

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
7. **大きなUI再設計を独断で進めない。** 既存のシンプルな業務用画面を尊重する。デザイン変更は明示的依頼があったときだけ。
8. **localStorage に保存してよいのは以下の3つだけ**: `favorites` / `recentModules` / チェックリストのチェック状態。

絶対則の根拠は `docs/decisions.md` に記録されています。

---

## ツールは3つの型に分かれる

新規ツールは必ずどれか1つに当てはめてください。新しい型を増やす前にユーザーに確認します。

| 型 | 使う共通部品 | 参考にする既存実装 |
| --- | --- | --- |
| 計算・スコア型 | `src/modules/miniTools/MiniToolRenderer.tsx` + `src/utils/calculations.ts` | `src/data/tools.ts` |
| チェックリスト型 | `MiniToolRenderer` + `src/data/checklistItems.ts` | 入院時、退院前、せん妄、尿閉など |
| 安全なTODO雛形 | `src/data/tools.ts` の `todos` 表示 | DOAC、DIC、抗菌薬、ワルファリン、インスリン |

薬剤量や施設差が大きいものは、未確認の数値を仮実装せずTODOとして表示してください。

---

## ツールIDが横串

1ツール = 1つの `<tool-id>` で揃えてください。

- 仕様書（ある場合）: `docs/specs/<tool-id>.md`
- ツール登録: `src/data/tools.ts` の `id: "<tool-id>"` エントリ
- ルーティング: `/module/<tool-id>`

ユーザーが直接詳細仕様を提示した場合は、その依頼文を仕様として扱って実装して構いません。医学的に不確かな部分はTODO表示にしてください。

---

## ファイル配置

| パス | 役割 |
| --- | --- |
| `src/data/catalog/categories.ts` | カテゴリ定義 |
| `src/data/tools.ts` | 30ツールの定義、入力項目、結果ロジック |
| `src/data/catalog/index.ts` | 画面用モジュール定義の集約 |
| `src/data/modules.ts` | 画面側が読む検索・取得API |
| `src/pages/ModulePage.tsx` | ツールページ |
| `src/modules/miniTools/MiniToolRenderer.tsx` | 共通ツール画面 |
| `src/components/` | 共通UI |
| `src/utils/` | 計算式・localStorage・文書テンプレート |
| `docs/specs/` | モジュール仕様書（実装の入力） |
| `docs/references/` | 参考資料置き場（Git管理外、README のみ Git） |
| `docs/decisions.md` | 設計判断ログ |
| `docs/PROJECT_MAP.md` | 現状スナップショット |
| `docs/HANDOFF.md` | セッション間の引き継ぎ |
| `portable/gim-workbench.html` | 単一HTML配布版（Git管理する生成物） |

---

## 新規ツール追加の標準手順

1. 仕様書またはユーザー依頼文を読む。
2. `src/data/tools.ts` にツール定義、入力項目、結果ロジックを追加。
3. 計算式は `src/utils/calculations.ts` に分離し、必要なら `npm test` に追加。
4. 薬剤データは `src/data/*.ts` に分離。未確認値はTODO表示。
5. `npm test` と `npm run build` を通す。
6. ユーザーが希望すれば `npm run build:portable` で単一HTML版も更新。
7. `docs/PROJECT_MAP.md` と `docs/HANDOFF.md` を更新。

---

## Cowork ↔ コーディングエージェント のワークフロー

- **Cowork（Claude Desktop の Cowork mode）の役割**: 仕様書作成、医学的妥当性の検討、項目設計、参考文献整理、ユーザーへの確認。
- **コーディングエージェント（Claude Code / Codex 等）の役割**: 仕様書 `docs/specs/<module-id>.md` を読み、既存パターンに沿って実装、ビルド検証、ファイル更新、Git操作。

仕様書のフォーマットは `docs/specs/TEMPLATE.md` を参照。

---

## 検証コマンド

```bash
npm install            # 初回のみ
npm run dev            # ローカル開発
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

- `dist/`、`node_modules/`、`.playwright-cli/`、`output/playwright/` は生成物・一時ファイル。
- `portable/gim-workbench.html` は生成物だが Git管理する配布物。手で編集せず `npm run build:portable` で再生成する。

---

## 参考資料の扱い（docs/references/）

`docs/references/` はユーザーが集めた参考資料の置き場で、`.gitignore` により Git管理外です（`README.md` だけ Git に上がる）。

- **Cowork は読む**: 仕様書を書くとき、ここの資料を読み、要約・引用元・該当ページを `docs/specs/<module-id>.md` の「参考文献・根拠」に反映する。
- **コーディングエージェントは通常読まない**: 実装に必要な根拠は仕様書側に既に書かれている前提。疑問が出たらユーザーに確認してから参照する。
- **資料そのものを Git にコミットしない**: 著作権・個人情報リスクのため。要約と引用情報だけが仕様書経由で Git に残る。

「成果物だけ Git に上げる」が原則。`docs/references/` は素材置き場でコミット対象ではありません。

---

## ユーザーについて

ユーザーは中核病院の総合診療科医師で、プログラミング初心者です。説明は専門用語を避けるか、避けられないときは一行で意味を添えてください。「何を変えたか」「なぜそうしたか」を簡潔に伝えるのが大事です。長い後語りや diff の再要約は不要です。

---

## エージェント別の初回読み順

このリポジトリで作業を始めるエージェントは、以下の順で読んでください。エージェントごとに必要な追加読みものが違います。

### Claude Code の場合

1. このファイル（`AGENTS.md`）
2. `CLAUDE.md`（Claude Code 固有の運用メモ）
3. `docs/HANDOFF.md`（前回どこまで進んだか）
4. `docs/PROJECT_MAP.md`（今のモジュール件数・実装済み一覧）
5. `docs/decisions.md`（過去の設計判断と根拠）
6. 着手するモジュールの `docs/specs/<module-id>.md`

### Codex / Cursor / その他コーディングエージェントの場合

1. このファイル（`AGENTS.md`）— ここに共通ルール全部
2. `docs/HANDOFF.md`（前回どこまで進んだか）
3. `docs/PROJECT_MAP.md`（今のモジュール件数・実装済み一覧）
4. `docs/decisions.md`（過去の設計判断と根拠）
5. 着手するモジュールの `docs/specs/<module-id>.md`

`CLAUDE.md` は Claude Code 固有のメモなので、Codex / Cursor は読まなくてよい（読んでも害はないが、必須ではない）。

### Cowork（Claude Desktop の Cowork mode）の場合

Cowork は実装エージェントではなく、仕様書作成・医学的妥当性確認・参考文献整理が担当です。読むのは以下。

1. このファイル（`AGENTS.md`）— 絶対則と3型パターンを把握
2. `docs/WORKFLOW.md`（協働フローと役割分担）
3. `docs/specs/TEMPLATE.md`（仕様書の雛形）
4. `docs/references/<module-id>/`（先生が放り込んだ参考資料）
5. `docs/HANDOFF.md`（前回の経緯）

---

## コミットメッセージとログの規約

複数のエージェントが同じリポジトリで作業するため、「いつ誰が何をしたか」を git log から追えるようにします。

### コミットメッセージのフォーマット

```text
<種別>(<module-id>): <一行説明> [<エージェント識別子>]
```

- **種別**: `feat`（新機能）/ `fix`（修正）/ `docs`（ドキュメント）/ `refactor`（リファクタ）/ `chore`（雑務）
- **module-id**: 対象モジュールID。複数モジュールに跨る場合や全体作業の場合は省略してよい
- **エージェント識別子**: `[claude-code]` / `[codex]` / `[cursor]` / `[cowork]` / `[human]` のいずれか

### 例

```text
feat(has-bled): implement HAS-BLED calculator [claude-code]
docs(has-bled): add spec draft [cowork]
fix(curb65): correct threshold for severe group [codex]
docs: restructure references folder [cowork]
chore: clean up dist and output [human]
```

### 効果

- `git log --oneline | grep has-bled` で HAS-BLED の歴史を抽出
- `git log --oneline | grep '\[codex\]'` で Codex がやった仕事だけ抽出
- `git log --oneline | grep '\[claude-code\]'` で Claude Code がやった仕事だけ抽出

### 仕様書ステータスにも誰がやったかを記録

`docs/specs/<module-id>.md` の冒頭メタ情報の「ステータス」を変更するとき、誰がいつ変えたかも書きます。

例:

```markdown
- **ステータス**: 実装済み（Claude Code, 2026-05-17）
```

これにより、コードと仕様書の両方から「最後に手を入れたエージェント」が見えます。

---

## 困ったとき

- 仕様書（`docs/specs/`）に矛盾がある、または不足している → 実装に進まずユーザーに確認。
- 絶対則に抵触しそうな依頼があった → 実装に進まずユーザーに確認。
- 既存パターン3つで対応できない要件 → ユーザーに確認したうえで、最小の追加だけで済む設計を提案。
