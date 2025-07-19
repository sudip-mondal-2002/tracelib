import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function POST(req: NextRequest) {
    try {
        const events = await req.json()

        if (!Array.isArray(events)) {
            return NextResponse.json(
                { error: 'Invalid payload format' },
                { status: 400 }
            )
        }
        const operations = events.map(event =>
            prisma.traceEvent.upsert({
                where: { id: event.id },
                create: {
                    id: event.id,
                    requestId: event.request_id,
                    parentId: event.parent_id || null,
                    type: event.type,
                    name: event.name || null,
                    module: event.module || null,
                    function: event.function || null,
                    start: event.start || null,
                    end: event.end || null,
                    duration: event.duration || null,
                    statusCode: event.status_code || null,
                    level: event.level || null,
                    message: event.message || null,
                    args: event.args || null,
                    kwargs: event.kwargs || null,
                    result: event.result || null,
                    error: event.error || null,
                    exceptionType: event.exception_type || null,
                    exception: event.exception || null,
                    timestamp: event.timestamp || null
                },
                update: {}
            })
        )

        const result = await prisma.$transaction(operations)
        return NextResponse.json({
            success: true,
            count: result.length
        })

    } catch (error) {
        console.error('Error saving traces:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}