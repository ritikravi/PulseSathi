import { useQuery } from '@tanstack/react-query';
import { MessageCircle, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { whatsapp } from '../lib/api';
import { format } from 'date-fns';

export default function WhatsAppHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['whatsapp-messages'],
    queryFn: async () => {
      const r = await whatsapp.getMessages({ limit: 50 });
      return r.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Loading messages...</div>
      </div>
    );
  }

  const messages = data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">WhatsApp History</h1>
        <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
          DEMO MODE
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">No messages yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Enable WhatsApp reminders in Profile to start receiving messages
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {messages.map((msg: any, i: number) => (
            <MessageRow key={msg._id} msg={msg} isLast={i === messages.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function MessageRow({ msg, isLast }: { msg: any; isLast: boolean }) {
  const isOutgoing = msg.direction === 'outgoing';
  const isSimulated = msg.metadata?.isSimulated;

  const statusIcon = () => {
    if (msg.status === 'delivered' || msg.status === 'read') return <CheckCircle className="w-3.5 h-3.5 text-blue-500" />;
    if (msg.status === 'failed') return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    return <Clock className="w-3.5 h-3.5 text-gray-400" />;
  };

  const responseColor = msg.responseType === 'TAKEN'
    ? 'bg-green-100 text-green-800'
    : msg.responseType === 'NOT_TAKEN_YET'
    ? 'bg-yellow-100 text-yellow-800'
    : '';

  return (
    <div className={`flex items-start gap-3 p-4 hover:bg-gray-50 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      {/* Direction icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isOutgoing ? 'bg-primary-100' : 'bg-green-100'
      }`}>
        {isOutgoing
          ? <ArrowUpRight className="w-4 h-4 text-primary-600" />
          : <ArrowDownLeft className="w-4 h-4 text-green-600" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-gray-900">
            {isOutgoing ? 'Reminder sent' : 'Patient replied'}
          </span>
          {msg.medicineId?.name && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {msg.medicineId.name}
            </span>
          )}
          {isSimulated && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              simulated
            </span>
          )}
          {msg.responseType && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${responseColor}`}>
              {msg.responseType === 'TAKEN' ? 'हाँ, ले ली' : 'नहीं, अभी नहीं'}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-0.5">
          {msg.phoneNumber} · {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {statusIcon()}
        <span className="text-xs text-gray-400">{msg.status}</span>
      </div>
    </div>
  );
}
