import React, { useEffect, useState } from 'react';
import './Login.css';
import { FiUnlock, FiArrowLeft, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('login');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPass: '',
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPass: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [remember, setRemember] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#signup') setMode('signup');
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('rememberEmail');
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    if (mode === 'signup') {
      window.location.hash = '#signup';
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setErrors({ fullName: '', email: '', password: '', confirmPass: '' });
    setTouched({ fullName: false, email: false, password: false, confirmPass: false });
    setShowPassword(false);
    setShowConfirm(false);
  }, [mode]);

  useEffect(() => {
    const targetId = mode === 'signup' ? 'fullName' : 'email';
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (el) el.focus();
    });
  }, [mode]);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());

  const validateOne = (name, value) => {
    let msg = '';
    switch (name) {
      case 'fullName':
        if (mode === 'signup' && !value.trim()) msg = 'Please enter your full name';
        break;
      case 'email':
        if (!isValidEmail(value)) msg = 'Please enter a valid email address';
        break;
      case 'password':
        if (value.length < 8) msg = 'Password must be at least 8 characters';
        break;
      case 'confirmPass':
        if (mode === 'signup' && value !== password) msg = 'Passwords must match';
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: msg }));
    return !msg;
  };

  const validateAll = () => {
    const fields = { fullName, email, password, confirmPass };
    const namesToCheck =
      mode === 'signup'
        ? ['fullName', 'email', 'password', 'confirmPass']
        : ['email', 'password'];

    const newErrors = { fullName: '', email: '', password: '', confirmPass: '' };

    namesToCheck.forEach((n) => {
      let msg = '';
      switch (n) {
        case 'fullName':
          if (!fields.fullName.trim()) msg = 'Please enter your full name';
          break;
        case 'email':
          if (!isValidEmail(fields.email)) msg = 'Please enter a valid email address';
          break;
        case 'password':
          if (fields.password.length < 8) msg = 'Password must be at least 8 characters';
          break;
        case 'confirmPass':
          if (fields.confirmPass !== fields.password) msg = 'Passwords must match';
          break;
        default:
          break;
      }
      newErrors[n] = msg;
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPass: true,
    });

    const firstErrorKey = namesToCheck.find((k) => newErrors[k]);
    const valid = Object.values(newErrors).every((m) => m === '');
    return { valid, firstErrorKey };
  };

  const isFormValid =
    mode === 'signup'
      ? Boolean(fullName.trim()) &&
        isValidEmail(email) &&
        password.length >= 8 &&
        confirmPass === password
      : isValidEmail(email) && password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, firstErrorKey } = validateAll();
    if (!valid) {
      const el = document.getElementById(firstErrorKey || 'email');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      if (remember) localStorage.setItem('rememberEmail', email);
      else localStorage.removeItem('rememberEmail');

      await new Promise(r => setTimeout(r, 600));

      if (mode === 'signup') {
        alert(`Sign‑up successful: ${fullName} • ${email}`);
        navigate('/pre-meeting', { state: { userName: fullName } });
      } else {
        alert(`Login successful: ${email}`);
        navigate('/pre-meeting');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = () => {
    alert(mode === 'signup' ? 'Sign up with Google' : 'Continue with Google');
    // After Google OAuth, navigate to pre-meeting
    // navigate('/pre-meeting', { state: { userName: 'Google User Name' } });
  };

  const onBlurField = (name, value) => {
    setTouched((t) => ({ ...t, [name]: true }));
    validateOne(name, value);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <header className="topbar">
        <div className="left-group">
          <button
            type="button"
            className="back-btn"
            onClick={handleBackClick}
            aria-label="Go back"
            title="Go back"
          >
            <FiArrowLeft />
          </button>
          <h1 className="brand brand--xl">Rural Meet</h1>
        </div>

        <nav className="nav-pills">
          <a className="pill" href="/">Home</a>
          <a className="pill" href="/#features">Features</a>
          <button
            type="button"
            className={`pill ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign‑up' : 'Login'}
          </button>
        </nav>
      </header>

      <div className="panels">
        <section className="panel panel-left">
          <div className="panel-inner">
            <div className="title-wrap">
              <h1 className="title">
                {mode === 'login' ? 'Already have an account?' : 'Welcome! Create your Rural Meet account'}
              </h1>
              <p className="subtitle italic">
                {mode === 'login'
                  ? 'Login easily with few simple steps.'
                  : 'Connect with students, teams and clients quickly'}
              </p>
            </div>

            <div className="avatar" role="img" aria-label="Profile">
              <FiUser className="avatar-icon" />
            </div>

            <form onSubmit={handleSubmit} className="form-wrap" noValidate autoComplete="off">
              {mode === 'signup' && (
                <div className="input-group">
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (touched.fullName) validateOne('fullName', e.target.value);
                    }}
                    onBlur={(e) => onBlurField('fullName', e.target.value)}
                    className={errors.fullName && touched.fullName ? 'input-error' : ''}
                    aria-invalid={!!errors.fullName}
                    aria-describedby="fullName-error"
                    required={mode === 'signup'}
                  />
                  {errors.fullName && touched.fullName && (
                    <p id="fullName-error" className="error-text">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="input-group">
                <input
                  id="email"
                  type="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) validateOne('email', e.target.value);
                  }}
                  onBlur={(e) => onBlurField('email', e.target.value)}
                  className={errors.email && touched.email ? 'input-error' : ''}
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                  required
                  autoFocus
                />
                {errors.email && touched.email && (
                  <p id="email-error" className="error-text">{errors.email}</p>
                )}
              </div>

              <div className="input-group has-toggle">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validateOne('password', e.target.value);
                    if (mode === 'signup' && touched.confirmPass) validateOne('confirmPass', confirmPass);
                  }}
                  onBlur={(e) => onBlurField('password', e.target.value)}
                  className={errors.password && touched.password ? 'input-error' : ''}
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                  required
                />

                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>

                {errors.password && touched.password && (
                  <p id="password-error" className="error-text">{errors.password}</p>
                )}
              </div>

              {mode === 'signup' && (
                <div className="input-group has-toggle">
                  <input
                    id="confirmPass"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPass}
                    onChange={(e) => {
                      setConfirmPass(e.target.value);
                      if (touched.confirmPass) validateOne('confirmPass', e.target.value);
                    }}
                    onBlur={(e) => onBlurField('confirmPass', e.target.value)}
                    className={errors.confirmPass && touched.confirmPass ? 'input-error' : ''}
                    aria-invalid={!!errors.confirmPass}
                    aria-describedby="confirmPass-error"
                    required={mode === 'signup'}
                  />

                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    title={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>

                  {errors.confirmPass && touched.confirmPass && (
                    <p id="confirmPass-error" className="error-text">{errors.confirmPass}</p>
                  )}
                </div>
              )}

              <div className="row-between remember-row">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember my email on this device
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={!isFormValid || submitting}>
                {submitting ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true"></span>
                    Please wait…
                  </>
                ) : (
                  mode === 'login' ? 'Submit' : 'Create account'
                )}
              </button>
            </form>

            <div className="switch-auth">
              {mode === 'login' ? (
                <>
                  New here?{' '}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setMode('signup')}
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setMode('login')}
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

            <div className="divider-OR">
              <span>OR</span>
            </div>

            <div className="google-row">
              <button type="button" className="google-btn" onClick={handleGoogle} disabled={submitting}>
                <FcGoogle size={20} />
                {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
              </button>
            </div>
          </div>
        </section>

        <aside className="panel panel-right">
          <FiUnlock className="lock-icon" />
        </aside>
      </div>
    </div>
  );
}

export default Login;