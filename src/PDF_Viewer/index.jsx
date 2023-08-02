import "../App.css";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Drop from "./Drop";
import { Document, Page, pdfjs, Outline} from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import { blobToURL } from "../utils/Utils";
import PagingControl from "../components/PagingControl";
import { AddSigDialog } from "../components/AddSigDialog";
import DraggableSignature from "../components/DraggableSignature";
import DraggableText from "../components/DraggableText";
import dayjs from "dayjs";
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
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
pdfjs.GlobalWorkerOptions.useWorkerFetch = true; // Add this line to disable worker-based fetching

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function App() {
  const [pdf, setPdf] = useState(null);
  const [autoDate, setAutoDate] = useState(true);
  const [signatureURL, setSignatureURL] = useState(null);
  const [position, setPosition] = useState(null);
  const [signatureDialogVisible, setSignatureDialogVisible] = useState(false);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageDetails, setPageDetails] = useState(null);
  const documentRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedText, setSelectedText] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [highlights, setHighlights] = useState([]);
  const [searchReady, setSearchReady] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState('');

  const onItemClick = ( itemPageNumber ) => {
    console.log(itemPageNumber)
    setPageNum(itemPageNumber.pageNumber);
  }

  const textRenderer = useCallback(
    (textItem) => highlightPattern(textItem.str, searchText),
    [searchText]
  );

  const highlightPattern = (text, pattern) => {
    return text.replace(pattern, (value) => `<mark>${value}</mark>`);
  }
  
  const onChange = (event)  => {
    setSearchText(event.target.value);
  }

  useEffect(() => {
    console.log(pageNum)
    setCurrentPage(1);
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
              <AppBar position="static">
                <Toolbar variant="dense" style={{backgroundColor: '#38383d'}}>
                {!signatureURL ? (
                  <Button 
                      variant="outlined"
                      size="small"
                      style={{height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white"}}
                      onClick={() => setSignatureDialogVisible(true)}
                    > <FontAwesomeIcon icon={faSignature} /></Button>
                  ) : null}
                  <Button 
                    style={{height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white"}}
                    variant="outlined"
                    size="small"
                    onClick={() => setTextInputVisible("date")}
                  > <FontAwesomeIcon icon={faCalendarDays} /> </Button>
                  <Button 
                    style={{height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white"}}
                    variant="outlined"
                    size="small"
                    onClick={() => setTextInputVisible(true)}
                  > <FontAwesomeIcon icon={faFont} /> </Button>
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
                  {pdf ? (
                    <>
                      <Button 
                        variant="outlined"
                        size="small"
                        style={{height: '2.5em', marginRight: 8, color: 'white', border: "1px solid white"}}
                        inverted={true}
                        onClick={() => {
                          downloadURI(pdf, "file.pdf");
                        }}
                      > <FontAwesomeIcon icon={faDownload} /></Button>
                    </>
                  ) : null}
                  <PagingControl
                    style={{color: 'white'}}
                    pageNum={pageNum}
                    setPageNum={setPageNum}
                    totalPages={totalPages}
                  />
                  <div>
                    <label htmlFor="search">Search:</label>
                    <input type="search" id="search" value={searchText} onChange={onChange} />
                  </div>
                </Toolbar>
              </AppBar>
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
                    const firstPage = pages[pageNum];
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
                    const firstPage = pages[pageNum];

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
                        `Signed ${dayjs().format(
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
              <Document
                file={pdf}
                onLoadSuccess={(data) => {
                  setTotalPages(data.numPages);
                }}
              >
                <Outline onItemClick={onItemClick} />
                <Page
                  pageNumber={pageNum + 1}
                  onClick={handleTextSelection}
                  customTextRenderer={textRenderer}
                  width={800}
                  height={1200}
                  onLoadSuccess={(data) => {
                    setPageDetails(data);
                  }}
                >
                  {searchResults.map((highlight, index) => (
                    <HighlightBox
                      key={index}
                      position={highlight.position.boundingRect}
                      color="yellow"
                    />
                  ))}
                </Page>
              </Document>
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

export default App;

const HighlightBox = styled.div`
  position: absolute;
  pointer-events: none;
  background-color: ${props => props.color};
  opacity: 0.5;
  z-index: 1;
  top: ${props => props.position.top}px;
  left: ${props => props.position.left}px;
  width: ${props => props.position.width}px;
  height: ${props => props.position.height}px;
`;

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
  // padding-top: 4em;
  .highlighted-text {
    background-color: yellow;
  }
`;
