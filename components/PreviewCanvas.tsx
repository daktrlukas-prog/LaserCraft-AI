import React, { useState } from 'react';
import { GeneratedResult } from '../types';
import { ZoomIn, ZoomOut, Download, Eye, Layers, FileText, Image as ImageIcon } from 'lucide-react';
import { jsPDF } from "jspdf";

interface PreviewCanvasProps {
  result: GeneratedResult | null;
  isLoading: boolean;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ result, isLoading }) => {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'technical' | 'simulation'>('technical');
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadSvg = () => {
    if (!result) return;

    try {
      const blob = new Blob([result.svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `lasercraft-design-${Date.now()}.svg`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      console.error("Download SVG failed", e);
      alert("Chyba při stahování SVG souboru.");
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsExporting(true);

    try {
      // Create a temporary image from SVG to rasterize it for PDF
      const svgBlob = new Blob([result.svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.src = url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create a high-res canvas
      const canvas = document.createElement('canvas');
      // Scale up for better quality in PDF (2x or 3x)
      const scaleFactor = 3; 
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Draw white background (PDFs are usually on white paper)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the SVG image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Create PDF (A4 default)
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate aspect ratio fit
      const imgRatio = canvas.width / canvas.height;
      const pageRatio = pageWidth / pageHeight;

      let finalWidth = pageWidth;
      let finalHeight = pageWidth / imgRatio;

      if (finalHeight > pageHeight) {
        finalHeight = pageHeight;
        finalWidth = pageHeight * imgRatio;
      }

      // Add margins (10mm)
      const margin = 10;
      const printWidth = finalWidth - (margin * 2);
      const printHeight = printWidth / imgRatio;

      // Center on page
      const x = (pageWidth - printWidth) / 2;
      const y = (pageHeight - printHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, printWidth, printHeight);
      
      // Add Title
      pdf.setFontSize(10);
      pdf.text(`LaserCraft AI - ${new Date().toLocaleDateString()}`, 10, 10);
      pdf.setFontSize(8);
      pdf.text(result.description.substring(0, 100) + "...", 10, pageHeight - 10);

      pdf.save(`lasercraft-preview-${Date.now()}.pdf`);
      
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF Export failed", e);
      alert("Chyba při generování PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700 backdrop-blur-sm">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-slate-700 border-t-laser-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-laser-500">
            <Layers size={24} className="animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-slate-400 font-mono text-sm animate-pulse">Analyzuji geometrii a generuji cesty...</p>
        <p className="text-slate-500 text-xs mt-2">To může trvat několik vteřin</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-700 text-slate-500">
        <Layers size={48} className="mb-4 opacity-50" />
        <p>Zde se zobrazí náhled vygenerovaného souboru.</p>
        <p className="text-sm mt-2">Zadejte popis vlevo pro začátek.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="bg-slate-800 p-3 flex flex-wrap items-center justify-between border-b border-slate-700 gap-3">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setViewMode('technical')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${viewMode === 'technical' ? 'bg-laser-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
                <Layers size={14} /> Technický
            </button>
            <button 
                onClick={() => setViewMode('simulation')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${viewMode === 'simulation' ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
                <Eye size={14} /> Simulace
            </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-700 rounded-lg p-0.5">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1.5 hover:bg-slate-600 rounded text-slate-300">
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-mono text-slate-300 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1.5 hover:bg-slate-600 rounded text-slate-300">
              <ZoomIn size={16} />
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-900 px-3 py-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-50"
              title="Stáhnout PDF Náhled"
            >
              <FileText size={16} className="text-red-600" /> 
              {isExporting ? '...' : 'PDF'}
            </button>

            <button 
              onClick={handleDownloadSvg}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors shadow-lg shadow-emerald-900/20"
              title="Stáhnout SVG pro řezání"
            >
              <Download size={16} /> 
              <span className="hidden sm:inline">Stáhnout SVG</span>
              <span className="sm:hidden">SVG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className={`flex-1 overflow-auto p-8 relative flex items-center justify-center ${viewMode === 'technical' ? 'bg-grid-pattern bg-[#e5e5e5]' : 'bg-wood-800'}`}>
        <div 
            className={`transition-transform duration-200 shadow-xl ${viewMode === 'simulation' ? 'bg-wood-200 rounded-sm' : 'bg-white'}`}
            style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                backgroundImage: viewMode === 'simulation' ? 'url("https://picsum.photos/id/1028/200/200")' : 'none', 
                backgroundSize: 'cover',
                backgroundBlendMode: 'multiply'
            }}
        >
            {/* The SVG Container */}
            <div 
                className={viewMode === 'simulation' ? 'opacity-90 mix-blend-multiply' : ''}
                dangerouslySetInnerHTML={{ __html: result.svgContent }} 
            />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-800 p-2 text-xs text-slate-400 border-t border-slate-700 flex flex-wrap justify-between px-4 gap-2">
        <span className="font-mono">Rozměry: {result.width} x {result.height}</span>
        <span className="truncate max-w-[50vw]">{result.description}</span>
      </div>
    </div>
  );
};

export default PreviewCanvas;