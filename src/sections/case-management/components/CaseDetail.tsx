import { useState } from 'react'
import { formatDate, timeAgo } from '@/lib/format'
import {
  ArrowLeft,
  MessageSquare,
  FileText,
  Download,
  Paperclip,
  CheckCircle2,
  MessageCircle,
  Send,
} from 'lucide-react'
import type {
  CaseDetailProps,
  Case,
  CaseFollowUp,
  CaseDocument,
  CaseStatus,
  DocumentStatus,
  DocumentType,
} from '@/../product/sections/case-management/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type TabKey = 'followups' | 'details' | 'documents'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'followups', label: 'Follow-ups', icon: <MessageSquare size={14} /> },
  { key: 'details', label: 'Case Details', icon: <FileText size={14} /> },
  { key: 'documents', label: 'Documents', icon: <FileText size={14} /> },
]

const CASE_STATUS_CONFIG: Record<CaseStatus, { label: string; dot: string; bg: string; text: string }> = {
  'in-progress': { label: 'In Progress', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400' },
  drafting: { label: 'Drafting', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-400' },
  'under-review': { label: 'Under Review', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400' },
  approved: { label: 'Approved', dot: 'bg-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-400' },
  completed: { label: 'Completed', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400' },
  'on-hold': { label: 'On Hold', dot: 'bg-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400' },
}

const DOC_STATUS_CONFIG: Record<DocumentStatus, { label: string; dot: string; bg: string; text: string }> = {
  draft: { label: 'Draft', dot: 'bg-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400' },
  'under-review': { label: 'Under Review', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400' },
  approved: { label: 'Approved', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400' },
  delivered: { label: 'Delivered', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400' },
  registered: { label: 'Registered', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-400' },
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  will: 'Will',
  trust: 'Trust Deed',
  'succession-certificate': 'Succession Certificate',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatCaseId(id: string): string {
  const match = id.match(/(\d+)\s*$/)
  if (!match) return id
  const shifted = parseInt(match[1], 10) + 120
  return `CASE-${String(shifted).padStart(5, '0')}`
}

function daysBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CaseDetail({
  caseData,
  followUps,
  documents,
  onDownloadDocument,
  onBack,
}: CaseDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('followups')

  const statusCfg = CASE_STATUS_CONFIG[caseData.status]

  return (
    <div className="space-y-6 pb-8 overflow-x-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <div>
          {/* Case Identity */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 min-w-0">
            <div className="flex items-start gap-3 min-w-0">
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer mt-0.5"
              >
                <ArrowLeft size={20} />
              </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 font-[family-name:var(--font-mono,'IBM_Plex_Mono',ui-monospace,monospace)]">
                  {formatCaseId(caseData.id)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                  {statusCfg.label}
                </span>
              </div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1.5 tracking-tight">
                {caseData.serviceName}
              </h1>
            </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {TABS.map(tab => {
              const isActive = activeTab === tab.key
              let count: number | null = null
              if (tab.key === 'followups') count = followUps.length
              else if (tab.key === 'documents') count = documents.length

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                      : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {count !== null && (
                    <span className={`text-[10px] font-bold tabular-nums ${isActive ? 'text-yellow-400 dark:text-yellow-500' : 'text-neutral-400 dark:text-neutral-600'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <div>
        {activeTab === 'followups' && (
          <FollowUpsTab followUps={followUps} />
        )}
        {activeTab === 'details' && (
          <DetailsTab caseData={caseData} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab documents={documents} onDownloadDocument={onDownloadDocument} />
        )}
      </div>
    </div>
  )
}


// ===========================================================================
// Tab: Follow-ups
// ===========================================================================

type FollowUpComment = {
  id: string
  followUpId: string
  author: string
  content: string
  attachments: string[]
  createdAt: string
}

function FollowUpsTab({ followUps }: { followUps: CaseFollowUp[] }) {
  const sorted = [...followUps].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const [comments, setComments] = useState<FollowUpComment[]>([])

  function handleAddComment(comment: FollowUpComment) {
    setComments(prev => [...prev, comment])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Follow-up Timeline</h2>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={<MessageSquare size={32} />} title="No follow-ups yet" subtitle="Add the first follow-up entry to start tracking this case." />
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />

          <div className="space-y-0">
            {sorted.map((fu, idx) => {
              const isFirst = idx === 0
              const followUpComments = comments.filter(c => c.followUpId === fu.id)

              return (
                <div key={fu.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Timeline dot */}
                  <div className="hidden sm:flex shrink-0 relative z-10">
                    <div className={`w-[31px] h-[31px] rounded-full border-2 flex items-center justify-center ${
                      isFirst
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 dark:border-yellow-500'
                        : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900'
                    }`}>
                      <MessageSquare size={12} className={isFirst ? 'text-yellow-500' : 'text-neutral-400 dark:text-neutral-500'} />
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`flex-1 bg-white dark:bg-neutral-900 rounded-xl border p-4 ${
                    isFirst
                      ? 'border-yellow-200 dark:border-yellow-900/50 shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{fu.title}</h3>
                      </div>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap shrink-0">
                        {timeAgo(fu.createdAt)}
                      </p>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">{fu.notes}</p>

                    {fu.attachments.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500 mb-1.5">
                          <Paperclip size={10} />
                          <span>{fu.attachments.length} {fu.attachments.length === 1 ? 'file' : 'files'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {fu.attachments.map((att, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded border border-neutral-200 dark:border-neutral-700">
                              <FileText size={9} />
                              {att}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comments section */}
                    <CommentsSection
                      followUpId={fu.id}
                      comments={followUpComments}
                      onAddComment={handleAddComment}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ===========================================================================
// Follow-up Comments
// ===========================================================================

function CommentsSection({
  followUpId,
  comments,
  onAddComment,
}: {
  followUpId: string
  comments: FollowUpComment[]
  onAddComment: (comment: FollowUpComment) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])

  function handleAddAttachment() {
    const names = ['Document.pdf', 'Agreement.pdf', 'ID_Proof.jpg', 'Court_Order.pdf', 'Will_Draft.docx', 'Receipt.pdf', 'Affidavit.pdf', 'Photo.png']
    const randomFile = names[Math.floor(Math.random() * names.length)]
    setAttachments(prev => [...prev, randomFile])
  }

  function handleSubmit() {
    if (!content.trim() && attachments.length === 0) return
    onAddComment({
      id: `cmt-${Date.now()}`,
      followUpId,
      author: 'You',
      content: content.trim(),
      attachments,
      createdAt: new Date().toISOString(),
    })
    setContent('')
    setAttachments([])
    setExpanded(false)
  }

  return (
    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
      {comments.length > 0 && (
        <div className="space-y-2 mb-2.5">
          {comments.map(cmt => (
            <div key={cmt.id} className="bg-neutral-50 dark:bg-neutral-800/40 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">{cmt.author}</span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{timeAgo(cmt.createdAt)}</span>
              </div>
              {cmt.content && (
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">{cmt.content}</p>
              )}
              {cmt.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {cmt.attachments.map((att, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 rounded border border-neutral-200 dark:border-neutral-700">
                      <FileText size={9} />
                      {att}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          <MessageCircle size={11} />
          {comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'} · Reply` : 'Comment'}
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {attachments.map((file, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-700">
                  <FileText size={10} />
                  {file}
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleAddAttachment}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            >
              <Paperclip size={11} />
              Attach
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setExpanded(false)
                  setContent('')
                  setAttachments([])
                }}
                className="px-2.5 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() && attachments.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={10} />
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===========================================================================
// Tab: Details
// ===========================================================================

function DetailsTab({ caseData }: { caseData: Case }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-5">
        <SectionCard title="Description">
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{caseData.description}</p>
        </SectionCard>

        <SectionCard title="Case Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldRow label="Case ID" value={formatCaseId(caseData.id)} mono />
            <FieldRow label="Customer ID" value={caseData.customerId} mono />
            <FieldRow label="Customer" value={caseData.customerName} />
            <FieldRow label="Service Type" value={caseData.serviceType} />
            <FieldRow label="Wealth Manager" value={caseData.assignedLawyer} />
            <FieldRow label="Created" value={formatDate(caseData.createdAt)} />
            <FieldRow label="Last Updated" value={formatDate(caseData.lastUpdated)} />
          </div>
        </SectionCard>

        <SectionCard title="Document Checklist">
          {caseData.documentChecklist.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500 italic">No checklist items</p>
          ) : (
            <ul className="space-y-2">
              {caseData.documentChecklist.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
                    <CheckCircle2 size={11} className="text-neutral-300 dark:text-neutral-600" />
                  </div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <SectionCard title="Status Summary">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Status</span>
              <StatusBadge status={caseData.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Follow-ups</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">{caseData.followUpCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Documents</span>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">{caseData.documentCount}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Timeline">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">Created</p>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-0.5">{formatDateTime(caseData.createdAt)}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">Last Updated</p>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-0.5">{formatDateTime(caseData.lastUpdated)}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">Duration</p>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-0.5">{daysBetween(caseData.createdAt, caseData.lastUpdated)} days</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

// ===========================================================================
// Tab: Documents
// ===========================================================================

function DocumentsTab({ documents, onDownloadDocument }: { documents: CaseDocument[]; onDownloadDocument?: (docId: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Documents</h2>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">{documents.length} {documents.length === 1 ? 'document' : 'documents'}</span>
      </div>

      {documents.length === 0 ? (
        <EmptyState icon={<FileText size={32} />} title="No documents yet" subtitle="Documents generated for this case will appear here." />
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs dark:shadow-none overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-[2fr_100px_60px_60px_100px_60px] gap-3 px-5 py-3 bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <span>Document</span>
              <span>Type</span>
              <span className="text-center">Ver.</span>
              <span>Format</span>
              <span>Status</span>
              <span className="text-center">Size</span>
            </div>

            {documents.map((doc, idx) => {
              const statusCfg = DOC_STATUS_CONFIG[doc.status]
              const isLast = idx === documents.length - 1
              return (
                <div
                  key={doc.id}
                  className={`grid grid-cols-[2fr_100px_60px_60px_100px_60px] gap-3 px-5 py-3.5 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors ${
                    !isLast ? 'border-b border-neutral-100 dark:border-neutral-800/60' : ''
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <FileText size={14} className={doc.format === 'pdf' ? 'text-red-500' : 'text-blue-500'} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{doc.title}</p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Updated {formatDate(doc.updatedAt)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">{DOC_TYPE_LABELS[doc.type]}</span>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 text-center tabular-nums">v{doc.version}</span>
                  <span className="text-[10px] font-semibold uppercase text-neutral-500 dark:text-neutral-400">{doc.format}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => onDownloadDocument?.(doc.id)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-colors cursor-pointer"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {documents.map(doc => {
              const statusCfg = DOC_STATUS_CONFIG[doc.status]
              return (
                <div key={doc.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <FileText size={14} className={doc.format === 'pdf' ? 'text-red-500' : 'text-blue-500'} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{doc.title}</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{DOC_TYPE_LABELS[doc.type]} · v{doc.version} · {doc.format.toUpperCase()} · {doc.fileSize}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDownloadDocument?.(doc.id)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-yellow-500 transition-colors cursor-pointer shrink-0"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Updated {formatDate(doc.updatedAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ===========================================================================
// Shared Sub-Components
// ===========================================================================

function StatusBadge({ status }: { status: CaseStatus }) {
  const cfg = CASE_STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs dark:shadow-none p-5">
      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function FieldRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="py-1.5">
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
      <p className={`text-sm text-neutral-700 dark:text-neutral-300 ${mono ? 'font-[family-name:var(--font-mono,\'IBM_Plex_Mono\',ui-monospace,monospace)] text-xs' : ''}`}>{value}</p>
    </div>
  )
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="py-16 text-center">
      <div className="text-neutral-300 dark:text-neutral-600 mb-3 flex justify-center">{icon}</div>
      <p className="font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{subtitle}</p>
    </div>
  )
}
