import React, { useState, useRef } from "react"
import styles from "./OrderEditLayout.module.css";
import { ReactComponent as LeftArrow } from '../../asset/icon/left_small.svg'
import OrderForm from '../OrderForm/OrderForm'
import { Button, Link } from "../../components";
import { Modal } from "../Modal";
import { useLocation } from "react-router-dom";

export const OrderEditLayout = ({ event_id, event_name }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const location = useLocation();
  const printableAreaRef = useRef(null);

  const isAdminOrderCreate = location.pathname.startsWith('/admin/order');
  const backLink = isAdminOrderCreate ? '/admin/order' : `/event/${event_id}`;

  const handleSave = () => {
    // 임시 저장 로직
  };

  const handlePrint = () => {
    const printContent = printableAreaRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <html>
        <head>
          <style>
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-order-form, #printable-order-form * {
                visibility: visible;
              }
              #printable-order-form {
                position: absolute;
                left: 0;
                top: 0;
              }
            }
          </style>
        </head>
        <body>
          <div id="printable-order-form">${printContent}</div>
        </body>
      </html>
    `;

    window.print();

    document.body.innerHTML = originalContent;
  };

  return (
    <div className={styles.orderTableBackground}>
      <div className={styles.tableWrap}>
        <div className={styles.tableTitleWrap}>
          <Link to={backLink}><LeftArrow /></Link>
          <h2 className={styles.tableTitle}>{`[${event_name}] 주문서 수정`}</h2>
        </div>
        <div ref={printableAreaRef}>
          <OrderForm 
            event_id={event_id} 
            isEdit={true} 
          />
        </div>
        <div className={styles.actionButtonsWrap}>
          <Button label="인쇄하기" className={styles.actionButton} variant='secondary' onClick={handlePrint} />
          <Button label="수정 완료" className={styles.actionButton} onClick={()=>setIsConfirmModalOpen(true)} />
        </div>
      </div>
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="수정완료 알림"
        message="주문서 내용을 성공적으로 수정하였습니다."
        confirmLabel="확인"
        onConfirm={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};