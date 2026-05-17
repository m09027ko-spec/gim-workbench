# 総診ワークベンチ プロジェクトマップ

> このファイルの役割: 現状スナップショット。カテゴリ、ツール件数、実装方針、主要ファイルをまとめます。

## 目的

内科臨床で日常的に使える「軽量ミニツール集」です。計算式、スコア、チェックリスト、薬剤確認、簡易フローチャートを中心に、病棟・外来・救急で素早く使うことを想定しています。

臨床判断を自動化しません。医療者向け補助・教育ツールです。

## 現在の内容

- アプリ名: 総診ワークベンチ / GIM Workbench
- カテゴリ: 計算、スコア、薬剤、救急、病棟、外来、高齢者、書類・説明
- 登録ツール: 30件
- ツールページ: 30件
- バックエンド: なし
- 外部API: なし

## 実装方針

- 全ツールを `src/data/tools.ts` に登録。
- 入力欄、結果表示、解釈、注意点、参考情報、免責表示は `MiniToolRenderer` で共通化。
- 計算式は `src/utils/calculations.ts` に分離。
- 薬剤量や施設差が大きい項目は、未確認値をハードコードせずTODO表示。
- チェックリスト状態、お気に入り、最近使ったツールのみlocalStorageに保存。

## 主要ファイル

| パス | 役割 |
| --- | --- |
| `src/data/tools.ts` | 30ツールの定義、入力項目、結果ロジック |
| `src/data/catalog/categories.ts` | 8カテゴリ定義 |
| `src/data/modules.ts` | 画面側から使う検索・取得API |
| `src/modules/miniTools/MiniToolRenderer.tsx` | 共通ツール画面 |
| `src/components/DisclaimerBox.tsx` | 共通免責表示 |
| `src/components/ResultCard.tsx` | 結果カード |
| `src/components/NumberInput.tsx` | 大きめ数値入力 |
| `src/components/SelectInput.tsx` | 大きめ選択入力 |
| `src/utils/calculations.ts` | 計算式 |
| `src/data/steroidEquivalence.ts` | ステロイド換算テーブル |
| `src/data/doacRules.ts` | DOAC確認TODO |
| `src/data/antibioticRenalDosing.ts` | 抗菌薬腎機能用量TODO |
| `src/data/checklistItems.ts` | チェックリスト項目 |
| `scripts/test-calculations.mjs` | 計算テスト |
| `portable/gim-workbench.html` | 単一HTML配布物 |

## 実装済みツール一覧

1. ステロイド換算ツール
2. 腎機能別DOAC用量チェック
3. CCr / eGFR / Cockcroft-Gault計算
4. Na補正式ツール
5. 血液ガス簡易解釈ツール
6. アニオンギャップ計算ツール
7. 肺炎重症度スコア
8. Centor / McIsaacスコア
9. Wells / PERC / D-dimer判断ツール
10. HEARTスコア
11. CHA₂DS₂-VASc / HAS-BLED
12. CHADS₂ / CHA₂DS₂-VASc比較表示
13. Child-Pugh分類
14. FIB-4 index
15. MELD-Na計算
16. qSOFA / SIRS / NEWS2
17. DICスコア雛形
18. 便秘薬・下剤選択支援
19. 不眠薬・せん妄リスク薬チェック
20. 抗菌薬腎機能用量チェック
21. 抗菌薬内服スイッチ候補
22. ワルファリン開始・調整メモ
23. インスリン補正スケール作成
24. 入院時オーダーチェックリスト
25. 退院前チェックリスト
26. せん妄原因検索チェックリスト
27. 誤嚥性肺炎包括管理チェックリスト
28. 尿閉対応チェックリスト
29. 便潜血陽性・貧血外来の初期整理
30. 輸血適応チェックツール

## TODOを残している領域

- DOAC用量
- 抗菌薬腎機能別用量
- 抗菌薬内服スイッチ候補薬
- DIC点数表
- ワルファリン開始量
- インスリン補正スケール
- 3%食塩水の詳細投与量

## 検証コマンド

```bash
npm test
npm run build
npm run build:portable
```
