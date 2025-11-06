import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import SearchPage from './pages/SearchPage';
import UploadPage from './pages/UploadPage';
import TrackPage from './pages/TrackPage';
import './styles/index.css';
import './styles/theme.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="playlists" element={<PlaylistsPage />} />
              <Route path="playlists/:playlistId" element={<PlaylistDetailPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="music/:id" element={<TrackPage />} />
              {/* Роут для поддомена music.k-connect.ru - путь просто /:id */}
              <Route path=":id" element={<TrackPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;

