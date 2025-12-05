// Central_Store/app_context.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import { Navigate, Outlet } from "react-router-dom";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [baseUrl] = useState("https://celebstalks.pythonanywhere.com");
  const [fetchedData, setFetchedData] = useState({
    influencers: [],
    banners: [],
    categories: [],
    users: [],
    adminData: [],
    sponsoredContent: [],
    reviews: [],
    faqs: [],
  });

  // Generic request for POST, PATCH, PUT
  const request = async (method, endpoint, payload = null, message = "Item") => {
    const isFormData = payload instanceof FormData;

    const headers = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      body: isFormData ? payload : payload ? JSON.stringify(payload) : undefined,
      headers,
      credentials: "include",
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {}

    if (!res.ok) {
      const errMsg =
        data.message ||
        data.detail ||
        data.image?.[0] ||
        data.non_field_errors?.[0] ||
        "Request failed";
      throw new Error(errMsg);
    }

    if (method !== "DELETE") {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${message} ${method === "PATCH" ? "Updated" : "Created"} Successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });
    }

    return data;
  };

  const postData = (ep, payload, msg) => request("POST", ep, payload, msg);
  const patchData = (ep, payload, msg) => request("PATCH", ep, payload, msg); // ← Best for file updates
  const deleteData = async (endpoint) => {
    const result = await Swal.fire({
      title: "Delete?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Delete failed");

    Swal.fire("Deleted!", "Banner removed.", "success");
  };

  const getData = async (endPoint) => {
    const res = await fetch(`${baseUrl}${endPoint}`, { credentials: "include" });
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  };

  const getServicesData = async () => {
    try {
      const [
        influencersData,
        bannersData,
        categoriesData,
        usersData,
        adminData,
        sponsoredData,
        reviewsData,
        faqsData,
      ] = await Promise.all([
        getData("/influencers/"),
        getData("/banners/"),
        getData("/category/"),
        getData("/register/"),
        getData("/admin_data/"),
        getData("/sponsored_content/"),
        getData("/reviews/"),
        getData("/faqs/"),
      ]);

      setFetchedData({
        influencers: influencersData,
        banners: bannersData,
        categories: categoriesData,
        users: usersData,
        adminData,
        sponsoredContent: sponsoredData,
        reviews: reviewsData,
        faqs: faqsData,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getServicesData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        baseUrl,
        postData,
        patchData,     // ← Use this for edit
        deleteData,
        fetchedData,
        getServicesData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export const PrivateRoute = () => {
  const isAuth = localStorage.getItem("isAuth");
  return isAuth ? <Outlet /> : <Navigate to="/" replace />;
};