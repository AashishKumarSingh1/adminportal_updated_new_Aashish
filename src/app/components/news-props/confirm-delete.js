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
    news
}) => {
    const [loading, setLoading] = useState(false);

    const deleteEvent = async () => {
        setLoading(true);
        try {
            console.log(`[News Delete] Starting deletion process for news ID: ${news.id}`);
            
            // Step 1: Extract and delete all attachments from S3
            
            // First, handle the main image(s)
            if (news?.image) {
                try {
                    let imageData = [];
                    
                    // Parse image data if it's stored as a string
                    if (typeof news.image === 'string') {
                        imageData = JSON.parse(news.image);
                    } else {
                        imageData = news.image;
                    }
                    
                    if (Array.isArray(imageData) && imageData.length > 0) {
                        console.log(`[News Delete] Found ${imageData.length} images to delete`);
                        
                        for (const image of imageData) {
                            let keyToDelete = null;
                            
                            // Case 1: Image has explicit key
                            if (image.key) {
                                keyToDelete = image.key;
                                console.log(`[News Delete] Found explicit image key: ${keyToDelete}`);
                            } 
                            // Case 2: Extract key from URL
                            else if (image.url && typeof image.url === 'string' && image.url.includes('.amazonaws.com')) {
                                keyToDelete = extractS3KeyFromUrl(image.url);
                                console.log(`[News Delete] Extracted image key from URL: ${keyToDelete}`);
                            }
                            
                            if (keyToDelete) {
                                console.log(`[News Delete] Deleting image with key: ${keyToDelete}`);
                                await deleteS3File(keyToDelete);
                            }
                        }
                    }
                } catch (error) {
                    console.error('[News Delete] Error deleting images:', error);
                    // Continue with deletion even if image deletion fails
                }
            }
            
            // Next, handle additional attachments
            if (news?.attachments) {
                try {
                    let attachmentsData = [];
                    
                    // Parse attachments if they're stored as a string
                    if (typeof news.attachments === 'string') {
                        attachmentsData = JSON.parse(news.attachments);
                    } else {
                        attachmentsData = news.attachments;
                    }
                    
                    if (Array.isArray(attachmentsData) && attachmentsData.length > 0) {
                        console.log(`[News Delete] Found ${attachmentsData.length} attachments to delete`);
                        
                        for (const attachment of attachmentsData) {
                            let keyToDelete = null;
                            
                            // Case 1: Attachment has explicit key
                            if (attachment.key) {
                                keyToDelete = attachment.key;
                                console.log(`[News Delete] Found explicit attachment key: ${keyToDelete}`);
                            } 
                            // Case 2: Extract key from URL
                            else if (attachment.url && typeof attachment.url === 'string' && attachment.url.includes('.amazonaws.com')) {
                                keyToDelete = extractS3KeyFromUrl(attachment.url);
                                console.log(`[News Delete] Extracted attachment key from URL: ${keyToDelete}`);
                            }
                            
                            if (keyToDelete) {
                                console.log(`[News Delete] Deleting attachment with key: ${keyToDelete}`);
                                await deleteS3File(keyToDelete);
                            }
                        }
                    }
                } catch (error) {
                    console.error('[News Delete] Error deleting attachments:', error);
                    // Continue with deletion even if attachment deletion fails
                }
            }
            
            // Step 2: Delete the news record from the database
            console.log(`[News Delete] Deleting news record from database, ID: ${news.id}`);
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: news.id,
                    type: 'news'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete news');
            }

            console.log('[News Delete] Database deletion successful');
            
            // Force a full page reload to ensure the deleted news is removed from the UI
            window.location.reload();
        } catch (error) {
            console.error('[News Delete] Error deleting news:', error);
            alert('Failed to delete news. Please try again.');
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
                    Are you sure you want to delete this news? This action cannot be undone.
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
