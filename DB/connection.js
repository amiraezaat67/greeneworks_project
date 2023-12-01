
import mongoose from "mongoose";

// connect to the database
const db_connection = async ()=>{
    return await mongoose
        .connect(process.env.CONNECTION_LOCAL_URL)
        .then((res)=>{console.log('DB connected successfully')})
        .catch((err)=>{console.log('DB connected failed')})
}

export default db_connection;