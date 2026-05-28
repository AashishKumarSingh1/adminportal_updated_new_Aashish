'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  MenuItem,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import DeleteIcon from '@mui/icons-material/Delete'
import axios from 'axios'
import { CLUB_CATEGORIES, EMPTY_CAMPUS_PI } from '@/lib/clubConstants'
import Toast from '@/app/components/common/Toast'

function CampusPiSection({ title, value, onChange }) {
  const pi = value || { ...EMPTY_CAMPUS_PI }
  const handle = (field) => (e) => onChange({ ...pi, [field]: e.target.value })

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#830001', mb: 2 }}>
        {title}
      </Typography>
      <TextField
        label="Professor In Charge"
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        value={pi.name}
        onChange={handle('name')}
      />
      <TextField label="Email" fullWidth size="small" sx={{ mb: 2 }} value={pi.email} onChange={handle('email')} />
      <TextField label="Phone" fullWidth size="small" sx={{ mb: 2 }} value={pi.phone} onChange={handle('phone')} />
      <TextField label="Department" fullWidth size="small" value={pi.department} onChange={handle('department')} />
    </Paper>
  )
}

export function ClubAdminDashboard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [form, setForm] = useState({
    club_login_id: '',
    name: '',
    category: '',
    about: '',
    description: '',
    logo: '',
    pictures: [],
    patna_campus_pi: { ...EMPTY_CAMPUS_PI },
    bihta_campus_pi: { ...EMPTY_CAMPUS_PI },
  })
  const [toast, setToast] = useState({ open: false, severity: 'success', message: '' })
  const logoInputRef = useRef(null)
  const picturesInputRef = useRef(null)

  const fetchClub = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/club')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load club')
      setForm({
        club_login_id: data.club_login_id || session?.user?.clubLoginId || '',
        name: data.name || '',
        category: data.category || '',
        about: data.about || '',
        description: data.description || '',
        logo: data.logo || '',
        pictures: Array.isArray(data.pictures) ? data.pictures : [],
        patna_campus_pi: data.patna_campus_pi || { ...EMPTY_CAMPUS_PI },
        bihta_campus_pi: data.bihta_campus_pi || { ...EMPTY_CAMPUS_PI },
      })
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClub()
  }, [])

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileType', 'general')
    const res = await axios.post('/api/upload', formData)
    return res.data.url
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const url = await uploadFile(file)
      setForm((prev) => ({ ...prev, logo: url }))
    } catch {
      setToast({ open: true, severity: 'error', message: 'Logo upload failed' })
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  const handlePictureUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingPicture(true)
    try {
      const urls = await Promise.all(files.map(uploadFile))
      setForm((prev) => ({ ...prev, pictures: [...prev.pictures, ...urls] }))
    } catch {
      setToast({ open: true, severity: 'error', message: 'Picture upload failed' })
    } finally {
      setUploadingPicture(false)
      e.target.value = ''
    }
  }

  const removePicture = (index) => {
    setForm((prev) => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToast({ open: true, severity: 'error', message: 'Club title is required' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/club', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setToast({ open: true, severity: 'success', message: 'Changes saved successfully' })
      if (data.club) {
        setForm({
          club_login_id: data.club.club_login_id || session?.user?.clubLoginId || '',
          name: data.club.name || '',
          category: data.club.category || '',
          about: data.club.about || '',
          description: data.club.description || '',
          logo: data.club.logo || '',
          pictures: data.club.pictures || [],
          patna_campus_pi: data.club.patna_campus_pi || { ...EMPTY_CAMPUS_PI },
          bihta_campus_pi: data.club.bihta_campus_pi || { ...EMPTY_CAMPUS_PI },
        })
      }
    } catch (err) {
      setToast({ open: true, severity: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#830001' }} />
      </Box>
    )
  }

  const logoInitial = form.name?.charAt(0)?.toUpperCase() || 'C'

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Club Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
            Manage the club title, logo, pictures, description and professor in charge details for both campuses.
          </Typography>
          {(form.club_login_id || session?.user?.clubLoginId) && (
            <Alert severity="info" sx={{ mt: 2, maxWidth: 480 }}>
              Your club login ID:{' '}
              <strong style={{ fontFamily: 'monospace' }}>
                {form.club_login_id || session.user.clubLoginId}
              </strong>
              {' '}
              (linked to your Google account for sign-in)
            </Alert>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ backgroundColor: '#830001' }}
        >
          Save Changes
        </Button>
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#830001', mb: 2 }}>
        Club Identity
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Avatar
              src={form.logo || undefined}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#830001', fontSize: '2.5rem' }}
            >
              {!form.logo && logoInitial}
            </Avatar>
            <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
            <Button
              variant="outlined"
              size="small"
              startIcon={uploadingLogo ? <CircularProgress size={16} /> : <PhotoCameraIcon />}
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              sx={{ borderColor: '#830001', color: '#830001' }}
            >
              Add Logo
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={9}>
          <TextField
            label="Club Title"
            required
            fullWidth
            sx={{ mb: 2 }}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            select
            label="Club Category"
            required
            fullWidth
            sx={{ mb: 2 }}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CLUB_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="About Club"
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 2 }}
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
          />
          <TextField
            label="Club Description"
            fullWidth
            multiline
            minRows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#830001' }}>
            Club Pictures
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add gallery images that represent activities, events, and facilities.
          </Typography>
        </Box>
        <input ref={picturesInputRef} type="file" accept="image/*" multiple hidden onChange={handlePictureUpload} />
        <Button
          variant="outlined"
          startIcon={uploadingPicture ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon />}
          onClick={() => picturesInputRef.current?.click()}
          disabled={uploadingPicture}
          sx={{ borderColor: '#830001', color: '#830001' }}
        >
          Add Pictures
        </Button>
      </Box>

      {form.pictures.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          No club pictures added yet. Use &quot;Add Pictures&quot; to upload gallery images.
        </Alert>
      ) : (
        <ImageList cols={4} rowHeight={140} sx={{ mb: 4 }}>
          {form.pictures.map((url, index) => (
            <ImageListItem key={`${url}-${index}`}>
              <img src={url} alt={`Club ${index + 1}`} loading="lazy" style={{ objectFit: 'cover', height: 140 }} />
              <ImageListItemBar
                actionIcon={
                  <IconButton sx={{ color: 'white' }} onClick={() => removePicture(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#830001', mb: 2 }}>
        Professor In Charge Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CampusPiSection
            title="Patna Campus PI"
            value={form.patna_campus_pi}
            onChange={(val) => setForm({ ...form, patna_campus_pi: val })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CampusPiSection
            title="Bihta Campus PI"
            value={form.bihta_campus_pi}
            onChange={(val) => setForm({ ...form, bihta_campus_pi: val })}
          />
        </Grid>
      </Grid>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        handleClose={() => setToast({ ...toast, open: false })}
      />
    </Paper>
  )
}
