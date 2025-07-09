import { IconButton, Box } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

export default function TablePaginationActions(props) {
  const { count, page, rowsPerPage, onPageChange } = props;

  // For infinite scroll, we'll always enable next unless explicitly disabled
  const isLastPage = count !== -1 && page >= Math.ceil(count / rowsPerPage) - 1;

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={(event) => onPageChange(event, 0)}
        disabled={page === 0}
        aria-label="first page"
        size="small"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={(event) => onPageChange(event, page - 1)}
        disabled={page === 0}
        aria-label="previous page"
        size="small"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={(event) => onPageChange(event, page + 1)}
        disabled={isLastPage}
        aria-label="next page"
        size="small"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={(event) => onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))}
        disabled={isLastPage}
        aria-label="last page"
        size="small"
      >
        <FirstPageIcon />
      </IconButton>
    </Box>
  );
} 