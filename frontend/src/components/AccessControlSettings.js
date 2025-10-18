import React, { useState } from 'react';
import { FiLock, FiGlobe, FiShield, FiAlertTriangle } from 'react-icons/fi';

const AccessControlSettings = ({ onAccessTypeChange, currentAccessType = 'public' }) => {
  const [selectedType, setSelectedType] = useState(currentAccessType);

  const accessTypes = [
    {
      id: 'public',
      name: 'Public Access',
      icon: FiGlobe,
      description: 'Anyone with the URL can access your application',
      warning: 'Your application will be publicly accessible on the internet',
      color: 'red',
      recommended: false
    },
    {
      id: 'authenticated',
      name: 'Token-Based Access',
      icon: FiShield,
      description: 'Requires authentication token to access the application',
      warning: 'Users need to include access token in requests',
      color: 'yellow',
      recommended: true
    },
    {
      id: 'private',
      name: 'Private Network Only',
      icon: FiLock,
      description: 'Only accessible within Azure virtual network',
      warning: 'Application will not have public internet access',
      color: 'green',
      recommended: false
    }
  ];

  const handleAccessTypeChange = (type) => {
    setSelectedType(type);
    onAccessTypeChange(type);
  };

  return (
    <div className="bg-white p-6 rounded-xl card-shadow">
      <div className="flex items-center space-x-2 mb-4">
        <FiShield className="text-xl text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">
          Access Control Settings
        </h3>
      </div>

      <div className="space-y-4">
        {accessTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <div
              key={type.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAccessTypeChange(type.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? `bg-${type.color}-100` : 'bg-gray-100'
                }`}>
                  <Icon className={`text-lg ${
                    isSelected ? `text-${type.color}-600` : 'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-semibold ${
                      isSelected ? `text-${type.color}-800` : 'text-gray-800'
                    }`}>
                      {type.name}
                    </h4>
                    {type.recommended && (
                      <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {type.description}
                  </p>
                  
                  <div className={`flex items-center space-x-1 mt-2 text-xs ${
                    type.color === 'red' ? 'text-red-600' : 
                    type.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    <FiAlertTriangle className="text-xs" />
                    <span>{type.warning}</span>
                  </div>
                </div>
                
                <input
                  type="radio"
                  name="accessType"
                  value={type.id}
                  checked={isSelected}
                  onChange={() => handleAccessTypeChange(type.id)}
                  className={`w-4 h-4 text-${type.color}-600`}
                />
              </div>
              
              {isSelected && type.id === 'authenticated' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">
                    How Token-Based Access Works:
                  </h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• System generates unique access token for your app</li>
                    <li>• Users must include token in request headers</li>
                    <li>• Token expires after 24 hours (configurable)</li>
                    <li>• You can revoke access anytime</li>
                  </ul>
                </div>
              )}
              
              {isSelected && type.id === 'private' && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800 mb-2">
                    Private Network Requirements:
                  </h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Azure Virtual Network (VNet) required</li>
                    <li>• VPN or ExpressRoute for external access</li>
                    <li>• Enhanced security and compliance</li>
                    <li>• No internet exposure</li>
                  </ul>
                </div>
              )}
              
              {isSelected && type.id === 'public' && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <h5 className="font-medium text-red-800 mb-2">
                    ⚠️ Security Warning:
                  </h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Application will be accessible to anyone on the internet</li>
                    <li>• No authentication or access control</li>
                    <li>• Consider using authenticated access for sensitive applications</li>
                    <li>• Monitor for unauthorized usage</li>
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-2">
          💡 Security Best Practices:
        </h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use token-based access for production applications</li>
          <li>• Enable logging and monitoring for all access types</li>
          <li>• Regularly rotate access tokens</li>
          <li>• Consider private networks for sensitive workloads</li>
          <li>• Implement application-level authentication when possible</li>
        </ul>
      </div>
    </div>
  );
};

export default AccessControlSettings;