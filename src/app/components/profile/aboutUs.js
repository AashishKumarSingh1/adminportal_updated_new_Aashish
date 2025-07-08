import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Paper,useTheme,useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useSession } from 'next-auth/react';

export function AboutYouPage() {
  const { data: session, status } = useSession();
  const [content, setContent] = useState('');
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!session?.user?.email) {
        return;
      }

      try {
        const response = await fetch(`/api/about?email=${session.user.email}`);
        const data = await response.json();

        if (response.ok) {
          setContent(data.content || 'No information provided yet.');
        } else {
          console.error('Failed to fetch content:', data.message);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, [session]);

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
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Content saved to DB:', data);
      } else {
        console.error('Failed to save content to DB');
      }
      setContent(newContent);
      setOpenEdit(false);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <Typography variant="h6">About You</Typography>
        <Button startIcon={<EditIcon />} variant="contained" onClick={() => setOpenEdit(true)} style={{ backgroundColor: '#830001', color: 'white', marginRight: '20px' }}>
          Edit
        </Button>
      </div>
      <Paper
        style={{
          padding: isSmallScreen ? '0.5rem' : '1rem',
          margin: isSmallScreen ? '0.5rem' : '1rem',
          
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