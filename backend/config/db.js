import mongoose from "mongoose"

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://thiwankapereraa_db_user:Thinu123@cluster0.fmnphih.mongodb.net/?appName=Cluster0/CarRental')
    .then(()=> console.log('Database Connected'))
}