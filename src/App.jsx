import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BooksPage from './pages/Books.jsx';
import AuthPage from './pages/Auth.jsx';
import ReadingListsPage from './pages/ReadingLists.jsx';
import AboutPage from './pages/About.jsx';
function App() { return <BrowserRouter><Routes><Route path="/books" element={<Protected><BooksPage/></Protected>}/><Route path="/signin" element={<AuthPage/>}/><Route path="/reading-lists" element={<ReadingListsPage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="*" element={<Navigate to="/books" replace/>}/></Routes></BrowserRouter>; }
function Protected({ children }) { return localStorage.getItem('meridian-token') ? children : <AuthPage/>; }


export default App;
