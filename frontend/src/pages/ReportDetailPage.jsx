import { useParams } from 'react-router-dom';
import { ReportDetail } from '../components/reports/ReportDetail';

export function ReportDetailPage() {
  const { id } = useParams();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReportDetail id={id} />
    </div>
  );
}
