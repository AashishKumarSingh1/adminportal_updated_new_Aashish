import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useSession } from 'next-auth/react';
import { useFacultyData } from '../../../context/FacultyDataContext';

export function AboutYouPage() {
  const { data: session, status } = useSession();
  const { facultyData, loading, updateFacultySection } = useFacultyData();
  const [content, setContent] = useState('');
  const [openEdit, setOpenEdit] = useState(false);

  // Use context data instead of making API call
  useEffect(() => {
    if (facultyData?.about_me && facultyData.about_me.length > 0) {
      setContent(facultyData.about_me[0].content || 'No information provided yet.');
    } else {
      setContent('No information provided yet.');
    }
  }, [facultyData]);

  const handleSave = async (newContent) => {
    localStorage.setItem('aboutYou', newContent);
    if (!session?.user?.email) {
      console.error('User is not authenticated.');
      return;
    }
    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type:"about_me",
          email: session.user.email,
          content: newContent,
        }),
      });    if (response.ok) {
      const data = await response.json();
      console.log('Content saved to DB:', data);
      
      // Update context with new data
      updateFacultySection('about_me', [{ content: newContent }]);
      
      // Update local state directly instead of reloading
      setContent(newContent);
    } else {
      console.error('Failed to save content to DB');
    }
    setOpenEdit(false);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  // Show loading state when context is loading
  if (loading) {
    return <div>Loading about information...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <Typography variant="h6">About You</Typography>
        <Button startIcon={<EditIcon />} variant="contained" onClick={() => setOpenEdit(true)} style={{ backgroundColor: '#830001', color: 'white', marginRight: '20px' }}>
          Edit About You
        </Button>
      </div>
      <Paper
        style={{
          padding: '1rem',
          margin: '1rem',
          boxSizing: 'border-box',
        }}
      >
        <Typography
          variant="body1"
          style={{
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            hyphens: 'auto',
          }}
        >
          {content || 'No information provided yet.'}
        </Typography>
      </Paper>
      {openEdit && (
        <EditAboutDialog open={openEdit} onClose={() => setOpenEdit(false)} initialContent={content} onSave={handleSave} />
      )}
    </div>
  );
}

function EditAboutDialog({ open, onClose, initialContent, onSave }) {
  const [formContent, setFormContent] = useState(initialContent);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formContent);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit About You</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            margin="normal"
            label="Write about yourself (max 1000 words)"
            inputProps={{ maxLength: 10000 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}