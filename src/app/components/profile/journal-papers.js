'use client'

import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControlLabel,
    Checkbox
} from '@mui/material'

import React, { useState } from 'react'

import { useSession } from 'next-auth/react';
//import { useFacultyData } from '../../../context/FacultyDataContext'
import { useFacultyData } from '../../../context/FacultyDataContext';
import { Typography } from '@mui/material';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import { IconButton } from '@mui/material';
import { enGB } from 'date-fns/locale';

import useRefreshData from '@/custom-hooks/refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format, parseISO } from 'date-fns'
import AddIcon from '@mui/icons-material/Add'
import Papa from 'papaparse'
import { parse, isValid } from 'date-fns'

export const UplaodCSV = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const [bulkJournal, setBulkJournal] = useState([]);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [fileName, setFileName] = useState('');
    const refreshData = useRefreshData()
    const [submitting, setSubmitting] = useState(false)

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Selected File:", file);
            setFileUploaded(true);
            setFileName(file.name);
            Papa.parse(file, {
                complete: (result) => {
                    const parsedData = result.data.filter(row=>row.title && row.title.trim()!=="").map(row => {
                        if (row.publication_date) {
                            console.log("Before Parsing:", row.publication_date);

                            const trimmedDate = row.publication_date.trim();
                            let parsedDate = null;
                            const formatsToTry = ['d/M/yyyy', 'dd/MM/yyyy'];

                            for (const dateFormat of formatsToTry) {
                                const tempDate = parse(trimmedDate, dateFormat, new Date());
                                if (!isNaN(tempDate.getTime())) { 
                                    parsedDate = tempDate;
                                    break;
                                }
                            }

                            if (!parsedDate) {
                                console.error("Invalid Date Found:", trimmedDate);
                                const jsDate = new Date(trimmedDate);
                                if (!isNaN(jsDate.getTime())) {
                                    row.publication_date = jsDate.toISOString().split("T")[0];
                                } else {
                                    row.publication_date = null;
                                    console.error("Failed to parse date:", trimmedDate);
                                }
                            } else {
                                row.publication_date = format(parsedDate, 'yyyy-MM-dd'); 
                                console.log("After Parsing:", row.publication_date);
                            }
                        }
                        return row;
                    });
                    console.log("Processed Data:", parsedData);
                    setBulkJournal(parsedData);
                },
                header: true,
                skipEmptyLines: true
            });
        }
    };

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            for (let i = 0; i < bulkJournal.length; i++) {
                await fetch('/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'journal_papers',
                        ...bulkJournal[i],
                        id: Date.now().toString(),
                        publication_date: bulkJournal[i].publication_date ? new Date(bulkJournal[i].publication_date).toISOString().split("T")[0] : null,
                        email: session?.user?.email
                    }),
                })
            }

            handleClose()
            refreshData()
            // Refresh context data instead of page reload
            // Component will update automatically through context
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }
    const downloadTemplate = () => {
        const headers = [
            "authors", "title", "journal_name", "volume", "publication_year",
            "pages", "journal_quartile", "publication_date", "student_involved",
            "student_details", "doi_url"
        ];
        const rows = [
            ['John Doe', 'AI in Healthcare', 'International Journal of AI', 'Spring 2023 Edition', '2023', '156', 'Q1', '15/06/2023', '1', 'Emily Johnson', 'https://doi.org/10.1'],
            ['Jane Smith', 'Blockchain in Finance', 'Journal of FinTech Innovations', 'Vol A', '2022', '89', 'Q2', '10/09/2022', '0', '', 'https://doi.org/10.5678']
        ];
        const csvContent = [
            headers.join(','), 
            ...rows.map(row => row.map(value => `"${value}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Journal_Papers.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Upload Journal Papers CSV</DialogTitle>
                <DialogContent>
                    <Button
                        variant="contained"
                        component="label"
                        style={{ backgroundColor: fileUploaded ? 'green' : '' }}
                    >
                        {fileUploaded ? `File Uploaded: ${fileName}` : 'Upload CSV'}
                        <input
                            type="file"
                            hidden
                            accept=".csv"
                            onChange={handleCSVUpload}
                        />
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={downloadTemplate}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Download Template
                    </Button>
                    <Typography variant="body2" color="textSecondary" style={{ marginTop: '8px' }}>
                        * In the "Student Involved" field, enter <strong>1</strong> if a student is involved; otherwise, enter <strong>0</strong>.
                    </Typography>
                    {fileUploaded && <Typography variant="body2" color="textSecondary">File "{fileName}" has been uploaded successfully.</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        color="primary"
                        disabled={submitting || bulkJournal.length === 0}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
export const AddForm = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const initialState = {
        authors: '',
        title: '',
        journal_name: '',
        volume: '',
        publication_year: new Date().getFullYear(),
        pages: '',
        journal_quartile: '',
        publication_date: null,
        student_involved: false,
        student_details: '',
        doi_url: ''
    }
    const [content, setContent] = useState(initialState)
    const refreshData = useRefreshData(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setContent({ ...content, [e.target.name]: value })
    }

    const handleSubmit = async (e) => {
        setSubmitting(true)
        e.preventDefault()

        try {
            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'journal_papers',
                    ...content,
                    id: Date.now().toString(),
                    email: session?.user?.email,
                    publication_date: content.publication_date ? new Date(content.publication_date).toISOString().split("T")[0] : null,
                }),
            })

            if (!result.ok) throw new Error('Failed to create')
            
            handleClose()
            refreshData()
            setContent(initialState)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            window.location.reload();
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Journal Paper</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Paper Title"
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
                        label="Journal Name"
                        name="journal_name"
                        fullWidth
                        required
                        value={content.journal_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Volume"
                        name="volume"
                        fullWidth
                        value={content.volume}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Publication Year"
                        name="publication_year"
                        type="number"
                        fullWidth
                        required={true}
                        value={content.publication_year}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Pages"
                        name="pages"
                        fullWidth
                        value={content.pages}
                        onChange={handleChange}
                    />
                    <InputLabel id="quartile">Journal Quartile</InputLabel>
                    <Select
                        labelId="quartile"
                        name="journal_quartile"
                        value={content.journal_quartile}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Q1">Q1</MenuItem>
                        <MenuItem value="Q2">Q2</MenuItem>
                        <MenuItem value="Q3">Q3</MenuItem>
                        <MenuItem value="Q4">Q4</MenuItem>
                    </Select>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        <DatePicker
                            label="Publication Date"
                            value={content.publication_date ? parse(content.publication_date, 'yyyy-MM-dd', new Date()) : null}
                            onChange={(newValue) => {
                                setContent({
                                    ...content,
                                    publication_date: newValue ? format(newValue, 'yyyy-MM-dd') : null
                                })
                            }}
                            slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
                        />
                    </LocalizationProvider>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={content.student_involved}
                                onChange={handleChange}
                                name="student_involved"
                            />
                        }
                        label="Student Involved"
                    />
                    {content.student_involved && (
                        <TextField
                            margin="dense"
                            label="Student Details"
                            name="student_details"
                            fullWidth
                            required
                            value={content.student_details}
                            onChange={handleChange}
                        />
                    )}
                    <TextField
                        margin="dense"
                        label="DOI URL"
                        name="doi_url"
                        fullWidth
                        value={content.doi_url}
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
    const refreshData = useRefreshData(false);
    const [submitting, setSubmitting] = useState(false);

    const [content, setContent] = useState({
        ...values,
        publication_date: values.publication_date
            ? new Date(values.publication_date).toISOString().split('T')[0]
            : '', 
    });

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setContent({ ...content, [e.target.name]: value });
    };

    const handleDateChange = (newValue) => {
        if (newValue) {
            const formattedDate = new Date(newValue).toISOString().split('T')[0];
            setContent({ ...content, publication_date: formattedDate });
        } else {
            setContent({ ...content, publication_date: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'journal_papers',
                    ...content,
                    publication_date: content.publication_date ? new Date(content.publication_date).toISOString().split("T")[0] : null,
                    email: session?.user?.email,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update');
            }

            handleClose();
            refreshData();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
            window.location.reload();
        }
    };

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Journal Paper</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Authors"
                        name="authors"
                        fullWidth
                        required
                        value={content.authors}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Title"
                        name="title"
                        fullWidth
                        required
                        value={content.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Journal Name"
                        name="journal_name"
                        fullWidth
                        required
                        value={content.journal_name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Volume"
                        name="volume"
                        fullWidth
                        value={content.volume}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Publication Year"
                        name="publication_year"
                        type="number"
                        fullWidth
                        required
                        value={content.publication_year}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Pages"
                        name="pages"
                        fullWidth
                        value={content.pages}
                        onChange={handleChange}
                    />
                    <InputLabel id="quartile">Journal Quartile</InputLabel>
                    <Select
                        labelId="quartile"
                        name="journal_quartile"
                        value={content.journal_quartile}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Q1">Q1</MenuItem>
                        <MenuItem value="Q2">Q2</MenuItem>
                        <MenuItem value="Q3">Q3</MenuItem>
                        <MenuItem value="Q4">Q4</MenuItem>
                    </Select>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        <DatePicker
                            label="Publication Date"
                            value={content.publication_date ? parse(content.publication_date, 'yyyy-MM-dd', new Date()) : null}
                            onChange={(newValue) => {
                                setContent({
                                    ...content,
                                    publication_date: newValue ? format(newValue, 'yyyy-MM-dd') : null
                                });
                            }}
                            slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
                        />
                    </LocalizationProvider>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={content.student_involved}
                                onChange={(e) =>
                                    setContent({
                                        ...content,
                                        student_involved: e.target.checked,
                                    })
                                }
                                name="student_involved"
                            />
                        }
                        label="Student Involved"
                    />
                    <TextField
                        margin="dense"
                        label="Student Details"
                        name="student_details"
                        fullWidth
                        value={content.student_details}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="DOI URL"
                        name="doi_url"
                        type="url"
                        fullWidth
                        value={content.doi_url}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit" color="primary" disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

// Main Component
export default function JournalPaperManagement() {
    const { data: session } = useSession()
    const { getJournalPapers, loading, updateFacultySection } = useFacultyData()
    const [papers, setPapers] = useState([])
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedPaper, setSelectedPaper] = useState(null)
    const refreshData = useRefreshData(false)

    // Get data from context
    React.useEffect(() => {
        const journalPapersData = getJournalPapers()
        setPapers(journalPapersData)
    }, [getJournalPapers])

    const handleEdit = (paper) => {
        setSelectedPaper(paper)
        setOpenEdit(true)
    }
    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this paper?')) {
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'journal_papers',
                        id,
                        email: session?.user?.email,
                    }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete');
                }
    
                const updatedPapers = papers.filter((paper) => paper.id !== id)
                setPapers(updatedPapers);
                updateFacultySection('journalPapers', updatedPapers)
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete the paper. Please try again.');
            }
        }
    };
    const [downloadTemplateOpen,setdownloadtemplateOpen] = useState(false);
    

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <Typography variant="h6">Journal Papers</Typography>
                <div className='flex justify-end items-center gap-5'>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setOpenAdd(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Add Journal Papers
                </Button>

                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    // onClick={() => setOpenAdd(true)}
                    onClick={() => setdownloadtemplateOpen(true)}
                    style={{ backgroundColor: '#830001', color: 'white' }}
                >
                    Upload Journal Excel File
                </Button>

                    </div>
                {
                    downloadTemplateOpen &&(
                        <UplaodCSV
                            handleClose={() => setdownloadtemplateOpen(false)}
                            modal={downloadTemplateOpen}

                        />
                    )
                }
                
            </div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Authors</TableCell>
                            <TableCell>Journal</TableCell>
                            <TableCell>Volume</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Publication Date</TableCell>
                            <TableCell>Quartile</TableCell>
                            <TableCell>DOI</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {papers?.map((paper) => (
                            <TableRow key={paper.id}>
                                <TableCell>{paper.title}</TableCell>
                                <TableCell>{paper.authors}</TableCell>
                                <TableCell>{paper.journal_name}</TableCell>
                                <TableCell>{paper.volume}</TableCell>
                                <TableCell>{paper.publication_year}</TableCell>
                                <TableCell>{paper.publication_date? new Date(paper.publication_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }):"-"}</TableCell>
                                <TableCell>{paper.journal_quartile}</TableCell>
                                <TableCell style={{ wordBreak: 'break-word' }}>{paper.doi_url}</TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={() => handleEdit(paper)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDelete(paper.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {papers?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No papers found
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

            {selectedPaper && (
                <EditForm
                    modal={openEdit}
                    handleClose={() => {
                        setOpenEdit(false)
                        setSelectedPaper(null)
                    }}
                    values={selectedPaper}
                />
            )}
        </div>
    )
}