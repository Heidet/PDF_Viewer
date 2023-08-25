import "../App.css";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs, Outline, Thumbnail } from "react-pdf";
import { NonFullScreenPageMode, PDFDocument, rgb, degrees, Image  } from "pdf-lib";
import { blobToURL } from "../utils/Utils";
import { AddSigDialog } from "../components/AddSigDialog";
import DraggableSignature from "../components/DraggableSignature";
import DraggableInput from "../components/DraggableInput";
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
import EditNoteIcon from '@mui/icons-material/EditNote';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Fab from '@mui/material/Fab';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { CropLandscapeOutlined } from "@mui/icons-material";
// #38383d
/// FONT Viewer #2a2a2e

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
pdfjs.GlobalWorkerOptions.useWorkerFetch = false;


export default function App() {
  const [pdf, setPdf] = useState(null);
  const [autoDate, setAutoDate] = useState(true);
  const [signatureURL, setSignatureURL] = useState(null);
  const [position, setPosition] = useState(null);
  const [signatureDialogVisible, setSignatureDialogVisible] = useState(false);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageDetails, setPageDetails] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [shouldExecuteOnScroll, setShouldExecuteOnScroll] = useState(true);
  const [scale, setScale] = useState(1.0);
  const scalePercentage = (scale * 100).toFixed(0) + '%';
  const [rotationAngle, setRotationAngle] = useState(0);
  const [rotationAngles, setRotationAngles] = useState({});
  const [allowBtnSignature, setAllowBtnSignature] = useState(0);
  const [allowBtnDate, setAllowBtnDate] = useState(0);
  const [allowBtnText, setAllowBtnText] = useState(0);
  const [allowBtnErase, setAllowBtnErase] = useState(0);
  const [allowBtnSavePdf, setAllowBtnSavePdf] = useState(1);
  const [showBtnEdit, setShowBtnEdit] = useState(1);
  const [adjustPageWidth, setAdjustPageWidth] = useState(false); 
  const [thumbnailsVisible, setThumbnailsVisible] = useState(false);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(null);

  // const [thumbnailBatch, setThumbnailBatch] = useState([]);
  // const [lastLoadedThumbnailIndex, setLastLoadedThumbnailIndex] = useState(0);
  
  const [thumbnails, setThumbnails] = useState([]);
  let pageNumInputRef = null;
  const viewerContainerRef = useRef(null);
  const documentRef = useRef(null);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState(false); 
  // const [loadingThumbnails, setLoadingThumbnails] = useState(true);

  const handleRotation = () => {
    setRotationAngle(90)

    if (rotationAngle === 90) {
      setRotationAngle(180)
    } else if (rotationAngle === 180) {
      setRotationAngle(270)
    }
    else if (rotationAngle === 270) {
      setRotationAngle(360)
    }
    else if (rotationAngle === 360) {
      setRotationAngle(0)
    }

    setRotationAngles((prevAngles) => ({
      ...prevAngles,
      [pageNum]: rotationAngle,
    }));
  };

  const increaseZoom = () => {
    setScale(scale + 0.3);
  };

  const decreaseZoom = () => {
    if (scale > 0.2) {
      setScale(scale - 0.3);
    }
  };

  const changeZoomInput = (inputValue) => {
    inputValue.replace('%', '')
    const value = (parseInt(inputValue) / 100)
    setScale(value);
  };

  const downloadURI = (uri, name) => {
    let base64Data = undefined
    if (pdf.startsWith('data:application/pdf;base64,')) {
      base64Data = pdf.replace(/^data:application\/pdf;base64,/, '');
    } else {
      base64Data = pdf.replace(/^data:application\/octet-stream;base64,/, '');
    }

    const blob = base64ToBlob(base64Data, 'application/pdf');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = async () => {
    let base64Data = undefined;

    console.log('pdf =>', pdf)
    console.log('pdf.startsWith(blob:) =>', pdf.startsWith('blob:'))
    if (pdf.startsWith('blob:')) {
      const pdfWindow = window.open(pdf, '_blank');
      console.log(pdfWindow)
      if (pdfWindow) {
        pdfWindow.onload = () => {
          pdfWindow.print();
          URL.revokeObjectURL(pdf);
        };
      }
    } else {
      if (pdf.startsWith('data:application/pdf;base64,')) {
        base64Data = pdf.replace(/^data:application\/pdf;base64,/, '');
      } else {
        base64Data = pdf.replace(/^data:application\/octet-stream;base64,/, '');
      }

      // const pdfDoc = await PDFDocument.load(pdf);
      const blob = base64ToBlob(base64Data, 'application/pdf');
      const blobUrl = URL.createObjectURL(blob);

      const pdfWindow = window.open(blobUrl, '_blank');
      if (pdfWindow) {
        pdfWindow.onload = () => {
          pdfWindow.print();
          URL.revokeObjectURL(pdf);
        };
      }
    }
  };

  // const loadNextThumbnailBatch = async () => {
  //   const newBatch = [];
  //   const pdfDoc = await PDFDocument.load(await fetch(pdf).then(res => res.arrayBuffer()));
  //   for (let i = lastLoadedThumbnailIndex; i < lastLoadedThumbnailIndex + 10 && i < totalPages; i++) {
  //     const page = await pdfDoc.getPage(i + 1);
  //     const viewport = page.getViewport({ scale: 0.2 });
  //     const canvas = document.createElement('canvas');
  //     const canvasContext = canvas.getContext('2d');
  //     canvas.width = viewport.width;
  //     canvas.height = viewport.height;
  
  //     const renderContext = {
  //       canvasContext,
  //       viewport,
  //     };
  //     await page.render(renderContext).promise;
  //     const thumbnailDataURL = canvas.toDataURL('image/jpeg');
  //     newBatch.push(thumbnailDataURL);
  //   }
  
  //   setThumbnailBatch(prevBatch => [...prevBatch, ...newBatch]);
  //   setLastLoadedThumbnailIndex(lastLoadedIndex => lastLoadedIndex + 10);
  // };

  const handleScroll = () => {
    if (shouldExecuteOnScroll) {
      if (documentRef.current) {
        const parentElement = documentRef.current;
        const pageElements = parentElement.querySelectorAll('[data-page-number]');
        let currentPageNumber = 1;
        let smallestDistanceToTop = Infinity;
        for (let i = 0; i < pageElements.length; i++) {
          const pageElement = pageElements[i];

          if (!pageElement.classList.contains('react-pdf__Thumbnail__page')) {
            const rect = pageElement.getBoundingClientRect();
            const distanceToTop = Math.abs(rect.top);
            if (distanceToTop < smallestDistanceToTop) {
              smallestDistanceToTop = distanceToTop;
              currentPageNumber = parseInt(pageElement.getAttribute('data-page-number'));
            }
          }
        }
        setPageNum(currentPageNumber);
      }
    }
  };
  
  const base64ToBlob = (base64Data, contentType) => {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  const scrollToTop = () => {
    scrollToPage(1);
  };

  const scrollToPage = (pageNumber) => {
    if (documentRef.current) {
      const pageElement = documentRef.current.querySelector(`[data-page-number="${pageNumber}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth" });
        setPageNum(pageNumber);
        setTimeout(() => {
          if (pageNumInputRef) {
            pageNumInputRef.blur();
          }
        }, 2000);
      }
    }
  };

  const onShowEdit = () => {
    setAllowBtnSignature(1);
    setAllowBtnDate(1);
    setAllowBtnText(1);
    setAllowBtnErase(1);
    setAllowBtnSavePdf(1);
    setShowBtnEdit(0);
  }

  const onHideEdit = () => {
    setAllowBtnSignature(0);
    setAllowBtnSavePdf(0);
    setAllowBtnErase(0);
    setAllowBtnText(0);
    setAllowBtnDate(0);
    setShowBtnEdit(1);
  }

  const onSavePdfBase64 = () => {
    console.log('SAVE')
  }

  const removePage = async () => {
    if (!pdf) return;

    const pdfDoc = await PDFDocument.load(await fetch(pdf).then(res => res.arrayBuffer()));
    if (!pdfDoc) return;

    const pages = pdfDoc.getPages();
    if (pageNum > 0 && pageNum <= pages.length) {
      pdfDoc.removePage(pageNum - 1);
      const newPdfBytes = await pdfDoc.save();
      const newPdfUrl = URL.createObjectURL(new Blob([newPdfBytes], { type: 'application/pdf' }));
      setPdf(newPdfUrl);
      setTotalPages(pages.length - 1);
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
  };

  const onChange = (event) => {
    setSearchText(event.target.value.toLowerCase());
  }

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };


  // useEffect(() => {
  //   (async () => {
  //     if (!pdf) return;
  
  //     const loadingTask = pdfjs.getDocument(pdf);
  //     const pdfDocument = await loadingTask.promise;
  //     const numPages = pdfDocument.numPages;
  
  //     const extractedThumbnails = [];
  
  //     for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
  //       const page = await pdfDocument.getPage(pageNumber);
  //       const viewport = page.getViewport({ scale: 0.2 });
  
  //       const canvas = document.createElement('canvas');
  //       const canvasContext = canvas.getContext('2d');
  //       canvas.width = viewport.width;
  //       canvas.height = viewport.height;
  
  //       const renderContext = {
  //         canvasContext,
  //         viewport,
  //       };
  //       await page.render(renderContext).promise;
  //       const thumbnailDataURL = canvas.toDataURL('image/jpeg');
  //       extractedThumbnails.push(thumbnailDataURL);
  //     }

  //     setThumbnails(extractedThumbnails);
  //   })();
  // }, [pdf]);

  // useEffect(() => {
  //   setLoadingThumbnails(true);
  //   if (pdf) {
  //     const loadingTask = pdfjs.getDocument(pdf);
  //     loadingTask.promise.then(async (pdfDocument) => {
  //       const numPages = pdfDocument.numPages;
  //       const thumbnailPromises = [];
  
  //       for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
  //         const page = await pdfDocument.getPage(pageNumber);
  //         const viewport = page.getViewport({ scale: 0.2 });
  //         const canvas = document.createElement('canvas');
  //         const canvasContext = canvas.getContext('2d');
  //         canvas.width = viewport.width;
  //         canvas.height = viewport.height;
  
  //         const renderContext = {
  //           canvasContext,
  //           viewport,
  //         };
  
  //         await page.render(renderContext).promise;
  //         const thumbnailDataURL = canvas.toDataURL();
  //         thumbnailPromises.push(thumbnailDataURL);
  //       }
  
  //       setThumbnails(thumbnailPromises);
  //       setThumbnailsLoaded(true);
  //       setAdjustPageWidth(true);
  //       setLoadingThumbnails(false);
  //     }).catch((error) => {
  //       setLoadingThumbnails(false);
  //       console.error('Erreur lors du chargement des vignettes:', error);
  //     });
  //   }
  // }, [pdf]);
  
  useEffect(() => {
    setSelectedText('');
    scrollToPage(pageNum);
  }, [pageNum, selectedThumbnailIndex]);

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
          <ViewerContent >
            <Box sx={{ flexGrow: 1 }}>
              {pdf ? (
                <AppBar position="static">
                  <Toolbar variant="dense" style={{ backgroundColor: '#2a2a2e' }}>
                    <Button
                      style={{ height: '2.5em', marginRight: 8, color: 'white', border: '1px solid white' }}
                      variant="outlined"
                      size="small"
                      onClick={removePage}
                    >
                      Supprimer cette page
                    </Button>
                    {/* {showBtnEdit ? (
                        <Button
                          variant="outlined"
                          size="small"
                          style={{ height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white" }}
                          onClick={() => onShowEdit() }
                        > <EditIcon /></Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          style={{ height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white" }}
                          onClick={() => onHideEdit() }
                        > <RemoveRedEyeIcon /></Button>
                      )
                    }
                    {!signatureURL && allowBtnSignature ? (
                        <Button
                          variant="outlined"
                          size="small"
                          style={{ height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white" }}
                          onClick={() => setSignatureDialogVisible(true)}
                        > <FontAwesomeIcon icon={faSignature} /></Button>
                      ) : null
                    }
                    {allowBtnDate ? (
                        <Button
                          style={{ height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white" }}
                          variant="outlined"
                          size="small"
                          onClick={() => setTextInputVisible("date")}
                        > <FontAwesomeIcon icon={faCalendarDays} /></Button>
                      ) : null
                    }
                    {allowBtnText ? (
                        <Button
                          style={{ height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white" }}
                          variant="outlined"
                          size="small"
                          onClick={() => setTextInputVisible(true)}
                        > <FontAwesomeIcon icon={faFont} /></Button>
                      ) : null
                    }
                    {allowBtnErase ? (
                        <Button
                          style={{ height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white" }}
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
                    } */}
                    {pdf ? (
                      <>
                        <button style={{ color: 'white', background: 'transparent', border: 'none', fontSize: '30px', marginBottom: '0.2em' }} onClick={decreaseZoom}>-</button>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ color: 'white', fontSize: 14 }}>
                            <input
                              style={{ width: '35px' }}
                              value={scalePercentage}
                              id="scalePercentage"
                              onChange={(e) => changeZoomInput(e.target.value)}
                            />
                          </div>
                        </div>
                        <button style={{ color: 'white', background: 'transparent', border: 'none', fontSize: '30px' }} onClick={increaseZoom}>+</button>
                        <Button
                          style={{ height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white" }}
                          variant="outlined"
                          size="small"
                          onClick={handleRotation}
                        >
                          <RotateRightIcon />
                        </Button>
                      </>
                    ) : null}
                    <div style={{ color: 'silver' }}>|</div>
                    <div style={{ marginLeft: '10px', marginRight: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ color: 'white', fontSize: 14 }}>
                        <input
                          style={{ width: '30px' }}
                          type="number"
                          onChange={(e) => scrollToPage(e.target.value)}
                          value={pageNum}
                          id="inputPageNum"
                          ref={(input) => {
                            pageNumInputRef = input;
                          }}
                        />/{totalPages}
                      </div>
                    </div>
                    <div style={{ color: 'silver' }}>|</div>
                    <div style={{ marginLeft: 8 }}>
                      <input placeholder="Rechercher :" style={{ marginLeft: 2, borderRadius: '0.5em', height: '2em' }} type="search" id="search" value={searchText} onChange={onChange} />
                    </div>
                    <Button
                      style={{ height: '2.5em', marginLeft: 8, marginRight: 8, color: 'white', border: "1px solid white" }}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        downloadURI(pdf, "file.pdf");
                      }}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </Button>
                    <Button
                      style={{ height: '2.5em', marginLeft: 0, color: 'white', border: "1px solid white" }}
                      variant="outlined"
                      size="small"
                      onClick={handlePrintPdf}
                    >
                      <FontAwesomeIcon icon={faPrint} />
                    </Button>
                    {allowBtnSavePdf ? (
                      <Button
                        variant="outlined"
                        size="small"
                        style={{ height: '2.5em', marginLeft: 8, marginRight: 0, color: 'white', border: "1px solid white" }}
                        onClick={() => onSavePdfBase64()}
                      > <FileUploadIcon /></Button>
                    ) : null}
                  </Toolbar>
                </AppBar>
              ) : null}
            </Box>
            <div ref={documentRef}>
              {textInputVisible ? (
                <DraggableInput
                  initialText={
                    textInputVisible === "date"
                      ? dayjs().format("d/M/YYYY")
                      : null
                  }
                  typeField={textInputVisible}
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
                    const firstPage = pages[pageNum - 1];
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
                    const firstPage = pages[pageNum - 1];
                    const pngImage = await pdfDoc.embedPng(signatureURL);
                    const pngDims = pngImage.scale(scale * .3);

                    firstPage.drawImage(pngImage, {
                      x: newX,
                      y: newY,
                      width: pngDims.width,
                      height: pngDims.height,
                    });

                    if (autoDate) {
                      firstPage.drawText(
                        `Signé ${dayjs().format(
                          "d/M/YYYY HH:mm:ss ZZ"
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
                <PdfContainer ref={viewerContainerRef} onScroll={handleScroll}>
                  <Document
                    file={pdf}
                    onLoadSuccess={(data) => {
                      setTotalPages(data.numPages);
                    }}
                  >
                    <Container>
                      {thumbnailsVisible && (
                        <ThumbnailContainer >
                          {Array.from(new Array(totalPages), (el, index) => (
                            <Thumbnail
                              key={`thumb_${index + 1}`}
                              pageNumber={index + 1}
                              width={150}
                              onClick={() => setSelectedThumbnailIndex(index)}
                              data-thumb-number={index + 1}
                              className={selectedThumbnailIndex === index ? 'selected' : ''}
                            />
                          ))}
                        </ThumbnailContainer>
                      )}
                      
                      {/* {loadingThumbnails ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                          <CircularProgress size={50} /> 
                        </div>
                      ) : (
                        <> */}
                          <Button
                            onClick={() => setThumbnailsVisible(!thumbnailsVisible)}
                            style={{ position: 'absolute', top: '50%', left: thumbnailsVisible ? '15%' : '5%', zIndex: 9999 }}
                          >
                            {thumbnailsVisible ? <ArrowForwardIosIcon style={{color: 'white'}}/> : <ArrowBackIosNewIcon style={{color: 'white'}}/>}
                          </Button>
                          <PagesContainer>
                            {Array.from(new Array(totalPages), (el, index) => (
                              <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                scale={scale}
                                onClick={handleTextSelection}
                                customTextRenderer={textRenderer}
                                width={adjustPageWidth ? 900 : undefined}
                                height={1200}
                                onLoadSuccess={(data) => {
                                  setPageDetails(data);
                                }}
                                rotate={rotationAngles[index + 1] || 0}
                                data-page-number={index + 1}
                              />
                            ))}
                          </PagesContainer>
                        {/* </>
                      )} */}
                      <Fab
                        variant="extended"
                        size="small"
                        style={{
                          borderRadius: '2em',
                          position: 'fixed',
                          height: '3em',
                          bottom: '20px',
                          right: '40%',
                          backgroundColor: 'rgb(215 201 28)',
                        }}
                      >
                        <UpIcon onClick={scrollToTop} />
                      </Fab>
                    </Container>
                  </Document>

                </PdfContainer>
              ) : null}
            </div>
          </ViewerContent>
        ) : null}
        {pdf ? (
          <TextSelectView>
            <strong>Texte sélectionné : {selectedText}</strong>
          </TextSelectView>
        ) : null}
      </Viewer>
    </PdfViewer>
  );
}


const PdfContainer = styled.div`
  overflow-y: auto; 
  height: 94vh; 
  width: 100%!important;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color:#38383d!important;

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
  .selected {
    border: 5px solid rgb(215, 201, 28);
  }
  .react-pdf__Thumbnail{
    margin-top: 0.5em;
  }
  .highlighted-text {
    background-color: yellow;
  }
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #ffffff66;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #ffffff66;
  }
`;

const ViewerContent = styled.div`
  width: 60%!important;
`;

const ThumbnailContainer = styled.div`
  display: ${props => props.loading ? 'none' : 'flex'}; 
  flex-direction: column;
  height: 94vh!important;
  overflow: auto;
  position: sticky;
  top: 0; 

`;

const PagesContainer = styled.div`

  display: flex;
  flex-direction: column;
  margin-left: 30px; 
`;

const Container = styled.div`
  display: flex;
`;