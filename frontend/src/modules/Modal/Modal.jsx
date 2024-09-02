import React from 'react';
import styles from './Modal.module.css';
import { Button } from '../../components';

export const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalButtons}>
          {onConfirm && (
            <Button
              className={`${styles.modalButton} ${styles.confirmButton}`}
              onClick={onConfirm}
              label={confirmLabel || '확인'}
            />
          )}
          {onCancel && (
            <Button
              className={`${styles.modalButton} ${styles.cancelButton}`}
              onClick={onCancel}
              label={cancelLabel || '취소'}
            />
          )}
          {!onCancel && !onConfirm && (
            <Button
              className={`${styles.modalButton} ${styles.confirmButton}`}
              onClick={onClose}
              label="확인"
            />
          )}
        </div>
      </div>
    </div>
  );
};