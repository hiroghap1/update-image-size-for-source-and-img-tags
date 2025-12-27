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
    // First, try to find a source or img tag at cursor position
    const imageTagInfo = findImageTag(document, position);
    
    if (imageTagInfo) {
        // Found a source or img tag - update only this tag
        const { tagRange, tagText, tagType } = imageTagInfo;
        
        outputChannel.appendLine(`Found ${tagType} tag: ${tagText}`);

        const imagePath = extractImagePath(tagText, document.uri.fsPath);

        if (!imagePath) {
            outputChannel.appendLine(`Could not extract image path from tag: ${tagText}`);
            vscode.window.showErrorMessage('No valid image source found. Please ensure the tag has a src or srcset attribute.');
            outputChannel.show();
            return;
        }

        outputChannel.appendLine(`Resolved image path: ${imagePath}`);

        const dimensions = await getImageDimensions(imagePath);

        if (!dimensions) {
            outputChannel.appendLine(`Failed to read image dimensions from: ${imagePath}`);

            if (!fs.existsSync(imagePath)) {
                vscode.window.showErrorMessage(`Image file not found: ${imagePath}\n\nPlease ensure the image file exists at this location.`);
            } else {
                vscode.window.showErrorMessage(`Could not read image dimensions from: ${imagePath}\n\nThe file exists but may be corrupted or in an unsupported format.`);
            }
            outputChannel.show();
            return;
        }

        outputChannel.appendLine(`Image dimensions: ${dimensions.width}x${dimensions.height}`);

        const updatedTag = updateDimensions(tagText, dimensions.width, dimensions.height);

        await editor.edit(editBuilder => {
            editBuilder.replace(tagRange, updatedTag);
        });

        vscode.window.showInformationMessage(
            `Updated image size: ${dimensions.width}x${dimensions.height}`
        );
        return;
    }

    // If no image tag found, check if cursor is on a picture tag
    const pictureInfo = findPictureTag(document, position);
    
    if (pictureInfo) {
        // Handle picture tag case - update all source and img tags within it
        await updatePictureTagSize(editor, document, pictureInfo);
        return;
    }

    vscode.window.showErrorMessage('Cursor is not inside a <source>, <img>, or <picture> tag');
}

async function addLoadingLazy(
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    position: vscode.Position
) {
    // First, try to find a source or img tag at cursor position
    const imageTagInfo = findImageTag(document, position);
    
    if (imageTagInfo) {
        // Found a source or img tag - update only this tag
        const { tagRange, tagText, tagType } = imageTagInfo;
        
        outputChannel.appendLine(`Found ${tagType} tag: ${tagText}`);

        const imagePath = extractImagePath(tagText, document.uri.fsPath);

        if (!imagePath) {
            outputChannel.appendLine(`Could not extract image path from tag: ${tagText}`);
            vscode.window.showErrorMessage('No valid image source found. Please ensure the tag has a src or srcset attribute.');
            outputChannel.show();
            return;
        }

        outputChannel.appendLine(`Resolved image path: ${imagePath}`);

        const dimensions = await getImageDimensions(imagePath);

        if (!dimensions) {
            outputChannel.appendLine(`Failed to read image dimensions from: ${imagePath}`);

            if (!fs.existsSync(imagePath)) {
                vscode.window.showErrorMessage(`Image file not found: ${imagePath}\n\nPlease ensure the image file exists at this location.`);
            } else {
                vscode.window.showErrorMessage(`Could not read image dimensions from: ${imagePath}\n\nThe file exists but may be corrupted or in an unsupported format.`);
            }
            outputChannel.show();
            return;
        }

        outputChannel.appendLine(`Image dimensions: ${dimensions.width}x${dimensions.height}`);

        let updatedTag = updateDimensions(tagText, dimensions.width, dimensions.height);
        
        // Add loading="lazy" only to img tags
        if (tagType === 'img') {
            updatedTag = updateLoadingAttribute(updatedTag);
        }

        await editor.edit(editBuilder => {
            editBuilder.replace(tagRange, updatedTag);
        });

        if (tagType === 'img') {
            vscode.window.showInformationMessage(
                `Updated: ${dimensions.width}x${dimensions.height} + loading="lazy"`
            );
        } else {
            vscode.window.showInformationMessage(
                `Updated image size: ${dimensions.width}x${dimensions.height}`
            );
        }
        return;
    }

    // If no image tag found, check if cursor is on a picture tag
    const pictureInfo = findPictureTag(document, position);
    
    if (pictureInfo) {
        // Handle picture tag case - update all source and img tags within it
        await updatePictureTagWithLazy(editor, document, pictureInfo);
        return;
    }

    vscode.window.showErrorMessage('Cursor is not inside a <source>, <img>, or <picture> tag');
}

function findImageTag(
    document: vscode.TextDocument,
    position: vscode.Position
): { tagRange: vscode.Range; tagText: string; tagType: string } | null {
    const text = document.getText();
    const offset = document.offsetAt(position);

    // First, check if cursor is within a picture opening tag
    const pictureOpenStart = text.lastIndexOf('<picture', offset);
    if (pictureOpenStart !== -1) {
        const pictureOpenEnd = text.indexOf('>', pictureOpenStart);
        // If cursor is within the picture opening tag, don't find image tags
        if (pictureOpenEnd !== -1 && offset >= pictureOpenStart && offset <= pictureOpenEnd) {
            return null;
        }
    }

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

function findPictureTag(
    document: vscode.TextDocument,
    position: vscode.Position
): { tagRange: vscode.Range; tagText: string } | null {
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Find the nearest <picture tag before cursor
    const pictureStart = text.lastIndexOf('<picture', offset);
    
    if (pictureStart === -1) {
        return null;
    }

    // Find the closing > of the opening <picture> tag
    const pictureOpenEnd = text.indexOf('>', pictureStart);
    if (pictureOpenEnd === -1) {
        return null;
    }

    // Verify cursor is within the opening <picture> tag only (between < and >)
    if (offset < pictureStart || offset > pictureOpenEnd) {
        return null;
    }

    // Find the closing </picture> tag after the opening tag
    const pictureCloseStart = text.indexOf('</picture>', pictureOpenEnd);
    if (pictureCloseStart === -1) {
        return null;
    }

    const pictureCloseEnd = pictureCloseStart + '</picture>'.length;

    const tagText = text.substring(pictureStart, pictureCloseEnd);
    const tagRange = new vscode.Range(
        document.positionAt(pictureStart),
        document.positionAt(pictureCloseEnd)
    );

    return { tagRange, tagText };
}

async function updatePictureTagSize(
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    pictureInfo: { tagRange: vscode.Range; tagText: string }
): Promise<void> {
    const { tagRange, tagText } = pictureInfo;
    
    outputChannel.appendLine(`Found picture tag`);
    outputChannel.appendLine(`Picture tag content: ${tagText}`);

    // Extract all source and img tags
    const sourceTags = extractTagsFromText(tagText, 'source');
    const imgTags = extractTagsFromText(tagText, 'img');

    outputChannel.appendLine(`Found ${sourceTags.length} source tags and ${imgTags.length} img tags`);
    
    if (sourceTags.length > 0) {
        sourceTags.forEach((tag, idx) => {
            outputChannel.appendLine(`Source tag ${idx}: ${tag.text}`);
        });
    }
    
    if (imgTags.length > 0) {
        imgTags.forEach((tag, idx) => {
            outputChannel.appendLine(`Img tag ${idx}: ${tag.text}`);
        });
    }

    if (sourceTags.length === 0 && imgTags.length === 0) {
        vscode.window.showErrorMessage('No <source> or <img> tags found within <picture>');
        return;
    }

    // Combine all tags
    const allTags = [...sourceTags, ...imgTags];

    // Get dimensions for each tag individually
    let updatedPictureTag = tagText;
    let successCount = 0;
    
    for (const tag of allTags) {
        const imagePath = extractImagePath(tag.text, document.uri.fsPath);
        if (!imagePath) {
            outputChannel.appendLine(`Could not extract image path from: ${tag.text}`);
            continue;
        }

        outputChannel.appendLine(`Resolved image path: ${imagePath}`);
        const dimensions = await getImageDimensions(imagePath);
        
        if (!dimensions) {
            outputChannel.appendLine(`Failed to get dimensions for: ${imagePath}`);
            continue;
        }

        outputChannel.appendLine(`Image dimensions for this tag: ${dimensions.width}x${dimensions.height}`);

        const updatedTag = updateDimensions(tag.text, dimensions.width, dimensions.height);
        outputChannel.appendLine(`Original tag: ${tag.text}`);
        outputChannel.appendLine(`Updated tag: ${updatedTag}`);
        
        updatedPictureTag = updatedPictureTag.split(tag.text).join(updatedTag);
        successCount++;
    }

    if (successCount === 0) {
        vscode.window.showErrorMessage('Could not determine image dimensions for any tag within <picture>');
        outputChannel.show();
        return;
    }

    outputChannel.appendLine(`Final picture tag: ${updatedPictureTag}`);

    // Apply the edit
    await editor.edit(editBuilder => {
        editBuilder.replace(tagRange, updatedPictureTag);
    });

    vscode.window.showInformationMessage(
        `Updated ${successCount} tag(s) in <picture> with their respective dimensions`
    );
}

async function updatePictureTagWithLazy(
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    pictureInfo: { tagRange: vscode.Range; tagText: string }
): Promise<void> {
    const { tagRange, tagText } = pictureInfo;
    
    outputChannel.appendLine(`Found picture tag`);
    outputChannel.appendLine(`Picture tag content: ${tagText}`);

    // Extract all source and img tags
    const sourceTags = extractTagsFromText(tagText, 'source');
    const imgTags = extractTagsFromText(tagText, 'img');

    outputChannel.appendLine(`Found ${sourceTags.length} source tags and ${imgTags.length} img tags`);
    
    if (sourceTags.length > 0) {
        sourceTags.forEach((tag, idx) => {
            outputChannel.appendLine(`Source tag ${idx}: ${tag.text}`);
        });
    }
    
    if (imgTags.length > 0) {
        imgTags.forEach((tag, idx) => {
            outputChannel.appendLine(`Img tag ${idx}: ${tag.text}`);
        });
    }

    if (sourceTags.length === 0 && imgTags.length === 0) {
        vscode.window.showErrorMessage('No <source> or <img> tags found within <picture>');
        return;
    }

    // Combine all tags
    const allTags = [...sourceTags, ...imgTags];

    // Get dimensions for each tag individually
    let updatedPictureTag = tagText;
    let successCount = 0;
    
    for (const tag of allTags) {
        const imagePath = extractImagePath(tag.text, document.uri.fsPath);
        if (!imagePath) {
            outputChannel.appendLine(`Could not extract image path from: ${tag.text}`);
            continue;
        }

        outputChannel.appendLine(`Resolved image path: ${imagePath}`);
        const dimensions = await getImageDimensions(imagePath);
        
        if (!dimensions) {
            outputChannel.appendLine(`Failed to get dimensions for: ${imagePath}`);
            continue;
        }

        outputChannel.appendLine(`Image dimensions for this tag: ${dimensions.width}x${dimensions.height}`);

        let updatedTag = updateDimensions(tag.text, dimensions.width, dimensions.height);
        
        // Add loading="lazy" only to img tags
        if (tag.type === 'img') {
            updatedTag = updateLoadingAttribute(updatedTag);
        }
        
        outputChannel.appendLine(`Original tag: ${tag.text}`);
        outputChannel.appendLine(`Updated tag: ${updatedTag}`);
        
        updatedPictureTag = updatedPictureTag.split(tag.text).join(updatedTag);
        successCount++;
    }

    if (successCount === 0) {
        vscode.window.showErrorMessage('Could not determine image dimensions for any tag within <picture>');
        outputChannel.show();
        return;
    }

    outputChannel.appendLine(`Final picture tag: ${updatedPictureTag}`);

    // Apply the edit
    await editor.edit(editBuilder => {
        editBuilder.replace(tagRange, updatedPictureTag);
    });

    vscode.window.showInformationMessage(
        `Updated ${successCount} tag(s) in <picture> with their respective dimensions and loading="lazy" to <img>`
    );
}

function extractTagsFromText(text: string, tagName: string): Array<{ text: string; type: string }> {
    const regex = new RegExp(`<${tagName}[^>]*>`, 'g');
    const tags: Array<{ text: string; type: string }> = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        tags.push({ text: match[0], type: tagName });
    }

    return tags;
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
        // Add height before the closing > - check again after width might have been added
        if (!updatedTag.endsWith('>')) {
            updatedTag += '>';
        }
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
