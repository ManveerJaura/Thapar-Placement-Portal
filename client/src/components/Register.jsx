import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const role = watch("role", "student"); // default student
  const host = import.meta.env.VITE_API_URL;

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${host}/api/auth/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (resData.success) {
        toast.success("✅ User registered successfully!");
      } else {
        toast.error(`❌ ${resData.error || "Registration failed"}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("🚨 Something went wrong!");
    }
  };

  return (
    <div className="container">
      <h2 className="my-4">Admin - Register New User</h2>
      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Name */}
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            className="form-control"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <div className="text-danger">{errors.name.message}</div>}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <div className="text-danger">{errors.email.message}</div>}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            {...register("password", { required: "Password is required", minLength: 8 })}
          />
          {errors.password && <div className="text-danger">{errors.password.message}</div>}
        </div>

        {/* UID */}
        <div className="mb-3">
          <label className="form-label">UID</label>
          <input
            className="form-control"
            {...register("uid", { required: "UID is required", minLength: 9 })}
          />
          {errors.uid && <div className="text-danger">{errors.uid.message}</div>}
        </div>

        {/* Role */}
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select className="form-select" {...register("role", { required: true })}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Student-only fields */}
        {role === "student" && (
          <>
            <div className="mb-3">
              <label className="form-label">GPA</label>
              <input className="form-control" {...register("gpa", { required: true })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Branch</label>
              <input className="form-control" {...register("branch", { required: true })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Year</label>
              <input className="form-control" {...register("year", { required: true })} />
            </div>
          </>
        )}

        {/* Admin-only field */}
        {role === "admin" && (
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input className="form-control" {...register("phone_no", { required: true })} />
          </div>
        )}

        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register User"}
        </button>
      </form>
    </div>
  );
};

export default Register;
