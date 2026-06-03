import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SchemaService } from '../../services/schema.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  isOpen = signal<boolean>(false);
  statusText = signal<string>('Closed Now');
  scheduleDetails = signal<string>('Opens at 7:00 AM');
  
  // Carousel State
  currentSlide = signal<number>(0);
  slides = [
    {
      image: 'assets/images/coffee-carousel.png',
      title: 'Specialty Coffee &',
      titleAccent: 'Premium Dining',
      description: 'Welcome to The Northern Grid Cafe. We roast specialty micro-lot beans in-house and serve artisan local brunch options in Melbourne North with a passion for quality and community.',
    },
    {
      image: 'assets/images/brunch-carousel.png',
      title: 'Artisan Ingredients &',
      titleAccent: 'Seasonal Brunch',
      description: 'Sourced from local Victorian farmers and prepared by our team of passionate chefs to bring you unforgettable flavor profiles.',
    },
    {
      image: 'assets/images/interior-carousel.png',
      title: 'A Welcoming Space for',
      titleAccent: 'The Whole Community',
      description: 'Centrally located in Melbourne\'s north, featuring a spacious indoor dining area and a sunny, pet-friendly outdoor courtyard.',
    }
  ];

  private statusInterval: any;
  private carouselInterval: any;

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    // Inject Schema metadata
    this.schemaService.injectSchema();
    
    // Check and update operational status
    this.updateOperatingStatus();
    
    // Update status every 30 seconds
    this.statusInterval = setInterval(() => {
      this.updateOperatingStatus();
    }, 30000);

    // Start carousel auto-play
    this.startCarousel();
  }

  ngOnDestroy(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    this.stopCarousel();
  }

  startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide.update(idx => (idx + 1) % this.slides.length);
  }

  prevSlide(): void {
    this.currentSlide.update(idx => (idx - 1 + this.slides.length) % this.slides.length);
  }

  setSlide(index: number): void {
    this.currentSlide.set(index);
    // Reset interval when user manually clicks to avoid immediate jump
    this.stopCarousel();
    this.startCarousel();
  }

  private updateOperatingStatus(): void {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    let openMinutes = 0;
    let closeMinutes = 0;
    let isWeekend = false;

    if (day === 0 || day === 6) {
      // Sat-Sun: 8:00 AM - 3:00 PM
      openMinutes = 8 * 60; // 480
      closeMinutes = 15 * 60; // 900
      isWeekend = true;
    } else {
      // Mon-Fri: 7:00 AM - 4:00 PM
      openMinutes = 7 * 60; // 420
      closeMinutes = 16 * 60; // 960
      isWeekend = false;
    }

    const openNow = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    this.isOpen.set(openNow);

    if (openNow) {
      this.statusText.set('Open Now');
      const closingHour = Math.floor(closeMinutes / 60);
      const formattedClosing = closingHour > 12 ? `${closingHour - 12}:00 PM` : `${closingHour}:00 AM`;
      this.scheduleDetails.set(`We close at ${formattedClosing} today`);
    } else {
      this.statusText.set('Closed Now');
      
      // Calculate next open details
      if (day === 5 && currentMinutes >= closeMinutes) {
        // Friday after close -> next is Saturday at 8:00 AM
        this.scheduleDetails.set('Opens Saturday at 8:00 AM');
      } else if (day === 6 && currentMinutes >= closeMinutes) {
        // Saturday after close -> next is Sunday at 8:00 AM
        this.scheduleDetails.set('Opens Sunday at 8:00 AM');
      } else if (day === 0 && currentMinutes >= closeMinutes) {
        // Sunday after close -> next is Monday at 7:00 AM
        this.scheduleDetails.set('Opens Monday at 7:00 AM');
      } else if (currentMinutes < openMinutes) {
        // Before opening today
        const openHourText = isWeekend ? '8:00 AM' : '7:00 AM';
        this.scheduleDetails.set(`Opens today at ${openHourText}`);
      } else {
        // After close today (Mon-Thu) -> next is tomorrow at 7:00 AM
        this.scheduleDetails.set('Opens tomorrow at 7:00 AM');
      }
    }
  }
}
