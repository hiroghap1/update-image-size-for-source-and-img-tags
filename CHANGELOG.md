# Changelog

## [0.1.9] - 2025-12-27

### 新機能
- **`<picture>` タグ対応**: `<picture>` タグ上でコマンド実行時、タグ内のすべての `<source>` と `<img>` タグを自動更新

### 改善
- `<source>` タグへの `loading="lazy"` 付与を廃止（`<source>` タグは `loading` 属性をサポートしていないため）
- `<img>` タグのみに `loading="lazy"` を付与するように改善

## [0.1.8] - 2025-12-27

### バグ修正
- `<picture>` タグ上での実行時、`width` と `height` 属性が正しく付与されない問題を修正

## [0.1.7] - 2025-12-26

### 初回公開リリース

### 機能
- `<source>` タグと `<img>` タグのサイズを自動更新
- `width` と `height` 属性の自動追加・更新
- `loading="lazy"` 属性の追加
- `src` と `srcset` 属性の両方に対応
- ローカルファイルと HTTP/HTTPS URL の両方に対応

### キーボードショートカット
- `Cmd+Alt+I` (Mac) / `Ctrl+Alt+I` (Windows/Linux) - 画像サイズ更新
- `Cmd+Alt+Shift+I` (Mac) / `Ctrl+Alt+Shift+I` (Windows/Linux) - サイズ + Loading Lazy追加
