import { NextResponse } from 'next/server';
import { getEditorialPackageById, updateEditorialPackage, getCandidateById, updateCandidateStatus } from '@/lib/db';
import { validatePackageApproval } from '@/lib/editorial/packageGenerator';
import { checkScriptCompliance } from '@/lib/compliance';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = getEditorialPackageById(id);
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, package: pkg });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pkg = getEditorialPackageById(id);

    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    const candidate = getCandidateById(pkg.candidateId);
    if (!candidate) {
      return NextResponse.json({ success: false, error: 'Associated candidate not found' }, { status: 404 });
    }

    // Merge changes
    if (body.editorialBrief) pkg.editorialBrief = body.editorialBrief;
    if (body.scripts) pkg.scripts = body.scripts;
    if (body.overlayPlan) pkg.overlayPlan = body.overlayPlan;
    if (body.approvalChecklist) pkg.approvalChecklist = body.approvalChecklist;

    // Recalculate compliance check on the current text of brief and scripts
    const combinedTexts = [
      candidate.title || "",
      candidate.summary || "",
      pkg.editorialBrief.summary,
      pkg.editorialBrief.context,
      pkg.editorialBrief.whyItMatters,
      pkg.editorialBrief.psychologicalAngle,
      pkg.editorialBrief.managementAngle,
      pkg.editorialBrief.salvadorStance,
      pkg.scripts.s30.hook, pkg.scripts.s30.centralComment, pkg.scripts.s30.example, pkg.scripts.s30.closure,
      pkg.scripts.s60.hook, pkg.scripts.s60.centralComment, pkg.scripts.s60.example, pkg.scripts.s60.closure,
      pkg.scripts.s90.hook, pkg.scripts.s90.centralComment, pkg.scripts.s90.example, pkg.scripts.s90.closure
    ].join(" | ");

    const compReport = checkScriptCompliance(combinedTexts);
    pkg.complianceResult = {
      passed: compReport.isCompliant,
      reasons: compReport.violations.map(v => `Frase prohibida detectada: "${v.phrase}". Motivo: ${v.reason}`)
    };

    pkg.updatedAt = new Date().toISOString();

    // Check approval transition
    if (body.status === 'approved') {
      const valResult = validatePackageApproval(pkg, candidate);
      if (!valResult.approved) {
        // If approval fails, we save other modifications but do not transition status to 'approved'
        updateEditorialPackage(pkg);
        return NextResponse.json({
          success: false,
          error: 'Aprobación bloqueada por compliance o checklist incompleto',
          reasons: valResult.reasons
        }, { status: 400 });
      }
      pkg.status = 'approved';
      // Sync candidate status to approved
      updateCandidateStatus(candidate.id, 'approved', 'Paquete editorial aprobado con éxito.');
    } else if (body.status) {
      pkg.status = body.status;
      // Sync candidate status
      let candStatus = candidate.status;
      if (pkg.status === 'ready_to_record') candStatus = 'ready_to_record';
      else if (pkg.status === 'recorded') candStatus = 'recorded';
      else if (pkg.status === 'edited') candStatus = 'edited';
      else if (pkg.status === 'discarded') candStatus = 'descartado';
      else if (pkg.status === 'published_manual') candStatus = 'published';
      else if (pkg.status === 'needs_review') candStatus = 'preselected';

      if (candStatus !== candidate.status) {
        updateCandidateStatus(candidate.id, candStatus, `Estado del paquete cambiado a ${pkg.status}`);
      }
    }

    // Save package updates
    updateEditorialPackage(pkg);

    return NextResponse.json({ success: true, package: pkg });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
