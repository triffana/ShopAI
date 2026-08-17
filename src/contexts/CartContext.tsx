import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discountTotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shopai_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse cart storage', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart storage', e);
    }
  }, [items]);

  const safeNum = (val: any, fallback = 0): number => {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const sanitizedProduct: Product = {
      ...product,
      price: safeNum(product.price, 0),
      discount_percent: safeNum(product.discount_percent, 0),
      stock: safeNum(product.stock, 0),
    };
    const validQty = Math.max(1, safeNum(quantity, 1));

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === sanitizedProduct.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + validQty;
        const maxQty = sanitizedProduct.stock > 0 ? Math.min(newQty, sanitizedProduct.stock) : newQty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          product: sanitizedProduct,
          quantity: maxQty,
        };
        return updated;
      } else {
        const initialQty = sanitizedProduct.stock > 0 ? Math.min(validQty, sanitizedProduct.stock) : validQty;
        return [...prevItems, { product: sanitizedProduct, quantity: initialQty }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const safeQty = safeNum(quantity, 0);
    if (safeQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const stock = safeNum(item.product.stock, 0);
          const maxStock = stock > 0 ? Math.min(safeQty, stock) : safeQty;
          return { ...item, quantity: maxStock };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + safeNum(item.quantity, 0), 0);

  const subtotal = items.reduce((acc, item) => {
    const price = safeNum(item?.product?.price, 0);
    const qty = safeNum(item?.quantity, 0);
    return acc + price * qty;
  }, 0);

  const discountTotal = items.reduce((acc, item) => {
    const price = safeNum(item?.product?.price, 0);
    const discountPercent = safeNum(item?.product?.discount_percent, 0);
    const qty = safeNum(item?.quantity, 0);
    const discountAmount = (price * discountPercent) / 100;
    return acc + discountAmount * qty;
  }, 0);

  const total = Math.max(0, safeNum(subtotal - discountTotal, 0));

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountTotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
