'use client';

/**
 * Advanced Client-Side Real-Time Computer Vision & Malpractice Detector
 * Dual-layer architecture:
 * Layer 1: High-sensitivity TensorFlow COCO-SSD object & device detection
 * Layer 2: Optical frame contour & rectangular device edge analyzer
 */

export interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export interface FrameAnalysisResult {
  phoneDetected: boolean;
  multiplePeopleDetected: boolean;
  noFaceDetected: boolean;
  gazeAway: boolean;
  peopleCount: number;
  detectedObjects: DetectedObject[];
  phoneConfidence?: number;
  detectedReason?: string;
  engine: 'coco-ssd' | 'optical-cv' | 'hybrid';
}

let cocoModelPromise: Promise<any> | null = null;
let cachedModel: any = null;
let isModelLoading = false;
let modelLoadFailed = false;

// Prohibited devices that trigger phone / cheating malpractice
const FORBIDDEN_DEVICE_CLASSES = new Set([
  'cell phone',
  'remote',
  'book',
  'laptop',
  'mouse',
  'keyboard',
  'electronic device',
  'tablet',
  'tv',
]);

/**
 * Initialize COCO-SSD model dynamically in client browser
 */
export async function loadVisionModel(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if (cachedModel) return cachedModel;
  if (modelLoadFailed) return null;

  if (cocoModelPromise) {
    return cocoModelPromise;
  }

  isModelLoading = true;
  cocoModelPromise = (async () => {
    try {
      const tf = await import('@tensorflow/tfjs');
      try {
        await tf.ready();
      } catch (e) {
        console.warn('TF ready warning:', e);
      }

      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      // Load mobilenet_v2 for fast, high-accuracy inference
      const model = await cocoSsd.load({ base: 'mobilenet_v2' });
      cachedModel = model;
      isModelLoading = false;
      return model;
    } catch (err) {
      console.warn('COCO-SSD initial load note:', err);
      // Try lite fallback
      try {
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        const fallbackModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        cachedModel = fallbackModel;
        isModelLoading = false;
        return fallbackModel;
      } catch (fallbackErr) {
        console.error('All COCO-SSD load attempts failed:', fallbackErr);
        modelLoadFailed = true;
        isModelLoading = false;
        return null;
      }
    }
  })();

  return cocoModelPromise;
}

export function isVisionModelReady(): boolean {
  return cachedModel !== null;
}

// Reusable offscreen canvas for optical pixel analysis
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getOffscreenContext(w = 160, h = 120) {
  if (typeof window === 'undefined') return null;
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = w;
    offscreenCanvas.height = h;
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
  }
  return offscreenCtx;
}

/**
 * Optical Handheld Device & Screen Contour Analyzer
 * Inspects rectangular contrast edges in the video frame (typical of phones held up in hand)
 */
function detectOpticalDevice(video: HTMLVideoElement): { detected: boolean; bbox?: [number, number, number, number]; confidence: number } {
  try {
    const ctx = getOffscreenContext(160, 120);
    if (!ctx || !video || video.readyState < 2) return { detected: false, confidence: 0 };

    ctx.drawImage(video, 0, 0, 160, 120);
    const frame = ctx.getImageData(0, 0, 160, 120);
    const data = frame.data;

    // Scan for rectangular high-contrast phone/screen clusters in the lower 80% of frame
    // Phone typically appears between y: 25 to 110, x: 20 to 140
    let darkRectPixels = 0;
    let brightScreenPixels = 0;
    let minX = 160, maxX = 0, minY = 120, maxY = 0;

    for (let y = 30; y < 115; y += 2) {
      for (let x = 20; x < 140; x += 2) {
        const idx = (y * 160 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // Check for sharp dark rectangular bezel/body or bright phone screen
        const isDevicePixel = brightness < 35 || (brightness > 230 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20);
        if (isDevicePixel) {
          if (brightness < 35) darkRectPixels++;
          else brightScreenPixels++;

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const totalMatches = darkRectPixels + brightScreenPixels;
    const boxW = maxX - minX;
    const boxH = maxY - minY;

    if (totalMatches >= 35 && boxW >= 14 && boxH >= 20) {
      const aspectRatio = boxH / Math.max(1, boxW);
      // Phones held vertically have aspect ratio between 1.3 and 2.5; horizontally 0.4 to 0.75
      if ((aspectRatio >= 1.25 && aspectRatio <= 2.8) || (aspectRatio >= 0.38 && aspectRatio <= 0.8)) {
        const scaleX = (video.videoWidth || 640) / 160;
        const scaleY = (video.videoHeight || 480) / 120;
        return {
          detected: true,
          confidence: Math.min(94, 65 + Math.round(totalMatches / 2)),
          bbox: [minX * scaleX, minY * scaleY, boxW * scaleX, boxH * scaleY],
        };
      }
    }

    return { detected: false, confidence: 0 };
  } catch {
    return { detected: false, confidence: 0 };
  }
}

/**
 * Detect malpractice in a live video element using client-side AI + Optical analysis
 */
export async function analyzeVideoFrame(
  video: HTMLVideoElement,
  sensitivity: 'standard' | 'high' | 'ultra' = 'high'
): Promise<FrameAnalysisResult> {
  const defaultResult: FrameAnalysisResult = {
    phoneDetected: false,
    multiplePeopleDetected: false,
    noFaceDetected: false,
    gazeAway: false,
    peopleCount: 1,
    detectedObjects: [],
    engine: 'hybrid',
  };

  if (!video || video.readyState < 2 || video.videoWidth === 0) {
    return defaultResult;
  }

  // Set detection thresholds based on sensitivity setting
  const minConfidence = sensitivity === 'ultra' ? 0.10 : sensitivity === 'high' ? 0.15 : 0.25;
  const phoneMinScore = sensitivity === 'ultra' ? 12 : sensitivity === 'high' ? 16 : 28;

  try {
    const model = await loadVisionModel();
    let detectedObjects: DetectedObject[] = [];

    if (model) {
      // Run detection with ultra-sensitive threshold to never miss a phone or device
      const predictions: Array<{
        bbox: [number, number, number, number];
        class: string;
        score: number;
      }> = await model.detect(video, 25, minConfidence);

      detectedObjects = predictions.map(p => ({
        class: p.class.toLowerCase(),
        score: Math.round(p.score * 100),
        bbox: p.bbox,
      }));
    }

    // 1. Check for Mobile Phone / Prohibited Devices via AI
    const phoneMatches = detectedObjects.filter(
      obj => FORBIDDEN_DEVICE_CLASSES.has(obj.class) && obj.score >= phoneMinScore
    );

    let phoneDetected = phoneMatches.length > 0;
    let phoneConfidence = phoneDetected ? Math.max(...phoneMatches.map(p => p.score)) : undefined;
    let detectedReason = phoneDetected ? `AI identified ${phoneMatches[0].class} (${phoneMatches[0].score}%)` : undefined;

    // 2. Optical Contour Check if AI didn't catch or as secondary confirmation
    const optical = detectOpticalDevice(video);
    if (optical.detected && (!phoneDetected || optical.confidence > (phoneConfidence || 0))) {
      phoneDetected = true;
      phoneConfidence = Math.max(phoneConfidence || 0, optical.confidence);
      detectedReason = detectedReason || `Optical device contour detected (${optical.confidence}%)`;

      if (optical.bbox) {
        detectedObjects.push({
          class: 'cell phone',
          score: optical.confidence,
          bbox: optical.bbox,
        });
      }
    }

    // 3. People Detection
    const peopleMatches = detectedObjects.filter(
      obj => obj.class === 'person' && obj.score >= (sensitivity === 'ultra' ? 15 : 20)
    );
    const peopleCount = peopleMatches.length;

    // If model didn't run or is loading, assume 1 person unless optical shows empty frame
    const noFaceDetected = model ? peopleCount === 0 : false;
    const multiplePeopleDetected = peopleCount >= 2;

    // 4. Gaze / Head Pose Deviation
    let gazeAway = false;
    if (peopleCount === 1 && video.videoWidth > 0) {
      const person = peopleMatches[0];
      const personCenterX = person.bbox[0] + person.bbox[2] / 2;
      const frameCenterX = video.videoWidth / 2;
      const ratio = Math.abs(personCenterX - frameCenterX) / frameCenterX;

      // Also check if head is tilted far down (top of person bbox is deep down the frame)
      const personTopY = person.bbox[1];
      const isLookingDown = personTopY > video.videoHeight * 0.35;

      // Skewed far to the periphery (>38% deviation from center) or looking down
      if (ratio > 0.38 || isLookingDown) {
        gazeAway = true;
      }
    }

    return {
      phoneDetected,
      multiplePeopleDetected,
      noFaceDetected,
      gazeAway,
      peopleCount,
      detectedObjects,
      phoneConfidence,
      detectedReason,
      engine: model ? 'hybrid' : 'optical-cv',
    };
  } catch (err) {
    console.warn('Vision detection cycle fallback:', err);
    // Even if TensorFlow crashes, optical CV still runs!
    const optical = detectOpticalDevice(video);
    return {
      ...defaultResult,
      phoneDetected: optical.detected,
      phoneConfidence: optical.confidence,
      engine: 'optical-cv',
    };
  }
}

/**
 * Render HUD bounding boxes and detection tags on overlay canvas
 */
export function drawDetectionOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  analysis: FrameAnalysisResult
) {
  if (!canvas || !video) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const displayWidth = canvas.clientWidth || video.clientWidth || 320;
  const displayHeight = canvas.clientHeight || video.clientHeight || 180;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scaleX = canvas.width / (video.videoWidth || canvas.width);
  const scaleY = canvas.height / (video.videoHeight || canvas.height);

  // Draw detected objects
  analysis.detectedObjects.forEach(obj => {
    const [x, y, w, h] = obj.bbox;
    const drawX = Math.max(0, x * scaleX);
    const drawY = Math.max(0, y * scaleY);
    const drawW = Math.min(canvas.width - drawX, w * scaleX);
    const drawH = Math.min(canvas.height - drawY, h * scaleY);

    if (FORBIDDEN_DEVICE_CLASSES.has(obj.class)) {
      // Pulsing bright red bounding box for phone / device
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(drawX, drawY, drawW, drawH);

      // Semi-transparent alert background
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(drawX, drawY, drawW, drawH);

      // Label badge
      const label = `🚨 ${obj.class.toUpperCase()} DETECTED ${obj.score}%`;
      ctx.font = 'bold 11px sans-serif';
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(drawX, Math.max(0, drawY - 20), textWidth + 12, 20);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, drawX + 6, Math.max(14, drawY - 6));
    } else if (obj.class === 'person') {
      const isExtra = analysis.multiplePeopleDetected && obj !== analysis.detectedObjects.find(o => o.class === 'person');
      const color = isExtra ? '#f97316' : '#22c55e';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(drawX, drawY, drawW, drawH);
      ctx.setLineDash([]);

      const label = isExtra ? `⚠️ EXTRA PERSON ${obj.score}%` : `👤 CANDIDATE ${obj.score}%`;
      ctx.font = 'bold 10px sans-serif';
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = color;
      ctx.fillRect(drawX, Math.max(0, drawY - 18), textWidth + 10, 18);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, drawX + 5, Math.max(13, drawY - 5));
    }
  });

  // Top-left HUD Status Badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(8, 8, 145, 22);
  ctx.strokeStyle = analysis.phoneDetected ? '#ef4444' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, 145, 22);

  // Status dot
  ctx.beginPath();
  ctx.arc(18, 19, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = analysis.phoneDetected ? '#ef4444' : '#22c55e';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText(
    analysis.phoneDetected ? 'PHONE DETECTED' : 'AI PROCTOR ACTIVE',
    28,
    22
  );
}
