import React, { useMemo } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { Delete } from '@mui/icons-material'
import { FormControlLabel, Checkbox } from '@mui/material'

export const AddAttachments = ({ attachments, setAttachments, limit }) => {
    function handleChange(i, event) {
        const values = [...attachments]
        values[i].caption = event.target.value
        setAttachments(values)
    }

    function handleChangeFile(i, event) {
        const values = [...attachments]
        values[i].url = event.target.files[0]
        values[i].value = event.target.value
        values[i].typeLink = false
        setAttachments(values)
    }

    function handleChangeLink(i, event) {
        const values = [...attachments]
        values[i].url = event.target.value
        values[i].value = event.target.value
        setAttachments(values)
    }

    function handleAdd() {
        const values = [...attachments]
        values.push({
            id: Date.now(),
            caption: '',
            url: undefined,
            value: undefined,
            typeLink: false
        })
        setAttachments(values)
    }

    function handleRemove(i) {
        const values = [...attachments]
        values.splice(i, 1)
        setAttachments(values)
    }

    function handleTypeLink(i) {
        const values = [...attachments]
        values[i].typeLink = !values[i].typeLink
        values[i].url = undefined
        values[i].value = undefined
        setAttachments(values)
    }

    const DisplayAttachments = useMemo(() => {
        return attachments.map((field, idx) => {
            return (
                <div key={field.id} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <TextField
                        label={`Image ${idx + 1}`}
                        type="text"
                        value={field.caption || ''}
                        onChange={(e) => handleChange(idx, e)}
                        fullWidth
                        margin="dense"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={field.typeLink || false}
                                onChange={() => handleTypeLink(idx)}
                            />
                        }
                        label="Link"
                    />
                    <TextField
                        type={field.typeLink ? "text" : "file"}
                        onChange={(e) => field.typeLink ? handleChangeLink(idx, e) : handleChangeFile(idx, e)}
                        value={field.value || ''}
                        fullWidth
                        margin="dense"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={field.typeLink ? {} : {
                            accept: 'image/*'
                        }}
                    />
                    <Delete
                        onClick={() => handleRemove(idx)}
                        style={{
                            cursor: 'pointer',
                            color: '#d32f2f',
                            marginTop: '20px'
                        }}
                    />
                </div>
            )
        })
    }, [attachments])

    return (
        <div style={{ marginTop: '8px' }}>
            <Button
                variant="contained"
                color="primary"
                type="button"
                onClick={() => handleAdd()}
                disabled={limit ? (attachments.length < limit ? false : true) : false}
            >
                + Add Images
            </Button>
            {DisplayAttachments}
        </div>
    )
}

export const handleNewImages = async (new_images, onProgress = null) => {
    for (let i = 0; i < new_images.length; i++) {
        delete new_images[i].value;

        if (new_images[i].typeLink === false && new_images[i].url) {
            let file = new FormData();
            file.append('file', new_images[i].url);
            file.append('fileType', 'general');

            try {
                // Use XMLHttpRequest for progress tracking if callback provided
                if (onProgress && typeof onProgress === 'function') {
                    const result = await uploadWithProgress(file, (percent) => onProgress(i, percent));
                    new_images[i].url = result.url;
                    new_images[i].key = result.key;
                } else {
                    let response = await fetch('/api/upload', {
                        method: 'POST',
                        body: file,
                    });

                    if (!response.ok) {
                        throw new Error('Image upload failed');
                    }

                    let data = await response.json();
                    new_images[i].url = data.url; // S3 URL for display
                    new_images[i].key = data.key; // S3 key for deletion
                }
            } catch (error) {
                console.error('Image upload error:', error);
                new_images[i].url = '';
                new_images[i].key = '';
            }
        }
    }

    return new_images;
};

// Helper function for upload with progress
const uploadWithProgress = (formData, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Progress tracking
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
            }
        });
        
        // Success handler
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    reject(new Error('Invalid response format'));
                }
            } else {
                try {
                    const response = JSON.parse(xhr.responseText);
                    reject(new Error(response.message || 'Upload failed'));
                } catch (e) {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred'));
        });
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
    });
};
