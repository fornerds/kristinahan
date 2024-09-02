import { useState } from "react"
import styles from "./OrderEditLayout.module.css";
import { ReactComponent as LeftArrow } from '../../asset/icon/left_small.svg'
import OrderForm from '../OrderForm/OrderForm'
import { Button, Link } from "../../components";
import { Modal } from "../Modal";

export const OrderEditLayout = ({ event_id }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSave = () => {
    // 임시 저장 로직
  };

  return (
    <div className={styles.orderTableBackground}>
      <div className={styles.tableWrap}>
        <div className={styles.tableTitleWrap}>
          <Link to={`/event/${event_id}`}><LeftArrow /></Link>
          <h2 className={styles.tableTitle}>{`[202${event_id}년 행사] 주문서 목록`}</h2>
        </div>
        <OrderForm 
          event_id={event_id} 
          isEdit={true} 
        />
        <div className={styles.actionButtonsWrap}>
          <Button label="인쇄하기" className={styles.actionButton} variant='secondary' onClick={handleSave} />
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