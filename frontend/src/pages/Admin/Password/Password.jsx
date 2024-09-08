import { Button, Input } from "../../../components"
import { TabNavigation } from "../../../modules"
import styles from "./Password.module.css"

export const Password = () => {
    return (
        <div className={styles.adminLayout}>
            <TabNavigation />
            <main className={styles.adminMainWrap}>
                <h2 className={styles.adminTitle}>
                    비밀번호 관리
                </h2>
                <div className={styles.sectionWrap}>                    
                    <section className={styles.section}>
                        <label htmlFor="password">직원용 비밀번호</label>
                        <Input name="password" type="password" className={styles.input}></Input>
                        <Button label="수정"/>
                    </section>
                    <section className={styles.section}>
                        <label htmlFor="adminPassword">관리자용 비밀번호</label>
                        <Input name="adminPassword" type="password" className={styles.input}></Input>
                        <Button label="수정"/>
                    </section>
                </div>
            </main>
        </div>
    )
}