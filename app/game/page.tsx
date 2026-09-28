import PongGame from '@/components/PongGame';

export default function GamePage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">Игра</h1>
      <PongGame />
    </div>
  );
}