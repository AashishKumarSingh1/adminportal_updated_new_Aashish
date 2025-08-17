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
import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Loading from '../common/Loading'
import AddIcon from '@mui/icons-material/Add'
import { useFacultyData } from '../../../context/FacultyDataContext'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        title: '',
        editors: '',
        publisher: '',
        isbn: '',
        year: new Date().getFullYear(),
        scopus: '',
        doi: ''
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const newBook = {
                type: 'edited_books',
                ...content,
                publish_date: content.publish_date
                    ? new Date(content.publish_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                    : null,
                id: Date.now().toString(),
                email: session?.user?.email
            };
            
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBook),
            });
            
            if (!result.ok) throw new Error('Failed to create')
            
            // Get current books from parent component
            const { updateFacultyData, facultyData } = window.getBooksComponent();
            
            // Update local state in parent component
            const updatedBooks = [...(facultyData.edited_books || []), newBook];
            updateFacultyData(updatedBooks);
            
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
                <DialogTitle>Add Edited Book</DialogTitle>
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
                        label="Editors"
                        name="editors"
                        fullWidth
                        required
                        value={content.editors}
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
    const [content, setContent] = useState(values)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const updatedBook = {
                type: 'edited_books',
                ...content,
                email: session?.user?.email
            };
            
            const result = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBook),
            })

            if (!result.ok) throw new Error('Failed to update')
            
            // Get current books from parent component
            const { updateFacultyData, facultyData } = window.getBooksComponent();
            
            // Update local state in parent component
            const updatedBooks = facultyData.edited_books.map(book => 
                book.id === content.id ? updatedBook : book
            );
            updateFacultyData(updatedBooks);
            
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
                <DialogTitle>Edit Book</DialogTitle>
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
                        label="Editors"
                        name="editors"
                        fullWidth
                        required
                        value={content.editors}
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
export default function EditedBookManagement() {
    const { data: session } = useSession()
    const [books, setBooks] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const { facultyData, loading, updateFacultySection } = useFacultyData()

    // Use context data instead of API call
    React.useEffect(() => {
        if (facultyData?.edited_books) {
            console.log('EditedBooks - Using context data:', facultyData.edited_books)
            setBooks(facultyData.edited_books || [])
        }
    }, [facultyData])
    
    // Expose functions for child components
    React.useEffect(() => {
        window.getBooksComponent = () => ({
            updateFacultyData: (updatedBooks) => {
                setBooks(updatedBooks);
                updateFacultySection('edited_books', updatedBooks);
            },
            facultyData: { edited_books: books }
        });
        
        return () => {
            delete window.getBooksComponent;
        };
    }, [books, updateFacultySection, session]);

    const handleEdit = (book) => {
        setSelectedBook(book)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this book?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'edited_books',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                // Update local state directly
                const updatedBooks = books.filter(book => book.id !== id);
                setBooks(updatedBooks);
                
                // Update context
                updateFacultySection('edited_books', updatedBooks);
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <Loading />

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Edited Books</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Edited Book
                </Button>
            </div>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Editors</TableCell>
                            <TableCell>Publisher</TableCell>
                            <TableCell>Scopus</TableCell>
                            <TableCell>DOI</TableCell>
                            <TableCell>ISBN</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {books?.sort((a, b) => b.year - a.year) .map((book) => (
                            <TableRow key={book.id}>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.editors}</TableCell>
                                <TableCell>{book.publisher}</TableCell>
                                <TableCell>{book.scopus}</TableCell>
                                <TableCell>{book.doi}</TableCell>
                                <TableCell>{book.isbn}</TableCell>
                                <TableCell>{book.year}</TableCell>
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
                                <TableCell colSpan={6} align="center">
                                    No edited books found
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