import Image from "next/image";
import React from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  Shield, 
  Sparkles, 
  Globe, 
  Camera, 
  Mountain, 
  Star,
  Play,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Clock,
  Award,
  TrendingUp,
  Zap,
  Heart,
  Navigation,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react'

const MyHomepageDesign = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm fixed w-full z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                PakTour AI
              </span>
              <div className="text-xs text-gray-500">Smart Travel Companion</div>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#home" className="text-green-600 font-medium">Home</a>
            <a href="#destinations" className="text-gray-600 hover:text-green-600 transition-colors">Destinations</a>
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition-colors">Reviews</a>
            <a href="#pricing" className="text-gray-600 hover:text-green-600 transition-colors">Pricing</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-green-600 transition-colors font-medium">
              Sign In
            </button>
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg shadow-green-500/25">
              Start Planning
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-20 bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Travel Planning</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Discover
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent"> Pakistan's </span>
              Hidden Wonders
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Let our AI craft personalized journeys through Pakistan's breathtaking landscapes, 
              rich culture, and ancient heritage. From the peaks of K2 to the shores of Karachi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-xl shadow-green-500/30 flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Plan My Adventure</span>
              </button>
              <button className="border-2 border-green-200 text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-500">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">200+</div>
                <div className="text-sm text-gray-500">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.9★</div>
                <div className="text-sm text-gray-500">User Rating</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Plan Your Journey</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Destination</label>
                    <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <select className="flex-1 outline-none text-gray-700">
                        <option>Select destination</option>
                        <option>Lahore - Cultural Hub</option>
                        <option>Hunza - Mountain Paradise</option>
                        <option>Skardu - Adventure Base</option>
                        <option>Karachi - Coastal City</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Duration</label>
                    <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <select className="flex-1 outline-none text-gray-700">
                        <option>Select duration</option>
                        <option>3-5 days</option>
                        <option>1 week</option>
                        <option>2 weeks</option>
                        <option>1 month</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Travel Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Adventure', 'Cultural', 'Relaxed'].map((style) => (
                      <button key={style} className="p-3 border border-gray-200 rounded-lg text-sm hover:border-green-500 hover:bg-green-50 transition-colors">
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200">
                  Generate AI Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent platform combines local expertise with cutting-edge AI to create unforgettable experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Smart Itinerary Planning",
                description: "AI analyzes your preferences, budget, and travel style to create perfect day-by-day plans",
                color: "green"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Real-time Safety Alerts",
                description: "Get instant notifications about weather, security, and travel conditions in your area",
                color: "blue"
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Local Cultural Insights",
                description: "Discover authentic experiences, hidden gems, and cultural etiquette from local experts",
                color: "purple"
              },
              {
                icon: <Camera className="w-8 h-8" />,
                title: "Photo-Perfect Spots",
                description: "AI recommends the best photography locations and optimal timing for stunning shots",
                color: "orange"
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "24/7 AI Assistant",
                description: "Get instant answers about your trip, translations, and emergency assistance anytime",
                color: "red"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Dynamic Optimization",
                description: "Your itinerary adapts in real-time based on weather, crowds, and your feedback",
                color: "green"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow group">
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-6 text-${feature.color}-600 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Pakistan's Most Beautiful Destinations
            </h2>
            <p className="text-xl text-gray-600">
              From majestic mountains to vibrant cities, discover what makes Pakistan extraordinary
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Hunza Valley",
              image: "/pk-spots/hunza-valley.jpg",
              description: "Breathtaking mountain scenery and ancient forts",
              rating: "4.9",
              trips: "2,340",
            },
            {
              name: "Lahore",
              image: "/pk-spots/badshahi-mosque.jpg",
              description: "Rich Mughal heritage and vibrant food culture",
              rating: "4.8",
              trips: "5,120",
            },
            {
              name: "Skardu",
              image: "/pk-spots/skardu.jpg",
              description: "Gateway to world's highest peaks and glacial lakes",
              rating: "4.9",
              trips: "1,890",
            },
            {
              name: "Karachi",
              image: "/pk-spots/mohatta-palace.jpg",
              description: "Bustling metropolis with beautiful coastline",
              rating: "4.6",
              trips: "3,450",
            },
            {
              name: "Swat Valley",
              image: "/pk-spots/swat-valley.jpg",
              description: "Switzerland of Pakistan with lush green valleys",
              rating: "4.8",
              trips: "1,670",
            },
            {
              name: "Islamabad",
              image: "/pk-spots/faisal-mosque.jpg",
              description: "Modern capital nestled in Margalla Hills",
              rating: "4.7",
              trips: "2,890",
            },
          ].map((destination, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer"
            >
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                {destination.image.startsWith("/") ? (
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <span className="text-6xl">{destination.image}</span>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {destination.name}
                </h3>
                <p className="text-gray-600 mb-4">{destination.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {destination.rating}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {destination.trips} trips planned
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Travelers Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our community says about their PakTour AI experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Adventure Photographer",
                image: "👩‍💻",
                text: "PakTour AI helped me discover hidden photography spots in Hunza that I would never have found on my own. The AI's recommendations were spot-on!",
                rating: 5
              },
              {
                name: "Ahmed Hassan",
                role: "Travel Blogger",
                image: "👨‍💼",
                text: "As a Pakistani, I thought I knew my country well. PakTour AI showed me places and experiences I never knew existed. Truly impressive!",
                rating: 5
              },
              {
                name: "Emma Chen",
                role: "Solo Traveler",
                image: "👩‍🎓",
                text: "Traveling solo in Pakistan felt safe and easy with PakTour AI's real-time updates and local insights. An incredible experience!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-100">
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your travel needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Explorer",
                price: "Free",
                description: "Perfect for trying out our AI travel planning",
                features: [
                  "Basic AI itinerary planning",
                  "5 destinations per month",
                  "Community support",
                  "Standard safety alerts"
                ],
                popular: false
              },
              {
                name: "Adventurer",
                price: "$19",
                period: "/month",
                description: "Ideal for frequent travelers and digital nomads",
                features: [
                  "Unlimited AI planning",
                  "Premium destinations",
                  "Real-time optimization",
                  "24/7 AI assistant",
                  "Photo recommendations",
                  "Offline access"
                ],
                popular: true
              },
              {
                name: "Explorer Pro",
                price: "$49",
                period: "/month",
                description: "For travel agencies and professional guides",
                features: [
                  "Everything in Adventurer",
                  "Multiple client management",
                  "Custom branding",
                  "API access",
                  "Analytics dashboard",
                  "Priority support"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 border-2 ${plan.popular ? 'border-green-500 shadow-xl' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-500">{plan.period}</span>}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  plan.popular 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'border-2 border-green-500 text-green-500 hover:bg-green-50'
                }`}>
                  {plan.price === "Free" ? "Get Started" : "Start Free Trial"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-green-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Discover Pakistan with AI?
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Join thousands of travelers who've unlocked Pakistan's hidden beauty with our AI-powered platform.
            Start planning your dream journey today.
          </p>
          <button className="bg-white text-green-600 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-xl flex items-center space-x-2 mx-auto">
            <Zap className="w-6 h-6" />
            <span>Start Your Adventure Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                  <Mountain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">PakTour AI</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Discover Pakistan's beauty through the power of artificial intelligence. 
                Your perfect journey awaits.
              </p>
              <div className="flex space-x-4">
                <Facebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Destinations</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Hunza Valley</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Skardu</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lahore</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karachi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Swat Valley</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+92 300 1234567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@paktour.ai</span>
                </li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PakTour AI. All rights reserved. Made with ❤️ for Pakistan's travelers.</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-110">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default MyHomepageDesign