import React, { useState, useEffect, useCallback } from "react";
import { Button, Input } from "../../components";
import PaymentTable from "./PaymentTable/PaymentTable";
import { Modal } from "../Modal";
import styles from "./OrderForm.module.css";
import {
  useSaveOrder,
  useOrderDetails,
  useAuthors,
  useAffiliations,
  useEventDetails,
  useCategories,
} from "../../api/hooks";

const ORDER_STATUS_MAP = {
  Order_Completed: "주문완료",
  Packaging_Completed: "포장완료",
  Repair_Received: "수선접수",
  Repair_Completed: "수선완료",
  In_delivery: "배송중",
  Delivery_completed: "배송완료",
  Receipt_completed: "수령완료",
  Accommodation: "숙소",
};

const chunk = (array, size) => {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

export const OrderCreateForm = ({
  event_id,
  isEdit,
  orderId,
  onSave,
  onComplete,
}) => {
  const { data: event, isLoading: isEventLoading } = useEventDetails(event_id);
  const [formData, setFormData] = useState({
    event_id: event_id,
    author_id: null,
    modifier_id: null,
    affiliation_id: null,
    groomName: "",
    brideName: "",
    contact: "",
    address: "",
    collectionMethod: "",
    notes: "",
    alter_notes: "",
    totalPrice: 0,
    advancePayment: 0,
    balancePayment: 0,
    isTemporary: false,
    status: "Order_Completed",
    orderItems: [],
    alteration_details: [],
  });

  const [selectedProducts, setSelectedProducts] = useState({});
  const [groupedProducts, setGroupedProducts] = useState({});
  const [customerName, setCustomerName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [affiliationError, setAffiliationError] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [prepaymentTotal, setPrepaymentTotal] = useState(0);
  const [balanceTotal, setBalanceTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [payments, setPayments] = useState([
    {
      payer: "",
      payment_date: new Date().toISOString(),
      paymentMethod: "advance",
      cashAmount: 0,
      cashCurrency: "KRW",
      cardAmount: 0,
      cardCurrency: "KRW",
      tradeInAmount: 0,
      tradeInCurrency: "",
      notes: "",
    },
    {
      payer: "",
      payment_date: new Date().toISOString(),
      paymentMethod: "balance",
      cashAmount: 0,
      cashCurrency: "KRW",
      cardAmount: 0,
      cardCurrency: "KRW",
      tradeInAmount: 0,
      tradeInCurrency: "",
      notes: "",
    },
  ]);

  // API hooks
  const { mutateAsync: saveOrder } = useSaveOrder();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: authors, isLoading: isLoadingAuthors } = useAuthors();
  const { data: affiliations, isLoading: isLoadingAffiliations } =
    useAffiliations();

  console.log("event", JSON.stringify(event));
  console.log("categories", categories);

  useEffect(() => {
    if (event && categories && !isEdit) {
      const newGroupedProducts = {};
      event.form.categories.forEach((eventCategory) => {
        const category = categories.find((c) => c.id === eventCategory.id);
        if (category) {
          newGroupedProducts[category.id] = category.products;
        }
      });
      setGroupedProducts(newGroupedProducts);
    }
  }, [event, categories, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? parseInt(value, 10) : null,
    }));
  };

  const handleContactChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, contact: value }));
  };

  const validateAffiliation = () => {
    if (!formData.affiliation_id) {
      setAffiliationError("소속을 선택해주세요.");
      setIsErrorModalOpen(true);
      return false;
    }
    setAffiliationError("");
    return true;
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  const handleAffiliationChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, affiliation_id: value }));
    if (value) {
      setAffiliationError("");
    }
  };

  const handleAddressChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, address: value }));
  };

  const handleCollectionMethodChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, collectionMethod: value }));
  };

  const handleNotesChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, notes: value }));
  };

  const calculatePaymentAmount = (payment) => {
    return {
      cashAmount: Number(payment.cashAmount) || 0,
      cardAmount: Number(payment.cardAmount) || 0,
      tradeInAmount: Number(payment.tradeInAmount) || 0,
    };
  };

  const handlePaymentChange = useCallback(
    (index) => (updatedPayment) => {
      setPayments((prev) => {
        const newPayments = [...prev];
        const amounts = calculatePaymentAmount(updatedPayment);
        const totalAmount = Object.values(amounts).reduce(
          (sum, amount) => sum + amount,
          0
        );

        newPayments[index] = {
          ...updatedPayment,
          payer: updatedPayment.payerName || null,
          paymentMethod: index === 0 ? "advance" : "balance",
          payment_date: updatedPayment.payment_date || new Date().toISOString(),
          ...amounts,
        };
        return newPayments;
      });

      const totalAmount = calculatePaymentAmount(updatedPayment);
      const sum = Object.values(totalAmount).reduce((acc, val) => acc + val, 0);

      if (index === 0) {
        setPrepaymentTotal(sum);
      } else {
        setBalanceTotal(sum);
      }
    },
    []
  );

  const handleAlterationChange = (repairId, value, field) => {
    const figure = parseFloat(value);
    if (isNaN(figure)) return;

    setFormData((prev) => {
      const newAlterationDetails = [...prev.alteration_details];
      const existingIndex = newAlterationDetails.findIndex(
        (detail) => detail.form_repair_id === repairId
      );

      if (existingIndex !== -1) {
        if (figure === 0 && field === "figure") {
          // figure가 0이면 해당 항목 제거
          newAlterationDetails.splice(existingIndex, 1);
        } else {
          // 기존 항목 업데이트
          newAlterationDetails[existingIndex] = {
            ...newAlterationDetails[existingIndex],
            [field]: figure,
          };
        }
      } else if (figure !== 0 || field === "alterationFigure") {
        // 새로운 항목 추가
        newAlterationDetails.push({
          form_repair_id: repairId,
          figure: field === "figure" ? figure : 0,
          alterationFigure: field === "alterationFigure" ? figure : 0,
        });
      }

      return {
        ...prev,
        alteration_details: newAlterationDetails,
      };
    });
  };

  const handleAlterationNotes = (value) => {
    setFormData((prev) => ({
      ...prev,
      alter_notes: value,
    }));
  };

  const handleGroomNameChange = useCallback((e) => {
    const newGroomName = e.target.value;
    setFormData((prev) => ({ ...prev, groomName: newGroomName }));
    setCustomerName(newGroomName);
  }, []);

  const handleBrideNameChange = useCallback((e) => {
    const newBrideName = e.target.value;
    setFormData((prev) => ({ ...prev, brideName: newBrideName }));
  }, []);

  const handleProductChange = useCallback(
    (categoryId, field, value) => {
      setSelectedProducts((prev) => {
        const newState = {
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            [field]: value,
          },
        };

        if (field === "productId") {
          const productId = parseInt(value, 10);
          const selectedProduct = groupedProducts[categoryId]?.find(
            (p) => p.id === productId
          );

          if (selectedProduct) {
            newState[categoryId] = {
              productId: selectedProduct.id,
              price: selectedProduct.price,
              quantity: 1,
              attributes: selectedProduct.attributes.map((attr) => ({
                id: attr.id,
                value: attr.value,
              })),
            };
          } else {
            newState[categoryId].price = 0;
            newState[categoryId].quantity = 1;
            newState[categoryId].attributes = [];
          }
        }

        return newState;
      });
    },
    [groupedProducts]
  );

  useEffect(() => {
    const newTotalPrice = Object.values(selectedProducts).reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    setTotalPrice(newTotalPrice);
    setFormData((prev) => ({
      ...prev,
      totalPrice: newTotalPrice,
      advancePayment: prepaymentTotal,
      balancePayment: balanceTotal,
    }));
  }, [selectedProducts, prepaymentTotal, balanceTotal]);

  const handleSubmit = async (isTemp = false) => {
    if (!validateAffiliation()) {
      return;
    }

    const safeParseInt = (value) => {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    const validateAlterationDetails = (details) => {
      return details.every(
        (detail) =>
          detail.form_repair_id &&
          typeof detail.figure === "number" &&
          typeof detail.alterationFigure === "number"
      );
    };

    // handleSubmit 함수 내부에서 사용
    if (
      formData.alteration_details.length > 0 &&
      !validateAlterationDetails(formData.alteration_details)
    ) {
      alert("수선 정보를 올바르게 입력해주세요.");
      return;
    }

    const orderItems = Object.entries(selectedProducts)
      .map(([categoryId, item]) => {
        if (!item.productId) return null;
        return {
          product_id: safeParseInt(item.productId),
          attributes_id: item.attributes[0]?.id || null,
          quantity: safeParseInt(item.quantity) || 0,
          price: (item.price || 0) * (item.quantity || 0),
        };
      })
      .filter(Boolean);

    const convertTradeInCurrency = (currency) => {
      const currencyMap = {
        "10K": "K10",
        "14K": "K14",
        "18K": "K18",
        "24K": "K24",
      };
      return currencyMap[currency] || currency;
    };

    const paymentsData = payments.map((payment) => {
      const basePayment = {
        payer: payment.payer || formData.groomName,
        payment_date: payment.payment_date,
        paymentMethod: payment.paymentMethod,
        notes: payment.notes || "",
      };

      if (payment.cashAmount > 0) {
        basePayment.cashAmount = payment.cashAmount;
        basePayment.cashCurrency = payment.cashCurrency;
      }
      if (payment.cardAmount > 0) {
        basePayment.cardAmount = payment.cardAmount;
        basePayment.cardCurrency = payment.cardCurrency;
      }
      if (payment.tradeInAmount > 0) {
        basePayment.tradeInAmount = payment.tradeInAmount;
        basePayment.tradeInCurrency = convertTradeInCurrency(
          payment.tradeInCurrency
        );
      }

      return basePayment;
    });

    const orderData = {
      event_id: safeParseInt(event_id),
      author_id: safeParseInt(formData.author_id),
      modifier_id: null,
      affiliation_id: safeParseInt(formData.affiliation_id),
      status: "Order_Completed",
      groomName: formData.groomName,
      brideName: formData.brideName,
      contact: formData.contact,
      address: formData.address,
      collectionMethod: formData.collectionMethod,
      notes: formData.notes,
      alter_notes: formData.alter_notes,
      totalPrice: totalPrice,
      advancePayment: prepaymentTotal,
      balancePayment: balanceTotal,
      orderItems,
      payments: paymentsData,
      alteration_details: formData.alteration_details,
    };

    try {
      await saveOrder({
        orderData,
        isTemp,
      });

      if (isTemp) {
        onSave();
      } else {
        onComplete();
      }
    } catch (error) {
      console.error("Order save failed:", error);
      alert(
        "주문 저장에 실패했습니다. 주문 저장 과정과 개발자 모드의 에러메시지를 개발자에게 전달해주시면 빠르게 도와드리겠습니다."
      );
    }
  };

  if (
    isLoadingAuthors ||
    isLoadingAffiliations ||
    isEventLoading ||
    isCategoriesLoading
  ) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* 주문정보 섹션 */}
      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>주문정보</h3>
        <div className={styles.sectionValueWrap}>
          <h4 className={styles.sectionLabel}>주문번호</h4>
          <p className={styles.sectionValue}>{formData.id || "새 주문"}</p>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>작성자</h4>
            <select
              name="author_id"
              id={styles.writer}
              onChange={handleInputChange}
              value={formData.author_id || ""}
            >
              <option value="">작성자 선택</option>
              {authors?.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>작성일자</h4>
            <p className={styles.sectionValue}>
              {new Date().toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
      </section>

      {/* 주문자정보 섹션 */}
      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>주문자정보</h3>
        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>신랑</h4>
            <Input
              type="text"
              className={styles.textInput}
              value={formData.groomName}
              onChange={handleGroomNameChange}
              placeholder="신랑 이름"
            />
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>신부</h4>
            <Input
              type="text"
              className={styles.textInput}
              value={formData.brideName}
              onChange={handleBrideNameChange}
              placeholder="신부 이름"
            />
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>연락처</h4>
            <Input
              type="tel"
              className={styles.textInput}
              value={formData.contact}
              onChange={handleContactChange}
            />
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>소속</h4>
            <select
              name="affiliation_id"
              id={styles.relation}
              value={formData.affiliation_id || ""}
              onChange={handleAffiliationChange}
            >
              <option value="">소속 선택</option>
              {affiliations?.map((affiliation) => (
                <option key={affiliation.id} value={affiliation.id}>
                  {affiliation.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>배송지 입력</h4>
            <Input
              type="text"
              className={styles.addressInput}
              value={formData.address}
              onChange={handleAddressChange}
            />
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>수령방법</h4>
            <select
              id={styles.takeout}
              value={formData.collectionMethod}
              onChange={handleCollectionMethodChange}
            >
              <option value="">선택</option>
              <option value="Delivery">배송</option>
              <option value="Pickup on site">현장수령 (기혼 불가)</option>
              <option value="Pickup in store">매장수령</option>
            </select>
          </div>
        </div>

        <div className={styles.sectionValueWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>기타사항</h4>
            <textarea
              className={styles.optionalMessage}
              value={formData.notes}
              onChange={handleNotesChange}
            />
          </div>
        </div>
      </section>

      {/* 상품정보 섹션 */}
      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>상품정보</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">카테고리</th>
              <th scope="col">상품명</th>
              <th scope="col">사이즈</th>
              <th scope="col">개수</th>
              <th scope="col">가격</th>
            </tr>
          </thead>
          <tbody>
            {event?.form.categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>
                  <select
                    value={selectedProducts[category.id]?.productId || ""}
                    onChange={(e) =>
                      handleProductChange(
                        category.id,
                        "productId",
                        e.target.value
                      )
                    }
                  >
                    <option value="">선택</option>
                    {(groupedProducts[category.id] || []).map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {selectedProducts[category.id]?.productId && (
                    <select
                      value={
                        selectedProducts[category.id]?.attributes?.[0]?.id || ""
                      }
                      onChange={(e) =>
                        handleProductChange(category.id, "attributes", [
                          {
                            id: parseInt(e.target.value, 10),
                            value:
                              groupedProducts[category.id]
                                ?.find(
                                  (p) =>
                                    p.id ===
                                    parseInt(
                                      selectedProducts[category.id].productId,
                                      10
                                    )
                                )
                                ?.attributes?.find(
                                  (attr) =>
                                    attr.id === parseInt(e.target.value, 10)
                                )?.value || "",
                          },
                        ])
                      }
                    >
                      <option value="">선택</option>
                      {groupedProducts[category.id]
                        ?.find(
                          (p) =>
                            p.id ===
                            parseInt(
                              selectedProducts[category.id].productId,
                              10
                            )
                        )
                        ?.attributes?.map((attr) => (
                          <option key={attr.id} value={attr.id}>
                            {attr.value}
                          </option>
                        ))}
                    </select>
                  )}
                </td>
                <td>
                  <Input
                    type="number"
                    min="0"
                    value={selectedProducts[category.id]?.quantity || 0}
                    onChange={(e) =>
                      handleProductChange(
                        category.id,
                        "quantity",
                        Math.max(0, parseInt(e.target.value, 10) || 0)
                      )
                    }
                    disabled={!selectedProducts[category.id]?.productId}
                  />
                </td>
                <td>
                  {(
                    (selectedProducts[category.id]?.price || 0) *
                    (selectedProducts[category.id]?.quantity || 0)
                  ).toLocaleString()}{" "}
                  원
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 결제정보 섹션 */}
      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>결제정보</h3>
        <PaymentTable
          payment={payments[0]}
          onPaymentChange={handlePaymentChange(0)}
          customerName={customerName}
          isEdit={false}
          label="선입금"
        />
        <PaymentTable
          payment={payments[1]}
          onPaymentChange={handlePaymentChange(1)}
          customerName={customerName}
          isEdit={false}
          label="잔금"
        />

        <div className={styles.calculator}>
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>상품 가격</h4>
            <p>{totalPrice.toLocaleString()} 원</p>
          </div>
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>선입금 총액</h4>
            <p className={styles.paid}>{prepaymentTotal.toLocaleString()} 원</p>
          </div>
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>잔금 총액</h4>
            <p className={styles.paid}>{balanceTotal.toLocaleString()} 원</p>
          </div>
          <hr className={styles.hr} />
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>총 잔액</h4>
            <p className={styles.rest}>
              {(totalPrice - prepaymentTotal - balanceTotal).toLocaleString()}{" "}
              원
            </p>
          </div>
        </div>
      </section>

      {/* 수선정보 섹션 */}
      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>수선정보</h3>
        {event?.form?.repairs &&
          chunk(event.form.repairs, 3).map((repairGroup, groupIndex) => (
            <div key={groupIndex} className={styles.sectionGroupWrap}>
              {repairGroup.map((repair) => {
                const alterationDetail = formData.alteration_details.find(
                  (detail) => detail.form_repair_id === repair.id
                );
                return (
                  <div key={repair.id} className={styles.sectionVerticalGroup}>
                    <h4 className={styles.sectionLabel}>
                      {repair.information}
                    </h4>
                    <div className={styles.alterationInputGroup}>
                      {/* 최종 길이 입력 필드 */}
                      <div className={styles.inputWrapper}>
                        <label className={styles.inputLabel}>최종 길이</label>
                        <div className={styles.sectionGroup}>
                          <input
                            type="number"
                            className={styles.numberInput}
                            step="0.1"
                            min="0"
                            value={(alterationDetail?.figure || 0).toFixed(1)}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || isNaN(value)) {
                                handleAlterationChange(repair.id, 0, "figure");
                                return;
                              }
                              const numValue = parseFloat(
                                parseFloat(value).toFixed(1)
                              );
                              handleAlterationChange(
                                repair.id,
                                numValue,
                                "figure"
                              );
                            }}
                            onKeyPress={(e) => {
                              if (!/[\d.-]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                          {repair.unit}
                        </div>
                      </div>

                      {/* 수선해야 될 길이 입력 필드 */}
                      <div className={styles.inputWrapper}>
                        <label className={styles.inputLabel}>수선 길이</label>
                        <div className={styles.sectionGroup}>
                          <input
                            type="number"
                            className={styles.numberInput}
                            step="0.1"
                            value={(
                              alterationDetail?.alterationFigure || 0
                            ).toFixed(1)}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || isNaN(value)) {
                                handleAlterationChange(
                                  repair.id,
                                  0,
                                  "alterationFigure"
                                );
                                return;
                              }
                              const numValue = parseFloat(
                                parseFloat(value).toFixed(1)
                              );
                              handleAlterationChange(
                                repair.id,
                                numValue,
                                "alterationFigure"
                              );
                            }}
                            onKeyPress={(e) => {
                              if (!/[\d.-]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                          {repair.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        <div className={styles.sectionValueWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>비고</h4>
            <textarea
              className={styles.optionalMessage}
              value={formData.alter_notes}
              onChange={(e) => handleAlterationNotes(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className={styles.actionButtonsWrap}>
        <Button
          type="button"
          onClick={() => handleSubmit(true)}
          className={styles.tempSaveButton}
          variant="primary"
        >
          임시 저장
        </Button>
        <Button
          type="submit"
          className={styles.submitButton}
          onClick={() => handleSubmit(false)}
        >
          작성 완료
        </Button>
      </div>

      <Modal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title="소속 선택 오류"
        message={affiliationError}
      />
    </>
  );
};

export default OrderCreateForm;
