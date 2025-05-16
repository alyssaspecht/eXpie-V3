import { SiSlack, SiGmail, SiGooglecalendar, SiOpenai, SiCoda } from 'react-icons/si';
import { FaMicrophone, FaGraduationCap } from 'react-icons/fa';

interface ToolConnectorProps {
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  onToggle: () => void;
  iconColor?: string;
}

export function ToolConnector({ 
  name, 
  icon, 
  description, 
  isConnected, 
  onToggle,
  iconColor = 'text-gray-600'
}: ToolConnectorProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'slack':
        return <SiSlack className={`h-6 w-6 ${iconColor}`} />;
      case 'gmail':
        return <SiGmail className={`h-6 w-6 ${iconColor}`} />;
      case 'fireflies':
        return <FaMicrophone className={`h-6 w-6 ${iconColor}`} />;
      case 'calendar':
        return <SiGooglecalendar className={`h-6 w-6 ${iconColor}`} />;
      case 'openai':
        return <SiOpenai className={`h-6 w-6 ${iconColor}`} />;
      case 'coda':
        return <SiCoda className={`h-6 w-6 ${iconColor}`} />;
      case 'learning':
        return <FaGraduationCap className={`h-6 w-6 ${iconColor}`} />;
      default:
        return (
          <svg className={`h-6 w-6 ${iconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  return (
    <div 
      className="relative border rounded-lg border-gray-300 bg-white px-6 py-5 flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex-shrink-0">
        {renderIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <a className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true"></span>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-500 truncate">{description}</p>
        </a>
      </div>
      <div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isConnected ? 'Connected' : 'Connect'}
        </span>
      </div>
    </div>
  );
}
