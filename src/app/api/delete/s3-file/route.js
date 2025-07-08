import { NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function DELETE(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      console.log('Delete attempt - Not authenticated');
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let key = searchParams.get('key');
    
    if (!key) {
      console.log('Delete attempt - No file key provided');
      return NextResponse.json(
        { message: 'File key is required' },
        { status: 400 }
      );
    }

    // Decode the key if it's URI encoded
    try {
      key = decodeURIComponent(key);
      console.log(`Decoded key: ${key}`);
    } catch (e) {
      console.log('Key was not URI encoded or already decoded');
    }
    
    console.log(`Delete started - Raw Key: ${key}, User: ${session.user.email}`);

    // Skip Google Drive URLs
    if (key.includes('drive.google.com')) {
      console.log('Skipping Google Drive file deletion');
      return NextResponse.json({
        success: true,
        message: 'Google Drive file skip - use Google Drive API instead',
        key: key
      });
    }

    // Check if key is actually a full S3 URL and extract the filename if so
    if (key.includes('.amazonaws.com/')) {
      try {
        const urlObj = new URL(key);
        const pathParts = urlObj.pathname.split('/');
        key = pathParts[pathParts.length - 1];
        console.log(`Extracted key from URL: ${key}`);
      } catch (e) {
        console.error('Error extracting key from URL:', e);
      }
    }

    // Log AWS environment variables availability (without exposing values)
    console.log(`AWS Configuration - Region: ${process.env.AWS_REGION ? 'Set' : 'Missing'}`);
    console.log(`AWS Configuration - Access Key: ${process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing'}`);
    console.log(`AWS Configuration - Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing'}`);
    console.log(`AWS Configuration - Bucket: ${process.env.AWS_S3_BUCKET_NAME ? 'Set' : 'Missing'}`);
    
    console.log(`Attempting to delete from S3 bucket: ${process.env.AWS_S3_BUCKET_NAME}, Key: ${key}`);
    
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    try {
      const command = new DeleteObjectCommand(deleteParams);
      const result = await s3Client.send(command);

      console.log(`Delete successful - Key: ${key}, Response:`, result);

      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
        key: key,
        details: result
      });
    } catch (s3Error) {
      console.error(`S3 Delete Error for key ${key}:`, s3Error);
      
      return NextResponse.json(
        { 
          message: `S3 deletion failed: ${s3Error.message}`,
          key: key,
          code: s3Error.code || 'S3_ERROR' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    console.error(`General error for key ${key}:`, error);
    
    return NextResponse.json(
      { message: error.message, key: key },
      { status: 500 }
    );
  }
} 