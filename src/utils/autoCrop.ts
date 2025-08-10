import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

function findBoundingBox(imageData: ImageData): { x: number; y: number; width: number; height: number } | null {
  const { data, width, height } = imageData;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let hasContent = false;

  // Find bounds of non-transparent pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 50) { // Consider pixels with alpha > 50 as content
        hasContent = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!hasContent) return null;

  // Add some padding
  const padding = 20;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

export const autoCropImage = async (imageFile: File): Promise<File> => {
  try {
    console.log('Starting auto-crop process...');

    // Load image
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });

    // Create segmentation pipeline
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });

    // Convert image to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    resizeImageIfNeeded(canvas, ctx, image);
    
    // Get image data for segmentation
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Process with segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }

    // Create mask canvas
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) throw new Error('Could not get mask canvas context');

    // Draw original image
    maskCtx.drawImage(canvas, 0, 0);

    // Apply mask to find object bounds
    const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const data = maskImageData.data;

    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }

    maskCtx.putImageData(maskImageData, 0, 0);

    // Find bounding box of the subject
    const boundingBox = findBoundingBox(maskImageData);
    
    if (!boundingBox) {
      console.log('No object detected, returning original image');
      return imageFile;
    }

    console.log('Bounding box found:', boundingBox);

    // Create cropped canvas
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = boundingBox.width;
    croppedCanvas.height = boundingBox.height;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) throw new Error('Could not get cropped canvas context');

    // Draw cropped portion of original image
    croppedCtx.drawImage(
      canvas,
      boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height,
      0, 0, boundingBox.width, boundingBox.height
    );

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      croppedCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create cropped blob'));
          }
        },
        'image/jpeg',
        0.9
      );
    });

    // Create new File object
    const croppedFile = new File([blob], imageFile.name, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    console.log('Auto-crop completed successfully');
    URL.revokeObjectURL(image.src);
    
    return croppedFile;

  } catch (error) {
    console.error('Error in auto-crop:', error);
    // Return original file if cropping fails
    return imageFile;
  }
};