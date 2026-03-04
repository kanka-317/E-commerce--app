/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const navigate = useNavigate();

  const getAuthConfig = () => ({
    headers: {
      token,
      Authorization: `Bearer ${token}`,
    },
  });

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data?.success) {
        setProducts(response.data.products || []);
      } else {
        toast.error(response.data?.message || "Failed to load products.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch products.");
    }
  };

  const getUserCart = async () => {
    if (!token) {
      setCartItems({});
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/cart/get`, {}, getAuthConfig());
      if (response.data?.success) {
        setCartItems(response.data.cartData || {});
      } else {
        toast.error(response.data?.message || "Failed to load cart.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setToken("");
        setCartItems({});
      }
      toast.error(error.response?.data?.message || "Unable to fetch cart.");
    }
  };

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select a size before adding to cart.");
      return;
    }

    setCartItems((prev) => {
      const cartData = { ...prev };
      const itemSizes = cartData[itemId] ? { ...cartData[itemId] } : {};
      itemSizes[size] = (itemSizes[size] || 0) + 1;
      cartData[itemId] = itemSizes;
      return cartData;
    });

    if (!token) return;

    try {
      await axios.post(`${backendUrl}/api/cart/add`, { itemId, size }, getAuthConfig());
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save cart.");
    }
  };

  const updateCartQuantity = async (itemId, size, quantity) => {
    setCartItems((prev) => {
      const cartData = { ...prev };
      const itemSizes = cartData[itemId] ? { ...cartData[itemId] } : {};

      if (quantity <= 0) {
        delete itemSizes[size];
        if (Object.keys(itemSizes).length === 0) {
          delete cartData[itemId];
        } else {
          cartData[itemId] = itemSizes;
        }
        return cartData;
      }

      itemSizes[size] = quantity;
      cartData[itemId] = itemSizes;
      return cartData;
    });

    if (!token) return;

    try {
      await axios.post(`${backendUrl}/api/cart/update`, { itemId, size, quantity }, getAuthConfig());
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update cart.");
    }
  };

  const removeFromCart = (itemId, size) => {
    updateCartQuantity(itemId, size, 0);
  };

  const getCartCount = () => {
    let totalCount = 0;

    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        const qty = Number(cartItems[itemId][size] || 0);
        if (qty > 0) totalCount += qty;
      }
    }

    return totalCount;
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      getUserCart();
    } else {
      localStorage.removeItem("token");
      setCartItems({});
    }
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCartCount,
    backendUrl,
    token,
    setToken,
    navigate,
    getUserCart,
  };

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;
