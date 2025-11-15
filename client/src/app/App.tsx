import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@shared/ui/Layout';
import { ListPage } from '@pages/ListPage';
import { ItemPage } from '@pages/ItemPage';
import { StatsPage } from '@pages/StatsPage';
import { NotFoundPage } from '@pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/list" replace />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/item/:id" element={<ItemPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};


