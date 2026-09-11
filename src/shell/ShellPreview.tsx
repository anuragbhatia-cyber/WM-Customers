import { AppShell } from './components'
import { navigateToSection, navigateToScreen } from '@/lib/preview-navigation'
import { CaseList } from '@/sections/case-management/components/CaseList'
import caseData from '@/../product/sections/case-management/data.json'

const navigationItems = [
  { label: 'My Cases', href: '/case-management', isActive: true },
]

const user = {
  name: 'Anurag Bhatia',
  role: 'Product Manager',
  avatarUrl: undefined,
}

export default function ShellPreview() {
  return (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      breadcrumbs={[{ label: 'My Cases' }]}
      onNavigate={(href) => navigateToSection(href)}
      onLogout={() => console.log('Logout')}
    >
      <CaseList
        cases={caseData.cases as any}
        kpiStats={caseData.kpiStats as any}
        statusCounts={caseData.statusCounts as any}
        onView={() => navigateToScreen('case-management', 'CaseDetail')}
        onEdit={(id) => console.log('Edit case:', id)}
        onCreate={() => navigateToScreen('case-management', 'AddCaseForm')}
      />
    </AppShell>
  )
}
