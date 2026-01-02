import mongoose from "mongoose";

const schema = new mongoose.Schema({
    
    email:{
        type:String,
        required:true,
        unique:true
        
    },
},
{
 timestamps:true
}
)
const User=mongoose.model('User',schema)
export default User