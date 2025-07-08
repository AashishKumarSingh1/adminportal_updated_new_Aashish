'use client'

import React, { useState, useEffect } from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
    Button,
  CircularProgress,
  TextField,
  Box,
    Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { AddFaculty } from './faculty-management-props/addfaculty'
import { EditFaculty } from './faculty-management-props/editfaculty'

const columns = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'email', label: 'Email', minWidth: 200 },
  { id: 'department', label: 'Department', minWidth: 170 },
  { id: 'designation', label: 'Designation', minWidth: 170 },
  { id: 'role', label: 'Role', minWidth: 150 },
  { id: 'actions', label: 'Actions', minWidth: 120 },
]

export function FacultyTable() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [nameSearch, setNameSearch] = useState('')
  const [emailSearch, setEmailSearch] = useState('')

  // Fetch faculty data
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch('/api/faculty?type=all')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setRows(data)
      } catch (error) {
        console.error('Error fetching faculty:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFaculty()
  }, [])

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value)
        setPage(0)
    }

  const handleEdit = async (faculty) => {
    try {
      // Fetch complete faculty data
      const res = await fetch(`/api/faculty?type=${faculty.email}`)
      const fullFacultyData = await res.json()
      
      console.log("Full faculty data:", fullFacultyData) // Debug log
      setSelectedFaculty(fullFacultyData)
      setOpenEdit(true)
    } catch (error) {
      console.error('Error fetching faculty details:', error)
      alert('Failed to load faculty details')
    }
  }

  const handleDelete = async (email) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) return

    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          email: email
        })
      })

      if (!res.ok) throw new Error('Failed to delete')

      setRows(prev => prev.filter(row => row.email !== email))
    } catch (error) {
      console.error('Error deleting faculty:', error)
    }
  }

  // Filter rows based on search
  const filteredRows = rows.filter(row => {
    const nameMatch = row.name?.toLowerCase().includes(nameSearch.toLowerCase())
    const emailMatch = row.email?.toLowerCase().includes(emailSearch.toLowerCase())
    return nameMatch && emailMatch
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Faculty Management
                    </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Search by Name"
            variant="outlined"
            size="small"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
                        <TextField
            label="Search by Email"
                            variant="outlined"
                            size="small"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
                        />
                        <Button
                            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            style={{ backgroundColor: '#830001', color: 'white' }}
                        >
            Add Faculty
                        </Button>
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{ minWidth: column.minWidth, fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover tabIndex={-1} key={row.email}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.designation || 'N/A'}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEdit(row)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(row.email)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                            </TableRow>
              ))}
                    </TableBody>
        </Table>
      </TableContainer>
                            <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredRows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <AddFaculty
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={(newFaculty) => {
          setRows(prev => [...prev, newFaculty])
          setOpenAdd(false)
        }}
      />

      {selectedFaculty && openEdit && (
        <EditFaculty
          open={openEdit}
          faculty={selectedFaculty}
          onClose={() => {
            setOpenEdit(false)
            setSelectedFaculty(null)
          }}
          onSuccess={(updatedFaculty) => {
            setRows(prev => 
              prev.map(row => 
                row.email === updatedFaculty.email ? updatedFaculty : row
              )
            )
            setOpenEdit(false)
            setSelectedFaculty(null)
          }}
        />
      )}
    </Paper>
    )
}
