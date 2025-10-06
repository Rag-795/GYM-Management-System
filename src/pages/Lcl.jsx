import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Dumbbell, Users, Calendar, TrendingUp, CheckCircle, Star, ArrowRight, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import {Button} from '../components/Button';
import Lightning from '../components/Lightning';


const Lcl = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Programs', href: '#programs' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Member Management',
      description: 'Efficiently manage member profiles, track attendance, and monitor progress all in one place.'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Class Scheduling',
      description: 'Easy-to-use scheduling system for group classes, personal training sessions, and equipment bookings.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Performance Tracking',
      description: 'Track member progress, set goals, and generate detailed performance analytics and reports.'
    },
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: 'Equipment Management',
      description: 'Keep track of equipment maintenance, availability, and usage patterns for optimal gym operations.'
    }
  ];

  const programs = [
    {
      name: 'Strength Training',
      duration: '45 mins',
      level: 'All Levels',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400'
    },
    {
      name: 'HIIT Cardio',
      duration: '30 mins',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400'
    },
    {
      name: 'Yoga & Flexibility',
      duration: '60 mins',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'
    },
    {
      name: 'CrossFit',
      duration: '50 mins',
      level: 'Advanced',
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400'
    }
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      price: '$29',
      period: '/month',
      features: ['Access to gym equipment', 'Locker room access', 'Free fitness assessment', 'Mobile app access'],
      recommended: false
    },
    {
      name: 'Premium',
      price: '$59',
      period: '/month',
      features: ['Everything in Basic', 'Unlimited group classes', 'Personal training session', 'Nutrition consultation', 'Priority booking'],
      recommended: true
    },
    {
      name: 'Elite',
      price: '$99',
      period: '/month',
      features: ['Everything in Premium', '4 PT sessions/month', 'Custom meal plans', 'Recovery zone access', 'Guest passes (2/month)'],
      recommended: false
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Fitness Enthusiast',
      content: 'FitHub transformed my fitness journey. The trainers are amazing and the facility is top-notch!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    },
    {
      name: 'Mike Chen',
      role: 'Marathon Runner',
      content: 'The best gym management system I\'ve experienced. Booking classes is seamless and tracking progress is motivating.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Yoga Instructor',
      content: 'As an instructor, FitHub makes my life easier. Scheduling, member management, everything is perfect!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    }
  ];

  // Navigation handlers for CTAs
  const goToSignup = () => navigate('/auth/signup');
  const goToLogin = () => navigate('/auth/login');
  const goToAdmin = () => navigate('/admin/dashboard');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-black/95 backdrop-blur-sm z-50 border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-8 w-8 text-yellow-400" />
                <span className="text-2xl font-black text-yellow-400">FitHub</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-300 hover:text-yellow-400 transition-colors font-semibold"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-yellow-400"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 border-b border-yellow-400/20">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-yellow-400 block px-3 py-2 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-16 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920')] bg-cover bg-center opacity-10">
        </div>
        <Lightning hue={50} xOffset={-0.7} speed={1} intensity={1} size={1} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="text-yellow-400">TRANSFORM</span><br />
                YOUR GYM<br />
                EXPERIENCE
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Revolutionize your fitness facility with our cutting-edge gym management system. 
                Streamline operations, boost member engagement, and grow your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className='btn-primary' onClick={goToSignup}>
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>

                <button onClick={goToLogin} className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all cursor-pointer">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-8 mt-6">
                <div>
                  <p className="text-3xl font-bold text-yellow-400">10K+</p>
                  <p className="text-gray-400">Active Members</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-400">500+</p>
                  <p className="text-gray-400">Partner Gyms</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-400">98%</p>
                  <p className="text-gray-400">Satisfaction</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-yellow-400/20 blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600" 
                alt="Gym" 
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              POWERFUL <span className="text-yellow-400">FEATURES</span>
            </h2>
            <p className="text-xl text-gray-400">Everything you need to run your gym efficiently</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-black border border-yellow-400/20 rounded-xl p-6 hover:border-yellow-400 transition-all hover:transform hover:scale-105"
              >
                <div className="text-yellow-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              OUR <span className="text-yellow-400">PROGRAMS</span>
            </h2>
            <p className="text-xl text-gray-400">Diverse fitness programs for every goal</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((program, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-xl hover:transform hover:scale-105 transition-all"
              >
                <img 
                  src={program.image} 
                  alt={program.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold mb-2">{program.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>{program.duration}</span>
                    <span>•</span>
                    <span>{program.level}</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              MEMBERSHIP <span className="text-yellow-400">PLANS</span>
            </h2>
            <p className="text-xl text-gray-400">Choose the perfect plan for your fitness journey</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.recommended 
                    ? 'bg-yellow-400 text-black transform scale-105' 
                    : 'bg-black border border-yellow-400/20'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-black text-yellow-400 px-4 py-1 rounded-full text-sm font-bold">
                      RECOMMENDED
                    </span>
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-4 ${plan.recommended ? 'text-black' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-5xl font-black ${plan.recommended ? 'text-black' : 'text-yellow-400'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${plan.recommended ? 'text-black/70' : 'text-gray-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className={`h-5 w-5 mr-3 ${plan.recommended ? 'text-black' : 'text-yellow-400'}`} />
                      <span className={plan.recommended ? 'text-black' : 'text-gray-300'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                    className={`w-full cursor-pointer py-3 rounded-full font-bold transition-all duration-300 transform ${
                        plan.recommended
                        ? 'bg-black text-yellow-400 hover:bg-gray-900 hover:scale-105 hover:shadow-2xl hover:shadow-black-400/25'
                        : 'btn-primary flex justify-center'
                    }`}
                >
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              MEMBER <span className="text-yellow-400">STORIES</span>
            </h2>
            <p className="text-xl text-gray-400">Hear from our satisfied members</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-xl p-6 border border-yellow-400/20 hover:border-yellow-400 transition-all"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-yellow-400 to-yellow-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
            READY TO TRANSFORM YOUR FITNESS?
          </h2>
          <p className="text-xl text-black/80 mb-8">
            Join thousands of members who have already transformed their lives with FitHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={goToSignup} className="bg-black text-yellow-400 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-900 cursor-pointer transition-all">
              Start Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 py-12 border-t border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dumbbell className="h-8 w-8 text-yellow-400" />
                <span className="text-2xl font-black text-yellow-400">FitHub</span>
              </div>
              <p className="text-gray-400">
                Your ultimate gym management solution for a better fitness experience.
              </p>
              <div className="flex space-x-4 mt-6">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                <Youtube className="h-6 w-6 text-gray-400 hover:text-yellow-400 cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-yellow-400">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-yellow-400">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yellow-400">Programs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yellow-400">Membership</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yellow-400">Schedule</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-yellow-400">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-yellow-400">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yellow-400">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yellow-400">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yellow-400">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-yellow-400">Contact Info</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400">
                  <Phone className="h-5 w-5 mr-3 text-yellow-400" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="h-5 w-5 mr-3 text-yellow-400" />
                  info@fithub.com
                </li>
                <li className="flex items-center text-gray-400">
                  <MapPin className="h-5 w-5 mr-3 text-yellow-400" />
                  123 Fitness St, Gym City
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-yellow-400/20 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 FitHub. All rights reserved. | Built with 💪 and dedication
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Lcl;