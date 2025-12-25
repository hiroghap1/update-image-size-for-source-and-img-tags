import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import sizeOf from 'image-size';

// Create output channel for debugging
const outputChannel = vscode.window.createOutputChannel('Update Image Size for Source');

export function activate(context: vscode.ExtensionContext) {
    outputChannel.appendLine('Extension "update-image-size-source" is now active');

    // Command: Update image size
    let updateSizeCommand = vscode.commands.registerCommand('updateImageSizeSource.updateSize', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;

        try {
            await updateImageSize(editor, document, position);
        } catch (error) {
            outputChannel.appendLine(`Error: ${error}`);
            vscode.window.showErrorMessage(`Failed to update image size: ${error}`);
        }
    });

    // Command: Add loading="lazy"
    let addLoadingLazyCommand = vscode.commands.registerCommand('updateImageSizeSource.addLoadingLazy', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;

        try {
            await addLoadingLazy(editor, document, position);
        } catch (error) {
            outputChannel.appendLine(`Error: ${error}`);
            vscode.window.showErrorMessage(`Failed to add loading attribute: ${error}`);
        }
    });

    context.subscriptions.push(updateSizeCommand, addLoadingLazyCommand);
}

async function updateImageSize(
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    position: vscode.Position
) {
    // Find the image tag (source or img) that contains the cursor
    const imageTagInfo = findImageTag(document, position);

    if (!imageTagInfo) {
        vscode.window.showErrorMessage('Cursor is not inside a <source> or <img> tag');
        return;
    }

    const { tagRange, tagText, tagType } = imageTagInfo;

    outputChannel.appendLine(`Found ${tagType} tag: ${tagText}`);

    // Extract image path from srcset or src attribute
    const imagePath = extractImagePath(tagText, document.uri.fsPath);

    if (!imagePath) {
        outputChannel.appendLine(`Could not extract image path from tag: ${tagText}`);
        vscode.window.showErrorMessage('No valid image source found in <source> tag. Please ensure the tag has a src or srcset attribute.');
        outputChannel.show();
        return;
    }

    outputChannel.appendLine(`Resolved image path: ${imagePath}`);

    // Get image dimensions
    const dimensions = await getImageDimensions(imagePath);

    if (!dimensions) {
        outputChannel.appendLine(`Failed to read image dimensions from: ${imagePath}`);

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            vscode.window.showErrorMessage(`Image file not found: ${imagePath}\n\nPlease ensure the image file exists at this location.`);
        } else {
            vscode.window.showErrorMessage(`Could not read image dimensions from: ${imagePath}\n\nThe file exists but may be corrupted or in an unsupported format.`);
        }
        outputChannel.show();
        return;
    }

    outputChannel.appendLine(`Image dimensions: ${dimensions.width}x${dimensions.height}`);

    // Update or add width and height attributes
    const updatedTag = updateDimensions(tagText, dimensions.width, dimensions.height);

    // Apply the edit
    await editor.edit(editBuilder => {
        editBuilder.replace(tagRange, updatedTag);
    });

    vscode.window.showInformationMessage(
        `Updated image size: ${dimensions.width}x${dimensions.height}`
    );
}

async function addLoadingLazy(
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    position: vscode.Position
) {
    // Find the image tag (source or img) that contains the cursor
    const imageTagInfo = findImageTag(document, position);

    if (!imageTagInfo) {
        vscode.window.showErrorMessage('Cursor is not inside a <source> or <img> tag');
        return;
    }

    const { tagRange, tagText, tagType } = imageTagInfo;

    outputChannel.appendLine(`Found ${tagType} tag: ${tagText}`);

    // Extract image path from srcset or src attribute
    const imagePath = extractImagePath(tagText, document.uri.fsPath);

    if (!imagePath) {
        outputChannel.appendLine(`Could not extract image path from tag: ${tagText}`);
        vscode.window.showErrorMessage('No valid image source found. Please ensure the tag has a src or srcset attribute.');
        outputChannel.show();
        return;
    }

    outputChannel.appendLine(`Resolved image path: ${imagePath}`);

    // Get image dimensions
    const dimensions = await getImageDimensions(imagePath);

    if (!dimensions) {
        outputChannel.appendLine(`Failed to read image dimensions from: ${imagePath}`);

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            vscode.window.showErrorMessage(`Image file not found: ${imagePath}\n\nPlease ensure the image file exists at this location.`);
        } else {
            vscode.window.showErrorMessage(`Could not read image dimensions from: ${imagePath}\n\nThe file exists but may be corrupted or in an unsupported format.`);
        }
        outputChannel.show();
        return;
    }

    outputChannel.appendLine(`Image dimensions: ${dimensions.width}x${dimensions.height}`);

    // Update dimensions and add loading="lazy"
    let updatedTag = updateDimensions(tagText, dimensions.width, dimensions.height);
    updatedTag = updateLoadingAttribute(updatedTag);

    // Apply the edit
    await editor.edit(editBuilder => {
        editBuilder.replace(tagRange, updatedTag);
    });

    vscode.window.showInformationMessage(
        `Updated: ${dimensions.width}x${dimensions.height} + loading="lazy"`
    );
}

function findImageTag(
    document: vscode.TextDocument,
    position: vscode.Position
): { tagRange: vscode.Range; tagText: string; tagType: string } | null {
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Try to find <source> tag first
    let sourceStart = text.lastIndexOf('<source', offset);
    let imgStart = text.lastIndexOf('<img', offset);

    // Determine which tag is closest to the cursor
    let openStart = -1;
    let tagType = '';

    if (sourceStart !== -1 && imgStart !== -1) {
        // Both tags found, use the one that's closer (higher index)
        if (sourceStart > imgStart) {
            openStart = sourceStart;
            tagType = 'source';
        } else {
            openStart = imgStart;
            tagType = 'img';
        }
    } else if (sourceStart !== -1) {
        openStart = sourceStart;
        tagType = 'source';
    } else if (imgStart !== -1) {
        openStart = imgStart;
        tagType = 'img';
    } else {
        return null;
    }

    // Find closing >
    let closeEnd = text.indexOf('>', offset);
    if (closeEnd === -1) {
        closeEnd = text.indexOf('>', openStart);
    }

    if (closeEnd === -1 || closeEnd < openStart) {
        return null;
    }

    const tagEndIndex = closeEnd + 1;

    // Verify cursor is within the tag
    if (offset < openStart || offset > tagEndIndex) {
        return null;
    }

    const tagText = text.substring(openStart, tagEndIndex);
    const tagRange = new vscode.Range(
        document.positionAt(openStart),
        document.positionAt(tagEndIndex)
    );

    return { tagRange, tagText, tagType };
}

function extractImagePath(tagText: string, documentPath: string): string | null {
    outputChannel.appendLine(`Extracting image path from: ${tagText}`);

    // Try to extract from srcset first
    // Pattern matches: srcset="path" or srcset='path'
    const srcsetMatch = tagText.match(/srcset\s*=\s*["']([^"']+)["']/);
    if (srcsetMatch) {
        outputChannel.appendLine(`Found srcset attribute: ${srcsetMatch[1]}`);
        // Extract the first URL from srcset (before any size descriptor like 2x, 1.5x, etc.)
        const srcsetUrl = srcsetMatch[1].split(/[\s,]+/)[0];
        outputChannel.appendLine(`Extracted URL from srcset: ${srcsetUrl}`);
        return resolveImagePath(srcsetUrl, documentPath);
    }

    // Try to extract from src
    // Pattern matches: src="path" or src='path'
    const srcMatch = tagText.match(/src\s*=\s*["']([^"']+)["']/);
    if (srcMatch) {
        outputChannel.appendLine(`Found src attribute: ${srcMatch[1]}`);
        return resolveImagePath(srcMatch[1], documentPath);
    }

    outputChannel.appendLine('No src or srcset attribute found');
    return null;
}

function resolveImagePath(imagePath: string, documentPath: string): string {
    outputChannel.appendLine(`Resolving image path: ${imagePath}`);
    outputChannel.appendLine(`Document path: ${documentPath}`);

    // If it's an absolute path or URL, return as is
    if (path.isAbsolute(imagePath) || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        outputChannel.appendLine(`Using absolute path or URL: ${imagePath}`);
        return imagePath;
    }

    // Resolve relative path based on document location
    const documentDir = path.dirname(documentPath);
    const resolved = path.resolve(documentDir, imagePath);
    outputChannel.appendLine(`Resolved relative path: ${resolved}`);
    return resolved;
}

async function getImageDimensions(imagePath: string): Promise<{ width: number; height: number } | null> {
    try {
        // Check if it's a URL
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            outputChannel.appendLine(`Downloading image from URL: ${imagePath}`);
            const buffer = await downloadImage(imagePath);

            if (!buffer) {
                outputChannel.appendLine('Failed to download image');
                return null;
            }

            const dimensions = sizeOf(buffer);

            if (!dimensions.width || !dimensions.height) {
                outputChannel.appendLine('Image dimensions not found in downloaded image');
                return null;
            }

            return {
                width: dimensions.width,
                height: dimensions.height
            };
        }

        // Local file path
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            outputChannel.appendLine(`Local file not found: ${imagePath}`);
            return null;
        }

        const dimensions = sizeOf(imagePath);

        if (!dimensions.width || !dimensions.height) {
            outputChannel.appendLine('Image dimensions not found in local file');
            return null;
        }

        return {
            width: dimensions.width,
            height: dimensions.height
        };
    } catch (error) {
        outputChannel.appendLine(`Error reading image dimensions: ${error}`);
        return null;
    }
}

function downloadImage(url: string): Promise<Buffer | null> {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https://') ? https : http;

        protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                if (response.headers.location) {
                    outputChannel.appendLine(`Redirected to: ${response.headers.location}`);
                    return resolve(downloadImage(response.headers.location));
                }
            }

            if (response.statusCode !== 200) {
                outputChannel.appendLine(`HTTP error: ${response.statusCode}`);
                resolve(null);
                return;
            }

            const chunks: Buffer[] = [];

            response.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });

            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                outputChannel.appendLine(`Downloaded ${buffer.length} bytes`);
                resolve(buffer);
            });

            response.on('error', (error) => {
                outputChannel.appendLine(`Download error: ${error.message}`);
                resolve(null);
            });
        }).on('error', (error) => {
            outputChannel.appendLine(`Request error: ${error.message}`);
            resolve(null);
        });
    });
}

function updateDimensions(tagText: string, width: number, height: number): string {
    let updatedTag = tagText;

    // Check if width attribute exists
    const widthRegex = /\s+width=["']?\d+["']?/;
    const heightRegex = /\s+height=["']?\d+["']?/;

    if (widthRegex.test(updatedTag)) {
        // Update existing width
        updatedTag = updatedTag.replace(widthRegex, ` width="${width}"`);
    } else {
        // Add width before the closing >
        updatedTag = updatedTag.replace(/>$/, ` width="${width}">`);
    }

    if (heightRegex.test(updatedTag)) {
        // Update existing height
        updatedTag = updatedTag.replace(heightRegex, ` height="${height}"`);
    } else {
        // Add height before the closing >
        updatedTag = updatedTag.replace(/>$/, ` height="${height}">`);
    }

    return updatedTag;
}

function updateLoadingAttribute(tagText: string): string {
    let updatedTag = tagText;

    // Check if loading attribute exists
    const loadingRegex = /\s+loading=["'][^"']*["']/;

    if (loadingRegex.test(updatedTag)) {
        // Update existing loading attribute
        updatedTag = updatedTag.replace(loadingRegex, ` loading="lazy"`);
    } else {
        // Add loading="lazy" before the closing >
        updatedTag = updatedTag.replace(/>$/, ` loading="lazy">`);
    }

    return updatedTag;
}

export function deactivate() {}
