import React, { useState, useEffect } from 'react';
import { Menu, X, Play, Users, Trophy, Clock, ArrowRight, Star, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Users, title: "Smart Member Management", desc: "Advanced tracking and analytics for all your members" },
    { icon: Trophy, title: "Performance Analytics", desc: "Detailed insights into member progress and gym performance" },
    { icon: Clock, title: "24/7 Access Control", desc: "Seamless entry management with smart access systems" }
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Gym Owner", text: "FitHub transformed how we manage our gym. Member retention increased by 40%!", rating: 5 },
    { name: "Mike Chen", role: "Fitness Manager", text: "The analytics dashboard gives us insights we never had before. Game changer!", rating: 5 },
    { name: "Lisa Rodriguez", role: "Studio Director", text: "Our members love the seamless experience. Check-ins are now effortless.", rating: 5 }
  ];

  return (
    <div className="bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-black/95 backdrop-blur-sm border-b border-yellow-400/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              FitHub
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-yellow-400 transition-colors font-medium">
                  {item}
                </a>
              ))}
            </div>
            
            <div className="hidden md:flex space-x-4">
              <button className="px-4 py-2 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 font-semibold">
                Login
              </button>
              <button className="px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 transition-all duration-300 font-semibold">
                Start Free Trial
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-yellow-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black border-t border-yellow-400/20">
            <div className="px-4 py-6 space-y-4">
              {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="block hover:text-yellow-400 transition-colors font-medium">
                  {item}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                <button className="w-full px-4 py-2 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 font-semibold">
                  Login
                </button>
                <button className="w-full px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-300 transition-all duration-300 font-semibold">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,0,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,0,0.05),transparent_70%)]"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                TRANSFORM
              </span>
              <br />
              <span className="text-white">YOUR GYM</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-medium">
              Revolutionary gym management system that powers member engagement, 
              streamlines operations, and grows your fitness business
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group px-8 py-4 bg-yellow-400 text-black font-bold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/25 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              
              <button className="group px-8 py-4 border-2 border-yellow-400 text-yellow-400 font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all duration-300 flex items-center gap-2">
                <Play size={20} className="group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-yellow-400" size={16} />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-yellow-400" size={16} />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-yellow-400" size={16} />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-yellow-400">POWERFUL</span> FEATURES
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage your gym efficiently and grow your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-gray-900/50 border border-gray-800 hover:border-yellow-400 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-yellow-400 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Gyms" },
              { number: "500K+", label: "Members Managed" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl md:text-6xl font-black mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-800">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-900" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-yellow-400">TRUSTED</span> BY FITNESS PROS
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-black/50 p-8 border border-gray-800 hover:border-yellow-400 transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-yellow-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-black via-yellow-900/20 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            READY TO <span className="text-yellow-400">DOMINATE</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of gym owners who've transformed their business with FitHub
          </p>
          <button className="group px-12 py-6 bg-yellow-400 text-black font-black text-xl hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/25 flex items-center gap-3 mx-auto">
            START YOUR FREE TRIAL NOW
            <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-yellow-400/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent mb-4">
                FitHub
              </div>
              <p className="text-gray-400">
                The ultimate gym management solution for modern fitness businesses.
              </p>
            </div>
            
            {[
              { title: "Product", items: ["Features", "Pricing", "API", "Documentation"] },
              { title: "Company", items: ["About", "Careers", "Press", "Contact"] },
              { title: "Support", items: ["Help Center", "Community", "Training", "Status"] }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold text-white mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 FitHub. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;