import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Input } from "../../components/UI/Input/Input";
import styles from "./AuthPage.module.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form.username, form.password);
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      alert(
        `Registration failed. Try another username.${err.message ? ` (${err.message})` : ""}`,
      );
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className="flex justify-center mb-4">
          <UserPlus className="text-blue-600" size={32} />
        </div>
        <h1 className={styles.title}>Join Gaia</h1>
        <p className={styles.subtitle}>Create an account to start tracking</p>

        <form onSubmit={submit} className={styles.form}>
          <Input
            label="Username"
            placeholder="Choose a username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Choose a strong password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button className={styles.button} type="submit">
            Create Account
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?
          <Link to="/login" className={styles.link}>
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
