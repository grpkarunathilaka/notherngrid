import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemaService } from '../../services/schema.service';
import { MenuCmsService, MenuItem } from '../../services/menu-cms.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  activeFilter = signal<'all' | 'vegan' | 'gf'>('all');
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  menuItems = signal<MenuItem[]>([]);

  // Reactive computed filter list
  filteredItems = computed(() => {
    const filter = this.activeFilter();
    const items = this.menuItems();

    if (filter === 'vegan') {
      return items.filter(item => item.isVegan);
    } else if (filter === 'gf') {
      return items.filter(item => item.isGF);
    }
    return items;
  });

  // Unique categories for anchor navigation helper
  categories: ('Breakfast' | 'Lunch' | 'Drinks')[] = ['Breakfast', 'Lunch', 'Drinks'];

  constructor(
    private schemaService: SchemaService,
    private menuCmsService: MenuCmsService
  ) {}

  ngOnInit(): void {
    // Injects LocalBusiness schema to head
    this.schemaService.injectSchema();

    // Fetch dynamic menu data from Google Sheets CMS
    this.menuCmsService.getMenu().subscribe({
      next: (items) => {
        this.menuItems.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load menu data from CMS:', err);
        this.errorMessage.set('Displaying offline menu.');
        this.menuItems.set(this.menuCmsService.getFallbackMenu());
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: 'all' | 'vegan' | 'gf'): void {
    this.activeFilter.set(filter);
  }

  getItemsByCategory(category: string): MenuItem[] {
    return this.filteredItems().filter(item => item.category === category);
  }

  hasItemsForCategory(category: string): boolean {
    return this.getItemsByCategory(category).length > 0;
  }

  scrollToSection(id: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 130; // Offset for the header and sticky controls
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
