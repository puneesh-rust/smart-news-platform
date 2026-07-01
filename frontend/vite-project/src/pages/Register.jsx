import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import CatCursor from "../components/ui/CatCursor";

function Register() {

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dob, setDob] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [show, setShow] = useState(false)

  const handleClick = () => {
    if (password) {
      setShow(!show)
    } else {
      toast.error("Please enter a password first")
    }
  }

  const resetForm = () => {
    setUsername("")
    setDob("")
    setEmail("")
    setPassword("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !email || !password || !dob) {
      toast.error("Please fill in all fields")
      return
    }
    setIsLoading(true)
    try {
      await toast.promise(
        axios.post("http://localhost:8000/api/v1/users/register",
          { username, email, password, dob }
        ),
        {
          loading: "Registering...",
          success: "Registration Successful!",
          error: "Registration failed. Please try again."
        }
      )
      resetForm()
    } catch (error) {
      console.log("Error registering", error)
      resetForm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>   <CatCursor />
    <div className="min-h-screen w-full flex items-center justify-center bg-[#060d1f] overflow-hidden relative px-6">

      <Toaster position="top-center" />

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-900 rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900 rounded-full blur-[120px] opacity-20" />

      {/* 3 Column Layout */}
      <div className="relative z-10 flex items-center justify-center gap-10 w-full max-w-6xl">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex items-center gap-4 w-[240px]">
          <svg width="30" height="200" viewBox="0 0 30 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M25 5 Q5 5 5 25 L5 85 Q5 100 15 100 Q5 100 5 115 L5 175 Q5 195 25 195"
              stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeLinecap="round"
            />
          </svg>
          <p className="text-cyan-400 text-xl font-bold leading-snug text-center">
            {/* Apna content yahan likho */}
            "Tomorrow Rise On Next Generation News"
          </p>
        </div>

        {/* CENTER — Register Form */}
        <div className="w-full sm:w-[480px] bg-[#0d1a2d] border border-cyan-900/40 shadow-[0_0_60px_rgba(0,200,255,0.07)] rounded-2xl px-10 py-10">

          <h1 className="text-center text-2xl font-extrabold text-cyan-400 tracking-[0.3em] mb-8">
            REGISTER
          </h1>

          <form onSubmit={handleSubmit}>
            <fieldset disabled={isLoading} className="space-y-5">

              {/* Username */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#0a1628",
                    border: "1px solid rgba(6,182,212,0.2)",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px #06b6d4"}
                  onBlur={(e) => e.target.style.boxShadow = "none"}
                  
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#0a1628",
                    border: "1px solid rgba(6,182,212,0.2)",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px #06b6d4"}
                  onBlur={(e) => e.target.style.boxShadow = "none"}
                  placeholder="Enter your email"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#0a1628",
                    border: "1px solid rgba(6,182,212,0.2)",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                    colorScheme: "dark",
                  }}
                  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px #06b6d4"}
                  onBlur={(e) => e.target.style.boxShadow = "none"}
                />
              </div>

              {/* Password */}
              <div style={{ position: "relative" }}>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Create Password
                </label>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 48px 12px 16px",
                    borderRadius: "8px",
                    background: "#0a1628",
                    border: "1px solid rgba(6,182,212,0.2)",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px #06b6d4"}
                  onBlur={(e) => e.target.style.boxShadow = "none"}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={handleClick}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "38px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: 0,
                  }}
                >
                  {show ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#22d3ee">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#22d3ee">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "8px",
                  borderRadius: "8px",
                  background: "linear-gradient(to right, #22d3ee, #3b82f6)",
                  border: "none",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.opacity = "0.85")}
                onMouseLeave={(e) => !isLoading && (e.target.style.opacity = "1")}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>

              {/* Login Link */}
              <div className="text-center pt-1">
                <Link
                  to="/login"
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold underline underline-offset-4 transition"
                >
                  Already have an Account
                </Link>
              </div>

            </fieldset>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex items-center gap-4 w-[240px]">
          <p className="text-cyan-400 text-xl font-bold leading-snug text-center">
            {/* Apna content yahan likho */}
            🚀 Innovating Today, Empowering Tomorrow
          </p>
          <svg width="30" height="200" viewBox="0 0 30 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 5 Q25 5 25 25 L25 85 Q25 100 15 100 Q25 100 25 115 L25 175 Q25 195 5 195"
              stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeLinecap="round"
            />
          </svg>
        </div>

      </div>
    </div></>
  )
}

export default Register