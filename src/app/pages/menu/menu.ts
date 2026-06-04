import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemaService } from '../../services/schema.service';

interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: 'Breakfast' | 'Lunch' | 'Drinks';
  isVegan: boolean;
  isGF: boolean; // Gluten-Free
  image: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  activeFilter = signal<'all' | 'vegan' | 'gf'>('all');

  menuItems = signal<MenuItem[]>([
    // Breakfast items
    {
      name: 'Acai Power Bowl',
      description: 'Organic pure acai blended with banana and coconut water, topped with gluten-free almond granola, fresh seasonal berries, toasted coconut flakes, and chia seeds.',
      price: 17.50,
      category: 'Breakfast',
      isVegan: true,
      isGF: true,
      image: 'assets/images/acai-bowl.png'
    },
    {
      name: 'Wild Mushroom Sourdough',
      description: 'Sautéed forest mushrooms, thyme, truffle oil, whipped vegan ricotta, and wilted spinach served on artisanal sourdough toast.',
      price: 19.50,
      category: 'Breakfast',
      isVegan: true,
      isGF: false,
      image: 'assets/images/mushroom-sourdough.png'
    },
    {
      name: 'Chilli Folded Eggs',
      description: 'Free-range eggs folded with fresh chilli, spring onion, coriander, and parmesan cheese, served on toasted croissant with house chilli crisp.',
      price: 18.50,
      category: 'Breakfast',
      isVegan: false,
      isGF: false,
      image: 'assets/images/chilli-eggs.png'
    },
    {
      name: 'Avocado Toast & Goat Feta',
      description: 'Crushed Hass avocado, marinated Persian goat feta, heirloom cherry tomatoes, toasted pepitas, and micro basil on dark rye bread. Gluten-free bread option available.',
      price: 19.00,
      category: 'Breakfast',
      isVegan: false,
      isGF: true,
      image: 'assets/images/avocado-toast.png'
    },
    
    // Lunch items
    {
      name: 'The Grid Wagyu Burger',
      description: '200g premium wagyu beef patty, double melted cheddar, caramelized onions, butter lettuce, house-made dill burger sauce on a toasted brioche bun, served with rosemary fries.',
      price: 23.50,
      category: 'Lunch',
      isVegan: false,
      isGF: false,
      image: 'assets/images/wagyu-burger.png'
    },
    {
      name: 'Middle Eastern Falafel Bowl',
      description: 'Crispy house-made herb falafels, warm tri-color quinoa, spiced roasted sweet potato, shredded kale, house beetroot hummus, cucumber salad, lemon tahini dressing.',
      price: 21.00,
      category: 'Lunch',
      isVegan: true,
      isGF: true,
      image: 'assets/images/falafel-bowl.png'
    },
    {
      name: 'Crispy Barramundi Tacos',
      description: 'Three soft corn tortillas filled with crispy local barramundi, purple cabbage and lime slaw, pickled jalapenos, chipotle crema, and fresh coriander.',
      price: 22.00,
      category: 'Lunch',
      isVegan: false,
      isGF: true,
      image: 'assets/images/barramundi-tacos.png'
    },
    {
      name: 'Slow Cooked Lamb Salad',
      description: '12-hour slow-braised Victorian lamb shoulder, wild rocket, fresh mint, cucumber, Danish feta, pomegranate rubies, toasted slivered almonds, dressed in pomegranate vinaigrette.',
      price: 24.50,
      category: 'Lunch',
      isVegan: false,
      isGF: true,
      image: 'assets/images/lamb-salad.png'
    },

    // Drinks items
    {
      name: 'Espresso / Short Black',
      description: 'Double shot of our rotating seasonal single-origin espresso. Clean, bright, and fruity notes.',
      price: 4.50,
      category: 'Drinks',
      isVegan: true,
      isGF: true,
      image: 'assets/images/espresso.png'
    },
    {
      name: 'Flat White / Latte',
      description: 'Our house signature espresso blend extracted smoothly, served with silky texturized milk.',
      price: 4.80,
      category: 'Drinks',
      isVegan: true,
      isGF: true,
      image: 'assets/images/flat-white.png'
    },
    {
      name: 'Pour Over Filter (V60)',
      description: 'Slow-brewed single estate coffee bean prepared via V60 filter, showcasing delicate tasting notes.',
      price: 6.50,
      category: 'Drinks',
      isVegan: true,
      isGF: true,
      image: 'assets/images/pour-over.png'
    },
    {
      name: 'Uji Matcha Latte',
      description: 'Ceremonial grade green tea matcha whisked with organic agave syrup, served over steamed creamy oat milk.',
      price: 6.00,
      category: 'Drinks',
      isVegan: true,
      isGF: true,
      image: 'assets/images/matcha-latte.png'
    }
  ]);

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

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    // Injects LocalBusiness schema to head
    this.schemaService.injectSchema();
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
