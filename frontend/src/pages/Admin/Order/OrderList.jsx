import { useNavigate } from "react-router-dom";
import { Button, Link } from "../../../components"
import { ReactComponent as DeleteIcon } from '../../../asset/icon/delete.svg'
import { EventSelectionModal, Filter, Modal, Pagination, Tab, TabNavigation } from "../../../modules"
import styles from "./OrderList.module.css"
import { useCallback, useEffect, useState } from "react";

const fetchOrderData = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const events = [
          { id: '1', name: '2024년 행사' },
          { id: '2', name: '2025년 행사' },
          { id: '3', name: '2026년 행사' },
          { id: '4', name: '2027년 행사' },
          { id: '5', name: '2028년 행사' },
        ];
  
        const generateRandomOrder = (id) => {
          const randomDate = new Date();
          randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
          return {
            id,
            writer: ['이범찬', '김유정', '사키코', '윤정은', '김도영', '서다희', '김화언'][Math.floor(Math.random() * 7)],
            customer: ['김철수', '김영희', '박서준', '이승현', '이재훈', '서민혁', '신우재', '권소희'][Math.floor(Math.random() * 8)],
            relation: ['한국-한국', '한국-일본', '한국-국제', '일본-한국', '일본-일본', '일본-국제', '국제-한국', '국제-일본', '국제-국제'][Math.floor(Math.random() * 9)],
            takeout: ['배송', '현장수령', '매장수령'][Math.floor(Math.random() * 3)],
            order_status: ['주문완료','포장완료','수선접수','수선완료','배송중','배송완료','수령완료','숙소'][Math.floor(Math.random() * 8)],
            order_date: randomDate,
            total_cost: ['750,000', '1,500,000', '3,000,000'][Math.floor(Math.random() * 3)],
            total_paid: ['0', '750,000', '1,500,000', '3,000,000'][Math.floor(Math.random() * 4)],
            buyer: ['김철수', '김영희', '박서준', '이승현', '이재훈', '서민혁', '신우재', '권소희'][Math.floor(Math.random() * 8)],
            address: ['서울시 송파구 삼전동', '서울시 동대문구 회기동', 'OGAWACHO KODAIRA SHI TOKYO', 'Washington Sq South, New York, New York'][Math.floor(Math.random() * 4)],
            event: events[Math.floor(Math.random() * events.length)],
          };
        };
  
        const orders = Array.from({ length: 24 }, (_, i) => generateRandomOrder(i + 1));
        const drafts = Array.from({ length: 3 }, (_, i) => generateRandomOrder(i + 100));
  
        resolve({ events, orders, drafts });
      }, 1000); // 1초 후에 데이터 반환
    });
};

export const OrderList = () => {
    const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEventSelectionModalOpen, setIsEventSelectionModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drafts, setDrafts] = useState([]);

  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [draftCurrentPage, setDraftCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'order_date', direction: 'desc' });
  const itemsPerPage = 10;

  const [currentEventItems, setCurrentEventItems] = useState([]);
  const [currentDraftItems, setCurrentDraftItems] = useState([]);

  useEffect(() => {
    fetchOrderData().then((data) => {
      setEvents(data.events);
      setOrders(data.orders);
      setDrafts(data.drafts);
    });
  }, []);

  useEffect(() => {
    const sortedEventList = sortItems(orders);
    const indexOfLastOrderItem = orderCurrentPage * itemsPerPage;
    const indexOfFirstOrderItem = indexOfLastOrderItem - itemsPerPage;
    setCurrentEventItems(sortedEventList.slice(indexOfFirstOrderItem, indexOfLastOrderItem));
  }, [orders, orderCurrentPage, sortConfig]);

  useEffect(() => {
    const sortedDraftList = sortItems(drafts);
    const indexOfLastDraftItem = draftCurrentPage * itemsPerPage;
    const indexOfFirstDraftItem = indexOfLastDraftItem - itemsPerPage;
    setCurrentDraftItems(sortedDraftList.slice(indexOfFirstDraftItem, indexOfLastDraftItem));
  }, [drafts, draftCurrentPage, sortConfig]);

  const handleEventSelection = (selectedEventId, selectedEventName) => {
    navigate(`/admin/order/create/${selectedEventId}`, { state: { event_name: selectedEventName } });
  };    

    const handleOrderPageChange = (page) => {
        setOrderCurrentPage(page)
    }

    const handleDraftPageChange = (page) => {
        setDraftCurrentPage(page)
    }

    const handleSort = useCallback((key) => {
        setSortConfig(prevConfig => ({
        key,
        direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }))
    }, [])

    const handleOrderStatusChange = useCallback((event, id, isDraft = false) => {
        event.stopPropagation(); // 이벤트 전파 방지
        const newStatus = event.target.value;
        const updateOrders = (prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, order_status: newStatus } : order
          );
    
        if (isDraft) {
          setDrafts(updateOrders);
        } else {
          setOrders(updateOrders);
        }
      }, []);

    const handleDelete = useCallback((event, id, isDraft = false) => {
        event.stopPropagation(); // 이벤트 전파 방지
        setIsDeleteModalOpen(true)
        if (isDeleteModalOpen) {
            const updateOrders = (prevOrders) =>
            prevOrders.filter((order) => order.id !== id);

            if (isDraft) {
            setDrafts(updateOrders);
            } else {
            setOrders(updateOrders);
            }
        }
    }, []);

    const sortItems = (items) => {
        if (sortConfig.key) {
        return [...items].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        }
        return items;
    }

    const handleRowClick = (event, order) => {
        if (event.target.tagName.toLowerCase() !== 'select') {
            navigate(`/admin/order/${order.event.id}/${order.id}`, {
                state: { 
                    event_name: order.event.name
                }
            });
        }
    }

    const renderTable = (items, isDraft = false) => (
        <table className={styles.table}>
        <thead>
            <tr>
                <th scope="col">작성자</th>
                <th scope="col">주문자</th>
                <th scope="col">소속</th>
                <th scope="col">수령방법</th>
                <th scope="col">주문상태</th>
                <th scope="col" onClick={() => handleSort('order_date')} style={{cursor: 'pointer'}}>
                    주문일자 {sortConfig.key === 'order_date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th scope="col">총주문금액</th>
                <th scope="col">총결제금액</th>
                <th scope="col">결제자</th>
                <th scope="col">주소지</th>
                <th scope="col">행사</th>
                <th scope="col">삭제</th>
            </tr>
        </thead>
        <tbody>
            {items.map((order) => (
            <tr key={order.id} onClick={(event)=> handleRowClick(event, order)} className={styles.orderLink}>
                <td>{order.writer}</td>
                <td>{order.customer}</td>
                <td>{order.relation}</td>
                <td>{order.takeout}</td>
                <td>
                    <select 
                        name={`order_${order.id}`} 
                        id={`order_${order.id}`} 
                        className={styles.orderStatus}
                        value={order.order_status}
                        onChange={(event) => handleOrderStatusChange(event, order.id, isDraft)}
                    >
                    <option value="주문완료">주문완료</option>
                    <option value="포장완료">포장완료</option>
                    <option value="수선접수">수선접수</option>
                    <option value="수선완료">수선완료</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                    <option value="수령완료">수령완료</option>
                    <option value="숙소">숙소</option>
                </select>
                </td>
                <td>{order.order_date.toLocaleDateString("ko-KR")}</td>
                <td>{order.total_cost}</td>
                <td>{order.total_paid}</td>
                <td>{order.buyer}</td>
                <td>{order.address}</td>
                <td>{order.event.name}</td>
                <td>
                    <Button onClick={(event) => handleDelete(event, order.id, isDraft)} className={styles.deleteButton} variant="danger">
                        <DeleteIcon />
                    </Button>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    )    

    return (
        <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>주문서 목록</h2>
        <section className={styles.section}>
          <Tab defaultActiveTab="tab1">
            <Tab.TabPane name="tab1" tab="주문서 목록">
              <Filter />
              <div className={styles.actionButtonsWrap}>
                <Button label="Excel 저장" className={styles.excelButton} />
                <Button 
                  label="주문서 작성" 
                  className={styles.newOrderButton}
                  onClick={() => setIsEventSelectionModalOpen(true)}
                />
              </div>
              {renderTable(currentEventItems)}
              <Pagination
                className={styles.pagination}
                totalItems={orders.length}
                itemsPerPage={itemsPerPage}
                currentPage={orderCurrentPage}
                onPageChange={handleOrderPageChange}
              />
            </Tab.TabPane>
            <Tab.TabPane name="tab2" tab="임시저장 목록">
                    <Filter />
                    <div className={styles.actionButtonsWrap}>
                        <Button label="Excel 저장" className={styles.excelButton} />
                        <Button 
                            label="주문서 작성" 
                            className={styles.newOrderButton}
                            onClick={() => setIsEventSelectionModalOpen(true)}
                            />
                    </div>
                    {renderTable(currentDraftItems, true)}
                    <Pagination
                        className={styles.pagination}
                        totalItems={drafts.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={draftCurrentPage}
                        onPageChange={handleDraftPageChange}
                    />
                    </Tab.TabPane>
                </Tab>
                </section>
            </main>
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="주문서 삭제 알림"
                message="정말 해당 주문서를 삭제하시겠습니까"
                confirmLabel="확인"
                cancelLabel="취소"
                onConfirm={() => {}}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
            <EventSelectionModal
                isOpen={isEventSelectionModalOpen}
                onClose={() => setIsEventSelectionModalOpen(false)}
                onSelectEvent={handleEventSelection}
                events={events}
            />
        </div>
    )
}