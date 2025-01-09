import './App.css'
import AppLayout from './components/app-layout'
import HttpClient from './components/http-client'
import './userWorker'

function App() {
  return (
    <>
      <AppLayout>
        <HttpClient />
      </AppLayout>
    </>
  )
}

export default App
