# Update Image Size for Source and Img Tags

VS Code拡張機能で、Emmetの「Update Image Size」機能を`<source>`タグと`<img>`タグで使えるようにします。さらに、`loading="lazy"`属性も簡単に追加できます。

## 機能

### 1. 画像サイズの自動更新
- `<source>`タグと`<img>`タグ内の画像パスから画像サイズを自動取得
- `width`と`height`属性を自動的に追加または更新
- `src`属性と`srcset`属性の両方に対応

### 2. 画像サイズ + Loading Lazy属性の一括追加
- `<source>`タグと`<img>`タグに`width`、`height`、`loading="lazy"`属性を一括で追加
- 既存の属性がある場合は更新

## 使い方

### 画像サイズの更新

1. HTMLファイルを開く
2. `<source>`タグまたは`<img>`タグ内にカーソルを置く
3. 以下のいずれかの方法でコマンドを実行：
   - コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）から「**Update Image Size**」を選択
   - キーボードショートカット：`Cmd+Alt+I`（Mac）/ `Ctrl+Alt+I`（Windows/Linux）

### 画像サイズ + Loading Lazy属性の一括追加

1. HTMLファイルを開く
2. `<source>`タグまたは`<img>`タグ内にカーソルを置く
3. 以下のいずれかの方法でコマンドを実行：
   - コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）から「**Update Image Size + Add Loading Lazy**」を選択
   - キーボードショートカット：`Cmd+Alt+Shift+I`（Mac）/ `Ctrl+Alt+Shift+I`（Windows/Linux）

## 例

### 画像サイズ更新の例

#### 実行前
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Sample">
</picture>
```

#### 実行後（画像が800x600pxの場合）
```html
<picture>
  <source srcset="image.webp" type="image/webp" width="800" height="600">
  <img src="image.jpg" alt="Sample" width="800" height="600">
</picture>
```

### 画像サイズ + Loading Lazy一括追加の例

#### 実行前
```html
<img src="image.jpg" alt="Sample">
```

#### 実行後（画像が800x600pxの場合）
```html
<img src="image.jpg" alt="Sample" width="800" height="600" loading="lazy">
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
