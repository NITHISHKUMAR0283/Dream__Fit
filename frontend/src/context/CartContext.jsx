import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "riyanshbaba_cart";

const CartContext = createContext(null);

const readInitialCart = () => {
  try {
    const storedValue = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const getVariantForCart = (product, color, size) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  if (!variants.length) {
    return null;
  }

  if (color && size) {
    const exactVariant = variants.find(
      (variant) => variant?.color === color && variant?.size === size
    );
    if (exactVariant) {
      return exactVariant;
    }
  }

  return variants[0];
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readInitialCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, options = {}) => {
    const variant = getVariantForCart(product, options?.color, options?.size);
    const selectedColor = options?.color || variant?.color || "Default";
    const selectedSize = options?.size || variant?.size || "Default";
    const price = Number(variant?.price || product?.minPrice || 0);
    const stock = Number(variant?.stock || 0);

    const cartItemId = `${product._id}::${selectedColor}::${selectedSize}`;

    setItems((previousItems) => {
      const existingItem = previousItems.find((item) => item.id === cartItemId);

      if (existingItem) {
        const nextQuantity = existingItem.quantity + 1;
        const quantity = stock > 0 ? Math.min(nextQuantity, stock) : nextQuantity;

        return previousItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
      }

      return [
        ...previousItems,
        {
          id: cartItemId,
          productId: product._id,
          title: product.title,
          brand: product.brand || "",
          category: product.category || "",
          description: product.description || "",
          image: product.image,
          color: selectedColor,
          size: selectedSize,
          price,
          stock,
          quantity: 1
        }
      ];
    });
  };

  const removeFromCart = (itemId) => {
    setItems((previousItems) => previousItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    const normalizedQty = Math.max(1, Number(quantity) || 1);

    setItems((previousItems) =>
      previousItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const maxQuantity = item.stock > 0 ? item.stock : normalizedQty;

        return {
          ...item,
          quantity: Math.min(normalizedQty, maxQuantity)
        };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalAmount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }),
    [items, totalItems, totalAmount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
