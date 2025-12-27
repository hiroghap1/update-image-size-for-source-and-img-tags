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
