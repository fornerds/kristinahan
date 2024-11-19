import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button, Link } from "../../components";
import { Modal } from "../Modal";
import OrderForm from "../OrderForm/OrderForm";
import { ReactComponent as LeftArrow } from "../../asset/icon/left_small.svg";
import styles from "./OrderEditLayout.module.css";
import {
  useOrderDetails,
  useUpdateOrder,
  useDeleteOrder,
  useEventDetails,
} from "../../api/hooks";

export const OrderEditLayout = () => {
  const { event_id, order_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const printableAreaRef = useRef(null);

  const { data: orderDetails, isLoading, error } = useOrderDetails(order_id);
  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();

  const {
    data: eventResponse,
    isLoading: eventLoading,
    error: eventError,
  } = useEventDetails(event_id);

  const eventData = eventResponse?.data;
  const isAdminOrderCreate = location.pathname.startsWith("/admin/order");
  const backLink = isAdminOrderCreate ? "/admin/order" : `/event/${event_id}`;

  useEffect(() => {
    if (orderDetails) {
      setOrderData(orderDetails?.data);
      console.log(orderDetails?.data);
    }
  }, [orderDetails]);

  const [prepareOrderData, setPrepareOrderData] = useState(() => () => ({}));

  const handleSave = useCallback(
    async (isTemp = false) => {
      if (typeof prepareOrderData !== "function") {
        console.error("prepareOrderData is not a function");
        setErrorMessage("주문 데이터를 준비하는 중 오류가 발생했습니다.");
        setIsErrorModalOpen(true);
        return;
      }

      const orderData = prepareOrderData();
      console.log("Submitting order data:", orderData);

      try {
        await updateOrderMutation.mutateAsync({
          orderId: parseInt(order_id, 10),
          orderData: orderData,
          isTemp: false,
        });
        setIsConfirmModalOpen(true);
      } catch (error) {
        console.error("Failed to update order:", error);
        let errorMsg = "주문서 수정 중 오류가 발생했습니다.";
        if (error.response) {
          if (error.response.status === 422) {
            errorMsg =
              "입력값이 올바르지 않습니다. 모든 필수 항목을 확인해주세요.";
          } else if (error.response.data?.detail) {
            errorMsg = Array.isArray(error.response.data.detail)
              ? error.response.data.detail[0]?.msg || errorMsg
              : error.response.data.detail;
          }
        }
        setErrorMessage(errorMsg);
        setIsErrorModalOpen(true);
      }
    },
    [order_id, prepareOrderData, updateOrderMutation]
  );

  const handlePrepareOrderData = useCallback((prepareFunction) => {
    if (typeof prepareFunction === "function") {
      setPrepareOrderData(() => prepareFunction);
    } else {
      console.error("Received invalid prepareOrderData:", prepareFunction);
    }
  }, []);

  const handleDelete = async () => {
    try {
      await deleteOrderMutation.mutateAsync(order_id);
      navigate(backLink);
    } catch (error) {
      console.error("Failed to delete order:", error);
      setErrorMessage("주문서 삭제 중 오류가 발생했습니다.");
      setIsErrorModalOpen(true);
    }
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading order details: {error.message}</div>;

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
              : `[${eventData?.name}] 주문서 수정`}
          </h2>
        </div>
        <div ref={printableAreaRef}>
          {orderData && (
            <OrderForm
              event_id={event_id}
              orderId={order_id}
              initialData={orderData}
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
        onClose={() => setIsConfirmModalOpen(false)}
        title="수정완료 알림"
        message="주문서 내용을 성공적으로 수정하였습니다."
        confirmLabel="확인"
        onConfirm={() => {
          setIsConfirmModalOpen(false);
        }}
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
      />
      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="오류 발생"
        message={errorMessage}
        confirmLabel="확인"
        onConfirm={() => setIsErrorModalOpen(false)}
      />
    </div>
  );
};

export default OrderEditLayout;
