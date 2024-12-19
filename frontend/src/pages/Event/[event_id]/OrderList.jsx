import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import styles from "./OrderList.module.css";
import { Filter, Pagination, Tab } from "../../../modules";
import { Button } from "../../../components";
import { ReactComponent as LeftArrow } from "../../../asset/icon/left_small.svg";
import {
  useEventDetails,
  useOrders,
  useAuthors,
  useAffiliations,
  useUpdateOrderStatus,
} from "../../../api/hooks";
import { utils, write } from 'xlsx';

const formatOrderStatus = (status) => {
  const statusMap = {
    Counsel: "상담",
    "Order Completed": "주문완료",
    "Packaging Completed": "포장완료",
    "Repair Received": "수선접수",
    "Repair Completed": "수선완료",
    "In delivery": "배송중",
    "Delivery completed": "배송완료",
    "Receipt completed": "수령완료",
    Accommodation: "숙소",
  };
  return statusMap[status] || status;
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

const exportOrdersToExcel = (orders, authors, affiliations, eventName = '', filename = 'orders.xlsx') => {
  // 엑셀에 표시할 열 정의
  const headers = [
    'ID',
    '작성자',
    '신랑',
    '신부',
    '소속',
    '수령방법',
    '주문상태',
    '주문일자',
    '총주문금액',
    '총결제금액',
    '결제자',
    '주소지'
  ];

  // 데이터 변환
  const excelData = orders.map(order => [
    order.id || '',
    authors[order.author_id] || order.author_id || '',
    order.groomName || '',
    order.brideName || '',
    affiliations[order.affiliation_id] || order.affiliation_id || '',
    getCollectionMethod(order.collectionMethod) || '',
    formatOrderStatus(order.status) || '',
    order.created_at ? new Date(order.created_at).toLocaleDateString('ko-KR') : '',
    order.totalPrice || 0,
    order.advancePayment || 0,
    order.payerName || '',
    order.address || ''
  ]);

  // 워크시트 생성
  const ws = utils.aoa_to_sheet([headers, ...excelData], { skipHeader: true });

  // 워크북 생성
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, eventName || '주문서 목록');

  // 열 너비 자동 조정
  const maxWidth = headers.map((h, idx) => 
    Math.max(
      h.length,
      ...excelData.map(row => String(row[idx]).length)
    )
  );

  ws['!cols'] = maxWidth.map(width => ({ width: width + 2 }));

  // 엑셀 파일 다운로드
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const OrderList = () => {
  const { event_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    order_date_from: null,
    order_date_to: null,
    is_temp: false,
    sort: "order_date_desc",
    event_name: "",
  });

  const itemsPerPage = 10;

  const { data: eventResponse, isLoading: eventLoading } = useEventDetails(
    event_id,
    {
      enabled: !!event_id,
    }
  );

  // 페이지네이션된 데이터를 위한 쿼리
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders(
    {
      ...filters,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    },
    {
      enabled: !!event_id && !!filters.event_name,
    }
  );

  // 전체 데이터를 위한 별도 쿼리
  const { data: allOrdersData, isLoading: allOrdersLoading } = useOrders(
    {
      ...filters,
      limit: 999999,
      offset: 0,
    },
    {
      enabled: !!event_id && !!filters.event_name,
    }
  );

  const { data: authorsData } = useAuthors();
  const { data: affiliationsData } = useAffiliations();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const authors = useMemo(
    () =>
      authorsData?.reduce(
        (acc, author) => ({ ...acc, [author.id]: author.name }),
        {}
      ) || {},
    [authorsData]
  );

  const affiliations = useMemo(
    () =>
      affiliationsData?.reduce(
        (acc, affiliation) => ({ ...acc, [affiliation.id]: affiliation.name }),
        {}
      ) || {},
    [affiliationsData]
  );

  // event_id 변경 시 필터 초기화
  useEffect(() => {
    if (event_id) {
      setCurrentPage(1);
      setFilters((prev) => ({
        search: "",
        status: "",
        order_date_from: null,
        order_date_to: null,
        is_temp: false,
        sort: "order_date_desc",
        event_name: prev.event_name,
      }));
    }
  }, [event_id]);

  // eventResponse 변경 시 event_name 업데이트
  useEffect(() => {
    if (eventResponse?.name) {
      console.log("Updating event_name from response:", eventResponse.name);
      setFilters((prev) => ({
        ...prev,
        event_name: eventResponse.name,
      }));
    }
  }, [eventResponse]);

  const handleExcelDownload = useCallback(() => {
    try {
      const allOrders = allOrdersData?.orders || [];
      exportOrdersToExcel(
        allOrders,
        authors,
        affiliations,
        eventResponse?.name,
        `주문서목록_${eventResponse?.name}_${new Date().toLocaleDateString('ko-KR')}.xlsx`
      );
    } catch (error) {
      console.error("Excel download failed:", error);
      alert("엑셀 다운로드에 실패했습니다. 다시 시도해주세요.");
    }
  }, [allOrdersData, authors, affiliations, eventResponse]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSort = useCallback((key) => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === `${key}_asc` ? `${key}_desc` : `${key}_asc`,
    }));
  }, []);

  const handleOrderStatusChange = useCallback(
    (event, orderId) => {
      event.stopPropagation();
      const newStatus = event.target.value;
      updateOrderStatusMutation.mutate(
        { orderId, status: newStatus },
        {
          onSuccess: () => {
            console.log(`Order ${orderId} status updated to ${newStatus}`);
          },
          onError: (error) => {
            console.error("Failed to update order status:", error);
            alert("주문 상태 업데이트에 실패했습니다. 다시 시도해주세요.");
          },
        }
      );
    },
    [updateOrderStatusMutation]
  );

  const handleRowClick = useCallback(
    (event, order) => {
      if (event.target.tagName.toLowerCase() !== "select") {
        navigate(`/event/${event_id}/${order.id}`);
      }
    },
    [navigate, event_id]
  );

  const handleTabChange = (tabName) => {
    setFilters((prev) => ({
      ...prev,
      is_temp: tabName === "tab2",
    }));
    setCurrentPage(1);
  };

  const renderTable = (items) => (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">작성자</th>
          <th scope="col">신랑</th>
          <th scope="col">신부</th>
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
        </tr>
      </thead>
      <tbody>
        {ordersLoading ? (
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
              onClick={(event) => handleRowClick(event, order)}
              className={styles.orderLink}
            >
              <td>{order.id || "-"}</td>
              <td>{authors[order.author_id] || order.author_id || "-"}</td>
              <td>{order.groomName || "-"}</td>
              <td>{order.brideName || "-"}</td>
              <td>
                {affiliations[order.affiliation_id] ||
                  order.affiliation_id ||
                  "-"}
              </td>
              <td>{getCollectionMethod(order.collectionMethod) || "-"}</td>
              <td>
                <select
                  name={`order_${order.id}`}
                  className={styles.orderStatus}
                  value={order.status}
                  onChange={(event) => handleOrderStatusChange(event, order.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Counsel">상담</option>
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
              <td>{new Date(order.created_at).toLocaleDateString("ko-KR")}</td>
              <td>{order.totalPrice || "-"}</td>
              <td>{order.advancePayment || "-"}</td>
              <td>{order.payerName || "-"}</td>
              <td>{order.address || "-"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className={styles.orderListTableBackground}>
      <section className={styles.tableWrap}>
        <div className={styles.tableTitleWrap}>
          <Link to="/event">
            <LeftArrow />
          </Link>
          <h2 className={styles.tableTitle}>
            {eventLoading
              ? "Loading..."
              : !eventResponse
              ? "이벤트 정보를 불러오는데 실패했습니다."
              : `[${eventResponse.name}] 주문서 목록`}
          </h2>
        </div>
        <Tab defaultActiveTab="tab1" onTabChange={handleTabChange}>
          <Tab.TabPane name="tab1" tab="주문서 목록">
            <Filter
              filters={filters}
              setFilters={setFilters}
              isAdminPage={false}
              currentEventName={eventResponse?.name || ""}
            />
            <div className={styles.actionButtonsWrap}>
              <Button
                label="Excel 저장"
                className={styles.excelButton}
                onClick={handleExcelDownload}
                disabled={ordersLoading || allOrdersLoading}
              />
              <Link
                to={`/event/${event_id}/create`}
                className={styles.newOrderLink}
              >
                주문서 작성
              </Link>
            </div>
            {renderTable(ordersData?.orders || [])}
            <Pagination
              className={styles.pagination}
              currentPage={currentPage}
              totalItems={ordersData?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </Tab.TabPane>
          <Tab.TabPane name="tab2" tab="임시저장 목록">
            <Filter
              filters={filters}
              setFilters={setFilters}
              isAdminPage={false}
              currentEventName={eventResponse?.name || ""}
            />
            <div className={styles.actionButtonsWrap}>
              <Button
                label="Excel 저장"
                className={styles.excelButton}
                onClick={handleExcelDownload}
                disabled={ordersLoading || allOrdersLoading}
              />
              <Link
                to={`/event/${event_id}/create`}
                className={styles.newOrderLink}
              >
                주문서 작성
              </Link>
            </div>
            {renderTable(ordersData?.orders || [])}
            <Pagination
              className={styles.pagination}
              currentPage={currentPage}
              totalItems={ordersData?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </Tab.TabPane>
        </Tab>
      </section>
    </div>
  );
};