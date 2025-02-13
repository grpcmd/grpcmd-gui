import './App.css'
import AppLayout from './components/app-layout'
import HttpClient from './components/http-client'
import Onboarding from './components/onboarding'
import Tour from './components/tour'
import './userWorker'

function App() {
  return (
    <>
      <AppLayout>
        <HttpClient />
      </AppLayout>
      <Onboarding />
      <Tour />
    </>
  )
}

export default App
