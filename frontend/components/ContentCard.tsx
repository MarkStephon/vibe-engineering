import { CardData } from '@/types';

interface Props {
  data: CardData;
  onRetry: (id: string, url: string) => void;
}

export default function ContentCard({ data, onRetry }: Props) {
  if (data.status === 'PARSING_PENDING') {
    return (
      <div className="w-full p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="h-4 w-24 bg-slate-100 rounded animate-skeleton mb-4" />
        <div className="h-6 w-3/4 bg-slate-100 rounded animate-skeleton mb-6" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded animate-skeleton" />
          <div className="h-4 w-5/6 bg-slate-100 rounded animate-skeleton" />
          <div className="h-4 w-4/6 bg-slate-100 rounded animate-skeleton" />
        </div>
      </div>
    );
  }

  if (data.status === 'PARSING_FAILED') {
    return (
      <div className="w-full p-6 bg-white rounded-xl border border-red-100 shadow-sm flex flex-col items-center text-center">
        <p className="text-slate-600 mb-4">Unable to parse this link</p>
        <button
          onClick={() => onRetry(data.id, data.url)}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {data.author}
        </span>
        <span className="text-xs text-slate-400">{data.metadata}</span>
      </div>
      
      <a 
        href={data.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
          {data.title}
        </h2>
      </a>

      <div className="space-y-2">
        {data.summary?.map((point, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-slate-300">•</span>
            <p className="text-slate-600 text-sm leading-relaxed">{point}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50">
        <a 
          href={data.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
        >
          View Original Source →
        </a>
      </div>
    </div>
  );
}
