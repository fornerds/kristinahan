import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./OrderList.module.css";
import {
  EventSelectionModal,
  Filter,
  Pagination,
  Tab,
  TabNavigation,
} from "../../../modules";
import { Button } from "../../../components";
import {
  useCurrentEvents,
  useOrders,
  useAuthors,
  useAffiliations,
  useUpdateOrderStatus,
} from "../../../api/hooks";
import { utils, write } from 'xlsx';

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

const getKoreanStatus = (status) => {
  const statusMap = {
    'Counsel': '상담',
    'Order Completed': '주문완료',
    'Packaging Completed': '포장완료',
    'Repair Received': '수선접수',
    'Repair Completed': '수선완료',
    'In delivery': '배송중',
    'Delivery completed': '배송완료',
    'Receipt completed': '수령완료',
    'Accommodation': '숙소'
  };
  return statusMap[status] || status;
};

const formatCurrency = (amount) => {
  return amount ? amount.toLocaleString('ko-KR') : '0';
};

const exportOrdersToExcel = (orders, authors, affiliations, filename = 'orders.xlsx') => {
  // 엑셀에 표시할 열 정의
  const headers = {
    id: 'ID',
    author: '작성자',
    groomName: '신랑',
    brideName: '신부',
    affiliation: '소속',
    collectionMethod: '수령방법',
    status: '주문상태',
    created_at: '주문일자',
    totalPrice: '총주문금액',
    totalPayment: '총결제금액',
    payer: '결제자',
    address: '주소지',
    event_name: '행사',
    products: '상품정보',
    notes: '비고',
    alter_notes: '수선내용'
  };

  // 데이터 변환
  const excelData = orders.map(order => ({
    id: order.id || '',
    author: authors[order.author_id] || order.author_id || '',
    groomName: order.groomName || '',
    brideName: order.brideName || '',
    affiliation: affiliations[order.affiliation_id] || order.affiliation_id || '',
    collectionMethod: getCollectionMethod(order.collectionMethod) || '',
    status: getKoreanStatus(order.status) || '',
    created_at: order.created_at ? new Date(order.created_at).toLocaleDateString('ko-KR') : '',
    totalPrice: formatCurrency(order.totalPrice),
    totalPayment: formatCurrency(order.advancePayment + order.balancePayment),
    payer: order?.payments?.[0]?.payer || '',
    address: order.address || '',
    event_name: order.event_name || '',
    products: order.orderItems?.map((item, index) => 
      `상품${index + 1}: ${item.product.name}, 사이즈: ${item.attributes[0]?.value || '-'}, 수량: ${item.quantity}개`
    ).join('\n') || '',
    notes: order.notes || '',
    alter_notes: order.alter_notes || ''
  }));

  // 워크시트 생성
  const ws = utils.json_to_sheet([
    Object.values(headers), // 헤더 행
    ...excelData.map(row => Object.values(row)) // 데이터 행
  ], { skipHeader: true });

  // 워크북 생성
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, '주문서 목록');

  // 열 너비 자동 조정
  const maxWidth = {};
  Object.keys(headers).forEach((key, index) => {
    maxWidth[index] = Math.max(
      headers[key].length * 2, // 헤더 길이
      ...excelData.map(row => {
        const cellContent = String(row[key] || '');
        const lines = cellContent.split('\n');
        return Math.max(...lines.map(line => line.length));
      })
    );
  });

  // 열 너비 설정
  ws['!cols'] = Object.values(maxWidth).map(width => ({
    width: Math.min(Math.max(width, 8), 50) // 최소 8, 최대 50
  }));

  // 셀 스타일 설정
  const range = utils.decode_range(ws['!ref']);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell_address = utils.encode_cell({ r: R, c: C });
      const cell = ws[cell_address];
      
      if (!cell) continue;

      // 기본 스타일 설정
      cell.s = {
        alignment: {
          vertical: 'center',
          horizontal: 'center',
          wrapText: true
        },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        },
        font: { name: '맑은 고딕' }
      };

      // 헤더 행 스타일
      if (R === 0) {
        cell.s.fill = { fgColor: { rgb: "FFE5E5E5" } };
        cell.s.font.bold = true;
      }

      // 금액 컬럼 스타일 (우측 정렬)
      if (['총주문금액', '총결제금액'].includes(headers[Object.keys(headers)[C]])) {
        cell.s.alignment.horizontal = 'right';
      }

      // 텍스트가 긴 컬럼 스타일 (좌측 정렬)
      if (['상품정보', '비고', '수선내용'].includes(headers[Object.keys(headers)[C]])) {
        cell.s.alignment.horizontal = 'left';
      }
    }
  }

  // 엑셀 파일 다운로드
  const excelBuffer = write(wb, { 
    bookType: 'xlsx', 
    type: 'array',
    cellStyles: true 
  });
  
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
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
  const navigate = useNavigate();
  const [isEventSelectionModalOpen, setIsEventSelectionModalOpen] = useState(false);
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

  // 데이터 fetching hooks
  const { data: events } = useCurrentEvents();
  
  // 페이지네이션된 데이터를 위한 쿼리
  const { data: ordersData, isLoading: ordersLoading } = useOrders(
    {
      ...filters,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );

  // 전체 데이터를 위한 별도 쿼리
  const { data: allOrdersData, isLoading: allOrdersLoading } = useOrders(
    {
      ...filters,
      limit: 999999,  // 충분히 큰 숫자로 설정
      offset: 0,
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );

  const { data: authorsData } = useAuthors();
  const { data: affiliationsData } = useAffiliations();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // 데이터 변환 메모이제이션
  const authors = useMemo(
    () =>
      authorsData?.reduce(
        (acc, author) => ({
          ...acc,
          [author.id]: author.name,
        }),
        {}
      ) || {},
    [authorsData]
  );

  const affiliations = useMemo(
    () =>
      affiliationsData?.reduce(
        (acc, affiliation) => ({
          ...acc,
          [affiliation.id]: affiliation.name,
        }),
        {}
      ) || {},
    [affiliationsData]
  );

  const orders = ordersData?.orders || [];
  const total = ordersData?.total || 0;

  // filters 변경 모니터링
  useEffect(() => {
    console.log("Filters changed:", filters);
    console.log("allOrdersData", allOrdersData);
    console.log("authors", authors)
    console.log("affiliations", affiliations);
    
  }, [filters]);

  // Event Handlers
  const handleEventSelection = useCallback(
    (eventId, eventName) => {
      navigate(`/admin/order/create/${eventId}`);
      setIsEventSelectionModalOpen(false);
    },
    [navigate]
  );

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleSort = useCallback((key) => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === `${key}_asc` ? `${key}_desc` : `${key}_asc`,
    }));
  }, []);

  const handleOrderStatusChange = useCallback(
    async (event, orderId) => {
      event.stopPropagation();
      const newStatus = event.target.value;
      try {
        await updateOrderStatusMutation.mutateAsync({
          orderId,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update order status:", error);
        alert("주문 상태 업데이트에 실패했습니다. 다시 시도해주세요.");
      }
    },
    [updateOrderStatusMutation]
  );

  const handleExcelDownload = useCallback(async () => {
    try {
      const allOrders = allOrdersData?.orders || [];
      exportOrdersToExcel(
        allOrders,
        authors,
        affiliations,
        `주문서목록_${new Date().toLocaleDateString()}.xlsx`
      );
    } catch (error) {
      console.error("Excel download failed:", error);
      alert("엑셀 다운로드에 실패했습니다. 다시 시도해주세요.");
    }
  }, [allOrdersData, authors, affiliations]);

  const handleTabChange = useCallback((tabName) => {
    setFilters((prev) => ({
      ...initialFilters,
      event_name: prev.event_name,
      is_temp: tabName === "tab2",
    }));
    setCurrentPage(1);
  }, []);

  const handleRowClick = useCallback(
    (order) => {
      navigate(`/admin/order/${order.event_id}/${order.id}`);
    },
    [navigate]
  );

  const renderTable = useCallback(
    (items) => (
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
              {filters.sort?.includes("order_date") &&
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
          {ordersLoading ? (
            <tr>
              <td colSpan="12" className={styles.loadingMessageWrap}>
                데이터를 불러오는 중입니다...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan="12" className={styles.noDataMessageWrap}>
                조회된 주문서가 없습니다.
              </td>
            </tr>
          ) : (
            items.map((order) => (
              <tr
                key={order.id}
                onClick={() => handleRowClick(order)}
                className={styles.orderLink}
              >
                <td>{order.id || "-"}</td>
                <td>{authors?.[order.author_id] || order.author_id || "-"}</td>
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
                    value={order.status}
                    onChange={(event) =>
                      handleOrderStatusChange(event, order.id)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className={styles.orderStatus}
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
                <td>
                  {new Date(order.created_at).toLocaleDateString() || "-"}
                </td>
                <td>{order.totalPrice || "-"}</td>
                <td>{order.advancePayment + order.balancePayment || "-"}</td>
                <td>{order.payments?.[0]?.payer || "-"}</td>
                <td>{order.address || "-"}</td>
                <td>{order.event_name || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    ),
    [
      filters,
      ordersLoading,
      authors,
      affiliations,
      handleSort,
      handleOrderStatusChange,
      handleRowClick,
    ]
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
                <Button
                  label="Excel 저장"
                  className={styles.excelButton}
                  onClick={handleExcelDownload}
                  disabled={ordersLoading || allOrdersLoading}
                />
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
              <Filter
                filters={filters}
                setFilters={setFilters}
                isAdminPage={true}
              />
              <div className={styles.actionButtonsWrap}>
                <Button
                  label="Excel 저장"
                  className={styles.excelButton}
                  onClick={handleExcelDownload}
                  disabled={ordersLoading || allOrdersLoading}
                />
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
          </Tab>
        </section>
      </main>
      <EventSelectionModal
        isOpen={isEventSelectionModalOpen}
        onClose={() => setIsEventSelectionModalOpen(false)}
        onSelectEvent={handleEventSelection}
        events={events || []}
        navigate={navigate}
      />
    </div>
  );
};