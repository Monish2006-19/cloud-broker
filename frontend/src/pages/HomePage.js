import React from 'react';
import { Link } from 'react-router-dom';
import { FiUpload, FiCloud, FiZap, FiMonitor, FiShield, FiTrendingUp } from 'react-icons/fi';

const HomePage = () => {
  const features = [
    {
      icon: FiUpload,
      title: 'Code Upload',
      description: 'Upload your source code in zip format. Supports Node.js, Python, .NET, and Java applications.',
      color: 'blue'
    },
    {
      icon: FiZap,
      title: 'Auto-Containerization',
      description: 'Automatic runtime detection and optimized Dockerfile generation with security best practices.',
      color: 'yellow'
    },
    {
      icon: FiCloud,
      title: 'Azure Deployment',
      description: 'Seamless deployment to Azure Container Instances with auto-scaling capabilities.',
      color: 'green'
    },
    {
      icon: FiMonitor,
      title: 'Real-time Monitoring',
      description: 'Monitor your applications with live metrics, health checks, and performance insights.',
      color: 'purple'
    },
    {
      icon: FiShield,
      title: 'Security First',
      description: 'Multi-stage builds, non-root containers, and secure Azure resource management.',
      color: 'red'
    },
    {
      icon: FiTrendingUp,
      title: 'Auto-Scaling',
      description: 'Automatic resource scaling based on demand with cost optimization.',
      color: 'indigo'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Your Code',
      description: 'Package your application source code in a zip file and upload it through our intuitive interface.'
    },
    {
      number: '02',
      title: 'Automatic Processing',
      description: 'Our system detects your runtime, generates optimized Dockerfiles, and prepares your application for containerization.'
    },
    {
      number: '03',
      title: 'Deploy to Azure',
      description: 'Your containerized application is automatically deployed to Azure with proper networking and scaling configuration.'
    },
    {
      number: '04',
      title: 'Monitor & Scale',
      description: 'Access real-time metrics, health status, and let the system automatically scale based on demand.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 fade-in">
            Automated Cloud Brokerage
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto slide-up">
            Transform your source code into scalable cloud applications with our 
            <span className="font-semibold"> Code-to-Container (C2C)</span> pipeline
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up">
            <Link 
              to="/upload"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              Start Deploying
            </Link>
            <Link 
              to="/dashboard"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to deploy and manage applications in the cloud
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl card-shadow hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`text-2xl text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From code to cloud in four simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start mb-12 last:mb-0">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
                  {step.number}
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Deploy Your Application?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of developers who trust our platform for their cloud deployments
          </p>
          <Link 
            to="/upload"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;