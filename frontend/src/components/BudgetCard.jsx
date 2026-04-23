import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const BudgetCard = ({ budgetStatus }) => {
  const { monthlyBudget, totalExpenses, remaining, percentageUsed, status } = budgetStatus;

  const getProgressColor = () => {
    if (percentageUsed > 80) return 'bg-red-500';
    if (percentageUsed > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIcon = () => {
    if (percentageUsed > 80) return <AlertTriangle className="text-red-600" />;
    if (percentageUsed > 60) return <AlertCircle className="text-yellow-600" />;
    return <CheckCircle className="text-green-600" />;
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        {getIcon()}
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Budget Status</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Monthly Budget</span>
            <span className="font-medium">₹{monthlyBudget.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Spent</span>
            <span className="font-medium">₹{totalExpenses.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Remaining</span>
            <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{remaining.toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{percentageUsed}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor()}`}
                style={{ width: `${percentageUsed}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;