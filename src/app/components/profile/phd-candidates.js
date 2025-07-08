import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  Typography
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useFacultyData } from '../../../context/FacultyDataContext'
import React, { useState } from 'react'
import { enGB } from 'date-fns/locale';

import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { parseISO } from "date-fns";
import FormControl from '@mui/material/FormControl'
// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        student_name: '',
        roll_no: '',
        registration_year: new Date().getFullYear(),
        registration_type: '',
        research_area: '',
        other_supervisors: '',
        current_status: 'Ongoing',
        completion_year: '',
        supervisor_type:''
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        if (e instanceof Date) {
            setContent((prevContent) => ({
                ...prevContent,
                completion_year: e.toISOString().split("T")[0], 
            }));
        } else if (e?.target) {
            const { name, value } = e.target;
            setContent((prevContent) => ({
                ...prevContent,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const adjustedContent = {
                ...content,
                completion_year: content.completion_year ? new Date(content.completion_year).toISOString().split('T')[0] : '',
            };

            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'phd_candidates',
                    ...adjustedContent,
                    id: Date.now().toString(),
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to create')

            handleClose()
            refreshData()
            setContent(initialState)
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            // window.location.reload()
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add PhD Student</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Student Name"
                        name="student_name"
                        fullWidth
                        required
                        value={content.student_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Roll Number"
                        name="roll_no"
                        fullWidth
                        required
                        value={content.roll_no}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Registration Year"
                        name="registration_year"
                        type="number"
                        fullWidth
                        required
                        value={content.registration_year}
                        onChange={handleChange}
                    />
                    <InputLabel id="reg-type">Registration Type</InputLabel>
                    <Select
                        labelId="reg-type"
                        name="registration_type"
                        value={content.registration_type}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Full Time">Full Time</MenuItem>
                        <MenuItem value="Part Time">Part Time</MenuItem>
                        <MenuItem value="SRF">SRF</MenuItem>
                        <MenuItem value="JRF">JRF</MenuItem>
                    </Select>
                    <TextField
                        margin="dense"
                        label="Research Area/Thesis Title"
                        name="research_area"
                        fullWidth
                        multiline
                        rows={2}
                        required
                        value={content.research_area}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Other Supervisors"
                        name="other_supervisors"
                        fullWidth
                        value={content.other_supervisors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Type of Supervisor</InputLabel>
                        <Select
                            value={content.supervisor_type}
                            onChange={handleChange}
                            name="supervisor_type"
                            label="Type of Supervisor"
                        >
                            {/* <MenuItem value="null">No Supervisor</MenuItem> */}
                            <MenuItem value="Supervisor">Supervisor</MenuItem>
                            <MenuItem value="Co Supervisor">Co Supervisor</MenuItem>
                            <MenuItem value="Joint Supervisor">Joint Supervisor</MenuItem>
                        </Select>
                    </FormControl>
                    <InputLabel id="status">Current Status</InputLabel>
                    <Select
                        labelId="status"
                        name="current_status"
                        value={content.current_status}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                      
                        <MenuItem value="Admission">Admission</MenuItem>
                        <MenuItem value="Comprehension">Comprehension</MenuItem>
                        <MenuItem value="Presubmission">Presubmission</MenuItem>
                        <MenuItem value="Thesis_Submitted">Thesis Submitted</MenuItem>
                        <MenuItem value="Awarded">Awarded</MenuItem>
                        <MenuItem value="Registered">Registered</MenuItem>
                        {/* <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Discontinued">Discontinued</MenuItem> */}
                    </Select>
                    { (
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        <DatePicker
    label="Completion Year"
    value={content.completion_year ? parseISO(content.completion_year) : null}
    onChange={(date) => handleChange({ 
        target: { 
            name: "completion_year", 
            value: date.toLocaleDateString('en-CA')
        } 
    })}
    format="dd/MM/yyyy"
    renderInput={(params) => (
        <TextField
            {...params}
            margin="dense"
            fullWidth
            required
            name="completion_year"
            onChange={handleChange}
        />
    )}
/>
                    </LocalizationProvider>                  
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// Edit Form Component
export const EditForm = ({ handleClose, modal, values }) => {
    const { data: session } = useSession()
    const [content, setContent] = useState({
        student_name: values.student_name || '',
        roll_no: values.roll_no || '',
        registration_year: values.registration_year || new Date().getFullYear(),
        registration_type: values.registration_type || '',
        research_area: values.research_area || '',
        other_supervisors: values.other_supervisors || '',
        current_status: values.current_status || 'Ongoing',
        completion_year: values.completion_year || '',
        supervisor_type: values.supervisor_type || '',
    })
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const adjustedContent = {
                ...content,
                completion_year: content.completion_year ? new Date(content.completion_year).toISOString().split('T')[0] : '',
            };
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'phd_candidates',
                    id: values.id,
                    email: session?.user?.email,
                    ...adjustedContent
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to update PhD candidate')
            }

            refreshData()
            handleClose()
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
            
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit PhD Candidate</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Student Name"
                        name="student_name"
                        fullWidth
                        required
                        value={content.student_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Roll Number"
                        name="roll_no"
                        fullWidth
                        required
                        value={content.roll_no}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Registration Year"
                        name="registration_year"
                        type="number"
                        fullWidth
                        required
                        value={content.registration_year}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Registration Type"
                        name="registration_type"
                        fullWidth
                        required
                        value={content.registration_type}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Research Area/Thesis Title"
                        name="research_area"
                        fullWidth
                        required
                        value={content.research_area}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Other Supervisors"
                        name="other_supervisors"
                        fullWidth
                        value={content.other_supervisors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Type of Supervisor</InputLabel>
                        <Select
                            value={content.supervisor_type}
                            onChange={handleChange}
                            name="supervisor_type"
                            label="Type of Supervisor"
                        >
                            <MenuItem value="Supervisor">Supervisor</MenuItem>
                            <MenuItem value="Co Supervisor">Co Supervisor</MenuItem>
                            <MenuItem value="Joint Supervisor">Joint Supervisor</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        select
                        margin="dense"
                        label="Current Status"
                        name="current_status"
                        fullWidth
                        required
                        value={content.current_status}
                        onChange={handleChange}
                    >
                        <MenuItem value="Ongoing">Ongoing</MenuItem>
                        <MenuItem value="Awarded">Awarded</MenuItem>
                        <MenuItem value="Registered">Registered</MenuItem>
                        {/* <MenuItem value="Discontinued">Discontinued</MenuItem> */}
                    </TextField>
                    {content.current_status === 'Awarded' && (
                       <LocalizationProvider dateAdapter={AdapterDateFns}>
                       <DatePicker
                           label="Completion Year"
                           value={content.completion_year ? parseISO(content.completion_year) : null}
                           onChange={(date) => handleChange({ target: { name: "completion_year", value: date.toISOString().split("T")[0] } })}
                           renderInput={(params) => (
                               <TextField
                                   {...params}
                                   margin="dense"
                                   fullWidth
                                   required
                                   name="completion_year"
                                   onChange={handleChange}
                               />
                           )}
                       />
                   </LocalizationProvider>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// Main Component
export default function PhdCandidateManagement() {
    const { data: session } = useSession()
    const { getPhdCandidates, loading, updateFacultySection } = useFacultyData()
    const [candidates, setCandidates] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedCandidate, setSelectedCandidate] = useState(null)
    const refreshData = useRefreshData(false)

    // Get data from context
    React.useEffect(() => {
        const phdCandidatesData = getPhdCandidates()
        setCandidates(phdCandidatesData)
    }, [getPhdCandidates])

    const handleEdit = (candidate) => {
        setSelectedCandidate(candidate)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'phd_candidates',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                refreshData()
            window.location.reload()
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">PhD Candidates</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add PhD Student
                </Button>
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Roll No</TableCell>
                            <TableCell>Registration Type</TableCell>
                            <TableCell>Registration Year</TableCell>
                            <TableCell>Research Area/Thesis Title</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Status Time</TableCell>
                            <TableCell>supervisor Type</TableCell>
                            <TableCell>Other Supervisors</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {candidates?.map((candidate) => (
                            <TableRow key={candidate.id}>
                                <TableCell>{candidate.student_name}</TableCell>
                                <TableCell>{candidate.roll_no}</TableCell>
                                <TableCell>
                                    {candidate.registration_type} 
                                    {/* (
                                        {candidate.registration_type === "Ongoing" 
                                            ? `${candidate.registration_year} - Continue` 
                                            : candidate.registration_type === "Awarded" 
                                            ? candidate.completion_year 
                                            : candidate.registration_year}
                                        ) */}
                                </TableCell>
                                <TableCell>{candidate.registration_year} </TableCell>
                                <TableCell>{candidate.research_area}</TableCell>
                                <TableCell>{candidate.current_status}</TableCell>
                                <TableCell>{candidate.completion_year ? new Date(candidate.completion_year).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }):"-"}</TableCell>
                                <TableCell>{candidate.supervisor_type? candidate.supervisor_type :"-"}</TableCell>
                                <TableCell>{candidate.other_supervisors}</TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(candidate)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(candidate.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {candidates?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No PhD students found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddForm 
                modal={openAdd}
                handleClose={() => setOpenAdd(false)}
            />

            {selectedCandidate && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedCandidate(null)
                    }}
                    values={selectedCandidate}
                />
            )}
        </div>
    )
}