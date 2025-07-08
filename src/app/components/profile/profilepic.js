import { 
    Button, 
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
    Box,
    Avatar,
    Typography,
    CircularProgress
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useFacultyData } from '../../../context/FacultyDataContext'
import React, { useState, useEffect } from 'react'
import FileUploadWithProgress from '../common/FileUploadWithProgress'
import { extractS3KeyFromUrl, deleteS3File } from '@/lib/utils'

export const AddProfilePic = ({ handleClose, modal }) => {
    const { data: session } = useSession()
    const { getBasicInfo, refreshFacultyData } = useFacultyData()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState('')
    const [currentImageKey, setCurrentImageKey] = useState('')
    const [currentImageUrl, setCurrentImageUrl] = useState('')
    const [uploadedData, setUploadedData] = useState(null)

    // Get current profile image info from context
    useEffect(() => {
        if (modal && session?.user?.email) {
            const basicInfo = getBasicInfo()
            if (basicInfo?.image) {
                setCurrentImageUrl(basicInfo.image)
                const key = extractS3KeyFromUrl(basicInfo.image)
                setCurrentImageKey(key)
                console.log('[profilepic] Extracted image key from URL:', key);
            }
        }
    }, [modal, session?.user?.email, getBasicInfo])

    const handleUploadComplete = (url, key) => {
        setUploadedData({ url, key })
        setPreview(url)
        setError('')
    }

    const handleUploadError = (errorMsg) => {
        setError(errorMsg)
        setUploadedData(null)
        setPreview('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!uploadedData) {
            setError('Please upload an image first')
            return
        }

        setSubmitting(true)
        try {
            const { url: newImageUrl, key: newImageKey } = uploadedData;
            
            // Step 1: First delete old image if one exists and is different
            if (currentImageKey && newImageKey !== currentImageKey) {
                console.log(`[profilepic] Attempting to delete old image with key: ${currentImageKey}`);
                await deleteS3File(currentImageKey);
            }

            // Step 2: Update profile with the new image URL
            const updateResponse = await fetch('/api/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'profile',
                    email: session.user.email,
                    image: newImageUrl,
                }),
            });

            if (!updateResponse.ok) throw new Error('Failed to update profile')

            await refreshFacultyData();
            console.log(`[profilepic] Profile update successful - New URL: ${newImageUrl}`);
            handleClose();
            window.location.reload();

        } catch (error) {
            console.error('[profilepic] Error updating profile:', error);
            setError(error.message || 'Failed to update profile picture');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={modal} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ textAlign: 'center' }}>
                    Update Profile Picture
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    {/* Current Profile Picture */}
                    {currentImageUrl && (
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Current Profile Picture
                            </Typography>
                            <Avatar
                                src={currentImageUrl}
                                sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    mx: 'auto',
                                    border: '3px solid #e0e0e0',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        </Box>
                    )}

                    {/* New Image Upload */}
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Upload New Profile Picture
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Maximum file size: 1MB • Supported formats: JPG, PNG, GIF, WebP
                        </Typography>
                        
                        <FileUploadWithProgress
                            onUploadComplete={handleUploadComplete}
                            onUploadError={handleUploadError}
                            fileType="profile"
                            acceptedTypes="image/*"
                            maxSizeMB={1}
                            disabled={submitting}
                        />
                        
                        {/* Preview of the new image */}
                        {preview && (
                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    New Profile Picture
                                </Typography>
                                <Avatar
                                    src={preview}
                                    sx={{ 
                                        width: 120, 
                                        height: 120, 
                                        mx: 'auto',
                                        border: '3px solid #4caf50',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained" 
                        color="primary"
                        disabled={!uploadedData || submitting}
                        startIcon={submitting && <CircularProgress size={20} color="inherit" />}
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
