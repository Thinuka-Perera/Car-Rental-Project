import mongoose from "mongoose";
import Car from "./carModel.js";

const { Schema } = mongoose;

const addressSchema = new Schema(
  { street: String, city: String, state: String, zipCode: String },
  { _id: false, default: {} }
);

const carSummarySchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    year: Number,
    dailyRate: { type: Number, default: 0 },
    category: { type: String, default: "Sedan" },
    seats: { type: Number, default: 4 },
    transmission: { type: String, default: "" },
    fuelType: { type: String, default: "" },
    mileage: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    car: { type: carSummarySchema, required: true },
    carImage: { type: String, default: "" },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    bookingDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled", "upcoming"],
      default: "pending",
    },
    amount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Paypal"],
      default: "Credit Card",
    },
    sessionId: String,
    paymentIntentId: String,
    address: { type: addressSchema, default: () => ({}) },
    stripeSession: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// ========================
// PRE-VALIDATE HOOK
// ========================
bookingSchema.pre("validate", async function (next) {
  try {
    if (!this.car?.id) return next();

    const { make, model, dailyRate } = this.car;
    if (make || model || dailyRate) return next();

    const carDoc = await Car.findById(this.car.id).lean();
    if (carDoc) {
      Object.assign(this.car, {
        make: carDoc.make ?? this.car.make,
        model: carDoc.model ?? this.car.model,
        year: carDoc.year ?? this.car.year,
        dailyRate: carDoc.dailyRate ?? this.car.dailyRate,
        seats: carDoc.seats ?? this.car.seats,
        transmission: carDoc.transmission ?? this.car.transmission,
        fuelType: carDoc.fuelType ?? this.car.fuelType,
        mileage: carDoc.mileage ?? this.car.mileage,
        image: carDoc.image ?? this.car.image,
      });

      if (!this.carImage) this.carImage = carDoc.image || "";
    }

    next();
  } catch (error) {
    next(error);
  }
});

const blockingStatuses = ["pending", "active", "upcoming"];

// ========================
// POST-SAVE HOOK
// ========================
bookingSchema.post("save", async function (doc, next) {
  try {
    if (!doc.car?.id) return next();

    const carId = doc.car.id;

    const bookingEntry = {
      bookingId: doc._id,
      pickupDate: doc.pickupDate,
      returnDate: doc.returnDate,
      status: doc.status,
    };

    if (blockingStatuses.includes(doc.status)) {
      // Add or update the booking entry
      await Car.findByIdAndUpdate(
        carId,
        { $addToSet: { bookings: bookingEntry } },
        { new: true }
      ).exec();
      
      console.log(`✅ [save] Added booking ${doc._id} to car ${carId} bookings array`);
    } else {
      // Remove booking if status is not blocking (cancelled/completed)
      await Car.findByIdAndUpdate(
        carId,
        { $pull: { bookings: { bookingId: doc._id } } },
        { new: true }
      ).exec();
      
      console.log(`✅ [save] Removed booking ${doc._id} from car ${carId} (status: ${doc.status})`);
    }

    next();
  } catch (error) {
    console.error("❌ Error in post-save hook:", error);
    next(error);
  }
});

// ========================
// POST-DELETEONE HOOK (for document.deleteOne())
// ========================
bookingSchema.post('deleteOne', { document: true, query: false }, async function (next) {
  try {
    console.log('🗑️ [deleteOne hook] Triggered for booking:', this._id);
    
    if (!this.car?.id) {
      console.log('⚠️ No car.id found, skipping removal from car bookings');
      return next();
    }

    const result = await Car.findByIdAndUpdate(
      this.car.id,
      { $pull: { bookings: { bookingId: this._id } } },
      { new: true }
    );

    if (result) {
      console.log(`✅ [deleteOne] Successfully removed booking ${this._id} from car ${this.car.id} bookings array`);
    } else {
      console.log(`⚠️ Car ${this.car.id} not found when trying to remove booking`);
    }
    
    next();
  } catch (err) {
    console.error('❌ Error in deleteOne hook:', err);
    next(err);
  }
});

// ========================
// POST-FINDONEANDDELETE HOOK (for Model.findByIdAndDelete())
// ========================
bookingSchema.post('findOneAndDelete', async function (doc, next) {
  try {
    console.log('🗑️ [findOneAndDelete hook] Triggered');
    
    if (!doc) {
      console.log('⚠️ No document found in findOneAndDelete hook');
      return next();
    }
    
    if (!doc.car?.id) {
      console.log('⚠️ No car.id found in deleted booking');
      return next();
    }

    const result = await Car.findByIdAndUpdate(
      doc.car.id,
      { $pull: { bookings: { bookingId: doc._id } } },
      { new: true }
    );

    if (result) {
      console.log(`✅ [findOneAndDelete] Successfully removed booking ${doc._id} from car ${doc.car.id} bookings array`);
    } else {
      console.log(`⚠️ Car ${doc.car.id} not found`);
    }
    
    next();
  } catch (err) {
    console.error('❌ Error in findOneAndDelete hook:', err);
    next(err);
  }
});

// ========================
// POST-FINDONEANDUPDATE HOOK (for status changes)
// ========================
bookingSchema.post('findOneAndUpdate', async function (doc, next) {
  try {
    if (!doc || !doc.car?.id) return next();

    const newStatus = doc.status;
    
    console.log(`🔄 [update] Booking ${doc._id} status changed to: ${newStatus}`);
    
    // If status is now cancelled or completed, remove from car bookings
    if (newStatus === 'cancelled' || newStatus === 'completed') {
      await Car.findByIdAndUpdate(
        doc.car.id,
        { $pull: { bookings: { bookingId: doc._id } } },
        { new: true }
      );
      
      console.log(`✅ [update] Removed booking ${doc._id} from car ${doc.car.id} (status: ${newStatus})`);
    }
    // If status is blocking again, ensure it's in the array
    else if (blockingStatuses.includes(newStatus)) {
      const bookingEntry = {
        bookingId: doc._id,
        pickupDate: doc.pickupDate,
        returnDate: doc.returnDate,
        status: newStatus,
      };
      
      // First remove any existing entry, then add the updated one
      await Car.findByIdAndUpdate(
        doc.car.id,
        { $pull: { bookings: { bookingId: doc._id } } }
      );
      
      await Car.findByIdAndUpdate(
        doc.car.id,
        { $push: { bookings: bookingEntry } },
        { new: true }
      );
      
      console.log(`✅ [update] Updated booking ${doc._id} in car ${doc.car.id} (status: ${newStatus})`);
    }

    next();
  } catch (err) {
    console.error('❌ Error in findOneAndUpdate hook:', err);
    next(err);
  }
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);