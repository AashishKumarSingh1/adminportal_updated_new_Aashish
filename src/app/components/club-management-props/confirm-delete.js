'use client'

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
} from '@mui/material'
import { Warning, Delete } from '@mui/icons-material'
import { useState } from 'react'
import { getClubPiName } from '@/lib/clubUtils'

export function ConfirmDeleteClub({ open, onClose, club, onDeleted }) {
  const [loading, setLoading] = useState(false)
  if (!club) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/clubs?id=${club.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete club')
      onDeleted()
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const initial = club.name?.charAt(0)?.toUpperCase() || 'C'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#d32f2f', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning />
        Confirm Delete Club
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          This action cannot be undone. The selected club will be removed from the management list.
        </Alert>
        <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '2px solid #ffebee' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: '#830001', fontSize: '1.5rem' }}>{initial}</Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {club.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {club.category}
              </Typography>
              <Chip
                label={club.status}
                size="small"
                color={club.status === 'Active' ? 'success' : 'default'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Club Login ID:</strong> {club.club_login_id || `club-${club.id}`}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2"><strong>Email:</strong> {club.email}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2"><strong>Club PI:</strong> {getClubPiName(club)}</Typography>
            </Grid>
            {club.club_president && (
              <Grid item xs={12}>
                <Typography variant="body2"><strong>President:</strong> {club.club_president}</Typography>
              </Grid>
            )}
            {club.club_secretary && (
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Secretary:</strong> {club.club_secretary}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
        <DialogContentText sx={{ mt: 2 }}>Are you sure you want to delete this club?</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Delete />}
        >
          {loading ? 'Deleting...' : 'Delete Club'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
