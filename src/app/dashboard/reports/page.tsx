'use client';

import toast, { Toaster } from 'react-hot-toast';

export default function ReportsPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const downloadReport = async (type: string, format: 'csv' | 'pdf') => {
    try {
      const res = await fetch(`/api/reports/${type}?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        return toast.error(data.error || 'Download failed');
      }

      console.log(res, 'response of report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${type} report downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error('Server error');
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6 text-center">📑 Reports Dashboard</h1>
     <div className="grid md:grid-cols-3 gap-6">
  {['orders', 'feedback', 'revenue'].map((type) => (
    <div key={type} className="bg-white shadow p-4 rounded text-center">
      <h3 className="font-semibold text-xl mb-3 capitalize">
        {type} Report
      </h3>
      <button
        onClick={() => downloadReport(type, 'csv')}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
      >
        Download CSV
      </button>
      <button
        onClick={() => downloadReport(type, 'pdf')}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Download PDF
      </button>
    </div>
  ))}
</div>
    </div>
  );
}
