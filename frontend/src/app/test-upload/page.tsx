'use client';

import { AppProvider } from '@/contexts/AppContext';
import UploadTest from '@/components/test/UploadTest';

export default function TestUploadPage() {
  return (
    <AppProvider>
      <UploadTest />
    </AppProvider>
  );
}
