import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import type { EPassTicket } from '../types.ts';

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string) {
  ctx.save();
  ctx.shadowBlur = 120;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.globalAlpha = 0.35;
  ctx.fill();
  ctx.restore();
}

/**
 * Generate a printable PNG of the student's E-Pass (Code128 barcode + QR +
 * student details) and download it. Uses only the student's own data.
 */
export async function downloadPassImage(ticket: EPassTicket) {
  const W = 800;
  const H = 1120;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b0f1c');
  bg.addColorStop(0.55, '#131b2e');
  bg.addColorStop(1, '#07090f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ellipse(ctx, W * 0.9, 120, 260, 220, 'rgba(245, 158, 11, 0.5)');
  ellipse(ctx, 60, H - 140, 240, 200, 'rgba(233, 30, 99, 0.4)');
  ellipse(ctx, W * 0.5, H * 0.5, 300, 250, 'rgba(168, 85, 247, 0.25)');

  // Card panel
  roundedRect(ctx, 48, 48, W - 96, H - 96, 28);
  ctx.fillStyle = 'rgba(14, 20, 36, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();

  const gold = '#fbbf24';
  const white = '#f3f4f6';
  const muted = '#94a3b8';
  ctx.textAlign = 'center';

  // Header
  ctx.fillStyle = gold;
  ctx.font = '700 20px Georgia, serif';
  ctx.fillText('WESTERN COLLEGE', W / 2, 120);
  ctx.fillStyle = muted;
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText('Commerce & Business Management', W / 2, 146);

  ctx.fillStyle = gold;
  ctx.font = '800 22px Georgia, serif';
  ctx.fillText('GARBA & DANDIYA NIGHT', W / 2, 192);

  ctx.fillStyle = white;
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText(`${ticket.entryGate || 'Western College Main Quadrangle'} • 6:00 PM Onwards`, W / 2, 216);

  // Pass badge
  roundedRect(ctx, W / 2 - 110, 240, 220, 38, 19);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`STUDENT E-PASS • ${ticket.passNumber}`, W / 2, 267);

  // Divider
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
  ctx.beginPath();
  ctx.moveTo(84, 306);
  ctx.lineTo(W - 84, 306);
  ctx.stroke();

  // Student details (left column) + QR (right)
  const leftX = 84;
  const qrSize = 190;
  const qrX = W - 84 - qrSize;

  ctx.textAlign = 'left';
  const rows: [string, string][] = [
    ['Student Name', ticket.fullName],
    ['Roll No / Student ID', ticket.rollNumber],
    ['Course', ticket.department],
    ['Year / Division', ticket.year + (ticket.division ? ` / ${ticket.division}` : '')],
    ['Mobile', ticket.mobileNumber],
  ];

  let y = 356;
  rows.forEach(([label, value]) => {
    ctx.fillStyle = muted;
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText(label.toUpperCase(), leftX, y);
    ctx.fillStyle = white;
    ctx.font = '600 16px Arial, sans-serif';
    ctx.fillText(value, leftX, y + 24);
    y += 58;
  });

  // Status line
  if (ticket.status) {
    ctx.fillStyle = ticket.status === 'USED' ? '#f87171' : '#34d399';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(`PASS STATUS: ${ticket.status}`, leftX, y + 6);
  }

  // QR code
  let qrImg: HTMLCanvasElement | null = null;
  try {
    const qr = document.createElement('canvas');
    await QRCode.toCanvas(qr, ticket.verifyUrl || ticket.passNumber, { width: qrSize * 2, margin: 1 });
    qrImg = qr;
  } catch {
    qrImg = null;
  }
  if (qrImg) {
    roundedRect(ctx, qrX - 14, 330, qrSize + 28, qrSize + 28, 16);
    ctx.fillStyle = '#0b0f1c';
    ctx.fill();
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.stroke();
    ctx.drawImage(qrImg, qrX, 344, qrSize, qrSize);
    ctx.textAlign = 'center';
    ctx.fillStyle = muted;
    ctx.font = '10px Arial, sans-serif';
    ctx.fillText('SCAN AT ENTRY', qrX + qrSize / 2, 544);
  }

  // Code128 barcode
  const bcW = W - 190;
  const bcX = W / 2 - bcW / 2;
  const bcY = H - 250;
  const barcodeText = ticket.passNumber;
  const bc = document.createElement('canvas');
  try {
    JsBarcode(bc, barcodeText, {
      format: 'CODE128',
      lineColor: '#fbbf24',
      background: 'transparent',
      width: 3,
      height: 90,
      margin: 0,
      displayValue: false,
    });
    ctx.drawImage(bc, bcX, bcY, bcW, 120);
  } catch {
    ctx.fillStyle = muted;
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(barcodeText, W / 2, bcY + 60);
  }

  ctx.fillStyle = muted;
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(barcodeText, W / 2, bcY + 150);

  // Footer
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Arial, sans-serif';
  ctx.fillText('Single entry only. Original E-Pass, screenshot, print and downloaded copies', W / 2, H - 38);
  ctx.fillText('all carry the same security code — only the first scan is accepted.', W / 2, H - 22);

  downloadDataUrl(canvas.toDataURL('image/png'), `${ticket.passNumber}-epass.png`);
}