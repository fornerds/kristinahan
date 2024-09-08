import styles from "./Create.module.css";
import { useLocation, useParams } from "react-router-dom";
import { OrderCreationLayout } from '../../../../../modules/OrderCreationLayout';

export const Create = () => {
    let { event_id } = useParams();
    const location = useLocation();
    const event_name = location.state?.event_name || '';

    return (
        <OrderCreationLayout event_id={event_id} event_name={event_name}>
        </OrderCreationLayout>
    )
}