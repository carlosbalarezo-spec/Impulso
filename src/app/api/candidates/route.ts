import { NextResponse } from 'next/server';
import { getCandidates, updateCandidateStatus, updateCandidate } from '@/lib/db';
import { calculateRanking } from '@/lib/ranking';

export async function GET() {
  try {
    const candidates = getCandidates();
    return NextResponse.json({ success: true, candidates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Candidate ID is required' }, { status: 400 });
    }

    if (action === 'updateStatus') {
      const { status, note } = body;
      if (!status) {
        return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
      }
      const updated = updateCandidateStatus(id, status, note || '');
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, candidate: updated });
    }

    if (action === 'saveCandidate') {
      const { candidate } = body;
      if (!candidate) {
        return NextResponse.json({ success: false, error: 'Candidate object is required' }, { status: 400 });
      }

      // Re-calculate score in case criteria or penalties changed
      candidate.scoreResult = calculateRanking(candidate.criteria, candidate.penalties, candidate.title);
      
      updateCandidate(candidate);
      return NextResponse.json({ success: true, candidate });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
