import mongoose from "mongoose";
import Car from "./carModel";

const { Schema } = mongoose;

const addressSchema = new Schema(
  { street: String, city: String, state: String, zipCode: String },
  { _id: false, default: {} }
);

const carSummarySchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: "Car", required: true }, // Comming From car model
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
); // car details

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // comming from User model
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
); // customer details and shiphing address

bookingSchema.pre("validate", async function (next) {
  try {
    // If there is no car ID, skip
    if (!this.car?.id) return next();

    const { make, model, dailyRate } = this.car;

    // If car already has make, model, or dailyRate, skip
    if (make || model || dailyRate) return next();

    // Fetch the car document from DB
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

    next(); // call next middleware
  } catch (error) {
    next(error); // catch any error
  }
});

const blockingStatuses = ["pending", "active", "upcoming"];

bookingSchema.post("save", async function (doc, next) {
  try {
    // If no car ID, skip
    if (!doc.car?.id) return next();

    const carId = doc.car.id;

    const bookingEntry = {
      bookingId: doc._id,
      pickupDate: doc.pickupDate,
      returnDate: doc.returnDate,
      status: doc.status,
    };

    // Only add to car bookings if status is blocking
    if (blockingStatuses.includes(doc.status)) {
      await Car.findByIdAndUpdate(
        carId,
        {
          $push: { bookings: { bookingId: doc._id } },
        },
        { new: true }
      ).exec();


      await Car.findByIdAndUpdate(
        carId,
        {$pull: {bookings: bookingEntry}},
        {new:true}
      ).exec();



    } 

    else {
      await Car.findByIdAndUpdate(carId, {
        $pull: { bookings: { bookingId: doc._id } },
      },
      {new: true}
    ).exec();

   }
   next();

  } 
  
  catch (error) {
    console.error("Error in post-save hook:", error);
    next(error); // pass error to next
  }
});




bookingSchema.post('remove', async function (doc, next) {
  try {
    if (!doc.car?.id) return next();

    await Car.findByIdAndUpdate(
      doc.car.id,
      { $pull: { bookings: { bookingId: doc._id } } }
    ).exec();

    next(); // continue
  } catch (err) {
    next(err); // pass error
  }
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);


