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
  MenuItem,
  Select,
  InputLabel,
  Tabs,
  Tab,
  Box
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useFacultyData } from '@/context/FacultyDataContext'

// Journal Paper Form
export const JournalPaperForm = ({ handleClose, modal, initialValues = null }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const initialState = initialValues || {
        title: '',
        authors: '',
        journal_name: '',
        volume: '',
        issue: '',
        pages: '',
        year: new Date().getFullYear(),
        impact_factor: '',
        indexing: '',
        doi: ''
    }
    const [content, setContent] = useState(initialState)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const url = initialValues ? '/api/update' : '/api/create'
            const method = initialValues ? 'PUT' : 'POST'

            const result = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'journal_papers',
                    ...content,
                    id: initialValues?.id || Date.now().toString(),
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to save')
            
            const updatedData = await result.json();
                
            // Update the context data
            updateFacultySection(6, updatedData.data);
            
            // Update the component's state via the window reference
            if (window.getPublicationsComponent) {
                window.getPublicationsComponent().updateJournalPapers(updatedData.data);
            }
            
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
                <DialogTitle>
                    {initialValues ? 'Edit Journal Paper' : 'Add Journal Paper'}
                </DialogTitle>
                <DialogContent>
                    {/* Form fields */}
                    <TextField
                        margin="dense"
                        label="Paper Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={(e) => setContent({ ...content, title: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Authors"
                        name="authors"
                        fullWidth
                        required
                        value={content.authors}
                        onChange={(e) => setContent({ ...content, authors: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Journal Name"
                        name="journal_name"
                        fullWidth
                        required
                        value={content.journal_name}
                        onChange={(e) => setContent({ ...content, journal_name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Volume"
                        name="volume"
                        fullWidth
                        value={content.volume}
                        onChange={(e) => setContent({ ...content, volume: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Issue"
                        name="issue"
                        fullWidth
                        value={content.issue}
                        onChange={(e) => setContent({ ...content, issue: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Pages"
                        name="pages"
                        fullWidth
                        value={content.pages}
                        onChange={(e) => setContent({ ...content, pages: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Year"
                        name="year"
                        type="number"
                        fullWidth
                        required
                        value={content.year}
                        onChange={(e) => setContent({ ...content, year: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Impact Factor"
                        name="impact_factor"
                        type="number"
                        fullWidth
                        value={content.impact_factor}
                        onChange={(e) => setContent({ ...content, impact_factor: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Indexing"
                        name="indexing"
                        fullWidth
                        value={content.indexing}
                        onChange={(e) => setContent({ ...content, indexing: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="DOI"
                        name="doi"
                        fullWidth
                        value={content.doi}
                        onChange={(e) => setContent({ ...content, doi: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// Conference Paper Form
export const ConferencePaperForm = ({ handleClose, modal, initialValues = null }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const initialState = initialValues || {
        title: '',
        authors: '',
        conference_name: '',
        location: '',
        year: new Date().getFullYear(),
        pages: '',
        doi: '',
        indexing: ''
    }
    const [content, setContent] = useState(initialState)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const url = initialValues ? '/api/update' : '/api/create'
            const method = initialValues ? 'PUT' : 'POST'

            const result = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'conference_papers',
                    ...content,
                    id: initialValues?.id || Date.now().toString(),
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to save')
            
            const updatedData = await result.json();
                
            // Update the context data
            updateFacultySection(4, updatedData.data);
            
            // Update the component's state via the window reference
            if (window.getPublicationsComponent) {
                window.getPublicationsComponent().updateConferencePapers(updatedData.data);
            }
            
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
                <DialogTitle>
                    {initialValues ? 'Edit Conference Paper' : 'Add Conference Paper'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Paper Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={(e) => setContent({ ...content, title: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Authors"
                        name="authors"
                        fullWidth
                        required
                        value={content.authors}
                        onChange={(e) => setContent({ ...content, authors: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Conference Name"
                        name="conference_name"
                        fullWidth
                        required
                        value={content.conference_name}
                        onChange={(e) => setContent({ ...content, conference_name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Location"
                        name="location"
                        fullWidth
                        value={content.location}
                        onChange={(e) => setContent({ ...content, location: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Year"
                        name="year"
                        type="number"
                        fullWidth
                        required
                        value={content.year}
                        onChange={(e) => setContent({ ...content, year: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Pages"
                        name="pages"
                        fullWidth
                        value={content.pages}
                        onChange={(e) => setContent({ ...content, pages: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="DOI"
                        name="doi"
                        fullWidth
                        value={content.doi}
                        onChange={(e) => setContent({ ...content, doi: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Indexing"
                        name="indexing"
                        fullWidth
                        value={content.indexing}
                        onChange={(e) => setContent({ ...content, indexing: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

// TabPanel Component
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Publications List Component
export const PublicationsList = ({ publications, type, onEdit, onDelete }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Authors</TableCell>
                        <TableCell>Year</TableCell>
                        <TableCell>Details</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {publications?.map((pub) => (
                        <TableRow key={pub.id}>
                            <TableCell>{pub.title}</TableCell>
                            <TableCell>{pub.authors}</TableCell>
                            <TableCell>{pub.year}</TableCell>
                            <TableCell>
                                {type === 'journal' && 
                                    `${pub.journal_name} (IF: ${pub.impact_factor || 'N/A'})`}
                                {type === 'conference' && 
                                    `${pub.conference_name}, ${pub.location}`}
                            </TableCell>
                            <TableCell align="right">
                                <IconButton onClick={() => onEdit(pub)} color="primary">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => onDelete(pub.id)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

// Main Publications Component
export default function PublicationsManagement() {
    const { data: session } = useSession()
    const { facultyData, updateFacultySection } = useFacultyData();
    const [tabValue, setTabValue] = useState(0)
    const [journals, setJournals] = useState([])
    const [conferences, setConferences] = useState([])
    const [openJournalForm, setOpenJournalForm] = useState(false)
    const [openConferenceForm, setOpenConferenceForm] = useState(false)
    const [selectedPublication, setSelectedPublication] = useState(null)
    const [loading, setLoading] = useState(true)
    
    // Add window reference to this component
    React.useEffect(() => {
        // Expose the component instance to the window
        window.getPublicationsComponent = () => ({
            updateJournalPapers: (newData) => {
                setJournals(newData);
            },
            updateConferencePapers: (newData) => {
                setConferences(newData);
            }
        });
        
        // Cleanup
        return () => {
            delete window.getPublicationsComponent;
        };
    }, []);

    React.useEffect(() => {
        const fetchPublications = async () => {
            try {
                if (facultyData) {
                    setJournals(facultyData.journal_papers || []);
                    setConferences(facultyData.conference_papers || []);
                } else {
                    const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                    if (!response.ok) throw new Error('Failed to fetch')
                    const data = await response.json()
                    setJournals(data.journal_papers || [])
                    setConferences(data.conference_papers || [])
                }
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchPublications()
        }
    }, [session, facultyData])

    const handleDelete = async (id, type) => {
        if (confirm('Are you sure you want to delete this publication?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: type === 0 ? 'journal_papers' : 'conference_papers',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                const updatedData = await response.json();
                
                // Update the context data
                updateFacultySection(type === 0 ? 6 : 4, updatedData.data);
                
                // Update the local state
                if (type === 0) {
                    setJournals(updatedData.data);
                } else {
                    setConferences(updatedData.data);
                }
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label="Journal Papers" />
                <Tab label="Conference Papers" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <Button 
                    variant="contained" 
                    onClick={() => setOpenJournalForm(true)}
                    sx={{ mb: 2 }}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Journal Paper
                </Button>
                <PublicationsList 
                    publications={journals}
                    type="journal"
                    onEdit={(pub) => {
                        setSelectedPublication(pub)
                        setOpenJournalForm(true)
                    }}
                    onDelete={(id) => handleDelete(id, 0)}
                />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Button 
                    variant="contained" 
                    onClick={() => setOpenConferenceForm(true)}
                    sx={{ mb: 2 }}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Conference Paper
                </Button>
                <PublicationsList 
                    publications={conferences}
                    type="conference"
                    onEdit={(pub) => {
                        setSelectedPublication(pub)
                        setOpenConferenceForm(true)
                    }}
                    onDelete={(id) => handleDelete(id, 1)}
                />
            </TabPanel>

            {/* Forms */}
            <JournalPaperForm 
                modal={openJournalForm}
                handleClose={() => {
                    setOpenJournalForm(false)
                    setSelectedPublication(null)
                }}
                initialValues={selectedPublication}
            />
            <ConferencePaperForm 
                modal={openConferenceForm}
                handleClose={() => {
                    setOpenConferenceForm(false)
                    setSelectedPublication(null)
                }}
                initialValues={selectedPublication}
            />
        </Box>
    )
}
