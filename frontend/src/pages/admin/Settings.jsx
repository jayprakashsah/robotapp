import React, { useState } from 'react';
import { 
  Save, Globe, CreditCard, Mail, Bell, Shield, 
  Database, Cloud, Users, ShoppingBag, Truck, Lock
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: 'SUPEREMO Store',
    storeEmail: 'support@superemo.com',
    storePhone: '+91 9876543210',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    maintenanceMode: false,
    enableNotifications: true,
    enableEmailAlerts: true,
    orderConfirmationEmail: true,
    shippingEnabled: true,
    taxPercentage: 18,
    lowStockThreshold: 5
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const settingsSections = [
    {
      title: 'Store Settings',
      icon: <ShoppingBag className="h-5 w-5" />,
      fields: [
        {
          key: 'storeName',
          label: 'Store Name',
          type: 'text',
          placeholder: 'Enter store name'
        },
        {
          key: 'storeEmail',
          label: 'Store Email',
          type: 'email',
          placeholder: 'contact@yourstore.com'
        },
        {
          key: 'storePhone',
          label: 'Store Phone',
          type: 'tel',
          placeholder: '+91 1234567890'
        },
        {
          key: 'currency',
          label: 'Currency',
          type: 'select',
          options: ['INR', 'USD', 'EUR', 'GBP']
        },
        {
          key: 'timezone',
          label: 'Timezone',
          type: 'select',
          options: ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London']
        }
      ]
    },
    {
      title: 'Order Settings',
      icon: <CreditCard className="h-5 w-5" />,
      fields: [
        {
          key: 'shippingEnabled',
          label: 'Enable Shipping',
          type: 'switch'
        },
        {
          key: 'taxPercentage',
          label: 'Tax Percentage (%)',
          type: 'number',
          min: 0,
          max: 100
        },
        {
          key: 'orderConfirmationEmail',
          label: 'Send Order Confirmation Email',
          type: 'switch'
        }
      ]
    },
    {
      title: 'Notification Settings',
      icon: <Bell className="h-5 w-5" />,
      fields: [
        {
          key: 'enableNotifications',
          label: 'Enable Notifications',
          type: 'switch'
        },
        {
          key: 'enableEmailAlerts',
          label: 'Enable Email Alerts',
          type: 'switch'
        }
      ]
    },
    {
      title: 'Inventory Settings',
      icon: <Database className="h-5 w-5" />,
      fields: [
        {
          key: 'lowStockThreshold',
          label: 'Low Stock Threshold',
          type: 'number',
          min: 1,
          max: 100
        }
      ]
    },
    {
      title: 'Security',
      icon: <Shield className="h-5 w-5" />,
      fields: [
        {
          key: 'maintenanceMode',
          label: 'Maintenance Mode',
          type: 'switch'
        }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your store settings</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section, index) => (
          <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                  {section.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="sm:w-1/3">
                    <label className="block text-sm font-medium text-gray-900">
                      {field.label}
                    </label>
                    {field.description && (
                      <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                    )}
                  </div>
                  
                  <div className="sm:w-2/3">
                    {field.type === 'switch' ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    ) : field.type === 'select' ? (
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={settings[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={settings[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;