import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import { ChatProvider } from './context/ChatProvider'
import './App.css'
function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <ChatProvider>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/chats' element={<ChatPage />} />
          </Routes>
        </ChatProvider>
      </BrowserRouter>
    </div>

  )
}
export default App
