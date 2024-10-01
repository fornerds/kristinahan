import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import { Login } from "./pages/Login";
import { Event, OrderList, Create, Order } from "./pages/Event";
import { AdminLogin } from "./pages/Admin/Login";
import { WriterList } from "./pages/Admin/Writer";
import { AffiliationList } from "./pages/Admin/Affiliation";
import {
  OrderList as AdminOrderList,
  Create as AdminOrderCreate,
  Order as AdminOrderEdit,
} from "./pages/Admin/Order";
import {
  OrderFormList,
  Create as OrderFormCreate,
  OrderForm as OrderFormEdit,
} from "./pages/Admin/OrderForm";
import {
  ProductList,
  Create as ProductCreate,
  Product as ProductEdit,
} from "./pages/Admin/Product";
import {
  EventList,
  Create as EventCreate,
  Event as EventEdit,
} from "./pages/Admin/Event";
import { Password } from "./pages/Admin/Password";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected routes for regular users */}
        <Route element={<PrivateRoute />}>
          <Route path="/event" element={<Event />} />
          <Route path="/event/:event_id" element={<OrderList />} />
          <Route path="/event/:event_id/create" element={<Create />} />
          <Route path="/event/:event_id/:order_id" element={<Order />} />
        </Route>

        {/* Protected routes for admin users */}
        <Route element={<PrivateRoute isAdmin={true} />}>
          <Route path="/admin/writer" element={<WriterList />} />
          <Route path="/admin/affiliation" element={<AffiliationList />} />
          <Route path="/admin/order" element={<AdminOrderList />} />
          <Route
            path="/admin/order/:event_id/create"
            element={<AdminOrderCreate />}
          />
          <Route
            path="/admin/order/:event_id/:order_id"
            element={<AdminOrderEdit />}
          />
          <Route path="/admin/orderform" element={<OrderFormList />} />
          <Route path="/admin/orderform/create" element={<OrderFormCreate />} />
          <Route
            path="/admin/orderform/:orderform_id"
            element={<OrderFormEdit />}
          />
          <Route path="/admin/product" element={<ProductList />} />
          <Route path="/admin/product/create" element={<ProductCreate />} />
          <Route path="/admin/product/:category_id" element={<ProductEdit />} />
          <Route path="/admin/event" element={<EventList />} />
          <Route path="/admin/event/create" element={<EventCreate />} />
          <Route path="/admin/event/:event_id" element={<EventEdit />} />
          <Route path="/admin/password" element={<Password />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
