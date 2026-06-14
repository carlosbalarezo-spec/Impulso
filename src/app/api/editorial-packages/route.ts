import { NextResponse } from 'next/server';
import { getEditorialPackages, addEditorialPackage, getCandidateById, updateCandidateStatus } from '@/lib/db';
import { generateEditorialPackage } from '@/lib/editorial/packageGenerator';

export async function GET() {
  try {
    const packages = getEditorialPackages();
    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json({ success: false, error: 'candidateId is required' }, { status: 400 });
    }

    const candidate = getCandidateById(candidateId);
    if (!candidate) {
      return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 });
    }

    // Generate package
    const newPackage = generateEditorialPackage(candidate);
    
    // Save to DB
    addEditorialPackage(newPackage);

    // Update candidate status to script_generated (or preselected if desired, we use script_generated as requested)
    updateCandidateStatus(candidateId, 'script_generated', 'Generación de paquete editorial determinístico realizada.');

    return NextResponse.json({ success: true, package: newPackage });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
