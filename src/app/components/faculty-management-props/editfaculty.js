'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { depList } from '@/lib/const'
import { ROLES } from '@/lib/roles'
import Toast from '../common/Toast'

export function EditFaculty({ open, faculty, onClose, onSuccess }) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    severity: 'success',
    message: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    role: '',
    ext_no: '',
    research_interest: '',
    is_retired: '0',
    retirement_date: null,
  })

  useEffect(() => {
    if (faculty?.profile) {  
      setFormData({
        name: faculty.profile.name || '',
        email: faculty.profile.email || '',
        department: faculty.profile.department || '',
        designation: faculty.profile.designation || '',
        role: faculty.profile.role || '',  
        ext_no: faculty.profile.ext_no || '',
        research_interest: faculty.profile.research_interest || '',
        is_retired: faculty.profile.is_retired ? '1' : '0',
        retirement_date: faculty.profile.retirement_date || null,
      })
    }
  }, [faculty])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formattedData = {
        ...formData,
        retirement_date: formData.is_retired === "0" ? null : formData.retirement_date,
      }

      const response = await fetch('/api/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          ...formattedData
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      const result = await response.json()
      
      setToast({
        open: true,
        severity: 'success',
        message: 'Faculty updated successfully'
      })

      if (onSuccess) {
        onSuccess(formattedData)
      }

    } catch (error) {
      console.error('Update error:', error)
      setToast({
        open: true,
        severity: 'error',
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return
    setToast(prev => ({ ...prev, open: false }))
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Edit Faculty</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                >
                  {[...depList].map(([key, value]) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                  <MenuItem value="developer">Developer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={formData.designation || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ext No"
                  value={formData.ext_no || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ext_no: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Research Interest"
                  value={formData.research_interest || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, research_interest: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  required
                  label="Is Retired"
                  value={formData.is_retired}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_retired: e.target.value }))}
                >
                  <MenuItem value="1">Yes</MenuItem>
                  <MenuItem value="0">No</MenuItem>
                </TextField>
              </Grid>
              {formData.is_retired === '1' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Retirement Date"
                    value={formData.retirement_date || '2025-02-27'}
                    onChange={(e) => setFormData(prev => ({ ...prev, retirement_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                >
                  {Object.entries(ROLES).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Toast 
        open={toast.open}
        handleClose={handleCloseToast}
        severity={toast.severity}
        message={toast.message}
      />
    </>
  )
}
