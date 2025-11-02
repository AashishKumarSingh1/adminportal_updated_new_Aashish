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
import Collaborater from '../modal/collaborater';
import useRefreshData from '@/custom-hooks/refresh'
import { useFacultyData } from '@/context/FacultyDataContext'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const { updateFacultySection } = useFacultyData()
    const initialState = {
        title: '',
        authors: '',
        publisher: '',
        isbn: '',
        year: new Date().getFullYear(),
        scopus: '',
        doi: ''
        ,collaboraters: []
    }
    const [content, setContent] = useState(initialState)
    const [submitting, setSubmitting] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'textbooks',
                    ...content,
                    collaboraters: content.collaboraters || [],
                    publish_date: content.publish_date 
                        ? new Date(content.publish_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                        : null,
                    id: Date.now().toString(),
                    email: session?.user?.email
                }),
            });
            

            if (!result.ok) throw new Error('Failed to create')
            
            const updatedData = await result.json();
                
            // Update the context data
            updateFacultySection(9, updatedData.data);
            
            // Update the component's state via the window reference
            if (window.getTextbooksComponent) {
                window.getTextbooksComponent().updateData(updatedData.data);
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
                <DialogTitle>Add Textbook</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Book Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Authors"
                        name="authors"
                        fullWidth
                        required
                        value={content.authors}
                        onChange={handleChange}
                        helperText="Enter names separated by commas"
                    />
                    <TextField
                        margin="dense"
                        label="Publisher"
                        name="publisher"
                        fullWidth
                        required
                        value={content.publisher}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="ISBN"
                        name="isbn"
                        fullWidth
                        required
                        value={content.isbn}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Publication Year"
                        name="year"
                        type="number"
                        fullWidth
                        required
                        value={content.year}
                        onChange={handleChange}
                        helperText="Enter the year of publication in the format YYYY"
                    />
                    
                    <TextField
                        margin="dense"
                        label="Scopus"
                        name="scopus"
                        fullWidth
                        value={content.scopus}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="DOI"
                        name="doi"
                        fullWidth
                        value={content.doi}
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
                            title="Textbook Collaborators"
                            description="Add faculty members' emails who have contributed to this textbook."
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
    const { updateFacultySection } = useFacultyData()
    const [content, setContent] = useState({
        ...values,
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
        e.preventDefault()
        setSubmitting(true)

        try {
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'textbooks',
                    ...content,
                    collaboraters: content.collaboraters || [],
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            const updatedData = await result.json();
                
            // Update the context data
            updateFacultySection(9, updatedData.data);
            
            // Update the component's state via the window reference
            if (window.getTextbooksComponent) {
                window.getTextbooksComponent().updateData(updatedData.data);
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
                <DialogTitle>Edit Textbook</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Book Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Authors"
                        name="authors"
                        fullWidth
                        required
                        value={content.authors}
                        onChange={handleChange}
                        helperText="Enter author names separated by commas"
                    />
                    <TextField
                        margin="dense"
                        label="Publisher"
                        name="publisher"
                        fullWidth
                        required
                        value={content.publisher}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="ISBN"
                        name="isbn"
                        fullWidth
                        required
                        value={content.isbn}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Year"
                        name="year"
                        type="number"
                        fullWidth
                        required
                        value={content.year}
                        onChange={handleChange}
                        InputProps={{
                            inputProps: { 
                                min: 1900,
                                max: new Date().getFullYear()
                            }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Scopus Index"
                        name="scopus"
                        fullWidth
                        value={content.scopus}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="DOI"
                        name="doi"
                        fullWidth
                        value={content.doi}
                        onChange={handleChange}
                        helperText="Digital Object Identifier (if available)"
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
                        title="Textbook Collaborators"
                        description="Add faculty members' emails who have contributed to this textbook."
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
export default function TextbookManagement() {
    const { data: session } = useSession()
    const { facultyData,updateFacultySection } = useFacultyData();
    const [books, setBooks] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const [loading, setLoading] = useState(true)
    
    // Add window reference to this component
    React.useEffect(() => {
        // Expose the component instance to the window
        window.getTextbooksComponent = () => ({
            updateData: (newData) => {
                setBooks(newData);
            }
        });
        
        // Cleanup
        return () => {
            delete window.getTextbooksComponent;
        };
    }, []);

    // Fetch data
    React.useEffect(() => {
        const fetchBooks = async () => {
            try {
                if (facultyData && facultyData.textbooks) {
                    const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                    if (!response.ok) throw new Error('Failed to fetch')
                    const data = await response.json()
                    setBooks(data.textbooks || [])
                } else {
                    const response = await fetch(`/api/faculty?type=${session?.user?.email}`)
                    if (!response.ok) throw new Error('Failed to fetch')
                    const data = await response.json()
                    setBooks(data.textbooks || [])
                }
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.email) {
            fetchBooks()
        }
    }, [session, facultyData])

    const handleEdit = (book) => {
        setSelectedBook(book)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this textbook?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'textbooks',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                const updatedData = books.filter(book => book.id !== id);
                
                // Update the context data
                updateFacultySection("textbooks", updatedData);
                
                // Update the local state
                setBooks(updatedData)
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Textbooks</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Textbook
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Authors</TableCell>
                            <TableCell>Publisher</TableCell>
                            <TableCell>Scopus</TableCell>
                            <TableCell>DOI</TableCell>
                            <TableCell>ISBN</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Collaborators</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {books?.sort((a, b) => b.year - a.year).map((book) => (
                            <TableRow key={book.id}>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.authors}</TableCell>
                                <TableCell>{book.publisher}</TableCell>
                                <TableCell>{book.scopus}</TableCell>
                                <TableCell>{book.doi}</TableCell>
                                <TableCell>{book.isbn}</TableCell>
                                <TableCell>{book.year}</TableCell>
                                <TableCell>
                                    {book.collaboraters && book.collaboraters.length > 0 ? (
                                        book.collaboraters.map((c, idx) => (
                                            <div key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm inline-block mr-1">{c}</div>
                                        ))
                                    ) : ('-')}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(book)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(book.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {books?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No textbooks found
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

            {selectedBook && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedBook(null)
                    }}
                    values={selectedBook}
                />
            )}
        </div>
    )
}