import React, {useState, useEffect} from 'react';
import {primary45} from "../utils/Colors";
import Button from '@mui/material/Button';

function useWindowSize() {
    const isClient = typeof window === 'object';
  
    function getSize() {
      return {
        width: isClient ? window.innerWidth : undefined,
        height: isClient ? window.innerHeight : undefined,
      };
    }
  
    const [windowSize, setWindowSize] = useState(getSize);
  
    useEffect(() => {
      if (!isClient) {
        return false;
      }
  
      function handleResize() {
        setWindowSize(getSize());
      }
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount
  
    return windowSize;
}
  
function useIsSmallScreen() {
    const windowSize = useWindowSize();
    return windowSize.width < 600;
}
  

export function Modal({onClose, children, isVisible, style, positionTop}) {
  const isSmallScreen = useIsSmallScreen();

  const styles = {
    container: {
      position: isSmallScreen ? 'fixed' : 'absolute',
      backgroundColor: '#FFF',
      border: `1px solid ${primary45}`,
      borderRadius: 4,
      top: positionTop ? positionTop : isSmallScreen ? 60 : 150,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '50%',
      fontFamily: 'Open Sans',
      zIndex: 10000,
      boxShadow: '0 0px 14px hsla(0, 0%, 0%, 0.2)',
    },
    background: {
      position: 'fixed',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      backgroundColor: '#00000033',
      zIndex: 5000,
    },
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={styles.outer}>
      <div style={styles.background} onClick={onClose} />
      <div style={{...styles.container, ...style}}>{children}</div>
    </div>
  );
}
