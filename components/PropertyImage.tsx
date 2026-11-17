'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { PROPERTY_IMAGES } from '@/lib/property-images';

interface PropertyImageProps {
  imageKey: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function PropertyImage({
  imageKey,
  alt,
  className = '',
  priority = false,
}: PropertyImageProps) {
  const [hasError, setHasError] = useState(false);
  const src = PROPERTY_IMAGES[imageKey] ?? PROPERTY_IMAGES.villa;

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 p-4 ${className}`}
      >
        <Building2 className="w-8 h-8 mb-2 text-slate-400" strokeWidth={1.5} />
        <span className="text-xs font-medium text-center line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
}
