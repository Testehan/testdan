import React, { useState, useEffect } from 'react';
import { toCanvas } from 'html-to-image';
import { useLocation } from 'react-router-dom';

export default function LLMCaptureTool() {
  const location = useLocation();
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // Document absolute (pageX)
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 }); // Document absolute (pageY)
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [capturing, setCapturing] = useState(false);

  // Update scroll position to keep selection rect anchored to content
  useEffect(() => {
    const handleScroll = () => {
      setScrollPos({ x: window.scrollX, y: window.scrollY });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only show the tool on /stocks and its subpaths
  const isVisible = location.pathname.startsWith('/stocks');

  // ESC to cancel
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelecting) setIsSelecting(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSelecting]);

  if (!isVisible) return null;

  const startSelection = () => {
    setIsSelecting(true);
    setIsDragging(false);
    setStartPos({ x: 0, y: 0 });
    setCurrentPos({ x: 0, y: 0 });
    setScrollPos({ x: window.scrollX, y: window.scrollY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    setIsDragging(true);
    // Use pageX/Y to get document-absolute coordinates
    setStartPos({ x: e.pageX, y: e.pageY });
    setCurrentPos({ x: e.pageX, y: e.pageY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !isDragging) return;
    setCurrentPos({ x: e.pageX, y: e.pageY });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isSelecting) return;
    // Manually scroll since the fixed overlay blocks default scroll behavior
    window.scrollBy(e.deltaX, e.deltaY);
  };

  const handleMouseUp = async () => {
    if (!isSelecting || !isDragging) return;
    setIsDragging(false);

    // Final rectangle in document-absolute coordinates
    const rect = {
      x: Math.min(startPos.x, currentPos.x),
      y: Math.min(startPos.y, currentPos.y),
      width: Math.abs(currentPos.x - startPos.x),
      height: Math.abs(currentPos.y - startPos.y),
    };

    // Ignore tiny accidental clicks
    if (rect.width < 10 || rect.height < 10) {
      setIsSelecting(false);
      return;
    }

    setCapturing(true);
    setIsSelecting(false); // hide overlay immediately

    try {
      // html-to-image toCanvas captures the whole body by default
      const fullCanvas = await toCanvas(document.body, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
      });

      // Crop to exactly the selected region using document coordinates
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = rect.width * 2;
      cropCanvas.height = rect.height * 2;
      const ctx = cropCanvas.getContext('2d')!;

      ctx.drawImage(
        fullCanvas,
        rect.x * 2, rect.y * 2, rect.width * 2, rect.height * 2, // source (doc absolute)
        0, 0, rect.width * 2, rect.height * 2                     // destination
      );
      
      // ... same clipboard logic

      // Copy to clipboard as PNG
      cropCanvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to generate image blob');
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('✅ Copied to clipboard!\n\nPaste the image directly into your LLM (ChatGPT, Claude, Grok, etc.)');
        } catch (clipboardErr: any) {
          console.error('Clipboard write failed', clipboardErr);
          alert(`Clipboard error: ${clipboardErr?.message || 'Check browser permissions'}`);
        }
      }, 'image/png', 0.95);
    } catch (err: any) {
      console.error('Capture failed', err);
      alert(`Capture failed: ${err?.message || 'unknown error'}. This usually happens on very large pages.`);
    } finally {
      setCapturing(false);
    }
  };

  // ESC to cancel
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelecting) setIsSelecting(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSelecting]);

  const selectionRect = {
    left: Math.min(startPos.x, currentPos.x) - scrollPos.x,
    top: Math.min(startPos.y, currentPos.y) - scrollPos.y,
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y),
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={startSelection}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium transition-all active:scale-95 cursor-pointer"
        disabled={capturing}
      >
        {capturing ? '📸 Capturing...' : '📸 Capture for LLM'}
      </button>

      {/* Selection overlay */}
      {isSelecting && (
        <div
          className="fixed inset-0 z-[9999] bg-black/30 cursor-crosshair select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Live selection rectangle */}
          {isDragging && selectionRect.width > 0 && selectionRect.height > 0 && (
            <div
              className="absolute border-2 border-dashed border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none"
              style={{
                left: selectionRect.left,
                top: selectionRect.top,
                width: selectionRect.width,
                height: selectionRect.height,
              }}
            >
              {/* Size label */}
              <div className="absolute -top-6 left-0 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono whitespace-nowrap">
                {Math.round(selectionRect.width)} × {Math.round(selectionRect.height)}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/90 text-white text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-none">
            {isDragging ? 'Release to copy' : 'Drag to select area (use mouse wheel to scroll)'}
            <span className="text-xs opacity-60">(ESC to cancel)</span>
          </div>
        </div>
      )}
    </>
  );
}
