'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { inspect } from '@/lib/image/pipeline';
import { ImageError, type ImageFacts, type ProcessRequest, type ProcessResult } from '@/lib/image/types';
import { processImage } from '@/lib/workers/client';

/** Turns any thrown value into something worth showing a person. */
export function describeError(error: unknown): string {
  if (error instanceof ImageError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong while reading this image. Try a different file.';
}

export interface LoadedImage {
  file: File;
  facts: ImageFacts;
  /** Object URL for the untouched original. Revoked when replaced. */
  url: string;
}

/**
 * Loads one file, measures it, and keeps a preview URL alive for exactly as
 * long as it is on screen.
 */
export function useSingleImage() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const release = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => release, [release]);

  const load = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setLoading(true);
      setError(null);
      try {
        const facts = await inspect(file);
        release();
        const url = URL.createObjectURL(file);
        urlRef.current = url;
        setImage({ file, facts, url });
      } catch (thrown) {
        setImage(null);
        setError(describeError(thrown));
      } finally {
        setLoading(false);
      }
    },
    [release],
  );

  const clear = useCallback(() => {
    release();
    setImage(null);
    setError(null);
  }, [release]);

  return { image, loading, error, load, clear, setError };
}

/**
 * Runs the processing pipeline and ignores any result that has been
 * superseded, so dragging a slider cannot leave a stale preview behind.
 */
export function useProcessor() {
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useRef(0);

  const run = useCallback(async (request: ProcessRequest | null) => {
    token.current += 1;
    const id = token.current;

    if (!request) {
      setResult(null);
      setError(null);
      setBusy(false);
      return;
    }

    setBusy(true);
    try {
      const output = await processImage(request);
      if (token.current !== id) return;
      setResult(output);
      setError(null);
    } catch (thrown) {
      if (token.current !== id) return;
      setResult(null);
      setError(describeError(thrown));
    } finally {
      if (token.current === id) setBusy(false);
    }
  }, []);

  const reset = useCallback(() => {
    token.current += 1;
    setResult(null);
    setError(null);
    setBusy(false);
  }, []);

  return { result, busy, error, run, reset };
}

/** Keeps an object URL alive for a blob, revoking the previous one safely. */
export function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => {
      // Let the <img> finish with it before the URL disappears.
      window.setTimeout(() => URL.revokeObjectURL(next), 1000);
    };
  }, [blob]);

  return url;
}

/** Debounced trigger shared by the live-preview tools. */
export function useDebounced(callback: () => void, delay: number, deps: unknown[]) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    const id = window.setTimeout(() => saved.current(), delay);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps]);
}
