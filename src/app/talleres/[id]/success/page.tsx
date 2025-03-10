import SuccessPage from '../success-page';

export default function Success({ params }: { params: { id: string } }) {
  return <SuccessPage tallerId={params.id} />;
} 