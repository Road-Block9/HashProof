import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UploadDocumentPage from "./pages/UploadDocumentPage.jsx";
import UploadVersionPage from "./pages/UploadVersionPage.jsx";
import VerifyDocumentPage from "./pages/VerifyDocumentPage.jsx";
import VersionHistoryPage from "./pages/VersionHistoryPage.jsx";
import RevokeDocumentPage from "./pages/RevokeDocumentPage.jsx";
import DocumentDetailsPage from "./pages/DocumentDetailsPage.jsx";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadDocumentPage />} />
        <Route path="/upload-version" element={<UploadVersionPage />} />
        <Route path="/verify" element={<VerifyDocumentPage />} />
        <Route path="/versions" element={<VersionHistoryPage />} />
        <Route path="/revoke" element={<RevokeDocumentPage />} />
        <Route path="/details" element={<DocumentDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
