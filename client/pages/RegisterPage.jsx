"use client"

import React from "react"

import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export default function SignupPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        organisation: "",
        phoneNumber: "",
        position: "",
        password: "",
        termsAgreed: false,
    })

    const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))

       if (name === "password") {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }

    const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
    }

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isPasswordStrong) {
      alert("Please create a stronger password (see requirements below)");
      setLoading(false);
      return;
    }

    if (!formData.termsAgreed) {
        alert("You must agree to the terms and conditions");
        setLoading(false);
        return;
    }

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed");
            setLoading(false);
            return;
        }

        // Only reaches here on real success
        
        navigate("/dashboard");   // This will work now

    } catch (error) {
        console.error("Network error:", error);
        alert("Failed to connect to server");
    } finally {
        setLoading(false);
    }
};

    return (
        <AuthLayout title="Create an Account" description="Please create an account to add data to the NDC tool">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                        Full Name
                    </label>
                    <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Value"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Value"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="organisation" className="block text-sm font-medium text-gray-900 mb-2">
                        Organisation
                    </label>
                    <Input
                        id="organisation"
                        name="organisation"
                        type="text"
                        placeholder="Value"
                        value={formData.organisation}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900 mb-2">
                        Phone Number
                    </label>
                    <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="Value"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-900 mb-2">
                        Position
                    </label>
                    <Input
                        id="position"
                        name="position"
                        type="text"
                        placeholder="Value"
                        value={formData.position}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                        Password
                    </label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="mb-3"
                    />
                    {/* Strength Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 ${
                strengthScore === 5
                  ? "bg-green-500"
                  : strengthScore >= 3
                  ? "bg-yellow-500"
                  : strengthScore >= 1
                  ? "bg-orange-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${(strengthScore / 5) * 100}%` }}
            />
            <p className="text-xs text-gray-600 mb-2">Your password must contain:</p>
          <ul className="space-y-1 text-xs">
            {[
              { key: "length", text: "At least 8 characters" },
              { key: "uppercase", text: "One uppercase letter" },
              { key: "lowercase", text: "One lowercase letter" },
              { key: "number", text: "One number" },
              { key: "special", text: "One special character (!@#$ etc.)" },
            ].map((rule) => (
              <li key={rule.key} className="flex items-center gap-2">
                {passwordStrength[rule.key as keyof typeof passwordStrength] ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className={passwordStrength[rule.key as keyof typeof passwordStrength] ? "text-green-700" : "text-gray-500"}>
                  {rule.text}
                </span>
              </li>
            ))}
          </ul>
          </div>

                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="terms"
                        name="termsAgreed"
                        type="checkbox"
                        checked={formData.termsAgreed}
                        onChange={handleChange}
                        required
                        className="w-4 h-4 accent-gray-900"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-900">
                        I agree to the{" "}
                        <a href="#" className="underline hover:no-underline">
                            Terms & Conditions
                        </a>
                    </label>
                </div>

                <Button
                    size="default"
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white py-6 rounded-md font-medium mt-6"
                    disabled={loading}
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline transition"
                    >
                        Login
                    </Link>
                </p>
            </div>


            </form>
        </AuthLayout>
    )
}
