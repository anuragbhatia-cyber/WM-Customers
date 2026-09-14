import data from '@/../product/sections/case-management/data.json'
import { CaseDetail } from './components/CaseDetail'
import { navigateToScreen } from '@/lib/preview-navigation'

export default function CaseDetailPreview() {
  const caseData = data.cases[0] as any
  const followUps = data.caseFollowUps.filter(fu => fu.caseId === caseData.id) as any[]
  const documents = data.caseDocuments.filter(d => d.caseId === caseData.id) as any[]

  return (
    <CaseDetail
      caseData={caseData}
      followUps={followUps}
      documents={documents}
      onDownloadDocument={(docId) => console.log('Download document:', docId)}
      onBack={() => navigateToScreen('case-management', 'CaseList')}
    />
  )
}
