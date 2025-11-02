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
    InputLabel
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import Collaborater from '../modal/collaborater';
import { enGB } from 'date-fns/locale';

import useRefreshData from '@/custom-hooks/refresh'
import { useFacultyData } from '@/context/FacultyDataContext'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Loading from '../common/Loading'
import { Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useFacultySection } from '../../../context/FacultyDataContext';

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const initialState = {
        event_type: '',
        role: '',
        event_name: '',
        sponsored_by: '',
        start_date: null,
        end_date: null,
        participants_count: ''
        ,collaboraters: []
    }
    const [content, setContent] = useState(initialState)
    const [submitting, setSubmitting] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const {data:workshops_conferences_data} = useFacultySection("workshops_conferences")
    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true);
        e.preventDefault();

        try {
            // create a canonical event object with an id so local context stores it correctly
            const id = Date.now().toString();
            const newEvent = {
                ...content,
                start_date: content.start_date
                    ? new Date(content.start_date).toLocaleDateString('en-CA') // YYYY-MM-DD
                    : null,
                end_date: content.end_date
                    ? new Date(content.end_date).toLocaleDateString('en-CA')
                    : null,
                id,
                email: session?.user?.email,
                collaboraters: content.collaboraters || []
            };

            console.log('Sending data:', { type: 'workshops_conferences', ...newEvent });

            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'workshops_conferences', ...newEvent }),
            });
    
            if (!result.ok) throw new Error('Failed to create');
            
            const updatedData = [...workshops_conferences_data, newEvent];

            // Update the context data
            updateFacultySection("workshops_conferences", updatedData);

            handleClose();
            setContent(initialState);
            alert('Workshop/Conference added successfully');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Workshop/Conference</DialogTitle>
                <DialogContent>
                    <InputLabel id="event-type">Event Type</InputLabel>
                    <Select
                        labelId="event-type"
                        name="event_type"
                        value={content.event_type}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Faculty Development Programme">Faculty Development Programme</MenuItem>
                        <MenuItem value="Workshop">Workshop</MenuItem>
                        <MenuItem value="Conference">Conference</MenuItem>
                        <MenuItem value="Seminar">Seminar</MenuItem>
                        <MenuItem value="Symposium">Symposium</MenuItem>
                        <MenuItem value="National">National</MenuItem>
                        <MenuItem value="International">International</MenuItem>
                    </Select>
                    <InputLabel id="role">Role</InputLabel>
                    <Select
                        labelId="role"
                        name="role"
                        value={content.role}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="Organizer">Organizer</MenuItem>
                        <MenuItem value="Coordinator">Coordinator</MenuItem>
                        <MenuItem value="Speaker">Speaker</MenuItem>
                        <MenuItem value="Chairman">Chairman</MenuItem>
                        <MenuItem value="Secretary">Secretary</MenuItem>
                        <MenuItem value="Participant">Participant</MenuItem>
                    </Select>
                    <TextField
                        margin="dense"
                        label="Event Name"
                        name="event_name"
                        fullWidth
                        required
                        value={content.event_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Sponsored By"
                        name="sponsored_by"
                        fullWidth
                        value={content.sponsored_by}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
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
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Number of Participants"
                        name="participants_count"
                        type="number"
                        fullWidth
                        required
                        value={content.participants_count}
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
                        title="Event Collaborators"
                        description="Add faculty members' emails who have contributed to this event."
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
export const EditForm = ({ handleClose, modal, values , allEvents,onSuccess }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const {data:workshops_conferences_data} = useFacultySection("workshops_conferences")
    // Parse dates when initializing content
    const [content, setContent] = useState({
        ...values,
        start_date: values.start_date ? new Date(values.start_date) : null,
        end_date: values.end_date ? new Date(values.end_date) : null,
        collaboraters: Array.isArray(values?.collaboraters)
            ? values.collaboraters
            : (values?.collaboraters ? String(values.collaboraters).split(',').map(s => s.trim()).filter(Boolean) : []),
    })
    const [submitting, setSubmitting] = useState(false)
    const [showModalEdit, setShowModalEdit] = useState(false)


    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'workshops_conferences',
                    ...content,
                    collaboraters: content.collaboraters || [],
                    // Format dates before sending to API
                    start_date: content.start_date 
                        ? new Date(content.start_date).toISOString().split('T')[0]
                        : null,
                    end_date: content.end_date
                        ? new Date(content.end_date).toISOString().split('T')[0]
                        : null,
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            const updatedData = await result.json();

            const newEvents={
                ...content,
                    start_date: content.start_date 
                        ? new Date(content.start_date).toISOString().split('T')[0]
                        : null,
                    end_date: content.end_date
                        ? new Date(content.end_date).toISOString().split('T')[0]
                        : null,
                    email: session?.user?.email
            }
                
            onSuccess(newEvents)
                        
            handleClose()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Workshop/Conference</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Event Type"
                        name="event_type"
                        select
                        fullWidth
                        required
                        value={content.event_type}
                        onChange={handleChange}
                    >
                        <MenuItem value="Faculty Development Programme">Faculty Development Programme</MenuItem>
                        <MenuItem value="Workshop">Workshop</MenuItem>
                        <MenuItem value="Conference">Conference</MenuItem>
                        <MenuItem value="Seminar">Seminar</MenuItem>
                        <MenuItem value="National">National</MenuItem>
                        <MenuItem value="International">International</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Role"
                        name="role"
                        select
                        fullWidth
                        required
                        value={content.role}
                        onChange={handleChange}
                    >
                        <MenuItem value="Organizer">Organizer</MenuItem>
                        <MenuItem value="Participant">Participant</MenuItem>
                        <MenuItem value="Speaker">Speaker</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Event Name"
                        name="event_name"
                        fullWidth
                        required
                        value={content.event_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Sponsored By"
                        name="sponsored_by"
                        fullWidth
                        value={content.sponsored_by}
                        onChange={handleChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        <DatePicker
                            label="Start Date"
                            value={content.start_date}
                            onChange={(newValue) => {
                                setContent(prev => ({
                                    ...prev,
                                    start_date: newValue
                                }))
                            }}
                             format="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                            required={true}
                        />
                        <DatePicker
                            label="End Date"
                            value={content.end_date}
                            onChange={(newValue) => {
                                setContent(prev => ({
                                    ...prev,
                                    end_date: newValue
                                }))
                            }}
                            renderInput={(params) => (
                                <TextField {...params} fullWidth margin="dense" />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        margin="dense"
                        label="Number of Participants"
                        name="participants_count"
                        type="number"
                        fullWidth
                        value={content.participants_count}
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
                        title="Event Collaborators"
                        description="Add faculty members' emails who have contributed to this event."
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

// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error('Date parsing error:', error);
        return '';
    }
};

// Main Component
export default function WorkshopConferenceManagement() {
    const { data: session } = useSession()
    const { facultyData,loading:load,updateFacultySection } = useFacultyData();
    const [events, setEvents] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({
        open: false,
        severity: 'success',
        message: ''
    })
    
    // Add window reference to this component
    React.useEffect(() => {
        // Expose the component instance to the window
        window.getWorkshopsConferencesComponent = () => ({
            updateData: (newData) => {
                setEvents(newData);
            },
            facultyData:{workshops_conferences:events}
        });
        
        // Cleanup
        return () => {
            delete window.getWorkshopsConferencesComponent;
        };
    }, [events,updateFacultySection]);

     React.useEffect(() => {
        if (facultyData?.workshops_conferences?.length > 0) {
            setEvents(facultyData.workshops_conferences);
            setLoading(false)
        } else {
            setEvents([]);
        }
        }, [facultyData]);


    const handleEdit = (event) => {
        setSelectedEvent(event)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'workshops_conferences',
                        id,
                        email: session?.user?.email
                    }),
                })

                if (!response.ok) throw new Error('Failed to delete')
                
                const updatedData = await response.json();
                const data = events.filter((evt)=>evt.id !== id);
                // Update the context data
                updateFacultySection('workshops_conferences',data);
                
                // Update the local state
                setEvents(data);
                
                setToast({
                    open: true,
                    severity: 'success',
                    message: 'Workshop/Conference deleted successfully!'
                })
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    // if (loading) return <div>
    //     <Loading />
    // </div>
    

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Workshop/Conference</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Workshop/Conference
                </Button>
            </div>
            
                
          

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Event Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Sponsored By</TableCell>
                            <TableCell>Participants</TableCell>
                            <TableCell>Collaborators</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events?.sort((a, b) => new Date(b.end_date) - new Date(a.end_date)).map((event,index) => (
                            <TableRow key={index}>
                                <TableCell>{event.event_name}</TableCell>
                                <TableCell>{event.event_type}</TableCell>
                                <TableCell>{event.role}</TableCell>
                                <TableCell>
                                    {new Date(event.start_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })} - {new Date(event.end_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                </TableCell>
                                <TableCell>{event.sponsored_by}</TableCell>
                                <TableCell>{event.participants_count}</TableCell>
                                <TableCell>
                                    {event.collaboraters && event.collaboraters.length > 0 ? (
                                        event.collaboraters.map((c, idx) => (
                                            <div key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm inline-block mr-1">{c}</div>
                                        ))
                                    ) : ('-')}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        onClick={() => handleEdit(event)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(event.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {events?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No workshops/conferences found
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

            {selectedEvent && (
                <EditForm
                    modal={openEdit}
                    allEvents = {events}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedEvent(null)
                    }}
                    values={selectedEvent}
                    onSuccess={(updatedData)=>{
                        const updatedEvents = events.map(
                            evt => 
                                evt.id === updatedData.id ? updatedData : evt 
                        );

                        setEvents(updatedEvents);
                        updateFacultySection("workshops_conferences",updatedEvents);
                    }}
                />
            )}
        </div>
    )
} 