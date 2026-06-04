import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  isVegan: boolean;
  isGF: boolean;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuCmsService {
  private readonly fallbackMenu: MenuItem[] = [
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
  ];

  constructor(private http: HttpClient) {}

  getMenu(): Observable<MenuItem[]> {
    const sheetId = environment.googleSheetId;
    if (!sheetId) {
      console.warn('Google Sheet ID not configured. Falling back to local static menu data.');
      return of(this.fallbackMenu);
    }

    let csvUrl = '';
    if (sheetId.startsWith('http://') || sheetId.startsWith('https://')) {
      csvUrl = sheetId;
    } else if (sheetId.startsWith('2PACX-')) {
      csvUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;
    } else {
      csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    }

    return this.http.get(csvUrl, { responseType: 'text' }).pipe(
      map(csvText => {
        try {
          const items = this.parseCSV(csvText);
          if (items.length === 0) {
            throw new Error('Parsed CSV resulted in 0 menu items.');
          }
          return items;
        } catch (e) {
          console.error('Error parsing CSV, falling back to static menu:', e);
          return this.fallbackMenu;
        }
      }),
      catchError(err => {
        console.warn('Failed to fetch menu from Google Sheets, falling back to static menu data:', err);
        return of(this.fallbackMenu);
      })
    );
  }

  getFallbackMenu(): MenuItem[] {
    return this.fallbackMenu;
  }

  private parseCSV(csvText: string): MenuItem[] {
    const lines = csvText.split(/\r?\n/);
    if (lines.length <= 1) return [];

    // Parse header to map columns
    const headers = this.splitCSVLine(lines[0]).map(h => h.trim().toLowerCase());

    const items: MenuItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.splitCSVLine(line);
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] !== undefined ? values[index].trim() : '';
      });

      // Map to MenuItem structure
      if (row.name) {
        items.push({
          name: row.name,
          description: row.description || '',
          price: parseFloat(row.price.replace(/[^\d.-]/g, '')) || 0, // strip '$' or currency symbols
          category: this.mapCategory(row.category),
          isVegan: this.parseBoolean(row.isvegan),
          isGF: this.parseBoolean(row.isgf),
          image: row.image || ''
        });
      }
    }

    return items;
  }

  private splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.replace(/^"|"$/g, '').replace(/""/g, '"'));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.replace(/^"|"$/g, '').replace(/""/g, '"'));
    return result;
  }

  private mapCategory(val: string): string {
    const cleanVal = (val || '').trim();
    if (!cleanVal) return 'General';
    // Normalize casing (e.g. 'breakfast' -> 'Breakfast', 'DRINKS' -> 'Drinks')
    return cleanVal.charAt(0).toUpperCase() + cleanVal.slice(1).toLowerCase();
  }

  private parseBoolean(val: string): boolean {
    const cleanVal = (val || '').trim().toLowerCase();
    return ['true', 'yes', '1', 'y', 've', 'gf', 'vegan', 'gluten-free'].includes(cleanVal);
  }
}
