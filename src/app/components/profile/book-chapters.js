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
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useFacultyData, useFacultySection } from '../../../context/FacultyDataContext'

// Add Form Component
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        authors: '',
        chapter_title: '',
        book_title: '',
        pages: '',
        publisher: '',
        isbn: '',
        year: new Date().getFullYear(),
        scopus: '',
        doi: ''
        ,collaboraters: []
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const { updateFacultySection } = useFacultyData()
    const {data:book_chapters_data} = useFacultySection("book_chapters")

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {

            const newBook = {
                ...content,
                    collaboraters: content.collaboraters || [],
                    publish_date: content.publish_date
                        ? new Date(content.publish_date).toISOString().split('T')[0]  // Format as 'YYYY-MM-DD'
                        : null,
                    id: Date.now().toString(),
            }
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'book_chapters',
                    ...newBook,
                    email: session?.user?.email
                }),
            });
            
            if (!result.ok) throw new Error('Failed to create')
            
            handleClose()
            const updatedData = [...book_chapters_data,newBook]
            updateFacultySection("book_chapters",updatedData)
            setContent(initialState)
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
                <DialogTitle>Add Book Chapter</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Chapter Title"
                        name="chapter_title"
                        fullWidth
                        required
                        value={content.chapter_title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Book Title"
                        name="book_title"
                        fullWidth
                        required
                        value={content.book_title}
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
                        label="Pages"
                        name="pages"
                        fullWidth
                        value={content.pages}
                        onChange={handleChange}
                        helperText="e.g., 123-145"
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
                        title="Book Chapter Collaborators"
                        description="Add faculty members' emails who have contributed to this chapter."
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
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)
    const [showModalEdit, setShowModalEdit] = useState(false)
    const {updateFacultySection} = useFacultyData();
    const {data:book_chapter_data} = useFacultySection("book_chapters")
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
                    type: 'book_chapters',
                    ...content,
                    collaboraters: content.collaboraters || [],
                    email: session?.user?.email
                }),
            })

            if (!result.ok) throw new Error('Failed to update')

            const updatedData = book_chapter_data.map((data)=>{
                return data.id === content.id ? content : data
            })
            
            updateFacultySection("book_chapters",updatedData)
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
                <DialogTitle>Edit Book Chapter</DialogTitle>
                <DialogContent>
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
                        label="Chapter Title"
                        name="chapter_title"
                        fullWidth
                        required
                        value={content.chapter_title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Book Title"
                        name="book_title"
                        fullWidth
                        required
                        value={content.book_title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Pages"
                        name="pages"
                        fullWidth
                        required
                        value={content.pages}
                        onChange={handleChange}
                        helperText="e.g., 123-145"
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
                        helperText="Enter the year of publication in the format YYYY"
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
                        title="Book Chapter Collaborators"
                        description="Add faculty members' emails who have contributed to this chapter."
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
export default function BookChapterManagement() {
    const { data: session } = useSession()
    const [chapters, setChapters] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedChapter, setSelectedChapter] = useState(null)
    const { facultyData, loading, updateFacultySection } = useFacultyData()

    // Use context data instead of API call
    React.useEffect(() => {
        if (facultyData?.book_chapters) {
            console.log('BookChapters - Using context data:', facultyData.book_chapters)
            setChapters(facultyData.book_chapters || [])
        }
    }, [facultyData])
    
    // Expose functions for child components
    React.useEffect(() => {
        window.getChaptersComponent = () => ({
            updateFacultyData: (updatedChapters) => {
                setChapters(updatedChapters);
                updateFacultySection('book_chapters', updatedChapters);
            },
            facultyData: { book_chapters: chapters }
        });
        
        return () => {
            delete window.getChaptersComponent;
        };
    }, [chapters, updateFacultySection]);

    const handleEdit = (chapter) => {
        setSelectedChapter(chapter)
        setOpenEdit(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this chapter?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'book_chapters',
                        id,
                        email: session?.user?.email
                    }),
                })
                
                if (!response.ok) throw new Error('Failed to delete')
                
                // Update local state directly
                const updatedChapters = chapters.filter(chapter => chapter.id !== id);
                setChapters(updatedChapters);
                
                // Update context
                updateFacultySection('book_chapters', updatedChapters);
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Book Chapters</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Book Chapter
                </Button>
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Chapter Title</TableCell>
                            <TableCell>Book Title</TableCell>
                            <TableCell>Authors</TableCell>
                            <TableCell>Scopus</TableCell>
                            <TableCell>DOI</TableCell>
                            <TableCell>Publisher</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Collaborators</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chapters?.sort((a,b)=>(b.year - a.year)).map((chapter,index) => (
                            <TableRow key={index}>
                                <TableCell>{chapter.chapter_title}</TableCell>
                                <TableCell>{chapter.book_title}</TableCell>
                                <TableCell>{chapter.authors}</TableCell>
                                <TableCell>{chapter.scopus}</TableCell>
                                <TableCell>{chapter.doi}</TableCell>
                                <TableCell>{chapter.publisher}</TableCell>
                                <TableCell>{chapter.year}</TableCell>
                                <TableCell>
                                    {chapter.collaboraters && chapter.collaboraters.length > 0 ? (
                                        chapter.collaboraters.map((c, idx) => (
                                            <div key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm inline-block mr-1">{c}</div>
                                        ))
                                    ) : ('-')}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(chapter)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(chapter.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {chapters?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No book chapters found
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

            {selectedChapter && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedChapter(null)
                    }}
                    values={selectedChapter}
                />
            )}
        </div>
    )
}