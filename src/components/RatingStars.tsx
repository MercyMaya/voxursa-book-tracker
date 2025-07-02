import { Star, StarOff } from 'lucide-react';

export default function RatingStars({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) =>
        (value ?? 0) >= n ? (
          <Star
            key={n}
            className="h-5 w-5 cursor-pointer text-yellow-400"
            onClick={() => onChange(n)}
          />
        ) : (
          <StarOff
            key={n}
            className="h-5 w-5 cursor-pointer text-gray-300"
            onClick={() => onChange(n)}
          />
        ),
      )}
    </div>
  );
}
