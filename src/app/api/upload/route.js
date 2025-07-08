import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      console.log('Upload attempt - Not authenticated');
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('fileType') || 'general'; // 'profile', 'general', etc.
    
    if (!file) {
      console.log('Upload attempt - No file provided');
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // File size validation
    const maxSize = fileType === 'profile' ? 1024 * 1024 : 10 * 1024 * 1024; // 1MB for profile, 10MB for others
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      console.log(`Upload attempt - File too large: ${file.size} bytes (max: ${maxSize} bytes)`);
      return NextResponse.json(
        { message: `File size must be less than ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // File type validation for profile images
    if (fileType === 'profile' && !file.type.startsWith('image/')) {
      console.log(`Upload attempt - Invalid file type for profile: ${file.type}`);
      return NextResponse.json(
        { message: 'Profile pictures must be image files' },
        { status: 400 }
      );
    }

    console.log(`Upload started - File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}, User: ${session.user.email}`);

    // Convert file to buffer and generate unique key
    const buffer = await file.arrayBuffer();
    const fileExtension = file.name.split('.').pop();
    const uniqueKey = `${Date.now()}-${randomBytes(8).toString('hex')}${fileExtension ? '.' + fileExtension : ''}`;
    
    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueKey,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Generate public URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

    console.log(`Upload successful - Key: ${uniqueKey}, URL: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      key: uniqueKey
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// Configure size limits
export const config = {
  api: {
    bodyParser: false
  }
};