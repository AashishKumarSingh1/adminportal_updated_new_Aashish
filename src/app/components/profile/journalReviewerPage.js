import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSession } from "next-auth/react";
import { useFacultyData } from "../../../context/FacultyDataContext";

export default function JournalReviewersPage() {
  const [reviewers, setReviewers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentReviewer, setCurrentReviewer] = useState(null);
  const { data: session } = useSession();
  const { facultyData, loading, updateFacultySection } = useFacultyData();

  // Use context data instead of making API call
  useEffect(() => {
    if (facultyData?.international_journal_reviewers) {
      setReviewers(facultyData.international_journal_reviewers || []);
    }
  }, [facultyData]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleSave = async (reviewer) => {
    const url = reviewer.id ? "/api/reviewers/edit" : "/api/reviewers/create";
    const method = "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewer),
    });

    if (res.ok) {
      const result = await res.json();
      // Update local state
      if (reviewer.id) {
        // Update existing reviewer
        const updatedReviewers = reviewers.map(r => 
          r.id === reviewer.id ? reviewer : r
        );
        setReviewers(updatedReviewers);
        // Update context
        updateFacultySection('international_journal_reviewers', updatedReviewers);
      } else {
        // Add new reviewer
        const newReviewer = { ...reviewer, id: result.id };
        const updatedReviewers = [...reviewers, newReviewer];
        setReviewers(updatedReviewers);
        // Update context
        updateFacultySection('international_journal_reviewers', updatedReviewers);
      }
      setOpenDialog(false);
      setCurrentReviewer(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;
    const res = await fetch(`/api/reviewers?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const updatedReviewers = reviewers.filter((r) => r.id !== id);
      setReviewers(updatedReviewers);
      // Update context
      updateFacultySection('international_journal_reviewers', updatedReviewers);
    }
  };

  const handleEdit = (reviewer) => {
    setCurrentReviewer(reviewer);
    setOpenDialog(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
      <Typography variant="h6" sx={{ m: 2 }}>
        International Journal Reviewers
      </Typography>
       <div className='flex justify-end items-center gap-5'>
      <Button
        variant="contained"
        onClick={() => setOpenDialog(true)}
        sx={{ m: 2 }}
        startIcon={<EditIcon />}
        style={{ backgroundColor: "#830001", color: "white" }}
      >
        Add Reviewer
      </Button>
      </div>
      </div> 
      {loading ? (
        <div>Loading...</div>
      ) : (
        <TableContainer component={Paper}>
          <Table style={{ maxWidth: '90%' }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                {/* <TableCell>Continuing?</TableCell> */}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviewers.length ? (
                reviewers.sort((a, b) => {
                  
                  if (a.is_continuing && !b.is_continuing) return -1;
                  if (!a.is_continuing && b.is_continuing) return 1;

                  return new Date(b.to_date) - new Date(a.to_date);
              }).map((r,index) => (
                  <TableRow key={index}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{formatDate(r.from_date)}</TableCell>
                    <TableCell>
                      {r.is_continuing ? "Ongoing" : formatDate(r.to_date)}
                    </TableCell>
                    {/* <TableCell>{r.is_continuing ? 'Yes' : 'No'}</TableCell> */}
                    <TableCell>
                      <IconButton onClick={() => handleEdit(r)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(r.id)} style={{ color: 'red' }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No reviewers yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {openDialog && (
        <ReviewerDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setCurrentReviewer(null);
          }}
          onSave={handleSave}
          reviewer={currentReviewer}
          email={session?.user?.email}
        />
      )}
    </div>
  );
}

function ReviewerDialog({ open, onClose, onSave, reviewer, email }) {
  const [name, setName] = useState(reviewer?.name || "");
  const [fromDate, setFromDate] = useState(reviewer?.from_date || "");
  const [toDate, setToDate] = useState(reviewer?.to_date || "");
  const [isContinuing, setIsContinuing] = useState(
    reviewer?.is_continuing || false
  );
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const newReviewer = {
      id: reviewer?.id,
      name,
      from_date:formatDate (fromDate),
      to_date: isContinuing
        ? null
        : formatDate(toDate),
      is_continuing: isContinuing,
      email: email,
    };
    onSave(newReviewer);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{reviewer ? "Edit Reviewer" : "Add Reviewer"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={
              fromDate?formatDate(fromDate) :""
            }
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={
              toDate?formatDate(toDate) : ""
            }
            onChange={(e) => setToDate(e.target.value)}
            disabled={isContinuing}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isContinuing}
                onChange={(e) => {
                  setIsContinuing(e.target.checked);
                  if (e.target.checked) setToDate("");
                }}
              />
            }
            label="Currently Reviewing"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
