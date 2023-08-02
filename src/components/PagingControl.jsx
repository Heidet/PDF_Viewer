import {primary45} from "../utils/Colors";
import Button from '@mui/material/Button';
export default function PagingControl({totalPages, pageNum, setPageNum}) {
  const styles= {
    inlineFlex: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    pageInfo: {
      color: 'white',
      fontSize: 14,
    }
  }
  return (
    <div style={styles.container}>
      <div style={styles.inlineFlex}>
        <Button
          size="small"
          style={{marginRight: 8, color: 'white'}}
          onClick={() => setPageNum(pageNum - 1)}
          disabled={pageNum-1===-1}
        > Précedent </Button>
        {/* <div style={styles.pageInfo}>
          Page: {pageNum + 1}/{totalPages}
        </div> */}
        <div style={styles.pageInfo}>
          {pageNum + 1}/{totalPages}
        </div>
        <Button
          size="small"
          style={{marginRight: 8, color: 'white'}}
          onClick={() => setPageNum(pageNum + 1)}
          disabled={pageNum+1>totalPages-1}
        > Suivant </Button>
      </div>
    </div>
  );
}
