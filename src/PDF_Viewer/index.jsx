import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import samplePdf from './starter.pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styled from 'styled-components';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PDFViewer () {
    const [numPages, setNumPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedText, setSelectedText] = useState('');
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
               <div>
                    <button onClick={goToPreviousPage} disabled={currentPage === 1}>Page précédente</button>
                    <button onClick={goToNextPage} disabled={currentPage === numPages}>Page suivante</button>
                </div>
            <Document file={samplePdf} onLoadSuccess={handleDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (_, index) => index).map((pageIndex) => (
                    <Page
                        key={`page_${pageIndex + 1}`}
                        pageNumber={pageIndex + 1}
                        onClick={(selection) => handleTextSelection(pageIndex, selection)}
                    />
                ))}
            </Document>
            <TextSelectView>
                <p>Nombre de pages : {numPages}</p>
                <strong>Texte sélectionné : {selectedText}</strong>
            </TextSelectView>
        </PdfViewer>
    );
};



const TextSelectView = styled.div`
    width: 30%;
    height: 500px;
    overflow: auto;
`;

const PdfViewer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
`;
