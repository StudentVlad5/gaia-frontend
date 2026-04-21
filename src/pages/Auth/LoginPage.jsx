import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import styles from "./AuthPage.module.css";
import { Input } from "../../components/UI/Input/Input";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      navigate("/");
    } catch (err) {
      alert(
        `Login failed. Check your credentials.${err.message ? ` (${err.message})` : ""}`,
      );
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className="flex justify-center mb-4">
          <LogIn className="text-blue-600" size={32} />
        </div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Please enter your details to sign in</p>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <Input
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className={styles.button} type="submit">
            Sign In
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account?
          <Link to="/register" className={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
