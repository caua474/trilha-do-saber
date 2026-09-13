import React, { useState } from 'react';
import { Bot, GraduationCap } from 'lucide-react';
import gabiTeacherAvatarUrl from '../assets/images/gabi_teacher_avatar_1786788291224.jpg';

interface GabiAvatarProps {
  size?: number; // Size in pixels (default: 36)
  className?: string;
  showOnlineStatus?: boolean;
  alt?: string;
  statusBadgeSize?: number;
}

export const GabiAvatar: React.FC<GabiAvatarProps> = ({
  size = 36,
  className = '',
  showOnlineStatus = false,
  alt = 'Professora Gabi IA',
  statusBadgeSize = 8,
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
    >
      <div
        className="w-full h-full overflow-hidden border border-purple-400/40 shadow-sm flex items-center justify-center"
        style={{
          borderRadius: '50%',
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#581c87', // Purple-900 base background
        }}
      >
        {!hasError ? (
          <img
            src={gabiTeacherAvatarUrl}
            alt={alt}
            onError={() => setHasError(true)}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          /* Fallback when image fails to load: purple background with robot / graduation vector icon */
          <div
            className="w-full h-full flex items-center justify-center bg-purple-700 text-purple-100"
            style={{ borderRadius: '50%' }}
            title="Professora Gabi IA"
          >
            <Bot
              style={{
                width: `${Math.max(14, Math.round(size * 0.55))}px`,
                height: `${Math.max(14, Math.round(size * 0.55))}px`,
              }}
            />
          </div>
        )}
      </div>

      {/* Online indicator dot */}
      {showOnlineStatus && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex"
          style={{ width: `${statusBadgeSize}px`, height: `${statusBadgeSize}px` }}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span
            className="relative inline-flex rounded-full bg-emerald-500 border border-slate-900"
            style={{ width: `${statusBadgeSize}px`, height: `${statusBadgeSize}px` }}
          />
        </span>
      )}
    </div>
  );
};
export default GabiAvatar;
