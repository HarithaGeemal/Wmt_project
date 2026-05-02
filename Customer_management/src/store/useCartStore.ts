import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateItemQty: (id: string, qty: number) => void;
  getItemQty: (id: string) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedAddressId: null,

      setSelectedAddressId: (id) => set({ selectedAddressId: id }),

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...product, qty: 1 }] };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (existing && existing.qty > 1) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, qty: i.qty - 1 } : i,
              ),
            };
          }
          return { items: state.items.filter((i) => i.id !== id) };
        });
      },

      updateItemQty: (id, qty) => {
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, qty } : i,
            ),
          };
        });
      },

      getItemQty: (id) => {
        const item = get().items.find((i) => i.id === id);
        return item ? item.qty : 0;
      },

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, i) => sum + i.qty * i.price, 0);
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
