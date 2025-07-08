import { 
    Button, 
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useFacultyData } from '../../../context/FacultyDataContext'
import React, { useState, useEffect } from 'react'
import { AddPic } from './addpic'
import { extractS3KeyFromUrl, deleteS3File } from '@/lib/utils'

export const AddCv = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const { getBasicInfo, refreshFacultyData } = useFacultyData()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [attachments, setAttachments] = useState([{ url: '', value: '', key: '' }])
    const [currentCvKey, setCurrentCvKey] = useState('')
    const [currentCvUrl, setCurrentCvUrl] = useState('')

    // Get current CV info from context
    useEffect(() => {
        if (modal && session?.user?.email) {
            const basicInfo = getBasicInfo()
            if (basicInfo?.cv) {
                console.log('[useEffect] Found existing CV URL:', basicInfo.cv);
                setCurrentCvUrl(basicInfo.cv)
                const key = extractS3KeyFromUrl(basicInfo.cv)
                setCurrentCvKey(key)
                console.log('[useEffect] Extracted CV key:', key);
            } else {
                console.log('[useEffect] No existing CV found.');
            }
        }
    }, [modal, session, getBasicInfo])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            const newCvUrl = attachments[0]?.url
            const newCvKey = attachments[0]?.key
            
            if (!newCvUrl) {
                throw new Error('Please upload a CV first')
            }

            console.log('--- CV UPDATE PROCESS ---');
            console.log('New CV URL:', newCvUrl);
            console.log('New CV Key:', newCvKey);
            console.log('---------------------------');
            console.log('Old CV URL (from state):', currentCvUrl);
            console.log('Old CV Key (from state):', currentCvKey);
            console.log('---------------------------');

            const shouldDelete = currentCvKey && currentCvKey !== newCvKey;

            console.log('DECISION: Should delete old CV?', shouldDelete);
            if (!shouldDelete) {
                console.log('REASON:');
                console.log(`  - Is 'currentCvKey' present? ${!!currentCvKey}`);
                console.log(`  - Is 'currentCvKey' different from 'newCvKey'? ${currentCvKey !== newCvKey}`);
            }
            console.log('---------------------------');

            if (shouldDelete) {
                console.log(`DELETION TRIGGERED: Attempting to delete old CV with key: ${currentCvKey}`);
                const deleteResponse = await fetch(`/api/delete/s3-file?key=${encodeURIComponent(currentCvKey)}`, {
                    method: 'DELETE',
                });
                
                if (deleteResponse.ok) {
                    console.log('Old CV deletion successful.');
                } else {
                    console.error('Failed to delete old CV. Status:', deleteResponse.status);
                    // Decide if you want to stop the update if deletion fails.
                    // For now, we continue.
                }
            } else {
                console.log('DELETION SKIPPED.');
            }

            const response = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'profile',
                    email: session.user.email,
                    cv: newCvUrl,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            await refreshFacultyData();
            handleClose();
            window.location.reload();

        } catch (error) {
            console.error('CV Update Error:', error);
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add CV</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <AddPic
                        attachments={attachments}
                        setAttachments={setAttachments}
                        attachmentTypes="application/pdf"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant=''>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? 'Updating...' : 'Update'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
