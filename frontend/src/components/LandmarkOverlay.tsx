import { useEffect } from "react";

const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  landmarks: Array<{ x: number; y: number; z: number }>;
  width: number;
  height: number;
}

export function LandmarkOverlay({
  canvasRef,
  landmarks,
  width,
  height,
}: Props) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || landmarks.length === 0) {
      // Clear canvas when no hand
      const ctx = canvas?.getContext("2d");
      ctx?.clearRect(0, 0, width, height);
      return;
    }

    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // Mirror x to match the mirrored video
    const px = (lm: { x: number; y: number }) => ({
      x: (1 - lm.x) * width,
      y: lm.y * height,
    });

    // Draw connections
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.85;
    CONNECTIONS.forEach(([a, b]) => {
      if (!landmarks[a] || !landmarks[b]) return;
      const pa = px(landmarks[a]);
      const pb = px(landmarks[b]);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    // Draw joints
    landmarks.forEach((lm, i) => {
      const p = px(lm);
      ctx.globalAlpha = 1;
      ctx.fillStyle = i === 0 ? "#a78bfa" : "#e0e7ff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }, [landmarks, width, height, canvasRef]);

  return null;
}
