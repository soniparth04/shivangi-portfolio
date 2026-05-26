import { useState, useEffect } from 'react';



function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all' | 'photos' | 'videos'

  // Contact Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    eventType: 'Wedding',
    eventDate: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ sending: false, success: false });

  // Navigation Links
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Contact', href: '#contact' }
  ];

  // Interleaved Media Database (Photos & Videos)
  const [portfolioItems, setPortfolioItems] = useState([]);

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        const response = await fetch('/api/media');
        if (response.ok) {
          const data = await response.json();
          // Map backend format to expected format
          const formattedData = data.map(item => ({
            type: item.type,
            src: item.url,
            alt: item.title,
            id: item._id
          }));
          setPortfolioItems(formattedData);
        }
      } catch (error) {
        console.error('Failed to fetch media:', error);
      }
    };
    fetchPortfolioItems();
  }, []);

  // Dynamically Filtered items
  const filteredItems = portfolioItems.filter(item => {
    if (item.type === 'about_image') return false;
    if (mediaFilter === 'all') return true;
    if (mediaFilter === 'photos') return item.type === 'photo';
    if (mediaFilter === 'videos') return item.type === 'video';
    return true;
  });

  const aboutImageObj = portfolioItems.find(item => item.type === 'about_image');
  const aboutImageUrl = aboutImageObj ? aboutImageObj.src : "https://lh3.googleusercontent.com/aida-public/AB6AXuC1_qR1iQ2Vp_2Q7T03P1Xv2WqXh0G8j5j6_5k9l-3n_i7qZq0M-Z9c2H3Zq8m1X5T4s_W8W3N0h_0h5aO2sK7wYmX2Wn_K6jH8hQ3WbK7lP2_9n_uT6V1W-H3f_z7V_q8f3wT5XzV8pT2-N8Y4k-K6f1mX5Y3_4k8V8Y8T6W_6R6lV";

  // Scroll Spy: Tracks screen scroll to focus anchors
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'portfolio', 'contact'];
      const scrollPosition = window.scrollY + 220;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Form Handling
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormStatus({ sending: true, success: false });

    setTimeout(() => {
      setFormStatus({ sending: false, success: true });
      setFormData({
        fullName: '',
        email: '',
        eventType: 'Wedding',
        eventDate: '',
        message: ''
      });

      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, success: false }));
      }, 6000);
    }, 2000);
  };

  // Smooth scroll helper
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Nav bar height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Lightbox Slide switchers
  const handleLightboxNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handleLightboxPrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <div
      style={{ fontFamily: "'Manrope', sans-serif" }}
      className="bg-[#131313] text-on-surface selection:bg-primary selection:text-on-primary min-h-screen relative"
    >

      {/* ========================================================= */}
      {/*                       NAVBAR: HEADER                      */}
      {/* ========================================================= */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-md shadow-[0_20px_40px_rgba(233,195,73,0.04)] border-b border-outline-variant/10 transition-all duration-300">
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-8 h-20">
          <div
            className="cursor-pointer flex items-center"
            onClick={() => scrollToSection('home')}
          >
            <img
              src="/logo.png"
              alt="RJ Shivangi Gupta - Anchor & Wedding Host in Indore"
              className="h-12 md:h-14 w-auto object-contain"
              style={{ maxWidth: '180px' }}
            />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href.substring(1))}
                className={`transition-all font-serif text-sm tracking-widest uppercase pb-1 border-b-2 hover:text-[#f2ca50] ${activeSection === link.href.substring(1)
                  ? 'text-[#f2ca50] font-bold border-[#d4af37]'
                  : 'text-[#e5e2e1] border-transparent'
                  }`}
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:scale-105 hover:bg-[#d4af37] transition-all duration-300 shadow-md shadow-primary/10"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Hamburger Trigger */}
          <button
            className="md:hidden text-primary p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Links"
          >
            <span className="material-symbols-outlined text-3xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </nav>

        {/* Mobile Links overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#131313] border-t border-outline-variant/20 py-6 px-8 flex flex-col gap-6 animate-[fadeInUp_0.3s_ease]">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href.substring(1))}
                className={`text-left font-serif text-lg tracking-widest uppercase py-1 ${activeSection === link.href.substring(1) ? 'text-primary' : 'text-[#e5e2e1]'
                  }`}
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-primary text-on-primary py-3 rounded-full font-bold text-center mt-2"
            >
              Book Now
            </button>
          </div>
        )}
      </header>


      <main>
        {/* ========================================================= */}
        {/*                       HERO SECTION                        */}
        {/* ========================================================= */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="home">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_10s_infinite_alternate]"
              alt="Dramatic stage with golden spot lighting and atmospheric haze"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwrsDsiyZ6kblAXbx8VEZcVa-zY9GKj5HqAZHaHg1rNhI-BTCgi-O5Ydhuwj6dp-DUzgFGuajMRWnKWaK8ifPvR3WjK5mrEO5rxu3i24K704grnvHq_5AuInP8DbYGEm-CVRS-pPECo6xDGJ2RlyObIBGr5YOoEyeGdim6_wRDJ2e8_uU7TuN7mjxEwn9lPM3v0NoDzxDAa5F9Kr8kZDazQETUdTEFw9vjtJrdjmhiwu-gr4lZgH9vp47RU6lE6Xr2yTj-zEodBw70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/20 to-transparent"></div>
          </div>

          <div className="relative z-10 text-center max-w-5xl px-6 pt-24">
            <span className="text-primary font-bold tracking-[0.3em] uppercase block mb-4 text-xs md:text-sm">
              Professional Broadcaster & Emcee
            </span>
            <h1 className="font-headline text-5xl md:text-8xl lg:text-9xl italic tracking-tighter text-on-surface mb-6 leading-none">
              <span className="font-bold">RJ SHIVANGI</span> <br /> <span className="text-primary not-italic ">GUPTA</span>
            </h1>
            <p className="font-headline text-lg md:text-3xl text-on-surface-variant italic mb-12 max-w-3xl mx-auto">
              Bringing energy, elegance &amp; engagement to every event
            </p>
          </div>

          {/* Brand Scroll Marquee Ticker */}
          <div className="absolute bottom-0 w-full bg-[#1c1b1b] py-5 overflow-hidden border-y border-outline-variant/10">
            <div className="flex whitespace-nowrap gap-12 items-center animate-marquee">
              <span className="font-label text-xs uppercase tracking-widest text-primary font-semibold">Corporate Galas</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Destination Weddings</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-primary font-semibold">Live Concerts</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">College Festivals</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-primary font-semibold">Brand Launches</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Television Hosting</span>

              {/* Duplicate set for loop */}
              <span className="font-label text-xs uppercase tracking-widest text-primary font-semibold">Corporate Galas</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Destination Weddings</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-primary font-semibold">Live Concerts</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">College Festivals</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-primary font-semibold">Brand Launches</span>
              <span className="text-outline-variant">●</span>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Television Hosting</span>
            </div>
          </div>
        </section>


        {/* ========================================================= */}
        {/*                       ABOUT SECTION                       */}
        {/* ========================================================= */}
        <section className="py-24 md:py-32 bg-[#131313]" id="about">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

              {/* Profile portrait frame */}
              <div className="relative group">
                <div className="absolute -top-6 -left-6 w-24 md:w-32 h-24 md:h-32 border-t-2 border-l-2 border-primary/40 z-0"></div>
                <div className="overflow-hidden rounded-xl shadow-2xl relative z-10 aspect-[4/5]">
                  <img
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    alt="Sophisticated portrait of professional host RJ Shivangi Gupta"
                    src={aboutImageUrl}
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 md:w-32 h-24 md:h-32 border-b-2 border-r-2 border-primary/40 z-0"></div>
              </div>

              <div className="flex flex-col gap-8 pt-8 md:pt-0">
                <div>
                  <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">
                    The Voice of Distinction
                  </span>
                  <h2 className="font-headline text-4xl md:text-5xl italic leading-tight mb-6">
                    Mastering the Art of <br /><span className="text-primary not-italic font-bold">Live Engagement</span>
                  </h2>
                  <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-6">
                    With over a decade of experience on the mic, RJ Shivangi Gupta has mastered the delicate balance between high-energy entertainment and professional poise. Whether it's a high-stakes corporate summit or a fairy-tale destination wedding, she transforms events into unforgettable experiences.
                  </p>
                  <p className="text-on-surface-variant text-base md:text-lg leading-relaxed italic border-l-4 border-primary pl-6 py-2 bg-surface-container-low/30 rounded-r-lg">
                    "An event is not just a schedule; it's a narrative. My role is to ensure every chapter is told with charisma and clarity."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-outline-variant/20 pt-6">
                  <div>
                    <div className="text-3xl md:text-4xl font-headline text-primary mb-1 italic">500+</div>
                    <div className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Events Hosted</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-headline text-primary mb-1 italic">12+</div>
                    <div className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Global Cities</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ========================================================= */}
        {/*       SERVICES SECTION: VELVET "CURATED EXPERIENCES"      */}
        {/* ========================================================= */}
        <section className="bg-surface-container-lowest py-24 md:py-32 px-6 md:px-8" id="services">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="font-serif text-4xl md:text-5xl text-on-surface mb-4 italic">Curated Experiences</h2>
              <p className="font-label text-xs uppercase tracking-[0.2em] text-outline font-bold">Exclusive Hosting Services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Wedding Experience Card */}
              <div className="group relative bg-surface-container-low p-10 h-[400px] flex flex-col justify-end overflow-hidden rounded-xl transition-all duration-500 hover:translate-y-[-8px] border border-outline-variant/10 shadow-lg">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                <img
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700"
                  alt="Luxury wedding reception in grand ballroom"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmtsZDm-sI1GPVtRdVqh2bKOkh8QzuBndhr_NkXNZgprZOjQNb3JEAfKbfvMPTXgQx4OENLqCURlpELSOVn3vEO-dIacC_tZU1WuIS6wU_kOm7Yezv1Se2VbeEymm6wHqU8N6ChWiwAhDCwAxZAdnmriKw_7zJ4I5zcTgAC9XqDm0ZiNa43e8aCuAype6hsmQ60FrgE3_h3mTkXxdXAQbEvPG03apA3O3dESOMmdPiNh_NSJBBOKdxmAV5QbUO_R8aAkDIICAZVHVB"
                />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-primary text-4xl mb-6 block">loyalty</span>
                  <h3 className="font-serif text-3xl text-on-surface mb-4 italic">Bespoke Weddings</h3>
                  <p className="text-secondary text-sm font-light leading-relaxed">Elevating luxury nuptials with a touch of poise and cultural depth.</p>
                </div>
              </div>

              {/* Corporate Experience Card */}
              <div className="group relative bg-surface-container-low p-10 h-[400px] flex flex-col justify-end overflow-hidden rounded-xl transition-all duration-500 hover:translate-y-[-8px] border border-outline-variant/10 shadow-lg">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                <img
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700"
                  alt="Corporate gala executive stage"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCXEUIUn8dArGuBIaxTrE9Cl2St2dGdbLm07MWBfYndLj3WzAAhO-gRc08slBV12cupnzSY3SAQLfrJ1hOmaAzCIBfHUXCf8gG0OhENrrFQwr7nUgPssEzBWd1-jN8_QKRyLIpvlPGyiHKt0CMrlLpJ5PokbM5vC6qG4jXbGb5NqYLMgL-IqjS3qw6njM3un_csVIeYpqPSHYPnECm5Wbknw3KMQHyBK_3YXqQMkHso2_EW1vlYa4p69Ir0EJVBaosYZYNRGJtDp7l"
                />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-primary text-4xl mb-6 block">business_center</span>
                  <h3 className="font-serif text-3xl text-on-surface mb-4 italic">Corporate Galas</h3>
                  <p className="text-secondary text-sm font-light leading-relaxed">Delivering brand narratives with absolute professional authority.</p>
                </div>
              </div>

              {/* Celebrity Experience Card */}
              <div className="group relative bg-surface-container-low p-10 h-[400px] flex flex-col justify-end overflow-hidden rounded-xl transition-all duration-500 hover:translate-y-[-8px] border border-outline-variant/10 shadow-lg">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                <img
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700"
                  alt="Red carpet premier event barriers"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi7z3MJftKwiXBbanIhynVTEQxP6E-G6PMlFzX1lGV2VPPXA2Y6AN7kIGMwjYRguwX4wFFN2YV9SOtrqg4FbL35FO4d4urPeMbB8XGuHmO8PxaO97KhQVP9nDoA8iiH9ZVJ1OPvO61rfRMRxKMfv9Z4xc3F7jVsO4bX3VNfqcqfUN_g2fjL3cq3N0y966l6_l4hFD7xHGZtNh0BBopL1WdBd-nJYNggxAoaHWHGW-ZZokmZnfiJYtjm0wExrwCO-hCA26C-_W6XJQ1"
                />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-primary text-4xl mb-6 block">stars</span>
                  <h3 className="font-serif text-3xl text-on-surface mb-4 italic">Celebrity Launches</h3>
                  <p className="text-secondary text-sm font-light leading-relaxed">High-energy hosting for red carpet premieres and luxury launches.</p>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ========================================================= */}
        {/*       PORTFOLIO SECTION: VELVET "BEHIND THE VELVET MIC"   */}
        {/* ========================================================= */}
        <section className="bg-surface py-24 md:py-32 px-6 md:px-8" id="portfolio">
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block font-serif italic">
                  Selected Work
                </span>
                <h2 className="font-serif text-4xl md:text-6xl text-on-surface italic">
                  Behind the Velvet Mic
                </h2>
              </div>

              {/* Dynamic Media Filter Tabs */}
              <div className="flex gap-2.5 bg-surface-container-low p-1.5 rounded-full border border-outline-variant/10 w-fit">
                {['all', 'photos', 'videos'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => { setMediaFilter(filter); setLightboxIndex(null); }}
                    className={`px-6 py-2 rounded-full font-serif text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${mediaFilter === filter
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/15'
                      : 'text-[#e5e2e1]/70 hover:text-primary'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Asymmetrical columns masonry grid of 6 items */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
              {filteredItems.slice(0, 6).map((item, idx) => {
                const isLastVisible = idx === 5 && filteredItems.length > 6;
                const remainingCount = filteredItems.length - 6;

                return (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="relative group overflow-hidden rounded-xl cursor-pointer border border-outline-variant/10 shadow-md transition-all duration-500 hover:scale-[1.04] hover:shadow-[0_15px_35px_rgba(212,175,55,0.3)] hover:border-primary/40"
                  >
                    {item.type === 'photo' ? (
                      <img
                        className="w-full object-cover"
                        alt={item.alt}
                        src={item.src}
                      />
                    ) : (
                      <div className="relative w-full overflow-hidden bg-neutral-900">
                        {/* Video Element with Autoplay Previews on Hover */}
                        <video
                          className="w-full object-cover"
                          src={item.src}
                          muted
                          playsInline
                          preload="metadata"
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                        />
                        {/* Corner Video Badge Indicator */}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-md border border-outline-variant/20 flex items-center gap-1.5 z-10">
                          <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                          <span className="font-sans text-[9px] text-[#e5e2e1] uppercase tracking-widest font-bold">Video</span>
                        </div>
                      </div>
                    )}

                    {isLastVisible ? (
                      <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-black/65 z-20">
                        <span className="font-serif text-4xl md:text-5xl text-primary font-bold tracking-tight animate-pulse">
                          +{remainingCount}
                        </span>
                        <span className="font-sans text-[10px] md:text-xs text-[#e5e2e1]/70 uppercase tracking-widest mt-2 font-bold">
                          View More
                        </span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-yellow-500 text-3xl">
                          {item.type === 'photo' ? 'zoom_in' : 'play_arrow'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>


        {/* ========================================================= */}
        {/*       TESTIMONIALS SECTION: VELVET "VOICES OF ACCLAIM"    */}
        {/* ========================================================= */}
        <section className="bg-[#131313] py-24 md:py-32 px-6 md:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] z-0"></div>

            <div className="mb-16">
              <h2 className="font-serif text-4xl md:text-5xl text-on-surface mb-2 italic">Voices of Acclaim</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 z-10 relative">

              {/* Glassmorphic Board 1 */}
              <div className="glass-panel p-10 md:p-12 rounded-xl border border-outline-variant/10 shadow-md">
                <span className="material-symbols-outlined text-primary mb-6 block text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  format_quote
                </span>
                <p className="font-body text-lg md:text-xl text-secondary leading-relaxed mb-8 italic font-light">
                  "Shivangi brings an aura to the stage that is impossible to replicate. Her presence at our annual summit was the highlight of the event."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-primary"></div>
                  <div>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface font-semibold">Director of Marketing</p>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline">Fortune 500 Tech Brand</p>
                  </div>
                </div>
              </div>

              {/* Glassmorphic Board 2 */}
              <div className="glass-panel p-10 md:p-12 rounded-xl border border-outline-variant/10 shadow-md">
                <span className="material-symbols-outlined text-primary mb-6 block text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  format_quote
                </span>
                <p className="font-body text-lg md:text-xl text-secondary leading-relaxed mb-8 italic font-light">
                  "She navigated our wedding's complex cultural rituals with such elegance and charm. Truly the most professional host we have worked with."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-primary"></div>
                  <div>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface font-semibold">The Mehta Family</p>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline">Private Client</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ========================================================= */}
        {/*                       CONTACT SECTION                     */}
        {/* ========================================================= */}
        <section className="py-24 md:py-32 bg-[#1c1b1b]" id="contact">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">

              <div>
                <h2 className="font-headline text-5xl md:text-6xl italic mb-8 leading-tight">
                  Let's Create <br /> <span className="text-primary not-italic font-bold">Magic Together</span>
                </h2>
                <p className="text-on-surface-variant text-base md:text-lg mb-12 leading-relaxed">
                  Available for bookings worldwide. For inquiries regarding corporate events, weddings, or media collaborations, please reach out via the form or social channels.
                </p>

                <div className="flex flex-col gap-6">
                  <a className="flex items-center gap-4 group" href="mailto:guptashivangi537@gmail.com">
                    <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shadow-md">
                      <span className="material-symbols-outlined text-xl">mail</span>
                    </div>
                    <span className="text-base md:text-lg font-label text-on-surface group-hover:text-primary transition-colors">
                      guptashivangi537@gmail.com
                    </span>
                  </a>

                  <a className="flex items-center gap-4 group" href="https://wa.me/918823806498" target="_blank" rel="noreferrer">
                    <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all shadow-md">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.485 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.735-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    </div>
                    <span className="text-base md:text-lg font-label text-on-surface group-hover:text-primary transition-colors">
                      WhatsApp RJ Shivangi
                    </span>
                  </a>
                </div>

                <div className="mt-12">
                  <h4 className="text-sm font-label text-on-surface-variant uppercase tracking-widest font-bold mb-4">
                    Find Me On
                  </h4>
                  <div className="flex gap-4">
                    <a className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all" href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram">
                      <img className="w-5 h-5 opacity-65" alt="Instagram icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1lcSatoiW6rSBhSpqmbFyGD7-uTE6a9HxoptkCfvze4bOR4WLcEmG4CqCd0pqSiDvJLpr5NQMjWY4znw1SfzS1JM2NZh-_5a8ZRfVQhDRfdGQPe3rmLi_cykJU6TuGirMkmfaxP13VuDE7ViMEn8daUPZ9M1d-vKWryb_9JPiOXCfuniAc7P2lBe_m173xUkIgaHWSJ8tY-RGzbUJjkbl3h9nS2wau0mtC_1fLJVxlHw1LVYK6G6PlEzIf1BiHPi7O7LPcJYEPxhN" />
                    </a>
                    <a className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all" href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn">
                      <img className="w-5 h-5 opacity-65" alt="LinkedIn icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV4TIi8kPHvO3uPQ8naOXjB3Cbwm8RRo1_KlL-ZhPUhjiI7SLBts-oZ6bYo_H1a4Rab9HFP8t8dbVAZ3LF7y7MdlkLKnvgol8eVdFQbj_4RWJkCuKoIefqCcfpQ8AJH8gwb67flbAIwe9ASNVs0BWFKsprYdPUcjM9vHymqpHZ7d3yM4YEaUDG7ZtuCypR1UFcaLxq7lPScYtNDCJ2Zzt7nKk8lmE8qKkIPBmk4oERdGLpGIjiNIrXvg3g6BYIzNJ-Qi56QL9ZHuQw" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Inquiry Lead Box */}
              <div className="bg-[#1c1b1b] p-8 md:p-10 rounded-3xl border border-outline-variant/10 shadow-lg shadow-black/30">
                <form onSubmit={handleFormSubmit} className="space-y-6">

                  {formStatus.success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3 animate-[fadeInUp_0.3s_ease] text-sm md:text-base font-semibold">
                      <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                      Booking inquiry sent successfully! RJ Shivangi will contact you soon.
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Full Name</label>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleFormChange}
                        required
                        disabled={formStatus.sending}
                        className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-on-surface outline-none transition-all"
                        placeholder="Your Name"
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Email Address</label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                        disabled={formStatus.sending}
                        className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-on-surface outline-none transition-all"
                        placeholder="email@example.com"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Event Type</label>
                      <select
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleFormChange}
                        disabled={formStatus.sending}
                        className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-on-surface outline-none appearance-none"
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Private Event">Private Event</option>
                        <option value="Live Show">Live Show</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Event Date</label>
                      <input
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleFormChange}
                        disabled={formStatus.sending}
                        className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-on-surface outline-none transition-all"
                        type="date"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleFormChange}
                      required
                      disabled={formStatus.sending}
                      className="w-full bg-[#201f1f] border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-on-surface outline-none transition-all"
                      placeholder="Tell us about your event..."
                      rows="4"
                    ></textarea>
                  </div>

                  <button
                    className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:bg-[#d4af37] disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-base md:text-lg shadow-md shadow-primary/10 active:scale-[0.98]"
                    type="submit"
                    disabled={formStatus.sending}
                  >
                    {formStatus.sending ? 'Sending Inquiry...' : 'Send Inquiry'}
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>

                </form>
              </div>

            </div>
          </div>
        </section>
      </main>


      {/* ========================================================= */}
      {/*                           FOOTER                          */}
      {/* ========================================================= */}
      <footer className="bg-[#0e0e0e] w-full py-12 border-t border-[#353534]/20">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-6 md:px-8 gap-6">
          <div
            className="cursor-pointer flex items-center"
            onClick={() => scrollToSection('home')}
          >
            <img
              src="/logo.png"
              alt="RJ Shivangi Gupta"
              className="h-10 w-auto object-contain brightness-90"
              style={{ maxWidth: '150px' }}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs md:text-sm font-sans tracking-wide uppercase">
            <a className="text-[#e5e2e1]/60 hover:text-[#f2ca50] underline-offset-4 hover:underline transition-all" href="#privacy">Privacy Policy</a>
            <a className="text-[#e5e2e1]/60 hover:text-[#f2ca50] underline-offset-4 hover:underline transition-all" href="#terms">Terms of Service</a>
            <a className="text-[#e5e2e1]/60 hover:text-[#f2ca50] underline-offset-4 hover:underline transition-all" href="#press">Press Kit</a>
          </div>
          <div className="text-[#d4af37] font-sans text-[10px] md:text-xs tracking-widest uppercase text-center">
            © 2024 RJ SHIVANGI GUPTA. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>


      {/* ========================================================= */}
      {/*                 GLOBAL CINEMATIC SHOWREEL MODAL           */}
      {/* ========================================================= */}
      {showreelOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 transition-opacity duration-300 animate-[fadeInUp_0.2s_ease-out]"
          onClick={() => setShowreelOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-primary hover:text-white transition-colors"
            onClick={() => setShowreelOpen(false)}
            aria-label="Close Showreel"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>

          <div
            className="relative w-full max-w-5xl aspect-video bg-[#131313] rounded-2xl overflow-hidden border border-outline-variant/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="RJ Shivangi Gupta - Presentation Showreel"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}


      {/* ========================================================= */}
      {/*                  GLOBAL GALLERY LIGHTBOX SLIDER           */}
      {/* ========================================================= */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-[fadeInUp_0.2s_ease-out]"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-8 text-primary hover:text-white transition-colors z-[130]"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close Lightbox"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>

          {/* Left Arrow */}
          <button
            className="absolute left-6 text-primary hover:text-white hover:scale-110 active:scale-90 transition-all z-[130] bg-[#1c1b1b]/60 p-3 rounded-full border border-outline-variant/20"
            onClick={handleLightboxPrev}
            aria-label="Previous Image"
          >
            <span className="material-symbols-outlined text-3xl">arrow_back_ios_new</span>
          </button>

          {/* Media slider view (Supports Photos & Videos) */}
          <div
            className="relative max-w-4xl max-h-[80vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredItems[lightboxIndex].type === 'photo' ? (
              <img
                className="max-w-full max-h-[70vh] object-contain rounded-lg border border-outline-variant/10 shadow-2xl"
                src={filteredItems[lightboxIndex].src}
                alt={filteredItems[lightboxIndex].alt}
              />
            ) : (
              <video
                className="max-w-full max-h-[70vh] rounded-lg border border-outline-variant/10 shadow-2xl"
                src={filteredItems[lightboxIndex].src}
                controls
                autoPlay
                playsInline
              />
            )}
            <p className="text-on-surface-variant font-headline italic text-center text-sm md:text-base max-w-xl px-4 mt-2">
              {filteredItems[lightboxIndex].alt}
            </p>
          </div>

          {/* Right Arrow */}
          <button
            className="absolute right-6 text-primary hover:text-white hover:scale-110 active:scale-90 transition-all z-[130] bg-[#1c1b1b]/60 p-3 rounded-full border border-outline-variant/20"
            onClick={handleLightboxNext}
            aria-label="Next Image"
          >
            <span className="material-symbols-outlined text-3xl">arrow_forward_ios</span>
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
