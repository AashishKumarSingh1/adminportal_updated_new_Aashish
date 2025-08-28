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
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Typography
  } from '@mui/material'
  import { useSession } from 'next-auth/react'
  import React, { useState } from 'react'
  import useRefreshData from '@/custom-hooks/refresh'
  import EditIcon from '@mui/icons-material/Edit'
  import DeleteIcon from '@mui/icons-material/Delete'
  import AddIcon from '@mui/icons-material/Add'
  import Papa from 'papaparse'
  import { useFacultyData, useFacultySection } from '../../../context/FacultyDataContext'
  
export const UploadCSVConference = ({ handleClose, modal }) => {
    const { data: session } = useSession();
    const { updateFacultySection } = useFacultyData();
    const [bulkConference, setBulkConference] = useState([]);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [fileName, setFileName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileUploaded(true);
            setFileName(file.name);
            Papa.parse(file, {
                complete: (result) => {
                    const parsedData = result.data
                        .filter(row => row.conference_year && row.conference_year.trim() !== '')
                        .map(row => {
                            row.conference_year = parseInt(row.conference_year);
                            return row;
                        });
                    
                    console.log("Parsed Data:", parsedData); // Debugging log
                    setBulkConference(parsedData);
                },
                header: true,
                skipEmptyLines: true
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (bulkConference.length === 0) {
            console.error('No data to submit');
            return;
        }

        setSubmitting(true);

        try {
            let lastResponse;
            for (let i = 0; i < bulkConference.length; i++) {
                const result = await fetch('/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'conference_papers',
                        ...bulkConference[i],
                        id: Date.now().toString(),
                        email: session?.user?.email
                    }),
                });
                
                if (i === bulkConference.length - 1) {
                    // Save the last response to update the context
                    lastResponse = await result.json();
                }
            }

            if (lastResponse) {
                // Update the context data
                updateFacultySection(4, lastResponse.data);
                
                // Update the component's state via the window reference
                if (window.getConferencePapersComponent) {
                    window.getConferencePapersComponent().updateData(lastResponse.data);
                }
            }

            handleClose();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['title','authors' , 'conference_name', 'location', 'conference_year', 'pages', 'indexing', 'foreign_author', 'student_involved', 'doi'];
        const csvContent = headers.join(',') + '\n' +
'AI in Robotics,John Doe,International Conference on AI,New York,2023,156,Scopus,Yes,5,10.1234/abcd\n' +
'Jane Smith,Blockchain Innovations,Global FinTech Conference,London,2022,89,Web of Science,No,,10.5678/efgh';

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Conference_Papers.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Upload Conference Papers CSV</DialogTitle>
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
                        variant="outlined"
                        onClick={downloadTemplate}
                        className="  w-full bg-blue-500 hover:bg-green-700 text-black font-bold py-2 px-4 rounded"
                        // style={{ marginLeft: '10px' }}
                    >
                        Download Template
                    </Button>
                    {fileUploaded && <Typography variant="body2" color="textSecondary">File "{fileName}" has been uploaded successfully.</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={submitting || bulkConference.length === 0}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};




  
  export const AddForm = ({ handleClose, modal }) => {
        const { data: session } = useSession();
        const { updateFacultySection } = useFacultyData();
        const {data:conference_papers_data} = useFacultySection("conference_papers")

        const initialState = {
            authors: "",
            title: "",
            conference_name: "",
            location: "",
            conference_year: new Date().getFullYear(),
            conference_type: "National",
            student_name: "",
            student_roll_no: "",
            foreign_author_name: "",
            foreign_author_country_name: "",
            foreign_author_institute_name: "",
            pages: "",
            indexing: "",
            doi: "",
        };

        const [content, setContent] = useState(initialState);
        const [submitting, setSubmitting] = useState(false);

        const handleChange = (e) => {
            setContent({ ...content, [e.target.name]: e.target.value });
        };

        const handleSubmit = async (e) => {
            setSubmitting(true);
            e.preventDefault();

            try {
            const result = await fetch("/api/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                type: "conference_papers",
                ...content,
                id: Date.now().toString(),
                email: session?.user?.email,
                }),
            });

            if (!result.ok) throw new Error("Failed to create");

            const updatedData = [...conference_papers_data,content]

            updateFacultySection("conference_papers", updatedData);

            handleClose();
            setContent(initialState);
            } catch (error) {
            console.error("Error:", error);
            } finally {
            setSubmitting(false);
            }
        };

        return (
            <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add Conference Paper</DialogTitle>
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
                    label="Conference Name"
                    name="conference_name"
                    fullWidth
                    required
                    value={content.conference_name}
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    label="Location"
                    name="location"
                    fullWidth
                    required
                    value={content.location}
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    label="Conference Year"
                    name="conference_year"
                    type="number"
                    fullWidth
                    required
                    value={content.conference_year}
                    onChange={handleChange}
                />

                <FormControl fullWidth margin="dense">
                    <InputLabel>Conference Type</InputLabel>
                    <Select
                    name="conference_type"
                    value={content.conference_type}
                    onChange={handleChange}
                    label="Conference Type"
                    >
                    <MenuItem value="National">National</MenuItem>
                    <MenuItem value="International">International</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    margin="dense"
                    label="Pages"
                    name="pages"
                    fullWidth
                    value={content.pages}
                    onChange={handleChange}
                />

                <FormControl fullWidth margin="dense">
                    <InputLabel>Indexing</InputLabel>
                    <Select
                    name="indexing"
                    value={content.indexing}
                    onChange={handleChange}
                    label="Indexing"
                    >
                    <MenuItem value="Scopus">Scopus</MenuItem>
                    <MenuItem value="Web of Science">Web of Science</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>

                {/* Student Info */}
                <TextField
                    margin="dense"
                    label="Student Names"
                    name="student_name"
                    fullWidth
                    value={content.student_name}
                    onChange={handleChange}
                    helperText="Comma separated student names"
                />
                <TextField
                    margin="dense"
                    label="Student Roll Numbers"
                    name="student_roll_no"
                    fullWidth
                    value={content.student_roll_no}
                    onChange={handleChange}
                    helperText="Comma separated roll numbers"
                />

                {/* Foreign Author Info */}
                <TextField
                    margin="dense"
                    label="Foreign Author Names"
                    name="foreign_author_name"
                    fullWidth
                    value={content.foreign_author_name}
                    onChange={handleChange}
                    helperText="Comma separated foreign author names"
                />
                <TextField
                    margin="dense"
                    label="Foreign Author Countries"
                    name="foreign_author_country_name"
                    fullWidth
                    value={content.foreign_author_country_name}
                    onChange={handleChange}
                    helperText="Comma separated countries"
                />
                <TextField
                    margin="dense"
                    label="Foreign Author Institutes"
                    name="foreign_author_institute_name"
                    fullWidth
                    value={content.foreign_author_institute_name}
                    onChange={handleChange}
                    helperText="Comma separated institutes"
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
                <Button type="submit" color="primary" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit"}
                </Button>
                </DialogActions>
            </form>
            </Dialog>
        );
        };

  // Edit Form Component
    export const EditForm = ({ handleClose, modal, values , papers }) => {
        const { data: session } = useSession();
        const { updateFacultySection } = useFacultyData();
        const [content, setContent] = useState(values);
        const [submitting, setSubmitting] = useState(false);
        const {data:conference_papers_data} = useFacultySection("conference_papers")

        const handleChange = (e) => {
            setContent({ ...content, [e.target.name]: e.target.value });
        };

        const handleSubmit = async (e) => {
            setSubmitting(true);
            e.preventDefault();

            try {
            const result = await fetch("/api/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                type: "conference_papers",
                ...content,
                email: session?.user?.email,
                }),
            });

            if (!result.ok) throw new Error("Failed to update");

            const updatedData = conference_papers_data.map((data)=>{
                return data.id === content.id ? content : data
            });

            updateFacultySection("conference_papers", updatedData);

            console.log(papers)

            handleClose();
            } catch (error) {
            console.error("Error:", error);
            } finally {
            setSubmitting(false);
            }
        };

        return (
            <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Conference Paper</DialogTitle>
                <DialogContent>
                <TextField
                    margin="dense"
                    label="Paper Title"
                    name="title"
                    fullWidth
                    required
                    value={content?.title}
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    label="Authors"
                    name="authors"
                    fullWidth
                    required
                    value={content?.authors}
                    onChange={handleChange}
                    helperText="Enter names separated by commas"
                />
                <TextField
                    margin="dense"
                    label="Conference Name"
                    name="conference_name"
                    fullWidth
                    required
                    value={content?.conference_name}
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    label="Location"
                    name="location"
                    fullWidth
                    required
                    value={content?.location}
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    label="Conference Year"
                    name="conference_year"
                    type="number"
                    fullWidth
                    required
                    value={content?.conference_year}
                    onChange={handleChange}
                />

                <FormControl fullWidth margin="dense">
                    <InputLabel>Conference Type</InputLabel>
                    <Select
                    name="conference_type"
                    value={content?.conference_type}
                    onChange={handleChange}
                    label="Conference Type"
                    >
                    <MenuItem value="National">National</MenuItem>
                    <MenuItem value="International">International</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    margin="dense"
                    label="Pages"
                    name="pages"
                    fullWidth
                    value={content?.pages}
                    onChange={handleChange}
                />

                <FormControl fullWidth margin="dense">
                    <InputLabel>Indexing</InputLabel>
                    <Select
                    name="indexing"
                    value={content?.indexing}
                    onChange={handleChange}
                    label="Indexing"
                    >
                    <MenuItem value="Scopus">Scopus</MenuItem>
                    <MenuItem value="Web of Science">Web of Science</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>

                {/* Student Info */}
                <TextField
                    margin="dense"
                    label="Student Names"
                    name="student_name"
                    fullWidth
                    value={content?.student_name}
                    onChange={handleChange}
                    helperText="Comma separated student names"
                />
                <TextField
                    margin="dense"
                    label="Student Roll Numbers"
                    name="student_roll_no"
                    fullWidth
                    value={content?.student_roll_no}
                    onChange={handleChange}
                    helperText="Comma separated roll numbers"
                />

                {/* Foreign Author Info */}
                <TextField
                    margin="dense"
                    label="Foreign Author Names"
                    name="foreign_author_name"
                    fullWidth
                    value={content?.foreign_author_name}
                    onChange={handleChange}
                    helperText="Comma separated names"
                />
                <TextField
                    margin="dense"
                    label="Foreign Author Countries"
                    name="foreign_author_country_name"
                    fullWidth
                    value={content?.foreign_author_country_name}
                    onChange={handleChange}
                    helperText="Comma separated countries"
                />
                <TextField
                    margin="dense"
                    label="Foreign Author Institutes"
                    name="foreign_author_institute_name"
                    fullWidth
                    value={content?.foreign_author_institute_name}
                    onChange={handleChange}
                    helperText="Comma separated institutes"
                />

                <TextField
                    margin="dense"
                    label="DOI"
                    name="doi"
                    fullWidth
                    value={content?.doi}
                    onChange={handleChange}
                />
                </DialogContent>
                <DialogActions>
                <Button type="submit" color="primary" disabled={submitting}>
                    {submitting ? "Saving..." : "Save"}
                </Button>
                </DialogActions>
            </form>
            </Dialog>
        );
        };

  // Main Component
  export default function ConferencePaperManagement() {
      const { data: session } = useSession()
      const [papers, setPapers] = useState([])
      const [openAdd, setOpenAdd] = useState(false)
      const [openEdit, setOpenEdit] = useState(false)
      const [selectedPaper, setSelectedPaper] = useState(null)
      const { facultyData, loading, updateFacultySection } = useFacultyData()
      
      // Add window reference to this component
      React.useEffect(() => {
          // Expose the component instance to the window
          window.getConferencePapersComponent = () => ({
              updateData: (newData) => {
                  setPapers(newData);
              }
          });
          
          // Cleanup
          return () => {
              delete window.getConferencePapersComponent;
          };
      }, []);
  
      // Use context data instead of API call
      React.useEffect(() => {
          if (facultyData?.conference_papers) {
              console.log('ConferencePapers - Using context data:', facultyData.conference_papers)
              setPapers(facultyData.conference_papers || [])
          }
      }, [facultyData])
  
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
                          type: 'conference_papers',
                          id,
                          email: session?.user?.email
                      }),
                  })
                  
                  if (!response.ok) throw new Error('Failed to delete')
                  
                  const updatedData = await response.json();
                  
                  // Update the context data
                  updateFacultySection(4, updatedData.data);
                  
                  // Update the local state
                  setPapers(updatedData.data);
              } catch (error) {
                  console.error('Error:', error)
              }
          }
      }
  const [downloadTemplateOpen,setdownloadtemplateOpen] = useState(false);
      if (loading) return <div>Loading...</div>
  
      return (
        <div style={{marginTop: '2rem'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1 rem' }}>
            <Typography variant="h6">Conference Papers</Typography>
            <div className='flex justify-end items-center gap-5'>
            <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setOpenAdd(true)}
                style={{ backgroundColor: '#830001', color: 'white' }}
            >
                Add Conference Paper
            </Button>
    
            <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setdownloadtemplateOpen(true)}
                style={{ backgroundColor: '#830001', color: 'white' }}
            >
                Upload Conference Excel File
            </Button>
        </div>
        </div>
    
        <div>
            {downloadTemplateOpen && (
                <UploadCSVConference
                    handleClose={() => setdownloadtemplateOpen(false)}
                    modal={downloadTemplateOpen}
                />
            )}
        </div>
   
    

<TableContainer component={Paper}>
                  <Table>
                      <TableHead>
                          <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Authors</TableCell>
                            <TableCell>Conference</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Pages</TableCell>
                            <TableCell>Indexing</TableCell>
                            <TableCell>Foreign Author</TableCell>
                            <TableCell>Student Involved</TableCell>
                            <TableCell>DOI</TableCell>
                            <TableCell align="right">Actions</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {papers?.sort((a,b)=>b.conference_year - a.conference_year).map((paper,index) => (
                            <TableRow key={index}>
                            <TableCell>{paper.title}</TableCell>
                            <TableCell>{paper.authors}</TableCell>
                                  {/* <TableCell>{paper.authors}</TableCell> */}
                                  <TableCell>{paper.conference_name}</TableCell>
                                  <TableCell>{paper.location}</TableCell>
                                  {/* <TableCell>{paper.year}</TableCell> */}
                                  <TableCell>{paper.conference_year}</TableCell>
                                  <TableCell>{paper.pages}</TableCell>
                                  <TableCell>{paper.indexing}</TableCell>
                                  <TableCell>{paper.foreign_author}</TableCell>
                                  <TableCell>{paper.student_involved}</TableCell>
                                  <TableCell>{paper.doi}</TableCell>
                                  {/* <TableCell>{paper.conference_year}</TableCell> */}
                                  
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
                                      No conference papers found
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
                      papers = {papers}
                  />
              )}
          </div>
      )
  }
  