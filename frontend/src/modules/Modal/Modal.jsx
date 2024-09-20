import React, { useState } from 'react';
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
  onCancel,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>
        {children}
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

export const EventSelectionModal = ({ isOpen, onClose, onSelectEvent, events }) => {
  const [selectedEventId, setSelectedEventId] = useState('');

  const handleSelectEvent = () => {
      const selectedEvent = events.find(event => event.id === selectedEventId);
      if (selectedEvent) {
          onSelectEvent(selectedEvent.id, selectedEvent.name);
      }
      onClose();
  };

  return (
      <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="주문서 행사 선택"
          message="작성할 주문서의 행사를 선택해주세요."
          confirmLabel="선택"
          onConfirm={handleSelectEvent}
          cancelLabel="취소"
          onCancel={onClose}
      >
          <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className={styles.eventSelect}
          >
              <option value="">선택하세요</option>
              {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.name}</option>
              ))}
          </select>
      </Modal>
  );
};
