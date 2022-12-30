import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGetUser } from "./hooks/useGetUser";
import LoginProtect from "./layouts/LoginProtect";
import ManagerLayout from "./layouts/ManagerLayout";
import NormalUserLayout from "./layouts/UserLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NormalUserHomePage from "./pages/nguoiDan/NormalUserHomePage";
import QuanLiHoKhau from "./pages/quanLi/hoKhau/QuanLiHoKhau";
import ThemHoKhau from "./pages/quanLi/hoKhau/ThemHoKhau";
import ManagerHomePage from "./pages/quanLi/ManagerHomePage";
import AddUser from "./pages/quanLi/user/AddUser";
import EditUser from "./pages/quanLi/user/EditUser";
import UserDetails from "./pages/quanLi/user/UserDetails";
import UserManager from "./pages/quanLi/user/UserManager";

function App() {
  useGetUser();
  return (
    <div className="">
      <Routes>
        <Route element={<LoginProtect />}>
          <Route path="/" element={<NormalUserLayout />}>
            <Route index element={<div>Ho khau page</div>} />
            <Route path="thongtin" element={<NormalUserHomePage />} />
          </Route>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<ManagerHomePage />} />
            <Route path="users">
              <Route index element={<UserManager />} />
              <Route path="add" element={<AddUser />} />
              <Route path=":id" element={<UserDetails />} />
              <Route path="edit/:id" element={<EditUser />} />
            </Route>
            <Route path="hokhau">
              <Route index element={<QuanLiHoKhau />} />
              <Route path="add" element={<ThemHoKhau />} />
            </Route>
          </Route>
        </Route>
        <Route path="/auth">
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
      <ToastContainer closeOnClick autoClose={3000} hideProgressBar />
    </div>
  );
}

export default App;
