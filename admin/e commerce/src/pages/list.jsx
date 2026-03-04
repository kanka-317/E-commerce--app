import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";

const List = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ open: true, type, message });
  };

  const authHeaders = {
    token,
    Authorization: `Bearer ${token}`,
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: authHeaders,
      });

      if (response.data?.success) {
        setProducts(response.data.products || []);
        return;
      }

      showToast(response.data?.message || "Failed to fetch products", "error");
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to fetch products. Please try again.";
      showToast(message, "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: authHeaders }
      );

      if (response.data?.success) {
        showToast(response.data?.message || "Product removed successfully");
        fetchList();
        return;
      }

      showToast(response.data?.message || "Failed to remove product", "error");
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to remove product. Please try again.";
      showToast(message, "error");
      console.error(error);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchList();
  }, [token]);

  useEffect(() => {
    if (!toast.open) return;
    const timer = setTimeout(
      () => setToast({ open: false, type: "success", message: "" }),
      2500
    );
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="w-full">
      {toast.open && (
        <div
          className={`fixed right-5 top-5 z-50 rounded-md px-4 py-2 text-sm text-white shadow ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <p className="mb-2 text-gray-700 text-base">All Products List</p>

      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[1fr_2.5fr_1fr_1fr_0.7fr] items-center py-1.5 px-3 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>

        {loading && (
          <div className="border bg-white py-8 px-3 text-sm text-gray-500">
            Loading products...
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="border bg-white py-8 px-3 text-sm text-gray-500">
            No products found.
          </div>
        )}

        {!loading &&
          products.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1fr_1fr_0.7fr] items-start md:items-center gap-2 border bg-white py-2 px-3 text-sm"
            >
              <img
                src={item.image?.[0]}
                alt={item.name}
                className="w-40 md:w-16 rounded-sm object-cover"
              />
              <p className="text-gray-700">{item.name}</p>
              <p className="text-gray-700">{item.category}</p>
              <p className="text-gray-700">${item.price}</p>
              <button
                type="button"
                onClick={() => removeProduct(item._id)}
                className="text-lg text-gray-700 hover:text-red-600 md:justify-self-center"
              >
                X
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default List;
