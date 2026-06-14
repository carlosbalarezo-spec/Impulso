'use client';

import { useState, useEffect } from 'react';
import { Candidate, AnalyticsRecord, IngestionLog, EditorialPackage } from '@/lib/db';
import { checkScriptCompliance, checkCandidateCompliance, ComplianceReport } from '@/lib/compliance';

export default function Dashboard() {
  // Navigation / Tabs
  const [activeNav, setActiveNav] = useState<'radar' | 'cola' | 'calendario' | 'analytics' | 'editorial'>('radar');
  
  // Data State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [editorialPackages, setEditorialPackages] = useState<EditorialPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<EditorialPackage | null>(null);
  
  // Ingest State
  const [lastIngestTime, setLastIngestTime] = useState<string>('');
  const [ingestLogs, setIngestLogs] = useState<IngestionLog[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);

  // Filters
  const [langFilter, setLangFilter] = useState<'ALL' | 'ES' | 'EN' | 'DE'>('ALL');
  const [scoreFilter, setScoreFilter] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');
  const [dataTypeFilter, setDataTypeFilter] = useState<'ALL' | 'REAL_SOURCE' | 'MANUAL_URL' | 'MOCK'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [activeDetailTab, setActiveDetailTab] = useState<'ficha' | 'guiones' | 'overlays' | 'cola'>('ficha');
  const [activePackageTab, setActivePackageTab] = useState<'ficha' | 'guiones' | 'overlay' | 'checklist'>('ficha');
  const [selectedCandForPkg, setSelectedCandForPkg] = useState<string>('');
  const [packageScriptLength, setPackageScriptLength] = useState<'s30' | 's60' | 's90'>('s60');
  const [blockingReasons, setBlockingReasons] = useState<string[]>([]);
  const [scriptVersion, setScriptVersion] = useState<'s30' | 's60' | 's90'>('s60');
  const [historyNote, setHistoryNote] = useState('');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showIngestDetails, setShowIngestDetails] = useState(false);

  // Form State for Editorial Card & Scripts
  const [editedCard, setEditedCard] = useState<Candidate | null>(null);

  // Real-time compliance report
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);

  // Form State for Analytics Manual
  const [analyticsForm, setAnalyticsForm] = useState({
    candidateId: '',
    platform: 'tiktok',
    views: '',
    likes: '',
    comments: '',
    shares: '',
    saves: '',
    retentionRate: '',
    publishDate: new Date().toISOString().split('T')[0],
    hookUsed: '',
    duration: ''
  });

  // Form State for Manual Candidate
  const [manualForm, setManualForm] = useState({
    title: '',
    url: '',
    sourceName: '',
    language: 'es',
    note: '',
    tagsString: ''
  });

  // Fetch all initial data
  const fetchData = async () => {
    try {
      const resC = await fetch('/api/candidates');
      const dataC = await resC.json();
      if (dataC.success) {
        setCandidates(dataC.candidates);
        if (dataC.candidates.length > 0 && !selectedCandidate) {
          setSelectedCandidate(dataC.candidates[0]);
          setEditedCard(dataC.candidates[0]);
        }
      }

      const resA = await fetch('/api/analytics');
      const dataA = await resA.json();
      if (dataA.success) {
        setAnalytics(dataA.analytics);
      }

      const resI = await fetch('/api/ingest/status');
      const dataI = await resI.json();
      if (dataI.success) {
        setLastIngestTime(dataI.lastIngestTime);
        setIngestLogs(dataI.history || []);
      }

      const resS = await fetch('/api/sources');
      const dataS = await resS.json();
      if (dataS.success) {
        setSources(dataS.sources || []);
      }

      const resP = await fetch('/api/editorial-packages');
      const dataP = await resP.json();
      if (dataP.success) {
        setEditorialPackages(dataP.packages || []);
        if (dataP.packages && dataP.packages.length > 0 && !selectedPackage) {
          setSelectedPackage(dataP.packages[0]);
        }
      }
    } catch (e) {
      showNotification('error', 'Error al cargar los datos de la base de datos.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Set compliance report when script, title, or summary is viewed or edited
  useEffect(() => {
    if (editedCard) {
      const report = checkCandidateCompliance(editedCard, scriptVersion);
      setComplianceReport(report);
    }
  }, [editedCard, scriptVersion]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setEditedCard(JSON.parse(JSON.stringify(candidate)));
    setIsEditing(false);
  };

  // Trigger Feed Ingestion
  const handleTriggerIngest = async () => {
    setIsIngesting(true);
    showNotification('success', 'Ingesta de feeds RSS iniciada...');
    try {
      const res = await fetch('/api/ingest', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Ingesta completa. Se añadieron ${data.addedCount} noticias nuevas.`);
        // Reload everything
        await fetchData();
      } else {
        showNotification('error', 'Error en la ingesta: ' + data.error);
      }
    } catch (e) {
      showNotification('error', 'Error de red durante la ingesta.');
    } finally {
      setIsIngesting(false);
    }
  };

  // Save changes to the backend
  const handleSaveCandidate = async () => {
    if (!editedCard) return;

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveCandidate',
          id: editedCard.id,
          candidate: editedCard
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Tema guardado exitosamente y score actualizado.');
        setSelectedCandidate(data.candidate);
        setEditedCard(data.candidate);
        setIsEditing(false);
        // Refresh full candidate list to update scores/titles in list
        const resList = await fetch('/api/candidates');
        const dataList = await resList.json();
        if (dataList.success) setCandidates(dataList.candidates);
      } else {
        showNotification('error', 'Error al guardar cambios: ' + data.error);
      }
    } catch (e) {
      showNotification('error', 'Error de red al guardar.');
    }
  };

  // Change candidate state (Approval Queue)
  const handleChangeStatus = async (newStatus: Candidate['status']) => {
    if (!selectedCandidate) return;
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          id: selectedCandidate.id,
          status: newStatus,
          note: historyNote
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Estado actualizado a: ${newStatus}`);
        setHistoryNote('');
        handleSelectCandidate(data.candidate);
        // Update item in local list
        setCandidates(prev => prev.map(c => c.id === data.candidate.id ? data.candidate : c));
      } else {
        showNotification('error', 'Error al actualizar estado: ' + data.error);
      }
    } catch (e) {
      showNotification('error', 'Error de red.');
    }
  };

  const handleGeneratePackage = async (candidateId: string) => {
    if (!candidateId) return;
    showNotification('success', 'Generando paquete editorial...');
    try {
      const res = await fetch('/api/editorial-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Paquete editorial generado exitosamente.');
        setEditorialPackages(prev => [data.package, ...prev]);
        setSelectedPackage(data.package);
        // Reload candidates to reflect status change
        const resC = await fetch('/api/candidates');
        const dataC = await resC.json();
        if (dataC.success) setCandidates(dataC.candidates);
      } else {
        showNotification('error', 'Error al generar paquete: ' + data.error);
      }
    } catch (e) {
      showNotification('error', 'Error de red al generar paquete.');
    }
  };

  const handleUpdatePackage = async (updatedPkg: EditorialPackage) => {
    try {
      const res = await fetch(`/api/editorial-packages/${updatedPkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPkg)
      });
      const data = await res.json();
      if (data.success) {
        setEditorialPackages(prev => prev.map(p => p.id === data.package.id ? data.package : p));
        setSelectedPackage(data.package);
        setBlockingReasons([]);
      } else {
        if (data.reasons) {
          setBlockingReasons(data.reasons);
          showNotification('error', data.error);
        } else {
          showNotification('error', 'Error al actualizar paquete: ' + data.error);
        }
      }
    } catch (e) {
      showNotification('error', 'Error de red al actualizar paquete.');
    }
  };

  const handleUpdatePackageStatus = async (newStatus: string) => {
    if (!selectedPackage) return;
    try {
      const res = await fetch(`/api/editorial-packages/${selectedPackage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selectedPackage, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Paquete actualizado a estado: ${newStatus}`);
        setEditorialPackages(prev => prev.map(p => p.id === data.package.id ? data.package : p));
        setSelectedPackage(data.package);
        setBlockingReasons([]);
        // Reload candidates to reflect status change
        const resC = await fetch('/api/candidates');
        const dataC = await resC.json();
        if (dataC.success) setCandidates(dataC.candidates);
      } else {
        if (data.reasons) {
          setBlockingReasons(data.reasons);
          showNotification('error', data.error);
        } else {
          showNotification('error', data.error || 'Error al actualizar estado');
        }
      }
    } catch (e) {
      showNotification('error', 'Error de red al actualizar estado del paquete.');
    }
  };

  // Submit manual analytics record
  const handleAnalyticsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCandidate = candidates.find(c => c.id === analyticsForm.candidateId);
    if (!targetCandidate) {
      showNotification('error', 'Por favor selecciona un tema del radar.');
      return;
    }

    try {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...analyticsForm,
          title: targetCandidate.title
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Datos de rendimiento registrados.');
        setAnalytics(prev => [data.record, ...prev]);
        setAnalyticsForm({
          candidateId: '',
          platform: 'tiktok',
          views: '',
          likes: '',
          comments: '',
          shares: '',
          saves: '',
          retentionRate: '',
          publishDate: new Date().toISOString().split('T')[0],
          hookUsed: '',
          duration: ''
        });
      } else {
        showNotification('error', 'Error al registrar: ' + data.error);
      }
    } catch (err) {
      showNotification('error', 'Error de red.');
    }
  };

  // Submit Manual Candidate Entry
  const handleManualCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/candidates/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: manualForm.url,
          sourceName: manualForm.sourceName,
          language: manualForm.language,
          title: manualForm.title,
          note: manualForm.note,
          tags: manualForm.tagsString.split(',').map(t => t.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'URL manual agregada al Radar como PENDIENTE DE REVISIÓN.');
        setCandidates(prev => [data.candidate, ...prev]);
        setSelectedCandidate(data.candidate);
        setEditedCard(data.candidate);
        setManualForm({
          title: '',
          url: '',
          sourceName: '',
          language: 'es',
          note: '',
          tagsString: ''
        });
        setShowManualForm(false);
      } else {
        showNotification('error', 'Error al agregar: ' + data.error);
      }
    } catch (err) {
      showNotification('error', 'Error de red.');
    }
  };

  // Filters logic
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLang = langFilter === 'ALL' || c.language === langFilter;
    
    let matchesScore = true;
    if (scoreFilter === 'HIGH') matchesScore = c.scoreResult.score >= 90;
    else if (scoreFilter === 'LOW') matchesScore = c.scoreResult.score < 60;

    let matchesDataType = true;
    if (dataTypeFilter === 'REAL_SOURCE') matchesDataType = c.dataType === 'REAL_SOURCE';
    else if (dataTypeFilter === 'MANUAL_URL') matchesDataType = c.dataType === 'MANUAL_URL';
    else if (dataTypeFilter === 'MOCK') matchesDataType = c.dataType === 'MOCK' || c.dataType === 'MOCK_DERIVED_FROM_PUBLIC_CONTEXT';

    return matchesSearch && matchesLang && matchesScore && matchesDataType;
  });

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const getDataTypeBadgeStyle = (type: Candidate['dataType']) => {
    if (type === 'REAL_SOURCE') return { background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-light)', border: '1px solid var(--primary-light)' };
    if (type === 'MANUAL_URL') return { background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', border: '1px solid var(--warning)' };
    return { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' };
  };
  const getLatestRunLogs = () => {
    if (ingestLogs.length === 0) return [];
    const latestLog = ingestLogs[ingestLogs.length - 1];
    const latestRunId = latestLog.runId;
    return ingestLogs.filter(log => log.runId === latestRunId);
  };
  
  const latestRunLogs = getLatestRunLogs();
  const successfulIngestsCount = latestRunLogs.filter(log => log.status === 'success').length;
  const failedIngestsCount = latestRunLogs.filter(log => log.status === 'error').length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-title">IMPULSO</div>
          <div className="brand-subtitle">Mente y Rendimiento</div>
        </div>
        
        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-list">
            <li>
              <button 
                className={`nav-item ${activeNav === 'radar' ? 'active' : ''}`}
                onClick={() => { setActiveNav('radar'); setShowManualForm(false); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                Radar Diario
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeNav === 'cola' ? 'active' : ''}`}
                onClick={() => { setActiveNav('cola'); setShowManualForm(false); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M2 6h20M2 18h20"/></svg>
                Cola de Aprobación
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeNav === 'calendario' ? 'active' : ''}`}
                onClick={() => { setActiveNav('calendario'); setShowManualForm(false); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Plan / Calendario
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeNav === 'analytics' ? 'active' : ''}`}
                onClick={() => { setActiveNav('analytics'); setShowManualForm(false); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Analytics Manual
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeNav === 'editorial' ? 'active' : ''}`}
                onClick={() => { setActiveNav('editorial'); setShowManualForm(false); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V5A2.5 2.5 0 0 1 6.5 2.5H20M14 6h6m-6 4h6m-6 4h6"/></svg>
                Paquete Editorial
              </button>
            </li>
          </ul>
        </nav>

        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-glow)', paddingTop: '16px' }}>
          Instrucción: IMP-AG-0005
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {alertMsg && (
          <div className="glass-panel" style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 1000, 
            padding: '16px 24px', borderRadius: '10px', 
            borderLeft: `4px solid ${alertMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
            background: 'rgba(10, 11, 22, 0.95)', color: '#fff'
          }}>
            <strong>{alertMsg.type === 'success' ? '✓ Éxito: ' : '✗ Error: '}</strong> {alertMsg.text}
          </div>
        )}

        {/* Database Warning */}
        <div className="glass-panel" style={{ padding: '12px 20px', marginBottom: '24px', borderLeft: '4px solid var(--warning)', background: 'rgba(245, 158, 11, 0.05)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ℹ️ <strong>Persistencia Local (Filesystem JSON):</strong> Corriendo en `data/db.json`. Desacoplado para migración SQLite/Postgres.</span>
          {lastIngestTime && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Última ingesta: {new Date(lastIngestTime).toLocaleString()}</span>}
        </div>

        {/* SECTION 1: RADAR DIARIO */}
        {activeNav === 'radar' && (
          <div>
            <div className="header-actions">
              <h1 className="section-title">Radar Diario</h1>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => setShowManualForm(!showManualForm)}>
                  {showManualForm ? 'Cerrar Registro' : '➕ Registrar URL Manual'}
                </button>
                <button 
                  className="btn" 
                  onClick={handleTriggerIngest} 
                  disabled={isIngesting}
                  style={{ opacity: isIngesting ? 0.7 : 1 }}
                >
                  {isIngesting ? 'Ingestando...' : '🔄 Actualizar Fuentes'}
                </button>
              </div>
            </div>

            {/* MANUAL URL SUBMISSION FORM */}
            {showManualForm && (
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--warning)' }}>
                <h3 style={{ color: '#fff', marginBottom: '12px' }}>Ingresar Referencia Manual de Noticia o Post</h3>
                
                {/* STRICT COMPLIANCE WARNING BANNER */}
                <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '0.8rem', color: '#ff6b6b', marginBottom: '16px', lineHeight: '1.4' }}>
                  <strong>⚠️ DIRECTRIZ ÉTICA Y DE COMPLIANCE:</strong> Queda prohibido descargar videos completos de terceros, remover marcas de agua o evadir restricciones de plataformas. La URL guardada sirve exclusivamente como referencia editorial transformativa.
                </div>

                <form onSubmit={handleManualCandidateSubmit}>
                  <div className="form-group">
                    <label className="form-label">Título de la noticia o post</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ej. Declaraciones de Xabi Alonso tras ganar el campeonato"
                      value={manualForm.title}
                      onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="info-grid" style={{ marginTop: '0' }}>
                    <div className="form-group">
                      <label className="form-label">URL de origen / link público</label>
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder="Ej. https://instagram.com/p/..."
                        value={manualForm.url}
                        onChange={(e) => setManualForm({ ...manualForm, url: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nombre de plataforma / Medio</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Ej. TikTok, Instagram, Marca"
                        value={manualForm.sourceName}
                        onChange={(e) => setManualForm({ ...manualForm, sourceName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="info-grid" style={{ marginTop: '0' }}>
                    <div className="form-group">
                      <label className="form-label">Idioma</label>
                      <select 
                        className="form-select"
                        value={manualForm.language}
                        onChange={(e) => setManualForm({ ...manualForm, language: e.target.value })}
                      >
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                        <option value="de">Alemán</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Etiquetas (Separadas por comas)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Ej. Liderazgo, Fútbol, Frustración"
                        value={manualForm.tagsString}
                        onChange={(e) => setManualForm({ ...manualForm, tagsString: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nota editorial inicial / Contexto</label>
                    <textarea 
                      className="form-textarea" 
                      rows={3} 
                      placeholder="Contexto de opinión o por qué merece la pena comentar..."
                      value={manualForm.note}
                      onChange={(e) => setManualForm({ ...manualForm, note: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button type="submit" className="btn">Agregar Candidato</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowManualForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* PANEL DE SALUD DE FUENTES */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', borderLeft: '4px solid var(--primary)', background: 'rgba(10, 11, 22, 0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📡</span> Salud de Fuentes
                </h2>
                {latestRunLogs.length > 0 && (
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowIngestDetails(!showIngestDetails)}
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  >
                    {showIngestDetails ? 'Ocultar detalles' : 'Ver logs de corrida'}
                  </button>
                )}
              </div>

              <div className="info-grid" style={{ marginTop: 0, gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))' }}>
                <div className="info-box" style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="info-box-title" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Fuentes</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{sources.length}</div>
                </div>
                <div className="info-box" style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="info-box-title" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Habilitadas</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-light)', marginTop: '4px' }}>{sources.filter(s => s.enabled).length}</div>
                </div>
                <div className="info-box" style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="info-box-title" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Exitosas (Último Ingest)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)', marginTop: '4px' }}>{successfulIngestsCount}</div>
                </div>
                <div className="info-box" style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="info-box-title" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Fallidas (Último Ingest)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: failedIngestsCount > 0 ? 'var(--danger)' : 'var(--text-muted)', marginTop: '4px' }}>{failedIngestsCount}</div>
                </div>
              </div>

              {/* Details Section */}
              {showIngestDetails && latestRunLogs.length > 0 && (
                <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glow)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Corrida ID: <code>{latestRunLogs[0]?.runId}</code></span>
                    <span>Último Update: {lastIngestTime ? new Date(lastIngestTime).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {latestRunLogs.map((log: any) => (
                      <div key={log.sourceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: `3px solid ${log.status === 'success' ? 'var(--success)' : 'var(--danger)'}` }}>
                        <div>
                          <strong>{log.sourceId}</strong> <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>({log.url})</span>
                          {log.errorMessage && <div style={{ color: '#ff6b6b', marginTop: '6px', fontSize: '0.75rem' }}>Error: {log.errorMessage}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: log.status === 'success' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            {log.status === 'success' ? 'Éxito' : 'Fallo'}
                          </span>
                          {log.status === 'success' && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Guardados: {log.itemsSaved} | Encontrados: {log.itemsFound} | Duplicados: {log.duplicatesOmitted} ({log.durationMs}ms)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!showIngestDetails && latestRunLogs.some((log: any) => log.status === 'error') && (
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠️</span>
                  <span>Se detectaron fallos en la última ingesta. Haz clic en "Ver logs de corrida" para ver el detalle de errores editoriales.</span>
                </div>
              )}
            </div>

            <div className="dashboard-grid">
              {/* Left Column: Candidates list */}
              <div>
                {/* FILTERS */}
                <div className="radar-filters" style={{ marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Buscar tema, tag o entidad..." 
                    className="form-input"
                    style={{ width: '220px', padding: '8px 12px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button 
                    className={`filter-btn ${langFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setLangFilter('ALL')}
                  >
                    Todos los idiomas
                  </button>
                  <button 
                    className={`filter-btn ${langFilter === 'ES' ? 'active' : ''}`}
                    onClick={() => setLangFilter('ES')}
                  >
                    Español
                  </button>
                  <button 
                    className={`filter-btn ${langFilter === 'EN' ? 'active' : ''}`}
                    onClick={() => setLangFilter('EN')}
                  >
                    Inglés
                  </button>
                  <button 
                    className={`filter-btn ${langFilter === 'DE' ? 'active' : ''}`}
                    onClick={() => setLangFilter('DE')}
                  >
                    Alemán
                  </button>
                </div>

                <div className="radar-filters">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '6px' }}>Procedencia:</span>
                  <button 
                    className={`filter-btn ${dataTypeFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setDataTypeFilter('ALL')}
                  >
                    Todos
                  </button>
                  <button 
                    className={`filter-btn ${dataTypeFilter === 'REAL_SOURCE' ? 'active' : ''}`}
                    onClick={() => setDataTypeFilter('REAL_SOURCE')}
                  >
                    Fuentes Reales
                  </button>
                  <button 
                    className={`filter-btn ${dataTypeFilter === 'MANUAL_URL' ? 'active' : ''}`}
                    onClick={() => setDataTypeFilter('MANUAL_URL')}
                  >
                    Ingreso Manual
                  </button>
                  <button 
                    className={`filter-btn ${dataTypeFilter === 'MOCK' ? 'active' : ''}`}
                    onClick={() => setDataTypeFilter('MOCK')}
                  >
                    Simulación
                  </button>
                  <button 
                    className={`filter-btn ${scoreFilter === 'HIGH' ? 'active' : ''}`}
                    onClick={() => setScoreFilter(scoreFilter === 'HIGH' ? 'ALL' : 'HIGH')}
                    style={{ marginLeft: 'auto' }}
                  >
                    Top Scoring (≥90)
                  </button>
                </div>

                <div className="card-list" style={{ marginTop: '16px' }}>
                  {filteredCandidates.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No se encontraron temas deportivos candidatos en el radar.
                    </div>
                  ) : (
                    filteredCandidates.map(c => (
                      <div 
                        key={c.id} 
                        className={`glass-panel candidate-card ${selectedCandidate?.id === c.id ? 'active-card' : ''}`}
                        onClick={() => handleSelectCandidate(c)}
                        style={{
                          borderLeft: selectedCandidate?.id === c.id ? '4px solid var(--primary)' : '1px solid var(--border-glow)'
                        }}
                      >
                        <div className="candidate-info">
                          <div className="candidate-meta">
                            <span className="badge badge-lang">{c.language}</span>
                            <span className="badge badge-source">{c.source}</span>
                            <span>{c.date}</span>
                            <span className="badge" style={{
                              background: c.status === 'approved' || c.status === 'published' ? 'var(--success-glow)' : 'rgba(255,255,255,0.05)',
                              color: c.status === 'approved' || c.status === 'published' ? 'var(--success)' : 'var(--text-muted)'
                            }}>{c.status}</span>
                            <span className="badge" style={getDataTypeBadgeStyle(c.dataType)}>
                              {c.dataType.replace("_", " ")}
                            </span>
                            {c.verificationStatus === 'needs_review' && (
                              <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>
                                ⚠️ PENDIENTE REVISIÓN
                              </span>
                            )}
                          </div>
                          <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '4px 0' }}>{c.title}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.summary}</p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {c.tags.map(t => (
                              <span key={t} className="badge badge-tag">{t}</span>
                            ))}
                          </div>
                        </div>

                        <div className={`score-badge ${getScoreColorClass(c.scoreResult.score)}`}>
                          {c.scoreResult.score}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Curated Workspace */}
              {selectedCandidate && editedCard && (
                <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '32px' }}>
                  
                  {/* SIMULATION WARNING BANNER */}
                  {selectedCandidate.isMock && (
                    <div className="glass-panel" style={{ 
                      padding: '12px', 
                      background: 'rgba(239, 68, 68, 0.05)', 
                      border: '1px solid rgba(239, 68, 68, 0.2)', 
                      borderRadius: '8px', 
                      marginBottom: '16px', 
                      color: 'var(--danger)', 
                      fontSize: '0.82rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      lineHeight: '1.3'
                    }}>
                      <span>⚠️</span>
                      <span>
                        <strong>DATOS DE SIMULACIÓN ({selectedCandidate.dataType}):</strong> Este tema no es una noticia verificada real. Ha sido precargado para fines de prueba.
                      </span>
                    </div>
                  )}

                  {/* UNVERIFIED WARNING BANNER */}
                  {selectedCandidate.verificationStatus === 'needs_review' && (
                    <div className="glass-panel" style={{ 
                      padding: '12px', 
                      background: 'rgba(245, 158, 11, 0.05)', 
                      border: '1px solid rgba(245, 158, 11, 0.2)', 
                      borderRadius: '8px', 
                      marginBottom: '16px', 
                      color: 'var(--warning)', 
                      fontSize: '0.82rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      lineHeight: '1.3'
                    }}>
                      <span>⚠️</span>
                      <span>
                        <strong>DIRECCIÓN DE VERIFICACIÓN:</strong> Este tema proviene de un ingreso manual de terceros. Debe verificarse el cumplimiento de derechos y exactitud antes de marcar como "Aprobado".
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className={`score-badge ${getScoreColorClass(editedCard.scoreResult.score)}`} style={{ width: '50px', height: '50px', fontSize: '1.1rem' }}>
                      {editedCard.scoreResult.score}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isEditing ? (
                        <>
                          <button className="btn" onClick={handleSaveCandidate}>Guardar</button>
                          <button className="btn btn-secondary" onClick={() => {
                            setIsEditing(false);
                            setEditedCard(JSON.parse(JSON.stringify(selectedCandidate)));
                          }}>Cancelar</button>
                        </>
                      ) : (
                        <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Editar Ficha</button>
                      )}
                    </div>
                  </div>

                  <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>{selectedCandidate.title}</h2>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Recomendación: <strong style={{ textTransform: 'uppercase', color: selectedCandidate.scoreResult.recommendation === 'publicar' ? 'var(--success)' : selectedCandidate.scoreResult.recommendation === 'revisar' ? 'var(--warning)' : 'var(--danger)' }}>
                        {selectedCandidate.scoreResult.recommendation}
                      </strong>
                    </p>
                    <a href={selectedCandidate.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', fontSize: '0.8rem', textDecoration: 'none' }}>
                      🔗 Ver fuente original
                    </a>
                  </div>

                  <div className="tab-container">
                    <button className={`tab-btn ${activeDetailTab === 'ficha' ? 'active' : ''}`} onClick={() => setActiveDetailTab('ficha')}>Ficha Editorial</button>
                    <button className={`tab-btn ${activeDetailTab === 'guiones' ? 'active' : ''}`} onClick={() => setActiveDetailTab('guiones')}>Guion (Script)</button>
                    <button className={`tab-btn ${activeDetailTab === 'overlays' ? 'active' : ''}`} onClick={() => setActiveDetailTab('overlays')}>Plan de Overlay</button>
                    <button className={`tab-btn ${activeDetailTab === 'cola' ? 'active' : ''}`} onClick={() => setActiveDetailTab('cola')}>Historial / Estado</button>
                  </div>

                  {/* TAB A: FICHA EDITORIAL */}
                  {activeDetailTab === 'ficha' && (
                    <div className="detail-view" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
                      <div className="info-box" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <div className="info-box-title">Score Explicado</div>
                        <p style={{ fontSize: '0.9rem' }}>{selectedCandidate.scoreResult.explanation}</p>
                      </div>

                      <div className="info-grid">
                        <div className="info-box">
                          <div className="info-box-title">Por qué importa</div>
                          {isEditing ? (
                            <textarea 
                              className="form-textarea" 
                              rows={3} 
                              value={editedCard.editorialCard.whyItMatters}
                              onChange={(e) => setEditedCard({
                                ...editedCard,
                                editorialCard: { ...editedCard.editorialCard, whyItMatters: e.target.value }
                              })}
                            />
                          ) : (
                            <p style={{ fontSize: '0.85rem' }}>{selectedCandidate.editorialCard.whyItMatters}</p>
                          )}
                        </div>

                        <div className="info-box">
                          <div className="info-box-title">Ángulo Psicológico</div>
                          {isEditing ? (
                            <textarea 
                              className="form-textarea" 
                              rows={3} 
                              value={editedCard.editorialCard.psychologicalAngle}
                              onChange={(e) => setEditedCard({
                                ...editedCard,
                                editorialCard: { ...editedCard.editorialCard, psychologicalAngle: e.target.value }
                              })}
                            />
                          ) : (
                            <p style={{ fontSize: '0.85rem' }}>{selectedCandidate.editorialCard.psychologicalAngle}</p>
                          )}
                        </div>
                      </div>

                      <div className="info-grid">
                        <div className="info-box">
                          <div className="info-box-title">Ángulo de Gestión</div>
                          {isEditing ? (
                            <textarea 
                              className="form-textarea" 
                              rows={3} 
                              value={editedCard.editorialCard.managementAngle}
                              onChange={(e) => setEditedCard({
                                ...editedCard,
                                editorialCard: { ...editedCard.editorialCard, managementAngle: e.target.value }
                              })}
                            />
                          ) : (
                            <p style={{ fontSize: '0.85rem' }}>{selectedCandidate.editorialCard.managementAngle}</p>
                          )}
                        </div>

                        <div className="info-box">
                          <div className="info-box-title">Postura sugerida Salvador</div>
                          {isEditing ? (
                            <textarea 
                              className="form-textarea" 
                              rows={3} 
                              value={editedCard.editorialCard.salvadorStance}
                              onChange={(e) => setEditedCard({
                                ...editedCard,
                                editorialCard: { ...editedCard.editorialCard, salvadorStance: e.target.value }
                              })}
                            />
                          ) : (
                            <p style={{ fontSize: '0.85rem' }}>{selectedCandidate.editorialCard.salvadorStance}</p>
                          )}
                        </div>
                      </div>

                      <div className="info-box" style={{ borderLeft: '4px solid var(--danger)' }}>
                        <div className="info-box-title" style={{ color: 'var(--danger)' }}>⚠️ Compliance & Riesgos de Salud Mental</div>
                        <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}><strong>Nota:</strong> {selectedCandidate.editorialCard.complianceNote}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <strong>Frases prohibidas:</strong> {selectedCandidate.editorialCard.phrasesToAvoid.map(p => `"${p}"`).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB B: SCRIPT GENERATOR */}
                  {activeDetailTab === 'guiones' && (
                    <div className="detail-view">
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <button className={`filter-btn ${scriptVersion === 's30' ? 'active' : ''}`} onClick={() => setScriptVersion('s30')}>30 Segundos</button>
                        <button className={`filter-btn ${scriptVersion === 's60' ? 'active' : ''}`} onClick={() => setScriptVersion('s60')}>60 Segundos</button>
                        <button className={`filter-btn ${scriptVersion === 's90' ? 'active' : ''}`} onClick={() => setScriptVersion('s90')}>90 Segundos</button>
                      </div>

                      {complianceReport && (
                        <div className={`compliance-panel ${complianceReport.isCompliant ? 'compliance-ok' : 'compliance-warn'}`}>
                          <strong>{complianceReport.isCompliant ? '✓ Compliance Verificado' : '⚠️ Bloqueo de Cumplimiento'}</strong>
                          <p style={{ fontSize: '0.8rem' }}>{complianceReport.suggestions[0]}</p>
                          {complianceReport.violations.map((v, i) => (
                            <div key={i} className="violation-item">
                              <div><strong>Texto no permitido:</strong> "{v.phrase}"</div>
                              <div style={{ color: 'var(--success)' }}><strong>Recomendado:</strong> "{v.alternative}"</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{v.reason}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">Edición del Guion</label>
                        {isEditing ? (
                          <textarea 
                            className="form-textarea" 
                            rows={8}
                            value={editedCard.scripts[scriptVersion]}
                            onChange={(e) => {
                              const scriptsCopy = { ...editedCard.scripts };
                              scriptsCopy[scriptVersion] = e.target.value;
                              setEditedCard({ ...editedCard, scripts: scriptsCopy });
                            }}
                          />
                        ) : (
                          <div style={{ 
                            background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glow)', 
                            padding: '16px', borderRadius: '8px', fontSize: '0.9rem', whiteSpace: 'pre-wrap' 
                          }}>
                            {selectedCandidate.scripts[scriptVersion]}
                          </div>
                        )}
                      </div>

                      <div className="info-box">
                        <div className="info-box-title">Captions y Metadatos</div>
                        <p style={{ fontSize: '0.8rem', marginBottom: '6px' }}><strong>TikTok Caption:</strong> {selectedCandidate.scripts.captionTiktok}</p>
                        <p style={{ fontSize: '0.8rem', marginBottom: '6px' }}><strong>Instagram Caption:</strong> {selectedCandidate.scripts.captionInstagram}</p>
                        <p style={{ fontSize: '0.8rem' }}><strong>Hashtags:</strong> {selectedCandidate.scripts.hashtags.map(h => `#${h}`).join(' ')}</p>
                      </div>
                    </div>
                  )}

                  {/* TAB C: PLAN DE OVERLAY (Vertical 9:16 Preview) */}
                  {activeDetailTab === 'overlays' && (
                    <div className="detail-view">
                      <div className="preview-container">
                        <div className="phone-simulator">
                          <div className="phone-screen" style={{ backgroundImage: 'linear-gradient(135deg, #111 0%, #222 100%)' }}>
                            <div className="phone-overlay-top">
                              <div className="phone-overlay-source">{selectedCandidate.overlayPlan.sourceCitation}</div>
                              <div className="phone-overlay-headline">📰 {selectedCandidate.overlayPlan.headline}</div>
                            </div>

                            <div className="phone-presenter-mock">
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '8px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              Salvador
                              <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>({selectedCandidate.overlayPlan.salvadorPosition})</span>
                            </div>

                            <div className="phone-overlay-bottom">
                              <div className="phone-subtitles">💬 {selectedCandidate.overlayPlan.largeText}</div>
                              <div className="phone-caption-mock">
                                <strong>@impulso:</strong> {selectedCandidate.scripts.captionTiktok.slice(0, 70)}...
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="info-box">
                        <div className="info-box-title">Línea de Tiempo del Video (Timeline)</div>
                        <ul style={{ listStyle: 'none', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedCandidate.overlayPlan.timeline.map((step, idx) => (
                            <li key={idx} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
                              <strong style={{ color: 'var(--primary-light)' }}>{step.time}</strong>
                              <span>{step.action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* TAB D: COLA DE APROBACIÓN HISTORIAL */}
                  {activeDetailTab === 'cola' && (
                    <div className="detail-view">
                      <div className="info-box">
                        <div className="info-box-title">Estado Actual</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                          <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary-light)', padding: '6px 12px', fontSize: '0.85rem' }}>
                            {selectedCandidate.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="info-box">
                        <div className="info-box-title">Cambiar Estado</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => handleChangeStatus('preselected')}
                            disabled={!complianceReport?.isCompliant}
                            style={{ opacity: !complianceReport?.isCompliant ? 0.5 : 1 }}
                          >
                            Preseleccionar
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => handleChangeStatus('script_generated')}
                            disabled={!complianceReport?.isCompliant}
                            style={{ opacity: !complianceReport?.isCompliant ? 0.5 : 1 }}
                          >
                            Generar Guion
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => handleChangeStatus('ready_to_record')}
                            disabled={!complianceReport?.isCompliant}
                            style={{ opacity: !complianceReport?.isCompliant ? 0.5 : 1 }}
                          >
                            Listo para Grabar 🎥
                          </button>
                          <button 
                            className="btn" 
                            onClick={() => handleChangeStatus('approved')}
                            disabled={!complianceReport?.isCompliant || selectedCandidate.verificationStatus === 'needs_review'}
                            style={{ opacity: (!complianceReport?.isCompliant || selectedCandidate.verificationStatus === 'needs_review') ? 0.5 : 1 }}
                          >
                            Aprobar ✅
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => handleChangeStatus('descartado')}
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          >
                            Descartar ✗
                          </button>
                        </div>
                        
                        {!complianceReport?.isCompliant && (
                          <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '8px' }}>
                            * Bloqueado por fallos de compliance. Corrige el guion para continuar.
                          </p>
                        )}
                        {selectedCandidate.verificationStatus === 'needs_review' && (
                          <p style={{ color: 'var(--warning)', fontSize: '0.75rem', marginTop: '8px' }}>
                            * Bloqueado para Aprobación final. Debe revisarse de forma externa y cambiar su verificación en base de datos.
                          </p>
                        )}

                        <div className="form-group" style={{ marginTop: '16px' }}>
                          <label className="form-label">Nota de Auditoría (Historial)</label>
                          <input 
                            type="text" 
                            placeholder="Escribe por qué se cambia el estado..." 
                            className="form-input"
                            value={historyNote}
                            onChange={(e) => setHistoryNote(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="info-box">
                        <div className="info-box-title">Historial de Cambios</div>
                        {selectedCandidate.history.length === 0 ? (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin registros históricos aún.</p>
                        ) : (
                          <ul style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none' }}>
                            {selectedCandidate.history.map((h, i) => (
                              <li key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{new Date(h.timestamp).toLocaleString()}</span><br />
                                <strong>{h.fromStatus} ➔ {h.toStatus}</strong>: {h.note || 'Sin nota de cambio.'}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: KANBAN COLA DE APROBACIÓN */}
        {activeNav === 'cola' && (
          <div>
            <div className="header-actions">
              <h1 className="section-title">Cola de Aprobación</h1>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Flujo de producción editorial</div>
            </div>

            <div className="kanban-board">
              {/* Column 1: Preseleccionados */}
              <div className="kanban-column">
                <div className="column-header">
                  <span>Preseleccionados</span>
                  <span className="column-count">{candidates.filter(c => c.status === 'preselected').length}</span>
                </div>
                <div className="kanban-cards">
                  {candidates.filter(c => c.status === 'preselected').map(c => (
                    <div key={c.id} className="kanban-card" onClick={() => { setActiveNav('radar'); handleSelectCandidate(c); }}>
                      <div className="kanban-card-title">{c.title}</div>
                      <div className="kanban-card-meta">
                        <span>Score: {c.scoreResult.score}</span>
                        <span>{c.language}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Listo para Grabar */}
              <div className="kanban-column">
                <div className="column-header">
                  <span>Listo para Grabar 🎥</span>
                  <span className="column-count">{candidates.filter(c => c.status === 'ready_to_record').length}</span>
                </div>
                <div className="kanban-cards">
                  {candidates.filter(c => c.status === 'ready_to_record').map(c => (
                    <div key={c.id} className="kanban-card" onClick={() => { setActiveNav('radar'); handleSelectCandidate(c); }}>
                      <div className="kanban-card-title">{c.title}</div>
                      <div className="kanban-card-meta">
                        <span>Score: {c.scoreResult.score}</span>
                        <span>{c.language}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Aprobados */}
              <div className="kanban-column">
                <div className="column-header">
                  <span>Aprobados ✅</span>
                  <span className="column-count">{candidates.filter(c => c.status === 'approved').length}</span>
                </div>
                <div className="kanban-cards">
                  {candidates.filter(c => c.status === 'approved').map(c => (
                    <div key={c.id} className="kanban-card" onClick={() => { setActiveNav('radar'); handleSelectCandidate(c); }}>
                      <div className="kanban-card-title">{c.title}</div>
                      <div className="kanban-card-meta">
                        <span>Score: {c.scoreResult.score}</span>
                        <span>{c.language}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 4: Publicados */}
              <div className="kanban-column">
                <div className="column-header">
                  <span>Publicados</span>
                  <span className="column-count">{candidates.filter(c => c.status === 'published').length}</span>
                </div>
                <div className="kanban-cards">
                  {candidates.filter(c => c.status === 'published').map(c => (
                    <div key={c.id} className="kanban-card" onClick={() => { setActiveNav('radar'); handleSelectCandidate(c); }}>
                      <div className="kanban-card-title">{c.title}</div>
                      <div className="kanban-card-meta">
                        <span>Score: {c.scoreResult.score}</span>
                        <span>{c.language}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: CALENDARIO EDITORIAL */}
        {activeNav === 'calendario' && (
          <div>
            <div className="header-actions">
              <h1 className="section-title">Calendario Editorial Semanal</h1>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Frecuencia y balance de series</div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', marginBottom: '12px' }}>Series Editoriales Sugeridas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="info-box" style={{ borderLeft: '3px solid var(--primary)' }}>
                  <strong>La cabeza también juega</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Enfoque profundo en psicología de élite y salud mental.</p>
                </div>
                <div className="info-box" style={{ borderLeft: '3px solid var(--success)' }}>
                  <strong>Gestión deportiva en simple</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Economía de los fichajes, infraestructura y gobernanza.</p>
                </div>
                <div className="info-box" style={{ borderLeft: '3px solid var(--warning)' }}>
                  <strong>Presión, talento y decisiones</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>El proceso cognitivo detrás de las decisiones rápidas.</p>
                </div>
                <div className="info-box" style={{ borderLeft: '3px solid #f43f5e' }}>
                  <strong>Padres, entrenadores y atletas</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>El entorno familiar y formativo en el deporte base.</p>
                </div>
              </div>
            </div>

            <div className="calendar-grid">
              <div className="calendar-day">
                <div className="day-header">Lunes</div>
                <div className="day-content">
                  <strong>Video de Psicología</strong>
                  <span className="series-tag">La cabeza también juega</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Tema recomendado: Simone Biles (en-1)</div>
                </div>
              </div>
              <div className="calendar-day">
                <div className="day-header">Martes</div>
                <div className="day-content" style={{ color: 'var(--text-dim)' }}>Día de Curación de Contenidos y Lecturas</div>
              </div>
              <div className="calendar-day">
                <div className="day-header">Miércoles</div>
                <div className="day-content">
                  <strong>Video de Gestión</strong>
                  <span className="series-tag">Gestión deportiva en simple</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Tema recomendado: Real Madrid (en-3)</div>
                </div>
              </div>
              <div className="calendar-day">
                <div className="day-header">Jueves</div>
                <div className="day-content" style={{ color: 'var(--text-dim)' }}>Día de Grabación (iPhone 17)</div>
              </div>
              <div className="calendar-day">
                <div className="day-header">Viernes</div>
                <div className="day-content">
                  <strong>Video de Entorno</strong>
                  <span className="series-tag">Padres, entrenadores y atletas</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Tema recomendado: Goles e infancia (es-2)</div>
                </div>
              </div>
              <div className="calendar-day">
                <div className="day-header">Sábado</div>
                <div className="day-content" style={{ color: 'var(--text-dim)' }}>Preguntas y Respuestas (Q&A de Comunidad)</div>
              </div>
              <div className="calendar-day">
                <div className="day-header">Domingo</div>
                <div className="day-content" style={{ color: 'var(--text-dim)' }}>Planificación Radar de Noticias Semanal</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: ANALYTICS MANUAL */}
        {activeNav === 'analytics' && (
          <div>
            <div className="header-actions">
              <h1 className="section-title">Analytics Manual</h1>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registro de rendimiento y aprendizaje</div>
            </div>

            <div className="dashboard-grid">
              {/* Form to log performance */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ color: '#fff', marginBottom: '16px' }}>Registrar Datos del Video</h3>
                <form onSubmit={handleAnalyticsSubmit}>
                  <div className="form-group">
                    <label className="form-label">Seleccionar Tema Relacionado</label>
                    <select 
                      className="form-select"
                      value={analyticsForm.candidateId}
                      onChange={(e) => setAnalyticsForm({ ...analyticsForm, candidateId: e.target.value })}
                      required
                    >
                      <option value="">-- Elige un tema del radar --</option>
                      {candidates.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="info-grid" style={{ marginTop: '0' }}>
                    <div className="form-group">
                      <label className="form-label">Plataforma</label>
                      <select 
                        className="form-select"
                        value={analyticsForm.platform}
                        onChange={(e) => setAnalyticsForm({ ...analyticsForm, platform: e.target.value as any })}
                      >
                        <option value="tiktok">TikTok 9:16</option>
                        <option value="instagram">Instagram Reels 9:16</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fecha de Publicación</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={analyticsForm.publishDate}
                        onChange={(e) => setAnalyticsForm({ ...analyticsForm, publishDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="info-grid" style={{ marginTop: '0' }}>
                    <div className="form-group">
                      <label className="form-label">Vistas (Views)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="Ej. 12000"
                        value={analyticsForm.views}
                        onChange={(e) => setAnalyticsForm({ ...analyticsForm, views: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Likes</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="Ej. 1500"
                        value={analyticsForm.likes}
                        onChange={(e) => setAnalyticsForm({ ...analyticsForm, likes: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="info-grid" style={{ marginTop: '0' }}>
                    <div className="form-group">
                      <label className="form-label">Comentarios</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={analyticsForm.comments}
                        onChange={(e) => setAnalyticsForm({ ...analyticsForm, comments: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Saves (Guardados)</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={analyticsForm.saves}
                        onChange={(e) => setAnalyticsForm({ ...analyticsForm, saves: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="info-grid" style={{ marginTop: '0' }}>
                    <div className="form-group">
                      <label className="form-label">Retención Media (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="form-input" 
                        placeholder="Ej. 52.4"
                        value={analyticsForm.retentionRate}
                        onChange={(e) => setAnalyticsForm({ ...analyticsForm, retentionRate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Duración (segundos)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="Ej. 60"
                        value={analyticsForm.duration}
                        onChange={(e) => setAnalyticsForm({ ...analyticsForm, duration: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hook (Gancho) Utilizado</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ej. ¿Qué pasa cuando tu cerebro se apaga?"
                      value={analyticsForm.hookUsed}
                      onChange={(e) => setAnalyticsForm({ ...analyticsForm, hookUsed: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px' }}>Registrar Datos</button>
                </form>
              </div>

              {/* Aggregated view / Table logs */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ color: '#fff', marginBottom: '12px' }}>Historial de Publicaciones</h3>
                
                <div className="data-table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tema</th>
                        <th>Plat.</th>
                        <th>Views</th>
                        <th>Likes</th>
                        <th>Retención</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin publicaciones registradas.</td>
                        </tr>
                      ) : (
                        analytics.map(a => (
                          <tr key={a.id}>
                            <td style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</td>
                            <td><span className="badge" style={{ background: a.platform === 'tiktok' ? '#ff0050' : '#c13584', color: '#fff' }}>{a.platform}</span></td>
                            <td>{Number(a.views).toLocaleString()}</td>
                            <td>{Number(a.likes).toLocaleString()}</td>
                            <td>{a.retentionRate}%</td>
                            <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.publishDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="info-box" style={{ marginTop: '24px', background: 'var(--primary-glow)' }}>
                  <strong>💡 Aprendizaje Editorial</strong>
                  <p style={{ fontSize: '0.8rem', marginTop: '6px', color: '#fff' }}>
                    Los videos enfocados en la serie <strong>"La cabeza también juega"</strong> con duraciones inferiores a <strong>60 segundos</strong> y ganchos que exponen paradojas biológicas muestran una retención media de hasta un <strong>61.2%</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: PAQUETE EDITORIAL */}
        {activeNav === 'editorial' && (
          <div>
            <div className="header-actions">
              <h1 className="section-title">Paquete Editorial</h1>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Noticia → Guiones → Overlay → Aprobación Responsable</div>
            </div>

            <div className="dashboard-grid">
              {/* Left Column: Generator & Package List */}
              <div>
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '12px' }}>Generar Nuevo Paquete</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      className="form-select"
                      value={selectedCandForPkg}
                      onChange={(e) => setSelectedCandForPkg(e.target.value)}
                      style={{ flexGrow: 1 }}
                    >
                      <option value="">-- Seleccionar Tema del Radar --</option>
                      {candidates.filter(c => !editorialPackages.some(p => p.candidateId === c.id)).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title.length > 50 ? c.title.slice(0, 50) + '...' : c.title} (Score: {c.scoreResult.score})
                        </option>
                      ))}
                    </select>
                    <button 
                      className="btn"
                      onClick={() => {
                        if (selectedCandForPkg) {
                          handleGeneratePackage(selectedCandForPkg);
                          setSelectedCandForPkg('');
                        } else {
                          showNotification('error', 'Elige un tema del radar para generar el paquete.');
                        }
                      }}
                    >
                      Generar 📦
                    </button>
                  </div>
                </div>

                <div className="card-list">
                  {editorialPackages.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay paquetes editoriales generados aún. Selecciona un candidato y pulsa "Generar".
                    </div>
                  ) : (
                    editorialPackages.map(pkg => {
                      const cand = candidates.find(c => c.id === pkg.candidateId);
                      return (
                        <div 
                          key={pkg.id} 
                          className={`glass-panel candidate-card ${selectedPackage?.id === pkg.id ? 'active-card' : ''}`}
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setBlockingReasons([]);
                          }}
                          style={{
                            borderLeft: selectedPackage?.id === pkg.id ? '4px solid var(--primary)' : '1px solid var(--border-glow)'
                          }}
                        >
                          <div className="candidate-info">
                            <div className="candidate-meta">
                              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                                {pkg.id}
                              </span>
                              <span className="badge" style={{
                                background: pkg.status === 'approved' ? 'var(--success-glow)' : 'rgba(255,255,255,0.05)',
                                color: pkg.status === 'approved' ? 'var(--success)' : 'var(--text-muted)'
                              }}>{pkg.status.toUpperCase()}</span>
                              {pkg.complianceResult.passed ? (
                                <span className="badge" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>✓ Compliance OK</span>
                              ) : (
                                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>⚠️ COMPLIANCE RISK</span>
                              )}
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.05rem', margin: '4px 0' }}>
                              {cand ? cand.title : 'Tema Desconocido'}
                            </h3>
                            {cand && (
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Fuente: {cand.source} | Idioma: {cand.language}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Work Space */}
              <div>
                {selectedPackage ? (() => {
                  const cand = candidates.find(c => c.id === selectedPackage.candidateId);
                  if (!cand) return <div className="glass-panel" style={{ padding: '24px' }}>Candidato no encontrado en base de datos.</div>;

                  return (
                    <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '32px' }}>
                      {/* Warnings & Blockings */}
                      {cand.isMock && (
                        <div className="glass-panel" style={{ 
                          padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', 
                          borderRadius: '8px', marginBottom: '16px', color: 'var(--danger)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                          <span>⚠️</span>
                          <span><strong>MODO SIMULACIÓN:</strong> Este paquete fue generado desde un candidato simulado ({cand.dataType}).</span>
                        </div>
                      )}

                      {/* Compliance Warning */}
                      {!selectedPackage.complianceResult.passed && (
                        <div className="glass-panel" style={{ 
                          padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', 
                          borderRadius: '8px', marginBottom: '16px', color: 'var(--danger)', fontSize: '0.82rem'
                        }}>
                          <strong>⚠️ ALERTA DE COMPLIANCE (Frases prohibidas detectadas):</strong>
                          <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.8rem' }}>
                            {selectedPackage.complianceResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Blocking Reasons */}
                      {blockingReasons.length > 0 && (
                        <div className="glass-panel" style={{ 
                          padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', 
                          borderRadius: '8px', marginBottom: '16px', color: '#ff6b6b'
                        }}>
                          <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>❌ APROBACIÓN RECHAZADA Y BLOQUEADA:</strong>
                          <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {blockingReasons.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}

                      <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '4px' }}>{cand.title}</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        ID Paquete: <code>{selectedPackage.id}</code> | Recomendación original: <strong style={{ color: cand.scoreResult.recommendation === 'publicar' ? 'var(--success)' : 'var(--warning)' }}>{cand.scoreResult.recommendation.toUpperCase()}</strong>
                      </p>

                      <div className="tab-container">
                        <button className={`tab-btn ${activePackageTab === 'ficha' ? 'active' : ''}`} onClick={() => setActivePackageTab('ficha')}>Ficha Editorial</button>
                        <button className={`tab-btn ${activePackageTab === 'guiones' ? 'active' : ''}`} onClick={() => setActivePackageTab('guiones')}>Guion (30/60/90)</button>
                        <button className={`tab-btn ${activePackageTab === 'overlay' ? 'active' : ''}`} onClick={() => setActivePackageTab('overlay')}>Plan de Overlay</button>
                        <button className={`tab-btn ${activePackageTab === 'checklist' ? 'active' : ''}`} onClick={() => setActivePackageTab('checklist')}>Checklist & Aprobación</button>
                      </div>

                      {/* TAB 1: FICHA EDITORIAL EDITABLE */}
                      {activePackageTab === 'ficha' && (
                        <div className="detail-view" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
                          <div className="form-group">
                            <label className="form-label">Resumen Breve</label>
                            <textarea 
                              className="form-textarea" 
                              rows={2}
                              value={selectedPackage.editorialBrief.summary}
                              onChange={(e) => {
                                const brief = { ...selectedPackage.editorialBrief, summary: e.target.value };
                                handleUpdatePackage({ ...selectedPackage, editorialBrief: brief });
                              }}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Contexto del Caso</label>
                            <textarea 
                              className="form-textarea" 
                              rows={2}
                              value={selectedPackage.editorialBrief.context}
                              onChange={(e) => {
                                const brief = { ...selectedPackage.editorialBrief, context: e.target.value };
                                handleUpdatePackage({ ...selectedPackage, editorialBrief: brief });
                              }}
                            />
                          </div>
                          <div className="info-grid">
                            <div className="form-group">
                              <label className="form-label">Por qué Importa</label>
                              <textarea 
                                className="form-textarea" 
                                rows={2}
                                value={selectedPackage.editorialBrief.whyItMatters}
                                onChange={(e) => {
                                  const brief = { ...selectedPackage.editorialBrief, whyItMatters: e.target.value };
                                  handleUpdatePackage({ ...selectedPackage, editorialBrief: brief });
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Ángulo Psicológico</label>
                              <textarea 
                                className="form-textarea" 
                                rows={2}
                                value={selectedPackage.editorialBrief.psychologicalAngle}
                                onChange={(e) => {
                                  const brief = { ...selectedPackage.editorialBrief, psychologicalAngle: e.target.value };
                                  handleUpdatePackage({ ...selectedPackage, editorialBrief: brief });
                                }}
                              />
                            </div>
                          </div>
                          <div className="info-grid">
                            <div className="form-group">
                              <label className="form-label">Ángulo de Gestión</label>
                              <textarea 
                                className="form-textarea" 
                                rows={2}
                                value={selectedPackage.editorialBrief.managementAngle}
                                onChange={(e) => {
                                  const brief = { ...selectedPackage.editorialBrief, managementAngle: e.target.value };
                                  handleUpdatePackage({ ...selectedPackage, editorialBrief: brief });
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Postura Propia de Salvador</label>
                              <textarea 
                                className="form-textarea" 
                                rows={2}
                                value={selectedPackage.editorialBrief.salvadorStance}
                                onChange={(e) => {
                                  const brief = { ...selectedPackage.editorialBrief, salvadorStance: e.target.value };
                                  handleUpdatePackage({ ...selectedPackage, editorialBrief: brief });
                                }}
                              />
                            </div>
                          </div>
                          <div className="info-grid">
                            <div className="form-group">
                              <label className="form-label">Contraargumento de Grada</label>
                              <textarea 
                                className="form-textarea" 
                                rows={2}
                                value={selectedPackage.editorialBrief.counterArgument}
                                onChange={(e) => {
                                  const brief = { ...selectedPackage.editorialBrief, counterArgument: e.target.value };
                                  handleUpdatePackage({ ...selectedPackage, editorialBrief: brief });
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Riesgo de Simplificación</label>
                              <textarea 
                                className="form-textarea" 
                                rows={2}
                                value={selectedPackage.editorialBrief.simplificationRisk}
                                onChange={(e) => {
                                  const brief = { ...selectedPackage.editorialBrief, simplificationRisk: e.target.value };
                                  handleUpdatePackage({ ...selectedPackage, editorialBrief: brief });
                                }}
                              />
                            </div>
                          </div>

                          <div className="info-box" style={{ borderLeft: '4px solid var(--danger)', marginTop: '8px' }}>
                            <div className="info-box-title" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>Compliance & Restricciones de Salud</div>
                            <p style={{ fontSize: '0.8rem', margin: '4px 0' }}><strong>Nota:</strong> {selectedPackage.editorialBrief.complianceNote}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><strong>Frases prohibidas:</strong> {selectedPackage.editorialBrief.phrasesToAvoid.map(p => `"${p}"`).join(', ')}</p>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: GUIONES EDITABLES (30/60/90) */}
                      {activePackageTab === 'guiones' && (
                        <div className="detail-view" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <button className={`filter-btn ${packageScriptLength === 's30' ? 'active' : ''}`} onClick={() => setPackageScriptLength('s30')}>30 segundos</button>
                            <button className={`filter-btn ${packageScriptLength === 's60' ? 'active' : ''}`} onClick={() => setPackageScriptLength('s60')}>60 segundos</button>
                            <button className={`filter-btn ${packageScriptLength === 's90' ? 'active' : ''}`} onClick={() => setPackageScriptLength('s90')}>90 segundos</button>
                          </div>

                          <div className="form-group">
                            <label className="form-label">HOOK (Gancho)</label>
                            <input 
                              type="text" 
                              className="form-input"
                              value={selectedPackage.scripts[packageScriptLength].hook}
                              onChange={(e) => {
                                const sCopy = { ...selectedPackage.scripts };
                                sCopy[packageScriptLength] = { ...sCopy[packageScriptLength], hook: e.target.value };
                                handleUpdatePackage({ ...selectedPackage, scripts: sCopy });
                              }}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">CONTEXTO</label>
                            <textarea 
                              className="form-textarea" 
                              rows={2}
                              value={selectedPackage.scripts[packageScriptLength].context}
                              onChange={(e) => {
                                const sCopy = { ...selectedPackage.scripts };
                                sCopy[packageScriptLength] = { ...sCopy[packageScriptLength], context: e.target.value };
                                handleUpdatePackage({ ...selectedPackage, scripts: sCopy });
                              }}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">COMENTARIO CENTRAL</label>
                            <textarea 
                              className="form-textarea" 
                              rows={3}
                              value={selectedPackage.scripts[packageScriptLength].centralComment}
                              onChange={(e) => {
                                const sCopy = { ...selectedPackage.scripts };
                                sCopy[packageScriptLength] = { ...sCopy[packageScriptLength], centralComment: e.target.value };
                                handleUpdatePackage({ ...selectedPackage, scripts: sCopy });
                              }}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">EJEMPLO</label>
                            <textarea 
                              className="form-textarea" 
                              rows={2}
                              value={selectedPackage.scripts[packageScriptLength].example}
                              onChange={(e) => {
                                const sCopy = { ...selectedPackage.scripts };
                                sCopy[packageScriptLength] = { ...sCopy[packageScriptLength], example: e.target.value };
                                handleUpdatePackage({ ...selectedPackage, scripts: sCopy });
                              }}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">CIERRE & CTA</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Cierre"
                                value={selectedPackage.scripts[packageScriptLength].closure}
                                onChange={(e) => {
                                  const sCopy = { ...selectedPackage.scripts };
                                  sCopy[packageScriptLength] = { ...sCopy[packageScriptLength], closure: e.target.value };
                                  handleUpdatePackage({ ...selectedPackage, scripts: sCopy });
                                }}
                              />
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="CTA"
                                value={selectedPackage.scripts[packageScriptLength].cta}
                                onChange={(e) => {
                                  const sCopy = { ...selectedPackage.scripts };
                                  sCopy[packageScriptLength] = { ...sCopy[packageScriptLength], cta: e.target.value };
                                  handleUpdatePackage({ ...selectedPackage, scripts: sCopy });
                                }}
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="form-label">Captions sugeridos (TikTok / Instagram)</label>
                            <textarea 
                              className="form-textarea" 
                              rows={2}
                              placeholder="TikTok Caption"
                              value={selectedPackage.scripts[packageScriptLength].captionTiktok}
                              onChange={(e) => {
                                const sCopy = { ...selectedPackage.scripts };
                                sCopy[packageScriptLength] = { ...sCopy[packageScriptLength], captionTiktok: e.target.value };
                                handleUpdatePackage({ ...selectedPackage, scripts: sCopy });
                              }}
                              style={{ marginBottom: '6px' }}
                            />
                            <textarea 
                              className="form-textarea" 
                              rows={2}
                              placeholder="Instagram Caption"
                              value={selectedPackage.scripts[packageScriptLength].captionInstagram}
                              onChange={(e) => {
                                const sCopy = { ...selectedPackage.scripts };
                                sCopy[packageScriptLength] = { ...sCopy[packageScriptLength], captionInstagram: e.target.value };
                                handleUpdatePackage({ ...selectedPackage, scripts: sCopy });
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* TAB 3: PLAN DE OVERLAY PREVIEW */}
                      {activePackageTab === 'overlay' && (
                        <div className="detail-view">
                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '16px' }}>
                            {/* Visual Simulator */}
                            <div className="preview-container" style={{ margin: 0, padding: 0 }}>
                              <div className="phone-simulator" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                                <div className="phone-screen" style={{ backgroundImage: 'linear-gradient(135deg, #11152a 0%, #0d0e15 100%)' }}>
                                  <div className="phone-overlay-top">
                                    <div className="phone-overlay-source">📰 {selectedPackage.overlayPlan.visibleSource}</div>
                                    <div className="phone-overlay-headline">{selectedPackage.overlayPlan.visibleTitle}</div>
                                  </div>

                                  <div className="phone-presenter-mock" style={{ bottom: '28%' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '8px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    Salvador
                                    <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>({selectedPackage.overlayPlan.salvadorPosition})</span>
                                  </div>

                                  <div className="phone-overlay-bottom">
                                    <div className="phone-subtitles" style={{ background: 'rgba(245, 158, 11, 0.9)', color: '#000', fontWeight: 'bold' }}>
                                      💥 {selectedPackage.overlayPlan.largeText}
                                    </div>
                                    <div className="phone-caption-mock" style={{ fontSize: '0.65rem' }}>
                                      <strong>@impulso:</strong> {selectedPackage.scripts.s60.captionTiktok.slice(0, 70)}...
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Details and recommendations */}
                            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div className="info-box">
                                <strong style={{ display: 'block', color: 'var(--primary-light)', marginBottom: '4px' }}>Formato Recomendado</strong>
                                <span>Relación de aspecto {selectedPackage.overlayPlan.format} (video vertical para TikTok/Reels).</span>
                              </div>
                              <div className="info-box">
                                <strong style={{ display: 'block', color: 'var(--warning)', marginBottom: '4px' }}>Copyright & Cuidado de Terceros</strong>
                                <p style={{ fontSize: '0.78rem', lineHeight: '1.4', margin: 0 }}>
                                  {selectedPackage.overlayPlan.copyrightWarning}
                                </p>
                                <p style={{ fontSize: '0.78rem', color: '#ff6b6b', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                                  ⚠️ {selectedPackage.overlayPlan.noThirdPartyVideoWarning}
                                </p>
                              </div>
                              <div className="info-box">
                                <strong style={{ display: 'block', color: 'var(--success)', marginBottom: '4px' }}>Sugerencia de B-Roll</strong>
                                <span>{selectedPackage.overlayPlan.ownBRollSuggestion}</span>
                              </div>
                            </div>
                          </div>

                          <div className="info-box" style={{ marginTop: '16px' }}>
                            <div className="info-box-title" style={{ fontSize: '0.85rem' }}>Línea de Énfasis en Grabación</div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {selectedPackage.overlayPlan.emphasisMoments.map((moment, idx) => (
                                <li key={idx} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px', fontSize: '0.8rem' }}>
                                  <strong style={{ color: 'var(--primary-light)' }}>{moment.time}</strong>
                                  <span>{moment.action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* TAB 4: CHECKLIST Y APROBACIÓN */}
                      {activePackageTab === 'checklist' && (
                        <div className="detail-view">
                          <div className="info-box">
                            <div className="info-box-title" style={{ fontSize: '0.9rem' }}>Checklist de Aprobación Responsable</div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                              Todos los checks críticos deben estar completados y compliance validado antes de autorizar la publicación.
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {Object.entries({
                                sourceVisible: 'Fuente de la noticia visible en pantalla',
                                urlSaved: 'URL original guardada como evidencia',
                                noClinicalDiagnosis: 'No emitir diagnóstico clínico (hablar de desgaste, presión, resiliencia)',
                                noMockery: 'No usar lenguaje de burla o descalificaciones de grada (pecho frío, cagón, etc.)',
                                noMinorExposed: 'Protección de menores activa (no exponer ni identificar si hay menor involucrado)',
                                noPrivateContent: 'No reproducir contenido privado o íntimo del deportista',
                                noThirdPartyVideoDownloaded: 'No descargar contenido de video de terceros completo',
                                noFullArticleCopied: 'No copiar ni reproducir el artículo completo sin transformarlo',
                                ownStancePresent: 'Postura propia de Salvador presente (comentario constructivo)',
                                humanReviewPending: 'Revisión humana realizada'
                              }).map(([key, label]) => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox"
                                    checked={(selectedPackage.approvalChecklist as any)[key]}
                                    onChange={(e) => {
                                      const checklistCopy = { ...selectedPackage.approvalChecklist, [key]: e.target.checked };
                                      handleUpdatePackage({ ...selectedPackage, approvalChecklist: checklistCopy });
                                    }}
                                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                                  />
                                  <span style={{ color: (selectedPackage.approvalChecklist as any)[key] ? '#fff' : 'var(--text-dim)' }}>
                                    {label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="info-box" style={{ marginTop: '16px' }}>
                            <div className="info-box-title" style={{ fontSize: '0.9rem' }}>Autorizar Estado del Paquete</div>
                            
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
                              <span style={{ fontSize: '0.85rem' }}>Estado Actual:</span>
                              <span className="badge" style={{ background: selectedPackage.status === 'approved' ? 'var(--success-glow)' : 'rgba(255,255,255,0.05)', color: selectedPackage.status === 'approved' ? 'var(--success)' : '#fff', padding: '4px 10px' }}>
                                {selectedPackage.status.toUpperCase()}
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginTop: '12px' }}>
                              <button className="btn btn-secondary" onClick={() => handleUpdatePackageStatus('needs_review')}>
                                Revisar Internamente
                              </button>
                              <button className="btn btn-secondary" onClick={() => handleUpdatePackageStatus('ready_to_record')}>
                                Listo para Grabar 🎥
                              </button>
                              <button className="btn btn-secondary" onClick={() => handleUpdatePackageStatus('recorded')}>
                                Grabado 📱
                              </button>
                              <button className="btn btn-secondary" onClick={() => handleUpdatePackageStatus('edited')}>
                                Editado 🎞️
                              </button>
                              <button 
                                className="btn" 
                                onClick={() => handleUpdatePackageStatus('approved')}
                                style={{
                                  background: selectedPackage.status === 'approved' ? 'var(--success-glow)' : 'var(--primary)',
                                  borderColor: selectedPackage.status === 'approved' ? 'var(--success)' : 'var(--primary)',
                                  color: '#fff'
                                }}
                              >
                                Aprobar Publicación ✅
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                onClick={() => handleUpdatePackageStatus('discarded')}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                              >
                                Descartar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Selecciona un paquete editorial de la lista o genera uno nuevo para ver su mesa editorial.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
