# Update Image Size for Source and Img Tags

VS Code拡張機能で、Emmetの「Update Image Size」機能を`<source>`タグ、`<img>`タグ、そして`<picture>`タグで使えるようにします。さらに、`loading="lazy"`属性も簡単に追加できます。

## 機能

### 1. 画像サイズの自動更新
- `<source>`タグと`<img>`タグ内の画像パスから画像サイズを自動取得
- `width`と`height`属性を自動的に追加または更新
- `<picture>`タグ上で実行時、`<picture>`内のすべての`<source>`と`<img>`タグを一括更新
- `src`属性と`srcset`属性の両方に対応

### 2. 画像サイズ + Loading Lazy属性の追加
- `<img>`タグに`width`、`height`、`loading="lazy"`属性を一括で追加
- `<picture>`タグ上で実行時、`<picture>`内のすべてのタグに対応（`loading="lazy"`は`<img>`タグのみ）
- 既存の属性がある場合は更新

### 3. ページ内のすべての画像サイズを一括更新
- ページ内のすべての`<img>`タグと`<source>`タグに対して、`width`と`height`属性を一括で追加または更新
- カーソル位置に関係なく、ドキュメント全体を処理

### 4. ページ内のすべての画像サイズを更新 + カーソル以降のimgにLoading Lazy追加
- ページ内のすべての`<img>`タグと`<source>`タグに`width`と`height`属性を追加
- カーソル位置以降のすべての`<img>`タグに`loading="lazy"`属性を追加
- ファーストビューの画像にはloading="lazy"を付けず、スクロール後の画像のみに付与する場合に便利

## 使い方

### 画像サイズの更新

1. HTMLファイルを開く
2. `<source>`タグ、`<img>`タグ、または`<picture>`タグ上にカーソルを置く
3. 以下のいずれかの方法でコマンドを実行：
   - コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）から「**Update Image Size**」を選択
   - キーボードショートカット：`Cmd+Alt+I`（Mac）/ `Ctrl+Alt+I`（Windows/Linux）

### 画像サイズ + Loading Lazy属性の追加

1. HTMLファイルを開く
2. `<img>`タグまたは`<picture>`タグ上にカーソルを置く
3. 以下のいずれかの方法でコマンドを実行：
   - コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）から「**Update Image Size + Add Loading Lazy**」を選択
   - キーボードショートカット：`Cmd+Alt+Shift+I`（Mac）/ `Ctrl+Alt+Shift+I`（Windows/Linux）

### ページ内のすべての画像サイズを一括更新

1. HTMLファイルを開く
2. コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）から「**Update All Image Sizes in Page**」を選択

### ページ内のすべての画像サイズを更新 + カーソル以降にLoading Lazy追加

1. HTMLファイルを開く
2. ファーストビューとスクロール後の境界となる位置（例：ファーストビュー最後の画像の直後）にカーソルを置く
3. コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）から「**Update All Image Sizes + Add Loading Lazy After Cursor**」を選択

## 例

### Picture タグでの使用例

#### 実行前
```html
<picture>
  <source srcset="image-wide.webp" media="(min-width: 1200px)">
  <source srcset="image-medium.webp" media="(min-width: 800px)">
  <img src="image.jpg" alt="Sample">
</picture>
```

#### 実行後（各画像が異なるサイズの場合）
```html
<picture>
  <source srcset="image-wide.webp" media="(min-width: 1200px)" width="1200" height="600">
  <source srcset="image-medium.webp" media="(min-width: 800px)" width="800" height="500">
  <img src="image.jpg" alt="Sample" width="600" height="400">
</picture>
```

### 単一タグでの使用例

#### 実行前
```html
<img src="image.jpg" alt="Sample">
```

#### 実行後（画像が800x600pxの場合）
```html
<img src="image.jpg" alt="Sample" width="800" height="600" loading="lazy">
```

#### Source タグの場合（Loading Lazy は付与されません）
```html
<source srcset="image.webp" type="image/webp" width="800" height="600">
```

### ページ内すべての画像を一括更新する例

#### 実行前
```html
<img src="hero.jpg" alt="Hero">
<img src="feature1.jpg" alt="Feature 1">
<picture>
  <source srcset="product.webp">
  <img src="product.jpg" alt="Product">
</picture>
<img src="footer.jpg" alt="Footer">
```

#### 「Update All Image Sizes in Page」実行後
```html
<img src="hero.jpg" alt="Hero" width="1920" height="1080">
<img src="feature1.jpg" alt="Feature 1" width="800" height="600">
<picture>
  <source srcset="product.webp" width="600" height="400">
  <img src="product.jpg" alt="Product" width="600" height="400">
</picture>
<img src="footer.jpg" alt="Footer" width="1200" height="300">
```

### カーソル以降の画像にのみLoading Lazyを付与する例

カーソル位置を`<!-- CURSOR -->`で示します。

#### 実行前
```html
<img src="hero.jpg" alt="Hero">
<img src="feature1.jpg" alt="Feature 1">
<!-- CURSOR: ここにカーソルを置いてコマンド実行 -->
<img src="feature2.jpg" alt="Feature 2">
<img src="footer.jpg" alt="Footer">
```

#### 「Update All Image Sizes + Add Loading Lazy After Cursor」実行後
```html
<img src="hero.jpg" alt="Hero" width="1920" height="1080">
<img src="feature1.jpg" alt="Feature 1" width="800" height="600">
<!-- CURSOR: ここにカーソルを置いてコマンド実行 -->
<img src="feature2.jpg" alt="Feature 2" width="800" height="600" loading="lazy">
<img src="footer.jpg" alt="Footer" width="1200" height="300" loading="lazy">
```

ファーストビューの画像（hero.jpg、feature1.jpg）には`loading="lazy"`が付かず、スクロール後に表示される画像（feature2.jpg、footer.jpg）にのみ`loading="lazy"`が付与されます。

## キーボードショートカット

| 機能 | Mac | Windows/Linux |
|------|-----|---------------|
| 画像サイズ更新 | `Cmd+Alt+I` | `Ctrl+Alt+I` |
| 画像サイズ + Loading Lazy一括追加 | `Cmd+Alt+Shift+I` | `Ctrl+Alt+Shift+I` |

## 対応する画像形式

- JPEG
- PNG
- WebP
- GIF
- BMP
- SVG
- その他、image-sizeライブラリが対応する形式

## 対応する画像パス

- 相対パス（例: `images/photo.jpg`、`../assets/banner.png`）
- 絶対パス（例: `/Users/username/images/photo.jpg`）
- HTTP/HTTPS URL（例: `https://example.com/image.jpg`）

## エラーハンドリング

この拡張機能は堅牢なエラーハンドリングを実装しており、一部の画像で問題が発生しても処理を続行します。

### 処理の動作

- **画像が見つからない場合**: そのタグはスキップされ、次のタグの処理に進みます
- **URLが無効な場合**: そのタグはスキップされ、次のタグの処理に進みます
- **画像サイズの取得に失敗した場合**: そのタグはスキップされ、次のタグの処理に進みます

### 結果の通知

処理完了後、以下の情報が通知されます:
- 成功した画像タグの数
- 失敗した画像タグの数（失敗がある場合）
- 例: `Updated 5 image tag(s), 2 failed`

### 詳細ログの確認

失敗した画像の詳細情報を確認するには:
1. VSCodeの「表示」→「出力」を選択
2. 右上のドロップダウンから「Update Image Size for Source」を選択
3. 失敗した画像のパスやエラー理由を確認できます

## Changelog

### [0.2.0] - 2025-12-31

#### 新機能
- **ページ内すべての画像を一括更新**: ページ内のすべての `<img>` タグと `<source>` タグに対して、`width` と `height` 属性を一括で追加または更新
- **カーソル以降の画像にLoading Lazy追加**: ページ内のすべての画像にサイズを付与し、カーソル位置以降の `<img>` タグのみに `loading="lazy"` を追加（ファーストビューとスクロール後の画像を区別可能）

#### コマンド追加
- `Update All Image Sizes in Page` - ページ内すべての画像サイズを一括更新
- `Update All Image Sizes + Add Loading Lazy After Cursor` - すべての画像サイズを更新 + カーソル以降にloading="lazy"追加

#### 改善
- エラーハンドリングの強化: 画像が見つからない場合やサイズ取得に失敗した場合でも、処理を続行し他の画像を処理
- 失敗した画像の数を通知メッセージに表示
- 各タグの正確な位置を保持することで、同じ内容のタグが複数存在する場合でも正しく処理

#### バグ修正
- 同じ内容の画像タグが複数存在する場合に、誤ったタグが更新される問題を修正

### [0.1.9] - 2025-12-27

#### 新機能
- **`<picture>` タグ対応**: `<picture>` タグ上でコマンド実行時、タグ内のすべての `<source>` と `<img>` タグを自動更新

#### 改善
- `<source>` タグへの `loading="lazy"` 付与を廃止（`<source>` タグは `loading` 属性をサポートしていないため）
- `<img>` タグのみに `loading="lazy"` を付与するように改善

### [0.1.8] - 2025-12-27

#### バグ修正
- `<picture>` タグ上での実行時、`width` と `height` 属性が正しく付与されない問題を修正

### [0.1.7] - 2025-12-26

#### 初回公開リリース

#### 機能
- `<source>` タグと `<img>` タグのサイズを自動更新
- `width` と `height` 属性の自動追加・更新
- `loading="lazy"` 属性の追加
- `src` と `srcset` 属性の両方に対応
- ローカルファイルと HTTP/HTTPS URL の両方に対応

#### キーボードショートカット
- `Cmd+Alt+I` (Mac) / `Ctrl+Alt+I` (Windows/Linux) - 画像サイズ更新
- `Cmd+Alt+Shift+I` (Mac) / `Ctrl+Alt+Shift+I` (Windows/Linux) - サイズ + Loading Lazy追加
