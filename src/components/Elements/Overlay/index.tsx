import React from 'react'
import styles from './index.module.scss'

export default function Overlay({ onClick }: {  onClick: any }) {
  return (
    <div className={styles.wrapper} onClick={onClick} />
  )
}