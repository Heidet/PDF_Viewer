import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import samplePdf from './logo.pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styled from 'styled-components';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PDFViewer() {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    // Réinitialiser les états lorsque le document PDF change
    setNumPages(null);
    setCurrentPage(1);
    setSelectedText('');
  }, [samplePdf]); // Ajoutez samplePdf en tant que dépendance de l'effet

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <PdfViewer>
      <ToolbarButton>
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Page précédente
        </button>
        <button onClick={goToNextPage} disabled={currentPage === numPages}>
          Page suivante
        </button>
      </ToolbarButton>
      <Viewer>
        <Document file={samplePdf} onLoadSuccess={handleDocumentLoadSuccess}>
            <Page
            pageNumber={currentPage}
            onClick={handleTextSelection}
            />
        </Document>
        <TextSelectView>
            <p>Nombre de pages : {numPages}</p>
            <strong>Texte sélectionné : {selectedText}</strong>
        </TextSelectView>
      </Viewer>
    </PdfViewer>
  );
}

const TextSelectView = styled.div`
  width: 30%;
  height: 500px;
  overflow: auto;
`;

const ToolbarButton = styled.div`
  text-align: center;
`;


const Viewer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PdfViewer = styled.div`
  padding-top: 2em;
`;
