import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home/home";
import MenuCategories from "./pages/MenuCategories";
import AccountPage from "./pages/AccountPage";
import Cart from "./pages/Cart";
import Feedback from "./pages/Feedback";
import ItemDetails from "./pages/ItemDetails";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import TableInfo from "./pages/TableInfo";
import MenuItems from "./pages/MenuItems";
import AboutRestaurant from "./pages/Home/AboutRestaurant";
import OrderHistory from "./pages/Home/OrderHistory";

function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
        <Route path="/about" element={<AboutRestaurant />} />
        <Route path="/orderHistory" element={<OrderHistory />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
