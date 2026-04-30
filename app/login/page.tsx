"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Invalid credentials");
    else router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded w-96">
        <h1 className="text-2xl font-bold text-white mb-4">Login</h1>
        {error && <p className="text-red-400">{error}</p>}
        <input type="email" placeholder="Email" className="w-full p-2 mb-3 rounded bg-gray-700 text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-2 mb-3 rounded bg-gray-700 text-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-blue-600 py-2 rounded">Login</button>
        <p className="text-center text-gray-400 mt-3">No account? <a href="/register" className="text-blue-400">Register</a></p>
      </form>
    </div>
  );
}
