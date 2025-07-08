import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { extractS3KeyFromUrl, deleteS3File } from '@/lib/utils';

export const ConfirmDelete = ({ open, handleClose, notice }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            console.log(`[Notice Delete] Starting deletion process for notice ID: ${notice.id}`);
            
            // Step 1: Extract and delete all attachments from S3
            let attachmentsData = [];
            if (notice?.attachments) {
                try {
                    // Parse attachments if they're stored as a string
                    if (typeof notice.attachments === 'string') {
                        attachmentsData = JSON.parse(notice.attachments);
                    } else {
                        attachmentsData = notice.attachments;
                    }
                    
                    console.log(`[Notice Delete] Found ${attachmentsData.length} attachments to delete`);
                    
                    // Delete each attachment from S3
                    if (Array.isArray(attachmentsData) && attachmentsData.length > 0) {
                        for (const attachment of attachmentsData) {
                            let keyToDelete = null;
                            
                            // Case 1: Attachment has explicit key
                            if (attachment.key) {
                                keyToDelete = attachment.key;
                                console.log(`[Notice Delete] Found explicit key: ${keyToDelete}`);
                            } 
                            // Case 2: Extract key from URL
                            else if (attachment.url && typeof attachment.url === 'string' && attachment.url.includes('.amazonaws.com')) {
                                keyToDelete = extractS3KeyFromUrl(attachment.url);
                                console.log(`[Notice Delete] Extracted key from URL: ${keyToDelete}`);
                            }
                            
                            if (keyToDelete) {
                                console.log(`[Notice Delete] Deleting attachment with key: ${keyToDelete}`);
                                await deleteS3File(keyToDelete);
                            }
                        }
                    }
                } catch (error) {
                    console.error('[Notice Delete] Error processing attachments:', error);
                    // Continue with deletion even if attachment processing fails
                }
            }
            
            // Step 2: Delete the notice from the database
            console.log(`[Notice Delete] Deleting notice record from database, ID: ${notice.id}`);
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'notice',
                    id: notice.id
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete notice');
            }

            const data = await response.json();
            console.log('[Notice Delete] Database deletion response:', data);
            
            handleClose();
            // Force a full page reload to ensure the deleted notice is removed from the UI
            window.location.reload();
        } catch (error) {
            console.error('[Notice Delete] Error deleting notice:', error);
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
        >
            <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this notice? This action cannot be undone.
                    All associated files will also be deleted.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleConfirmDelete}
                    color="error"
                    autoFocus
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
