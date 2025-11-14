import React, { useState, useEffect, useMemo, useCallback } from "react";
import { styles } from "../assets/dummyStyles";
import {
  FaGasPump,
  FaTachometerAlt,
  FaUsers,
  FaCog,
  FaEdit,
  FaTrash,
  FaCar,
  FaFilter,
  FaTimes
} from "react-icons/fa";

import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';

const BASE = "http://localhost:5000";

const api = axios.create({
  baseURL: BASE,
  headers: { Accept: "application/json" },
});

// Utility functions
const makeImageUrl = (img) => {
  if (!img) return "";
  const s = String(img).trim();
  return /^https?:\/\//i.test(s)
    ? s
    : `${BASE}/uploads/${s.replace(/^\/+/, "").replace(/^uploads\//, "")}`;
};

const sanitizeImageForBackend = (img) => {
  if (!img) return "";
  let s = String(img).trim();
  if (/^https?:\/\//i.test(s)) {
    const idx = s.lastIndexOf("/uploads/");
    s =
      idx !== -1
        ? s.slice(idx + "/uploads/".length)
        : s.slice(s.lastIndexOf("/") + 1);
  }
  return s.replace(/^\/+/, "").replace(/^uploads\//, "");
};

//Store In Database
const buildSafeCar = (raw = {}, idx = 0) => {
  const _id = raw._id || raw.id || null;
  return {
    _id,
    id: _id || raw.id || raw.localId || `local-${idx + 1}`,
    make: raw.make || "",
    model: raw.model || "",
    year: raw.year ?? "",
    category: raw.category || "Sedan",
    seats: raw.seats ?? 4,
    transmission: raw.transmission || "Automatic",
    fuelType: raw.fuelType || raw.fuel || "Gasoline",
    mileage: raw.mileage ?? 0,
    dailyRate: raw.dailyRate ?? raw.price ?? 0,
    status: raw.status || "available",
    _rawImage: raw.image ?? raw._rawImage ?? "",
    image: raw.image
      ? makeImageUrl(raw.image)
      : raw._rawImage
      ? makeImageUrl(raw._rawImage)
      : "",
  };
};

// SUB-COMPONENTS
const StatCard = ({ title, value, icon: Icon, className = "" }) => (
  <div
    className={`${styles.gradientOrange} ${styles.rounded2xl} ${styles.statCard} ${styles.borderGray} ${styles.borderHoverOrange} ${className}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <h3 className={`${styles.textGray} text-sm font-medium mb-2`}>
          {title}
        </h3>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
      <div className="p-3 rounded-lg bg-gray-800/30">
        <Icon className={`${styles.textOrange} text-xl`} />
      </div>
    </div>
  </div>
);

//Carcard

const CarCard = ({ car, onEdit, onDelete }) => {
  const getStatusStyle = (status) => {
    const styles = {
      available: "bg-green-900/30 text-green-400",
      rented: "bg-yellow-900/30 text-yellow-400",
      maintenance: "bg-red-900/30 text-red-400",
    };
    return styles[status] || "bg-gray-700 text-gray-200";
  };

  return (
    <div
      className={`${styles.gradientGray} ${styles.rounded2xl} ${styles.carCard} ${styles.borderGray} ${styles.borderHoverOrange}`}
    >
      <div className="relative">
        <img
          src={car.image}
          alt={`${car.make} ${car.model}`}
          className={styles.carImage}
        />
        <div className="absolute top-4 right-4">
          <span
            className={`${styles.statusBadge} ${getStatusStyle(car.status)}`}
          >
            {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">
              {car.make} {car.model}
            </h3>
            <p className={styles.textGray}>{car.year}</p>
          </div>

          <div className="text-2xl font-bold text-orange-500">
            ${car.dailyRate}
            <span className="text-sm text-gray-400 font-normal">/day</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-center text-sm">
            <FaGasPump className={`${styles.textOrange} mr-2`} />
            <span className={styles.textGray300}>{car.fuelType}</span>
          </div>

          <div className="flex items-center text-sm">
            <FaTachometerAlt className={`${styles.textOrange} mr-2`} />
            <span className={styles.textGray300}>
              {(car.mileage || 0).toLocaleString()} mi
            </span>
          </div>

          <div className="flex items-center text-sm">
            <FaUsers className={`${styles.textOrange} mr-2`} />
            <span className={styles.textGray300}>{car.seats} seats</span>
          </div>

          <div className="flex items-center text-sm">
            <FaCog className={`${styles.textOrange} mr-2`} />
            <span className={styles.textGray300}>{car.transmission}</span>
          </div>
        </div>

        <div className="flex justify-between border-t border-gray-800 pt-4">
          <button
            onClick={() => onEdit(car)}
            className={`flex items-center ${styles.textOrange} transition-colors hover:text-orange-300`}
          >
            <FaEdit className="mr-1" /> Edit
          </button>

          <button
            onClick={() => onDelete(car._id ?? car.id)}
            className={`flex items-center ${styles.textRed} transition-colors hover:text-red-300`}
          >
            <FaTrash className="mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ car, onClose, onSubmit, onChange }) => {
  const mapToBackend = (c) => ({
    make: c.make,
    model: c.model,
    year: Number(c.year || 0),
    category: c.category || "Sedan",
    seats: Number(c.seats || 0),
    transmission: c.transmission || "Automatic",
    fuelType: c.fuelType,
    mileage: Number(c.mileage || 0),
    dailyRate: Number(c.dailyRate || 0),
    status: c.status || "available",
    image: sanitizeImageForBackend(c.image || c._rawImage || ""),
  });

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!car?.make || !car?.model) {
      return toast.error("Make and Model are required.");
    }

    // Map car data to backend format and submit
    onSubmit(mapToBackend(car));
  };

  // Handles input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Determine if the field should be a number
    const numericFields = ["year", "dailyRate", "mileage", "seats"];
    const formattedValue = numericFields.includes(name) ? Number(value) : value;

    // Update car state
    onChange({
      ...car,
      [name]: formattedValue,
    });
  };

  const inputField = (label, name, type = "text", options = {}) => (
    <div>
      <label className={`block ${styles.textGray} text-sm mb-1`}>{label}</label>
      {type === "select" ? (
        <select
          name={name}
          value={car[name] || ""}
          onChange={handleInputChange}
          className={styles.inputField}
          required={options.required}
        >
          {options.items?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={car[name] || ""}
          onChange={handleInputChange}
          className={styles.inputField}
          required={options.required}
          min={options.min}
          max={options.max}
          step={options.step}
        />
      )}
    </div>
  );

  return (
    <div className={styles.modalOverlay}>
      <div
        className={`${styles.gradientGrayToGray} ${styles.rounded2xl} ${styles.modalContainer} ${styles.borderOrange}`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center border-b border-orange-800/30 pb-4">
            <h2 className="text-2xl font-bold text-white">
              {car._id ? `Edit: ${car.make} ${car.model}` : "Add New Car"}
            </h2>
            <button onClick={onClose} className={styles.textGray}>
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputField("Make", "make", "text", { required: true })}
              {inputField("Model", "model", "text", { required: true })}
              {inputField("Year", "year", "number", {
                required: true,
                min: 1900,
                max: 2099,
              })}
              {inputField("Category", "category", "select", {
                required: true,
                items: [
                  "Sedan",
                  "SUV",
                  "Sports",
                  "Coupe",
                  "Hatchback",
                  "Luxury",
                ],
              })}
              {inputField("Status", "status", "select", {
                required: true,
                items: ["available", "rented", "maintenance"],
              })}
              {inputField("Daily Rate ($)", "dailyRate", "number", {
                required: true,
                min: 1,
                step: 0.01,
              })}
              {inputField("Mileage", "mileage", "number", {
                required: true,
                min: 0,
              })}
              {inputField("Transmission", "transmission", "select", {
                required: true,
                items: ["Automatic", "Manual", "CVT"],
              })}
              {inputField("Fuel Type", "fuelType", "select", {
                required: true,
                items: ["Gasoline", "Diesel", "Hybrid", "Electric"],
              })}
            </div>

            {inputField("Number of Seats", "seats", "number", {
              required: true,
              min: 1,
              max: 12,
            })}
            {inputField("Image (filename or URL)", "image", "text", {
              required: true,
            })}

            {car.image && (
              <div className="flex justify-center">
                <img
                  src={makeImageUrl(car.image)}
                  alt="preview"
                  className="h-40 object-contain rounded-md border border-orange-800/30"
                />
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button type="submit" className={styles.buttonPrimary}>
                {car._id ? "Save Changes" : "Add Car"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ); // Map input field to edit and send updated version on Backend
};

const NoCarsView = ({ onResetFilter }) => (
  <div
    className={`${styles.gradientGray} ${styles.noCarsContainer} flex flex-col items-center p-6`}
  >
    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-orange-900/30 flex justify-center items-center mb-6">
      <div className="bg-gradient-to-br from-orange-700 to-amber-700 w-16 h-16 flex rounded-full justify-center items-center">
        <FaCar className="h-8 w-8 text-orange-300" />
      </div>
    </div>

    <h3 className="mt-4 text-xl font-medium text-white">No cars found</h3>
    <p className="mt-2 text-gray-400">Try adjusting your filter criteria</p>

    <button onClick={onResetFilter} className={`${styles.buttonPrimary} mt-4`}>
      Show All Cars
    </button>
  </div>
);

// Filter
const FilterSelect = ({ value, onChange, categories }) => (
  <div
    className={`${styles.gradientGray} ${styles.rounded2xl} ${styles.filterSelect} ${styles.borderGray} ${styles.borderHoverOrange}`}
  >
    <label className={`block text-sm font-medium ${styles.textGray} mb-2`}>
      Filter by Category
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.inputField} focus:outline-none focus:ring-2 focus:ring-orange-500`}
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c === "all" ? "All Categories" : c}
          </option>
        ))}
      </select>
      <div className="absolute left-1 top-4 text-orange-500">
        <FaFilter />
      </div>
    </div>
  </div>
);

const ManageCar = () => {
  // State for the list of cars
  const [cars, setCars] = useState([]);

  // State for filtering cars by category
  const [categoryFilter, setCategoryFilter] = useState("all");

  // State for the car currently being edited
  const [editingCar, setEditingCar] = useState(null);

  // State to control the visibility of the edit modal
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchCars = useCallback(async () => {
    try {
      const res = await api.get("/api/cars?limit=100");

      // Handle different response structures
      const raw = Array.isArray(res.data) ? res.data : res.data.data || [];

      setCars(
        raw.map((c, i) => {
          const safeCar = buildSafeCar(c, i); // fallback car object
          return {
            ...safeCar,
            image: c.image ? makeImageUrl(c.image) : safeCar.image,
            _rawImage: c.image ?? c._rawImage ?? "",
          };
        })
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cars");
    }
  }, []); // dependencies array

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(new Set(cars.map((c) => c.category || "Sedan"))),
    ],
    [cars]
  );

  const filteredCars = useMemo(
    () =>
      cars.filter(
        (car) => categoryFilter === "all" || car.category === categoryFilter
      ),
    [cars, categoryFilter]
  );

  const handleDelete = async (identifier) => {
    // Find the car by either _id or id
    const car = cars.find((c) => c._id === identifier || c.id === identifier);
    if (!car) return toast.error("Car not found");

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      if (car._id) {
        // Delete from backend
        await api.delete(`/api/cars/${car._id}`);
        toast.success("Car deleted successfully");
        // Refresh cars from backend
        fetchCars();
      } else {
        // Car without _id, just remove locally
        setCars((prev) => prev.filter((p) => p.id !== car.id));
        toast.success("Car removed locally.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete car");
    }
  };

  const openEdit = (car) => {
    setEditingCar({
      ...car,
      image: car._rawImage ?? car.image ?? "",
      _id: car._id ?? null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (payload) => {
    try {
      if (!editingCar?._id) {
        // If no car is being edited, add a new car
        await api.post("/api/cars", payload);
        toast.success("Car added");
      } else {
        // If editingCar exists, update it
        await api.put(`/api/cars/${editingCar._id}`, payload);
        toast.success("Car updated");
      }

      // Close the modal and reset editing state
      setShowEditModal(false);
      setEditingCar(null);

      // Refresh the car list
      fetchCars();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save car");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="relative mb-8 pt-16 text-center">
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
        </div>
        <h1 className="text-4xl font-extrabold py-4 text-white sm-text-5xl mb-3 tracking-wide">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-400">
            Fleet Management
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Manage your entire fleet, track bookings, and monitor vehicle status
          in real time.
        </p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Stat Card showing total number of cars */}
          <StatCard title="Total Cars" value={cars.length} icon={FaCar} />

          {/* Filter Select component */}
          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            categories={categories} // Make sure 'categories' is defined in your component
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredCars.length === 0 && (
        <NoCarsView onResetFilter={() => setCategoryFilter("all")} />
      )}

      {showEditModal && editingCar && (
        <EditModal
          car={editingCar}
          onClose={() => {
            setShowEditModal(false);
            setEditingCar(null);
          }}
          onSubmit={handleEditSubmit}
          onChange={setEditingCar}
        />
      )}
      <ToastContainer theme="dark" />
    </div>
  );
};

export default ManageCar;
