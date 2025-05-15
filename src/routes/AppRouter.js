import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Inbox from '../pages/Inbox';
import EmailDetail from '../pages/EmailDetail';
import NotFound from '../pages/NotFound';
import Sent from '../pages/Sent';     

export default function AppRouter() {
  return (
    <BrowserRouter basename="/FedesMail">
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Inbox />
            </MainLayout>
          }
        />
        <Route
          path="/email/:id"
          element={
            <MainLayout>
              <EmailDetail />
            </MainLayout>
          }
        />
        <Route
          path="/sent"
          element={
            <MainLayout>
              <Sent />                        
            </MainLayout>
          }
        />
        <Route
          path="/sent/email/:id"
          element={
            <MainLayout>
              <EmailDetail />
            </MainLayout>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
