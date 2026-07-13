interface StatusBadgeProps {
  status: string | null | undefined;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: string | null | undefined) => {
    switch (status) {
      case 'HADIR':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Hadir'
        };
      case 'TERLAMBAT':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Terlambat'
        };
      case 'PULANG_CEPAT':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          label: 'Pulang Cepat'
        };
      case 'ALPHA':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Alpha'
        };
      case 'CUTI':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Cuti'
        };
      case 'IZIN':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          label: 'Izin'
        };
      case 'ACTIVE':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'Aktif'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
