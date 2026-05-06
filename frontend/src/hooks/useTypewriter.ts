import { useState, useEffect } from 'react'

export function useTypewriter(text: string, speed: number = 18) {
  const [displayed, setDisplayed] = useState('')
  
  useEffect(() => {
    if (!text) {
      setDisplayed('')
      return
    }
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])
  
  return displayed
}
