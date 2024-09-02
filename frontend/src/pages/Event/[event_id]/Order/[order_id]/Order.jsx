import { useParams } from "react-router-dom";
import { OrderEditLayout } from "../../../../../modules/OrderEditLayout";
import { OrderForm } from "../../../../../modules/OrderForm/OrderForm";

export const Order = () => {
    let { event_id, order_id } = useParams();

    console.log('Order component - event_id:', event_id);
    console.log('Order component - order_id:', order_id);

    return (
        <OrderEditLayout event_id={event_id}></OrderEditLayout>
    )
}