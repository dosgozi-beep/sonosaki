# SONOSAKI アプリ ─ スマホで動かす手順

このフォルダのファイルを使って、SONOSAKIアプリを実際のスマホで動かすまでの手順です。

## 必要なもの
- パソコン（Mac / Windows どちらでもOK）
- Node.js（インストール済みでなければ https://nodejs.org/ から）
- GitHubアカウント（無料）
- Vercelアカウント（無料、GitHubでログイン可能）

## 全体の流れ
1. パソコンでViteプロジェクトを作る
2. 動作確認
3. GitHubにアップ
4. Vercelで公開
5. スマホで開いてホーム画面に追加

---

## 1. プロジェクトを作る（5分）

ターミナル（Macなら「ターミナル」、Windowsなら「PowerShell」）を開いて：

```bash
npm create vite@latest sonosaki -- --template react
cd sonosaki
npm install
```

最後に `npm install` が完了するまで1〜2分待ちます。

## 2. ファイルを差し替える

作成された `sonosaki` フォルダの中身を、以下のように差し替えます：

- `src/App.jsx` → このフォルダの **sonosaki_for_mobile.jsx** の中身をすべてコピーして置き換える
- `index.html` → このフォルダの **index.html** で置き換える
- `src/main.jsx` → このフォルダの **main.jsx** で置き換える
- `src/index.css` → このフォルダの **index.css** で置き換える（無ければ作成）

不要になるファイル：
- `src/App.css` → 削除してOK
- `public/vite.svg`, `src/assets/react.svg` → そのままでOK（使われない）

## 3. パソコンで動作確認

```bash
npm run dev
```

ターミナルに表示されるURL（例：`http://localhost:5173/`）をブラウザで開く。
スマホサイズに合わせてブラウザの幅を狭くすると、実際の見え方が確認できます。

## 4. GitHubにアップ

1. GitHubで新しいリポジトリを作る（名前は `sonosaki` など、Privateで可）
2. ターミナルで以下を実行：

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/【あなたのユーザー名】/sonosaki.git
git push -u origin main
```

## 5. Vercelで公開（5分）

1. https://vercel.com/ にアクセス → GitHubアカウントでサインアップ
2. 「Add New Project」→「Import」で先ほどのリポジトリを選ぶ
3. 設定はデフォルトのまま「Deploy」ボタンを押す
4. 1〜2分待つと、`https://sonosaki-xxx.vercel.app` のようなURLが発行される

## 6. スマホで開く → ホーム画面に追加

### iPhone（Safari）
1. SafariでURLを開く
2. 画面下の「共有」ボタン（□に↑のアイコン）
3. 「ホーム画面に追加」を選択
4. 名前を「SONOSAKI」にして「追加」

### Android（Chrome）
1. ChromeでURLを開く
2. 右上のメニュー（︙）
3. 「ホーム画面に追加」を選択

これで、スマホのホーム画面にSONOSAKIアプリのアイコンが現れて、タップするとフルスクリーンで起動します。プッシュ通知以外はほぼネイティブアプリと同じです。

---

## トラブルシューティング

**npm が見つからない**
→ Node.jsがインストールされていません。https://nodejs.org/ から最新版（LTS）をダウンロードしてインストール

**git push でエラー**
→ GitHubでログインを求められます。Personal Access Tokenの作成が必要かもしれません。GitHubのドキュメントを参照

**Vercelでデプロイが失敗する**
→ Vercelのビルドログを確認。だいたいは依存関係の問題なので `npm install` をローカルで再実行してから push し直す

---

## 注意点

このバージョンは **localStorage** にデータを保存します。つまり：
- データはそのスマホ・そのブラウザだけに保存される
- 他のメンバーとデータは共有されない
- ブラウザのキャッシュを消すとデータが消える

本格的にチームで使うには、Supabaseと繋いでクラウドにデータを保存する次のステップが必要です。まずはこのバージョンで「自分で1週間使ってみる」「現役メンバーに見せる」をやってみてください。
