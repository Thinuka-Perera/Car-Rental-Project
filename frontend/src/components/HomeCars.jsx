// src/components/HomeCars.jsx
import React from "react";
import { homeCarsStyles as styles } from "../assets/dummyStyles";
import carsData from "../assets/carsData";
import { Zap } from "lucide-react";

const HomeCars = () => {
  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerContainer}>
        <div className={styles.premiumBadge}>
          <Zap className="w-4 h-4 text-amber-400 mr-2" />
          <span className={styles.premiumText}>Premium Fleet Selection</span>
        </div>

        <h1 className={styles.title}>Luxury Car Collection</h1>
        <p className={styles.subtitle}>
          Discover premium vehicles with exceptional performance and comfort
          for your next journey.
        </p>
      </div>

      {/* CAR GRID SECTION
      <div className={styles.carsGrid}>
        {carsData.map((car) => (
          <div key={car.id} className={styles.carCard}>
            <img src={car.image} alt={car.name} className={styles.carImage} />
            <h3 className={styles.carName}>{car.name}</h3>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default HomeCars;
