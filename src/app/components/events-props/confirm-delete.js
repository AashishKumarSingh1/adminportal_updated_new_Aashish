import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
    Box,
    Typography,
    Alert,
    Chip
} from '@mui/material';
import { Warning, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { extractS3KeyFromUrl, deleteS3File } from '@/lib/utils';

export const ConfirmDelete = ({ open, handleClose, event }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            console.log(`[Event Delete] Starting deletion process for event ID: ${event.id}`);
            
            // Step 1: Extract and delete all attachments from S3
            
            // Handle main event link (if it's an S3 file)
            if (event?.event_link) {
                try {
                    let eventLinkData = null;
                    
                    // Parse event link if it's stored as a string
                    if (typeof event.event_link === 'string') {
                        eventLinkData = JSON.parse(event.event_link);
                    } else {
                        eventLinkData = event.event_link;
                    }
                    
                    if (eventLinkData?.url && typeof eventLinkData.url === 'string' && eventLinkData.url.includes('.amazonaws.com')) {
                        const keyToDelete = extractS3KeyFromUrl(eventLinkData.url);
                        console.log(`[Event Delete] Found main event link S3 key: ${keyToDelete}`);
                        
                        if (keyToDelete) {
                            console.log(`[Event Delete] Deleting main event link: ${keyToDelete}`);
                            await deleteS3File(keyToDelete);
                        }
                    }
                } catch (error) {
                    console.error('[Event Delete] Error deleting event link:', error);
                    // Continue with deletion even if there's an error
                }
            }
            
            // Handle additional attachments
            if (event?.attachments) {
                try {
                    let attachmentsData = [];
                    
                    // Parse attachments if they're stored as a string
                    if (typeof event.attachments === 'string') {
                        attachmentsData = JSON.parse(event.attachments);
                    } else {
                        attachmentsData = event.attachments;
                    }
                    
                    if (Array.isArray(attachmentsData) && attachmentsData.length > 0) {
                        console.log(`[Event Delete] Found ${attachmentsData.length} attachments to delete`);
                        
                        for (const attachment of attachmentsData) {
                            let keyToDelete = null;
                            
                            // Case 1: Attachment has explicit key
                            if (attachment.key) {
                                keyToDelete = attachment.key;
                                console.log(`[Event Delete] Found explicit attachment key: ${keyToDelete}`);
                            } 
                            // Case 2: Extract key from URL
                            else if (attachment.url && typeof attachment.url === 'string' && attachment.url.includes('.amazonaws.com')) {
                                keyToDelete = extractS3KeyFromUrl(attachment.url);
                                console.log(`[Event Delete] Extracted attachment key from URL: ${keyToDelete}`);
                            }
                            
                            if (keyToDelete) {
                                console.log(`[Event Delete] Deleting attachment with key: ${keyToDelete}`);
                                await deleteS3File(keyToDelete);
                            }
                        }
                    }
                } catch (error) {
                    console.error('[Event Delete] Error deleting attachments:', error);
                    // Continue with deletion even if attachment deletion fails
                }
            }
            
            // Step 2: Delete the event record from the database
            console.log(`[Event Delete] Deleting event record from database, ID: ${event.id}`);
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: event.id,
                    type: 'event'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            const data = await response.json();
            console.log('[Event Delete] Database deletion response:', data);
            
            handleClose();
            // Force a full page reload to ensure the deleted event is removed from the UI
            window.location.reload();
        } catch (error) {
            console.error('[Event Delete] Error deleting event:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle 
                id="alert-dialog-title"
                sx={{ 
                    backgroundColor: '#d32f2f', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1300
                }}
            >
                <Warning />
                Confirm Delete
            </DialogTitle>
            <DialogContent sx={{ 
                mt: 2, 
                maxHeight: '60vh', 
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    display: 'none'
                },
                scrollbarWidth: 'none',  // Firefox
                msOverflowStyle: 'none'  // IE and Edge
            }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    This action cannot be undone!
                </Alert>
                
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                        Event to be deleted:
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            p: 2, 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: 1,
                            fontStyle: 'italic'
                        }}
                    >
                        "{event?.title}"
                    </Typography>
                </Box>

                {event?.attachments && event.attachments.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            The following will also be permanently deleted:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip 
                                label={`${event.attachments.length} attachment(s)`}
                                color="warning"
                                size="small"
                            />
                        </Box>
                    </Box>
                )}

                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this event? All associated files will also be permanently removed.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa', position: 'sticky', bottom: 0, zIndex: 1300 }}>
                <Button 
                    onClick={handleClose}
                    variant="outlined"
                    sx={{ 
                        color: '#666', 
                        borderColor: '#ddd',
                        '&:hover': {
                            backgroundColor: '#f5f5f5'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirmDelete}
                    variant="contained"
                    color="error"
                    autoFocus
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Delete />}
                    sx={{
                        minWidth: 120,
                        '&:hover': {
                            backgroundColor: '#b71c1c'
                        }
                    }}
                >
                    {loading ? 'Deleting...' : 'Delete Event'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
