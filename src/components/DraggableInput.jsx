import Draggable from "react-draggable";
import { FaCheck, FaTimes } from "react-icons/fa";
import { errorColor, goodColor } from "../utils/Colors";
import { useState, useEffect, useRef } from "react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import styled from 'styled-components';
import { Button } from "@mui/material";
import frLocale from "date-fns/locale/fr";

export default function DraggableText({ onEnd, onSet, onCancel, initialText, typeField }) {
  const [text, setText] = useState("Text");
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialText && typeField === 'date') {
      setText(initialText)
    } else {
      inputRef.current.focus();
      inputRef.current.select()
    }
  }, [])

  const styles = {
    container: {
      position: "absolute",
      zIndex: 100000,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    inputContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      paddingRight: "10px",
    },
    input: {
      flex: 1,
      border: 0,
      fontSize: 20,
      padding: 3,
      backgroundColor: 'rgba(0,0,0,0)',
      cursor: 'move',
    },
    datePicker: {
      height: '30px!important',
    },
  };


  return (
    <Draggable onStop={onEnd}>
      <div style={styles.container}>
        <div style={styles.inputContainer}>
          {typeField === 'date' ? (
            <LocalizationProvider dateAdapter={AdapterDayjs} locale={frLocale}>
               <Picker
                // label="Sélectionner une date"
                // value={selectedDate}
                // onChange={(newDate) => setSelectedDate(newDate)}
                format="D/M/YYYY"
              />
            </LocalizationProvider>
          ) : (
            <input
              ref={inputRef}
              style={styles.input}
              value={text}
              placeholder={'Texte'}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </div>
          <Button style={{backgroundColor: 'rgb(56, 56, 61)', width: '30px!important', marginRight: '2px'}} onClick={onCancel} variant="contained"><FaTimes color={errorColor} /> </Button>
          <Button style={{backgroundColor: 'rgb(56, 56, 61)', width: '30px!important'}} onClick={() => onSet(text)} variant="contained">  <FaCheck color={goodColor} /></Button>
     </div>
    </Draggable>
  );
}

const Picker = styled(DatePicker)`
  .MuiInputBase-root{
    height: 30px!important
  }  
  .MuiFormControl-root{
    height: 50px!important;   
  }  
`;