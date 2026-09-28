'use client';

/**
 * Client-Side Real-Time Computer Vision & Malpractice Detector
 * Powered by TensorFlow.js & COCO-SSD object detection
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
  engine: 'coco-ssd' | 'gemini' | 'simulated';
}

let cocoModelPromise: Promise<any> | null = null;
let cachedModel: any = null;
let isModelLoading = false;
let modelLoadFailed = false;

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
      // Dynamic imports to prevent SSR issues
      const tf = await import('@tensorflow/tfjs');
      // Set backend to webgl if available, fallback to cpu
      try {
        await tf.ready();
      } catch (e) {
        console.warn('TF ready warning:', e);
      }

      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      const model = await cocoSsd.load({ base: 'mobilenet_v2' });
      cachedModel = model;
      isModelLoading = false;
      return model;
    } catch (err) {
      console.error('Failed to load COCO-SSD vision model:', err);
      modelLoadFailed = true;
      isModelLoading = false;
      return null;
    }
  })();

  return cocoModelPromise;
}

export function isVisionModelReady(): boolean {
  return cachedModel !== null;
}

/**
 * Detect malpractice in a live video element using client-side AI
 */
export async function analyzeVideoFrame(
  video: HTMLVideoElement
): Promise<FrameAnalysisResult> {
  const defaultResult: FrameAnalysisResult = {
    phoneDetected: false,
    multiplePeopleDetected: false,
    noFaceDetected: false,
    gazeAway: false,
    peopleCount: 1,
    detectedObjects: [],
    engine: 'coco-ssd',
  };

  if (!video || video.readyState < 2 || video.videoWidth === 0) {
    return defaultResult;
  }

  try {
    const model = await loadVisionModel();
    if (!model) {
      return defaultResult;
    }

    const predictions: Array<{
      bbox: [number, number, number, number];
      class: string;
      score: number;
    }> = await model.detect(video, 10, 0.35);

    const detectedObjects: DetectedObject[] = predictions.map(p => ({
      class: p.class.toLowerCase(),
      score: Math.round(p.score * 100),
      bbox: p.bbox,
    }));

    // Detect phones, mobile devices, remotes
    const phoneMatches = detectedObjects.filter(
      obj => (obj.class === 'cell phone' || obj.class === 'remote') && obj.score >= 38
    );
    const phoneDetected = phoneMatches.length > 0;
    const phoneConfidence = phoneDetected ? Math.max(...phoneMatches.map(p => p.score)) : undefined;

    // Detect people
    const peopleMatches = detectedObjects.filter(
      obj => obj.class === 'person' && obj.score >= 35
    );
    const peopleCount = peopleMatches.length;
    const noFaceDetected = peopleCount === 0;
    const multiplePeopleDetected = peopleCount > 1;

    // Gaze / Head orientation heuristic
    let gazeAway = false;
    if (peopleCount === 1 && video.videoWidth > 0) {
      const person = peopleMatches[0];
      const personCenterX = person.bbox[0] + person.bbox[2] / 2;
      const frameCenterX = video.videoWidth / 2;
      const ratio = Math.abs(personCenterX - frameCenterX) / frameCenterX;
      // If student is skewed far to the periphery (>58% deviation from center)
      if (ratio > 0.58) {
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
      engine: 'coco-ssd',
    };
  } catch (err) {
    console.error('Error running video frame analysis:', err);
    return defaultResult;
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
    const drawX = x * scaleX;
    const drawY = y * scaleY;
    const drawW = w * scaleX;
    const drawH = h * scaleY;

    if (obj.class === 'cell phone' || obj.class === 'remote') {
      // High-alert RED bounding box for phone
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(drawX, drawY, drawW, drawH);

      // Semi-transparent alert background
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(drawX, drawY, drawW, drawH);

      // Label badge
      const label = `📱 PHONE DETECTED ${obj.score}%`;
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

      const label = isExtra ? `⚠️ SECOND PERSON ${obj.score}%` : `👤 STUDENT ${obj.score}%`;
      ctx.font = 'bold 10px sans-serif';
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = color;
      ctx.fillRect(drawX, Math.max(0, drawY - 18), textWidth + 10, 18);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, drawX + 5, Math.max(13, drawY - 5));
    } else if (obj.class === 'book' || obj.class === 'laptop') {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY, drawW, drawH);

      const label = `⚠️ ${obj.class.toUpperCase()} ${obj.score}%`;
      ctx.font = 'bold 10px sans-serif';
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = '#eab308';
      ctx.fillRect(drawX, Math.max(0, drawY - 18), textWidth + 10, 18);

      ctx.fillStyle = '#000000';
      ctx.fillText(label, drawX + 5, Math.max(13, drawY - 5));
    }
  });

  // Top HUD Status Badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fillRect(6, 6, 130, 20);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(6, 6, 130, 20);

  // Status dot
  ctx.beginPath();
  ctx.arc(16, 16, 4, 0, Math.PI * 2);
  ctx.fillStyle = analysis.phoneDetected ? '#ef4444' : '#22c55e';
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '10px sans-serif';
  ctx.fillText(analysis.phoneDetected ? 'PHONE ALERT' : 'AI CV ACTIVE', 26, 19);
}
