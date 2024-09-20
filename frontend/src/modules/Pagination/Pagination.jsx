import React from 'react'
import styles from './Pagination.module.css'
import { ReactComponent as LeftArrow } from '../../asset/icon/left_small.svg'
import { ReactComponent as RightArrow } from '../../asset/icon/right_small.svg'
import { Button } from '../../components'

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  className,
  onPageChange
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const visiblePages = 5 * Math.ceil(totalPages / 5)
  const currentGroup = Math.ceil(currentPage / 5)
  const startPage = (currentGroup - 1) * 5 + 1
  const endPage = Math.min(currentGroup * 5, visiblePages)
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  )

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className={`${styles.pagination} ${className}`}>
      <Button
        className={styles.button}
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
      >
        <LeftArrow strokeOpacity={currentPage === 1 ? '0.25' : '0.85'} />
      </Button>
      {pageNumbers.map((number) => (
        <Button
          key={number}
          className={`${styles.pageNumber} font-roboto-body-2 ${number === currentPage ? styles.currentPage : ''}`}
          onClick={() => onPageChange(number)}
          disabled={number > totalPages}
        >
          {number}
        </Button>
      ))}
      <Button
        className={styles.button}
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        <RightArrow
          strokeOpacity={currentPage === totalPages ? '0.25' : '0.85'}
        />
      </Button>
    </div>
  )
}