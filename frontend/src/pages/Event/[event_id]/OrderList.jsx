import React, { useRef, useState, useCallback } from 'react'
import styles from "./OrderList.module.css"
import { Filter, Pagination, Tab } from "../../../modules"
import { Button, Link } from "../../../components"
import { useParams, useNavigate } from "react-router-dom";
import { ReactComponent as LeftArrow } from '../../../asset/icon/left_small.svg'

export const OrderList = () => {
  let { event_id } = useParams();
  const navigate = useNavigate();

  const [orderCurrentPage, setOrderCurrentPage] = useState(1)
  const [draftCurrentPage, setDraftCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: 'order_date', direction: 'desc' })
  const itemsPerPage = 10

  const generateRandomOrder = (id) => {
    const randomDate = new Date()
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365))
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
    }
  }

  const [orders, setOrders] = useState(Array.from({ length: 24 }, (_, i) => generateRandomOrder(i + 1)))
  const [drafts, setDrafts] = useState(Array.from({ length: 3 }, (_, i) => generateRandomOrder(i + 1)))

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

  const handleOrderStatusChange = useCallback((id, newStatus, isDraft = false) => {
    const updateOrders = (prevOrders) =>
      prevOrders.map(order => 
        order.id === id ? { ...order, order_status: newStatus } : order
      )
    
    if (isDraft) {
      setDrafts(updateOrders)
    } else {
      setOrders(updateOrders)
    }
  }, [])

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

  const handleRowClick = (order) => {
    navigate(`/event/${event_id}/${order.id}`)
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
        </tr>
      </thead>
      <tbody>
        {items.map((order) => (
          <tr key={order.id} onClick={()=> handleRowClick(order)} className={styles.orderLink}>
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
                onChange={(e) => handleOrderStatusChange(order.id, e.target.value, isDraft)}
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
          </tr>
        ))}
      </tbody>
    </table>
  )

  const sortedEventList = sortItems(orders)
  const sortedDraftList = sortItems(drafts)

  const indexOfLastOrderItem = orderCurrentPage * itemsPerPage
  const indexOfFirstOrderItem = indexOfLastOrderItem - itemsPerPage
  const currentEventItems = sortedEventList.slice(indexOfFirstOrderItem, indexOfLastOrderItem)

  const indexOfLastDraftItem = draftCurrentPage * itemsPerPage
  const indexOfFirstDraftItem = indexOfLastDraftItem - itemsPerPage
  const currentDraftItems = sortedDraftList.slice(indexOfFirstDraftItem, indexOfLastDraftItem)

  return (
    <>
      <div className={styles.orderListTableBackground}>
        <section className={styles.tableWrap}>
          <div className={styles.tableTitleWrap}>
            <Link to="/event"><LeftArrow /></Link>
            <h2 className={styles.tableTitle}>{`[202${event_id}년 행사] 주문서 목록`}</h2>
          </div>
          <Tab defaultActiveTab="tab1">
            <Tab.TabPane name="tab1" tab="주문서 목록">
              <Filter />
              <div className={styles.actionButtonsWrap}>
                <Button label="Excel 저장" className={styles.excelButton} />
                <Link to={`/event/${event_id}/create`} className={styles.newOrderLink}>주문서 작성</Link>
              </div>
              {renderTable(currentEventItems)}
              <Pagination
                className={styles.pagination}
                currentPage={orderCurrentPage}
                totalItems={orders.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handleOrderPageChange}
              />
            </Tab.TabPane>
            <Tab.TabPane name="tab2" tab="임시저장 목록">
              <Filter />
              <div className={styles.actionButtonsWrap}>
                <Button label="Excel 저장" className={styles.excelButton} />
                <Link to={`/event/${event_id}/create`} className={styles.newOrderLink}>주문서 작성</Link>
              </div>
              {renderTable(currentDraftItems, true)}
              <Pagination
                className={styles.pagination}
                currentPage={draftCurrentPage}
                totalItems={drafts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handleDraftPageChange}
              />
            </Tab.TabPane>
          </Tab>
        </section>
      </div>
    </>
  )
}