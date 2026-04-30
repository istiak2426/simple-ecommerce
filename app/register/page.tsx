"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Don't hash on client - send plain password
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }), // password as-is
  });
  if (res.ok) router.push("/login");
  else {
    const data = await res.json();
    setError(data.error || "Registration failed");
  }
};

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded w-96">
        <h1 className="text-2xl font-bold text-white mb-4">Register</h1>
        {error && <p className="text-red-400">{error}</p>}
        <input type="text" placeholder="Name" className="w-full p-2 mb-3 rounded bg-gray-700 text-white" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" className="w-full p-2 mb-3 rounded bg-gray-700 text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-2 mb-3 rounded bg-gray-700 text-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-green-600 py-2 rounded">Register</button>
        <p className="text-center text-gray-400 mt-3">Already have an account? <a href="/login" className="text-blue-400">Login</a></p>
      </form>
    </div>
  );
}
