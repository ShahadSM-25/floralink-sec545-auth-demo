import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  Flower2,
  Lock,
  ShieldCheck,
} from "lucide-react";

type RegisterForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type LoginForm = {
  email: string;
  password: string;
};

type RegisterState = "form" | "success" | "exists" | "invalid";

type LoginState = "form" | "invalid" | "warning" | "locked" | "success";

const existingEmail = "reem@example.com";
const demoAccount = {
  fullName: "Reem Alshareef",
  email: "reem@example.com",
  phone: "+966 50 123 4567",
  password: "Bloom@2026",
  memberSince: "Apr 2026",
};

const registerDefaults: RegisterForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const loginDefaults: LoginForm = {
  email: demoAccount.email,
  password: "",
};

function twoDigits(value: number) {
  return value.toString().padStart(2, "0");
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${twoDigits(minutes)}:${twoDigits(seconds)}`;
}

function ruleCheck(password: string) {
  return [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", passed: /[A-Z]/.test(password) },
    { label: "At least one number (0-9)", passed: /\d/.test(password) },
    { label: "At least one special character (@#$!)", passed: /[^A-Za-z0-9]/.test(password) },
    { label: "Not a known common password", passed: password.length >= 8 && !/(password|123456|qwerty|welcome)/i.test(password) },
  ];
}

function MockupHeader({ rightLabel }: { rightLabel: string }) {
  return (
    <div className="phone-header">
      <div className="brand-mark">
        <Flower2 className="h-4 w-4" />
        <span>FloraLink</span>
      </div>
      <div className="phone-nav">
        <span>Shop</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<"register" | "login" | "mitigations">("register");
  const [registerForm, setRegisterForm] = useState<RegisterForm>(registerDefaults);
  const [loginForm, setLoginForm] = useState<LoginForm>(loginDefaults);
  const [registerState, setRegisterState] = useState<RegisterState>("form");
  const [loginState, setLoginState] = useState<LoginState>("form");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  useEffect(() => {
    if (lockSeconds <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setLockSeconds((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockSeconds]);

  useEffect(() => {
    if (lockSeconds === 0 && loginState === "locked") {
      setLoginState("form");
      setFailedAttempts(0);
      setLoginForm(loginDefaults);
    }
  }, [lockSeconds, loginState]);

  const passwordRules = useMemo(() => ruleCheck(registerForm.password), [registerForm.password]);
  const passedRules = passwordRules.filter((rule) => rule.passed).length;
  const allRulesPassed = passedRules === passwordRules.length;
  const passwordMeter = `${(passedRules / passwordRules.length) * 100}%`;
  const invalidEmailFormat = registerForm.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email);
  const passwordsMatch = registerForm.confirmPassword.length > 0 && registerForm.password === registerForm.confirmPassword;

  function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = registerForm.email.trim().toLowerCase();
    const hasEmpty = Object.values(registerForm).some((value) => value.trim() === "");
    const invalid =
      hasEmpty || invalidEmailFormat || !allRulesPassed || registerForm.password !== registerForm.confirmPassword;

    if (normalizedEmail === existingEmail) {
      setRegisterState("exists");
      return;
    }

    if (invalid) {
      setRegisterState("invalid");
      return;
    }

    setRegisterState("success");
    setView("register");
  }

  function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lockSeconds > 0) {
      setLoginState("locked");
      return;
    }

    const validCredentials =
      loginForm.email.trim().toLowerCase() === demoAccount.email && loginForm.password === demoAccount.password;

    if (validCredentials) {
      setLoginState("success");
      setFailedAttempts(0);
      return;
    }

    const nextAttempt = failedAttempts + 1;
    setFailedAttempts(nextAttempt);

    if (nextAttempt >= 5) {
      setLockSeconds(15 * 60);
      setLoginState("locked");
      return;
    }

    if (nextAttempt === 4) {
      setLoginState("warning");
      return;
    }

    setLoginState("invalid");
  }

  function resetRegister() {
    setRegisterForm(registerDefaults);
    setRegisterState("form");
  }

  function resetLogin() {
    setLoginForm(loginDefaults);
    setLoginState("form");
    setFailedAttempts(0);
    setLockSeconds(0);
  }

  return (
    <div className="floralink-page">
      <div className="report-shell">
        <header className="report-header">
          <div>
            <p className="report-kicker">FloraLink Software Design</p>
            <h1>Authentication Prototype</h1>
            <p className="report-copy">
              Registration, login, strong authentication, and rate limiting are implemented using the same
              visual language as the FloraLink deliverable screens.
            </p>
          </div>

          <div className="report-actions">
            <button className={view === "register" ? "chip active" : "chip"} onClick={() => setView("register")} type="button">
              UC-01 Register
            </button>
            <button className={view === "login" ? "chip active" : "chip"} onClick={() => setView("login")} type="button">
              UC-02 Login
            </button>
            <button className={view === "mitigations" ? "chip active" : "chip"} onClick={() => setView("mitigations")} type="button">
              MIT-01 / MIT-02
            </button>
          </div>
        </header>

        {view === "register" ? (
          <section className="section-block">
            <div className="section-title success-tone">A.1. UC-01: Register Account</div>
            <p className="section-copy">
              The main flow includes the registration form and successful account creation, while the alternative
              flows cover duplicate email and invalid input validation.
            </p>

            <div className="mockup-grid two-up">
              <article className="phone-frame">
                <div className="screen-tag">UC-01 · MAIN FLOW · REGISTRATION FORM</div>
                <MockupHeader rightLabel="Login" />
                <div className="phone-body">
                  {registerState === "success" ? (
                    <div className="success-panel">
                      <div className="success-icon">
                        <Flower2 className="h-5 w-5" />
                      </div>
                      <h2>Welcome to FloraLink!</h2>
                      <p>Your account is ready. Start shopping!</p>
                      <div className="account-card">
                        <h3>Your Account</h3>
                        <div className="detail-row"><span>Name</span><strong>{demoAccount.fullName}</strong></div>
                        <div className="detail-row"><span>Email</span><strong>{demoAccount.email}</strong></div>
                        <div className="detail-row"><span>Member Since</span><strong>{demoAccount.memberSince}</strong></div>
                        <div className="detail-row"><span>Status</span><strong className="verified"><CheckCircle2 className="h-4 w-4" /> Verified</strong></div>
                      </div>
                      <button className="primary-button" type="button">Start Shopping</button>
                      <button className="secondary-button" type="button" onClick={resetRegister}>Complete My Profile</button>
                    </div>
                  ) : (
                    <form className="phone-form" onSubmit={handleRegisterSubmit}>
                      <h2>Create Account 🌸</h2>
                      <p>Join FloraLink — beautiful flowers delivered</p>

                      {registerState === "exists" ? (
                        <div className="alert-box alert-danger">
                          <AlertTriangle className="h-4 w-4" />
                          <div>
                            <strong>Email already registered.</strong> Sign in instead or use a different email.
                          </div>
                        </div>
                      ) : null}

                      {registerState === "invalid" ? (
                        <div className="alert-box alert-danger">
                          <CircleAlert className="h-4 w-4" />
                          <div>
                            <strong>Please fix the highlighted fields</strong> before submitting.
                          </div>
                        </div>
                      ) : null}

                      <label>
                        <span>Full Name</span>
                        <input
                          value={registerForm.fullName}
                          onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                          className={registerState === "invalid" && registerForm.fullName.trim() === "" ? "input-error" : ""}
                          placeholder="Reem Alshareef"
                        />
                      </label>

                      <label>
                        <span>Email Address</span>
                        <input
                          value={registerForm.email}
                          onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                          className={registerState === "exists" || invalidEmailFormat ? "input-error" : ""}
                          placeholder="reem@example.com"
                        />
                        {registerState === "exists" ? <em>This email is already registered.</em> : null}
                        {registerState === "invalid" && invalidEmailFormat ? <em>Invalid email format.</em> : null}
                      </label>

                      <label>
                        <span>Phone Number</span>
                        <input
                          value={registerForm.phone}
                          onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                          placeholder="+966 50 123 4567"
                        />
                      </label>

                      <label>
                        <span>Password</span>
                        <div className="password-wrap">
                          <input
                            type={showRegisterPassword ? "text" : "password"}
                            value={registerForm.password}
                            onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                            className={registerState === "invalid" && !allRulesPassed ? "input-error" : ""}
                            placeholder="Create a password"
                          />
                          <button type="button" className="eye-button" onClick={() => setShowRegisterPassword((current) => !current)}>
                            {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </label>

                      <div className="strength-panel compact">
                        <div className="strength-bar">
                          <div style={{ width: passwordMeter }} />
                        </div>
                        <p>Strong password</p>
                        <small>Min 8 chars · uppercase · number · special char</small>
                      </div>

                      <label>
                        <span>Confirm Password</span>
                        <div className="password-wrap">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={registerForm.confirmPassword}
                            onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                            className={registerState === "invalid" && !passwordsMatch ? "input-error" : ""}
                            placeholder="••••••••"
                          />
                          <button type="button" className="eye-button" onClick={() => setShowConfirmPassword((current) => !current)}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {registerState === "invalid" && !passwordsMatch ? <em>Passwords do not match.</em> : null}
                      </label>

                      <div className="captcha-box">
                        <label className="captcha-check">
                          <input type="checkbox" defaultChecked />
                          <span>I'm not a robot</span>
                        </label>
                        <div className="captcha-brand">reCAPTCHA</div>
                      </div>

                      <button className="primary-button" type="submit">Create My Account ✨</button>
                      <button className="text-link" type="button" onClick={resetRegister}>Already have an account? Sign in</button>
                    </form>
                  )}
                </div>
              </article>

              <article className="phone-frame">
                <div className="screen-tag">UC-01 · ALTERNATIVE FLOWS</div>
                <MockupHeader rightLabel="Login" />
                <div className="phone-body stacked-preview">
                  <div className="mini-screen">
                    <h2>Create Account</h2>
                    <div className="alert-box alert-danger">
                      <AlertTriangle className="h-4 w-4" />
                      <div><strong>Email already registered.</strong> Sign in instead or use a different email.</div>
                    </div>
                    <label>
                      <span>Email Address</span>
                      <input value="reem@example.com" readOnly className="input-error" />
                      <em>This email is already registered.</em>
                    </label>
                    <label>
                      <span>Password</span>
                      <input value="Create a password" readOnly />
                    </label>
                    <button className="primary-button alt-warning" type="button">Try Another Email</button>
                    <button className="secondary-button" type="button">Sign In to Existing Account</button>
                  </div>

                  <div className="mini-screen">
                    <h2>Create Account</h2>
                    <div className="alert-box alert-danger">
                      <CircleAlert className="h-4 w-4" />
                      <div><strong>Please fix 3 errors</strong> below before submitting.</div>
                    </div>
                    <label>
                      <span>Full Name</span>
                      <input value="" readOnly className="input-error" />
                      <em>Full name is required.</em>
                    </label>
                    <label>
                      <span>Email Address</span>
                      <input value="not-an-email" readOnly className="input-error" />
                      <em>Invalid email format.</em>
                    </label>
                    <label>
                      <span>Password</span>
                      <input value="•••" readOnly className="input-error" />
                      <em>Password does not meet requirements.</em>
                    </label>
                    <label>
                      <span>Confirm Password</span>
                      <input value="•••" readOnly className="input-error" />
                      <em>Passwords do not match.</em>
                    </label>
                    <button className="disabled-button" type="button">Fix errors to continue</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {view === "login" ? (
          <section className="section-block">
            <div className="section-title success-tone">A.2. UC-02: Login</div>
            <p className="section-copy">
              The login flow supports successful authentication, invalid credentials feedback, and temporary account
              lockout after repeated failures.
            </p>

            <div className="mockup-grid three-up">
              <article className="phone-frame">
                <div className="screen-tag">UC-02 · MAIN FLOW · LOGIN FORM</div>
                <MockupHeader rightLabel="Register" />
                <div className="phone-body">
                  {loginState === "success" ? (
                    <div className="success-panel compact-success">
                      <div className="success-icon secure">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <h2>Welcome Back 🌷</h2>
                      <p>You are signed in to your FloraLink account.</p>
                      <div className="account-card">
                        <div className="detail-row"><span>Email</span><strong>{demoAccount.email}</strong></div>
                        <div className="detail-row"><span>Status</span><strong className="verified"><CheckCircle2 className="h-4 w-4" /> Active</strong></div>
                      </div>
                      <button className="primary-button" type="button" onClick={resetLogin}>Continue</button>
                    </div>
                  ) : loginState === "locked" ? (
                    <div className="locked-panel">
                      <div className="lock-badge"><Lock className="h-5 w-5" /></div>
                      <h2>Account Locked</h2>
                      <p>5 consecutive failed login attempts detected. Access is temporarily suspended for security.</p>
                      <div className="countdown-box">{formatCountdown(lockSeconds)}</div>
                      <small>Minutes remaining until unlock</small>
                      <div className="info-note">
                        <CircleAlert className="h-4 w-4" />
                        Reset your password to regain immediate access.
                      </div>
                      <button className="secondary-button" type="button" onClick={resetLogin}>Reset Password via Email</button>
                    </div>
                  ) : (
                    <form className="phone-form" onSubmit={handleLoginSubmit}>
                      <h2>Welcome Back 🌷</h2>
                      <p>Sign in to your FloraLink account</p>

                      {loginState === "invalid" ? (
                        <div className="alert-box alert-warning">
                          <AlertTriangle className="h-4 w-4" />
                          <div><strong>Invalid email or password.</strong> {5 - failedAttempts} attempt(s) remaining before account lockout.</div>
                        </div>
                      ) : null}

                      {loginState === "warning" ? (
                        <div className="alert-box alert-warning">
                          <AlertTriangle className="h-4 w-4" />
                          <div><strong>Warning:</strong> 4 failed attempts. 1 remaining before 15-minute lockout.</div>
                        </div>
                      ) : null}

                      <label>
                        <span>Email Address</span>
                        <input value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} className={loginState === "invalid" || loginState === "warning" ? "input-error" : ""} />
                      </label>

                      <label>
                        <span>Password</span>
                        <div className="password-wrap">
                          <input
                            type={showLoginPassword ? "text" : "password"}
                            value={loginForm.password}
                            onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                            className={loginState === "invalid" || loginState === "warning" ? "input-error" : ""}
                            placeholder="••••••••"
                          />
                          <button type="button" className="eye-button" onClick={() => setShowLoginPassword((current) => !current)}>
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </label>

                      {failedAttempts >= 4 ? (
                        <div className="failed-attempts">
                          <span>Failed attempts</span>
                          <div className="attempt-dots">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <div key={index} className={index < failedAttempts ? "dot active" : "dot"}>{index < failedAttempts ? "×" : index + 1}</div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {failedAttempts >= 4 ? (
                        <div className="captcha-box">
                          <label className="captcha-check">
                            <input type="checkbox" defaultChecked />
                            <span>Verify you're human</span>
                          </label>
                          <div className="captcha-brand">reCAPTCHA</div>
                        </div>
                      ) : null}

                      <button className={loginState === "invalid" || loginState === "warning" ? "primary-button warm" : "primary-button"} type="submit">Sign In</button>
                      <button className="text-link right" type="button">Forgot password?</button>
                      <button className="text-link" type="button" onClick={resetLogin}>New to FloraLink? Create an account</button>
                    </form>
                  )}
                </div>
              </article>

              <article className="phone-frame">
                <div className="screen-tag">UC-02 · ALT A1 · INVALID CREDENTIALS</div>
                <MockupHeader rightLabel="Login" />
                <div className="phone-body">
                  <div className="mini-screen full-height">
                    <h2>Welcome Back</h2>
                    <div className="alert-box alert-warning">
                      <AlertTriangle className="h-4 w-4" />
                      <div><strong>Invalid email or password.</strong> 3 attempts remaining before account lockout.</div>
                    </div>
                    <label>
                      <span>Email Address</span>
                      <input value="reem@example.com" readOnly className="input-error" />
                    </label>
                    <label>
                      <span>Password</span>
                      <input value="••••••••" readOnly className="input-error" />
                    </label>
                    <button className="primary-button warm" type="button">Try Again</button>
                    <button className="text-link right" type="button">Forgot your password?</button>
                  </div>
                </div>
              </article>

              <article className="phone-frame">
                <div className="screen-tag">UC-02 · ALT A2 · ACCOUNT LOCKED</div>
                <MockupHeader rightLabel="Login" />
                <div className="phone-body">
                  <div className="locked-panel">
                    <div className="lock-badge"><Lock className="h-5 w-5" /></div>
                    <h2>Account Locked</h2>
                    <p>5 consecutive failed login attempts detected. Access is temporarily suspended for security.</p>
                    <div className="countdown-box">14:32</div>
                    <small>Minutes remaining until unlock</small>
                    <div className="info-note">
                      <CircleAlert className="h-4 w-4" />
                      Reset your password to regain immediate access.
                    </div>
                    <button className="secondary-button" type="button">Reset Password via Email</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {view === "mitigations" ? (
          <section className="section-block">
            <div className="section-title success-tone">Mitigation Use Cases</div>
            <p className="section-copy">
              The mitigation screens focus on password policy enforcement and pre-lockout warning behavior.
            </p>

            <div className="mockup-grid two-up">
              <article className="phone-frame">
                <div className="screen-tag">MIT-01 · PASSWORD POLICY · REAL-TIME CHECK</div>
                <MockupHeader rightLabel="Login" />
                <div className="phone-body">
                  <div className="mini-screen full-height">
                    <h2>Secure Your Account 🛡️</h2>
                    <p>Password must meet ALL 5 requirements</p>
                    <label>
                      <span>Choose Password</span>
                      <div className="password-wrap">
                        <input value={registerForm.password || "••••"} readOnly />
                        <button type="button" className="eye-button"><Eye className="h-4 w-4" /></button>
                      </div>
                    </label>
                    <div className="policy-panel">
                      <h3>Password Requirements</h3>
                      {passwordRules.map((rule) => (
                        <div key={rule.label} className={rule.passed ? "policy-item passed" : "policy-item failed"}>
                          {rule.passed ? "✓" : "✕"} {rule.label}
                        </div>
                      ))}
                    </div>
                    <button className={allRulesPassed ? "primary-button" : "disabled-button"} type="button">
                      {allRulesPassed ? "Continue" : "Continue (requirements not met)"}
                    </button>
                  </div>
                </div>
              </article>

              <article className="phone-frame">
                <div className="screen-tag">MIT-02 · PRE-LOCKOUT WARNING · 4TH ATTEMPT</div>
                <MockupHeader rightLabel="Login" />
                <div className="phone-body">
                  <div className="mini-screen full-height">
                    <h2>Welcome Back</h2>
                    <div className="alert-box alert-warning">
                      <AlertTriangle className="h-4 w-4" />
                      <div><strong>Warning:</strong> 4 failed attempts. 1 remaining before 15-minute lockout.</div>
                    </div>
                    <div className="failed-attempts spacious">
                      <span>Failed attempts</span>
                      <div className="attempt-dots">
                        <div className="dot active">×</div>
                        <div className="dot active">×</div>
                        <div className="dot active">×</div>
                        <div className="dot active">×</div>
                        <div className="dot">5</div>
                      </div>
                    </div>
                    <label>
                      <span>Email</span>
                      <input value="reem@example.com" readOnly />
                    </label>
                    <label>
                      <span>Password</span>
                      <input value="Enter carefully" readOnly />
                    </label>
                    <div className="captcha-box">
                      <label className="captcha-check">
                        <input type="checkbox" />
                        <span>Verify you're human</span>
                      </label>
                      <div className="captcha-brand">reCAPTCHA</div>
                    </div>
                    <button className="primary-button" type="button">Sign In</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
