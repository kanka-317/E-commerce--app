import React, { useEffect, useMemo, useState } from "react";
import { assets } from "../assets/assets";
import { backendUrl } from "../App";
import axios from "axios";

const sizeOptions = ["S", "M", "L", "XL", "XXL"];

const Add = ({ token }) => {
  const [images, setImages] = useState([null, null, null, null]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [price, setPrice] = useState("25");
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestseller] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const imagePreviews = useMemo(
    () =>
      images.map((file) => {
        if (!file) return assets.upload_area;
        return URL.createObjectURL(file);
      }),
    [images]
  );

  useEffect(
    () => () => {
      imagePreviews.forEach((preview, index) => {
        if (images[index] && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    },
    [imagePreviews, images]
  );

  useEffect(() => {
    if (!toast.open) return;
    const timer = setTimeout(
      () => setToast({ open: false, type: "success", message: "" }),
      2500
    );
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ open: true, type, message });
  };

  const handleImageChange = (index, file) => {
    if (!file) return;
    setImages((previous) => {
      const next = [...previous];
      next[index] = file;
      return next;
    });
  };

  const toggleSize = (size) => {
    setSizes((previous) =>
      previous.includes(size)
        ? previous.filter((item) => item !== size)
        : [...previous, size]
    );
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      const [image1, image2, image3, image4] = images;
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        {
          headers: {
            token,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      if (response.data?.success) {
        showToast(response.data?.message || "Product added successfully");
        setImages([null, null, null, null]);
        setName("");
        setDescription("");
        setCategory("Men");
        setSubCategory("Topwear");
        setPrice("25");
      } else {
        showToast(response.data?.message || "Failed to add product", "error");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to add product. Please try again.";
      showToast(message, "error");
      console.error(error);
    }
  };

  return (
    <>
      {toast.open && (
        <div
          className={`fixed right-5 top-5 z-50 rounded-md px-4 py-2 text-sm text-white shadow ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-[820px] text-sm text-gray-700"
      >
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-3 mb-5">
          {imagePreviews.map((preview, index) => (
            <label
              key={index}
              htmlFor={`image-${index}`}
              className="w-20 h-20 border border-gray-200 rounded-sm overflow-hidden cursor-pointer bg-white"
            >
              <img
                src={preview}
                alt={`upload-${index + 1}`}
                className="w-full h-full object-cover"
              />
              <input
                id={`image-${index}`}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) =>
                  handleImageChange(index, event.target.files?.[0])
                }
              />
            </label>
          ))}
        </div>

        <div className="w-full mb-4">
          <p className="mb-2">Product name</p>
          <input
            className="w-full max-w-[540px] px-3 py-2 border border-gray-300 bg-white rounded-sm outline-none"
            type="text"
            placeholder="Type here"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="w-full mb-4">
          <p className="mb-2">Product description</p>
          <textarea
            className="w-full max-w-[540px] px-3 py-2 border border-gray-300 bg-white rounded-sm outline-none resize-none"
            placeholder="Write content here"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <p className="mb-2">Product category</p>
            <select
              className="w-[130px] px-2 py-2 border border-gray-300 bg-white rounded-sm outline-none"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          <div>
            <p className="mb-2">Sub category</p>
            <select
              className="w-[130px] px-2 py-2 border border-gray-300 bg-white rounded-sm outline-none"
              value={subCategory}
              onChange={(event) => setSubCategory(event.target.value)}
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
          </div>

          <div>
            <p className="mb-2">Product Price</p>
            <input
              className="w-[100px] px-3 py-2 border border-gray-300 bg-white rounded-sm outline-none"
              type="number"
              min="0"
              placeholder="25"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-2">Product Sizes</p>
          <div className="flex gap-2">
            {sizeOptions.map((size) => {
              const active = sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 border rounded-sm text-sm ${
                    active
                      ? "bg-pink-100 border-pink-300 text-pink-700"
                      : "bg-gray-100 border-gray-200 text-gray-700"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <label className="inline-flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={bestseller}
            onChange={(event) => setBestseller(event.target.checked)}
          />
          <p>Add to bestseller</p>
        </label>

        <button
          type="submit"
          className="block bg-black text-white px-10 py-2.5 rounded-sm tracking-wide"
        >
          ADD
        </button>
      </form>
    </>
  );
};

export default Add;
