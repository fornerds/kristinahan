import { useLocation, useParams } from "react-router-dom";
import { OrderEditLayout } from "../../../../../modules/OrderEditLayout";

export const Order = () => {
    let { event_id, order_id } = useParams();
    const location = useLocation();
    const event_name = location.state?.event_name || '';

    console.log('Order component - event_id:', event_id);
    console.log('Order component - order_id:', order_id);

    return (
        <OrderEditLayout event_id={event_id} event_name={event_name}></OrderEditLayout>
    )
}