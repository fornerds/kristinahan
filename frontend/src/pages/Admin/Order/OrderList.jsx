import React, { useState, useEffect } from "react";
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
import { useAllEvents, useOrders } from "../../../api/hooks";

export const OrderList = () => {
  const navigate = useNavigate();
  const [isEventSelectionModalOpen, setIsEventSelectionModalOpen] =
    useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    event_name: "",
    status: "",
    order_date_from: null,
    order_date_to: null,
    search: "",
    sort: "order_date_desc",
    is_temp: false,
  });

  const itemsPerPage = 10;

  const { data: events, isLoading: eventsLoading } = useAllEvents();
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch,
  } = useOrders({
    ...filters,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  useEffect(() => {
    refetch();
  }, [filters, currentPage]);

  const handleEventSelection = (eventId, eventName) => {
    setSelectedEvent({ id: eventId, name: eventName });
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
            {filters.sort.includes("order_date") &&
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
        {items.map((order) => (
          <tr
            key={order.id}
            onClick={() =>
              navigate(`/admin/order/${order.event_id}/${order.id}`)
            }
            className={styles.orderLink}
          >
            <td>{order.author_id}</td>
            <td>{order.orderName}</td>
            <td>{order.affiliation_id}</td>
            <td>{order.collectionMethod}</td>
            <td>{order.status}</td>
            <td>{new Date(order.created_at).toLocaleDateString()}</td>
            <td>{order.totalPrice}</td>
            <td>{order.advancePayment + order.balancePayment}</td>
            <td>{order.orderName}</td>
            <td>{order.address}</td>
            <td>{order.event_name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>주문서 목록</h2>
        {eventsLoading ? (
          <div>Loading events...</div>
        ) : (
          <section className={styles.section}>
            <Tab defaultActiveTab="tab1">
              <Tab.TabPane name="tab1" tab="주문서 목록">
                <Filter filters={filters} setFilters={setFilters} />
                <div className={styles.actionButtonsWrap}>
                  <Button label="Excel 저장" className={styles.excelButton} />
                  <Button
                    label="주문서 작성"
                    className={styles.newOrderButton}
                    onClick={() => setIsEventSelectionModalOpen(true)}
                  />
                </div>
                {ordersLoading ? (
                  <p>Loading orders...</p>
                ) : (
                  <>
                    {renderTable(ordersData?.orders || [])}
                    <Pagination
                      className={styles.pagination}
                      totalItems={ordersData?.total || 0}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </Tab.TabPane>
            </Tab>
          </section>
        )}
      </main>
      <EventSelectionModal
        isOpen={isEventSelectionModalOpen}
        onClose={() => setIsEventSelectionModalOpen(false)}
        onSelectEvent={handleEventSelection}
        events={events?.data || []}
      />
    </div>
  );
};
