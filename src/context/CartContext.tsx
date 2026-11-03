import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/index.ts';

export interface CartItem {
  product: Product;
  quantityKg: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantityKg?: number) => void;
  updateQuantity: (productId: string, quantityKg: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('agri_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('agri_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantityKg: number = 5) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantityKg: Math.min(product.quantityAvailableKg, i.quantityKg + quantityKg) }
            : i
        );
      }
      return [...prev, { product, quantityKg: Math.min(product.quantityAvailableKg, quantityKg) }];
    });
  };

  const updateQuantity = (productId: string, quantityKg: number) => {
    if (quantityKg <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.product.id === productId ? { ...i, quantityKg } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantityKg, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.pricePerKg * item.quantityKg,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
