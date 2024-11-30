import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button, Link } from "../../components";
import { Modal } from "../Modal";
import OrderForm from "../OrderForm/OrderForm";
import { ReactComponent as LeftArrow } from "../../asset/icon/left_small.svg";
import styles from "./OrderEditLayout.module.css";
import {
  useOrderDetails,
  useSaveOrder,
  useEventDetails,
  useDeleteOrder,
} from "../../api/hooks";

export const OrderEditLayout = () => {
  const { event_id, order_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const printableAreaRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteOrderMutation = useDeleteOrder();

  // API hooks
  const { data: orderData, isLoading: isLoadingOrder } =
    useOrderDetails(order_id);

  const { data: event, isLoading: isLoadingEvent } = useEventDetails(event_id);

  const saveOrderMutation = useSaveOrder();

  const isAdminOrderCreate = location.pathname.startsWith("/admin/order");
  const backLink = isAdminOrderCreate ? "/admin/order" : `/event/${event_id}`;

  const [prepareOrderData, setPrepareOrderData] = useState(() => () => ({}));

  const handleSave = async (isTemp = false) => {
    try {
      const orderDataToSave = prepareOrderData();
      if (!orderDataToSave) {
        setErrorMessage("주문서 데이터 준비 중 오류가 발생했습니다.");
        setIsErrorModalOpen(true);
        return;
      }

      const result = await saveOrderMutation.mutateAsync({
        orderData: orderDataToSave,
        orderId: order_id,
        isTemp: isTemp,
      });

      if (!isTemp) {
        if (result.data?.order_id) {
          setIsConfirmModalOpen(true);
        }
      } else {
        navigate(backLink);
      }
    } catch (error) {
      console.error("Failed to save order:", error);
      setErrorMessage(
        error.response?.data?.message || "주문서 저장 중 오류가 발생했습니다."
      );
      setIsErrorModalOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrderMutation.mutateAsync(order_id);
      setIsDeleteModalOpen(false);
      navigate(backLink);
    } catch (error) {
      console.error("Failed to delete order:", error);
      setErrorMessage(
        error.response?.data?.message || "주문서 삭제 중 오류가 발생했습니다."
      );
      setIsErrorModalOpen(true);
    }
  };

  const handlePrepareOrderData = useCallback((prepareFunction) => {
    if (typeof prepareFunction === "function") {
      setPrepareOrderData(() => prepareFunction);
    } else {
      console.error("Received invalid prepareOrderData:", prepareFunction);
    }
  }, []);

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

  if (isLoadingOrder || isLoadingEvent || saveOrderMutation.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.orderTableBackground}>
      <div className={styles.tableWrap}>
        <div className={styles.tableTitleWrap}>
          <Link to={backLink}>
            <LeftArrow />
          </Link>
          <h2 className={styles.tableTitle}>
            {event?.data ? `[${event.data.name}] 주문서 수정` : "주문서 수정"}
          </h2>
        </div>
        <div ref={printableAreaRef}>
          {orderData && (
            <OrderForm
              event_id={event_id}
              orderId={order_id}
              onSave={handlePrepareOrderData}
            />
          )}
        </div>
        <div className={styles.actionButtonsWrap}>
          <Button
            label="인쇄하기"
            className={styles.actionButton}
            variant="secondary"
            onClick={handlePrint}
          />
          <Button
            label="삭제하기"
            className={styles.actionButton}
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          />
          <Button
            label="수정하기"
            className={styles.actionButton}
            onClick={() => handleSave(false)}
          />
        </div>
      </div>
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          navigate(backLink);
        }}
        title="수정완료 알림"
        message="주문서 내용을 성공적으로 수정하였습니다."
        confirmLabel="확인"
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          navigate(backLink);
        }}
      />
      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="오류 발생"
        message={errorMessage}
        confirmLabel="확인"
        onConfirm={() => setIsErrorModalOpen(false)}
      />
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="주문서 삭제"
        message="정말로 이 주문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        variant="danger"
      />
    </div>
  );
};

export default OrderEditLayout;
