import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { API, Search, Plus, LogOut, Pencil, Trash2, ChevronLeft, ChevronRight, BookOpen, SlidersHorizontal, X, Check, Sparkles, AuthModal, BookModal, Tour, SiteHeader } from '../components/catalog.jsx';
export default function AuthPage() {
  const navigate = useNavigate(); const location = useLocation(); const [notice, setNotice] = useState(location.state?.notice || '');
  const submit = async values => { try { if (values.register) { await API.post('/auth/register', values); setNotice('Account created successfully! Please sign in.'); navigate('/signin', { replace: true, state: { notice: 'Account created successfully! Please sign in.' } }); return; } const { data } = await API.post('/auth/login', values); localStorage.setItem('meridian-token', data.token); localStorage.setItem('meridian-user', JSON.stringify(data.user)); navigate('/books'); window.location.reload(); } catch (e) { setNotice(e.response?.data?.message || 'Unable to reach the account service. Please check that the API is running and try again.'); } };
  return <div className="app-shell auth-page"><div className="brand auth-brand"><span className="brand-mark"><BookOpen size={18}/></span><span>BookNest<span className="brand-dot">.</span></span></div><AuthModal onClose={() => navigate('/books')} onSubmit={submit}/>{notice && <div className="toast">{notice}</div>}</div>;
}

