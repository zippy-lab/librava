import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  displayValue?: boolean;
}

export const BarcodeItem: React.FC<BarcodeProps> = ({
  value,
  width = 1.6,
  height = 48,
  fontSize = 13,
  displayValue = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          margin: 6,
          background: '#ffffff',
          lineColor: '#111827'
        });
      } catch (err) {
        console.error('JsBarcode rendering error:', err);
      }
    }
  }, [value, width, height, fontSize, displayValue]);

  return <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />;
};

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
}

export const BarcodeScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Pindai Barcode (Kamera / Scanner)'
}) => {
  const [manualInput, setManualInput] = React.useState('');
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode: any = null;
    const scannerId = 'reader-barcode-viewport';

    // Import dynamic html5-qrcode
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      try {
        html5QrCode = new Html5Qrcode(scannerId);
        html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 }
          },
          (decodedText: string) => {
            onScanSuccess(decodedText.trim());
            html5QrCode.stop().catch(() => {});
            onClose();
          },
          () => {
            // ignore frame parse errors
          }
        ).catch((err: any) => {
          console.warn('Camera stream error:', err);
          setCameraError('Kamera tidak aktif atau izin ditolak. Anda tetap dapat menggunakan input barcode scanner USB atau ketik manual.');
        });
      } catch (e: any) {
        setCameraError(e.message);
      }
    });

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScanSuccess(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      padding: '20px'
    }}>
      <div className="b" style={{
        background: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 0, fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
          >
            ✕
          </button>
        </div>

        {/* Viewport Kamera */}
        <div
          id="reader-barcode-viewport"
          style={{
            width: '100%',
            height: '220px',
            background: '#0F172A',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}
        />

        {cameraError && (
          <p style={{ fontSize: '12px', color: '#B45309', background: '#FEF3C7', padding: '8px 12px', borderRadius: '6px', marginTop: '12px' }}>
            ℹ️ {cameraError}
          </p>
        )}

        <div style={{ marginTop: '16px', borderTop: '1px solid #EEF0F4', paddingTop: '16px' }}>
          <p className="mut" style={{ fontSize: '12px', marginBottom: '8px' }}>
            Arahkan barcode ke kamera, atau gunakan <b>Barcode Scanner Gun USB</b> / input manual:
          </p>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              autoFocus
              className="in"
              placeholder="Scan / ketik barcode..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn" style={{ padding: '0 16px' }}>
              Pilih
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

