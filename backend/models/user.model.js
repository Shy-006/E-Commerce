import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      required: function () {
        return this.authProvider === "local";
      },
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    avatar: String,

    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    
    otp: String,
    otpExpiry: Date,

    emailVerified: {
      type: Boolean,
      default: false,
    },

   
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (this.authProvider !== "local") return;

  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
  if (this.authProvider !== "local") return false;
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
