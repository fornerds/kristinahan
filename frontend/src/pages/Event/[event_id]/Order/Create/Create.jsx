import styles from "./Create.module.css";
import { useParams } from "react-router-dom";
import { OrderCreationLayout } from '../../../../../modules/OrderCreationLayout';
import { OrderForm } from '../../../../../modules/OrderForm';

export const Create = () => {
    let { event_id } = useParams();

    return (
        <OrderCreationLayout event_id={event_id}>
        </OrderCreationLayout>
    )
}