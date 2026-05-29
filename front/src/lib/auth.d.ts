declare module '@/lib/auth' {
    import { NextRequest, NextResponse } from 'next/server';

    export function auth(
        handler: (req: NextRequest) => NextResponse | void
    ): (req: NextRequest) => Promise<NextResponse | void>;
}