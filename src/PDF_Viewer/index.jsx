import "../App.css";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs, Outline} from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import { blobToURL } from "../utils/Utils";
import { AddSigDialog } from "../components/AddSigDialog";
import DraggableSignature from "../components/DraggableSignature";
import DraggableText from "../components/DraggableText";
import dayjs from "dayjs";
import Drop from "./Drop";
import styled from 'styled-components';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { faFont } from '@fortawesome/free-solid-svg-icons';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { faPrint } from '@fortawesome/free-solid-svg-icons';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
pdfjs.GlobalWorkerOptions.useWorkerFetch = true;

const ALLOWBTNSIGNATURE = true
const ALLOWBTNDATE = true
const ALLOWBTNTEXT = true
const ALLOWBTNERASE = true


export default function App () {
  const [pdf, setPdf] = useState(null);
  const [initPdfURL, setInitPdfURL] = useState(null);
  const [autoDate, setAutoDate] = useState(true);
  const [signatureURL, setSignatureURL] = useState(null);
  const [position, setPosition] = useState(null);
  const [signatureDialogVisible, setSignatureDialogVisible] = useState(false);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageDetails, setPageDetails] = useState(null);
  const documentRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [searchText, setSearchText] = useState('');


  const downloadURI = (uri, name) => {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  const onJumpToPage = (pageNumber) => {
    const parsedPageNumber = parseInt(pageNumber, 10);
    if (!isNaN(parsedPageNumber) && parsedPageNumber > 0 && parsedPageNumber <= totalPages) {
      setPageNum(parsedPageNumber);
    }
  };

  const handlePrintPdf = async () => {
    if (pdf) {
      var frame = document.getElementById('frame')
      frame.contentWindow.focus();
      frame.contentWindow.print();
    }
  };

  const handleScroll = (pageNumber) => {
    // if (documentRef.current) {
    //   const parentElement = documentRef.current;
    //   const pageElements = parentElement.querySelectorAll('[data-page-number]');
  
    //   let currentPageNumber = 1;
    //   let smallestDistanceToTop = Infinity;
    //   for (let i = 0; i < pageElements.length; i++) {
    //     const pageElement = pageElements[i];
    //     const rect = pageElement.getBoundingClientRect();
    //     const distanceToTop = Math.abs(rect.top);
    //     if (distanceToTop < smallestDistanceToTop) {
    //       smallestDistanceToTop = distanceToTop;
    //       currentPageNumber = parseInt(pageElement.getAttribute('data-page-number'));
    //     }
    //   }

    //   setPageNum(currentPageNumber)
    // }
  };

  const scrollToPage = (pageNumber) => {
    console.log(pageNumber)
    if (documentRef.current) {
      const pageElement = documentRef.current.querySelector(`[data-page-number="${pageNumber}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };


  const textRenderer = useCallback(
    (textItem) => highlightPattern(textItem.str, searchText),
    [searchText]
  );

  const highlightPattern = (text, pattern) => {
    const lowerText = text.toUpperCase();
    const lowerPattern = pattern.toUpperCase();
    return lowerText.replace(new RegExp(lowerPattern, "g"), (value) => `<mark><strong>${value}</strong></mark>`);
  }
  
  const onChange = (event)  => {
    setSearchText(event.target.value.toLowerCase());
  }

  useEffect(() => {
    setSelectedText('');
  }, []);


  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };

  useEffect(() => {
    scrollToPage(pageNum);
    console.log(pageNum)
  }, [pageNum]);
  
  useEffect(() => {
    // if (pdf) {

    //   const initPdfUrl = async () => {
    //     const pdfContent = await fetch(pdf).then((res) => res.blob());
    //     const pdfURL = URL.createObjectURL(pdfContent);
    //     console.log('pdfURL =>',pdfURL )

    //     setInitPdfURL(pdfURL);
    //   };
    //   initPdfUrl();
    // }
    // console.log('pdf =>',pdf )
    
  }, [pdf]);
  
  useEffect(() => {
  
  }, []);
  

  return (
    <PdfViewer>
      <Viewer>
        {signatureDialogVisible ? (
          <AddSigDialog
            autoDate={autoDate}
            setAutoDate={setAutoDate}
            onClose={() => setSignatureDialogVisible(false)}
            onConfirm={(url) => {
              setSignatureURL(url);
              setSignatureDialogVisible(false);
            }}
          />
        ) : null}

        {!pdf ? (
          <Drop
            onLoaded={async (files) => {
              const URL = await blobToURL(files[0]);
              setPdf(URL);
            }}
          />
        ) : null}

        {pdf ? (
          <div>
            <Box sx={{ flexGrow: 1 }}>
            {pdf ? (
              <AppBar position="static">
                <Toolbar variant="dense" style={{backgroundColor: '#38383d'}}>
                  {!signatureURL && ALLOWBTNSIGNATURE ? (
                      <Button 
                        variant="outlined"
                        size="small"
                        style={{height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white"}}
                        onClick={() => setSignatureDialogVisible(true)}
                      > <FontAwesomeIcon icon={faSignature} /></Button>
                    ) : null
                  }
                  {ALLOWBTNDATE ? (
                      <Button 
                        style={{height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white"}}
                        variant="outlined"
                        size="small"
                        onClick={() => setTextInputVisible("date")}
                      > <FontAwesomeIcon icon={faCalendarDays} /></Button>
                    ) : null
                  }
                  {ALLOWBTNTEXT ? (
                      <Button 
                        style={{height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white"}}
                        variant="outlined"
                        size="small"
                        onClick={() => setTextInputVisible(true)}
                      > <FontAwesomeIcon icon={faFont} /></Button>
                    ) : null
                  }
                  {ALLOWBTNERASE ? (
                      <Button 
                        style={{height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white"}}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setTextInputVisible(false);
                          setSignatureDialogVisible(false);
                          setSignatureURL(null);
                          setPdf(null);
                          setTotalPages(0);
                          setPageNum(0);
                          setPageDetails(null);
                        }}
                      > <FontAwesomeIcon icon={faEraser} /></Button>
                    ) : null
                  }
                  {pdf ? (
                    <>
                      <Button
                        style={{ height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white" }}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          downloadURI(pdf, "file.pdf");
                        }}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </Button>
                    </>
                  ) : null}
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                      <div style={{color: 'white',fontSize: 14}}>
                      <input
                        style={{ width: '40px' }}
                        type="number"
                        onChange={(e) => onJumpToPage(e.target.value)}
                        value={pageNum}
                        id="inputPageNum"
                        // defaultValue={pageNum}
                      />/{totalPages}
                        {/* <input style={{width: '20px'}} onChange={(e) => onSearchPage(e.target.value)} defaultValue={pageNum}></input>/{totalPages} */}
                      </div>
                    </div>
                    <div style={{marginLeft: 8}}>
                      <label htmlFor="search">Rechercher: </label>
                      <input style={{marginLeft: 2}} type="search" id="search" value={searchText} onChange={onChange} />
                    </div>
                    <Button
                      style={{ height: '2.5em', marginLeft: 8, color: 'white', border: "1px solid white" }}
                      variant="outlined"
                      size="small"
                      onClick={handlePrintPdf}
                    >
                      <FontAwesomeIcon icon={faPrint} />
                    </Button>
                  </Toolbar>
                </AppBar>
              ) : null}
              </Box>
        
            <div ref={documentRef}>
              {textInputVisible ? (
                <DraggableText
                  initialText={
                    textInputVisible === "date"
                      ? dayjs().format("M/d/YYYY")
                      : null
                  }
                  onCancel={() => setTextInputVisible(false)}
                  onEnd={setPosition}
                  onSet={async (text) => {
                    const { originalHeight, originalWidth } = pageDetails;
                    const scale = originalWidth / documentRef.current.clientWidth;

                    const y =
                      documentRef.current.clientHeight -
                      (position.y +
                        (12 * scale) -
                        position.offsetY -
                        documentRef.current.offsetTop);
                    const x =
                      position.x -
                      166 -
                      position.offsetX -
                      documentRef.current.offsetLeft;
                    const newY =
                      (y * originalHeight) / documentRef.current.clientHeight;
                    const newX =
                      (x * originalWidth) / documentRef.current.clientWidth;

                    const pdfDoc = await PDFDocument.load(pdf);
                    const pages = pdfDoc.getPages();
                    const firstPage = pages[pageNum-1];
                    firstPage.drawText(text, {
                      x: newX,
                      y: newY,
                      size: 20 * scale,
                    });

                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([new Uint8Array(pdfBytes)]);
                    const URL = await blobToURL(blob);
                    setPdf(URL);
                    setPosition(null);
                    setTextInputVisible(false);
                  }}
                />
              ) : null}
              {signatureURL ? (
                <DraggableSignature
                  url={signatureURL}
                  onCancel={() => {
                    setSignatureURL(null);
                  }}
                  onSet={async () => {
                    const { originalHeight, originalWidth } = pageDetails;
                    const scale = originalWidth / documentRef.current.clientWidth;

                    const y =
                      documentRef.current.clientHeight -
                      (position.y -
                        position.offsetY +
                        64 -
                        documentRef.current.offsetTop);
                    const x =
                      position.x -
                      160 -
                      position.offsetX -
                      documentRef.current.offsetLeft;
                    const newY =
                      (y * originalHeight) / documentRef.current.clientHeight;
                    const newX =
                      (x * originalWidth) / documentRef.current.clientWidth;

                    const pdfDoc = await PDFDocument.load(pdf);
                    const pages = pdfDoc.getPages();
                    const firstPage = pages[pageNum-1];
                    const pngImage = await pdfDoc.embedPng(signatureURL);
                    const pngDims = pngImage.scale( scale * .3);

                    firstPage.drawImage(pngImage, {
                      x: newX,
                      y: newY,
                      width: pngDims.width,
                      height: pngDims.height,
                    });

                    if (autoDate) {
                      firstPage.drawText(
                        `Signé ${dayjs().format(
                          "M/d/YYYY HH:mm:ss ZZ"
                        )}`,
                        {
                          x: newX,
                          y: newY - 10,
                          size: 14 * scale,
                          color: rgb(0.074, 0.545, 0.262),
                        }
                      );
                    }

                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([new Uint8Array(pdfBytes)]);
                    const URL = await blobToURL(blob);
                    setPdf(URL);
                    setPosition(null);
                    setSignatureURL(null);
                  }}
                  onEnd={setPosition}
                />
              ) : null}
                {pdf ? (
                  <PdfContainer onScroll={handleScroll}>
                    <Document
                      file={pdf}
                      onLoadSuccess={(data) => {
                        setTotalPages(data.numPages);
                      }}
                    >

                  <React.Fragment>
                    {Array.from(new Array(totalPages), (el, index) => (
                      <React.Fragment key={`page_${index + 1}`}>
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        onClick={handleTextSelection}
                        customTextRenderer={textRenderer}
                        width={800}
                        height={1200}
                        onLoadSuccess={(data) => {
                          setPageDetails(data);
                        }}
                        data-page-number={index + 1}
                      />
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                      {/* ))} */}
                    </Document>
                    {/* <iframe
                      width="800" height="1200" 
                      toolbar="1"
                      title="PDF Viewer"
                      type="application/pdf"
                      id="frame"
                      src={pdf}
                      style={{ border: 'none' }}
                    /> */}
                  </PdfContainer>
                ) : null} 
              </div>
          </div>
        ) : null}
        {pdf ? (  
          <TextSelectView>
            <p>Nombre de pages : {totalPages}</p>
            <strong>Texte sélectionné : {selectedText}</strong>
          </TextSelectView>
          ) 
        : null}
      </Viewer>
    </PdfViewer>
  );
}

const PdfContainer = styled.div`
  overflow-y: auto; 
  height: 94vh; 
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TextSelectView = styled.div`
  width: 30%;
  height: 500px;
  overflow: auto;
`;

const Viewer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PdfViewer = styled.div`
  // padding-top: 4em;
  .highlighted-text {
    background-color: yellow;
  }
`;
