import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Clothes from './pages/Clothes';
import Customers from './pages/Customers';
import Rentals from './pages/Rentals';
import Revenue from './pages/Revenue';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clothes" element={<Clothes />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/revenue" element={<Revenue />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
