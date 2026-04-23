import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react';

const AIInsights = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No insights available yet. Start adding expenses!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                suggestion.type === 'warning'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : suggestion.type === 'info'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : suggestion.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <div className="flex items-start space-x-3">
                {suggestion.type === 'warning' && <AlertTriangle className="text-red-500 mt-0.5" />}
                {suggestion.type === 'info' && <Info className="text-blue-500 mt-0.5" />}
                {suggestion.type === 'success' && <CheckCircle className="text-green-500 mt-0.5" />}
                {suggestion.type === 'tip' && <Lightbulb className="text-yellow-500 mt-0.5" />}
                <p className="text-sm">{suggestion.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;  