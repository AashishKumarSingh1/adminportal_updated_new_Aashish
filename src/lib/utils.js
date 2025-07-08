/**
 * Extracts an S3 key from a S3 URL
 * Example URL: https://bucket-name.s3.region.amazonaws.com/1620000000000-filename.pdf
 * 
 * @param {string} url - S3 URL
 * @returns {string} - The S3 key (filename) or empty string if not an S3 URL
 */
export const extractS3KeyFromUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return '';
    }
    
    // Handle S3 URLs
    if (url.includes('.amazonaws.com')) {
        try {
            const parsedUrl = new URL(url);
            // The pathname is '/key'. We remove the leading '/'.
            const key = parsedUrl.pathname.substring(1); 
            // The key is URL-encoded, so we decode it.
            return decodeURIComponent(key);
        } catch (e) {
            console.error("Error extracting key from URL:", e);
            return '';
        }
    }

    return ''; // Return empty if not a recognizable S3 URL
};

/**
 * Deletes a file from S3
 * 
 * @param {string} key - S3 object key to delete
 * @returns {Promise<boolean>} - True if deletion successful, false otherwise
 */
export const deleteS3File = async (key) => {
    if (!key) {
        console.log('[deleteS3File] Delete skipped - No key provided');
        return false;
    }
    
    // Skip Google Drive URLs
    if (typeof key === 'string' && key.includes('drive.google.com')) {
        console.log('[deleteS3File] Skipping Google Drive file deletion, use Google Drive API instead');
        return false;
    }
    
    try {
        console.log(`[deleteS3File] Deleting file from S3 - Original Key: ${key}`);
        
        let fileKey = key;
        // Check if key is a full S3 URL and extract the key if so
        if (fileKey.includes('.amazonaws.com/')) {
            fileKey = extractS3KeyFromUrl(fileKey);
            console.log(`[deleteS3File] Extracted key from URL: ${fileKey}`);
        }
        
        if (!fileKey) {
            console.error('[deleteS3File] Could not determine a valid file key for deletion.');
            return false;
        }

        // Ensure the key is properly encoded for the URL
        const encodedKey = encodeURIComponent(fileKey);
        console.log(`[deleteS3File] Sending delete request with encoded key: ${encodedKey}`);
        
        const deleteUrl = `/api/delete/s3-file?key=${encodedKey}`;
        console.log(`[deleteS3File] Delete URL: ${deleteUrl}`);
        
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`[deleteS3File] Delete API response status: ${response.status}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log(`[deleteS3File] Delete successful - Key: ${fileKey}`, result);
            return true;
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[deleteS3File] Delete failed - Key: ${fileKey}, Error:`, errorData);
            return false;
        }
    } catch (error) {
        console.error('[deleteS3File] Error deleting file from S3:', error);
        return false;
    }
}

/**
 * Uploads a file to S3 and returns the URL and key
 * @param {File} file - The file to upload
 * @param {string} fileType - Type of file ('profile', 'general', etc.)
 * @param {Function} onProgress - Optional callback for upload progress (percent)
 * @returns {Promise<{url: string, key: string}>} The file URL and key
 */
export const uploadFileToS3 = async (file, fileType = 'general', onProgress = null) => {
    if (!file) return { url: '', key: '' };
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);
        
        // If progress callback is provided, use XMLHttpRequest for progress tracking
        if (onProgress && typeof onProgress === 'function') {
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
                            resolve({
                                url: response.url,
                                key: response.key
                            });
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
                
                // Error handler
                xhr.addEventListener('error', () => {
                    reject(new Error('Network error occurred'));
                });
                
                // Start upload
                xhr.open('POST', '/api/upload');
                xhr.send(formData);
            });
        } else {
            // Use fetch for regular upload without progress tracking
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error('File upload failed');
            }
            
            const data = await response.json();
            return {
                url: data.url,
                key: data.key
            };
        }
    } catch (error) {
        console.error('File upload error:', error);
        return { url: '', key: '' };
    }
};

/**
 * Replaces an existing file with a new one, deleting the old file
 * @param {File} newFile - New file to upload
 * @param {string} oldFileKey - Key of the old file to delete (can be empty)
 * @param {string} fileType - Type of file ('profile', 'general', etc.)
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise<{url: string, key: string}>} The new file URL and key
 */
export const replaceFileInS3 = async (newFile, oldFileKey, fileType = 'general', onProgress = null) => {
    console.log(`File replacement started - Old key: ${oldFileKey}, New file: ${newFile?.name}`);
    
    // First upload the new file
    const uploadResult = await uploadFileToS3(newFile, fileType, onProgress);
    
    // If upload successful and we have an old file key, delete the old file
    if (uploadResult.url && oldFileKey && oldFileKey !== uploadResult.key) {
        console.log(`Deleting old file - Key: ${oldFileKey}`);
        const deleteResult = await deleteS3File(oldFileKey);
        console.log(`Delete result for old file:`, deleteResult);
    }
    
    console.log(`File replacement completed - New key: ${uploadResult.key}, New URL: ${uploadResult.url}`);
    return uploadResult;
};

// Kept for backward compatibility
export function convertToThumbnailUrl(id) {
    // If it's an S3 URL, just return it - no need for thumbnail conversion
    if (id && typeof id === 'string' && id.includes('.amazonaws.com')) {
        return id;
    }
    // Legacy Google Drive thumbnail URL
    return `https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${id}`
} 