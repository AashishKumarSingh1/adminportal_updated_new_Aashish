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
    Chip,
    Avatar,
    Grid,
    Divider
} from '@mui/material';
import { Warning, Delete, Person, Email, Business, Work } from '@mui/icons-material';
import {getDeptFullName} from "@/lib/const";
export const ConfirmDelete = ({ open, onClose, faculty, refreshTable }) => {
    const [loading, setLoading] = useState(false);

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            console.log(`[Staff Delete] Starting deletion process for staff id: ${faculty?.id}`);

            // staff2's DELETE route only accepts ?id=<staff.id> and only
            // removes the staff row (the linked user row is left intact).
            const response = await fetch(`/api/staff2?id=${faculty?.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Failed to delete staff');
            }

            const result = await response.json();
            console.log('[Staff Delete] Database deletion response:', result);

            onClose();
            if (refreshTable) {
                refreshTable();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('[Staff Delete] Error deleting staff:', error);
            alert('Failed to delete staff. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // staff2 returns a flat record (s.* + u.name/email/image/cv/gender/category),
    // not a nested `profile` object.
    if (!faculty) {
        return null;
    }

    const profile = faculty;
    const fullName = [profile.name || ""]
        .filter(Boolean)
        .join(' ');

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                Confirm Delete Staff
            </DialogTitle>
            <DialogContent sx={{
                mt: 2,
                maxHeight: '60vh',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    display: 'none'
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    ⚠️ This action cannot be undone! This staff record will be permanently removed.
                </Alert>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d32f2f' }}>
                        Staff to be deleted:
                    </Typography>

                    <Box sx={{
                        p: 3,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 2,
                        border: '2px solid #ffebee'
                    }}>
                        {/* Staff Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar
                                src={profile.image}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: '#830001',
                                    fontSize: '1.5rem'
                                }}
                            >
                                {fullName ? fullName.charAt(0).toUpperCase() : <Person />}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                                    {fullName || 'Unknown Name'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {profile.designation || 'No designation specified'}
                                </Typography>
                                <Chip
                                    label={profile.employee_code || 'No code'}
                                    color="default"
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Staff Details Grid */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Email fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        Email
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 3 }}>
                                    {profile.email || 'No email provided'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Business fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        Department
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 3 }}>
                                    {getDeptFullName(profile.department) || 'No department specified'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Work fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        Cadre
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 3 }}>
                                    {profile.cadre || 'No cadre specified'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Pay Level
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 3 }}>
                                    {profile.pay_level || 'Not specified'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                <DialogContentText id="alert-dialog-description" sx={{ mt: 2 }}>
                    <strong>Are you absolutely sure?</strong> This will permanently delete this staff record, including:
                </DialogContentText>

                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="Employment Details" color="warning" size="small" />
                    <Chip label="Address Information" color="warning" size="small" />
                    <Chip label="Lab Assignments" color="warning" size="small" />
                </Box>

                
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa', position: 'sticky', bottom: 0, zIndex: 1300 }}>
                <Button
                    onClick={onClose}
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
                        minWidth: 140,
                        '&:hover': {
                            backgroundColor: '#b71c1c'
                        }
                    }}
                >
                    {loading ? 'Deleting...' : 'Delete Staff'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};