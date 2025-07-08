"use client";
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
} from "@mui/material";
import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSession } from "next-auth/react";

export default function ConferenceSessionChairsPage() {
  const [chairs, setChairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentChair, setCurrentChair] = useState(null);
  const { data: session } = useSession();

  const fetchChairs = async () => {
    try {
      const res = await fetch(`/api/faculty?type=${session?.user?.email}`);
      const data = await res.json();
      setChairs(data?.conference_session_chairs || []);
    } catch (err) {
      console.error("Failed to fetch session chairs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchChairs();
    }
  }, [session]);

  const handleSave = async (chair) => {
    const url = chair.id
      ? `/api/conference-session-chairs?id=${chair.id}`
      : "/api/conference-session-chairs";
    const method = chair.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chair),
    });

    if (res.ok) {
      fetchChairs();
      setOpenDialog(false);
      setCurrentChair(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session chair?"))
      return;
    const res = await fetch(`/api/conference-session-chairs?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setChairs((prev) => prev.filter((chair) => chair.id !== id));
    }
  };

  const handleEdit = (chair) => {
    setCurrentChair(chair);
    setOpenDialog(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
      <Typography variant="h6" sx={{ m: 2 }}>
        Conference Session Chairs
      </Typography>
      <Button
        variant="contained"
        onClick={() => setOpenDialog(true)}
        sx={{ m: 2 }}
        style={{ backgroundColor: '#830001', color: 'white' }}
      >
        Add Session Chair
      </Button>
    </div>
      {loading ? (
        <Typography sx={{ m: 2 }}>Loading...</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ m: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Conference</TableCell>
                <TableCell>Institute</TableCell>
                <TableCell>Place</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chairs.length ? (
                chairs.map((chair) => (
                  <TableRow key={chair.id}>
                    <TableCell>{chair.conference_name}</TableCell>
                    <TableCell>{chair.institute_name}</TableCell>
                    <TableCell>{chair.place || "-"}</TableCell>
                    <TableCell>{formatDate(chair.from_date)}</TableCell>
                    <TableCell>{formatDate(chair.to_date)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(chair)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(chair.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No session chairs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {openDialog && (
        <ChairDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setCurrentChair(null);
          }}
          onSave={handleSave}
          chair={currentChair}
          email={session?.user?.email}
        />
      )}
    </div>
  );
}

function ChairDialog({ open, onClose, onSave, chair, email }) {
  const [conference, setConference] = useState(chair?.conference_name || "");
  const [institute, setInstitute] = useState(chair?.institute_name || "");
  const [place, setPlace] = useState(chair?.place || "");
  const [fromDate, setFromDate] = useState(chair?.from_date || "");
  const [toDate, setToDate] = useState(chair?.to_date || "");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newChair = {
      id: chair?.id,
      conference_name: conference,
      institute_name: institute,
      place,
      from_date: formatDate(fromDate),
      to_date: formatDate(toDate),

      email,
    };
    onSave(newChair);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {chair ? "Edit Session Chair" : "Add Session Chair"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Conference Name"
            value={conference}
            onChange={(e) => setConference(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Institute Name"
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={fromDate?formatDate(fromDate):""}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={toDate?formatDate(toDate):""}
            onChange={(e) => setToDate(e.target.value)}
            required
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
