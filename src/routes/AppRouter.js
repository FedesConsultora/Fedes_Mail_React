import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Inbox from '../pages/Inbox';
import EmailDetail from '../pages/EmailDetail';
import NotFound from '../pages/NotFound';
import Sent from '../pages/Sent';     
import Starred from '../pages/Starred';
import Trash from '../pages/Trash';
import Spam from '../pages/Spam';

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
          path="/starred"
          element={
            <MainLayout>
              <Starred />
            </MainLayout>
          }
        />
        <Route
          path="/trash"
          element={
            <MainLayout>
              <Trash />
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
        <Route
          path="/trash/email/:id"
          element={
            <MainLayout>
              <EmailDetail />
            </MainLayout>
          }
        />

        <Route path="/spam/email/:id"     element={<MainLayout><EmailDetail /></MainLayout>} />
        <Route
          path="/spam"
          element={
            <MainLayout>
              <Spam />
            </MainLayout>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
