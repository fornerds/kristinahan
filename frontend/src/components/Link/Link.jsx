import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import styles from './Link.module.css'

export function Link({
  children,
  to,
  underline = false,
  className = '',
  ...props
}) {
  const linkClass = `${styles.link} ${
    underline ? styles.underline : ''
  } ${className}`

  return (
    <RouterLink to={to} className={linkClass} {...props}>
      {children}
    </RouterLink>
  )
}