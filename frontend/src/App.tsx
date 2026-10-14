
import { useEffect, useRef, useState } from 'react';
import {
  Link, NavLink, Route, Routes,
  useNavigate, useParams, useSearchParams
} from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Plus, Trash2, Check,
  AlertCircle, MoveUpRight, Ruler, Layers3,
  SlidersHorizontal
} from 'lucide-react';
import {
  api, json,
  type Profile, type Chart, type Size,
  type Dimension, type Comparison,
  type Unit, type Fit
} from './api';

const dims: Dimension[] = ['CHEST', 'WAIST', 'HIP'];

function Banner({ children }: { children: React.ReactNode }) {
  return <div className="banner"><span className="dot" /> {children}</div>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="header">
        <Link to="/" aria-label="SizeSure home">
          <img src="/sizesure-logo.png" alt="SizeSure" className="logo" />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          <NavLink to="/how-it-works">How it works</NavLink>
          <NavLink to="/profiles">My measurements</NavLink>
          <NavLink to="/charts">Seller charts</NavLink>
        </nav>
        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? 'Close' : 'Menu'}
          <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
        <Link className="nav-cta" to="/profile/new">
          Get started <ArrowRight size={15} />
        </Link>
      </header>
      {menuOpen && (
        <div id="mobile-navigation" className="mobile-navigation" ref={menuRef}>
          <NavLink onClick={() => setMenuOpen(false)} to="/how-it-works">How it works</NavLink>
          <NavLink onClick={() => setMenuOpen(false)} to="/profiles">My measurements</NavLink>
          <NavLink onClick={() => setMenuOpen(false)} to="/charts">Seller charts</NavLink>
          <NavLink onClick={() => setMenuOpen(false)} to="/profile/new">Get started →</NavLink>
        </div>
      )}
      <main id="main-content">{children}</main>
      <footer>
        <div className="footer-top">
          <img src="/sizesure-logo.png" alt="SizeSure" />
          <p>Clarity in every measurement.</p>
        </div>
        <div className="footer-bottom">
          <span>Academic prototype · Black Bitles · Cebu Institute of Technology – University</span>
          <span><Link to="/privacy">Privacy</Link> · <Link to="/help">Help</Link></span>
        </div>
      </footer>
    </>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <Banner>A BETTER WAY TO COMPARE SIZES</Banner>
          <h1>
            Different sellers.<br />
            Different size charts.<br />
            <em>One clearer decision.</em>
          </h1>
          <p>
            Keep your measurements in one place. Enter any seller's size chart.
            Understand how the numbers compare — without the guesswork.
          </p>
          <div className="actions">
            <Link className="button dark" to="/profile/new">
              Create my measurement profile <ArrowRight size={18} />
            </Link>
            <Link className="button outline" to="/how-it-works">
              Explore how it works
            </Link>
          </div>
          <div className="hero-note">
            01 / MEASURE &nbsp; · &nbsp; 02 / COMPARE &nbsp; · &nbsp; 03 / UNDERSTAND
          </div>
        </div>
        <div className="hero-right">
          <div className="art-top">THE FIT, DECODED. <span>SS—01</span></div>
          <div className="art-circle">
            <div className="art-ring ring1" />
            <div className="art-ring ring2" />
            <div className="art-inner">
              <Ruler size={42} strokeWidth={1} />
              <span>MEASURE</span>
              <strong>COMPARE</strong>
              <span>DECIDE</span>
            </div>
          </div>
          <div className="art-bottom">YOUR MEASUREMENTS<br />YOUR REFERENCE.</div>
        </div>
      </section>
      <section className="intro">
        <div className="eyebrow">THE PROCESS / 03 STEPS</div>
        <h2>Less guessing.<br /><em>More understanding.</em></h2>
        <div className="steps">
          <article>
            <span>01</span><Ruler size={28} />
            <h3>Your measurements</h3>
            <p>Save chest, waist and hip measurements with your preferred fit and unit.</p>
          </article>
          <article>
            <span>02</span><Layers3 size={28} />
            <h3>The seller's chart</h3>
            <p>Manually enter size options for the specific garment you're considering.</p>
          </article>
          <article>
            <span>03</span><SlidersHorizontal size={28} />
            <h3>Clear comparisons</h3>
            <p>See matching dimensions, unit conversions and transparent guidance status.</p>
          </article>
        </div>
      </section>
      <section className="cta-section">
        <h2>Find clarity in<br /><em>the details.</em></h2>
        <Link className="button light" to="/profile/new">
          Start comparing <ArrowRight size={18} />
        </Link>
        <p>We compare measurements, not predict physical fit. Recommendations require approved rules.</p>
      </section>
    </>
  );
}

function Heading({
  kicker, title, subtitle
}: {
  kicker: string; title: string; subtitle: string
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{kicker}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function ErrorBox({ error }: { error: string }) {
  return error ? (
    <div className="error" role="alert">
      <AlertCircle size={17} />{error}
    </div>
  ) : null;
}

function Progress({ step }: { step: number }) {
  return (
    <div className="progress">
      {['Your measurements', 'Seller chart', 'Review', 'Guidance'].map((s, i) => (
        <div className={i + 1 <= step ? 'current' : ''} key={s}>
          <span>{i + 1 < step ? <Check size={12} /> : String(i + 1).padStart(2, '0')}</span>
          {s}
        </div>
      ))}
    </div>
  );
}

function Numeric({
  label, value, onChange, unit
}: {
  label: string;
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  unit: Unit;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="numeric">
        <input
          aria-label={label}
          type="number"
          inputMode="decimal"
          step="any"
          value={value ?? ''}
          onChange={e => onChange(
            e.target.value === '' ? undefined : Number(e.target.value)
          )}
          placeholder="e.g. 92"
        />
        <span>{unit.toLowerCase()}</span>
      </div>
    </label>
  );
}

function ProfileForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, set] = useState<Profile>({
    label: 'My measurements',
    category: 'TOP',
    fitPreference: 'REGULAR',
    preferredUnit: 'CM',
    measurements: {}
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) api<Profile>('/profiles/' + id).then(set).catch(e => setError(e.message));
  }, [id]);

  function measure(dim: Dimension, v: number | undefined) {
    set(f => ({
      ...f,
      measurements: { ...f.measurements, [dim]: v }
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.label.trim()) {
      setError('Enter a profile name.');
      return;
    }

    const values = Object.values(form.measurements);

    if (values.some(v => v !== undefined && (!Number.isFinite(v) || v <= 0))) {
      setError('Measurements must be positive numbers.');
      return;
    }

    if (!values.some(v => v !== undefined && v > 0)) {
      setError('Enter at least one positive body measurement.');
      return;
    }

    setBusy(true);
    try {
      const saved = await api<Profile>(
        id ? '/profiles/' + id : '/profiles',
        json(id ? 'PUT' : 'POST', form)
      );
      nav('/profile/' + saved.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function changeUnit(unit: Unit) {
    set(f => ({
      ...f,
      preferredUnit: unit,
      measurements: Object.fromEntries(
        Object.entries(f.measurements).map(([k, v]) => [
          k,
          v === undefined
            ? undefined
            : Number((v * (unit === 'IN' ? 1 / 2.54 : 2.54)).toFixed(5))
        ])
      )
    }));
  }

  return (
    <div className="page">
      <Progress step={1} />
      <Heading
        kicker="STEP 01 / YOUR REFERENCE"
        title={id ? 'Edit your measurements' : 'Start with your measurements.'}
        subtitle="Create a reusable measurement profile. You control what you enter and can update it later."
      />
      <form onSubmit={save} className="form-panel" noValidate>
        <div className="form-section">
          <h2>Profile details</h2>
          <div className="two-col">
            <label className="field">
              <span>Profile name</span>
              <input
                value={form.label}
                maxLength={120}
                onChange={e => set(f => ({ ...f, label: e.target.value }))}
              />
            </label>
            <label className="field">
              <span>Clothing category</span>
              <select
                value={form.category}
                onChange={e => set(f => ({ ...f, category: e.target.value }))}
              >
                <option value="TOP">Tops</option>
                <option value="BOTTOM">Bottoms</option>
                <option value="GENERAL">General</option>
              </select>
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="section-head">
            <h2>Body measurements</h2>
            <label className="inline-select">
              Unit
              <select
                value={form.preferredUnit}
                onChange={e => changeUnit(e.target.value as Unit)}
              >
                <option value="CM">cm</option>
                <option value="IN">inches</option>
              </select>
            </label>
          </div>
          <p className="helper">
            Enter at least one circumference. Use a flexible measuring tape;
            keep it level without pulling tight.
          </p>
          <div className="three-col">
            {dims.map(d => (
              <Numeric
                key={d}
                label={d.charAt(0) + d.slice(1).toLowerCase() + ' circumference'}
                unit={form.preferredUnit}
                value={form.measurements[d]}
                onChange={v => measure(d, v)}
              />
            ))}
          </div>
        </div>

        <fieldset className="form-section fit-field">
          <legend>How do you prefer your clothes to fit?</legend>
          <div className="fit-grid">
            {(['FITTED', 'REGULAR', 'LOOSE'] as Fit[]).map(f => (
              <label
                className={'fit-card ' + (form.fitPreference === f ? 'selected' : '')}
                key={f}
              >
                <input
                  type="radio"
                  name="fit"
                  checked={form.fitPreference === f}
                  onChange={() => set(v => ({ ...v, fitPreference: f }))}
                />
                <strong>{f.charAt(0) + f.slice(1).toLowerCase()}</strong>
                <span>
                  {f === 'FITTED' ? 'Closer to the body'
                    : f === 'REGULAR' ? 'A balanced everyday feel'
                    : 'More room to move'}
                </span>
              </label>
            ))}
          </div>
          <p className="helper">
            Fit preferences are saved for future rule-based interpretation.
            They do not guarantee fit.
          </p>
        </fieldset>

        <ErrorBox error={error} />
        <div className="form-actions">
          <Link className="button outline" to={id ? '/profile/' + id : '/'}>
            <ArrowLeft size={17} /> Back
          </Link>
          <button className="button dark" type="submit" disabled={busy}>
            {busy ? 'Saving…' : id ? 'Save changes' : 'Save measurement profile'}
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Profiles() {
  const [list, set] = useState<Profile[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Profile[]>('/profiles').then(set).catch(e => setError(e.message));
  }, []);

  return (
    <div className="page">
      <Heading
        kicker="YOUR WORKSPACE"
        title="My measurements."
        subtitle="Your saved measurement profiles are stored in the configured local MySQL database."
      />
      <ErrorBox error={error} />
      <div className="card-grid">
        {list.map(p => (
          <Link className="item-card" to={'/profile/' + p.id} key={p.id}>
            <span className="eyebrow">PROFILE / {p.category}</span>
            <h2>{p.label}</h2>
            <p>{p.fitPreference.toLowerCase()} fit · {p.preferredUnit}</p>
            <MoveUpRight size={20} />
          </Link>
        ))}
        <Link className="item-card add-card" to="/profile/new">
          <Plus size={24} />
          <h2>Create a profile</h2>
          <p>Start with your measurements.</p>
        </Link>
      </div>
    </div>
  );
}

function ProfileDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, set] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Profile>('/profiles/' + id).then(set).catch(e => setError(e.message));
  }, [id]);

  async function remove() {
    if (!confirm('Delete this measurement profile? This cannot be undone.')) return;
    try {
      await api('/profiles/' + id, { method: 'DELETE' });
      nav('/profiles');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="page">
      <Progress step={1} />
      <Heading
        kicker="PROFILE SAVED"
        title={p?.label || 'Your profile'}
        subtitle="Your measurements are saved. Continue to enter a seller's garment chart."
      />
      <ErrorBox error={error} />
      {p && (
        <div className="detail-panel">
          <div className="detail-top">
            <Banner>SAVED TO LOCAL DATABASE</Banner>
            <span>{p.category} / {p.fitPreference} FIT</span>
          </div>
          <div className="measure-grid">
            {dims.map(d => (
              <div key={d}>
                <span>{d}</span>
                <strong>{p.measurements[d] ?? '—'}</strong>
                <small>{p.preferredUnit.toLowerCase()}</small>
              </div>
            ))}
          </div>
          <div className="form-actions">
            <Link className="button outline" to={'/profile/' + id + '/edit'}>
              Edit profile
            </Link>
            <Link className="button dark" to={'/compare/new?profile=' + id}>
              Compare seller chart <ArrowRight size={17} />
            </Link>
          </div>
          <button className="text-danger" onClick={remove}>
            <Trash2 size={15} /> Delete profile
          </button>
        </div>
      )}
    </div>
  );
}

function ChartForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const profileId = params.get('profile') || '';

  const [form, set] = useState<Chart>({
    sellerName: '',
    garmentName: '',
    garmentCategory: 'TOP',
    measurementConvention: 'CIRCUMFERENCE',
    unit: 'CM',
    sizes: [
      { label: 'S', measurements: {} },
      { label: 'M', measurements: {} },
      { label: 'L', measurements: {} }
    ]
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) api<Chart>('/charts/' + id).then(set).catch(e => setError(e.message));
  }, [id]);

  function updateSize(i: number, patch: Partial<Size>) {
    set(f => ({
      ...f,
      sizes: f.sizes.map((s, j) => i === j ? { ...s, ...patch } : s)
    }));
  }

  function measure(i: number, d: Dimension, v: number | undefined) {
    set(f => ({
      ...f,
      sizes: f.sizes.map((s, j) => {
        if (i !== j) return s;
        const measurements = { ...s.measurements };
        if (v === undefined) {
          delete measurements[d];
        } else {
          measurements[d] = v;
        }
        return { ...s, measurements };
      })
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.sellerName.trim() || !form.garmentName.trim()) {
      setError('Enter both the seller name and garment name.');
      return;
    }

    if (form.sizes.length === 0) {
      setError('Add at least one size option.');
      return;
    }

    const labels = form.sizes.map(s => s.label.trim().toLowerCase());

    if (labels.some(label => !label)) {
      setError('Every size must have a size label.');
      return;
    }

    if (new Set(labels).size !== labels.length) {
      setError('Each size label must be unique.');
      return;
    }

    for (const size of form.sizes) {
      const measurements = Object.entries(size.measurements);

      if (!measurements.some(([, value]) => value !== undefined)) {
        setError(`Size ${size.label}: Enter at least one measurement.`);
        return;
      }

      for (const [dimension, value] of measurements) {
        if (value === undefined) continue;

        if (!Number.isFinite(value) || value <= 0) {
          setError(
            `Size ${size.label}: ${dimension.toLowerCase()} must be greater than 0.`
          );
          return;
        }
      }
    }

    setBusy(true);

    try {
      const saved = await api<Chart>(
        id ? '/charts/' + id : '/charts',
        json(id ? 'PUT' : 'POST', form)
      );

      if (profileId) {
        const run = await api<{ id: string }>(
          '/comparisons',
          json('POST', { profileId, chartId: saved.id })
        );
        nav('/compare/' + run.id + '/review');
      } else {
        nav('/chart/' + saved.id);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <Progress step={2} />
      <Heading
        kicker="STEP 02 / SELLER-SPECIFIC"
        title={id ? 'Edit seller chart' : 'Enter the seller’s chart.'}
        subtitle="Manually enter measurements for the exact garment. Seller information is supplied by you, not retrieved from a retailer."
      />

      <form className="form-panel" onSubmit={save} noValidate>
        <div className="form-section">
          <h2>Garment details</h2>
          <div className="two-col">
            <label className="field">
              <span>Seller name</span>
              <input
                value={form.sellerName}
                maxLength={120}
                onChange={e => set(f => ({ ...f, sellerName: e.target.value }))}
                placeholder="e.g. Seller A (sample)"
              />
            </label>
            <label className="field">
              <span>Garment name</span>
              <input
                value={form.garmentName}
                maxLength={120}
                onChange={e => set(f => ({ ...f, garmentName: e.target.value }))}
                placeholder="e.g. Everyday top"
              />
            </label>
            <label className="field">
              <span>Garment category</span>
              <select
                value={form.garmentCategory}
                onChange={e => set(f => ({
                  ...f, garmentCategory: e.target.value
                }))}
              >
                <option value="TOP">Tops</option>
                <option value="BOTTOM">Bottoms</option>
                <option value="GENERAL">General</option>
              </select>
            </label>
            <label className="field">
              <span>Chart measurement unit</span>
              <select
                value={form.unit}
                onChange={e => set(f => ({
                  ...f, unit: e.target.value as Unit
                }))}
              >
                <option value="CM">Centimeters (cm)</option>
                <option value="IN">Inches (in)</option>
              </select>
            </label>
          </div>
          <p className="helper">
            Only circumference-based charts are currently supported.
            Flat garment width is not interchangeable with body circumference.
          </p>
        </div>

        <div className="form-section">
          <div className="section-head">
            <h2>Available sizes</h2>
            <span className="eyebrow">ENTERED BY YOU</span>
          </div>
          <p className="helper">
            Fill at least one comparable dimension for each size.
            Measurements must be positive.
          </p>
          <div className="size-list">
            {form.sizes.map((s, i) => (
              <div className="size-card" key={i}>
                <div className="size-card-top">
                  <label className="field size-label">
                    <span>Size label</span>
                    <input
                      value={s.label}
                      maxLength={80}
                      onChange={e => updateSize(i, { label: e.target.value })}
                      placeholder="M"
                    />
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={'Remove size ' + (s.label || i + 1)}
                    onClick={() => set(f => ({
                      ...f,
                      sizes: f.sizes.filter((_, j) => j !== i)
                    }))}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="three-col">
                  {dims.map(d => (
                    <Numeric
                      key={d}
                      label={d.charAt(0) + d.slice(1).toLowerCase()}
                      unit={form.unit}
                      value={s.measurements[d]}
                      onChange={v => measure(i, d, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            className="button outline"
            type="button"
            onClick={() => set(f => ({
              ...f,
              sizes: [...f.sizes, { label: '', measurements: {} }]
            }))}
          >
            <Plus size={17} /> Add another size
          </button>
        </div>

        <ErrorBox error={error} />

        <div className="form-actions">
          <Link className="button outline" to="/charts">
            <ArrowLeft size={17} /> Back
          </Link>
          <button className="button dark" disabled={busy} type="submit">
            {busy ? 'Saving…' : profileId ? 'Save & compare' : 'Save seller chart'}
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Charts() {
  const [list, set] = useState<Chart[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Chart[]>('/charts').then(set).catch(e => setError(e.message));
  }, []);

  return (
    <div className="page">
      <Heading
        kicker="MANUAL CHART LIBRARY"
        title="Seller size charts."
        subtitle="Each chart belongs to a specific garment. No automatic seller connection is used."
      />
      <ErrorBox error={error} />
      <div className="card-grid">
        {list.map(c => (
          <Link className="item-card" to={'/chart/' + c.id} key={c.id}>
            <span className="eyebrow">{c.sellerName}</span>
            <h2>{c.garmentName}</h2>
            <p>{c.sizes.length} size options · {c.unit}</p>
            <MoveUpRight size={20} />
          </Link>
        ))}
        <Link className="item-card add-card" to="/compare/new">
          <Plus size={24} />
          <h2>Enter a chart</h2>
          <p>Start a new comparison.</p>
        </Link>
      </div>
    </div>
  );
}

function ChartDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, set] = useState<Chart | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<Chart>('/charts/' + id).then(set).catch(e => setError(e.message));
    api<Profile[]>('/profiles')
      .then(p => {
        setProfiles(p);
        setProfileId(p[0]?.id || '');
      })
      .catch(e => setError(e.message));
  }, [id]);

  async function compare() {
    try {
      const run = await api<{ id: string }>(
        '/comparisons',
        json('POST', { profileId, chartId: id })
      );
      nav('/compare/' + run.id + '/review');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove() {
    if (!confirm('Delete this seller chart?')) return;
    try {
      await api('/charts/' + id, { method: 'DELETE' });
      nav('/charts');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="page">
      <Heading
        kicker="CHART / ENTERED BY YOU"
        title={c?.garmentName || 'Seller chart'}
        subtitle={c
          ? `${c.sellerName} · ${c.sizes.length} size options · ${c.unit}`
          : 'Loading chart…'}
      />
      <ErrorBox error={error} />
      {c && (
        <div className="form-panel">
          <div className="form-section">
            <h2>Size options</h2>
            <div className="chart-preview">
              {c.sizes.map(s => (
                <div key={s.id || s.label}>
                  <strong>{s.label}</strong>
                  {dims.map(d => (
                    <span key={d}>
                      {d.toLowerCase()}: {s.measurements[d] ?? '—'} {c.unit.toLowerCase()}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="form-section">
            <h2>Compare with your profile</h2>
            {profiles.length ? (
              <div className="two-col">
                <label className="field">
                  <span>Select profile</span>
                  <select
                    value={profileId}
                    onChange={e => setProfileId(e.target.value)}
                  >
                    {profiles.map(p => (
                      <option value={p.id} key={p.id}>{p.label}</option>
                    ))}
                  </select>
                </label>
                <button className="button dark align-bottom" onClick={compare}>
                  Compare measurements <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <Link className="button dark" to="/profile/new">
                Create profile first
              </Link>
            )}
          </div>
          <div className="form-actions">
            <Link className="button outline" to={'/chart/' + id + '/edit'}>
              Edit chart
            </Link>
            <button className="text-danger" onClick={remove}>
              <Trash2 size={15} /> Delete chart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompareStart() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    api<Profile[]>('/profiles')
      .then(p => {
        setProfiles(p);
        setProfileId(params.get('profile') || p[0]?.id || '');
      })
      .catch(e => setError(e.message));
  }, [params]);

  return (
    <div className="page">
      <Progress step={2} />
      <Heading
        kicker="STEP 02 / START COMPARISON"
        title="What are you comparing?"
        subtitle="Choose a saved profile, then enter the size chart for the garment you have in mind."
      />
      <ErrorBox error={error} />
      <div className="form-panel">
        <div className="form-section">
          <h2>Choose your measurements</h2>
          {profiles.length ? (
            <label className="field">
              <span>Measurement profile</span>
              <select
                value={profileId}
                onChange={e => setProfileId(e.target.value)}
              >
                {profiles.map(p => (
                  <option value={p.id} key={p.id}>
                    {p.label} · {p.fitPreference}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div>
              <p>No measurement profiles saved yet.</p>
              <Link className="button dark" to="/profile/new">
                Create a profile
              </Link>
            </div>
          )}
        </div>
        {!!profileId && (
          <div className="form-actions">
            <button
              className="button dark"
              onClick={() => nav('/chart/new?profile=' + profileId)}
            >
              Enter a new seller chart <ArrowRight size={17} />
            </button>
            <Link className="button outline" to="/charts">
              Use a saved chart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Review() {
  const { id } = useParams();
  const [run, setRun] = useState<Comparison | null>(null);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    api<Comparison>('/comparisons/' + id)
      .then(setRun)
      .catch(e => setError(e.message));
  }, [id]);

  return (
    <div className="page">
      <Progress step={3} />
      <Heading
        kicker="STEP 03 / COMPARISON EVIDENCE"
        title="See the difference."
        subtitle="Matching body and garment dimensions are normalized to centimeters before subtraction. Positive differences mean the garment value is larger."
      />
      <ErrorBox error={error} />
      {run && (
        <>
          <div className="comparison-context">
            <div>
              <span>YOUR PROFILE</span>
              <strong>{run.profile.label}</strong>
              <small>{run.profile.fitPreference} FIT</small>
            </div>
            <div>
              <span>SELLER / GARMENT</span>
              <strong>{run.chart.sellerName}</strong>
              <small>{run.chart.garmentName}</small>
            </div>
          </div>
          <div className="evidence-list">
            {run.sizes.map(size => (
              <article className="evidence-card" key={size.sizeLabel}>
                <div className="evidence-title">
                  <span>SELLER SIZE</span>
                  <strong>{size.sizeLabel}</strong>
                </div>
                <div className="evidence-values">
                  {size.evidence.length ? size.evidence.map(e => (
                    <div key={e.dimension}>
                      <span>{e.dimension}</span>
                      <span>Body {e.bodyValue} {e.bodyUnit.toLowerCase()}</span>
                      <span>Chart {e.garmentValue} {e.garmentUnit.toLowerCase()}</span>
                      <strong>
                        {e.differenceCm > 0 ? '+' : ''}
                        {e.differenceCm.toFixed(2)} cm
                      </strong>
                    </div>
                  )) : (
                    <p>No matching dimensions for this size.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div className="notice">
            <AlertCircle size={19} />
            <p>
              These are mathematical comparisons, not fit judgments.
              Fit guidance requires documented and approved rules.
            </p>
          </div>
          <div className="form-actions">
            <Link
              className="button outline"
              to={'/chart/' + run.chart.id + '/edit'}
            >
              Edit seller chart
            </Link>
            <button
              className="button dark"
              onClick={() => nav('/recommendation/' + id)}
            >
              View guidance status <ArrowRight size={17} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Recommendation() {
  const { id } = useParams();
  const [status, setStatus] = useState<{
    status: string; message: string
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ status: string; message: string }>(
      '/comparisons/' + id + '/recommendation',
      { method: 'POST' }
    ).then(setStatus).catch(e => setError(e.message));
  }, [id]);

  return (
    <div className="page">
      <Progress step={4} />
      <Heading
        kicker="STEP 04 / EXPLAINED GUIDANCE"
        title="Clarity comes first."
        subtitle="SizeSure distinguishes arithmetic comparisons from validated fit guidance."
      />
      <ErrorBox error={error} />
      {status && (
        <div className="result-panel">
          <div className="result-symbol">
            <SlidersHorizontal size={36} />
          </div>
          <div className="eyebrow">{status.status.replace(/_/g, ' ')}</div>
          <h2>Recommendation rules<br /><em>require approval.</em></h2>
          <p>{status.message}</p>
          <div className="notice">
            <AlertCircle size={18} />
            No size is being presented as a verified fit.
            Your comparison evidence is still available.
          </div>
          <div className="form-actions">
            <Link className="button dark" to={'/compare/' + id + '/review'}>
              Review measurements <ArrowRight size={17} />
            </Link>
            <Link className="button outline" to="/compare/new">
              Compare another garment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ type }: { type: 'how' | 'help' | 'privacy' }) {
  const isHow = type === 'how';
  const isPrivacy = type === 'privacy';

  const content = isHow ? [
    ['01 / YOUR REFERENCE', 'Create a measurement profile',
      'Enter your own chest, waist or hip circumference in cm or inches. Choose your preferred fit.'],
    ['02 / THE SELLER CHART', 'Enter garment-specific sizes',
      'Add seller and garment details, then manually type the seller’s circumference measurements for each available size.'],
    ['03 / THE EVIDENCE', 'Compare like with like',
      'SizeSure converts inches to centimeters, matches corresponding dimensions and shows signed differences.'],
    ['04 / HONEST GUIDANCE', 'Understand the policy status',
      'Until recommendation rules are approved, SizeSure will not assert that a size fits.']
  ] : isPrivacy ? [
    ['LOCAL DATABASE', 'Where data goes',
      'The Spring Boot backend stores entered measurements and seller charts in its configured MySQL database.'],
    ['NO ACCOUNTS', 'Single-user academic demo',
      'This version has no authentication or per-person access control. Do not expose it publicly or enter sensitive real-world data.'],
    ['YOUR CONTROL', 'Edit and delete',
      'You can edit and delete profiles and charts. Records linked to comparisons must be handled before deletion.'],
    ['NO THIRD-PARTY ANALYTICS', 'No AI sizing',
      'Measurements are not sent to an AI recommendation service or seller platform by this application.']
  ] : [
    ['CHEST', 'Around the fullest part',
      'Keep the measuring tape level around your chest, without pulling tight.'],
    ['WAIST', 'Around your natural waist',
      'Stand comfortably and avoid pulling the tape too tight.'],
    ['HIP', 'Around the fullest part',
      'Keep the tape horizontal around the widest part of the hips.'],
    ['UNITS', 'Centimeters or inches',
      'The conversion is exact: 1 inch = 2.54 centimeters. A flat-width garment chart is not a circumference chart.']
  ];

  return (
    <div className="page info-page">
      <Heading
        kicker={isHow ? 'THE SIZE SURE METHOD'
          : isPrivacy ? 'YOUR DATA / YOUR CONTROL'
          : 'MEASUREMENT GUIDE'}
        title={isHow ? 'How it works.'
          : isPrivacy ? 'Privacy & transparency.'
          : 'A little help goes a long way.'}
        subtitle={isHow ? 'A transparent, manual comparison journey.'
          : isPrivacy ? 'Understand exactly what this local academic prototype stores.'
          : 'A few simple principles for better measurement comparisons.'}
      />
      <div className="info-grid">
        {content.map(([k, h, d]) => (
          <article key={k}>
            <span className="eyebrow">{k}</span>
            <h2>{h}</h2>
            <p>{d}</p>
          </article>
        ))}
      </div>
      <Link className="button dark" to="/profile/new">
        Create a profile <ArrowRight size={17} />
      </Link>
    </div>
  );
}

function Missing() {
  return (
    <div className="page">
      <Heading
        kicker="PAGE NOT FOUND"
        title="Nothing here, yet."
        subtitle="The page you requested could not be found."
      />
      <Link className="button dark" to="/">Return home</Link>
    </div>
  );
}

function MotionEnhancements() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -18px 0px' }
    );

    const nodes = document.querySelectorAll(
      '.steps article,.item-card,.info-grid article,.evidence-card,.page-heading,.form-panel,.hero-left > *'
    );

    nodes.forEach(el => {
      el.classList.add('motion-ready');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const el = document.querySelector<HTMLElement>('.art-circle');
    if (!el) return;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
    };

    const reset = () => {
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);

    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', reset);
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <Layout>
      <MotionEnhancements />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<Info type="how" />} />
        <Route path="/help" element={<Info type="help" />} />
        <Route path="/privacy" element={<Info type="privacy" />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/profile/new" element={<ProfileForm />} />
        <Route path="/profile/:id" element={<ProfileDetail />} />
        <Route path="/profile/:id/edit" element={<ProfileForm />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/chart/new" element={<ChartForm />} />
        <Route path="/chart/:id" element={<ChartDetail />} />
        <Route path="/chart/:id/edit" element={<ChartForm />} />
        <Route path="/compare/new" element={<CompareStart />} />
        <Route path="/compare/:id/review" element={<Review />} />
        <Route path="/recommendation/:id" element={<Recommendation />} />
        <Route path="*" element={<Missing />} />
      </Routes>
    </Layout>
  );
}
