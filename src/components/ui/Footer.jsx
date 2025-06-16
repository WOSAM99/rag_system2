import React from 'react';
import Icon from '../AppIcon';

const Footer = ({ variant = 'standard' }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Support', href: '/support' },
    { name: 'Documentation', href: '/docs' },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: 'Twitter', href: '#' },
    { name: 'GitHub', icon: 'Github', href: '#' },
    { name: 'LinkedIn', icon: 'Linkedin', href: '#' },
  ];

  if (variant === 'minimal') {
    return (
      <footer className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center">
              <Icon name="Zap" size={20} className="text-primary" />
              <span className="ml-2 text-sm text-text-secondary">
                © {currentYear} App. All rights reserved.
              </span>
            </div>
            <div className="mt-2 sm:mt-0 flex space-x-6">
              {footerLinks.slice(0, 2).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center">
              <Icon name="Zap" size={32} className="text-primary" />
              <span className="ml-2 text-xl font-bold text-text-primary">App</span>
            </div>
            <p className="text-text-secondary text-base">
              Building the future of digital experiences with innovative solutions and cutting-edge technology.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-text-tertiary hover:text-text-secondary transition-colors"
                  aria-label={item.name}
                >
                  <Icon name={item.icon} size={20} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-text-primary tracking-wider uppercase">
                  Product
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="/features" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="/integrations" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Integrations
                    </a>
                  </li>
                  <li>
                    <a href="/api" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      API
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-text-primary tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-base text-text-secondary hover:text-text-primary transition-colors">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-text-primary tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="/about" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="/blog" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="/careers" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-text-primary tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="/privacy" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="/cookies" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Cookies
                    </a>
                  </li>
                  <li>
                    <a href="/licenses" className="text-base text-text-secondary hover:text-text-primary transition-colors">
                      Licenses
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-base text-text-secondary xl:text-center">
            © {currentYear} App, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;