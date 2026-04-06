import { HashRouter, Routes, Route } from 'react-router-dom'
import { useDashboardData } from './hooks/useDashboardData'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import RepoDetail from './components/RepoDetail'

function App() {
  const {
    repos,
    isLoading,
    isRefreshing,
    error,
    lastRefresh,
    nextRefreshAt,
    rateLimitInfo,
    refresh,
  } = useDashboardData()

  return (
    <HashRouter>
      <Layout
        lastRefresh={lastRefresh}
        nextRefreshAt={nextRefreshAt}
        onManualRefresh={refresh}
        isRefreshing={isRefreshing}
        rateLimitInfo={rateLimitInfo}
        error={error}
      >
        <Routes>
          <Route path="/" element={<Dashboard repos={repos} isLoading={isLoading} />} />
          <Route path="/repo/:name" element={<RepoDetail repos={repos} />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
