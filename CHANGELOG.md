# Changelog

## [0.2.0] - 2025-12-31

### 新機能
- **ページ内すべての画像を一括更新**: ページ内のすべての `<img>` タグと `<source>` タグに対して、`width` と `height` 属性を一括で追加または更新する機能を追加
- **カーソル以降の画像にLoading Lazy追加**: ページ内のすべての画像にサイズを付与し、カーソル位置以降の `<img>` タグのみに `loading="lazy"` を追加する機能を追加（ファーストビューとスクロール後の画像を区別可能）

### コマンド追加
- `Update All Image Sizes in Page` - ページ内すべての画像サイズを一括更新
- `Update All Image Sizes + Add Loading Lazy After Cursor` - すべての画像サイズを更新 + カーソル以降にloading="lazy"追加

### 改善
- エラーハンドリングの強化: 画像が見つからない場合やサイズ取得に失敗した場合でも、処理を続行し他の画像を処理
- 失敗した画像の数を通知メッセージに表示
- 各タグの正確な位置を保持することで、同じ内容のタグが複数存在する場合でも正しく処理

### バグ修正
- 同じ内容の画像タグが複数存在する場合に、誤ったタグが更新される問題を修正

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
