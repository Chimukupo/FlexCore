import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex items-top justify-center h-screen bg-gray-100 text-2xl font-semibold text-gray-800">
        <p>Hello World</p>
      </div>
    </>
  )
}

export default App
