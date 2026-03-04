import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/Shopcontext";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const endpoint = currentState === "Login" ? "/api/user/login" : "/api/user/register";
      const payload =
        currentState === "Login" ? { email, password } : { name, email, password };

      const response = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (response.data?.success) {
        setToken(response.data.token);
        toast.success(response.data?.message || "Success");
        navigate("/");
      } else {
        toast.error(response.data?.message || "Request failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to continue. Please try again.");
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const isLogin = currentState === "Login";

  return (
    <form
      onSubmit={onSubmitHandler}
      className="mx-auto mt-14 flex w-[90%] max-w-md flex-col items-center gap-4 text-gray-800 sm:mt-20"
    >
      <div className="mb-2 inline-flex items-center gap-3">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="h-[1.5px] w-9 border-none bg-gray-800" />
      </div>

      {!isLogin && (
        <input
          type="text"
          className="w-full border border-gray-800 px-3 py-2.5 text-sm outline-none"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      )}

      <input
        type="email"
        className="w-full border border-gray-800 px-3 py-2.5 text-sm outline-none"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <input
        type="password"
        className="w-full border border-gray-800 px-3 py-2.5 text-sm outline-none"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <div className="mt-1 flex w-full justify-between text-sm text-gray-600">
        <p className="cursor-pointer">Forgot your password?</p>
        <p
          className="cursor-pointer"
          onClick={() => setCurrentState(isLogin ? "Sign Up" : "Login")}
        >
          {isLogin ? "Create account" : "Login Here"}
        </p>
      </div>

      <button type="submit" className="mt-4 bg-black px-9 py-2.5 text-sm font-light text-white">
        {isLogin ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
