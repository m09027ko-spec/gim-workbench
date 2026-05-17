# 総診ワークベンチ / GIM Workbench

総合診療医が病棟、外来、救急、教育、文書作成、スコア計算を素早く扱うための個人用Webアプリです。臨床判断を自動化するものではなく、チェックリスト、計算、文書テンプレートによる業務補助を目的にしています。

## 起動方法

```bash
npm install
npm run dev
```

## ビルド方法

```bash
npm run build
```

## スマホで日常利用する方法

仕事中に使う前提では、毎回Macで開発サーバーを起動する運用は避けます。`dist/` を静的HTTPSホスティングに置き、スマホのSafariからURLを開いてホーム画面に追加してください。

このアプリは外部APIやサーバー通信を使いません。ホスティング先からHTML/CSS/JavaScriptを読み込むだけで、文書フォームの自由記載や患者情報を送信する機能はありません。

### 推奨: GitHub Pages

このリポジトリをGitHubに置く場合、`.github/workflows/deploy.yml` を追加済みなので、GitHub Pagesでそのまま公開できます。

1. GitHubで新しいリポジトリを作る
2. このフォルダをpushする
3. GitHubの `Settings > Pages` で `GitHub Actions` を選ぶ
4. `main` ブランチへpushすると自動で `dist/` が公開される
5. 表示されたURLをスマホのSafariで開く
6. Safariの共有メニューから `ホーム画面に追加`

公開URLはおおむね以下の形になります。

```text
https://<GitHubユーザー名>.github.io/<リポジトリ名>/
```

ルーティングは `#/category/ward` のようなHash形式にしてあるため、GitHub Pagesのような静的ホスティングでもリロードで壊れにくい構成です。

### 一時確認だけしたい場合

MacとiPhoneを同じWi-Fiにつなぎ、必要なら以下で起動します。

```bash
npm run dev -- --host 0.0.0.0
```

表示されたNetwork URLをiPhoneのSafariで開けます。ただしこれは開発確認用で、日常利用にはGitHub Pagesなどの固定URLを推奨します。

## スマホへ渡しやすい単一HTML

開発サーバーを使わずに渡したい場合は、配布用の単一HTMLを作れます。

```bash
npm run build:portable
```

生成されるファイルは `portable/gim-workbench.html` です。単一HTML版はバックアップや簡易共有用です。iPhoneのFilesやDriveのプレビューではJavaScriptが止まることがあるため、日常利用は固定URLでの静的ホスティングを推奨します。

iPhoneで開けない場合は、FilesやDriveのプレビュー内で開かれてJavaScriptが止まっている可能性があります。共有メニューからSafariで開く、またはMacで `python3 -m http.server` などを使ってHTTP URLとして開いてください。

## 新しいモジュールを追加する方法

1. `src/data/modules.ts` にモジュール定義を追加します。
2. 実装する場合は `src/modules/` 配下にコンポーネントを作ります。
3. `src/pages/ModulePage.tsx` の `implementedModules` に `module.id` とコンポーネントを登録します。
4. チェックリスト型なら `Checklist`、文書型なら `CopyButton` と `textTemplates.ts` を再利用します。

未実装のまま `status: "planned"` として追加すると、カテゴリや検索には「近日追加予定」カードとして表示されます。

## localStorageに保存するもの

- `favorites`: お気に入りモジュールID
- `recentModules`: 最近使ったモジュールID
- チェックリストのチェック状態

## localStorageに保存しないもの

- 患者名、患者ID、生年月日、住所、電話番号、カルテ番号
- 症例本文
- 文書作成フォームの自由記載内容
- 医療機関名が入る詳細情報

文書作成フォームの入力内容は端末内に保存しません。コピー後は必要な診療記録システム側で管理してください。

## 患者個人情報について

このアプリには患者個人情報を入力しないでください。臨床判断は必ず最新のガイドライン、院内ルール、患者背景に基づいて行ってください。

## 今後の拡張候補

- 心不全、AKI、発熱、呼吸不全などのチェックリスト追加
- HAS-BLED、Wellsなどの計算モジュール追加
- 診療情報提供書、患者説明文テンプレート追加
- 教育・カンファ支援モジュール追加
- 既存の学習アプリを `learning` カテゴリへ統合
