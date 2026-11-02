import React, { useState } from 'react';
import type { Book } from '../App';

interface BookCoverProps {
  book: Book;
  aspectRatio?: string; // default '2 / 3'
  height?: string;
  width?: string;
  borderRadius?: string;
  hoverEffect?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const BookCover: React.FC<BookCoverProps> = ({
  book,
  aspectRatio = '2 / 3',
  height,
  width = '100%',
  borderRadius = '8px',
  hoverEffect = false,
  className = '',
  style = {}
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasImage = Boolean(book.coverImage) && !imgError;

  return (
    <div
      className={`book-cover-container ${className}`}
      onMouseEnter={() => hoverEffect && setIsHovered(true)}
      onMouseLeave={() => hoverEffect && setIsHovered(false)}
      style={{
        position: 'relative',
        width,
        height,
        aspectRatio: height ? undefined : aspectRatio,
        borderRadius,
        overflow: 'hidden',
        backgroundColor: book.colorBg || '#E2E8F0',
        boxShadow: isHovered
          ? '0 12px 24px -6px rgba(15, 23, 42, 0.22), 0 4px 8px -2px rgba(15, 23, 42, 0.12)'
          : '0 2px 6px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
        ...style
      }}
    >
      {hasImage ? (
        <img
          src={book.coverImage}
          alt={`Cover ${book.title}`}
          onError={() => setImgError(true)}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease'
          }}
        />
      ) : (
        /* Fallback Cover Elegan Modern (bukan ikon polos biasa) */
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: `linear-gradient(145deg, ${book.colorBg || '#E2E8F0'} 0%, #ffffff 100%)`,
            borderLeft: '5px solid rgba(0,0,0,0.18)',
            boxSizing: 'border-box',
            textAlign: 'left'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#475569',
                marginBottom: '4px'
              }}
            >
              {book.category}
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 800,
                lineHeight: '1.25',
                color: '#0F172A',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {book.title}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#334155',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {book.author}
            </div>
            <div
              style={{
                fontSize: '9px',
                fontFamily: 'monospace',
                color: '#64748B',
                marginTop: '2px'
              }}
            >
              {book.callNumber}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

