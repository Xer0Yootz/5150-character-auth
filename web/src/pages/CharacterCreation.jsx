import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ModelViewer from '../components/ModelViewer.jsx';
import { Icon } from '../icons.jsx';

const CITIES = [
  { name: 'New York, NY', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston, TX', lat: 29.7604, lon: -95.3698 },
  { name: 'Phoenix, AZ', lat: 33.4484, lon: -112.074 },
  { name: 'Philadelphia, PA', lat: 39.9526, lon: -75.1652 },
  { name: 'San Antonio, TX', lat: 29.4241, lon: -98.4936 },
  { name: 'San Diego, CA', lat: 32.7157, lon: -117.1611 },
  { name: 'Dallas, TX', lat: 32.7767, lon: -96.797 },
  { name: 'San Jose, CA', lat: 37.3382, lon: -121.8863 },
  { name: 'Austin, TX', lat: 30.2672, lon: -97.7431 },
  { name: 'Jacksonville, FL', lat: 30.3322, lon: -81.6557 },
  { name: 'Fort Worth, TX', lat: 32.7555, lon: -97.3308 },
  { name: 'Columbus, OH', lat: 39.9612, lon: -82.9988 },
  { name: 'Charlotte, NC', lat: 35.2271, lon: -80.8431 },
  { name: 'San Francisco, CA', lat: 37.7749, lon: -122.4194 },
  { name: 'Indianapolis, IN', lat: 39.7684, lon: -86.1581 },
  { name: 'Seattle, WA', lat: 47.6062, lon: -122.3321 },
  { name: 'Denver, CO', lat: 39.7392, lon: -104.9903 },
  { name: 'Washington, DC', lat: 38.9072, lon: -77.0369 },
  { name: 'Boston, MA', lat: 42.3601, lon: -71.0589 },
  { name: 'El Paso, TX', lat: 31.7619, lon: -106.485 },
  { name: 'Nashville, TN', lat: 36.1627, lon: -86.7816 },
  { name: 'Detroit, MI', lat: 42.3314, lon: -83.0458 },
  { name: 'Oklahoma City, OK', lat: 35.4676, lon: -97.5164 },
  { name: 'Portland, OR', lat: 45.5152, lon: -122.6784 },
  { name: 'Las Vegas, NV', lat: 36.1699, lon: -115.1398 },
  { name: 'Memphis, TN', lat: 35.1495, lon: -90.049 },
  { name: 'Louisville, KY', lat: 38.2527, lon: -85.7585 },
  { name: 'Baltimore, MD', lat: 39.2904, lon: -76.6122 },
  { name: 'Milwaukee, WI', lat: 43.0389, lon: -87.9065 },
  { name: 'Albuquerque, NM', lat: 35.0844, lon: -106.6504 },
  { name: 'Tucson, AZ', lat: 32.2226, lon: -110.9747 },
  { name: 'Fresno, CA', lat: 36.7378, lon: -119.7871 },
  { name: 'Sacramento, CA', lat: 38.5816, lon: -121.4944 },
  { name: 'Mesa, AZ', lat: 33.4152, lon: -111.8315 },
  { name: 'Kansas City, MO', lat: 39.0997, lon: -94.5786 },
  { name: 'Atlanta, GA', lat: 33.749, lon: -84.388 },
  { name: 'Miami, FL', lat: 25.7617, lon: -80.1918 },
  { name: 'Oakland, CA', lat: 37.8044, lon: -122.2712 },
  { name: 'Minneapolis, MN', lat: 44.9778, lon: -93.265 },
  { name: 'New Orleans, LA', lat: 29.9511, lon: -90.0715 },
  { name: 'Cleveland, OH', lat: 41.4993, lon: -81.6944 },
  { name: 'Tampa, FL', lat: 27.9506, lon: -82.4572 },
  { name: 'Honolulu, HI', lat: 21.3069, lon: -157.8583 },
  { name: 'Anchorage, AK', lat: 61.2181, lon: -149.9003 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris, FR', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo, JP', lat: 35.6762, lon: 139.6503 },
  { name: 'Berlin, DE', lat: 52.5200, lon: 13.4050 },
  { name: 'Sydney, AU', lat: -33.8688, lon: 151.2093 },
  { name: 'Toronto, CA', lat: 43.6532, lon: -79.3832 },
  { name: 'Mexico City, MX', lat: 19.4326, lon: -99.1332 },
  { name: 'S\u00e3o Paulo, BR', lat: -23.5505, lon: -46.6333 },
  { name: 'Mumbai, IN', lat: 19.0760, lon: 72.8777 },
  { name: 'Shanghai, CN', lat: 31.2304, lon: 121.4737 },
  { name: 'Lagos, NG', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi, KE', lat: -1.2921, lon: 36.8219 },
  { name: 'Seoul, KR', lat: 37.5665, lon: 126.9780 },
  { name: 'Singapore, SG', lat: 1.3521, lon: 103.8198 },
  { name: 'Dubai, AE', lat: 25.2048, lon: 55.2708 }
];

const PREMADE = [
  { name: 'Default hex', url: '' },
  { name: 'Wireframe node', url: 'https://example.com/wireframe.glb' },
  { name: 'Chrome frame', url: 'https://example.com/chrome.glb' }
];

export default function CharacterCreation({ setCharacter, existing }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    codename: existing?.codename || '',
    birthday: existing?.birthday || '',
    location: existing?.location || '',
    latitude: existing?.latitude ?? null,
    longitude: existing?.longitude ?? null,
    modelUrl: existing?.modelUrl || ''
  });
  const [error, setError] = useState('');
  const [gpsStatus, setGpsStatus] = useState('');
  const [useGpsMode, setUseGpsMode] = useState(false);
  const [cityMode, setCityMode] = useState(false);
  const [showGlb, setShowGlb] = useState(false);

  const useGps = () => {
    setGpsStatus('Reading GPS');
    setUseGpsMode(true);
    setCityMode(false);
    if (!navigator.geolocation) {
      setGpsStatus('GPS not available');
      setUseGpsMode(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setForm((f) => ({
          ...f,
          location: 'GPS location',
          latitude: lat,
          longitude: lon
        }));
        setGpsStatus(`GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      },
      () => {
        setGpsStatus('GPS denied');
        setUseGpsMode(false);
      }
    );
  };

  const clearGps = () => {
    setUseGpsMode(false);
    setGpsStatus('');
    setForm((f) => ({ ...f, location: '', latitude: null, longitude: null }));
  };

  const selectCity = (e) => {
    const name = e.target.value;
    if (!name) {
      setCityMode(false);
      setForm((f) => ({ ...f, location: '', latitude: null, longitude: null }));
      return;
    }
    const city = CITIES.find((c) => c.name === name);
    if (!city) return;
    setForm((f) => ({
      ...f,
      location: city.name,
      latitude: city.lat,
      longitude: city.lon
    }));
    setGpsStatus('');
    setUseGpsMode(false);
    setCityMode(true);
  };

  const refineAfterGps = (e) => {
    const name = e.target.value;
    if (!name) return;
    const city = CITIES.find((c) => c.name === name);
    if (!city) return;
    setForm((f) => ({
      ...f,
      location: city.name,
      latitude: city.lat,
      longitude: city.lon
    }));
    setGpsStatus(`Refined to ${city.name}`);
  };

  const clearCity = () => {
    setCityMode(false);
    setForm((f) => ({ ...f, location: '', latitude: null, longitude: null }));
  };

  const selectPremade = (e) => {
    const url = e.target.value;
    setForm((f) => ({ ...f, modelUrl: url }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.latitude == null || form.longitude == null) {
      setError('Select a city or use GPS.');
      return;
    }
    try {
      const response = await fetch('/api/character/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codename: form.codename,
          birthday: form.birthday,
          location: form.location,
          latitude: form.latitude,
          longitude: form.longitude,
          modelUrl: form.modelUrl || null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Character save failed');
      setCharacter(data.character);
      navigate('/hub');
    } catch (err) {
      setError(err.message);
    }
  };

  const selectStyle = {
    flex: 1,
    minWidth: 160,
    background: 'transparent',
    color: '#e8f3ff',
    border: '1px solid rgba(0, 240, 255, 0.4)',
    padding: '10px 12px',
    font: 'inherit',
    borderRadius: 0
  };

  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="hex" /></span>
          <h1>{existing ? 'Edit Info' : 'Create'}</h1>
        </div>
        <p><Link to={existing ? '/hub' : '/'} className="btn ghost" aria-label="Back" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, marginBottom: 12, padding: 0 }}><Icon name="back" /></Link></p>

        {existing && <ModelViewer modelUrl={form.modelUrl || existing?.modelUrl} height={220} />}

        <form className="form" onSubmit={handleSubmit}>
          <label><span>Codename</span><input value={form.codename} onChange={(e) => setForm({ ...form, codename: e.target.value })} required /></label>
          <label><span>Birthday</span><input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} required /></label>

          <div>
            <span>Location</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {!cityMode && (
                <button type="button" className="btn ghost" onClick={useGps}>Use GPS</button>
              )}
              {useGpsMode && <button type="button" className="btn ghost" onClick={clearGps}>Clear</button>}
              {!useGpsMode && (
                <>
                  <select onChange={selectCity} value={form.location} style={selectStyle}>
                    <option value="">Select city, state</option>
                    {CITIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {cityMode && <button type="button" className="btn ghost" onClick={clearCity}>Clear</button>}
                </>
              )}
            </div>
            {useGpsMode && (
              <select onChange={refineAfterGps} style={{ ...selectStyle, display: 'block', width: '100%', marginTop: 8 }}>
                <option value="">Refine location</option>
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            )}
            {gpsStatus && <p className="hub-meta" style={{ marginTop: 6 }}>{gpsStatus}</p>}
            {form.location && form.latitude != null && (
              <p className="hub-meta" style={{ marginTop: 6 }}>
                {form.location}
              </p>
            )}
          </div>

          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#8aa0b8' }}>Avatar</span>
            <select onChange={selectPremade} value={form.modelUrl} style={{ ...selectStyle, display: 'block', width: '100%', marginTop: 4 }}>
              {PREMADE.map((p) => (
                <option key={p.name} value={p.url}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 12, fontSize: 11 }}>
            <button type="button" className="btn ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setShowGlb((v) => !v)}>
              {showGlb ? 'Hide custom GLB' : 'Custom GLB'}
            </button>
            {showGlb && (
              <label style={{ marginTop: 6 }}>
                <span style={{ fontSize: 11 }}>Model URL</span>
                <input value={form.modelUrl} onChange={(e) => setForm({ ...form, modelUrl: e.target.value })} placeholder="https://.../character.glb" style={{ fontSize: 11 }} />
              </label>
            )}
          </div>

          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit">{existing ? 'Save' : 'Create'}</button>
        </form>
      </div>
    </main>
  );
}
