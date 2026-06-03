import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SchemaService {
  private readonly scriptId = 'localbusiness-schema';

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Injects the LocalBusiness structured data (JSON-LD) into the document head.
   */
  injectSchema(): void {
    // Remove any existing script tag to prevent duplicates
    this.removeSchema();

    // Create the schema object
    const schema = {
      '@context': 'https://schema.org',
      '@type': ['Restaurant', 'Cafe'],
      '@id': 'https://thenortherngrid.com.au',
      'name': 'The Northern Grid Cafe',
      'url': 'https://thenortherngrid.com.au',
      'logo': 'https://thenortherngrid.com.au/assets/images/logo.png',
      'image': [
        'https://thenortherngrid.com.au/assets/images/hero-bg.webp',
        'https://thenortherngrid.com.au/assets/images/cafe-interior.webp'
      ],
      'description': 'Premium specialty coffee, artisan breakfast, and lunch serving Bundoora, Thomastown and the northern suburbs of Melbourne.',
      'telephone': '+61394671234',
      'priceRange': '$$',
      'servesCuisine': 'Australian, Cafe, Specialty Coffee, Breakfast, Lunch',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '1047 Plenty Road',
        'addressLocality': 'Bundoora',
        'addressRegion': 'VIC',
        'postalCode': '3083',
        'addressCountry': 'AU'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': -37.7011,
        'longitude': 145.0645
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday'
          ],
          'opens': '07:00',
          'closes': '16:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Saturday',
            'Sunday'
          ],
          'opens': '08:00',
          'closes': '15:00'
        }
      ],
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+61394671234',
        'contactType': 'reservations',
        'areaServed': 'AU',
        'availableLanguage': 'en'
      },
      'sameAs': [
        'https://www.facebook.com/thenortherngridcafe',
        'https://www.instagram.com/thenortherngridcafe'
      ]
    };

    // Create script element
    const script = this.document.createElement('script');
    script.id = this.scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);

    // Append script to head
    this.document.head.appendChild(script);
  }

  /**
   * Removes the LocalBusiness schema script from the head.
   */
  removeSchema(): void {
    const existingScript = this.document.getElementById(this.scriptId);
    if (existingScript) {
      existingScript.remove();
    }
  }
}
