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

// Conference Paper Form
export const ConferencePaperForm = ({ handleClose, modal, initialValues = null }) => {
    const { data: session } = useSession()
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
    const refreshData = useRefreshData(false)
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
            handleClose()
            refreshData()
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
                    {/* Form fields */}
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
    const [tabValue, setTabValue] = useState(0)
    const [journals, setJournals] = useState([])
    const [conferences, setConferences] = useState([])
    const [openJournalForm, setOpenJournalForm] = useState(false)
    const [openConferenceForm, setOpenConferenceForm] = useState(false)
    const [selectedPublication, setSelectedPublication] = useState(null)
    const [loading, setLoading] = useState(true)
    const refreshData = useRefreshData(false)

    React.useEffect(() => {
        const fetchPublications = async () => {
            try {
                const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setJournals(data.journal_papers || [])
                setConferences(data.conference_papers || [])
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchPublications()
        }
    }, [session, refreshData])

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
                refreshData()
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
