import { TabNavigation } from "../../../../../modules";
import { OrderCreationLayout } from "../../../../../modules/OrderCreationLayout";
import styles from "./Create.module.css";
import { useParams } from "react-router-dom";

export const Create = () => {
  let { event_id } = useParams();

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <OrderCreationLayout event_id={event_id}></OrderCreationLayout>
    </div>
  );
};
