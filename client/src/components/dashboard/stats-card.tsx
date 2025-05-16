import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardFooter
} from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  bgColor: string;
  linkText: string;
  linkHref: string;
}

export function StatsCard({ title, value, icon, bgColor, linkText, linkHref }: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <Link href={linkHref}>
            <a className="font-medium text-indigo-600 hover:text-indigo-500">
              {linkText} <span aria-hidden="true">&rarr;</span>
            </a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
