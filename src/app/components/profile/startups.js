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
  Typography
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { enGB } from 'date-fns/locale';

import useRefreshData from '@/custom-hooks/refresh'
import { useFacultyData } from '@/context/FacultyDataContext'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import AddIcon from '@mui/icons-material/Add'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const initialState = {
        startup_name: '',
        incubation_place: '',
        registration_date: null,
        owners_founders: '',
        annual_income: '',
        pan_number: ''
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
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'startups',
                    ...content,
                    registration_date: formatDateToUTC(content.registration_date),
                    id: Date.now().toString(),
                    email: session?.user?.email
                }),
            });

            if (!result.ok) throw new Error('Failed to create')
            
            const updatedData = await result.json();
            
            // Update the context data
            updateFacultySection(10, updatedData.data);
            
            // Update the component's state via the window reference
            if (window.getStartupsComponent) {
                window.getStartupsComponent().updateStartups(updatedData.data);
            }
            
            handleClose()
            setContent(initialState)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Startup</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Startup Name"
                        name="startup_name"
                        fullWidth
                        required
                        value={content.startup_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Incubation Place"
                        name="incubation_place"
                        fullWidth
                        required
                        value={content.incubation_place}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        <DatePicker
                            label="Registration Date"
                            value={content.registration_date}
                            onChange={(newValue) => 
                                setContent({ ...content, registration_date: newValue})
                            }
                            format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Owners/Founders"
                        name="owners_founders"
                        fullWidth
                        required
                        value={content.owners_founders}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
                    />
                    <TextField
                        margin="dense"
                        label="Annual Income (₹)"
                        name="annual_income"
                        type="number"
                        fullWidth
                        value={content.annual_income}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="PAN Number"
                        name="pan_number"
                        fullWidth
                        required
                        value={content.pan_number}
                        onChange={handleChange}
                    />
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

export const EditForm = ({ handleClose, modal, values }) => {
    const { data: session } = useSession();
    const { updateFacultySection } = useFacultyData();
    const [content, setContent] = useState({
        ...values,
        registration_date: values?.registration_date || null, // Ensure fallback for dates
    });
    const refreshData = useRefreshData(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContent({ ...content, [name]: value });
    };

    const formatDateToUTC = (date) => {
        if (!date) return null;
        const dateObj = new Date(date);
        return new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())).toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!session?.user?.email) {
                throw new Error('User email is required to update the record.');
            }

            const response = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'startups',
                    ...content,
                    registration_date: formatDateToUTC(content.registration_date),
                    email: session.user.email,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update. Please try again.');
            }
            
            const updatedData = await response.json();
            
            // Update the context data
            updateFacultySection(10, updatedData.data);
            
            // Update the component's state via the window reference
            if (window.getStartupsComponent) {
                window.getStartupsComponent().updateStartups(updatedData.data);
            }

            handleClose();
        } catch (error) {
            console.error('Submission Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Startup</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Startup Name"
                        name="startup_name"
                        fullWidth
                        required
                        value={content.startup_name || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Incubation Place"
                        name="incubation_place"
                        fullWidth
                        required
                        value={content.incubation_place || ''}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        <DatePicker
                            label="Registration Date"
                            value={content.registration_date ? new Date(content.registration_date) : null}
                            onChange={(newValue) => {
                                setContent({ ...content, registration_date: newValue });
                            }}
                            format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Owners/Founders"
                        name="owners_founders"
                        fullWidth
                        required
                        value={content.owners_founders || ''}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
                    />
                    <TextField
                        margin="dense"
                        label="Annual Income (₹)"
                        name="annual_income"
                        type="number"
                        fullWidth
                        value={content.annual_income || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="PAN Number"
                        name="pan_number"
                        fullWidth
                        required
                        value={content.pan_number || ''}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="button" onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button type="submit" color="primary" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};


// Main Component
export default function StartupManagement() {
    const { data: session } = useSession()
    const { facultyData, updateFacultySection } = useFacultyData();
    const [startups, setStartups] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedStartup, setSelectedStartup] = useState(null)
    const [loading, setLoading] = useState(true)
    
    // Add window reference to this component
    React.useEffect(() => {
        // Expose the component instance to the window
        window.getStartupsComponent = () => ({
            updateStartups: (newData) => {
                setStartups(newData);
            }
        });
        
        // Cleanup
        return () => {
            delete window.getStartupsComponent;
        };
    }, []);

    // Fetch data
    React.useEffect(() => {
        const fetchStartups = async () => {
            try {
                if (facultyData) {
                    setStartups(facultyData.startups || []);
                    setLoading(false);
                } else {
                    const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                    if (!response.ok) throw new Error('Failed to fetch')
                    const data = await response.json()
                    setStartups(data.startups || [])
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error)
                setLoading(false);
            }
        }

        if (session?.user?.email) {
            fetchStartups()
        }
    }, [session, facultyData])

    const handleEdit = (startup) => {
        setSelectedStartup(startup)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this startup?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'startups',
                        id,
                        email: session?.user?.email,
                    }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete');
                }
                
                const updatedData = await response.json();
                
                // Update the context data
                updateFacultySection(10, updatedData.data);
                
                // Update the component's state
                setStartups(updatedData.data);
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete the startup. Please try again.');
            }
        }
    };
    
    

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Startups</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Startup
                </Button>
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Startup Name</TableCell>
                            <TableCell>Incubation Place</TableCell>
                            <TableCell>Registration Date</TableCell>
                            <TableCell>Owners/Founders</TableCell>
                            <TableCell>Annual Income</TableCell>
                            <TableCell>PAN Number</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {startups?.map((startup) => (
                            <TableRow key={startup.id}>
                                <TableCell>{startup.startup_name}</TableCell>
                                <TableCell>{startup.incubation_place}</TableCell>
                                <TableCell>
                                    {startup.registration_date ? new Date(startup.registration_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : '-'}
                                </TableCell>
                                <TableCell>{startup.owners_founders}</TableCell>
                                <TableCell>₹{startup.annual_income}</TableCell>
                                <TableCell>{startup.pan_number}</TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(startup)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(startup.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {startups?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No startups found
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

            {selectedStartup && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedStartup(null)
                    }}
                    values={selectedStartup}
                />
            )}
        </div>
    )
}