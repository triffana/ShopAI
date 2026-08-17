import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SetupNotice } from './components/common/SetupNotice';
import { SupabaseConnectionTest } from './components/common/SupabaseConnectionTest';
import { CartDrawer } from './components/cart/CartDrawer';
import { AdminSidebar } from './components/admin/AdminSidebar';

// Auth Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ProductsPage } from './pages/public/ProductsPage';
import { ProductDetailsPage } from './pages/public/ProductDetailsPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// User Pages
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { CartPage } from './pages/user/CartPage';
import { CheckoutPage } from './pages/user/CheckoutPage';
import { OrdersPage } from './pages/user/OrdersPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { WishlistPage } from './pages/user/WishlistPage';
import { TrackOrderPage } from './pages/user/TrackOrderPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ProductManagementPage } from './pages/admin/ProductManagementPage';
import { CategoryManagementPage } from './pages/admin/CategoryManagementPage';
import { OrderManagementPage } from './pages/admin/OrderManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';

// Public Store Layout Wrapper
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EA] text-[#17211B] selection:bg-[#B7F34A] selection:text-[#12372A]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
};

// Admin Layout Wrapper
const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <SupabaseConnectionTest />
        <SetupNotice />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Routes>
              {/* Public & User Storefront Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* User Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/track-order"
                  element={
                    <ProtectedRoute>
                      <TrackOrderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <TrackOrderPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<ProductManagementPage />} />
                <Route path="categories" element={<CategoryManagementPage />} />
                <Route path="orders" element={<OrderManagementPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>
            </Routes>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
