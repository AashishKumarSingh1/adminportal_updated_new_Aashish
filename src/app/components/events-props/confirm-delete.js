import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress
} from '@mui/material'
import React, { useState } from 'react'
import { extractS3KeyFromUrl, deleteS3File } from '@/lib/utils'

export const ConfirmDelete = ({
    handleClose,
    modal,
    event
}) => {
    const [loading, setLoading] = useState(false);

    const deleteEvent = async () => {
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

            console.log('[Event Delete] Database deletion successful');
            
            // Force a full page reload to ensure the deleted event is removed from the UI
            window.location.reload();
        } catch (error) {
            console.error('[Event Delete] Error deleting event:', error);
            alert('Failed to delete event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={modal} 
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this event? This action cannot be undone.
                    All associated files will also be deleted.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={deleteEvent}
                    color="error"
                    autoFocus
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
