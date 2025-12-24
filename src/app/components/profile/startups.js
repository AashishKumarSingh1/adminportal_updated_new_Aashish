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
import Collaborater from '../modal/collaborater';

import useRefreshData from '@/custom-hooks/refresh'
import { useFacultyData } from '@/context/FacultyDataContext'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import AddIcon from '@mui/icons-material/Add'
import { useFacultySection } from '../../../context/FacultyDataContext';

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
        ,collaboraters: []
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const {data:start_up_data} = useFacultySection("startups")

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
            const id = Date.now().toString();
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'startups',
                    ...content,
                    collaboraters: content.collaboraters || [],
                    registration_date: formatDateToUTC(content.registration_date),
                    id: id,
                    email: session?.user?.email
                }),
            });

            if (!result.ok) throw new Error('Failed to create')
            content.id = id;
            content.registration_date = formatDateToUTC(content.registration_date);
            const updatedData = [...start_up_data,content]
            
            // Update the context data
            updateFacultySection("startups", updatedData);
            
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
                    <div className="mt-4">
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Collaborating Faculty Members
                        </Typography>

                        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-gray-50">
                            {content.collaboraters && content.collaboraters.length > 0 ? (
                                content.collaboraters.map((collaborator, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {collaborator}
                                    </div>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No collaborators added yet.
                                </Typography>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Add Collaborating Faculty Members
                        </button>
                    </div>

                    <Collaborater
                        isOpen={showModal}
                        initialMembers={content.collaboraters}
                        title="Startup Collaborators"
                        description="Add faculty members' emails who have contributed to this startup."
                        questionToAsked="You can add multiple contributors."
                        onSave={(members) => setContent({ ...content, collaboraters: members })}
                        onClose={setShowModal}
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
        collaboraters: Array.isArray(values?.collaboraters)
            ? values.collaboraters
            : (values?.collaboraters ? String(values.collaboraters).split(',').map(s => s.trim()).filter(Boolean) : []),
    });
    const [showModalEdit, setShowModalEdit] = useState(false)
    const refreshData = useRefreshData(false);
    const [submitting, setSubmitting] = useState(false);
    const {data:start_up_data} = useFacultySection("startups")

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
                    collaboraters: content.collaboraters || [],
                    registration_date: formatDateToUTC(content.registration_date),
                    email: session.user.email,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update. Please try again.');
            }
            

            const updatedData = start_up_data.map((data)=>{
                return data.id === content.id ? content:data
            });
            
            // Update the context data
            updateFacultySection("startups", updatedData);
            

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
                    <div className="mt-4">
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Collaborating Faculty Members
                        </Typography>

                        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-gray-50">
                            {content.collaboraters && content.collaboraters.length > 0 ? (
                                content.collaboraters.map((collaborator, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {collaborator}
                                    </div>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No collaborators added yet.
                                </Typography>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowModalEdit(true)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Edit Collaborating Faculty Members
                        </button>
                    </div>

                    <Collaborater
                        isOpen={showModalEdit}
                        initialMembers={content.collaboraters}
                        title="Startup Collaborators"
                        description="Add faculty members' emails who have contributed to this startup."
                        questionToAsked="You can add multiple contributors."
                        onSave={(members) => setContent({ ...content, collaboraters: members })}
                        onClose={setShowModalEdit}
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
                
                // const updatedData = await response.json();
                const updatedData = startups.filter((startup) => startup.id !== id);
                
                // Update the context data
                updateFacultySection("startups", updatedData);
                
                // Update the component's state
                setStartups(updatedData);
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
                            <TableCell>Collaborators</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                       {startups?.sort((a, b) => {
                            if (!b.registration_date) return 1; 
                            if (!a.registration_date) return -1;

                            return new Date(b.registration_date) - new Date(a.registration_date);
                        }).map((startup,index) => (
                            <TableRow key={index}>
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
                                <TableCell>
                                    {startup.collaboraters && startup.collaboraters.length > 0 ? (
                                        startup.collaboraters.map((c, idx) => (
                                            <div key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm inline-block mr-1">{c}</div>
                                        ))
                                    ) : ('-')}
                                </TableCell>
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