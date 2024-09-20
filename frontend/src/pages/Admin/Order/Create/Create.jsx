import { TabNavigation } from "../../../../modules";
import { OrderCreationLayout } from "../../../../modules/OrderCreationLayout";
import styles from "./Create.module.css";
import { useLocation, useParams } from "react-router-dom";

export const Create = () => {
    let { event_id } = useParams();
    const location = useLocation();
    const event_name = location.state?.event_name || '';

    return (
        <div className={styles.adminLayout}>
            <TabNavigation />
            <OrderCreationLayout event_id={event_id} event_name={event_name}>
            </OrderCreationLayout>
        </div>
    );
};