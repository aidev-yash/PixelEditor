'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import { addSuffix, clamp, formatAspectRatio, formatBytes, replaceExtension } from '@/lib/format';
import { FORMAT_EXTENSION } from '@/lib/image/encode';
import type { CropRect, OutputFormat, ProcessRequest, TargetFormat } from '@/lib/image/types';
import { Button } from './Button';
import { DownloadBar } from './DownloadBar';
import { DropZone } from './DropZone';
import { ErrorNotice } from './ErrorNotice';
import { FormatPicker, useEncoderSupport } from './FormatPicker';
import { PreviewFrame } from './ImagePreview';
import { NumberField } from './NumberField';
import { QualitySlider } from './QualitySlider';
import { ReadoutStrip } from './ReadoutStrip';
import { SegmentedControl } from './SegmentedControl';
import { ControlGroup, LocalBadge, WorkspacePanel, WorkspaceSplit } from './WorkspacePanel';
import { useDebounced, useObjectUrl, useProcessor, useSingleImage } from './useImageTool';

type Handle = 'nw' | 'ne' | 'sw' | 'se';
type RatioKey = 'free' | '1:1' | '4:3' | '3:2' | '16:9' | '9:16';

const RATIOS: Record<RatioKey, number | null> = {
  free: null,
  '1:1': 1,
  '4:3': 4 / 3,
  '3:2': 3 / 2,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
};

const MIN_SIZE = 16;

function fitRect(rect: CropRect, w: number, h: number): CropRect {
  const width = clamp(Math.round(rect.width), MIN_SIZE, w);
  const height = clamp(Math.round(rect.height), MIN_SIZE, h);
  return {
    width,
    height,
    x: clamp(Math.round(rect.x), 0, w - width),
    y: clamp(Math.round(rect.y), 0, h - height),
  };
}

/** Centres the largest rectangle of a given ratio inside the image. */
function centredRatioRect(w: number, h: number, ratio: number | null): CropRect {
  if (!ratio) return { x: 0, y: 0, width: w, height: h };
  let width = w;
  let height = width / ratio;
  if (height > h) {
    height = h;
    width = height * ratio;
  }
  return fitRect(
    { x: (w - width) / 2, y: (h - height) / 2, width, height },
    w,
    h,
  );
}

function resizeCrop(
  handle: Handle,
  start: CropRect,
  dx: number,
  dy: number,
  w: number,
  h: number,
  ratio: number | null,
): CropRect {
  const right = start.x + start.width;
  const bottom = start.y + start.height;
  let x = start.x;
  let y = start.y;
  let width = start.width;
  let height = start.height;

  const east = handle === 'ne' || handle === 'se';
  const south = handle === 'se' || handle === 'sw';

  width = east
    ? clamp(start.width + dx, MIN_SIZE, w - start.x)
    : clamp(start.width - dx, MIN_SIZE, right);
  if (!east) x = right - width;

  if (ratio) {
    height = width / ratio;
  } else {
    height = south
      ? clamp(start.height + dy, MIN_SIZE, h - start.y)
      : clamp(start.height - dy, MIN_SIZE, bottom);
  }

  // Keep the anchored edge fixed vertically.
  if (south) {
    if (start.y + height > h) {
      height = h - start.y;
      if (ratio) {
        width = height * ratio;
        if (!east) x = right - width;
      }
    }
    y = start.y;
  } else {
    if (bottom - height < 0) {
      height = bottom;
      if (ratio) {
        width = height * ratio;
        if (!east) x = right - width;
      }
    }
    y = bottom - height;
  }

  return fitRect({ x, y, width, height }, w, h);
}

export function CropperTool() {
  const { image, loading, error: loadError, load, clear } = useSingleImage();
  const { result, busy, error: runError, run, reset } = useProcessor();
  const support = useEncoderSupport();

  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [ratioKey, setRatioKey] = useState<RatioKey>('free');
  const [format, setFormat] = useState<TargetFormat>('source');
  const [quality, setQuality] = useState(88);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    handle: Handle | 'move';
    startX: number;
    startY: number;
    start: CropRect;
  } | null>(null);

  const ratio = RATIOS[ratioKey];

  useEffect(() => {
    if (!image) {
      reset();
      return;
    }
    setRatioKey('free');
    setCrop({ x: 0, y: 0, width: image.facts.width, height: image.facts.height });
  }, [image, reset]);

  const applyRatio = useCallback(
    (key: RatioKey) => {
      setRatioKey(key);
      if (!image) return;
      const next = RATIOS[key];
      if (!next) return;
      setCrop((current) => {
        let width = current.width;
        let height = width / next;
        if (height > image.facts.height) {
          height = image.facts.height;
          width = height * next;
        }
        return fitRect(
          {
            x: current.x + (current.width - width) / 2,
            y: current.y + (current.height - height) / 2,
            width,
            height,
          },
          image.facts.width,
          image.facts.height,
        );
      });
    },
    [image],
  );

  const scale = useCallback(() => {
    const element = stageRef.current;
    if (!element || !image) return { x: 1, y: 1 };
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 1, y: 1 };
    return { x: image.facts.width / rect.width, y: image.facts.height / rect.height };
  }, [image]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !image) return;
      const factor = scale();
      const dx = (event.clientX - drag.startX) * factor.x;
      const dy = (event.clientY - drag.startY) * factor.y;

      if (drag.handle === 'move') {
        setCrop(
          fitRect(
            { ...drag.start, x: drag.start.x + dx, y: drag.start.y + dy },
            image.facts.width,
            image.facts.height,
          ),
        );
      } else {
        setCrop(
          resizeCrop(drag.handle, drag.start, dx, dy, image.facts.width, image.facts.height, ratio),
        );
      }
    },
    [image, ratio, scale],
  );

  const startDrag = useCallback(
    (event: React.PointerEvent, handle: Handle | 'move') => {
      event.preventDefault();
      event.stopPropagation();
      (event.currentTarget as Element).setPointerCapture(event.pointerId);
      dragRef.current = {
        handle,
        startX: event.clientX,
        startY: event.clientY,
        start: crop,
      };
    },
    [crop],
  );

  const endDrag = useCallback((event: React.PointerEvent) => {
    dragRef.current = null;
    const element = event.currentTarget as Element;
    if (element.hasPointerCapture?.(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!image) return;
      const step = event.shiftKey ? 10 : 1;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      setCrop((current) =>
        fitRect(
          { ...current, x: current.x + move[0], y: current.y + move[1] },
          image.facts.width,
          image.facts.height,
        ),
      );
    },
    [image],
  );

  const request = useMemo<ProcessRequest | null>(() => {
    if (!image || crop.width < 1 || crop.height < 1) return null;
    return {
      file: image.file,
      name: image.file.name,
      format,
      quality: quality / 100,
      crop,
      resize: { mode: 'none' },
    };
  }, [image, crop, format, quality]);

  useDebounced(
    () => {
      void run(request);
    },
    180,
    [request],
  );

  const resultUrl = useObjectUrl(result?.blob ?? null);
  const outputFormat = (result?.type as OutputFormat | undefined) ?? undefined;
  const extension = outputFormat ? FORMAT_EXTENSION[outputFormat] : 'img';
  const filename = image ? addSuffix(replaceExtension(image.file.name, extension), '-cropped') : '';

  const percentRect = image
    ? {
        left: `${(crop.x / image.facts.width) * 100}%`,
        top: `${(crop.y / image.facts.height) * 100}%`,
        width: `${(crop.width / image.facts.width) * 100}%`,
        height: `${(crop.height / image.facts.height) * 100}%`,
      }
    : null;

  const readouts = image
    ? [
        { label: 'Source', value: `${image.facts.width}×${image.facts.height}` },
        { label: 'Crop origin', value: `${crop.x}, ${crop.y}` },
        { label: 'Crop size', value: `${crop.width}×${crop.height}` },
        {
          label: 'Crop ratio',
          value: crop.width && crop.height ? formatAspectRatio(crop.width, crop.height) : '—',
        },
      ]
    : [];

  const handleClass =
    'absolute h-4 w-4 border border-white bg-instrument shadow-[0_0_0_1px_rgba(255,255,255,0.7)]';

  return (
    <WorkspacePanel
      label="Image cropper"
      status={
        <>
          <LocalBadge />
          {image ? (
            <Button variant="ghost" onClick={clear} className="px-2 py-1">
              Start over
            </Button>
          ) : null}
        </>
      }
      footer={
        image && result ? (
          <DownloadBar
            filename={filename}
            bytes={result.bytes}
            busy={busy}
            note={`${result.width}×${result.height}`}
            onDownload={() => downloadBlob(result.blob, filename)}
          />
        ) : undefined
      }
    >
      {!image ? (
        <div className="space-y-4">
          <DropZone
            onFiles={(files) => void load(files)}
            label="Drop an image to crop"
            disabled={loading}
          />
          {loadError ? <ErrorNotice message={loadError} /> : null}
        </div>
      ) : (
        <div className="space-y-5">
          <ReadoutStrip items={readouts} live />

          {runError ? <ErrorNotice message={runError} /> : null}

          <WorkspaceSplit
            controls={
              <>
                <ControlGroup title="Aspect ratio">
                  <SegmentedControl<RatioKey>
                    legend="Crop ratio"
                    hideLegend
                    value={ratioKey}
                    onChange={applyRatio}
                    columns={3}
                    options={[
                      { value: 'free', label: 'Free' },
                      { value: '1:1', label: '1:1' },
                      { value: '4:3', label: '4:3' },
                      { value: '3:2', label: '3:2' },
                      { value: '16:9', label: '16:9' },
                      { value: '9:16', label: '9:16' },
                    ]}
                  />
                </ControlGroup>

                <ControlGroup
                  title="Exact crop"
                  hint="Typing here does exactly what dragging does — use whichever suits you."
                >
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="X"
                      value={crop.x}
                      onChange={(value) =>
                        setCrop((c) =>
                          fitRect({ ...c, x: value ?? 0 }, image.facts.width, image.facts.height),
                        )
                      }
                      min={0}
                      max={image.facts.width - MIN_SIZE}
                      suffix="px"
                    />
                    <NumberField
                      label="Y"
                      value={crop.y}
                      onChange={(value) =>
                        setCrop((c) =>
                          fitRect({ ...c, y: value ?? 0 }, image.facts.width, image.facts.height),
                        )
                      }
                      min={0}
                      max={image.facts.height - MIN_SIZE}
                      suffix="px"
                    />
                    <NumberField
                      label="Width"
                      value={crop.width}
                      onChange={(value) =>
                        setCrop((c) => {
                          const width = value ?? MIN_SIZE;
                          const height = ratio ? width / ratio : c.height;
                          return fitRect(
                            { ...c, width, height },
                            image.facts.width,
                            image.facts.height,
                          );
                        })
                      }
                      min={MIN_SIZE}
                      max={image.facts.width}
                      suffix="px"
                    />
                    <NumberField
                      label="Height"
                      value={crop.height}
                      onChange={(value) =>
                        setCrop((c) => {
                          const height = value ?? MIN_SIZE;
                          const width = ratio ? height * ratio : c.width;
                          return fitRect(
                            { ...c, width, height },
                            image.facts.width,
                            image.facts.height,
                          );
                        })
                      }
                      min={MIN_SIZE}
                      max={image.facts.height}
                      suffix="px"
                    />
                  </div>
                </ControlGroup>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      setCrop(
                        centredRatioRect(image.facts.width, image.facts.height, ratio),
                      )
                    }
                  >
                    Centre the frame
                  </Button>
                  <Button
                    onClick={() => {
                      setRatioKey('free');
                      setCrop({ x: 0, y: 0, width: image.facts.width, height: image.facts.height });
                    }}
                  >
                    Reset
                  </Button>
                </div>

                <ControlGroup title="Output">
                  <FormatPicker value={format} onChange={setFormat} support={support} />
                </ControlGroup>

                {format !== 'image/png' &&
                !(format === 'source' && image.facts.detectedType === 'image/png') ? (
                  <QualitySlider value={quality} onChange={setQuality} />
                ) : null}

                <DropZone
                  compact
                  onFiles={(files) => void load(files)}
                  label="Use a different image"
                  hint="Replaces the image above."
                />
              </>
            }
            preview={
              <div className="space-y-4">
                <div className="border border-rule bg-surface">
                  <div className="checkerboard flex justify-center p-3">
                    <div ref={stageRef} className="relative inline-block max-w-full leading-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={`Crop area for ${image.file.name}`}
                        draggable={false}
                        className="block max-h-[440px] w-auto max-w-full select-none"
                      />

                      {percentRect ? (
                        <>
                          {/* Dim everything outside the frame. */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[rgba(15,20,25,0.45)]"
                            style={{
                              clipPath: `polygon(0% 0%, 0% 100%, ${percentRect.left} 100%, ${percentRect.left} ${percentRect.top}, calc(${percentRect.left} + ${percentRect.width}) ${percentRect.top}, calc(${percentRect.left} + ${percentRect.width}) calc(${percentRect.top} + ${percentRect.height}), ${percentRect.left} calc(${percentRect.top} + ${percentRect.height}), ${percentRect.left} 100%, 100% 100%, 100% 0%)`,
                            }}
                          />

                          <div
                            role="group"
                            aria-label="Crop frame. Use the arrow keys to move it, or the number fields for exact values."
                            tabIndex={0}
                            onKeyDown={onKeyDown}
                            onPointerDown={(event) => startDrag(event, 'move')}
                            onPointerMove={onPointerMove}
                            onPointerUp={endDrag}
                            onPointerCancel={endDrag}
                            className="absolute cursor-move touch-none outline-offset-2"
                            style={percentRect}
                          >
                            <div className="pointer-events-none absolute inset-0 border-2 border-white shadow-[0_0_0_1px_rgba(15,20,25,0.6)]" />

                            {(['nw', 'ne', 'sw', 'se'] as Handle[]).map((handle) => (
                              <div
                                key={handle}
                                onPointerDown={(event) => startDrag(event, handle)}
                                onPointerMove={onPointerMove}
                                onPointerUp={endDrag}
                                onPointerCancel={endDrag}
                                className={[
                                  handleClass,
                                  'touch-none',
                                  handle === 'nw' ? '-left-2 -top-2 cursor-nwse-resize' : '',
                                  handle === 'ne' ? '-right-2 -top-2 cursor-nesw-resize' : '',
                                  handle === 'sw' ? '-bottom-2 -left-2 cursor-nesw-resize' : '',
                                  handle === 'se' ? '-bottom-2 -right-2 cursor-nwse-resize' : '',
                                ].join(' ')}
                              />
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <p className="border-t border-rule px-3 py-2 font-mono text-2xs uppercase tracking-wider text-ink-muted">
                    Drag the frame or its corners · arrow keys nudge · shift + arrow moves by ten
                  </p>
                </div>

                {resultUrl && result ? (
                  <PreviewFrame
                    src={resultUrl}
                    alt={`Cropped result for ${image.file.name}`}
                    label="Result"
                    meta={`${result.width}×${result.height} · ${formatBytes(result.bytes)}`}
                  />
                ) : null}
              </div>
            }
          />
        </div>
      )}
    </WorkspacePanel>
  );
}
