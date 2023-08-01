import React from "react";
import Button from '@mui/material/Button';
import styled from 'styled-components';

export function ConfirmOrCancel({
  onCancel,
  onConfirm,
  leftBlock,
  hideCancel,
  disabled
}) {

  return (
    <ViewerSign>
      <div>{leftBlock}</div>
      <div>
        {!hideCancel ? (
          <Button
            variant="outlined"
            size="small"
            style={{marginRight: 8}}
            onClick={onCancel}
          > Annuler </Button>
        ) : null}
        <Button variant="outlined" style={{marginRight: 8}} size="small" inverted={true} onClick={onConfirm} disabled={disabled}> Confirmer </Button>
      </div>
    </ViewerSign>
  );
}

const ViewerSign = styled.div`
  float: right;
  padding-bottom: 2em;
  padding-top: 2em;

`;
