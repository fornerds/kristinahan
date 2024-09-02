import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from "./pages/Login";
import { Event, OrderList, Create, Order } from "./pages/Event";
import { AdminLogin } from "./pages/Admin/Login";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Login />} />
        <Route path="/event" element={<Event />} />
        <Route path="/event/:event_id" element={<OrderList />} />
        <Route path="/event/:event_id/create" element={<Create />} />
        <Route path="/event/:event_id/:order_id" element={<Order />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;