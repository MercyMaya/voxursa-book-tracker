import { Star } from 'lucide-react';

interface Props {
  value: number;                 // 0–5
  onChange?: (v: number) => void;
  disabled?: boolean;
}

export default function RatingStars({ value, onChange, disabled }: Props) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(i)}
        >
          <Star
            className={`h-5 w-5 ${
              i <= value ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-400'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
