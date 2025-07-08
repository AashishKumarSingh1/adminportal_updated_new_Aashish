/**
 * DEPRECATED - This file is maintained for backward compatibility.
 * Please use @/lib/utils.js directly in new code.
 */

// Import from utils.js and re-export with the same names used in file-utils.js
import { 
    extractS3KeyFromUrl as extractKeyFromUrl,
    deleteS3File as deleteFileFromS3,
    uploadFileToS3,
    replaceFileInS3
} from '@/lib/utils';

// Re-export the functions with the names used in this file
export {
    extractKeyFromUrl,
    deleteFileFromS3,
    uploadFileToS3,
    replaceFileInS3
}; 