import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button
} from '@mui/material';

const AddPatentModal = ({ open, onClose, onAddPatent }) => {
    const [patentInfo, setPatentInfo] = useState({
        title: '',
        description: '',
        patentDate: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPatentInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddPatent(patentInfo);
    };

    useEffect(() => {
        if (!open) {
            // Reset state when modal closes
            setPatentInfo({
                title: '',
                description: '',
                patentDate: '',
            });
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add Patent</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        name="title"
                        value={patentInfo.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        name="description"
                        value={patentInfo.description}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Patent Date"
                        type="date"
                        fullWidth
                        name="patentDate"
                        value={patentInfo.patentDate}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Cancel
                    </Button>
                    <Button type="submit" color="primary">
                        Add
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddPatentModal;
