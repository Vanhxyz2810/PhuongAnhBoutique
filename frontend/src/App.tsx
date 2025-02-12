import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Clothes from './pages/Clothes';
import Customers from './pages/Customers';
import Rentals from './pages/Rentals';
import Revenue from './pages/Revenue';
import ProductDetail from './pages/ProductDetail';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { enUS } from 'date-fns/locale/en-US';
import MyOrders from './pages/MyOrders';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import RentalSuccess from './pages/RentalSuccess';
// import SuccessPayment from './pages/SuccessPayment';
import { SnackbarProvider } from 'notistack';
import PaymentCancel from './pages/PaymentCancel';
import Feedbacks from './pages/Feedbacks';
const PrivateRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <SnackbarProvider 
      maxSnack={3} 
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router
            future={{ 
              v7_startTransition: true,
              v7_relativeSplatPath: true 
            }}
          >
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                
                {/* Routes cho admin */}
                <Route path="/clothes" element={
                  <PrivateRoute roles={['admin']}>
                    <Clothes />
                  </PrivateRoute>
                } />
                <Route path="/customers" element={
                  <PrivateRoute roles={['admin']}>
                    <Customers />
                  </PrivateRoute>
                } />
                <Route path="/rentals" element={
                  <PrivateRoute roles={['admin']}>
                    <Rentals />
                  </PrivateRoute>
                } />
                <Route path="/revenue" element={
                  <PrivateRoute roles={['admin']}>
                    <Revenue />
                  </PrivateRoute>
                } />
                <Route path="/feedbacks" element={
                  <PrivateRoute roles={['admin']}>
                    <Feedbacks />
                  </PrivateRoute>
                } />
                
                {/* Route cho user đã đăng nhập */}
                <Route path="/my-orders" element={
                  <PrivateRoute>
                    <MyOrders />
                  </PrivateRoute>
                } />
                
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/rental-success" element={<RentalSuccess />} />
                {/* <Route path="/success" element={<SuccessPayment />} /> */}
                <Route path="/cancel" element={<PaymentCancel />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </LocalizationProvider>
    </SnackbarProvider>
  );
}

export default App;
