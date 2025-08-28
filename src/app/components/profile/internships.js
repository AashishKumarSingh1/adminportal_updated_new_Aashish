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
import { enGB } from 'date-fns/locale'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import { useFacultyData } from '../../../context/FacultyDataContext'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Loading from '../common/Loading'
import AddIcon from '@mui/icons-material/Add'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
// Add formatDate helper function at the top
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error('Date parsing error:', error);
        return '';
    }
};

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        student_name: '',
        qualification: '',
        affiliation: '',
        project_title: '',
        start_date: null,
        end_date: null,
        student_type: ''
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const formatDateToUTC = (date) => {
        if (!date) return null;
        const dateObj = new Date(date);
        return new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())).toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const newInternship = {
                type: 'internships',
                ...content,
                // Format start_date and end_date to 'YYYY-MM-DD' for DATE or 'YYYY-MM-DD HH:MM:SS' for DATETIME
                start_date: formatDateToUTC(content.start_date),
                end_date: formatDateToUTC(content.end_date),
                id: Date.now().toString(),
                email: session?.user?.email,
            };
            
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInternship),
            });
              
            if (!result.ok) throw new Error('Failed to create')
            
            // Get current internships from parent component
            const { updateFacultyData, facultyData } = window.getInternshipsComponent();
            
            // Update local state in parent component
            const updatedInternships = [...(facultyData.internships || []), newInternship];
            updateFacultyData(updatedInternships);
            
            handleClose()
            setContent(initialState)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }
    const [isContinuing, setIsContinuing] = useState(false);
    const handleContinueToggle = () => {
        setIsContinuing((prev) => !prev);
        if (!isContinuing) {
            setContent((prev) => ({ ...prev, end_date: null }));
        }
    };

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Internship</DialogTitle>
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
                        label="Qualification"
                        name="qualification"
                        fullWidth
                        required
                        value={content.qualification}
                        onChange={handleChange}
                        select
                    >
                        <MenuItem value="UG">UG</MenuItem>
                        <MenuItem value="PG">PG</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Student Affiliation"
                        name="affiliation"
                        fullWidth
                        required
                        value={content.affiliation}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Project Title"
                        name="project_title"
                        fullWidth
                        required
                        value={content.project_title}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB} >
                        <DatePicker
                            label="Start Date"
                            value={content.start_date}
                            onChange={(newValue) =>
                                setContent({ ...content, start_date: newValue })
                            }
                             format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                            required={true}
                        />
                        <DatePicker
                            label="End Date"
                            value={content.end_date}
                            onChange={(newValue) =>
                                setContent({ ...content, end_date: newValue })
                            }
                             format="dd/MM/yyyy"
                            disabled={isContinuing}
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isContinuing}
                                onChange={handleContinueToggle}
                                color="primary"
                            />
                        }
                        label="Currently Working"
                        style={{ marginTop: '10px' }}
                    />
                    <InputLabel id="student-type">Student Type</InputLabel>
                    <Select
                        labelId="student-type"
                        name="student_type"
                        value={content.student_type}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Internal">Internal Student</MenuItem>
                        <MenuItem value="External">External Student</MenuItem>
                    </Select>
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
    // Parse dates when initializing content
    const [content, setContent] = useState({
        ...values,
        start_date: values.start_date ? new Date(values.start_date) : null,
        end_date: values.end_date ? new Date(values.end_date) : null
    })
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const formatDateToUTC = (date) => {
        if (!date) return null;
        const dateObj = new Date(date);
        return new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())).toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const updatedInternship = {
                type: 'internships',
                ...content,
                // Format dates before sending to API
                start_date: formatDateToUTC(content.start_date),
                end_date: formatDateToUTC(content.end_date),
                email: session?.user?.email
            };
            
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedInternship),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            // Get current internships from parent component
            const { updateFacultyData, facultyData } = window.getInternshipsComponent();
            
            // Update local state in parent component
            const updatedInternships = facultyData.internships.map(internship => 
                internship.id === content.id ? updatedInternship : internship
            );
            updateFacultyData(updatedInternships);
            
            handleClose()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }
    const [isContinuing, setIsContinuing] = useState(false);

    const handleContinueToggle = () => {
        setIsContinuing((prev) => !prev);
        if (!isContinuing) {
            setContent((prev) => ({ ...prev, end_date: null }));
        }
    };

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Internship</DialogTitle>
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
                        label="Qualification"
                        name="qualification"
                        select
                        fullWidth
                        required
                        value={content.qualification}
                        onChange={handleChange}
                    >
                        <MenuItem value="UG">UG</MenuItem>
                        <MenuItem value="PG">PG</MenuItem>
                        <MenuItem value="PhD">PhD</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Student Affiliation"
                        name="affiliation"
                        fullWidth
                        required
                        value={content.affiliation}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Project Title"
                        name="project_title"
                        fullWidth
                        required
                        value={content.project_title}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB} >
                        <DatePicker
                            label="Start Date"
                            value={content.start_date}
                            onChange={(newValue) =>
                                setContent({ ...content, start_date: newValue })
                            }
                             format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                            required={true}
                        />
                        <DatePicker
                            label="End Date"
                            value={content.end_date}
                            onChange={(newValue) =>
                                setContent({ ...content, end_date: newValue })
                            }

                            disabled={isContinuing}
                             format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isContinuing}
                                onChange={handleContinueToggle}
                                color="primary"
                            />
                        }
                        label="Currently Working"
                        style={{ marginTop: '10px' }}
                    />
                    <TextField
                        margin="dense"
                        label="Student Type"
                        name="student_type"
                        select
                        fullWidth
                        required
                        value={content.student_type}
                        onChange={handleChange}
                    >
                        <MenuItem value="Internal">Internal Student</MenuItem>
                        <MenuItem value="External">External Student</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
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
export default function InternshipManagement() {
    const { data: session } = useSession()
    const [internships, setInternships] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedInternship, setSelectedInternship] = useState(null)
    const { facultyData, loading, updateFacultySection } = useFacultyData()
    
    // Use context data instead of API call
    React.useEffect(() => {
        if (facultyData?.internships) {
            console.log('Internships - Using context data:', facultyData.internships)
            setInternships(facultyData.internships || [])
        }
    }, [facultyData])
    
    // Expose functions for child components
    React.useEffect(() => {
        window.getInternshipsComponent = () => ({
            updateFacultyData: (updatedInternships) => {
                setInternships(updatedInternships);
                updateFacultySection('internships', updatedInternships);
            },
            facultyData: { internships: internships }
        });
        
        return () => {
            delete window.getInternshipsComponent;
        };
    }, [internships, updateFacultySection])

    const handleEdit = (internship) => {
        setSelectedInternship(internship)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this internship?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'internships',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                // Update local state directly
                const updatedInternships = internships.filter(internship => internship.id !== id);
                setInternships(updatedInternships);
                
                // Update context
                updateFacultySection('internships', updatedInternships);
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <Loading />

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Internships</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Internship
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Qualification</TableCell>
                            <TableCell>Project Title</TableCell>
                            <TableCell>Student Affiliation</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {internships
                            ?.sort((a, b) => {
                                if (!a.end_date && b.end_date) return -1;
                                if (a.end_date && !b.end_date) return 1;

                                const endA = a.end_date ? new Date(a.end_date) : new Date();
                                const endB = b.end_date ? new Date(b.end_date) : new Date();

                                return endB - endA;
                            }).map((internship) => (
                            <TableRow key={internship.id}>
                                <TableCell>{internship.student_name}</TableCell>
                                <TableCell>{internship.qualification}</TableCell>
                                <TableCell>{internship.project_title}</TableCell>
                                <TableCell>{internship.affiliation}</TableCell>
                                <TableCell>
                                    {new Date(internship.start_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}-{internship.end_date ? new Date(internship.end_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : 'Present'}
                                </TableCell>
                                <TableCell>{internship.student_type}</TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(internship)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(internship.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {internships?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No internships found
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

            {selectedInternship && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedInternship(null)
                    }}
                    values={selectedInternship}
                />
            )}
        </div>
    )
}