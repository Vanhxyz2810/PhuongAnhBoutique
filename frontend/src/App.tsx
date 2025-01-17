import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/clothes" element={<Clothes />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/revenue" element={<Revenue />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
