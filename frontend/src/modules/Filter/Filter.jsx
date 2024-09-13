import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "../../components";
import { ReactComponent as SearchIcon } from '../../asset/icon/search.svg';
import styles from "./Filter.module.css";

// 더미 데이터 생성 함수
const generateEventData = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => ({
        year: currentYear + index - 3,
        name: `${currentYear + index - 3}년 행사`
    }));
};

export const Filter = () => {
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const isAdminOrderPage = location.pathname === '/admin/order';

    useEffect(() => {
        if (isAdminOrderPage) {
            // API 호출을 시뮬레이션하는 비동기 함수
            const fetchEvents = async () => {
                // 실제 API 호출 대신 setTimeout을 사용하여 비동기 작업 시뮬레이션
                setTimeout(() => {
                    const data = generateEventData();
                    setEvents(data);
                }, 500);
            };

            fetchEvents();
        }
    }, [isAdminOrderPage]);

    const handleEventChange = (e) => {
        setSelectedEvent(e.target.value);
    };

    return (
        <div className={styles.filter}>
            <div className={styles.searchWrap}>
                <label htmlFor="search">검색</label>
                <input type="search" className={styles.searchInput} placeholder="고객명, 국가, 소속 등" name="search"/>
                <Button className={styles.searchButton}>
                    <SearchIcon strokeOpacity="1" />
                </Button>
            </div>

            {isAdminOrderPage && (
                <div className={styles.eventSelectWrap}>
                    <label htmlFor="eventSelect">행사명</label>
                    <select
                        name="eventSelect"
                        id="eventSelect"
                        className={styles.eventSelect}
                        value={selectedEvent}
                        onChange={handleEventChange}
                    >
                        {events.map((event) => (
                            <option key={event.year} value={event.year}>
                                {event.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.orderStatusWrap}>
                <label htmlFor="orderStatus">주문상태</label>
                <select name="orderStatus" id={styles.orderStatus} >
                    <option value="">전체</option>
                    <option value="주문완료">주문완료</option>
                    <option value="포장완료">포장완료</option>
                    <option value="수선접수">수선접수</option>
                    <option value="수선완료">수선완료</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                    <option value="수령완료">수령완료</option>
                    <option value="숙소">숙소</option>
                </select>
            </div>

            <div className={styles.dateRangeWrap}>
                <label htmlFor="startDate">작성일자</label>
                <input type="date" name="startDate" id="startDate" className={styles.dateInput} />
                ~
                <input type="date" name="endDate" id="endDate" className={styles.dateInput} />
            </div>
        </div>
    );
};