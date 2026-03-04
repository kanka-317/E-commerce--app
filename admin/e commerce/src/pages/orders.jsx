import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { assets } from "../assets/assets";

const statusOptions = ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"];

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date);
};

const formatAddress = (address = {}) => {
  const line1 = [address.street].filter(Boolean).join(", ");
  const line2 = [address.city, address.state, address.country, address.zipcode].filter(Boolean).join(", ");
  const phone = address.phone || "";
  return { line1, line2, phone };
};

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [error, setError] = useState("");

  const authConfig = useMemo(
    () => ({
      headers: {
        token,
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const fetchOrders = async () => {
    if (!token) return;

    try {
      setError("");
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, authConfig);
      if (response.data?.success) {
        setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
      } else {
        setError(response.data?.message || "Unable to load orders");
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status },
        authConfig
      );

      if (response.data?.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order._id === orderId ? { ...order, status } : order))
        );
      } else {
        setError(response.data?.message || "Failed to update status");
      }
    } catch (updateError) {
      setError(updateError.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingOrderId("");
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="w-full text-sm text-gray-700">
      <h2 className="text-base font-medium mb-4">Order Page</h2>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="border border-gray-200 bg-white p-5 text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="border border-gray-200 bg-white p-5 text-gray-500">No orders found.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const address = formatAddress(order.address);
            const totalItems = items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
            const itemsSummary = items
              .map((item) => `${item?.name || "Product"} x ${item?.quantity || 0} ${item?.size || ""}`.trim())
              .join(", ");

            return (
              <div
                key={order._id}
                className="border border-gray-200 bg-white p-4 md:p-6 grid grid-cols-1 md:grid-cols-[42px_2.5fr_1.2fr_0.8fr_1fr] gap-4"
              >
                <img src={assets.parcel_icon} alt="Parcel" className="w-10 h-10" />

                <div>
                  <p className="font-medium text-gray-800">{itemsSummary || "Order Items"}</p>
                  <p className="mt-2 font-medium text-gray-800">
                    {[order.address?.firstName, order.address?.lastName].filter(Boolean).join(" ")}
                  </p>
                  {address.line1 && <p>{address.line1}</p>}
                  {address.line2 && <p>{address.line2}</p>}
                  {address.phone && <p>{address.phone}</p>}
                </div>

                <div>
                  <p>Items : {totalItems}</p>
                  <p className="mt-2">Method : {order.paymentMethod || "-"}</p>
                  <p>Payment : {order.payment ? "Done" : "Pending"}</p>
                  <p>Date : {formatDate(order.date)}</p>
                </div>

                <p className="text-base text-gray-800">${Number(order.amount || 0)}</p>

                <select
                  value={order.status || "Order Placed"}
                  onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                  disabled={updatingOrderId === order._id}
                  className="h-10 border border-gray-300 px-2 outline-none bg-white text-sm disabled:opacity-70"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Orders;
