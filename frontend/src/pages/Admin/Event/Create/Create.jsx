import { Button, Input, Link } from "../../../../components";
import { TabNavigation } from "../../../../modules";
import { ReactComponent as DeleteIcon } from '../../../../asset/icon/delete.svg'
import styles from "./Create.module.css";
import { useState } from "react";

export const Create = () => {
    const [eventName, setEventName] = useState('');

    return (
        <div className={styles.adminLayout}>
            <TabNavigation />
            <main className={styles.adminMainWrap}>
                <h2 className={styles.adminTitle}>행사 생성</h2>
                <div className={styles.sectionWrap}>
                    <section className={styles.section}>
                        <label htmlFor="eventName">행사명</label>
                        <Input 
                            id="eventName"
                            type="text" 
                            className={styles.input}
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                        />
                    </section>
                    <section className={styles.section}>
                        <label htmlFor="orderFormName">주문서 양식</label>
                        <select name="orderFormName" id={styles.orderFormName} >
                            <option value="2021 행사">2021 행사 주문서</option>
                            <option value="2022 행사">2022 행사 주문서</option>
                            <option value="2023 행사">2023 행사 주문서</option>
                            <option value="2024 행사">2024 행사 주문서</option>
                            <option value="2025 행사">2025 행사 주문서</option>
                        </select>
                    </section>
                    <section className={styles.flexSection}>
                        <div className={styles.section}>
                            <label htmlFor="startDate">시작일</label>
                            <input type="date" name="startDate" id="startDate" className={styles.dateInput} />
                        </div>
                        <div className={styles.section}>
                            <label htmlFor="endDate">종료일</label>
                            <input type="date" name="endDate" id="endDate" className={styles.dateInput} />
                        </div>
                    </section>
                </div>
                <div className={styles.buttonGroup}>
                    <Link className={styles.cancelLink} to="/admin/event" >취소</Link>
                    <Button onClick={() => console.log('Form saved', { eventName })} className={styles.saveButton} label="저장" />
                </div>
            </main>
        </div>
    );
};