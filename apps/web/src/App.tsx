// import { useState } from 'react'
import './App.css'
import { Button } from "@/components/ui/button"

function App() {
  // const [] = useState(0)

  return (
    <>
      <div className="flex items-top justify-center h-screen bg-gray-100 text-2xl font-semibold text-gray-800">
        <p>Hello World</p>
      </div>

      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button>Click me</Button>
      </div>
    </>
  )
}

export default App
