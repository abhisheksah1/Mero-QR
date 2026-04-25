import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import MenuCategories from "./pages/MenuCategories";
import AccountPage from "./pages/AccountPage";
import Cart from "./pages/Cart";
import Feedback from "./pages/Feedback";
import ItemDetails from "./pages/ItemDetails";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import TableInfo from "./pages/TableInfo";
import MenuItems from "./pages/MenuItems";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/accountPage" element={<AccountPage />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/item" element={<ItemDetails />} />
      <Route path="/myOrders" element={<MyOrders />} />
      <Route path="/orderTracking" element={<OrderTracking />} />
      <Route path="/tableInfo" element={<TableInfo />} />
      <Route path="/menu" element={<MenuCategories />} />
      <Route path="/menuItems" element={<MenuItems />} />
    </Routes>
  );
}

export default App;
