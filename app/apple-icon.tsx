import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #1E293B 0%, #090D16 100%)',
          borderRadius: '38px',
          border: '5px solid #D97706',
        }}
      >
        <svg
          width="116"
          height="116"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 28L32 13L50 28"
            stroke="#F59E0B"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M20 29V49H27V24.5L20 29Z" fill="#FFFFFF" />
          <path d="M29.5 22L32 20L34.5 22V49H29.5V22Z" fill="#F59E0B" />
          <path d="M37 24.5V49H44V29L37 24.5Z" fill="#E2E8F0" />
          <rect x="16" y="48" width="32" height="3.5" rx="1.75" fill="#F59E0B" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
