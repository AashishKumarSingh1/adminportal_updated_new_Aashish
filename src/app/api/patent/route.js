import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { depList } from '@/lib/const';
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
                if(depList.has(type)){
                    results = await query(
                        `SELECT * FROM user u 
                         JOIN ipr i 
                         ON u.email = i.email 
                         WHERE u.department = ? AND i.type = "patent"`,
                        [depList.get(type)]
                    );
                    return NextResponse.json(results);
                }else{
                    return NextResponse.json(
                        { message: 'Invalid type parameter' },
                        { status: 400 }
                    );
                }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json(
            { message: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}
