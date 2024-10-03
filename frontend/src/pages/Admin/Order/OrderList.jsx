import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Link } from "../../../components";
import {
  EventSelectionModal,
  Filter,
  Pagination,
  Tab,
  TabNavigation,
} from "../../../modules";
import styles from "./OrderList.module.css";
import {
  useCurrentEvents,
  useOrders,
  useAuthors,
  useAffiliations,
} from "../../../api/hooks";
import { updateOrderStatus } from "../../../api/api"; // 새로운 API 함수 import

export const OrderList = () => {
  const navigate = useNavigate();
  const [isEventSelectionModalOpen, setIsEventSelectionModalOpen] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const initialFilters = {
    search: "",
    status: "",
    order_date_from: null,
    order_date_to: null,
    is_temp: false,
    event_name: "",
    sort: "order_date_desc",
  };

  const [filters, setFilters] = useState(initialFilters);

  const itemsPerPage = 10;

  const { data: events, isLoading: eventsLoading } = useCurrentEvents();
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch,
  } = useOrders({
    ...filters,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    order_date_from: filters.order_date_from || undefined,
    order_date_to: filters.order_date_to || undefined,
  });
  const { data: authorsData, isLoading: authorsLoading } = useAuthors();
  const { data: affiliationsData, isLoading: affiliationsLoading } =
    useAffiliations();

  const authors = useMemo(() => {
    const authorsList = authorsData?.data || [];
    return authorsList.reduce(
      (acc, author) => ({ ...acc, [author.id]: author.name }),
      {}
    );
  }, [authorsData]);

  const affiliations = useMemo(() => {
    const affiliationsList = affiliationsData?.data || [];
    return affiliationsList.reduce(
      (acc, affiliation) => ({ ...acc, [affiliation.id]: affiliation.name }),
      {}
    );
  }, [affiliationsData]);

  const orders = ordersData?.data?.orders || [];
  const total = ordersData?.data?.total || 0;

  useEffect(() => {
    refetch();
  }, [filters, currentPage, refetch]);

  const handleEventSelection = (eventId, eventName) => {
    setFilters((prev) => ({ ...prev, event_name: eventName }));
    setIsEventSelectionModalOpen(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSort = (key) => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === `${key}_asc` ? `${key}_desc` : `${key}_asc`,
    }));
  };

  const handleTabChange = (tabName) => {
    setFilters({
      ...initialFilters,
      is_temp: tabName === "tab2",
    });
    setCurrentPage(1);
    refetch();
  };

  const getCollectionMethod = (method) => {
    switch (method) {
      case "Delivery":
        return "배송";
      case "Pickup on site":
        return "현장수령";
      case "Pickup in store":
        return "매장수령";
      default:
        return method;
    }
  };

  const handleOrderStatusChange = useCallback(
    async (event, orderId) => {
      event.stopPropagation();
      const newStatus = event.target.value;
      try {
        await updateOrderStatus(orderId, newStatus);
        // 성공적으로 업데이트되면 로컬 상태 갱신
        const updatedOrders = orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        // ordersData를 직접 수정할 수 없으므로 refetch를 호출
        refetch();
        console.log(`Order ${orderId} status updated to ${newStatus}`);
      } catch (error) {
        console.error("Failed to update order status:", error);
        // 에러 처리 (예: 사용자에게 알림)
        alert("주문 상태 업데이트에 실패했습니다. 다시 시도해주세요.");
      }
    },
    [orders, refetch]
  );

  const renderTable = (items) => (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">작성자</th>
          <th scope="col">주문자</th>
          <th scope="col">소속</th>
          <th scope="col">수령방법</th>
          <th scope="col">주문상태</th>
          <th
            scope="col"
            onClick={() => handleSort("order_date")}
            style={{ cursor: "pointer" }}
          >
            주문일자{" "}
            {filters.sort &&
              filters.sort.includes("order_date") &&
              (filters.sort === "order_date_asc" ? "▲" : "▼")}
          </th>
          <th scope="col">총주문금액</th>
          <th scope="col">총결제금액</th>
          <th scope="col">결제자</th>
          <th scope="col">주소지</th>
          <th scope="col">행사</th>
        </tr>
      </thead>
      <tbody>
        {ordersLoading || authorsLoading || affiliationsLoading ? (
          <tr>
            <td colSpan="11" className={styles.loadingMessageWrap}>
              데이터를 불러오는 중입니다...
            </td>
          </tr>
        ) : ordersError ? (
          <tr>
            <td colSpan="11" className={styles.errorMessageWrap}>
              주문서 데이터를 불러오는 데 실패했습니다.
              {ordersError.message && <p>오류 메시지: {ordersError.message}</p>}
            </td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan="11" className={styles.noDataMessageWrap}>
              조회된 주문서가 없습니다.
            </td>
          </tr>
        ) : (
          items.map((order) => (
            <tr
              key={order.id}
              onClick={() =>
                navigate(`/admin/order/${order.event_id}/${order.id}`)
              }
              className={styles.orderLink}
            >
              <td>{authors[order.author_id] || order.author_id}</td>
              <td>{order.orderName}</td>
              <td>
                {affiliations[order.affiliation_id] || order.affiliation_id}
              </td>
              <td>{getCollectionMethod(order.collectionMethod)}</td>
              <td>
                <select
                  name={`order_${order.id}`}
                  id={`order_${order.id}`}
                  className={styles.orderStatus}
                  value={order.status}
                  onChange={(event) => handleOrderStatusChange(event, order.id)}
                  onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
                >
                  <option value="Order Completed">주문완료</option>
                  <option value="Packaging Completed">포장완료</option>
                  <option value="Repair Received">수선접수</option>
                  <option value="Repair Completed">수선완료</option>
                  <option value="In delivery">배송중</option>
                  <option value="Delivery completed">배송완료</option>
                  <option value="Receipt completed">수령완료</option>
                  <option value="Accommodation">숙소</option>
                </select>
              </td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
              <td>{order.totalPrice}</td>
              <td>{order.advancePayment + order.balancePayment}</td>
              <td>{order.orderName}</td>
              <td>{order.address}</td>
              <td>{order.event_name}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>주문서 목록</h2>
        <section className={styles.section}>
          <Tab defaultActiveTab="tab1" onTabChange={handleTabChange}>
            <Tab.TabPane name="tab1" tab="주문서 목록">
              <Filter
                filters={filters}
                setFilters={setFilters}
                isAdminPage={true}
              />
              <div className={styles.actionButtonsWrap}>
                <Button label="Excel 저장" className={styles.excelButton} />
                <Button
                  label="주문서 작성"
                  className={styles.newOrderButton}
                  onClick={() => setIsEventSelectionModalOpen(true)}
                />
              </div>
              {renderTable(orders)}
              <Pagination
                className={styles.pagination}
                totalItems={total}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </Tab.TabPane>
            <Tab.TabPane name="tab2" tab="임시저장 목록">
              <Filter filters={filters} setFilters={setFilters} />
              <div className={styles.actionButtonsWrap}>
                <Button label="Excel 저장" className={styles.excelButton} />
                <Button
                  label="주문서 작성"
                  className={styles.newOrderButton}
                  onClick={() => setIsEventSelectionModalOpen(true)}
                />
              </div>
              {renderTable(orders)}
              <Pagination
                className={styles.pagination}
                currentPage={currentPage}
                totalItems={total}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </Tab.TabPane>
          </Tab>
        </section>
      </main>
      <EventSelectionModal
        isOpen={isEventSelectionModalOpen}
        onClose={() => setIsEventSelectionModalOpen(false)}
        onSelectEvent={handleEventSelection}
        events={events?.data || []}
        navigate={navigate}
      />
    </div>
  );
};
