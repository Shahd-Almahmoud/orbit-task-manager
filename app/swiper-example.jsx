'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { 
  FiCalendar, 
  FiBriefcase, 
  FiUsers, 
  FiStar, 
  FiArrowRight,
  FiChevronRight,
  FiHeart,
  FiClock,
  FiMapPin,
  FiUser
} from 'react-icons/fi'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

import '@/assets/styles/home.scss'

export default function HomePage() {
  const [stats, setStats] = useState(null)
  const [mounted, setMounted] = useState(false)

  // Hero slider data
  const heroSlides = [
    {
      id: 1,
      title: 'Plan Your Perfect Event',
      subtitle: 'Discover amazing venues and services for any occasion',
      image: '/images/hero/event-planning.webp',
      ctaText: 'Get Started',
      ctaLink: '/events',
      secondaryCta: 'Learn More',
      secondaryLink: '/about-us'
    },
    {
      id: 2,
      title: 'Find Top Service Providers',
      subtitle: 'Connect with the best professionals in the industry',
      image: '/images/hero/service-providers.jpg',
      ctaText: 'Find Providers',
      ctaLink: '/services',
      secondaryCta: 'Become a Provider',
      secondaryLink: '/register'
    },
    {
      id: 3,
      title: 'Create Unforgettable Moments',
      subtitle: 'From weddings to corporate events, we make it happen',
      image: '/images/hero/events.webp',
      ctaText: 'Explore Events',
      ctaLink: '/events',
      secondaryCta: 'Contact Us',
      secondaryLink: '/contact'
    }
  ]

  // Featured services
  const featuredServices = [
    {
      id: 1,
      name: 'Wedding Planning',
      description: 'Complete wedding planning services from engagement to honeymoon',
      icon: <FiHeart />,
      price: 'Starting at $2,000',
      image: '/images/services/wedding.jpg'
    },
    {
      id: 2,
      name: 'Catering Services',
      description: 'Exquisite cuisine for any event size or dietary requirement',
      icon: <FiBriefcase />,
      price: 'Starting at $25/person',
      image: '/images/services/catering.jpg'
    },
    {
      id: 3,
      name: 'Photography & Video',
      description: 'Capture your special moments with professional photographers',
      icon: <FiStar />,
      price: 'Starting at $500',
      image: '/images/services/photography.jpg'
    },
    {
      id: 4,
      name: 'Venue Decoration',
      description: 'Transform any space into your dream venue',
      icon: <FiCalendar />,
      price: 'Starting at $1,000',
      image: '/images/services/decoration.jpg'
    }
  ]

  // Upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Wedding Expo 2024',
      date: 'December 15, 2024',
      location: 'Convention Center, NYC',
      attendees: 500,
      image: '/images/events/wedding-expo.jpg'
    },
    {
      id: 2,
      title: 'Corporate Gala Night',
      date: 'January 20, 2025',
      location: 'Grand Hotel, LA',
      attendees: 300,
      image: '/images/events/corporate-gala.jpg'
    },
    {
      id: 3,
      title: 'Music Festival',
      date: 'February 10, 2025',
      location: 'Central Park, Chicago',
      attendees: 2000,
      image: '/images/events/music-festival.jpg'
    }
  ]

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Bride',
      image: '/images/testimonials/sarah.jpg',
      text: 'Amazing platform! Found the perfect wedding planner and venue. Our special day was absolutely perfect!',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Event Organizer',
      image: '/images/testimonials/michael.jpg',
      text: 'The service providers on this platform are top-notch. Highly recommended for any event planning needs.',
      rating: 5
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Corporate Client',
      image: '/images/testimonials/emily.jpg',
      text: 'Excellent experience from start to finish. Great communication and professional service throughout.',
      rating: 5
    }
  ]

  useEffect(() => {
    setMounted(true)
    // Simulate fetching stats
    setStats({
      events: 1250,
      providers: 500,
      clients: 10000,
      years: 5
    })
  }, [])

  // Don't render stats until mounted on client
  if (!mounted || !stats) {
    return (
      <div className="home-page">
        {/* Hero Slider Section - Static content */}
        <section className="hero-section">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            effect="fade"
            loop={true}
            className="hero-slider"
          >
            {heroSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="hero-slide">
                  <div className="hero-bg">
                    <div className="hero-overlay"></div>
                    <div 
                      className="hero-image"
                      style={{ backgroundImage: `url(${slide.image})` }}
                    ></div>
                  </div>
                  <div className="hero-content container">
                    <h1 className="hero-title animate-fadeInUp">{slide.title}</h1>
                    <p className="hero-subtitle animate-fadeInUp animation-delay-1">
                      {slide.subtitle}
                    </p>
                    <div className="hero-buttons animate-fadeInUp animation-delay-2">
                      <Link href={slide.ctaLink} className="btn-primary">
                        {slide.ctaText} <FiArrowRight />
                      </Link>
                      <Link href={slide.secondaryLink} className="btn-secondary">
                        {slide.secondaryCta}
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Stats Section - Loading skeleton */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="stat-item">
                  <div className="stat-number loading-skeleton">---</div>
                  <div className="stat-label loading-skeleton">Loading</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="services-section">
          <div className="container">
            <div className="section-header">
              <h2>Featured Services</h2>
              <p>Discover our most popular services trusted by thousands of clients</p>
            </div>
            <div className="services-grid">
              {featuredServices.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-price">{service.price}</div>
                  <Link href="/services" className="service-link">
                    Learn More <FiChevronRight />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="events-section">
          <div className="container">
            <div className="section-header">
              <h2>Upcoming Events</h2>
              <p>Join these exciting events happening near you</p>
            </div>
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-image">
                    <div className="event-date-badge">
                      <FiCalendar />
                      <span>{event.date}</span>
                    </div>
                  </div>
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <div className="event-details">
                      <div className="event-location">
                        <FiMapPin />
                        <span>{event.location}</span>
                      </div>
                      <div className="event-attendees">
                        <FiUsers />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                    <Link href={`/events/${event.id}`} className="event-link">
                      View Details <FiChevronRight />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-footer">
              <Link href="/events" className="btn-outline">
                View All Events <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <div className="container">
            <div className="section-header">
              <h2>How It Works</h2>
              <p>Simple steps to plan your perfect event</p>
            </div>
            <div className="steps-grid">
              <div className="step">
                <div className="step-number">01</div>
                <div className="step-icon">📝</div>
                <h3>Create Account</h3>
                <p>Sign up for free and tell us about your event needs</p>
              </div>
              <div className="step">
                <div className="step-number">02</div>
                <div className="step-icon">🔍</div>
                <h3>Browse & Compare</h3>
                <p>Explore top providers and compare their services</p>
              </div>
              <div className="step">
                <div className="step-number">03</div>
                <div className="step-icon">💬</div>
                <h3>Connect & Book</h3>
                <p>Contact providers and book your perfect service</p>
              </div>
              <div className="step">
                <div className="step-number">04</div>
                <div className="step-icon">✨</div>
                <h3>Enjoy Your Event</h3>
                <p>Sit back and enjoy your perfectly planned event</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div className="container">
            <div className="section-header">
              <h2>What Our Clients Say</h2>
              <p>Trusted by thousands of happy customers</p>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-card">
                  <div className="testimonial-quote">"</div>
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <FiUser />
                    </div>
                    <div className="author-info">
                      <h4>{testimonial.name}</h4>
                      <span>{testimonial.role}</span>
                    </div>
                  </div>
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Plan Your Next Event?</h2>
              <p>Join thousands of satisfied customers who trust us with their special moments</p>
              <div className="cta-buttons">
                <Link href="/register" className="btn-primary btn-large">
                  Get Started Now <FiArrowRight />
                </Link>
                <Link href="/contact" className="btn-secondary btn-large">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="home-page">
      {/* Hero Slider Section */}
      <section className="hero-section">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          effect="fade"
          loop={true}
          className="hero-slider"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="hero-slide">
                <div className="hero-bg">
                  <div className="hero-overlay"></div>
                  <div 
                    className="hero-image"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  ></div>
                </div>
                <div className="hero-content container">
                  <h1 className="hero-title animate-fadeInUp">{slide.title}</h1>
                  <p className="hero-subtitle animate-fadeInUp animation-delay-1">
                    {slide.subtitle}
                  </p>
                  <div className="hero-buttons animate-fadeInUp animation-delay-2">
                    <Link href={slide.ctaLink} className="btn-primary">
                      {slide.ctaText} <FiArrowRight />
                    </Link>
                    <Link href={slide.secondaryLink} className="btn-secondary">
                      {slide.secondaryCta}
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.events}+</div>
              <div className="stat-label">Events Hosted</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.providers}+</div>
              <div className="stat-label">Service Providers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.clients.toLocaleString()}+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.years}</div>
              <div className="stat-label">Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Services</h2>
            <p>Discover our most popular services trusted by thousands of clients</p>
          </div>
          <div className="services-grid">
            {featuredServices.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-price">{service.price}</div>
                <Link href="/services" className="service-link">
                  Learn More <FiChevronRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="events-section">
        <div className="container">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <p>Join these exciting events happening near you</p>
          </div>
          <div className="events-grid">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-image">
                  <div className="event-date-badge">
                    <FiCalendar />
                    <span>{event.date}</span>
                  </div>
                </div>
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <div className="event-details">
                    <div className="event-location">
                      <FiMapPin />
                      <span>{event.location}</span>
                    </div>
                    <div className="event-attendees">
                      <FiUsers />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                  <Link href={`/events/${event.id}`} className="event-link">
                    View Details <FiChevronRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="section-footer">
            <Link href="/events" className="btn-outline">
              View All Events <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple steps to plan your perfect event</p>
          </div>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-icon">📝</div>
              <h3>Create Account</h3>
              <p>Sign up for free and tell us about your event needs</p>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-icon">🔍</div>
              <h3>Browse & Compare</h3>
              <p>Explore top providers and compare their services</p>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-icon">💬</div>
              <h3>Connect & Book</h3>
              <p>Contact providers and book your perfect service</p>
            </div>
            <div className="step">
              <div className="step-number">04</div>
              <div className="step-icon">✨</div>
              <h3>Enjoy Your Event</h3>
              <p>Sit back and enjoy your perfectly planned event</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Clients Say</h2>
            <p>Trusted by thousands of happy customers</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <FiUser />
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Plan Your Next Event?</h2>
            <p>Join thousands of satisfied customers who trust us with their special moments</p>
            <div className="cta-buttons">
              <Link href="/register" className="btn-primary btn-large">
                Get Started Now <FiArrowRight />
              </Link>
              <Link href="/contact" className="btn-secondary btn-large">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}