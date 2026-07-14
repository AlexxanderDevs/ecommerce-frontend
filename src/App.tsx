import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { StoresPage } from './pages/public/StoresPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
import { StoreProductsPage } from './pages/public/StoreProductsPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { CartPage } from './pages/public/CartPage';
import { SellerOrdersPage } from './pages/seller/SellerOrdersPage';
import { SellerLayout } from './components/layout/SellerLayout';
import { SellerAnalyticsPage } from './pages/seller/SellerAnalyticsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { Navigate } from 'react-router-dom';
import { AdminStoresPage } from './pages/admin/AdminStoresPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { SellerReportsPage } from './pages/seller/SellerReportsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'stores',
        element: <Navigate to="/" replace />  
      },
      {
        path: 'stores/:slug',
        element: <StoreProductsPage />
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />
      },
      {
        path: 'cart',
        element: <CartPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        element: <ProtectedRoute roles={['VENDEDOR']} />,
        children: [
          {
            path: 'seller',
            element: <SellerLayout />,
            children: [
              {
                index: true,
                element: <SellerDashboardPage />
              },
              {
                path: 'dashboard',
                element: <SellerAnalyticsPage />
              },
              {
                path: 'products',
                element: <SellerProductsPage />
              },
              {
                path: 'orders',
                element: <SellerOrdersPage />
              },
              { path: 'reports', 
                element: <SellerReportsPage /> 

              }
            ]
          }
        ]
      },
      {
        element: <ProtectedRoute roles={['ADMIN']} />,
        children: [
          {
            path: 'admin',
            element: <AdminDashboardPage />
          },
          {
            path: 'admin/dashboard',
            element: <AdminAnalyticsPage />
          },

          { path: 'admin/stores', 
            element: <AdminStoresPage /> 
          },
          { path: 'admin/users', 
            element: <AdminUsersPage /> 
          },  
          { path: 'admin/reports', 
            element: <AdminReportsPage /> 
          },
        ]
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;