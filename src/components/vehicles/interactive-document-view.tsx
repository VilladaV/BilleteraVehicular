'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { cn } from '@/lib/utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface InteractiveDocumentViewProps {
  children: React.ReactNode;
  documentUrl: string;
  documentName: string;
}

export function InteractiveDocumentView({
  children,
  documentUrl,
  documentName,
}: InteractiveDocumentViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  
  const pdfUrlToLoad = `/api/pdf-proxy?url=${encodeURIComponent(documentUrl)}`;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNumPages(0);
      setCurrentPage(1);
      setZoom(1);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-4">
        <DialogHeader className="flex-shrink-0 px-2 pt-2">
          <DialogTitle>{documentName}</DialogTitle>
          {numPages > 0 && (
            <DialogDescription>
              Página {currentPage} de {numPages}
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 my-2 bg-muted/30 rounded-lg p-4">
           <div className="flex justify-center items-start pt-4">
              <div 
                className="p-2 bg-card border-4 border-destructive/80 rounded-lg shadow-lg"
                // This style creates the stacked-pages effect
                style={{boxShadow: '4px 4px 0px 0px hsl(var(--muted)), 8px 8px 0px 0px hsl(var(--secondary)), 12px 12px 0px 0px hsl(var(--muted))'}}
              >
                  <Document
                      file={pdfUrlToLoad}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex flex-col items-center justify-center h-[50vh] w-[400px] gap-2 text-foreground">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span>Cargando documento...</span>
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center h-[50vh] w-[400px] text-destructive p-4 text-center">
                          <p className="font-bold">Error al cargar el documento.</p>
                          <p className="text-sm">Asegúrate de que la URL es correcta y el PDF es accesible.</p>
                        </div>
                      }
                  >
                      <Page
                          key={`page_${currentPage}@${zoom}`}
                          pageNumber={currentPage}
                          scale={zoom}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          loading={<div className="flex justify-center items-center h-[70vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
                          className="shadow-inner"
                      />
                  </Document>
              </div>
           </div>
        </ScrollArea>
        
        <DialogFooter className="flex-shrink-0 flex-col sm:flex-row sm:justify-between items-center pt-2 gap-4 border-t px-2 pb-1">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                    <ZoomOut />
                </Button>
                 <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 2}>
                    <ZoomIn />
                </Button>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handlePrevPage} disabled={currentPage <= 1}>
                    <ChevronLeft className="mr-2" /> Anterior
                </Button>
                <span className="font-mono text-sm">{currentPage} / {numPages || '?'}</span>
                <Button variant="outline" onClick={handleNextPage} disabled={!numPages || currentPage >= numPages}>
                    Siguiente <ChevronRight className="ml-2" />
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
