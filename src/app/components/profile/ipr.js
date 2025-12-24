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
import { enGB } from 'date-fns/locale';

import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import { useFacultyData } from '../../../context/FacultyDataContext'
import Collaborater from '../modal/collaborater'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import AddIcon from '@mui/icons-material/Add'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        title: '',
        type: '',
        registration_date: null,
        publication_date: null,
        grant_date: null,
        grant_no: '',
        applicant_name: '',
        inventors: ''
        ,collaboraters: []
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const formatDateToUTC = (date) => {
        if (!date) return null;
        const dateObj = new Date(date);
        return new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())).toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const requestBody = {
                id: Date.now().toString(),
                email: session?.user?.email?.trim() || '',
                title: content.title?.trim() || '',
                collaboraters: content.collaboraters || [],
                type: 'ipr',
                iprtype: content.type?.trim() || '',
                registration_date: formatDateToUTC(content.registration_date),
                publication_date: formatDateToUTC(content.publication_date),
                grant_date: formatDateToUTC(content.grant_date),
                grant_no: content.grant_no?.trim() || '',
                applicant_name: content.applicant_name?.trim() || '',
                inventors: content.inventors?.trim() || '',
            };

            if (!requestBody.email || !requestBody.title || !requestBody.type) {
                alert('Please fill out all required fields.');
                setSubmitting(false);
                return;
            }

            const response = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                console.log('Record created successfully');
                
                // Get current IPRs from parent component
                const { updateFacultyData, facultyData } = window.getIPRComponent();
                
                // Update local state in parent component
                const updatedIprs = [...(facultyData.ipr || []), requestBody];
                updateFacultyData(updatedIprs);
                
                handleClose();
                setContent(initialState);
            } else {
                const errorData = await response.json();
                alert(`Failed to create record: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add IPR/Patent/Copyright/Trademark</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={handleChange}
                    />
                    <InputLabel id="type">IPR Type</InputLabel>
                    <Select
                        labelId="type"
                        name="type"
                        value={content.type}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Patent">Patent</MenuItem>
                        <MenuItem value="Copyright">Copyright</MenuItem>
                        <MenuItem value="Trademark">Trademark</MenuItem>
                        <MenuItem value="Industrial Design">Industrial Design</MenuItem>
                    </Select>
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
                        <DatePicker
                            label="Publication Date"
                            value={content.publication_date}
                            onChange={(newValue) => 
                                setContent({ ...content, publication_date: newValue})
                            }
                            format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                        <DatePicker
                            label="Grant Date"
                            value={content.grant_date}
                            onChange={(newValue) => 
                                setContent({ ...content, grant_date: newValue})
                            }
                            format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Grant Number"
                        name="grant_no"
                        fullWidth
                        value={content.grant_no}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Applicant Name"
                        name="applicant_name"
                        fullWidth
                        required
                        value={content.applicant_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Inventors"
                        name="inventors"
                        fullWidth
                        required
                        value={content.inventors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
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
                        title="IPR Collaborators"
                        description="Add faculty members' emails who have contributed to this IPR."
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

// Edit Form Component
export const EditForm = ({ handleClose, modal, values }) => {
    const { data: session } = useSession()
    const [content, setContent] = useState({
        ...values,
        collaboraters: Array.isArray(values?.collaboraters)
            ? values.collaboraters
            : (values?.collaboraters ? String(values.collaboraters).split(',').map(s => s.trim()).filter(Boolean) : []),
    })
    const [showModalEdit, setShowModalEdit] = useState(false)
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
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...content,
                    collaboraters: content.collaboraters || [],
                    type: 'ipr',
                    email: session?.user?.email,
                    iprtype: content.type,
                    registration_date: formatDateToUTC(content.registration_date),
                    publication_date: formatDateToUTC(content.publication_date),
                    grant_date: formatDateToUTC(content.grant_date)
                }),
            });

            if (!result.ok) throw new Error('Failed to update');

            const updatedIprRecord = {
                ...content,
                type: 'ipr',
                iprtype: content.type,
                registration_date: formatDateToUTC(content.registration_date),
                publication_date: formatDateToUTC(content.publication_date),
                grant_date: formatDateToUTC(content.grant_date)
            };
            
            // Get current IPRs from parent component
            const { updateFacultyData, facultyData } = window.getIPRComponent();
            
            // Update local state in parent component
            const updatedIprs = facultyData.ipr.map(ipr => 
                ipr.id === content.id ? updatedIprRecord : ipr
            );
            updateFacultyData(updatedIprs);
            
            handleClose();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit IPR</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={handleChange}
                    />
                    <InputLabel id="type">IPR Type</InputLabel>
                    <Select
                        labelId="type"
                        name="type"
                        value={content.type}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Patent">Patent</MenuItem>
                        <MenuItem value="Copyright">Copyright</MenuItem>
                        <MenuItem value="Trademark">Trademark</MenuItem>
                        <MenuItem value="Industrial Design">Industrial Design</MenuItem>
                    </Select>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        <DatePicker
                            label="Registration Date"
                            value={new Date(content.registration_date)}
                            onChange={(newValue) => 
                                setContent({ ...content, registration_date: newValue })
                            }
                            format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                        <DatePicker
                            label="Publication Date"
                            value={new Date(content.publication_date)}
                            onChange={(newValue) => 
                                setContent({ ...content, publication_date: newValue })
                            }
                            format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                        <DatePicker
                            label="Grant Date"
                            value={new Date(content.grant_date)}
                            onChange={(newValue) => 
                                setContent({ ...content, grant_date: newValue })
                            }
                            format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Grant Number"
                        name="grant_no"
                        fullWidth
                        value={content.grant_no}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Applicant Name"
                        name="applicant_name"
                        fullWidth
                        required
                        value={content.applicant_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Inventors"
                        name="inventors"
                        fullWidth
                        required
                        value={content.inventors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
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
                        title="IPR Collaborators"
                        description="Add faculty members' emails who have contributed to this IPR."
                        questionToAsked="You can add multiple contributors."
                        onSave={(members) => setContent({ ...content, collaboraters: members })}
                        onClose={setShowModalEdit}
                    />
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
export default function IPRManagement() {
    const { data: session } = useSession()
    const [iprs, setIprs] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedIpr, setSelectedIpr] = useState(null)
    const { facultyData, loading, updateFacultySection } = useFacultyData()
    
    // Use context data instead of API call
    React.useEffect(() => {
        if (facultyData?.ipr) {
            console.log('IPR - Using context data:', facultyData.ipr)
            setIprs(facultyData.ipr || [])
        }
    }, [facultyData])
    
    // Expose functions for child components
    React.useEffect(() => {
        window.getIPRComponent = () => ({
            updateFacultyData: (updatedIprs) => {
                setIprs(updatedIprs);
                updateFacultySection('ipr', updatedIprs);
            },
            facultyData: { ipr: iprs }
        });
        
        return () => {
            delete window.getIPRComponent;
        };
    }, [iprs, updateFacultySection])

    const handleEdit = (ipr) => {
        setSelectedIpr(ipr)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this IPR?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'ipr',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                // Update local state directly
                const updatedIprs = iprs.filter(ipr => ipr.id !== id);
                setIprs(updatedIprs);
                
                // Update context
                updateFacultySection('ipr', updatedIprs);
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">IPR/Patent/Copyright/Trademark</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add IPR/Patent/Copyright/Trademark
                </Button>
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Grant No</TableCell>
                            <TableCell>Grant Date</TableCell>
                            <TableCell>Registration Date</TableCell>
                            <TableCell>Publication Date</TableCell>
                            <TableCell>Applicant Name</TableCell>
                            <TableCell>Inventors</TableCell>
                            <TableCell>Collaborators</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {iprs?.map((ipr) => (
                            <TableRow key={ipr.id}>
                                <TableCell>{ipr.title}</TableCell>
                                <TableCell>{ipr.type}</TableCell>
                                <TableCell>{ipr.grant_no}</TableCell>
                                <TableCell>
                                    {ipr.grant_date ? new Date(ipr.grant_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : '-'}
                                </TableCell>
                                <TableCell>
                                    {ipr.registration_date ? new Date(ipr.registration_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : '-'}
                                </TableCell>
                                <TableCell>
                                    {ipr.publication_date ? new Date(ipr.publication_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : '-'}
                                </TableCell>
                                <TableCell>{ipr.applicant_name}</TableCell>
                                <TableCell>{ipr.inventors}</TableCell>
                                <TableCell>
                                    {ipr.collaboraters && ipr.collaboraters.length > 0 ? (
                                        ipr.collaboraters.map((c, idx) => (
                                            <div key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm inline-block mr-1">{c}</div>
                                        ))
                                    ) : ('-')}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(ipr)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(ipr.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {iprs?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No IPR records found
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

            {selectedIpr && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedIpr(null)
                    }}
                    values={selectedIpr}
                />
            )}
        </div>
    )
}