import React, { useRef } from 'react';
import { BarcodeItem } from './BarcodeComponents';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface CopyLabelData {
  bookTitle: string;
  author: string;
  category: string;
  callNumber: string;
  shelfLocation: string;
  copyCode: string;
}

interface BookLabelCardProps {
  labelData: CopyLabelData;
  labelRef?: React.RefObject<HTMLDivElement | null>;
}

export const BookLabelCard: React.FC<BookLabelCardProps> = ({ labelData, labelRef }) => {
  return (
    <div
      ref={labelRef}
      style={{
        width: '280px',
        border: '1.5px solid #1E293B',
        borderRadius: '8px',
        padding: '12px',
        background: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        color: '#0F172A',
        boxSizing: 'border-box',
        margin: '6px'
      }}
    >
      {/* Header Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #CBD5E1', paddingBottom: '6px', marginBottom: '8px' }}>
        <span style={{ fontWeight: 800, fontSize: '13px', color: '#3347C4', letterSpacing: '0.5px' }}>LIBRAVA</span>
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Label Buku Resmi</span>
      </div>

      {/* Identitas Buku */}
      <div style={{ marginBottom: '8px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px', lineHeight: '1.2', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {labelData.bookTitle}
        </h4>
        <p style={{ fontSize: '11px', color: '#475569', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Penulis: {labelData.author}
        </p>
      </div>

      {/* Box Klasifikasi & Nomor Panggil (Spine Label) */}
      <div style={{ display: 'flex', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 8px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '9px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>No. Panggil</span>
          <strong style={{ fontSize: '12px', color: '#1E293B' }}>{labelData.callNumber}</strong>
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid #E2E8F0', paddingLeft: '6px' }}>
          <span style={{ fontSize: '9px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Lokasi Rak</span>
          <strong style={{ fontSize: '12px', color: '#1E293B' }}>{labelData.shelfLocation}</strong>
        </div>
      </div>

      {/* Barcode Eksemplar Code 128 */}
      <div style={{ textAlign: 'center', background: '#fff', paddingTop: '2px' }}>
        <BarcodeItem value={labelData.copyCode} width={1.3} height={34} fontSize={10} />
      </div>
    </div>
  );
};

interface LabelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: CopyLabelData[];
  title?: string;
}

export const LabelPreviewModal: React.FC<LabelPreviewModalProps> = ({
  isOpen,
  onClose,
  labels,
  title = 'Pratinjau & Cetak Label Buku'
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!printAreaRef.current) return;
    try {
      const canvas = await html2canvas(printAreaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width
      const pageHeight = 297; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`label_buku_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
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
        maxWidth: '860px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Header Modal */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0F172A' }}>{title}</h3>
            <p className="mut" style={{ fontSize: '12px', margin: '2px 0 0' }}>
              Total: {labels.length} label siap dicetak dalam format standar stiker buku.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: '20px', cursor: 'pointer', color: '#64748B' }}>
            ✕
          </button>
        </div>

        {/* Pratinjau Lembar Cetak (Grid Label) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#F1F5F9' }}>
          <div
            ref={printAreaRef}
            id="print-sheet-area"
            style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center'
            }}
          >
            {labels.map((l) => (
              <BookLabelCard key={l.copyCode} labelData={l} />
            ))}
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#FAFBFD' }}>
          <button onClick={onClose} className="btn2">
            Tutup
          </button>
          <button onClick={handleDownloadPDF} className="btn2" style={{ color: '#2563EB', borderColor: '#BFDBFE' }}>
            📥 Unduh PDF Siap Cetak
          </button>
          <button onClick={handleNativePrint} className="btn">
            🖨️ Cetak Sekarang (Printer)
          </button>
        </div>
      </div>
    </div>
  );
};

