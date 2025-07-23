import { WebsiteTemplate, TemplateCategory, TemplateMetadata } from '@/types/templates';

// Pre-built website templates
export const BUILT_IN_TEMPLATES: WebsiteTemplate[] = [
  {
    id: 'minimal-portfolio',
    name: 'Minimal Portfolio',
    description: 'Clean and minimal portfolio template perfect for showcasing your work',
    category: 'portfolio',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjlGQUZCIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNFNUU3RUIiLz4KPHN2Zz4K',
    preview: '',
    tags: ['minimal', 'portfolio', 'clean', 'responsive'],
    difficulty: 'beginner',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteName}} - Portfolio</title>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="nav-brand">{{siteName}}</div>
            <ul class="nav-links">
                <li><a href="#about">About</a></li>
                <li><a href="#work">Work</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <h1 class="hero-title">{{heroText}}</h1>
            <p class="hero-subtitle">{{tagline}}</p>
        </section>

        <section id="about" class="section">
            <h2>About</h2>
            <p>{{aboutText}}</p>
        </section>

        <section id="work" class="section">
            <h2>My Work</h2>
            <div class="project-grid">
                <div class="project-card">
                    <h3>Project 1</h3>
                    <p>Description of your first project</p>
                </div>
                <div class="project-card">
                    <h3>Project 2</h3>
                    <p>Description of your second project</p>
                </div>
                <div class="project-card">
                    <h3>Project 3</h3>
                    <p>Description of your third project</p>
                </div>
            </div>
        </section>

        <section id="contact" class="section">
            <h2>Get In Touch</h2>
            <p>Email: {{contactEmail}}</p>
        </section>
    </main>

    <footer class="footer">
        <p>&copy; 2024 {{siteName}}. All rights reserved.</p>
    </footer>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: {{bodyFont}}, system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: {{textColor}};
    background-color: {{backgroundColor}};
}

.header {
    position: fixed;
    top: 0;
    width: 100%;
    background: {{backgroundColor}};
    border-bottom: 1px solid #e2e8f0;
    z-index: 100;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
}

.nav-brand {
    font-size: 1.25rem;
    font-weight: bold;
    color: {{primaryColor}};
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: {{textColor}};
    transition: color 0.3s;
}

.nav-links a:hover {
    color: {{primaryColor}};
}

.hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0 2rem;
}

.hero-title {
    font-family: {{headingFont}}, serif;
    font-size: 3.5rem;
    font-weight: 300;
    margin-bottom: 1rem;
    color: {{primaryColor}};
}

.hero-subtitle {
    font-size: 1.25rem;
    color: #64748b;
    max-width: 600px;
}

.section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 5rem 2rem;
}

.section h2 {
    font-family: {{headingFont}}, serif;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    text-align: center;
    color: {{primaryColor}};
}

.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.project-card {
    padding: 2rem;
    border: 1px solid #e2e8f0;
    border-radius: {{borderRadius}};
    transition: transform 0.3s, box-shadow 0.3s;
}

.project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.project-card h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: {{primaryColor}};
}

.footer {
    background: #f8fafc;
    padding: 2rem;
    text-align: center;
    color: #64748b;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .nav-links {
        display: none;
    }

    .project-grid {
        grid-template-columns: 1fr;
    }
}`,
    metadata: {
      title: 'Minimal Portfolio Template',
      description: 'A clean and minimal portfolio template',
      author: 'Web Editor Pro',
      version: '1.0.0',
      responsive: true,
      browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      features: ['Responsive Design', 'Modern CSS', 'Clean Typography'],
      colorScheme: 'light',
      layout: 'single-page'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  {
    id: 'business-landing',
    name: 'Business Landing Page',
    description: 'Professional landing page template for businesses and startups',
    category: 'landing-page',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMTg0MEZCIi8+CjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9IjI2MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IndoaXRlIiByeD0iOCIvPgo8L3N2Zz4K',
    preview: '',
    tags: ['business', 'landing', 'professional', 'conversion'],
    difficulty: 'intermediate',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteName}} - {{tagline}}</title>
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="nav-brand">{{siteName}}</div>
            <ul class="nav-menu">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact" class="cta-button">Get Started</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title">{{heroText}}</h1>
                <p class="hero-description">{{tagline}}</p>
                <div class="hero-actions">
                    <a href="#contact" class="btn btn-primary">Get Started Free</a>
                    <a href="#features" class="btn btn-secondary">Learn More</a>
                </div>
            </div>
        </section>

        <section id="features" class="features">
            <div class="container">
                <h2>Why Choose Us?</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🚀</div>
                        <h3>Fast & Reliable</h3>
                        <p>Lightning fast performance with 99.9% uptime guarantee</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔒</div>
                        <h3>Secure</h3>
                        <p>Enterprise-grade security to protect your data</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📱</div>
                        <h3>Mobile First</h3>
                        <p>Optimized for all devices and screen sizes</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="pricing" class="pricing">
            <div class="container">
                <h2>Simple Pricing</h2>
                <div class="pricing-grid">
                    <div class="pricing-card">
                        <h3>Starter</h3>
                        <div class="price">$29<span>/month</span></div>
                        <ul class="features-list">
                            <li>✓ Basic features</li>
                            <li>✓ Email support</li>
                            <li>✓ 1 user</li>
                        </ul>
                        <a href="#contact" class="btn btn-outline">Choose Plan</a>
                    </div>
                    <div class="pricing-card featured">
                        <h3>Professional</h3>
                        <div class="price">$99<span>/month</span></div>
                        <ul class="features-list">
                            <li>✓ All features</li>
                            <li>✓ Priority support</li>
                            <li>✓ 10 users</li>
                        </ul>
                        <a href="#contact" class="btn btn-primary">Choose Plan</a>
                    </div>
                    <div class="pricing-card">
                        <h3>Enterprise</h3>
                        <div class="price">Custom</div>
                        <ul class="features-list">
                            <li>✓ Custom features</li>
                            <li>✓ Dedicated support</li>
                            <li>✓ Unlimited users</li>
                        </ul>
                        <a href="#contact" class="btn btn-outline">Contact Us</a>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="container">
                <h2>Ready to Get Started?</h2>
                <p>Join thousands of satisfied customers today</p>
                <form class="contact-form">
                    <input type="email" placeholder="Enter your email" required>
                    <button type="submit" class="btn btn-primary">Start Free Trial</button>
                </form>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 {{siteName}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: {{bodyFont}}, system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: {{textColor}};
    background-color: {{backgroundColor}};
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.header {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e2e8f0;
    z-index: 100;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: {{primaryColor}};
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
    align-items: center;
}

.nav-menu a {
    text-decoration: none;
    color: {{textColor}};
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: {{primaryColor}};
}

.cta-button {
    background: {{primaryColor}} !important;
    color: white !important;
    padding: 0.5rem 1rem;
    border-radius: {{borderRadius}};
    transition: transform 0.3s;
}

.cta-button:hover {
    transform: translateY(-2px);
}

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%);
    color: white;
    text-align: center;
}

.hero-title {
    font-family: {{headingFont}}, serif;
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    line-height: 1.2;
}

.hero-description {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    display: inline-block;
    padding: 0.75rem 2rem;
    border-radius: {{borderRadius}};
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
    border: 2px solid transparent;
}

.btn-primary {
    background: white;
    color: {{primaryColor}};
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.btn-secondary {
    background: transparent;
    color: white;
    border-color: white;
}

.btn-secondary:hover {
    background: white;
    color: {{primaryColor}};
}

.btn-outline {
    background: transparent;
    color: {{primaryColor}};
    border-color: {{primaryColor}};
}

.btn-outline:hover {
    background: {{primaryColor}};
    color: white;
}

.features {
    padding: 5rem 0;
    background: white;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: {{primaryColor}};
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    text-align: center;
    padding: 2rem;
    border-radius: {{borderRadius}};
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.pricing {
    padding: 5rem 0;
    background: #f8fafc;
}

.pricing h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: {{primaryColor}};
}

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 900px;
    margin: 0 auto;
}

.pricing-card {
    background: white;
    padding: 2rem;
    border-radius: {{borderRadius}};
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
    position: relative;
}

.pricing-card.featured {
    transform: scale(1.05);
    border: 2px solid {{primaryColor}};
}

.pricing-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.price {
    font-size: 2.5rem;
    font-weight: bold;
    color: {{primaryColor}};
    margin-bottom: 1.5rem;
}

.price span {
    font-size: 1rem;
    color: #64748b;
}

.features-list {
    list-style: none;
    margin-bottom: 2rem;
}

.features-list li {
    padding: 0.5rem 0;
}

.contact {
    padding: 5rem 0;
    background: {{primaryColor}};
    color: white;
    text-align: center;
}

.contact h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.contact p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.contact-form {
    display: flex;
    max-width: 400px;
    margin: 0 auto;
    gap: 1rem;
}

.contact-form input {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: {{borderRadius}};
    font-size: 1rem;
}

.footer {
    background: #1a202c;
    color: white;
    padding: 2rem 0;
    text-align: center;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .nav-menu {
        display: none;
    }

    .hero-actions {
        flex-direction: column;
        align-items: center;
    }

    .contact-form {
        flex-direction: column;
    }
}`,
    metadata: {
      title: 'Business Landing Page Template',
      description: 'Professional landing page for businesses',
      author: 'Web Editor Pro',
      version: '1.0.0',
      responsive: true,
      browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      features: ['Responsive Design', 'Modern Gradient', 'Call-to-Action'],
      colorScheme: 'light',
      layout: 'landing'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  {
    id: 'creative-agency',
    name: 'Creative Agency',
    description: 'Bold and creative template for design agencies and creative professionals',
    category: 'creative',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkYwMDgwIi8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IndoaXRlIiByeD0iMTYiLz4KPHN2Zz4K',
    preview: '',
    tags: ['creative', 'agency', 'bold', 'modern'],
    difficulty: 'advanced',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteName}} - Creative Agency</title>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="nav-brand">{{siteName}}</div>
            <ul class="nav-links">
                <li><a href="#work">Work</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div class="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title">
                    <span class="title-line">{{heroText}}</span>
                    <span class="title-line accent">{{tagline}}</span>
                </h1>
                <p class="hero-description">We create bold, beautiful, and meaningful digital experiences</p>
                <a href="#work" class="hero-cta">View Our Work</a>
            </div>
            <div class="hero-visual">
                <div class="floating-elements">
                    <div class="element element-1"></div>
                    <div class="element element-2"></div>
                    <div class="element element-3"></div>
                </div>
            </div>
        </section>

        <section id="work" class="work">
            <h2 class="section-title">Selected Work</h2>
            <div class="work-grid">
                <div class="work-item">
                    <div class="work-image"></div>
                    <h3>Brand Identity Design</h3>
                    <p>Complete rebranding for tech startup</p>
                </div>
                <div class="work-item">
                    <div class="work-image"></div>
                    <h3>Web App Interface</h3>
                    <p>Modern dashboard design</p>
                </div>
                <div class="work-item">
                    <div class="work-image"></div>
                    <h3>Mobile App Design</h3>
                    <p>User-centered mobile experience</p>
                </div>
                <div class="work-item">
                    <div class="work-image"></div>
                    <h3>E-commerce Platform</h3>
                    <p>Full stack development</p>
                </div>
            </div>
        </section>

        <section id="services" class="services">
            <div class="services-content">
                <h2 class="section-title">What We Do</h2>
                <div class="services-list">
                    <div class="service-item">
                        <h3>Brand Strategy</h3>
                        <p>Developing compelling brand narratives that resonate with your audience</p>
                    </div>
                    <div class="service-item">
                        <h3>Digital Design</h3>
                        <p>Creating stunning digital experiences across all platforms</p>
                    </div>
                    <div class="service-item">
                        <h3>Development</h3>
                        <p>Building robust, scalable solutions with cutting-edge technology</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <h2 class="section-title">Let's Create Something Amazing Together</h2>
            <p class="contact-description">Ready to start your project? Get in touch.</p>
            <div class="contact-info">
                <div class="contact-item">
                    <h3>Email</h3>
                    <p>{{contactEmail}}</p>
                </div>
                <div class="contact-item">
                    <h3>Phone</h3>
                    <p>+1 (555) 123-4567</p>
                </div>
                <div class="contact-item">
                    <h3>Location</h3>
                    <p>New York, NY</p>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>&copy; 2024 {{siteName}}. All rights reserved.</p>
    </footer>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: {{bodyFont}}, system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: {{textColor}};
    background-color: {{backgroundColor}};
    overflow-x: hidden;
}

.header {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    z-index: 1000;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem 2rem;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: {{primaryColor}};
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 3rem;
}

.nav-links a {
    text-decoration: none;
    color: white;
    font-weight: 500;
    transition: color 0.3s;
    position: relative;
}

.nav-links a:hover {
    color: {{primaryColor}};
}

.nav-links a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: {{primaryColor}};
    transition: width 0.3s;
}

.nav-links a:hover::after {
    width: 100%;
}

.nav-toggle {
    display: none;
    flex-direction: column;
    cursor: pointer;
}

.nav-toggle span {
    width: 25px;
    height: 3px;
    background: white;
    margin: 3px 0;
    transition: 0.3s;
}

.hero {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    gap: 4rem;
}

.hero-content {
    z-index: 10;
}

.hero-title {
    font-family: {{headingFont}}, serif;
    font-size: 4rem;
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 2rem;
}

.title-line {
    display: block;
}

.title-line.accent {
    color: {{primaryColor}};
    background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-description {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    color: #64748b;
    max-width: 500px;
}

.hero-cta {
    display: inline-block;
    background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}});
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: transform 0.3s, box-shadow 0.3s;
}

.hero-cta:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.hero-visual {
    position: relative;
    height: 500px;
}

.floating-elements {
    position: relative;
    width: 100%;
    height: 100%;
}

.element {
    position: absolute;
    border-radius: 20px;
    animation: float 6s ease-in-out infinite;
}

.element-1 {
    width: 150px;
    height: 150px;
    background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}});
    top: 10%;
    left: 20%;
    animation-delay: 0s;
}

.element-2 {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, {{secondaryColor}}, {{accentColor}});
    top: 60%;
    right: 30%;
    animation-delay: 2s;
}

.element-3 {
    width: 80px;
    height: 80px;
    background: linear-gradient(225deg, {{accentColor}}, {{primaryColor}});
    bottom: 20%;
    left: 60%;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
}

.section-title {
    font-family: {{headingFont}}, serif;
    font-size: 3rem;
    margin-bottom: 3rem;
    text-align: center;
    background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.work {
    padding: 5rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.work-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.work-item {
    group: cursor-pointer;
    transition: transform 0.3s;
}

.work-item:hover {
    transform: translateY(-10px);
}

.work-image {
    width: 100%;
    height: 250px;
    background: linear-gradient(45deg, #f0f2f5, #e2e8f0);
    border-radius: {{borderRadius}};
    margin-bottom: 1rem;
    position: relative;
    overflow: hidden;
}

.work-image::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, {{primaryColor}}, {{secondaryColor}});
    opacity: 0;
    transition: opacity 0.3s;
}

.work-item:hover .work-image::before {
    opacity: 0.8;
}

.work-item h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: {{primaryColor}};
}

.services {
    padding: 5rem 2rem;
    background: #f8fafc;
}

.services-content {
    max-width: 1200px;
    margin: 0 auto;
}

.services-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 3rem;
}

.service-item {
    padding: 2rem;
    background: white;
    border-radius: {{borderRadius}};
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.service-item:hover {
    transform: translateY(-5px);
}

.service-item h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: {{primaryColor}};
}

.contact {
    padding: 5rem 2rem;
    background: linear-gradient(135deg, {{primaryColor}}, {{secondaryColor}});
    color: white;
    text-align: center;
}

.contact .section-title {
    color: white;
    -webkit-text-fill-color: white;
}

.contact-description {
    font-size: 1.25rem;
    margin-bottom: 3rem;
    opacity: 0.9;
}

.contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.contact-item h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.footer {
    background: #1a202c;
    color: white;
    padding: 2rem;
    text-align: center;
}

@media (max-width: 768px) {
    .nav-links {
        display: none;
    }

    .nav-toggle {
        display: flex;
    }

    .hero {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .work-grid {
        grid-template-columns: 1fr;
    }

    .services-list {
        grid-template-columns: 1fr;
    }
}`,
    metadata: {
      title: 'Creative Agency Template',
      description: 'Bold template for creative agencies',
      author: 'Web Editor Pro',
      version: '1.0.0',
      responsive: true,
      browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      features: ['Animations', 'Gradients', 'Modern Design'],
      colorScheme: 'dark',
      layout: 'single-page'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Template categories
export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string; description: string }[] = [
  { value: 'business', label: 'Business', description: 'Professional business websites' },
  { value: 'portfolio', label: 'Portfolio', description: 'Showcase your work and skills' },
  { value: 'landing-page', label: 'Landing Page', description: 'Convert visitors into customers' },
  { value: 'blog', label: 'Blog', description: 'Share your thoughts and ideas' },
  { value: 'ecommerce', label: 'E-commerce', description: 'Sell products online' },
  { value: 'restaurant', label: 'Restaurant', description: 'Food and dining websites' },
  { value: 'creative', label: 'Creative', description: 'For artists and designers' },
  { value: 'minimal', label: 'Minimal', description: 'Clean and simple designs' },
  { value: 'corporate', label: 'Corporate', description: 'Large company websites' },
  { value: 'personal', label: 'Personal', description: 'Personal websites and blogs' },
  { value: 'educational', label: 'Educational', description: 'Schools and learning platforms' },
  { value: 'nonprofit', label: 'Non-profit', description: 'Organizations and causes' }
];

// Default customization options
export const DEFAULT_CUSTOMIZATION = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#ffffff',
    text: '#1f2937'
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontSize: 'medium' as const
  },
  layout: {
    maxWidth: '1200px',
    spacing: 'normal' as const,
    borderRadius: 'medium' as const
  },
  content: {
    siteName: 'Your Site Name',
    tagline: 'Your Amazing Tagline',
    heroText: 'Welcome to Our Site',
    aboutText: 'Tell your story here...',
    contactEmail: 'hello@yoursite.com'
  }
};

// Template utility functions
export function getTemplatesByCategory(category: TemplateCategory): WebsiteTemplate[] {
  return BUILT_IN_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): WebsiteTemplate | undefined {
  return BUILT_IN_TEMPLATES.find(template => template.id === id);
}

export function searchTemplates(query: string): WebsiteTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  return BUILT_IN_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function applyCustomizationToTemplate(template: WebsiteTemplate, customization: any): WebsiteTemplate {
  let customizedHtml = template.html;
  let customizedCss = template.css;

  // Replace placeholders in HTML
  Object.entries(customization.content).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    customizedHtml = customizedHtml.replace(new RegExp(placeholder, 'g'), value as string);
  });

  // Replace color variables in CSS
  Object.entries(customization.colors).forEach(([key, value]) => {
    const variable = `{{${key}Color}}`;
    customizedCss = customizedCss.replace(new RegExp(variable, 'g'), value as string);
  });

  // Replace typography variables
  Object.entries(customization.typography).forEach(([key, value]) => {
    const variable = `{{${key}}}`;
    customizedCss = customizedCss.replace(new RegExp(variable, 'g'), value as string);
  });

  // Replace layout variables
  Object.entries(customization.layout).forEach(([key, value]) => {
    const variable = `{{${key}}}`;
    let cssValue = value as string;

    // Convert borderRadius enum to CSS values
    if (key === 'borderRadius') {
      const radiusMap = {
        'none': '0',
        'small': '4px',
        'medium': '8px',
        'large': '16px'
      };
      cssValue = radiusMap[value as keyof typeof radiusMap] || value as string;
    }

    customizedCss = customizedCss.replace(new RegExp(variable, 'g'), cssValue);
  });

  return {
    ...template,
    html: customizedHtml,
    css: customizedCss,
    metadata: {
      ...template.metadata,
      title: customization.content.siteName || template.metadata.title
    }
  };
}
