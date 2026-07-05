import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './pages/Overview';
import { CreatePoll } from './pages/CreatePoll';
import { AllPolls } from './pages/AllPolls';
import { PollDetails } from './pages/PollDetails';
import { AnalyticsGlobal } from './pages/AnalyticsGlobal';

export default function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/polls" element={<AllPolls />} />
        <Route path="/polls/create" element={<CreatePoll />} />
        <Route path="/poll/:id" element={<PollDetails />} />
        <Route path="/analytics" element={<AnalyticsGlobal />} />
      </Routes>
    </DashboardLayout>
  );
}