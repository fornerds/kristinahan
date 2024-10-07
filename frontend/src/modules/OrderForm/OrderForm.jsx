import React, { useState, useEffect, useCallback } from "react";
import * as api from "../../api/api";
import { useQueries } from "react-query";
import { Button, Input } from "../../components";
import PaymentTable from "./PaymentTable/PaymentTable";
import styles from "./OrderForm.module.css";
import {
  useSaveOrder,
  useSaveTempOrder,
  useOrderDetails,
  useAuthors,
  useAffiliations,
  useEventDetails,
  useFormDetails,
  useCategories,
} from "../../api/hooks";

const ORDER_STATUS_MAP = {
  "Order Completed": "주문완료",
  "Packaging Completed": "포장완료",
  "Repair Received": "수선접수",
  "Repair Completed": "수선완료",
  "In delivery": "배송중",
  "Delivery completed": "배송완료",
  "Receipt completed": "수령완료",
  Accommodation: "숙소",
};

export const OrderForm = ({
  event_id,
  isEdit,
  orderId,
  onSave,
  onComplete,
}) => {
  const { data: event, isLoading: isEventLoading } = useEventDetails(event_id);

  const [formData, setFormData] = useState({
    event_id: event_id,
    author_id: "",
    affiliation_id: "",
    orderName: "",
    contact: "",
    address: "",
    collectionMethod: "",
    notes: "",
    totalPrice: 0,
    advancePayment: 0,
    balancePayment: 0,
    isTemporary: false,
    status: "",
    orderItems: [],
    payments: [],
    alteration_details: {
      jacketSleeve: 0,
      jacketLength: 0,
      jacketForm: 0,
      pantsCircumference: 0,
      pantsLength: 0,
      shirtNeck: 0,
      shirtSleeve: 0,
      dressBackForm: 0,
      dressLength: 0,
      notes: "",
    },
  });

  const [customerName, setCustomerName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [isPayerSameAsCustomer, setIsPayerSameAsCustomer] = useState(false);
  const [prepaymentTotal, setPrepaymentTotal] = useState(0);
  const [balanceTotal, setBalanceTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [groupedProducts, setGroupedProducts] = useState({});
  const [payments, setPayments] = useState([
    {
      payment_date: null,
      paymentMethod: "advance",
      cashAmount: 0,
      cashCurrency: "KRW",
      cashConvertedAmount: 0,
      cardAmount: 0,
      cardCurrency: "KRW",
      cardConvertedAmount: 0,
      tradeInAmount: 0,
      tradeInCurrency: "GOLD_24K",
      tradeInConvertedAmount: 0,
      notes: "",
      payerName: "",
    },
    {
      payment_date: null,
      paymentMethod: "balance",
      cashAmount: 0,
      cashCurrency: "KRW",
      cashConvertedAmount: 0,
      cardAmount: 0,
      cardCurrency: "KRW",
      cardConvertedAmount: 0,
      tradeInAmount: 0,
      tradeInCurrency: "GOLD_24K",
      tradeInConvertedAmount: 0,
      notes: "",
      payerName: "",
    },
  ]);

  const saveOrderMutation = useSaveOrder();
  const saveTempOrderMutation = useSaveTempOrder();
  const {
    data: orderData,
    isLoading: isLoadingOrderDetails,
    error: orderDetailsError,
  } = useOrderDetails(orderId, { enabled: isEdit });

  const orderDetails = orderData?.data;
  const eventData = event?.data;
  const formId = orderDetails?.form?.id;

  const { data: formDetailData, isLoading: isLoadingFormDetails } =
    useFormDetails(formId);

  const formDetails = formDetailData?.data;

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories();
  const categoriesData = categories?.data;

  const { data: authors, isLoading: isLoadingAuthors } = useAuthors();
  const { data: affiliations, isLoading: isLoadingAffiliations } =
    useAffiliations();

  useEffect(() => {
    if (isEdit && orderDetails) {
      setFormData({
        ...orderDetails,
        alteration_details: orderDetails.alteration_details[0] || {},
      });
      setCustomerName(orderDetails.orderName);
      setTotalPrice(orderDetails.totalPrice);
      setPrepaymentTotal(orderDetails.advancePayment);
      setBalanceTotal(orderDetails.balancePayment);

      // orderItems 처리 수정
      const products = {};
      console.log("orderDetails.orderItems:", orderDetails.orderItems);
      orderDetails.orderItems.forEach((item, index) => {
        console.log(`Processing item ${index}:`, item);
        products[index] = {
          categoryId: item.product.category_id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          attributeId: item.attributes[0]?.attribute_id,
          attributes: item.attributes,
        };
      });
      console.log("Initialized selectedProducts:", products);
      setSelectedProducts(products);

      // payments 처리
      if (orderDetails.payments.length >= 2) {
        setPayments([
          {
            ...orderDetails.payments[0],
            payerName: orderDetails.payments[0].payer,
          },
          {
            ...orderDetails.payments[1],
            payerName: orderDetails.payments[1].payer,
          },
        ]);
      }
    }
  }, [isEdit, orderDetails]);

  useEffect(() => {
    if (event?.data && categories && !isEdit) {
      const newGroupedProducts = {};
      event.data.form.categories.forEach((eventCategory) => {
        const category = categories.data.find((c) => c.id === eventCategory.id);
        if (category) {
          newGroupedProducts[category.id] = category.products;
        }
      });
      setGroupedProducts(newGroupedProducts);
      // console.log("Grouped Products:", newGroupedProducts); // 추가된 로그
    }
  }, [event, categories, isEdit]);

  useEffect(() => {
    if (isPayerSameAsCustomer) {
      setPayerName(customerName);
    }
  }, [isPayerSameAsCustomer, customerName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleContactChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, contact: value }));
  };

  const handleAffiliationChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, affiliation_id: value }));
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

  const handlePaymentChange = useCallback(
    (index) => (updatedPayment) => {
      setPayments((prev) => {
        const newPayments = [...prev];
        newPayments[index] = {
          ...updatedPayment,
          cashConvertedAmount: Number(updatedPayment.cashConvertedAmount) || 0,
          cardConvertedAmount: Number(updatedPayment.cardConvertedAmount) || 0,
          tradeInConvertedAmount:
            Number(updatedPayment.tradeInConvertedAmount) || 0,
        };
        return newPayments;
      });
    },
    []
  );

  const handleAlterationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      alteration_details: {
        ...prev.alteration_details,
        [field]: field === "notes" ? value : Number(value) || 0,
      },
    }));
  };

  const handleCustomerNameChange = useCallback(
    (e) => {
      setCustomerName(e.target.value);
      setFormData((prev) => ({ ...prev, orderName: e.target.value }));
      if (isPayerSameAsCustomer) {
        setPayerName(e.target.value);
      }
    },
    [isPayerSameAsCustomer]
  );

  const handleProductChange = useCallback(
    (categoryId, field, value) => {
      setSelectedProducts((prev) => {
        const newState = { ...prev };
        const existingProductIndex = Object.keys(newState).find(
          (key) => newState[key].categoryId === categoryId
        );

        if (existingProductIndex !== undefined) {
          newState[existingProductIndex] = {
            ...newState[existingProductIndex],
            [field]: value,
          };
        } else {
          const newIndex = Object.keys(newState).length;
          newState[newIndex] = {
            categoryId,
            [field]: value,
          };
        }

        if (field === "productName") {
          const category = categoriesData.find((c) => c.id === categoryId);
          const selectedProduct = category?.products.find(
            (p) => p.name === value
          );
          if (selectedProduct) {
            const productIndex =
              existingProductIndex || Object.keys(newState).length - 1;
            newState[productIndex] = {
              ...newState[productIndex],
              productName: value,
              price: selectedProduct.price,
              attributeId: "", // Reset attribute selection
              quantity: 1, // Reset quantity
            };
          }
        }

        if (field === "attributeId") {
          const category = categoriesData.find((c) => c.id === categoryId);
          const selectedProduct = category?.products.find(
            (p) => p.name === newState[existingProductIndex].productName
          );
          const selectedAttribute = selectedProduct?.attributes.find(
            (attr) => attr.attribute_id.toString() === value
          );
          if (selectedAttribute) {
            newState[existingProductIndex].attributeValue =
              selectedAttribute.value;
          }
        }

        console.log("Updated selectedProducts:", newState);
        return newState;
      });
    },
    [categoriesData]
  );

  useEffect(() => {
    const calculateTotal = (payment) => {
      const cash = Number(payment.cashConvertedAmount) || 0;
      const card = Number(payment.cardConvertedAmount) || 0;
      const tradeIn = Number(payment.tradeInConvertedAmount) || 0;
      return cash + card + tradeIn;
    };

    const advance =
      payments.find((p) => p.paymentMethod === "advance") || payments[0];
    const balance =
      payments.find((p) => p.paymentMethod === "balance") || payments[1];

    const advanceTotal = calculateTotal(advance);
    const balanceTotal = calculateTotal(balance);

    setFormData((prev) => ({
      ...prev,
      advancePayment: advanceTotal,
      balancePayment: balanceTotal,
    }));

    setPrepaymentTotal(advanceTotal);
    setBalanceTotal(balanceTotal);
  }, [payments]);

  useEffect(() => {
    const newTotalPrice = Object.values(selectedProducts).reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    setTotalPrice(newTotalPrice);
    setFormData((prev) => ({ ...prev, totalPrice: newTotalPrice }));
  }, [selectedProducts]);

  const handleSubmit = async (isTemp = false) => {
    const orderData = {
      event_id: Number(event_id),
      author_id: Number(formData.author_id),
      modifier_id: Number(formData.author_id),
      affiliation_id: Number(formData.affiliation_id),
      status: formData.status,
      orderName: formData.orderName || "",
      contact: formData.contact || "",
      address: formData.address || "",
      collectionMethod: formData.collectionMethod || "",
      notes: formData.notes || "",
      totalPrice: Number(totalPrice) || 0,
      advancePayment: Number(prepaymentTotal) || 0,
      balancePayment: Number(balanceTotal) || 0,
      payments: payments.map((payment) => ({
        payer: payment.payerName || "",
        payment_date: payment.payment_date,
        cashAmount: Number(payment.cashAmount) || 0,
        cashCurrency: payment.cashCurrency || "KRW",
        cardAmount: Number(payment.cardAmount) || 0,
        cardCurrency: payment.cardCurrency || "KRW",
        tradeInAmount: Number(payment.tradeInAmount) || 0,
        tradeInCurrency: payment.tradeInCurrency || "GOLD_24K",
        paymentMethod: payment.paymentMethod || "advance",
        notes: payment.notes || "",
      })),
      alteration_details: {
        jacketSleeve: Number(formData.alteration_details.jacketSleeve) || 0,
        jacketLength: Number(formData.alteration_details.jacketLength) || 0,
        jacketForm: Number(formData.alteration_details.jacketForm) || 0,
        pantsCircumference:
          Number(formData.alteration_details.pantsCircumference) || 0,
        pantsLength: Number(formData.alteration_details.pantsLength) || 0,
        shirtNeck: Number(formData.alteration_details.shirtNeck) || 0,
        shirtSleeve: Number(formData.alteration_details.shirtSleeve) || 0,
        dressBackForm: Number(formData.alteration_details.dressBackForm) || 0,
        dressLength: Number(formData.alteration_details.dressLength) || 0,
        notes: formData.alteration_details.notes || "",
      },
      orderItems: Object.entries(selectedProducts).map(
        ([categoryId, item]) => ({
          product_id: Number(item.productId),
          attributes_id: Number(item.attributeId),
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
        })
      ),
    };

    console.log("Submitting orderData:", orderData);

    try {
      if (isTemp) {
        await saveTempOrderMutation.mutateAsync({
          orderData,
          orderId: isEdit ? orderId : null,
          isTemp: true,
        });
        onSave();
      } else {
        await saveOrderMutation.mutateAsync({
          orderData,
          orderId: isEdit ? orderId : null,
          isTemp: false,
        });
        onComplete();
      }
    } catch (error) {
      console.error("Order save failed:", error);
      // 에러 처리 로직
    }
  };

  console.log("selectedProducts", selectedProducts);

  if (
    isLoadingOrderDetails ||
    isLoadingAuthors ||
    isLoadingAffiliations ||
    isEventLoading ||
    isLoadingCategories ||
    isLoadingFormDetails
  )
    return <div>Loading...</div>;

  if (orderDetailsError || categoriesError)
    return (
      <div>
        Error loading data: {(orderDetailsError || categoriesError)?.message}
      </div>
    );

  return (
    <>
      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>주문정보</h3>

        <div className={styles.sectionValueWrap}>
          <h4 className={styles.sectionLabel}>주문번호</h4>
          <p className={styles.sectionValue}>{formData.id || "새 주문"}</p>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>
              {isEdit ? "수정자" : "작성자"}
            </h4>
            <select
              name="author_id"
              id={styles.writer}
              onChange={handleInputChange}
              value={formData.author_id}
            >
              <option value="">작성자 선택</option>
              {authors?.data &&
                authors?.data.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>
              {isEdit ? "수정일자" : "작성일자"}
            </h4>
            <p className={styles.sectionValue}>
              {new Date().toLocaleDateString("ko-KR")}
            </p>
          </div>
          {isEdit && (
            <>
              <div className={styles.sectionGroup}>
                <h4 className={styles.sectionLabel}>작성자</h4>
                <p className={styles.sectionValue}>{orderDetails.author_id}</p>
              </div>
              <div className={styles.sectionGroup}>
                <h4 className={styles.sectionLabel}>작성일자</h4>
                <p className={styles.sectionValue}>
                  {new Date(orderDetails.created_at).toLocaleDateString(
                    "ko-KR"
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        <div className={styles.sectionGroupWrap}>
          <h4 className={styles.sectionLabel}>주문상태</h4>

          <form className={`${styles.sectionGroup} ${styles.statusWrap}`}>
            {Object.entries(ORDER_STATUS_MAP).map(([value, label]) => (
              <div key={value} className={styles.statusLable}>
                <input
                  type="radio"
                  name="status"
                  id={value}
                  value={value}
                  checked={formData.status === value}
                  onChange={handleStatusChange}
                />
                <label htmlFor={value}>{label}</label>
              </div>
            ))}
          </form>
        </div>
      </section>

      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>주문자정보</h3>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>주문자</h4>
            <Input
              type="text"
              className={styles.textInput}
              value={customerName}
              onChange={handleCustomerNameChange}
            />
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>연락처</h4>
            <Input
              type="tel"
              className={styles.textInput}
              name="contact"
              value={formData.contact}
              onChange={handleContactChange}
            />
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>소속</h4>
            <select
              name="affiliation_id"
              id={styles.relation}
              value={formData.affiliation_id}
              onChange={handleAffiliationChange}
            >
              <option value="">소속 선택</option>
              {affiliations?.data &&
                affiliations?.data.map((affiliation) => (
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
              name="address"
              value={formData.address}
              onChange={handleAddressChange}
            />
          </div>

          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>수령방법</h4>
            <select
              name="collectionMethod"
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
              name="notes"
              id="optionalMessage"
              className={styles.optionalMessage}
              value={formData.notes}
              onChange={handleNotesChange}
            ></textarea>
          </div>
        </div>
      </section>

      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>상품정보</h3>
        {categoriesData && categoriesData.length > 0 ? (
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
              {categoriesData.map((category) => {
                const selectedProduct = Object.values(selectedProducts).find(
                  (product) =>
                    product.productName &&
                    category.products.some(
                      (p) => p.name === product.productName
                    )
                );
                return (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>
                      <select
                        value={selectedProduct?.productName || ""}
                        onChange={(e) =>
                          handleProductChange(
                            category.id,
                            "productName",
                            e.target.value
                          )
                        }
                      >
                        <option value="">선택</option>
                        {category.products.map((product) => (
                          <option key={product.id} value={product.name}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={selectedProduct?.attributeId || ""}
                        onChange={(e) =>
                          handleProductChange(
                            category.id,
                            "attributeId",
                            e.target.value
                          )
                        }
                        disabled={!selectedProduct?.productName}
                      >
                        <option value="">선택</option>
                        {category.products
                          .find((p) => p.name === selectedProduct?.productName)
                          ?.attributes.map((attr) => (
                            <option
                              key={attr.attribute_id}
                              value={attr.attribute_id}
                              selected={
                                selectedProduct?.attributeId ===
                                attr.attribute_id
                              }
                            >
                              {attr.value}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <Input
                        type="number"
                        min="1"
                        value={selectedProduct?.quantity || 1}
                        onChange={(e) =>
                          handleProductChange(
                            category.id,
                            "quantity",
                            e.target.value
                          )
                        }
                        disabled={!selectedProduct?.productName}
                      />
                    </td>
                    <td>
                      {(
                        (selectedProduct?.price || 0) *
                        (selectedProduct?.quantity || 1)
                      ).toLocaleString()}{" "}
                      원
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>카테고리 정보가 없습니다.</p>
        )}
      </section>

      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>결제정보</h3>

        <PaymentTable
          payment={payments[0]}
          onPaymentChange={handlePaymentChange(0)}
          customerName={customerName}
          isEdit={isEdit}
        />
        <PaymentTable
          payment={payments[1]}
          onPaymentChange={handlePaymentChange(1)}
          customerName={customerName}
          isEdit={isEdit}
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

      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>수선정보</h3>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>자켓 소매</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="jacketSleeve"
                value={formData?.alteration_details?.jacketSleeve}
                onChange={(e) =>
                  handleAlterationChange("jacketSleeve", e.target.value)
                }
              />
              {orderDetails.form.jacketSleeve}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>자켓 기장</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="jacketLength"
                value={formData?.alteration_details?.jacketLength}
                onChange={(e) =>
                  handleAlterationChange("jacketLength", e.target.value)
                }
              />
              {orderDetails.form.jacketLength}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>자켓 폼</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="jacketForm"
                value={formData?.alteration_details?.jacketForm}
                onChange={(e) =>
                  handleAlterationChange("jacketForm", e.target.value)
                }
              />
              {orderDetails.form.jacketForm}
            </div>
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>셔츠 목</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="shirtNeck"
                value={formData?.alteration_details?.shirtNeck}
                onChange={(e) =>
                  handleAlterationChange("shirtNeck", e.target.value)
                }
              />
              {orderDetails.form.shirtNeck}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>셔츠 소매</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="shirtSleeve"
                value={formData?.alteration_details?.shirtSleeve}
                onChange={(e) =>
                  handleAlterationChange("shirtSleeve", e.target.value)
                }
              />
              {orderDetails.form.shirtSleeve}
            </div>
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>바지 둘레</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="pantsCircumference"
                value={formData?.alteration_details?.pantsCircumference}
                onChange={(e) =>
                  handleAlterationChange("pantsCircumference", e.target.value)
                }
              />
              {orderDetails.form.pantsCircumference}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>바지 길이</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="pantsLength"
                value={formData?.alteration_details?.pantsLength}
                onChange={(e) =>
                  handleAlterationChange("pantsLength", e.target.value)
                }
              />
              {orderDetails.form.pantsLength}
            </div>
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>드레스 뒷품</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="dressBackForm"
                value={formData?.alteration_details?.dressBackForm}
                onChange={(e) =>
                  handleAlterationChange("dressBackForm", e.target.value)
                }
              />
              {orderDetails.form.dressBackForm}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>드레스 기장</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="dressLength"
                value={formData?.alteration_details?.dressLength}
                onChange={(e) =>
                  handleAlterationChange("dressLength", e.target.value)
                }
              />
              {orderDetails.form.dressLength}
            </div>
          </div>
        </div>

        <div className={styles.sectionValueWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>비고</h4>
            <textarea
              name="alterationNotes"
              id="dressOptionalMessage"
              className={styles.optionalMessage}
              value={formData?.alteration_details?.notes}
              onChange={(e) => handleAlterationChange("notes", e.target.value)}
            ></textarea>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderForm;
