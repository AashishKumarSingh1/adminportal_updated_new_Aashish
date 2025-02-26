import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        let results;
        switch (type) {
            case 'all':
                results = await query(
                    `SELECT * FROM ipr WHERE type = "patent"`
                );
                return NextResponse.json(results);

            case 'count':
                const patentCount = await query(
                    `SELECT COUNT(*) AS patentCount FROM ipr WHERE type = "patent"`
                );
                return NextResponse.json(patentCount[0]);

            default:
                return NextResponse.json(
                    { message: 'Invalid type parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json(
            { message: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}
