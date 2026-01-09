"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Github, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop & Mobile Navigation */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          isScrolled
            ? "bg-background border-b border-border/50"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-sm">V</span>
              </div>
              <span className="font-bold text-lg tracking-tight">VIBE</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
              <NavLink href="https://docs.example.com" external>Docs</NavLink>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg border-0 focus:outline-none"
                asChild
              >
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button
                className="rounded-lg h-10 px-5 border-0 bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 focus:outline-none transition-colors duration-200"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg border-0 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-200 ease-out",
            isMobileMenuOpen ? "max-h-80" : "max-h-0"
          )}
        >
          <div className="px-4 py-4 space-y-2 bg-background border-b border-border/50">
            <MobileNavLink href="#features" onClick={() => setIsMobileMenuOpen(false)}>
              Features
            </MobileNavLink>
            <MobileNavLink href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>
              Pricing
            </MobileNavLink>
            <MobileNavLink href="https://docs.example.com" external onClick={() => setIsMobileMenuOpen(false)}>
              Docs
            </MobileNavLink>
            <div className="pt-2 border-t border-border/50">
              <Button className="w-full rounded-lg h-11 border-0 bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 focus:outline-none transition-colors duration-200">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

// Desktop Navigation Link
function NavLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted focus:bg-muted focus:outline-none transition-colors duration-150"
    >
      {children}
      {external && <ExternalLink className="h-3 w-3" />}
    </a>
  );
}

// Mobile Navigation Link
function MobileNavLink({
  href,
  external,
  onClick,
  children,
}: {
  href: string;
  external?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 text-base font-medium text-foreground rounded-lg hover:bg-muted focus:bg-muted focus:outline-none transition-colors duration-150"
    >
      {children}
      {external && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
    </a>
  );
}
