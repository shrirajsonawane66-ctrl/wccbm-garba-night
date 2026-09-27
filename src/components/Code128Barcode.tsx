import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

interface Code128BarcodeProps {
  value: string;
  className?: string;
  height?: number;
  displayValue?: boolean;
}

/** Renders a CODE128 barcode for the given value using jsbarcode. */
export const Code128Barcode: React.FC<Code128BarcodeProps> = ({ value, className, height = 44, displayValue = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    try {
      JsBarcode(canvasRef.current as unknown as HTMLCanvasElement, value, {
        format: 'CODE128',
        width: 2,
        height,
        displayValue,
        margin: 0,
        background: 'transparent',
        lineColor: '#f0c674',
      });
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [value, height, displayValue]);

  if (failed) {
    return (
      <span className={`font-mono text-[10px] text-slate-400 tracking-widest ${className || ''}`}>{value}</span>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ maxWidth: '100%', height: `${height}px`, width: 'auto' }}
    />
  );
};