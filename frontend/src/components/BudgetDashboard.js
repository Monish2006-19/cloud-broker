import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { FiDollarSign, FiTrendingUp, FiAlert, FiCheckCircle } from 'react-icons/fi';
import { apiService } from '../services/api';

const BudgetDashboard = () => {
  const [budgetData, setBudgetData] = useState(null);

  // Fetch budget information
  const { data: budgetResponse, isLoading } = useQuery(
    'budget-status',
    () => apiService.getBudgetStatus(),
    {
      refetchInterval: 60000, // Refresh every minute
      retry: false
    }
  );

  useEffect(() => {
    if (budgetResponse?.data) {
      setBudgetData(budgetResponse.data);
    }
  }, [budgetResponse]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl card-shadow">
        <div className="flex items-center space-x-2 mb-4">
          <div className="spinner"></div>
          <span>Loading budget information...</span>
        </div>
      </div>
    );
  }

  const budget = budgetData || {
    totalSpent: 0,
    budgetLimit: 100,
    percentageUsed: 0,
    remainingBudget: 100,
    alertStatus: { level: 'HEALTHY', message: 'Budget usage is healthy', color: 'green' }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'CRITICAL': return <FiAlert className="text-red-600" />;
      case 'WARNING': return <FiTrendingUp className="text-orange-600" />;
      case 'CAUTION': return <FiDollarSign className="text-yellow-600" />;
      default: return <FiCheckCircle className="text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview Card */}
      <div className="bg-white p-6 rounded-xl card-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Azure Student Budget ($100 Credit)
          </h3>
          <div className="flex items-center space-x-2">
            {getAlertIcon(budget.alertStatus.level)}
            <span className={`text-sm font-medium ${
              budget.alertStatus.color === 'red' ? 'text-red-600' :
              budget.alertStatus.color === 'orange' ? 'text-orange-600' :
              budget.alertStatus.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {budget.alertStatus.level}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Budget Usage</span>
            <span className="text-sm font-medium text-gray-800">
              {budget.percentageUsed.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(budget.percentageUsed)}`}
              style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Budget Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${budget.totalSpent.toFixed(2)}
            </div>
            <div className="text-sm text-blue-600">Spent</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${budget.remainingBudget.toFixed(2)}
            </div>
            <div className="text-sm text-green-600">Remaining</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              ${budget.budgetLimit}
            </div>
            <div className="text-sm text-gray-600">Total Credit</div>
          </div>
        </div>

        {/* Alert Message */}
        <div className={`mt-6 p-4 rounded-lg border ${
          budget.alertStatus.color === 'red' ? 'bg-red-50 border-red-200' :
          budget.alertStatus.color === 'orange' ? 'bg-orange-50 border-orange-200' :
          budget.alertStatus.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
          'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center space-x-2">
            {getAlertIcon(budget.alertStatus.level)}
            <span className={`font-medium ${
              budget.alertStatus.color === 'red' ? 'text-red-800' :
              budget.alertStatus.color === 'orange' ? 'text-orange-800' :
              budget.alertStatus.color === 'yellow' ? 'text-yellow-800' : 'text-green-800'
            }`}>
              {budget.alertStatus.message}
            </span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown by Resource */}
      {budget.resourceBreakdown && (
        <div className="bg-white p-6 rounded-xl card-shadow">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Cost Breakdown by Resource Group
          </h4>
          <div className="space-y-3">
            {Object.entries(budget.resourceBreakdown).map(([resource, cost]) => (
              <div key={resource} className="flex justify-between items-center">
                <span className="text-gray-600">{resource}</span>
                <span className="font-medium">${cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Recommendations */}
      <div className="bg-white p-6 rounded-xl card-shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          💡 Cost Optimization Tips
        </h4>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>Containers automatically stop when idle to save costs</span>
          </div>
          <div className="flex items-start space-x-2">
            <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>Using Container Instances (cheapest option) instead of Kubernetes</span>
          </div>
          <div className="flex items-start space-x-2">
            <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>East US region selected for lowest pricing</span>
          </div>
          <div className="flex items-start space-x-2">
            <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>Resource cleanup after deployment demos</span>
          </div>
        </div>
      </div>

      {/* Faculty Demo Info */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-800 mb-2">
          🎓 Faculty Demo Information
        </h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p>• This budget dashboard shows real-time Azure spending</p>
          <p>• Containers are automatically cleaned up after demo stops</p>
          <p>• $100 Azure student credit provides extensive demo capabilities</p>
          <p>• System optimized for educational use with cost controls</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetDashboard;