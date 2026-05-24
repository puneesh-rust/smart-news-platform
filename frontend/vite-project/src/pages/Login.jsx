import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {

  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)

  const handleClick = () => {
    if (password) {
      setShow(!show)
    } else {
      toast.error("Please enter password")
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!username || !password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const response = await toast.promise(
        axios.post(
          "http://localhost:8000/api/v1/users/login",
          { username, password, email: "" }
        ),
        {
          loading: "Logging In...",
          success: "Login Successful",
          error: "Invalid username or password"
        }
      )

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
      }

      setUsername("")
      setPassword("")

      if (response.data.statusCode === 200) {
        navigate("/news")
      }

    } catch (error) {
      console.log("Error logging in", error)
      setUsername("")
      setPassword("")
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#060d1f] overflow-hidden relative px-4 sm:px-6 py-10">

      <Toaster position="top-center" />

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-cyan-900 rounded-full blur-[140px] opacity-25" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-blue-900 rounded-full blur-[140px] opacity-25" />

      {/* 3 Column Layout */}
      <div className="relative z-10 flex items-center justify-center gap-8 xl:gap-14 w-full max-w-5xl">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex items-center gap-5 w-[180px] flex-shrink-0">
          <svg width="28" height="260" viewBox="0 0 30 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M25 5 Q5 5 5 25 L5 115 Q5 130 15 130 Q5 130 5 145 L5 235 Q5 255 25 255"
              stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinecap="round"
            />
          </svg>
          <p className="text-cyan-400 text-[15px] font-semibold leading-relaxed text-center">
            "Welcome Back!<br />Stay Informed,<br />Stay Ahead"
          </p>
        </div>

        {/* CENTER — Login Form */}
        <div className="w-full sm:w-[460px] bg-[#0d1a2d] border border-cyan-900/50 shadow-[0_0_80px_rgba(0,200,255,0.08)] rounded-2xl px-8 sm:px-12 py-12 sm:py-16">

          {/* Mobile tagline */}
          <p className="lg:hidden text-cyan-400 text-sm font-semibold text-center mb-6 leading-snug opacity-80">
            "Welcome Back! Stay Informed, Stay Ahead"
          </p>
          <br/>

          <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-cyan-400 tracking-[0.35em] mb-10 !sm:mb-11">
            LOGIN
          </h1>

          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">

              {/* Username */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "10px",
                    background: "#0a1628",
                    border: "1px solid rgba(34,211,238,0.25)",
                    color: "white",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px rgba(6,182,212,0.5)"
                    e.target.style.borderColor = "#22d3ee"
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none"
                    e.target.style.borderColor = "rgba(34,211,238,0.25)"
                  }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2" style={{ position: "relative" }}>
                <label className="text-gray-300 text-sm font-medium">
                  Password
                </label>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "14px 50px 14px 18px",
                    borderRadius: "10px",
                    background: "#0a1628",
                    border: "1px solid rgba(34,211,238,0.25)",
                    color: "white",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px rgba(6,182,212,0.5)"
                    e.target.style.borderColor = "#22d3ee"
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none"
                    e.target.style.borderColor = "rgba(34,211,238,0.25)"
                  }}
                />
                <button
                  type="button"
                  onClick={handleClick}
                  style={{
                    position: "absolute",
                    right: "16px",
                    bottom: "14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
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

              {/* Forgot Password */}
              <div className="flex justify-end mt-0 mx-3 ">
                <button
                  type="button"
                  className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "linear-gradient(to right, #22d3ee, #3b82f6)",
                  border: "none",
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "700",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  transition: "opacity 0.2s, transform 0.1s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.99)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Login
              </button>

              {/* Register Link */}
              <div className="text-center pt-1 pb-1">
                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold underline underline-offset-4 transition-colors"
                >
                  Don't have an Account? Register
                </Link>
              </div>

            </div>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex items-center gap-5 w-[180px] flex-shrink-0">
          <p className="text-cyan-400 text-[15px] font-semibold leading-relaxed text-center">
            "Welcome Back!<br />Stay Informed,<br />Stay Ahead"
          </p>
          <svg width="28" height="260" viewBox="0 0 30 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 5 Q25 5 25 25 L25 115 Q25 130 15 130 Q25 130 25 145 L25 235 Q25 255 5 255"
              stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinecap="round"
            />
          </svg>
        </div>

      </div>
    </div>
  )
}

export default Login