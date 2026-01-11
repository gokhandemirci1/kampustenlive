import { useEffect, useState } from 'react'

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isMagnetic, setIsMagnetic] = useState(false)
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseEnter = (e) => {
      const target = e.target
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        setIsHovering(true)
      }

      // Magnetic effect for buttons
      if (target.closest('button') || target.closest('a[href]')) {
        setIsMagnetic(true)
        const rect = target.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const offsetX = (centerX - e.clientX) * 0.3
        const offsetY = (centerY - e.clientY) * 0.3
        setMagneticOffset({ x: offsetX, y: offsetY })
      } else {
        setIsMagnetic(false)
        setMagneticOffset({ x: 0, y: 0 })
      }
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
      setIsMagnetic(false)
      setMagneticOffset({ x: 0, y: 0 })
    }

    const handleMouseDown = () => {
      setIsClicking(true)
    }

    const handleMouseUp = () => {
      setIsClicking(false)
    }

    window.addEventListener('mousemove', updateCursor)
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', updateCursor)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const cursorClasses = [
    'custom-cursor',
    isHovering && !isMagnetic && 'hover',
    isClicking && 'click',
    isMagnetic && 'magnetic',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cursorClasses}
      style={{
        left: `${position.x + magneticOffset.x}px`,
        top: `${position.y + magneticOffset.y}px`,
      }}
    />
  )
}

export default CustomCursor