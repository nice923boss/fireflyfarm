import { useEffect, useState } from 'react';
import { imageUrl, placeholderUrl } from '../lib/image-url';

interface Props {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/** Image that resolves repo-relative paths and falls back to the placeholder when loading fails. */
export function Img({ src, alt, className, loading = 'lazy' }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const url = failed ? placeholderUrl() : imageUrl(src);
  return <img src={url} alt={alt} className={className} loading={loading} onError={() => setFailed(true)} />;
}
