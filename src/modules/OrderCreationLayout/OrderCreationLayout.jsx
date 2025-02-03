import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./OrderCreationLayout.module.css";
import { ReactComponent as LeftArrow } from "../../asset/icon/left_small.svg";
import OrderCreateForm from "../OrderForm/OrderCreateForm";
import { Button, Link } from "../../components";
import { Modal } from "../Modal";
import { useEventDetails } from "../../api/hooks";

export const OrderCreationLayout = () => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { event_id } = useParams();

  const isAdminOrderCreate = location.pathname.startsWith("/admin/order");
  const backLink = isAdminOrderCreate ? "/admin/order" : `/event/${event_id}`;

  const handleSave = () => {
    setIsSaveModalOpen(true);
  };

  const handleComplete = () => {
    setIsCreateModalOpen(true);
  };

  const handleConfirm = () => {
    setIsSaveModalOpen(false);
    setIsCreateModalOpen(false);

    // 생성 완료 모달을 닫을 때 목록 페이지로 이동
    if (isCreateModalOpen) {
      navigate(backLink);
    }
  };

  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError,
  } = useEventDetails(event_id);

  return (
    <div className={styles.orderTableBackground}>
      <div className={styles.tableWrap}>
        <div className={styles.tableTitleWrap}>
          <Link to={backLink}>
            <LeftArrow />
          </Link>
          <h2 className={styles.tableTitle}>
            {eventLoading
              ? "Loading..."
              : eventError
              ? "이벤트 정보를 불러오는데 실패했습니다."
              : `[${eventData?.name}] 주문서 생성`}
          </h2>
        </div>
        <OrderCreateForm
          event_id={event_id}
          eventName={eventData?.name}
          onSave={handleSave}
          onComplete={handleComplete}
        />
      </div>
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="임시저장 알림"
        message="현재까지 작성된 내용이 임시저장되었습니다."
        confirmLabel="확인"
        onConfirm={handleConfirm}
      />
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="작성완료 알림"
        message="주문서 작성에 성공하였습니다."
        confirmLabel="확인"
        onConfirm={handleConfirm}
      />
    </div>
  );
};
